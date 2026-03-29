# GYM OS — Production Roadmap

From demo to SaaS. Every task is sequenced so that infrastructure and "things are running" come first, then features are built on a solid foundation.

**Pre-requisites:** See [NEEDS.md](../NEEDS.md) for all accounts, API keys, and configuration needed before starting.

---

## Phase 0 — Infrastructure & CI/CD

> **Goal:** Professional deployment pipeline. Nothing merges without CI. Secrets are managed properly. The demo we already have runs through a real CI/CD flow.

| # | Task | Priority | Depends On | Status |
|---|------|----------|------------|--------|
| 001 | [GitHub Branch Protection & Repo Hygiene](./tasks/001-github-branch-protection.md) | Critical | — | `todo` |
| 002 | [Vercel Project Setup & Configuration](./tasks/002-vercel-project-setup.md) | Critical | 001 | `todo` |
| 003 | [Environment & Secrets Management](./tasks/003-environment-secrets.md) | Critical | 002 | `todo` |
| 004 | [CI Pipeline (GitHub Actions)](./tasks/004-ci-pipeline.md) | Critical | 002 | `todo` |

**Exit criteria:** PR workflow enforced, CI gates merges, secrets are in Vercel (not code), production deploy runs clean.

---

## Phase 1 — Foundation

> **Goal:** Database, auth, multi-tenancy, and the tenant lifecycle are running. A user can sign up, create a gym, and land on the dashboard behind auth.

| # | Task | Priority | Depends On | Status |
|---|------|----------|------------|--------|
| 005 | [Neon Database & Drizzle ORM Setup](./tasks/005-neon-database.md) | Critical | 003 | `todo` |
| 006 | [Clerk Authentication & Multi-Tenancy](./tasks/006-clerk-auth.md) | Critical | 003 | `todo` |
| 007 | [Database Schema Design & Initial Migration](./tasks/007-db-schema.md) | Critical | 005, 006 | `todo` |
| 008 | [Tenant Middleware & Data Access Layer](./tasks/008-tenant-middleware.md) | Critical | 006, 007 | `todo` |
| 009 | [Onboarding Flow (Sign Up → Org → Trial)](./tasks/009-onboarding-flow.md) | High | 006, 008 | `todo` |

**Exit criteria:** User can sign up → create gym → see dashboard behind auth. Tenant row exists in Neon with 14-day trial. All data queries are tenant-scoped.

---

## Phase 2 — Billing & Payments

> **Goal:** Stripe is wired. Tenants can subscribe after trial, manage billing, and the system handles payment failures.

| # | Task | Priority | Depends On | Status |
|---|------|----------|------------|--------|
| 010 | [Stripe Subscriptions & Billing](./tasks/010-stripe-setup.md) | Critical | 003, 007, 009 | `todo` |
| 011 | [Stripe Webhook Handler](./tasks/011-stripe-webhooks.md) | Critical | 010 | `todo` |
| 012 | [Billing Page (Real Subscription Management)](./tasks/012-billing-page.md) | High | 010, 011 | `todo` |

**Exit criteria:** Checkout → subscription → webhook → tenant status sync works end-to-end. Customer portal is accessible. Trial converts to paid.

---

## Phase 3 — Core Features (Mock → Real Data)

> **Goal:** Every page that currently shows mock data is wired to the database. CRUD works. Activity is logged.

| # | Task | Priority | Depends On | Status |
|---|------|----------|------------|--------|
| 013 | [Members CRUD](./tasks/013-members-crud.md) | High | 007, 008 | `todo` |
| 014 | [Leads Pipeline](./tasks/014-leads-pipeline.md) | High | 007, 008 | `todo` |
| 015 | [Schedule & Classes](./tasks/015-schedule-classes.md) | Medium | 007, 008 | `todo` |
| 016 | [Floor Plan → Real Booking System](./tasks/016-floor-plan-real.md) | Medium | 015 | `todo` |
| 019 | [Dashboard → Real KPIs & Activity Feed](./tasks/019-dashboard-real-data.md) | High | 013, 014, 015 | `todo` |
| 021 | [Tasks & Messages](./tasks/021-tasks-messages-real.md) | Medium | 007, 008 | `todo` |

**Exit criteria:** `src/lib/data.ts` (mock data) is deleted. Every page reads from Neon. All CRUD operations work. Dashboard shows real aggregated KPIs.

---

## Phase 4 — Email, Notifications & Background Jobs

