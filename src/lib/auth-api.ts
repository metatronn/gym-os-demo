import { NextResponse } from "next/server";
import { clearSessionCookie, setSessionCookie } from "@/lib/auth-session";
import { issueAuthSession } from "@/lib/auth-store";
import { hasAllowedOrigin, isJsonRequest } from "@/lib/auth-utils";

export function jsonError(
  status: number,
  error: string,
  extra?: Record<string, unknown>,
) {
  return NextResponse.json(
    {
      error,
      ...extra,
    },
    { status },
  );
}

export function validateJsonMutation(request: Request) {
  if (!hasAllowedOrigin(request)) {
    return jsonError(403, "Invalid request origin");
  }

  if (!isJsonRequest(request)) {
    return jsonError(415, "Expected an application/json request");
  }

  return null;
}

export async function jsonWithSession(
  request: Request,
  body: Record<string, unknown>,
  session: {
    userId: string;
    tenantId?: string | null;
    role?: string | null;
    tokenVersion: number;
  },
  status = 200,
  options?: {
    reuseCurrentSession?: boolean;
  },
) {
  const response = NextResponse.json(body, { status });
  const { token } = await issueAuthSession({
    ...session,
    request,
    reuseCurrentSession: options?.reuseCurrentSession,
  });
  setSessionCookie(response, token);
  return response;
}

export function jsonSignedOut(
  body: Record<string, unknown> = { ok: true, redirectTo: "/sign-in" },
) {
  const response = NextResponse.json(body);
  clearSessionCookie(response);
  return response;
}
