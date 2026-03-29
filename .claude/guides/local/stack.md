# Tech Stack Overview

**When to use:** Understanding how the pieces fit together.

## Architecture

```
Browser → Vercel (Next.js) → Neon (Postgres)
              ↕                    ↕
          Clerk (Auth)        Drizzle (ORM)
              ↕
          Stripe (Billing) ←→ Webhooks → Inngest (Jobs)
                                              ↕
                                     Resend (Email) + Slack
```

## Stack Decisions

| Choice | Why |
|--------|-----|
| **Next.js 14 App Router** | Server Components for data fetching, Server Actions for mutations, built-in API routes for webhooks |
| **Neon** | Serverless Postgres — scales to zero, branch-per-preview, no connection management |
| **Drizzle** | Type-safe ORM that generates SQL you can read. Better DX than Prisma for this scale. |
| **Clerk** | Auth + Organizations (multi-tenancy) out of the box. No custom auth code. |
| **Stripe** | Industry standard. Checkout + Customer Portal means we don't build billing UI. |
| **Resend** | React Email templates. Same mental model as the rest of the app. |
| **Inngest** | Serverless background jobs with retry, scheduling, and step functions. No Redis/queue infrastructure. |
| **Vercel** | Default Next.js host. Preview deploys, edge functions, Speed Insights. |

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
| DB queries | `src/db/queries/*.ts` |
| Auth helpers | `src/lib/auth.ts` |
| Stripe client | `src/lib/stripe.ts` |
| Inngest client | `src/lib/inngest.ts` |
| Inngest jobs | `src/jobs/*.ts` |
| Email templates | `src/emails/*.tsx` |
| Design tokens | `tailwind.config.ts` |
| Mock data (legacy) | `src/lib/data.ts` |
