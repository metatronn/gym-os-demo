# GYM OS

AI-native operating system for gyms and wellness businesses. Next.js 14 SaaS — converting from a static demo into a production multi-tenant platform with native JWT auth, Neon Postgres, Stripe billing, Resend email, and Inngest background jobs.

**Stack:** Next.js 14 · React 18 · TypeScript · Tailwind CSS · Drizzle ORM · Neon Postgres · Stripe · Resend · Inngest · Vercel

## Find Your Guide

| If you need to...                        | Read this                                                    |
|------------------------------------------|--------------------------------------------------------------|
| **Set up local dev**                     | [local/setup.md](.Codex/guides/local/setup.md)              |
| **Understand the tech stack**            | [local/stack.md](.Codex/guides/local/stack.md)              |
| **Deploy or manage Vercel**              | [ops/deploying.md](.Codex/guides/ops/deploying.md)          |
| **Run database migrations**             | [ops/migrations.md](.Codex/guides/ops/migrations.md)        |
| **Manage secrets/env vars**             | [ops/secrets.md](.Codex/guides/ops/secrets.md)              |
| **Write frontend code**                 | [CODING_GUIDELINES.md](CODING_GUIDELINES.md)                 |
| **Work on Stripe/billing**              | [services/billing.md](.Codex/guides/services/billing.md)    |
| **Work on auth/tenancy**                | [services/auth.md](.Codex/guides/services/auth.md)          |
| **See the full roadmap**                | [roadmap/index.md](roadmap/index.md)                         |
| **See what accounts/services are needed**| [NEEDS.md](NEEDS.md)                                        |
| **See the recruited team**              | [.Codex/TEAM.md](.Codex/TEAM.md)                           |

## Critical Rules

- **Tenant isolation:** Every database query MUST include `WHERE tenant_id = ?`. The `tenantId` MUST come from `auth()`, NEVER from request body/params.
- **Secrets:** NEVER commit `.env` files. All secrets go in Vercel env vars. Use `src/lib/env.ts` for runtime validation.
- **Migrations:** NEVER modify committed migration files. Create NEW ones.
- **Stripe webhooks:** ALWAYS verify signatures with `stripe.webhooks.constructEvent()` before processing.
- **Auth:** All app routes require auth. Only `/sign-in`, `/sign-up`, `/api/webhooks/stripe`, `/api/auth/*`, and `/api/health` are public.
- **Mock data:** `src/lib/data.ts` is the legacy mock file. As features go live, remove the corresponding mock data. Do not add to it.

## Quick Reference

```bash
npm run dev           # Start development server (localhost:3000)
npm run build         # Production build
npm run lint          # ESLint
npx tsc --noEmit      # Type check
npm run db:generate   # Generate Drizzle migration from schema changes
npm run db:migrate    # Apply migrations to database
npm run db:studio     # Open Drizzle Studio (DB browser)
```

## Agents

| Agent | Use when... |
|-------|-------------|
| [gym-owner](.Codex/agents/gym-owner.md) | Evaluating UX from the primary user's perspective |
| [coach-staff](.Codex/agents/coach-staff.md) | Evaluating floor plan, schedule, check-in flows |
| [saas-skeptic](.Codex/agents/saas-skeptic.md) | Testing onboarding, pricing, trust signals |
| [saas-infra-engineer](.Codex/agents/saas-infra-engineer.md) | CI/CD, Vercel, Neon, secrets, deployment work |
| [billing-engineer](.Codex/agents/billing-engineer.md) | Stripe integration, webhooks, subscription lifecycle |
| [tenant-security-auditor](.Codex/agents/tenant-security-auditor.md) | Auditing tenant isolation, auth, input validation |

## Project Structure

```
src/
  app/           # Next.js App Router pages and API routes
  components/    # Shared React components (Sidebar, CommandPanel)
  lib/           # Utilities (auth.ts, env.ts, stripe.ts, slack.ts, resend.ts)
  db/            # Database client, schema, queries
  emails/        # React Email templates
  jobs/          # Inngest background job definitions
roadmap/         # Production roadmap with 28 linked tasks
  tasks/         # Individual task files (001-028)
```
