import { hash } from "bcryptjs";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { staffMemberships, tenants, users } from "@/db/schema";
import {
  jsonError,
  jsonWithSession,
  validateJsonMutation,
} from "@/lib/auth-api";
import { isValidPassword, splitFullName } from "@/lib/auth-utils";

type AcceptInviteBody = {
  token?: string;
  password?: string;
  name?: string;
};

export async function POST(request: Request) {
  const validationError = validateJsonMutation(request);

  if (validationError) {
    return validationError;
  }

  const body = (await request.json()) as AcceptInviteBody;
  const token = body.token?.trim() ?? "";
  const password = body.password ?? "";
  const name = body.name?.trim() ?? "";

  if (!token) {
    return jsonError(400, "Invite token is required");
  }

  const [invite] = await db
    .select({
      membershipId: staffMemberships.id,
      tenantId: staffMemberships.tenantId,
      role: staffMemberships.role,
      inviteExpiresAt: staffMemberships.inviteExpiresAt,
      userId: users.id,
      email: users.email,
      fullName: users.fullName,
      passwordHash: users.passwordHash,
      tokenVersion: users.tokenVersion,
      tenantName: tenants.name,
    })
    .from(staffMemberships)
    .innerJoin(users, eq(staffMemberships.userId, users.id))
    .innerJoin(tenants, eq(staffMemberships.tenantId, tenants.id))
    .where(
      and(
        eq(staffMemberships.inviteToken, token),
        eq(staffMemberships.status, "invited"),
        gt(staffMemberships.inviteExpiresAt, new Date()),
      ),
    )
    .limit(1);

  if (!invite) {
    return jsonError(400, "This invite is invalid or has expired");
  }

  if (!invite.passwordHash && !isValidPassword(password)) {
    return jsonError(409, "Set a password to accept this invite", {
      requiresPassword: true,
      email: invite.email,
      tenantName: invite.tenantName,
    });
  }

  const now = new Date();
  const nameParts = name ? splitFullName(name) : null;

  await db.transaction(async (tx) => {
    if (!invite.passwordHash) {
      await tx
        .update(users)
        .set({
          passwordHash: await hash(password, 12),
          emailVerifiedAt: now,
          firstName: nameParts?.firstName ?? invite.fullName ?? invite.email,
          lastName: nameParts?.lastName ?? null,
          fullName: nameParts?.fullName ?? invite.fullName ?? invite.email,
          updatedAt: now,
        })
        .where(eq(users.id, invite.userId));
    }

    await tx
      .update(staffMemberships)
      .set({
        status: "active",
        inviteToken: null,
        inviteExpiresAt: null,
        acceptedAt: now,
        updatedAt: now,
      })
      .where(eq(staffMemberships.id, invite.membershipId));
  });

  return jsonWithSession(
    {
      ok: true,
      redirectTo: "/dashboard",
    },
    {
      userId: invite.userId,
      tenantId: invite.tenantId,
      role: invite.role,
      tokenVersion: invite.tokenVersion,
    },
  );
}
