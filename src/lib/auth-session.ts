import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AUTH_SECRET } from "@/lib/env";

export const SESSION_COOKIE_NAME = "__session";
export const AUTH_USER_ID_HEADER = "x-user-id";
export const AUTH_TENANT_ID_HEADER = "x-tenant-id";
export const AUTH_ROLE_HEADER = "x-org-role";
export const AUTH_TOKEN_VERSION_HEADER = "x-token-version";

const SESSION_TTL_SECONDS = 60 * 60 * 24;
const encoder = new TextEncoder();

export type SessionTokenPayload = JWTPayload & {
  sub: string;
  tid?: string;
  role?: string;
  ver: number;
};

function getSecretKey() {
  if (!AUTH_SECRET) {
    throw new Error("AUTH_SECRET is not configured");
  }

  if (AUTH_SECRET.length < 32) {
    throw new Error("AUTH_SECRET must be at least 32 characters long");
  }

  return encoder.encode(AUTH_SECRET);
}

function normalizePayload(payload: JWTPayload): SessionTokenPayload | null {
  if (typeof payload.sub !== "string") {
    return null;
  }

  if (typeof payload.ver !== "number") {
    return null;
  }

  if (payload.tid !== undefined && typeof payload.tid !== "string") {
    return null;
  }

  if (payload.role !== undefined && typeof payload.role !== "string") {
    return null;
  }

  return {
    ...payload,
    sub: payload.sub,
    tid: payload.tid as string | undefined,
    role: payload.role as string | undefined,
    ver: payload.ver,
  };
}

function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}

export async function createSessionToken(input: {
  userId: string;
  tenantId?: string | null;
  role?: string | null;
  tokenVersion: number;
}) {
  return new SignJWT({
    tid: input.tenantId ?? undefined,
    role: input.role ?? undefined,
    ver: input.tokenVersion,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(input.userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });

    return normalizePayload(payload);
  } catch {
    return null;
  }
}

export function buildAuthHeaders(
  request: NextRequest,
  payload: SessionTokenPayload,
) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(AUTH_USER_ID_HEADER, payload.sub);
  requestHeaders.set(AUTH_TOKEN_VERSION_HEADER, String(payload.ver));

  if (payload.tid) {
    requestHeaders.set(AUTH_TENANT_ID_HEADER, payload.tid);
  } else {
    requestHeaders.delete(AUTH_TENANT_ID_HEADER);
  }

  if (payload.role) {
    requestHeaders.set(AUTH_ROLE_HEADER, payload.role);
  } else {
    requestHeaders.delete(AUTH_ROLE_HEADER);
  }

  return requestHeaders;
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions());
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    ...sessionCookieOptions(),
    maxAge: 0,
  });
}

export function getSessionTokenFromRequest(request: NextRequest | Request) {
  if ("cookies" in request && typeof request.cookies?.get === "function") {
    return request.cookies.get(SESSION_COOKIE_NAME)?.value ?? null;
  }

  const cookieHeader = request.headers.get("cookie");

  if (!cookieHeader) {
    return null;
  }

  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE_NAME}=`));

  if (!cookie) {
    return null;
  }

  return cookie.slice(SESSION_COOKIE_NAME.length + 1);
}
