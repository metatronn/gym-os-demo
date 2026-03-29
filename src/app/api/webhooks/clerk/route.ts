import { Webhook } from "svix";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { staffMemberships, tenants, users } from "@/db/schema";
import { CLERK_WEBHOOK_SECRET, IS_CLERK_ENABLED } from "@/lib/env";
import { inngest } from "@/lib/inngest";

type ClerkWebhookEvent = {
  type: string;
  data: Record<string, any>;
};

type UserUpsertInput = {
  id: string | null | undefined;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  imageUrl?: string | null;
};

function getUserEmail(data: Record<string, any>) {
  return (
    data.email_addresses?.[0]?.email_address ??
    data.public_user_data?.identifier ??
    null
  );
}

function getUserName(data: Record<string, any>) {
  const fullName = [data.first_name, data.last_name].filter(Boolean).join(" ");
  return fullName || data.username || data.name || null;
}

function buildTrialEndDate() {
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 14);
  return trialEndsAt;
}

async function upsertUserRecord(data: UserUpsertInput) {
  if (!data.id) {
    return;
  }

  await db
    .insert(users)
    .values({
      id: data.id,
      email: data.email ?? null,
      firstName: data.firstName ?? null,
      lastName: data.lastName ?? null,
      fullName: data.fullName ?? null,
      imageUrl: data.imageUrl ?? null,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email: data.email ?? null,
        firstName: data.firstName ?? null,
        lastName: data.lastName ?? null,
        fullName: data.fullName ?? null,
        imageUrl: data.imageUrl ?? null,
        updatedAt: new Date(),
      },
    });
}

async function upsertTenantFromOrganization(data: Record<string, any>) {
  await db
    .insert(tenants)
    .values({
      id: data.id,
      name: data.name,
      slug: data.slug ?? null,
      subscriptionStatus: "trialing",
      trialEndsAt: buildTrialEndDate(),
    })
    .onConflictDoUpdate({
      target: tenants.id,
      set: {
        name: data.name,
        slug: data.slug ?? null,
        updatedAt: new Date(),
      },
    });
}

async function updateTenantFromOrganization(data: Record<string, any>) {
  await db
    .update(tenants)
    .set({
      name: data.name,
      slug: data.slug ?? null,
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, data.id));
}

async function upsertUserFromWebhook(data: Record<string, any>) {
  await upsertUserRecord({
    id: data.id,
    email: getUserEmail(data),
    firstName: data.first_name ?? null,
    lastName: data.last_name ?? null,
    fullName: getUserName(data),
    imageUrl: data.image_url ?? null,
  });
}

async function upsertStaffMembership(data: Record<string, any>) {
  const userId = data.public_user_data?.user_id;
  const tenantId = data.organization?.id;

  if (!userId || !tenantId) {
    return;
  }

  const membershipUserData = data.public_user_data ?? {};

  await upsertUserRecord({
    id: userId,
    email: getUserEmail(data),
    firstName: membershipUserData.first_name ?? null,
    lastName: membershipUserData.last_name ?? null,
    fullName: getUserName(membershipUserData),
    imageUrl: membershipUserData.image_url ?? null,
  });

  await db
    .insert(staffMemberships)
    .values({
      id: data.id,
      tenantId,
      userId,
      role: data.role ?? "org:staff",
      email: getUserEmail(data),
      name: getUserName(membershipUserData),
      status: "active",
    })
    .onConflictDoUpdate({
      target: staffMemberships.id,
      set: {
        role: data.role ?? "org:staff",
        email: getUserEmail(data),
        name: getUserName(membershipUserData),
        status: "active",
        updatedAt: new Date(),
      },
    });
}

async function handleClerkEvent(event: ClerkWebhookEvent) {
  switch (event.type) {
    case "organization.created":
      await upsertTenantFromOrganization(event.data);
      // Fire async welcome email + Slack notification via Inngest
      await inngest.send({
        name: "tenant/created",
        data: {
          tenantId: event.data.id,
          ownerEmail:
            getUserEmail(event.data.created_by_user ?? event.data) ?? "",
          gymName: event.data.name,
        },
      });
      return;

    case "organization.updated":
      await updateTenantFromOrganization(event.data);
      return;

    case "organization.deleted":
      await db.delete(tenants).where(eq(tenants.id, event.data.id));
      return;

    case "user.created":
    case "user.updated":
      await upsertUserFromWebhook(event.data);
      return;

    case "user.deleted":
      if (event.data.id) {
        await db.delete(users).where(eq(users.id, event.data.id));
      }
      return;

    case "organizationMembership.created":
    case "organizationMembership.updated":
      await upsertStaffMembership(event.data);
      return;

    case "organizationMembership.deleted":
      await db
        .delete(staffMemberships)
        .where(eq(staffMemberships.id, event.data.id));
      return;

    default:
      return;
  }
}

export async function POST(request: Request) {
  if (!IS_CLERK_ENABLED || !CLERK_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Clerk webhook secret is not configured." },
      { status: 400 },
    );
  }

  const payload = await request.text();
  const headersList = headers();

  const svixId = headersList.get("svix-id");
  const svixTimestamp = headersList.get("svix-timestamp");
  const svixSignature = headersList.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Missing Svix headers." },
      { status: 400 },
    );
  }

  let event: ClerkWebhookEvent;

  try {
    const webhook = new Webhook(CLERK_WEBHOOK_SECRET);
    event = webhook.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  await handleClerkEvent(event);

  return NextResponse.json({ ok: true });
}
