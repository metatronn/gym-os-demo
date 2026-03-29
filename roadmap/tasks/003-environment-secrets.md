# Task 003: Environment & Secrets Management

**Phase:** 0 — Infrastructure & CI/CD
**Priority:** Critical
**Depends on:** [002](./002-vercel-project-setup.md)
**Blocks:** [005](./005-neon-database.md), [006](./006-clerk-auth.md), [010](./010-stripe-setup.md)

---

## Objective

Establish a secure, consistent approach to managing secrets across local development, preview deploys, and production. No secrets in code, ever.

## Steps

### 1. Create `.env.example`

Create a committed `.env.example` with every variable and empty values. This is the single source of truth for what env vars the app needs.

```env
# ── Database (Neon) ──
DATABASE_URL=
DATABASE_URL_UNPOOLED=

# ── Auth (Clerk) ──
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# ── Payments (Stripe) ──
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID_PRO=
STRIPE_PRICE_ID_TRIAL=

# ── Email (Resend) ──
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# ── Background Jobs (Inngest) ──
INNGEST_SIGNING_KEY=
INNGEST_EVENT_KEY=

# ── Error Tracking (Sentry) ──
SENTRY_DSN=
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=

# ── Analytics (PostHog) ──
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

# ── Internal ──
INTERNAL_SLACK_WEBHOOK_URL=
```

### 2. Verify `.gitignore`

Confirm these lines exist in `.gitignore` (they already do):

```
.env*.local
```

Add explicitly if missing:

```
.env
.env.local
.env.development.local
.env.production.local
```

### 3. Create `src/lib/env.ts` — Runtime Validation

Use a lightweight env validation pattern (no extra dependency needed):

```ts
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optionalEnv(key: string, fallback: string = ''): string {
  return process.env[key] ?? fallback;
}

// Server-only env vars (never exposed to client)
export const env = {
  DATABASE_URL: requireEnv('DATABASE_URL'),
  CLERK_SECRET_KEY: requireEnv('CLERK_SECRET_KEY'),
  STRIPE_SECRET_KEY: requireEnv('STRIPE_SECRET_KEY'),
  STRIPE_WEBHOOK_SECRET: requireEnv('STRIPE_WEBHOOK_SECRET'),
  RESEND_API_KEY: requireEnv('RESEND_API_KEY'),
  INNGEST_SIGNING_KEY: optionalEnv('INNGEST_SIGNING_KEY'),
  INTERNAL_SLACK_WEBHOOK_URL: optionalEnv('INTERNAL_SLACK_WEBHOOK_URL'),
} as const;
```

This file should only be imported in server-side code (API routes, server components, server actions). It will throw immediately at startup if a required secret is missing — fail fast, not at request time.

### 4. Vercel Environment Variable Scoping

In Vercel Dashboard → Settings → Environment Variables, set each secret with proper scoping:

| Variable | Production | Preview | Development |
|----------|-----------|---------|-------------|
| `DATABASE_URL` | Neon prod branch | Neon dev branch (via integration) | Neon dev branch |
| `CLERK_SECRET_KEY` | Live key | Test key | Test key |
| `STRIPE_SECRET_KEY` | `sk_live_*` | `sk_test_*` | `sk_test_*` |
| `STRIPE_WEBHOOK_SECRET` | Prod endpoint secret | Test endpoint secret | CLI secret |
| `RESEND_API_KEY` | Same for all | Same for all | Same for all |
| `SENTRY_DSN` | Same for all | Same for all | Same for all |

### 5. Local Development Setup

Document in the README:

```bash
# 1. Copy the example env file
cp .env.example .env.local

# 2. Fill in values from each service dashboard
#    (Neon, Clerk, Stripe test keys, etc.)

# 3. For Stripe webhook testing locally:
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# This prints a webhook signing secret — use it as STRIPE_WEBHOOK_SECRET in .env.local
```

### 6. Vercel CLI for Pulling Env Vars (Optional)

Team members can pull env vars from Vercel:

```bash
vercel env pull .env.local
```

This pulls the Development-scoped vars. Never commit the output.

## Acceptance Criteria

- `.env.example` is committed and documents every variable
- `.env.local` is in `.gitignore` (confirmed)
- `src/lib/env.ts` validates required vars at startup
- Vercel has all vars set with correct scoping (prod vs preview vs dev)
- No secrets exist in source code, config files, or git history
