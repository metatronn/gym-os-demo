# GYM OS

AI-native operating system for gyms and wellness businesses. Next.js 14 SaaS — converting from a static demo into a production multi-tenant platform with Clerk auth, Neon Postgres, Stripe billing, Resend email, and Inngest background jobs.

**Stack:** Next.js 14 · React 18 · TypeScript · Tailwind CSS · Drizzle ORM · Neon Postgres · Clerk · Stripe · Resend · Inngest · Vercel

## Find Your Guide

| If you need to...                        | Read this                                                    |
|------------------------------------------|--------------------------------------------------------------|
| **Set up local dev**                     | [local/setup.md](.claude/guides/local/setup.md)              |
| **Understand the tech stack**            | [local/stack.md](.claude/guides/local/stack.md)              |
| **Deploy or manage Vercel**              | [ops/deploying.md](.claude/guides/ops/deploying.md)          |
| **Run database migrations**             | [ops/migrations.md](.claude/guides/ops/migrations.md)        |
| **Manage secrets/env vars**             | [ops/secrets.md](.claude/guides/ops/secrets.md)              |
| **Write frontend code**                 | [CODING_GUIDELINES.md](CODING_GUIDELINES.md)                 |
| **Work on Stripe/billing**              | [services/billing.md](.claude/guides/services/billing.md)    |
| **Work on auth/tenancy**                | [services/auth.md](.claude/guides/services/auth.md)          |
| **See the full roadmap**                | [roadmap/index.md](roadmap/index.md)                         |
| **See what accounts/services are needed**| [NEEDS.md](NEEDS.md)                                        |
| **See the recruited team**              | [.claude/TEAM.md](.claude/TEAM.md)                           |

## Critical Rules

- **Tenant isolation:** Every database query MUST include `WHERE tenant_id = ?`. The `tenantId` MUST come from `auth()`, NEVER from request body/params.
- **Secrets:** NEVER commit `.env` files. All secrets go in Vercel env vars. Use `src/lib/env.ts` for runtime validation.
- **Migrations:** NEVER modify committed migration files. Create NEW ones.
- **Stripe webhooks:** ALWAYS verify signatures with `stripe.webhooks.constructEvent()` before processing.
- **Auth:** All app routes require Clerk auth. Only `/sign-in`, `/sign-up`, `/api/webhooks/*`, and `/api/health` are public.
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
| [gym-owner](.claude/agents/gym-owner.md) | Evaluating UX from the primary user's perspective |
| [coach-staff](.claude/agents/coach-staff.md) | Evaluating floor plan, schedule, check-in flows |
| [saas-skeptic](.claude/agents/saas-skeptic.md) | Testing onboarding, pricing, trust signals |
| [saas-infra-engineer](.claude/agents/saas-infra-engineer.md) | CI/CD, Vercel, Neon, secrets, deployment work |
| [billing-engineer](.claude/agents/billing-engineer.md) | Stripe integration, webhooks, subscription lifecycle |
| [tenant-security-auditor](.claude/agents/tenant-security-auditor.md) | Auditing tenant isolation, auth, input validation |

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
