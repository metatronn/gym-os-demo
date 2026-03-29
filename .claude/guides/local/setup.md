# Local Development Setup

**When to use:** First time setting up the project, or after a fresh clone.

## Prerequisites

- Node.js 20.x
- Docker Desktop (for local Postgres)
- npm (comes with Node)

Optional (install when you need them):
- Stripe CLI (`brew install stripe/stripe-cli/stripe`) — for webhook testing
- Clerk dev account ([clerk.com](https://clerk.com)) — for auth features

## Quick Start

```bash
git clone git@github.com:metatronn/gym-os-demo.git
cd gym-os-demo
make dev
# → http://localhost:3000
```

`make dev` handles Docker, .env.local, deps, migrations, seeding, and starts the dev server.
Run `make help` to see all commands. No Neon, Vercel, or external accounts needed.

## Optional: Add Services As Needed

```bash
# Stripe webhook forwarding (when working on billing)
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Inngest local dev server (when working on background jobs)
npx inngest-cli dev
# → http://localhost:8288

# Database browser
npm run db:studio
```

## Environment Variables

See `.env.example` for the full list with descriptions. Local Postgres defaults are pre-filled. Service API keys are optional — features degrade gracefully without them.

For the full local vs. production comparison, see [docs/LOCAL_DEV.md](../../../docs/LOCAL_DEV.md).

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

### `Missing required environment variable: DATABASE_URL`
Make sure you copied `.env.example` to `.env.local`. The local Postgres defaults are pre-filled.

### Docker Postgres won't start
Check if port 5432 is already in use: `lsof -i :5432`. If another Postgres is running, stop it or change the port in `docker-compose.yml`.

### Database connection failed
Make sure Docker Postgres is running: `docker compose ps`. The container should show "healthy".

### Stripe webhooks not arriving
Make sure `stripe listen` is running and the signing secret in `.env.local` matches what `stripe listen` printed.