> **Goal:** Asynchronous work is handled. Emails go out. Slack pings arrive. Trial expiration runs on a schedule.

| # | Task | Priority | Depends On | Status |
|---|------|----------|------------|--------|
| 017 | [Inngest Background Jobs](./tasks/017-inngest-background-jobs.md) | High | 011 | `todo` |
| 018 | [Slack Webhook Integration](./tasks/018-slack-integration.md) | Medium | 017, 008 | `todo` |
| 020 | [Resend Transactional Email](./tasks/020-resend-email.md) | High | 017 | `todo` |

**Exit criteria:** Welcome email on signup. Trial warning emails at 3-day and 1-day marks. Payment failed email with dunning sequence. Slack notifications for key events. Daily digest runs.

---

## Phase 5 — Polish & Hardening

> **Goal:** Production-ready. Secure. Observable. No data leaks between tenants.

| # | Task | Priority | Depends On | Status |
|---|------|----------|------------|--------|
| 022 | [Settings Page (Real Configuration)](./tasks/022-settings-real.md) | Medium | 006, 008, 010, 018 | `todo` |
| 023 | [Sentry Error Tracking](./tasks/023-sentry-error-tracking.md) | High | 002 | `todo` |
| 024 | [Security Hardening & Tenant Isolation Audit](./tasks/024-security-hardening.md) | Critical | 008, 011 | `todo` |
| 025 | [Reports Page (Real Analytics)](./tasks/025-reports-real.md) | Medium | 013, 014 | `todo` |

**Exit criteria:** Sentry captures errors with tenant context. Every query is audited for tenant isolation. Rate limiting is active. Security headers are set. Settings page is functional.

---

## Phase 6 — Growth

> **Goal:** Acquisition and platform management. Public-facing landing page, product analytics, admin panel.

| # | Task | Priority | Depends On | Status |
|---|------|----------|------------|--------|
| 026 | [PostHog Analytics & Feature Flags](./tasks/026-posthog-analytics.md) | Low | 002 | `todo` |
| 027 | [Marketing Landing Page](./tasks/027-landing-page.md) | Medium | 006 | `todo` |
| 028 | [Internal Admin Panel](./tasks/028-admin-panel.md) | Low | 007, 010 | `todo` |

**Exit criteria:** Landing page converts visitors to trials. PostHog tracks key product events. Admin panel shows platform health and tenant metrics.

---

## Dependency Graph

```
Phase 0 (Infrastructure)
  001 → 002 → 003 → [Phase 1]
              002 → 004

Phase 1 (Foundation)
  003 → 005 ─┐
  003 → 006 ─┤→ 007 → 008 → 009
              │
Phase 2 (Billing)
  009 ────────┤→ 010 → 011 → 012
              │
Phase 3 (Features)
  008 ────────┤→ 013 ─┐
              ├→ 014 ─┤→ 019
              ├→ 015 ─┤
              │   └→ 016
              └→ 021

Phase 4 (Notifications)
  011 → 017 → 018
         └──→ 020

Phase 5 (Hardening)
  002 → 023
  008 + 011 → 024
  006 + 008 + 010 + 018 → 022
  013 + 014 → 025

Phase 6 (Growth)
  002 → 026
  006 → 027
  007 + 010 → 028
```

---

## Parallel Work Opportunities

Tasks within the same phase that don't depend on each other can be done simultaneously:

- **Phase 0:** 001 first, then 002, then 003 and 004 in parallel
- **Phase 1:** 005 and 006 in parallel (both only need 003), then 007, then 008, then 009
- **Phase 2:** Sequential (010 → 011 → 012)
- **Phase 3:** 013, 014, 015, and 021 all in parallel (all need 007 + 008). Then 016 (needs 015) and 019 (needs 013 + 014 + 015).
- **Phase 4:** 017 first, then 018 and 020 in parallel
- **Phase 5:** 023 can start as early as Phase 0. 022, 024, 025 can be parallelized.
- **Phase 6:** All three tasks are independent and can be done in any order.

---

## What We're NOT Building (Yet)

These are explicitly out of scope for this roadmap:

- **SMS sending** (Twilio) — messages page is a CRM log for now
- **AI Command Panel** (real LLM integration) — the chat panel stays mock
- **Mobile app** — responsive web only
- **White-labeling** — single brand for now
- **API for third-party integrations** — internal only
- **Automated risk scoring** — manual for now, ML later
