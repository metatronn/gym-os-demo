import { eq } from "drizzle-orm";
import { db } from "@/db";
import { passwordResets, users } from "@/db/schema";
import { jsonError, validateJsonMutation } from "@/lib/auth-api";
import {
  createId,
  isValidEmail,
  normalizeEmail,
  randomHexToken,
} from "@/lib/auth-utils";
import { consumeRateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/send-email";

type ForgotPasswordBody = {
  email?: string;
};

export async function POST(request: Request) {
  const validationError = validateJsonMutation(request);

  if (validationError) {
    return validationError;
  }

  const body = (await request.json()) as ForgotPasswordBody;
  const email = normalizeEmail(body.email ?? "");

  if (!isValidEmail(email)) {
    return jsonError(400, "Enter a valid email address");
  }

  const rateLimit = await consumeRateLimit(`forgot-password:${email}`, {
    limit: 3,
    windowMs: 60 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return jsonError(
      429,
      "Too many reset requests. Please wait before trying again.",
    );
  }

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (user) {
    const resetToken = randomHexToken();

    await db.insert(passwordResets).values({
      id: createId("reset"),
      userId: user.id,
      token: resetToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    await sendEmail({
      type: "password-reset",
      data: {
        email: user.email,
        name: user.fullName ?? user.email,
        resetUrl: `${new URL("/reset-password", request.url).toString()}?token=${resetToken}`,
      },
    });
  }

  return Response.json({ ok: true });
}
