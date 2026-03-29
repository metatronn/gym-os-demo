import { NextResponse } from "next/server";
import {
  clearSessionCookie,
  createSessionToken,
  setSessionCookie,
} from "@/lib/auth-session";
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
  body: Record<string, unknown>,
  session: {
    userId: string;
    tenantId?: string | null;
    role?: string | null;
    tokenVersion: number;
  },
  status = 200,
) {
  const response = NextResponse.json(body, { status });
  const token = await createSessionToken(session);
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
