import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { IS_CLERK_ENABLED } from "@/lib/env";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks/(.*)",
  "/api/health",
]);

const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"]);

const clerkHandler = IS_CLERK_ENABLED
  ? clerkMiddleware(async (auth, request) => {
      if (isPublicRoute(request)) {
        return NextResponse.next();
      }

      await auth.protect();
      const session = await auth();

      if (!session.orgId && !isOnboardingRoute(request)) {
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }

      return NextResponse.next();
    })
  : null;

export default function middleware(
  request: NextRequest,
  event: NextFetchEvent,
) {
  if (!clerkHandler) {
    // No Clerk — every route is accessible, you're already "logged in"
    return NextResponse.next();
  }

  return clerkHandler(request, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
