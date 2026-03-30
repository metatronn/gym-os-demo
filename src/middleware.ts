import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  buildAuthHeaders,
  clearSessionCookie,
  createSessionToken,
  getSessionTokenFromRequest,
  setSessionCookie,
  verifySessionToken,
} from "@/lib/auth-session";
import { consumeRateLimit, getRequestIp } from "@/lib/rate-limit";

const PUBLIC_ROUTE_PATTERNS = [
  /^\/$/,
  /^\/sign-in(?:\/.*)?$/,
  /^\/sign-up(?:\/.*)?$/,
  /^\/forgot-password(?:\/.*)?$/,
  /^\/reset-password(?:\/.*)?$/,
  /^\/accept-invite(?:\/.*)?$/,
  /^\/api\/auth\/sign-in$/,
  /^\/api\/auth\/sign-up$/,
  /^\/api\/auth\/forgot-password$/,
  /^\/api\/auth\/reset-password$/,
  /^\/api\/auth\/verify-email$/,
  /^\/api\/tenants\/accept-invite$/,
  /^\/api\/webhooks\/.*$/,
  /^\/api\/health$/,
];

const AUTH_RATE_LIMIT_PATTERNS = [
  /^\/api\/auth\/sign-in$/,
  /^\/api\/auth\/sign-up$/,
  /^\/api\/auth\/forgot-password$/,
  /^\/api\/auth\/reset-password$/,
  /^\/api\/auth\/verify-email$/,
  /^\/api\/tenants\/accept-invite$/,
];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname));
}

function isAuthRateLimitRoute(pathname: string) {
  return AUTH_RATE_LIMIT_PATTERNS.some((pattern) => pattern.test(pathname));
}

function isOnboardingRoute(pathname: string) {
  return /^\/onboarding(?:\/.*)?$/.test(pathname);
}

function isApiRoute(pathname: string) {
  return pathname.startsWith("/api/");
}

function isWebhookRoute(pathname: string) {
  return /^\/api\/webhooks\/.*$/.test(pathname);
}

function rateLimitResponse(retryAfterMs: number) {
  return NextResponse.json(
    { error: "Too many requests. Please try again shortly." },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.max(Math.ceil(retryAfterMs / 1000), 1)),
      },
    },
  );
}

function unauthorizedResponse(request: NextRequest) {
  if (isApiRoute(request.nextUrl.pathname)) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  return NextResponse.redirect(new URL("/sign-in", request.url));
}

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (isAuthRateLimitRoute(pathname)) {
    const authRateLimit = await consumeRateLimit(
      `auth:${pathname}:${getRequestIp(request)}`,
      {
        limit: 10,
        windowMs: 60_000,
      },
    );

    if (!authRateLimit.allowed) {
      return rateLimitResponse(authRateLimit.retryAfterMs);
    }
  }

  const token = getSessionTokenFromRequest(request);

  if (!token) {
    if (isPublicRoute(pathname)) {
      return NextResponse.next();
    }

    return unauthorizedResponse(request);
  }

  const payload = await verifySessionToken(token);

  if (!payload) {
    const response = isPublicRoute(pathname)
      ? NextResponse.next()
      : unauthorizedResponse(request);
    clearSessionCookie(response);
    return response;
  }

  if (
    isApiRoute(pathname) &&
    !isWebhookRoute(pathname) &&
    !isAuthRateLimitRoute(pathname)
  ) {
    const apiRateLimit = await consumeRateLimit(
      payload.tid ? `api:tenant:${payload.tid}` : `api:user:${payload.sub}`,
      {
        limit: 100,
        windowMs: 60_000,
      },
    );

    if (!apiRateLimit.allowed) {
      return rateLimitResponse(apiRateLimit.retryAfterMs);
    }
  }

  const freshToken = await createSessionToken({
    userId: payload.sub,
    tenantId: payload.tid ?? null,
    role: payload.role ?? null,
    tokenVersion: payload.ver,
    sessionId: payload.sid ?? null,
  });

  if (
    !payload.tid &&
    !isPublicRoute(pathname) &&
    !isApiRoute(pathname) &&
    !isOnboardingRoute(pathname)
  ) {
    const response = NextResponse.redirect(new URL("/onboarding", request.url));
    setSessionCookie(response, freshToken);
    return response;
  }

  const response = NextResponse.next({
    request: {
      headers: buildAuthHeaders(request, payload),
    },
  });
  setSessionCookie(response, freshToken);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
