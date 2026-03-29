# Local Development Setup

**When to use:** First time setting up the project, or after a fresh clone.

## Prerequisites

- Node.js 20.x
- npm (comes with Node)
- Stripe CLI (`brew install stripe/stripe-cli/stripe`)
- Access to Vercel project (for pulling env vars)

## Quick Start

```bash
# 1. Clone and install
git clone git@github.com:metatronn/gym-os-demo.git
cd gym-os-demo
npm ci

# 2. Set up environment
cp .env.example .env.local
# Fill in values from each service dashboard (see NEEDS.md)
# OR pull from Vercel:
vercel env pull .env.local

# 3. Start dev server
npm run dev
# → http://localhost:3000

# 4. (Optional) Start Stripe webhook forwarding
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Copy the webhook signing secret into .env.local as STRIPE_WEBHOOK_SECRET

# 5. (Optional) Start Inngest dev server
npx inngest-cli dev
# → http://localhost:8288 (Inngest dashboard)

# 6. (Optional) Start Drizzle Studio
npm run db:studio
# → DB browser UI
```

## Environment Variables

See [NEEDS.md](../../../NEEDS.md) for the full list of required accounts and secrets. The `.env.example` file documents every variable.

## Common Commands

```bash
npm run dev           # Dev server with hot reload
npm run build         # Production build (catches type errors)
npm run lint          # ESLint
npx tsc --noEmit      # Type check without building
npm run db:generate   # Generate migration from schema changes
npm run db:migrate    # Apply migrations
npm run db:push       # Push schema directly (dev only, no migration file)
npm run db:studio     # Database browser
npm run db:seed       # Seed test data
```

## Troubleshooting

### `Missing required environment variable: X`
The app validates env vars at startup. Check `.env.local` has all required values. See `.env.example`.

### Stripe webhooks not arriving
Make sure `stripe listen` is running and the signing secret in `.env.local` matches what `stripe listen` printed.

### Database connection failed
Check `DATABASE_URL` in `.env.local`. Neon databases sleep after 5 min of inactivity — the first request may be slow but should connect.
