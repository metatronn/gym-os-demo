import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { staffMemberships, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { jsonError, validateJsonMutation } from "@/lib/auth-api";
import {
  createId,
  isValidEmail,
  normalizeEmail,
  randomHexToken,
} from "@/lib/auth-utils";
import { sendEmail } from "@/lib/send-email";

type InviteBody = {
  email?: string;
  role?: string;
};

const ALLOWED_ROLES = new Set(["org:admin", "org:staff"]);

export async function POST(
  request: Request,
  context: { params: { id: string } },
) {
  const auth = await requireAdmin();
  const validationError = validateJsonMutation(request);

  if (validationError) {
    return validationError;
  }

  if (auth.orgId !== context.params.id) {
    return jsonError(403, "Invite requests must target your active gym");
  }

  const body = (await request.json()) as InviteBody;
  const email = normalizeEmail(body.email ?? "");
  const role = body.role?.trim() ?? "org:staff";

  if (!isValidEmail(email)) {
    return jsonError(400, "Enter a valid email address");
  }

  if (!ALLOWED_ROLES.has(role)) {
    return jsonError(400, "Choose a valid staff role");
  }

  let [user] = await db
    .select({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    const userId = createId("user");

    await db.insert(users).values({
      id: userId,
      email,
      fullName: email,
      firstName: email.split("@")[0] ?? email,
    });

    [user] = await db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
  }

  if (!user) {
    return jsonError(500, "Failed to prepare the invited user");
  }

  const [existingMembership] = await db
    .select({
      id: staffMemberships.id,
      status: staffMemberships.status,
    })
    .from(staffMemberships)
    .where(
      and(
        eq(staffMemberships.tenantId, auth.orgId),
        eq(staffMemberships.userId, user.id),
      ),
    )
    .limit(1);

  if (existingMembership?.status === "active") {
    return jsonError(409, "That teammate already has access");
  }

  const inviteToken = randomHexToken();
  const inviteExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  if (existingMembership) {
    await db
      .update(staffMemberships)
      .set({
        role,
        email,
        name: user.fullName ?? email,
        status: "invited",
        invitedByUserId: auth.userId,
        inviteToken,
        inviteExpiresAt,
        acceptedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(staffMemberships.id, existingMembership.id));
  } else {
    await db.insert(staffMemberships).values({
      id: createId("membership"),
      tenantId: auth.orgId,
      userId: user.id,
      role,
      email,
      name: user.fullName ?? email,
      status: "invited",
      invitedByUserId: auth.userId,
      inviteToken,
      inviteExpiresAt,
    });
  }

  await sendEmail({
    type: "staff-invite",
    data: {
      email,
      invitedByName: "GYM OS",
      inviteUrl: `${new URL("/accept-invite", request.url).toString()}?token=${inviteToken}`,
      role,
    },
  });

  return Response.json({ ok: true });
}
