import { and, eq, gt } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { emailVerifications, users } from "@/db/schema";
import { jsonError, validateJsonMutation } from "@/lib/auth-api";

async function consumeVerificationToken(token: string) {
  const [verification] = await db
    .select({
      id: emailVerifications.id,
      userId: emailVerifications.userId,
    })
    .from(emailVerifications)
    .where(
      and(
        eq(emailVerifications.token, token),
        gt(emailVerifications.expiresAt, new Date()),
      ),
    )
    .limit(1);

  if (!verification) {
    return false;
  }

  const now = new Date();

  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({
        emailVerifiedAt: now,
        updatedAt: now,
      })
      .where(eq(users.id, verification.userId));

    await tx
      .delete(emailVerifications)
      .where(eq(emailVerifications.userId, verification.userId));
  });

  return true;
}

export async function POST(request: Request) {
  const validationError = validateJsonMutation(request);

  if (validationError) {
    return validationError;
  }

  const body = (await request.json()) as { token?: string };
  const token = body.token?.trim() ?? "";

  if (!token) {
    return jsonError(400, "Verification token is required");
  }

  const ok = await consumeVerificationToken(token);

  if (!ok) {
    return jsonError(400, "This verification link is invalid or has expired");
  }

  return Response.json({ ok: true });
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token")?.trim() ?? "";

  if (token) {
    await consumeVerificationToken(token);
  }

  return NextResponse.redirect(new URL("/sign-in?verified=1", request.url));
}
