# Local Development Environment

GYM OS is designed so that **all development happens locally** against free, local replacements for production services. The production stack (Neon, Vercel, etc.) is wired in through environment variables alone — no code changes required to go from local to production.

---

## Local Stack vs. Production Stack

| Concern | Local Dev | Production | What Changes |
|---------|-----------|------------|--------------|
| **Database** | Docker Postgres 16 | Neon (serverless Postgres) | `DATABASE_URL` connection string |
| **Hosting** | `next dev` / `next build && next start` | Vercel | Deployment target only |
| **Auth** | Auto-login (no config) | Native JWT (`AUTH_SECRET`) | Env vars only |
| **Payments** | Stripe test mode + `stripe listen` CLI | Stripe live mode + webhook endpoint | Env vars only |
| **Email** | Console logging / `onboarding@resend.dev` | Resend with verified domain | Env var + DNS |
| **Background Jobs** | `npx inngest-cli dev` (local server) | Inngest Cloud | Env vars only |
| **Error Tracking** | Console / dev tools | Sentry | Env var (DSN) |
| **Analytics** | Disabled | PostHog | Env var |

**Key insight:** The application code is identical in both environments. Every external service is accessed through environment variables. "Migrating to production" means setting the right env vars — not changing code.

---

## Prerequisites

- **Node.js 20.x** (LTS)
- **Docker Desktop** (for local Postgres)
- **npm** (comes with Node)

Optional (install when you reach those features):
- **Stripe CLI** — `brew install stripe/stripe-cli/stripe` (for webhook testing)

---

## Quick Start

```bash
make dev
# → http://localhost:3000
```

One command. It starts Postgres, creates `.env.local`, installs deps, runs migrations, seeds demo data (first time), and starts the dev server. No Neon, no Vercel, no external accounts needed.

### All commands

```bash
make dev          # Full setup + dev server
make devstop      # Stop Docker containers
make dev-fresh    # Nuke DB volume, rebuild from scratch
make dev-seed     # Re-run seed script
make dev-studio   # Open Drizzle Studio (DB browser)
make dev-stripe   # Start Stripe webhook forwarding
make dev-status   # Show what's running
make help         # List all commands
```

### Manual setup (alternative)

```bash
docker compose up -d
cp .env.example .env.local
npm ci
npm run db:migrate
npm run db:seed
npm run dev
```

---

## Service-by-Service: Local Setup

### Database (Postgres via Docker)

The `docker-compose.yml` in the project root runs Postgres 16 with a persistent volume. Connection details:

```
Host:     localhost
Port:     5432
User:     postgres
Password: postgres
Database: gymosdev
```

These are pre-filled in `.env.example`. The Drizzle ORM config reads `DATABASE_URL` and works identically whether it points to Docker Postgres or Neon.

```bash
docker compose up -d          # Start Postgres
docker compose down           # Stop (data persists in volume)
docker compose down -v        # Stop and destroy data
npm run db:studio             # Browse data in Drizzle Studio
```

**Why this works as a Neon replacement:** Neon is Postgres. Same wire protocol, same SQL, same driver. Drizzle generates the same queries. The only Neon-specific feature we'd use (branching per preview deploy) is a Vercel integration — irrelevant for local dev.

### Auth

No configuration needed for local dev. The app auto-logs you in as the seed user when `AUTH_SECRET` is not set. For production, set `AUTH_SECRET` in Vercel.

### Payments (Stripe)

Stripe test mode is effectively a local environment built into Stripe:
- Test API keys (`sk_test_`, `pk_test_`) that don't move real money
- Test card numbers (`4242 4242 4242 4242`)
- Full webhook simulation via `stripe listen`

```bash
# Forward Stripe webhooks to your local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Copy the printed webhook signing secret to .env.local
```

**Without Stripe:** The app runs without Stripe keys. Billing features will be non-functional, but everything else works.

### Background Jobs (Inngest)

Inngest provides a local dev server — no account needed:

```bash
npx inngest-cli dev
# → http://localhost:8288 (dashboard to inspect/replay jobs)
```

The local server auto-discovers job definitions from your Next.js `/api/inngest` route. It runs jobs immediately in-process.

**Without Inngest:** Background jobs won't execute, but the app runs fine. Jobs are fire-and-forget from the app's perspective.

### Email (Resend)

For local dev, email can be:
1. **Console logged** — set `RESEND_API_KEY` to empty, emails log to terminal
2. **Sent via Resend dev** — use `onboarding@resend.dev` as the sender (no domain verification needed, free)

**Without Resend:** Emails don't send. Nothing breaks.

### Error Tracking & Analytics

Not needed for local dev. Sentry and PostHog are production-only concerns. The env vars are optional — if absent, those integrations are simply not initialized.

---

## Database Workflow

