# GYM OS

AI-native operating system for gyms and wellness businesses. Multi-tenant SaaS built with Next.js 14, Drizzle ORM, native JWT auth, Stripe billing, and a local-first development workflow.

## Quick Start

```bash
make dev
```

One command starts Postgres, runs migrations, seeds demo data, and launches the dev server at [localhost:3000](http://localhost:3000).

**Prerequisites:** Node.js 20.x and Docker Desktop.

## Developer Commands

```bash
make dev          # Full setup + dev server
make devstop      # Stop Docker containers
make dev-fresh    # Nuke DB, rebuild from scratch
make dev-seed     # Re-run seed data
make dev-studio   # Open Drizzle Studio (DB browser)
make dev-stripe   # Start Stripe webhook forwarding
make dev-status   # Show running services
make help         # List all commands
```

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router, Server Components, Server Actions) |
| Database | Postgres (local Docker) / Neon (production) |
| ORM | Drizzle ORM with postgres.js driver |
| Auth | Native JWT (jose + bcryptjs) |
| Billing | Stripe (Checkout, Portal, Webhooks) |
| Email | Resend (React Email templates) |
| Background Jobs | Inngest (serverless, local dev server included) |
| Notifications | Slack (per-tenant outbound webhooks) |
| Styling | Tailwind CSS with custom design tokens |

## Project Structure

```
src/
  app/              Next.js App Router pages and API routes
  components/       Shared React components
  db/
    schema/         Drizzle table definitions (11 tables)
    queries/        Tenant-scoped query functions
    seed.ts         Demo data seeder
  lib/              Utilities (auth, env, stripe, subscription)
  emails/           React Email templates
  jobs/             Inngest background job definitions
drizzle/            Generated SQL migrations
roadmap/            Production roadmap (45 tasks across 12 phases)
docs/               Local dev guide + production migration checklist
```

## Architecture

Every database query is tenant-scoped. Tenant ID comes from the JWT session (`orgId`), never from client input. The same codebase runs locally against Docker Postgres and in production against Neon -- the only difference is environment variables.

```
Browser --> Next.js --> Postgres (Docker or Neon)
              |              |
          Auth (JWT)     Drizzle (ORM)
              |
          Stripe (Billing) <--> Webhooks --> Inngest (Jobs)
                                                |
                                       Resend (Email) + Slack
```

## Documentation

| Topic | Link |
|-------|------|
| Local dev environment | [docs/LOCAL_DEV.md](docs/LOCAL_DEV.md) |
| Production migration path | [docs/LOCAL_DEV.md](docs/LOCAL_DEV.md#migrating-to-production) |
| Required accounts & API keys | [NEEDS.md](NEEDS.md) |
| Full roadmap | [roadmap/index.md](roadmap/index.md) |
| Coding guidelines | [CODING_GUIDELINES.md](CODING_GUIDELINES.md) |

## Roadmap Status

| Phase | Status |
|-------|--------|
| 0 -- Infrastructure & CI/CD | Done |
| 1 -- Foundation (DB, Auth, Tenancy) | Done |
| 2 -- Billing & Payments | Done |
| 3 -- Core Features (Mock to Real) | Done |
| 4 -- Email, Notifications & Jobs | Done |
| 5 -- Polish & Hardening | Next |
| 6-12 -- Growth, AI, Platform | Planned |

## License

Private. All rights reserved.
