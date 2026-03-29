import { compare } from "bcryptjs";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { staffMemberships, users } from "@/db/schema";
import {
  jsonError,
  jsonWithSession,
  validateJsonMutation,
} from "@/lib/auth-api";
import { isValidEmail, normalizeEmail } from "@/lib/auth-utils";
import { consumeRateLimit } from "@/lib/rate-limit";

type SignInBody = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  const validationError = validateJsonMutation(request);

  if (validationError) {
    return validationError;
  }

  const body = (await request.json()) as SignInBody;
  const email = normalizeEmail(body.email ?? "");
  const password = body.password ?? "";

  if (!isValidEmail(email) || !password) {
    return jsonError(400, "Enter your email and password");
  }

  const rateLimit = consumeRateLimit(`sign-in:${email}`, {
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return jsonError(429, "Too many sign-in attempts. Try again later.");
  }

  const [user] = await db
    .select({
      id: users.id,
      passwordHash: users.passwordHash,
      tokenVersion: users.tokenVersion,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user?.passwordHash) {
    return jsonError(401, "Invalid email or password");
  }

  const passwordMatches = await compare(password, user.passwordHash);

  if (!passwordMatches) {
    return jsonError(401, "Invalid email or password");
  }

  const [membership] = await db
    .select({
      tenantId: staffMemberships.tenantId,
      role: staffMemberships.role,
    })
    .from(staffMemberships)
    .where(
      and(
        eq(staffMemberships.userId, user.id),
        eq(staffMemberships.status, "active"),
      ),
    )
    .orderBy(asc(staffMemberships.createdAt))
    .limit(1);

  return jsonWithSession(
    {
      ok: true,
      redirectTo: membership ? "/dashboard" : "/onboarding",
    },
    {
      userId: user.id,
      tenantId: membership?.tenantId ?? null,
      role: membership?.role ?? null,
      tokenVersion: user.tokenVersion,
    },
  );
}
