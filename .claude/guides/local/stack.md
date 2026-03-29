# Tech Stack Overview

**When to use:** Understanding how the pieces fit together.

## Architecture

```
Browser → Next.js (local or Vercel) → Postgres (local Docker or Neon)
              ↕                            ↕
          Clerk (Auth)               Drizzle (ORM)
              ↕
          Stripe (Billing) ←→ Webhooks → Inngest (Jobs)
                                              ↕
                                     Resend (Email) + Slack
```

All external services are accessed through environment variables. The same code runs locally (Docker Postgres, `next dev`) and in production (Neon, Vercel). See [docs/LOCAL_DEV.md](../../../docs/LOCAL_DEV.md) for the full comparison.

## Stack Decisions

| Choice | Why |
|--------|-----|
| **Next.js 14 App Router** | Server Components for data fetching, Server Actions for mutations, built-in API routes for webhooks |
| **Postgres (local) / Neon (prod)** | Same database, different hosting. Drizzle doesn't care which. |
| **Drizzle** | Type-safe ORM that generates SQL you can read. Better DX than Prisma for this scale. |
| **postgres.js** | Universal Postgres driver. Works with local Postgres and Neon without code changes. |
| **Clerk** | Auth + Organizations (multi-tenancy) out of the box. Dev keys work on localhost. |
| **Stripe** | Industry standard. Test mode for dev, live mode for prod. Same API. |
| **Resend** | React Email templates. Console fallback for local dev. |
| **Inngest** | Serverless background jobs with local dev server. No Redis/queue infrastructure. |

## Multi-Tenancy Model

Clerk Organizations = Tenants (Gyms). Every database table has a `tenant_id` column that stores the Clerk `orgId`. Every query filters by `tenant_id`.

```
Clerk Org (gym) → tenants table → all data scoped by tenant_id
Clerk User → org member with role (admin, coach, staff)
```

## Data Flow

1. **User signs up** → Clerk creates user
2. **User creates gym** → Clerk creates Organization → webhook → `tenants` row with trial
3. **User upgrades** → Stripe Checkout → webhook → `tenants.subscriptionStatus = 'active'`
4. **Payment fails** → Stripe webhook → Inngest job → Resend email + Slack notification
5. **Daily** → Inngest cron → trial expiration check + daily digest email/Slack

## File Pointers

| Component | Location |
|-----------|----------|
| App routes | `src/app/*/page.tsx` |
| API routes | `src/app/api/*/route.ts` |
| DB client | `src/db/index.ts` |
| DB schema | `src/db/schema/*.ts` |
| DB seed | `src/db/seed.ts` |
| Env validation | `src/lib/env.ts` |
| Auth helpers | `src/lib/auth.ts` |
| Stripe client | `src/lib/stripe.ts` |
| Inngest client | `src/lib/inngest.ts` |
| Inngest jobs | `src/jobs/*.ts` |
| Email templates | `src/emails/*.tsx` |
| Design tokens | `tailwind.config.ts` |
| Mock data (legacy) | `src/lib/data.ts` |
| Docker Compose | `docker-compose.yml` |
| Drizzle config | `drizzle.config.ts` |
| Env template | `.env.example` |
