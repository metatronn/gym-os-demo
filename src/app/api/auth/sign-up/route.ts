import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { emailVerifications, users } from "@/db/schema";
import {
  jsonError,
  jsonWithSession,
  validateJsonMutation,
} from "@/lib/auth-api";
import { recordAuthActivity } from "@/lib/auth-store";
import {
  createId,
  isValidEmail,
  isValidPassword,
  normalizeEmail,
  randomHexToken,
  splitFullName,
} from "@/lib/auth-utils";
import { sendEmail } from "@/lib/send-email";

type SignUpBody = {
  email?: string;
  password?: string;
  name?: string;
};

export async function POST(request: Request) {
  const validationError = validateJsonMutation(request);

  if (validationError) {
    return validationError;
  }

  const body = (await request.json()) as SignUpBody;
  const email = normalizeEmail(body.email ?? "");
  const password = body.password ?? "";
  const name = body.name?.trim() ?? "";

  if (!name) {
    return jsonError(400, "Name is required");
  }

  if (!isValidEmail(email)) {
    return jsonError(400, "Enter a valid email address");
  }

  if (!isValidPassword(password)) {
    return jsonError(400, "Password must be at least 8 characters");
  }

  const [existingUser] = await db
    .select({
      id: users.id,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser) {
    return jsonError(
      409,
      existingUser.passwordHash
        ? "An account with that email already exists"
        : "You already have a pending invite. Use the invite email to finish setup.",
    );
  }

  const passwordHash = await hash(password, 12);
  const userId = createId("user");
  const verificationToken = randomHexToken();
  const nameParts = splitFullName(name);

  await db.insert(users).values({
    id: userId,
    email,
    passwordHash,
    firstName: nameParts.firstName,
    lastName: nameParts.lastName,
    fullName: nameParts.fullName,
  });

  await db.insert(emailVerifications).values({
    id: createId("verify"),
    userId,
    token: verificationToken,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  await sendEmail({
    type: "verify-email",
    data: {
      email,
      name,
      verifyUrl: `${new URL("/api/auth/verify-email", request.url).toString()}?token=${verificationToken}`,
    },
  });

  await recordAuthActivity({
    userId,
    tenantId: null,
    type: "sign-up",
    description: "Created a new account",
    request,
  });

  return jsonWithSession(
    request,
    {
      ok: true,
      redirectTo: "/onboarding",
    },
    {
      userId,
      tenantId: null,
      role: null,
      tokenVersion: 0,
    },
    201,
  );
}