```bash
# Edit schema
vim src/db/schema/members.ts

# Generate migration SQL from schema diff
npm run db:generate

# Review generated SQL in drizzle/ directory
# Then apply it
npm run db:migrate

# Quick iteration (no migration file, dev only)
npm run db:push

# Browse data
npm run db:studio
```

All migrations committed to `drizzle/` are portable — they run against local Postgres today and Neon tomorrow without modification.

---

## What's Different in Local Dev

### Things that work identically
- All Next.js pages, components, and API routes
- Drizzle ORM queries (Postgres is Postgres)
- Auth flow (auto-login locally, JWT in production)
- Stripe checkout and webhooks (test mode)
- Inngest background jobs (local dev server)
- Tailwind, fonts, all static assets

### Things that don't exist locally
- **Preview deploys** — Vercel creates per-PR preview URLs. Locally, you just run `next dev`.
- **Database branching** — Neon creates a DB branch per preview deploy via the Vercel integration. Locally, you have one database.
- **Edge runtime** — Some Vercel features (edge middleware, ISR) behave slightly differently. App Router pages with `export const runtime = 'edge'` should be tested on Vercel before launch.
- **Custom domain / HTTPS** — Local dev runs on `http://localhost:3000`. HTTPS is a production concern.

### Things that behave differently
- **Cold starts** — Neon databases sleep after 5 min of inactivity. Local Postgres doesn't sleep. You won't see cold start latency locally.
- **Connection pooling** — Neon uses a pooler (`DATABASE_URL`) vs. direct connection (`DATABASE_URL_UNPOOLED`). Local Postgres doesn't need pooling. Code should use `DATABASE_URL` everywhere and let the connection string handle it.

---

## Migrating to Production

Production migration is a configuration exercise. The code stays the same.

### Step 1: Neon Database

1. Create a Neon project at [neon.tech](https://neon.tech) (free tier)
2. Create `production` and `development` branches
3. Get the connection strings
4. Run migrations against the production branch:
   ```bash
   DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require" npm run db:migrate
   ```

**What changes:** `DATABASE_URL` in production env vars points to Neon instead of `localhost`.

### Step 2: Vercel Hosting

1. Connect the GitHub repo to a Vercel project
2. Set all environment variables in Vercel Dashboard (see [NEEDS.md](../NEEDS.md))
3. Push to `main` — Vercel auto-deploys

**What changes:** Deployment target. Code is identical.

**Optional:** Install the Neon-Vercel integration for automatic DB branching per preview deploy.

### Step 3: Auth Secret

1. Generate a secret: `openssl rand -base64 32`
2. Set `AUTH_SECRET` in Vercel env vars (Production scope)

**What changes:** `AUTH_SECRET` env var. No external service to configure.

### Step 4: Stripe Live Mode

1. Complete Stripe business verification
2. Create products and prices in live mode
3. Set up webhook endpoint with production URL
4. Copy live keys to Vercel env vars

**What changes:** `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, and price IDs.

### Step 5: Resend Email

1. Create Resend API key
2. Verify sending domain (DNS records)
3. Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL` in Vercel

**What changes:** `RESEND_API_KEY` and `RESEND_FROM_EMAIL` env vars.

### Step 6: Inngest Cloud

1. Create Inngest account
2. Set `INNGEST_SIGNING_KEY` and `INNGEST_EVENT_KEY` in Vercel
3. Inngest auto-discovers functions from the deployed `/api/inngest` route

**What changes:** `INNGEST_SIGNING_KEY` and `INNGEST_EVENT_KEY` env vars.

### Step 7: Observability

1. Create Sentry project, set `SENTRY_DSN` in Vercel
2. Create PostHog project, set `NEXT_PUBLIC_POSTHOG_KEY` in Vercel

**What changes:** DSN and API key env vars.

### Production Migration Checklist

```
[ ] Neon project created, connection string set
[ ] Migrations applied to Neon production branch
[ ] Vercel project connected to GitHub repo
[ ] All env vars set in Vercel Dashboard
[ ] AUTH_SECRET set in production
[ ] Stripe live mode activated, business verified
[ ] Stripe products/prices created in live mode
[ ] Stripe webhook endpoint configured for production URL
[ ] Resend domain verified (DNS records added)
[ ] Inngest cloud keys set
[ ] Sentry DSN configured
[ ] PostHog key configured
[ ] Custom domain configured in Vercel + Cloudflare
[ ] SSL/HTTPS verified on custom domain
[ ] First production deploy successful
[ ] Smoke test: sign up → create gym → see dashboard
```

---

## Environment Variable Reference

See `.env.example` for the complete list with descriptions. See [NEEDS.md](../NEEDS.md) for where to get each value.

The rule is simple: **if it's in `.env.example`, it's a config knob.** Local defaults are pre-filled. Production values come from each service's dashboard and go into Vercel env vars.
