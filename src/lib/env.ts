const DEFAULT_LOCAL_DATABASE_URL =
  "postgresql://postgres:postgres@localhost:5432/gymosdev";

function optionalEnv(name: string, fallback = ""): string {
  return process.env[name] || fallback;
}

function isConfigured(...values: string[]): boolean {
  return values.every(Boolean);
}

function resolveAppUrl(): string {
  const explicit = optionalEnv("NEXT_PUBLIC_APP_URL");

  if (explicit) {
    return explicit;
  }

  const vercelUrl = optionalEnv("VERCEL_URL");

  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }

  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  return "";
}

// ── Database ──
export const DATABASE_URL = optionalEnv(
  "DATABASE_URL",
  DEFAULT_LOCAL_DATABASE_URL,
);
export const DATABASE_URL_UNPOOLED = optionalEnv(
  "DATABASE_URL_UNPOOLED",
  DATABASE_URL,
);

// ── Auth (Clerk) ──
export const CLERK_PUBLISHABLE_KEY = optionalEnv(
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
);
export const CLERK_SECRET_KEY = optionalEnv("CLERK_SECRET_KEY");
export const CLERK_WEBHOOK_SECRET = optionalEnv("CLERK_WEBHOOK_SECRET");
export const CLERK_SIGN_IN_URL = optionalEnv(
  "NEXT_PUBLIC_CLERK_SIGN_IN_URL",
  "/sign-in",
);
export const CLERK_SIGN_UP_URL = optionalEnv(
  "NEXT_PUBLIC_CLERK_SIGN_UP_URL",
  "/sign-up",
);
export const CLERK_AFTER_SIGN_IN_URL = optionalEnv(
  "NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL",
  "/dashboard",
);
export const CLERK_AFTER_SIGN_UP_URL = optionalEnv(
  "NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL",
  "/onboarding",
);
export const IS_CLERK_ENABLED = isConfigured(
  CLERK_PUBLISHABLE_KEY,
  CLERK_SECRET_KEY,
);

// ── App URL ──
export const NEXT_PUBLIC_APP_URL = resolveAppUrl();
export const HAS_APP_URL = Boolean(NEXT_PUBLIC_APP_URL);

// ── Payments (Stripe) ──
export const STRIPE_SECRET_KEY = optionalEnv("STRIPE_SECRET_KEY");
export const STRIPE_PUBLISHABLE_KEY = optionalEnv("STRIPE_PUBLISHABLE_KEY");
export const STRIPE_WEBHOOK_SECRET = optionalEnv("STRIPE_WEBHOOK_SECRET");
export const STRIPE_PRICE_ID_PRO = optionalEnv("STRIPE_PRICE_ID_PRO");
export const STRIPE_PRICE_ID_TRIAL = optionalEnv("STRIPE_PRICE_ID_TRIAL");
export const IS_STRIPE_ENABLED = isConfigured(STRIPE_SECRET_KEY);
export const IS_STRIPE_CHECKOUT_ENABLED = isConfigured(
  STRIPE_SECRET_KEY,
  STRIPE_PRICE_ID_PRO,
  NEXT_PUBLIC_APP_URL,
);
export const IS_STRIPE_PORTAL_ENABLED = isConfigured(
  STRIPE_SECRET_KEY,
  NEXT_PUBLIC_APP_URL,
);

// ── Email (Resend) ──
export const RESEND_API_KEY = optionalEnv("RESEND_API_KEY");
export const RESEND_FROM_EMAIL = optionalEnv(
  "RESEND_FROM_EMAIL",
  "GYM OS <onboarding@resend.dev>",
);

// ── Background Jobs (Inngest) ──
export const INNGEST_SIGNING_KEY = optionalEnv("INNGEST_SIGNING_KEY");
export const INNGEST_EVENT_KEY = optionalEnv("INNGEST_EVENT_KEY");

// ── Error Tracking (Sentry) ──
export const SENTRY_DSN = optionalEnv("SENTRY_DSN");

// ── Analytics (PostHog) ──
export const POSTHOG_KEY = optionalEnv("NEXT_PUBLIC_POSTHOG_KEY");
export const POSTHOG_HOST = optionalEnv(
  "NEXT_PUBLIC_POSTHOG_HOST",
  "https://app.posthog.com",
);

// ── Internal ──
export const INTERNAL_SLACK_WEBHOOK_URL = optionalEnv(
  "INTERNAL_SLACK_WEBHOOK_URL",
);

// ── Local dev fallback (used when Clerk is not configured) ──
export const LOCAL_DEV_TENANT_ID = "org_demo_ironjaw";
export const LOCAL_DEV_USER_ID = "user_demo_owner";
export const LOCAL_DEV_ORG_ROLE = "org:admin";
