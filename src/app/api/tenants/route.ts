import { eq } from "drizzle-orm";
import { db } from "@/db";
import { staffMemberships, tenants, users } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import {
  jsonError,
  jsonWithSession,
  validateJsonMutation,
} from "@/lib/auth-api";
import { recordAuthActivity } from "@/lib/auth-store";
import { inngest } from "@/lib/inngest";
import { createId, slugify } from "@/lib/auth-utils";

type CreateTenantBody = {
  name?: string;
  slug?: string;
  location?: string;
};

export async function POST(request: Request) {
  const auth = await requireAuth({ requireOrg: false });
  const validationError = validateJsonMutation(request);

  if (validationError) {
    return validationError;
  }

  const body = (await request.json()) as CreateTenantBody;
  const name = body.name?.trim() ?? "";
  const location = body.location?.trim() ?? "";
  const desiredSlug = slugify(body.slug?.trim() || name);

  if (!name) {
    return jsonError(400, "Gym name is required");
  }

  if (!desiredSlug) {
    return jsonError(400, "Choose a valid slug");
  }

  const [existingTenant] = await db
    .select({ id: tenants.id })
    .from(tenants)
    .where(eq(tenants.slug, desiredSlug))
    .limit(1);

  if (existingTenant) {
    return jsonError(409, "That gym slug is already taken");
  }

  const [user] = await db
    .select({
      email: users.email,
      fullName: users.fullName,
    })
    .from(users)
    .where(eq(users.id, auth.userId))
    .limit(1);

  if (!user) {
    return jsonError(404, "User not found");
  }

  const tenantId = createId("org");
  const now = new Date();

  await db.insert(tenants).values({
    id: tenantId,
    name,
    slug: desiredSlug,
    subscriptionStatus: "trialing",
    trialEndsAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
    settings: location ? { location } : {},
  });

  await db.insert(staffMemberships).values({
    id: createId("membership"),
    tenantId,
    userId: auth.userId,
    role: "org:admin",
    email: user.email,
    name: user.fullName ?? user.email,
    status: "active",
    acceptedAt: now,
  });

  try {
    await inngest.send({
      name: "tenant/created",
      data: {
        tenantId,
        ownerEmail: user.email,
        gymName: name,
      },
    });
  } catch (error) {
    console.error("Failed to send tenant/created event", error);
  }

  await recordAuthActivity({
    userId: auth.userId,
    tenantId,
    type: "tenant-created",
    description: `Created tenant ${name}`,
    request,
  });

  return jsonWithSession(
    request,
    {
      ok: true,
      redirectTo: "/dashboard",
      tenant: {
        id: tenantId,
        name,
        slug: desiredSlug,
      },
    },
    {
      userId: auth.userId,
      tenantId,
      role: "org:admin",
      tokenVersion: auth.tokenVersion,
    },
    201,
    { reuseCurrentSession: true },
  );
}
