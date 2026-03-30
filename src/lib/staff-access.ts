import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { staffMemberships, tenants, users } from "@/db/schema";
import { sendEmail } from "@/lib/send-email";
import { isOrgRole, type OrgRole } from "@/lib/org-roles";
import {
  createId,
  isValidEmail,
  normalizeEmail,
  randomHexToken,
} from "@/lib/auth-utils";

type InviteStaffMemberInput = {
  tenantId: string;
  invitedByUserId: string;
  email: string;
  role: OrgRole;
  baseUrl: string;
};

export async function listTenantStaffMembers(
  tenantId: string,
  currentUserId: string,
) {
  const rows = await db
    .select({
      id: staffMemberships.id,
      userId: staffMemberships.userId,
      name: staffMemberships.name,
      email: staffMemberships.email,
      role: staffMemberships.role,
      status: staffMemberships.status,
      acceptedAt: staffMemberships.acceptedAt,
      inviteExpiresAt: staffMemberships.inviteExpiresAt,
      createdAt: staffMemberships.createdAt,
      fullName: users.fullName,
      userEmail: users.email,
    })
    .from(staffMemberships)
    .innerJoin(users, eq(staffMemberships.userId, users.id))
    .where(eq(staffMemberships.tenantId, tenantId))
    .orderBy(asc(staffMemberships.status), asc(staffMemberships.createdAt));

  return rows.map((row) => ({
    id: row.id,
    userId: row.userId,
    name: row.name ?? row.fullName ?? row.userEmail ?? "Unknown user",
    email: row.email ?? row.userEmail ?? "",
    role: isOrgRole(row.role) ? row.role : "org:staff",
    status: row.status,
    acceptedAt: row.acceptedAt?.toISOString() ?? null,
    inviteExpiresAt: row.inviteExpiresAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    isCurrentUser: row.userId === currentUserId,
  }));
}

export async function inviteStaffMember(input: InviteStaffMemberInput) {
  const email = normalizeEmail(input.email);

  if (!isValidEmail(email)) {
    throw new Error("Enter a valid email address");
  }

  if (!isOrgRole(input.role)) {
    throw new Error("Choose a valid staff role");
  }

  let [user] = await db
    .select({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
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
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
  }

  if (!user) {
    throw new Error("Failed to prepare the invited user");
  }

  const [existingMembership] = await db
    .select({
      id: staffMemberships.id,
      status: staffMemberships.status,
    })
    .from(staffMemberships)
    .where(
      and(
        eq(staffMemberships.tenantId, input.tenantId),
        eq(staffMemberships.userId, user.id),
      ),
    )
    .limit(1);

  if (existingMembership?.status === "active") {
    throw new Error("That teammate already has access");
  }

  const inviteToken = randomHexToken();
  const inviteExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  if (existingMembership) {
    await db
      .update(staffMemberships)
      .set({
        role: input.role,
        email,
        name: user.fullName ?? email,
        status: "invited",
        invitedByUserId: input.invitedByUserId,
        inviteToken,
        inviteExpiresAt,
        acceptedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(staffMemberships.id, existingMembership.id));
  } else {
    await db.insert(staffMemberships).values({
      id: createId("membership"),
      tenantId: input.tenantId,
      userId: user.id,
      role: input.role,
      email,
      name: user.fullName ?? email,
      status: "invited",
      invitedByUserId: input.invitedByUserId,
      inviteToken,
      inviteExpiresAt,
    });
  }

  const [inviter] = await db
    .select({
      fullName: users.fullName,
      email: users.email,
    })
    .from(users)
    .where(eq(users.id, input.invitedByUserId))
    .limit(1);

  await sendEmail({
    type: "staff-invite",
    data: {
      email,
      invitedByName: inviter?.fullName ?? inviter?.email ?? "GYM OS",
      inviteUrl: `${new URL("/accept-invite", input.baseUrl).toString()}?token=${inviteToken}`,
      role: input.role,
    },
  });
}

export async function updateStaffRole(input: {
  tenantId: string;
  membershipId: string;
  actingUserId: string;
  role: OrgRole;
}) {
  if (!isOrgRole(input.role)) {
    throw new Error("Choose a valid staff role");
  }

  const [membership] = await db
    .select({
      id: staffMemberships.id,
      userId: staffMemberships.userId,
      role: staffMemberships.role,
    })
    .from(staffMemberships)
    .where(
      and(
        eq(staffMemberships.id, input.membershipId),
        eq(staffMemberships.tenantId, input.tenantId),
      ),
    )
    .limit(1);

  if (!membership) {
    throw new Error("Staff member not found");
  }

  if (membership.userId === input.actingUserId && input.role !== "org:admin") {
    throw new Error("You can't remove your own admin access");
  }

  await db
    .update(staffMemberships)
    .set({
      role: input.role,
      updatedAt: new Date(),
    })
    .where(eq(staffMemberships.id, input.membershipId));
}

export async function revokeStaffMembership(input: {
  tenantId: string;
  membershipId: string;
  actingUserId: string;
}) {
  const [membership] = await db
    .select({
      id: staffMemberships.id,
      userId: staffMemberships.userId,
    })
    .from(staffMemberships)
    .where(
      and(
        eq(staffMemberships.id, input.membershipId),
        eq(staffMemberships.tenantId, input.tenantId),
      ),
    )
    .limit(1);

  if (!membership) {
    throw new Error("Staff member not found");
  }

  if (membership.userId === input.actingUserId) {
    throw new Error("You can't remove yourself from this gym");
  }

  await db
    .update(staffMemberships)
    .set({
      status: "revoked",
      inviteToken: null,
      inviteExpiresAt: null,
      updatedAt: new Date(),
    })
    .where(eq(staffMemberships.id, input.membershipId));
}

export async function getTenantName(tenantId: string) {
  const [tenant] = await db
    .select({ name: tenants.name })
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);

  return tenant?.name ?? null;
}
