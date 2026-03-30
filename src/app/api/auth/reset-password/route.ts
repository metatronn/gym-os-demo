import { hash } from "bcryptjs";
import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { passwordResets, users } from "@/db/schema";
import { clearSessionCookie } from "@/lib/auth-session";
import { jsonError, validateJsonMutation } from "@/lib/auth-api";
import { recordAuthActivity, revokeOtherAuthSessions } from "@/lib/auth-store";
import { isValidPassword } from "@/lib/auth-utils";

type ResetPasswordBody = {
  token?: string;
  password?: string;
};

export async function POST(request: Request) {
  const validationError = validateJsonMutation(request);

  if (validationError) {
    return validationError;
  }

  const body = (await request.json()) as ResetPasswordBody;
  const token = body.token?.trim() ?? "";
  const password = body.password ?? "";

  if (!token) {
    return jsonError(400, "Reset token is required");
  }

  if (!isValidPassword(password)) {
    return jsonError(400, "Password must be at least 8 characters");
  }

  const [resetRecord] = await db
    .select({
      id: passwordResets.id,
      userId: passwordResets.userId,
    })
    .from(passwordResets)
    .where(
      and(
        eq(passwordResets.token, token),
        isNull(passwordResets.usedAt),
        gt(passwordResets.expiresAt, new Date()),
      ),
    )
    .limit(1);

  if (!resetRecord) {
    return jsonError(400, "This reset link is invalid or has expired");
  }

  const passwordHash = await hash(password, 12);
  const now = new Date();

  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({
        passwordHash,
        emailVerifiedAt: now,
        tokenVersion: sql`${users.tokenVersion} + 1`,
        updatedAt: now,
      })
      .where(eq(users.id, resetRecord.userId));

    await tx
      .update(passwordResets)
      .set({ usedAt: now })
      .where(
        and(
          eq(passwordResets.userId, resetRecord.userId),
          isNull(passwordResets.usedAt),
        ),
      );
  });

  const response = NextResponse.json({
    ok: true,
    redirectTo: "/sign-in",
  });
  await revokeOtherAuthSessions(resetRecord.userId, null);
  await recordAuthActivity({
    userId: resetRecord.userId,
    tenantId: null,
    type: "password-reset",
    description: "Reset account password",
    request,
  });
  clearSessionCookie(response);
  return response;
}
