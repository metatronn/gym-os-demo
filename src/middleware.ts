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

const PUBLIC_ROUTE_PATTERNS = [
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

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname));
}

function isOnboardingRoute(pathname: string) {
  return /^\/onboarding(?:\/.*)?$/.test(pathname);
}

function isApiRoute(pathname: string) {
  return pathname.startsWith("/api/");
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

  const freshToken = await createSessionToken({
    userId: payload.sub,
    tenantId: payload.tid ?? null,
    role: payload.role ?? null,
    tokenVersion: payload.ver,
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
