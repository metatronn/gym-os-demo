# GYM OS — Comprehensive Product Roadmap

From demo to production SaaS, then onward to the AI-native operating system described in `docs/*`.

This roadmap now covers the full implementation arc:
- production infrastructure and tenant-safe SaaS foundations
- the migration/import wedge
- messaging, workflows, and operational automation
- the AI control layer and specialized agents
- internal workspace, memory, brand governance, and multi-location controls
- partner APIs, vertical-readiness modules, and the long-horizon autonomous layer

**Pre-requisites:** See [NEEDS.md](../NEEDS.md) for all accounts, API keys, and configuration needed before starting.

**How to read this roadmap:** Tasks `001`-`028` are still the critical "demo to real product" path. Tasks `029`-`045` extend the roadmap so it reflects the broader requirements captured in the product docs.

---

## Phase 0 — Infrastructure & CI/CD

> **Goal:** Professional deployment pipeline. Nothing merges without CI. Secrets are managed properly. The demo we already have runs through a real CI/CD flow.

| # | Task | Priority | Depends On | Status |
|---|------|----------|------------|--------|
| 001 | [GitHub Branch Protection & Repo Hygiene](./tasks/001-github-branch-protection.md) | Critical | — | `done` |
| 002 | [Vercel Project Setup & Configuration](./tasks/002-vercel-project-setup.md) | Critical | 001 | `deferred` (local dev) |
| 003 | [Environment & Secrets Management](./tasks/003-environment-secrets.md) | Critical | — | `done` |
| 004 | [CI Pipeline (GitHub Actions)](./tasks/004-ci-pipeline.md) | Critical | — | `done` |

**Exit criteria:** PR workflow enforced, CI gates merges, secrets are in Vercel (not code), production deploy runs clean.

---

## Phase 1 — Foundation

> **Goal:** Database, auth, multi-tenancy, and the tenant lifecycle are running. A user can sign up, create a gym, and land on the dashboard behind auth.

| # | Task | Priority | Depends On | Status |
|---|------|----------|------------|--------|
| 005 | [Neon Database & Drizzle ORM Setup](./tasks/005-neon-database.md) | Critical | 003 | `done` (local Postgres) |
| 006 | [Authentication & Multi-Tenancy](./tasks/006-auth.md) | Critical | 003 | `done` |
| 007 | [Database Schema Design & Initial Migration](./tasks/007-db-schema.md) | Critical | 005, 006 | `done` |
| 008 | [Tenant Middleware & Data Access Layer](./tasks/008-tenant-middleware.md) | Critical | 006, 007 | `done` |
| 009 | [Onboarding Flow (Sign Up → Org → Trial)](./tasks/009-onboarding-flow.md) | High | 006, 008 | `done` |

**Exit criteria:** User can sign up → create gym → see dashboard behind auth. Tenant row exists in Neon with 14-day trial. All data queries are tenant-scoped.

---

## Phase 2 — Billing & Payments

> **Goal:** Stripe is wired. Tenants can subscribe after trial, manage billing, and the system handles payment failures.

| # | Task | Priority | Depends On | Status |
|---|------|----------|------------|--------|
| 010 | [Stripe Subscriptions & Billing](./tasks/010-stripe-setup.md) | Critical | 003, 007, 009 | `done` |
| 011 | [Stripe Webhook Handler](./tasks/011-stripe-webhooks.md) | Critical | 010 | `done` |
| 012 | [Billing Page (Real Subscription Management)](./tasks/012-billing-page.md) | High | 010, 011 | `done` |

**Exit criteria:** Checkout → subscription → webhook → tenant status sync works end-to-end. Customer portal is accessible. Trial converts to paid.

---

## Phase 3 — Core Features (Mock → Real Data)

> **Goal:** Every page that currently shows mock data is wired to the database. CRUD works. Activity is logged.

| # | Task | Priority | Depends On | Status |
|---|------|----------|------------|--------|
| 013 | [Members CRUD](./tasks/013-members-crud.md) | High | 007, 008 | `done` |
| 014 | [Leads Pipeline](./tasks/014-leads-pipeline.md) | High | 007, 008 | `done` |
| 015 | [Schedule & Classes](./tasks/015-schedule-classes.md) | Medium | 007, 008 | `done` |
| 016 | [Floor Plan → Real Booking System](./tasks/016-floor-plan-real.md) | Medium | 015 | `done` |
| 019 | [Dashboard → Real KPIs & Activity Feed](./tasks/019-dashboard-real-data.md) | High | 013, 014, 015 | `done` |
| 021 | [Tasks & Messages](./tasks/021-tasks-messages-real.md) | Medium | 007, 008 | `done` |

**Exit criteria:** `src/lib/data.ts` (mock data) is deleted. Every page reads from Neon. All CRUD operations work. Dashboard shows real aggregated KPIs.

---

## Phase 4 — Email, Notifications & Background Jobs

> **Goal:** Asynchronous work is handled. Emails go out. Slack pings arrive. Trial expiration runs on a schedule.

| # | Task | Priority | Depends On | Status |
|---|------|----------|------------|--------|
| 017 | [Inngest Background Jobs](./tasks/017-inngest-background-jobs.md) | High | 011 | `done` |
| 018 | [Slack Webhook Integration](./tasks/018-slack-integration.md) | Medium | 017, 008 | `done` |
| 020 | [Resend Transactional Email](./tasks/020-resend-email.md) | High | 017 | `done` |

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

## Phase 7 — Migration & Multi-Location Foundations

> **Goal:** Add the switching wedge and the org/location architecture described in the product docs. New customers should not feel like they are starting over, and operators should be able to run multiple locations safely under one tenant.

| # | Task | Priority | Depends On | Status |
|---|------|----------|------------|--------|
| 029 | [Import Assistant & Zero-Friction Migration](./tasks/029-import-assistant.md) | Critical | 007, 013, 014, 015, 010 | `todo` |
| 030 | [Multi-Location Architecture & Location Management](./tasks/030-multi-location-architecture.md) | Critical | 007, 008, 009 | `todo` |

**Exit criteria:** A gym can import real data from a legacy system, review mapping/integrity issues, launch with guided setup, and operate one or more locations with safe scoping and shared brand defaults.

---

## Phase 8 — Action Engine

> **Goal:** Make the system do work, not just display data. Messaging, workflows, billing recovery, campaigns, and retention actions should run through safe, auditable operational flows.

| # | Task | Priority | Depends On | Status |
|---|------|----------|------------|--------|
| 031 | [Twilio SMS, Inbox & Two-Way Conversations](./tasks/031-twilio-sms-inbox.md) | High | 017, 020, 021 | `todo` |
| 032 | [Workflow Engine & Approved Operational Actions](./tasks/032-workflow-engine-actions.md) | Critical | 017, 007, 008 | `todo` |
| 033 | [Membership Lifecycle Actions & Billing Recovery](./tasks/033-membership-lifecycle-actions.md) | High | 010, 011, 012, 032 | `todo` |
| 034 | [Marketing Automation & Reactivation Campaigns](./tasks/034-marketing-automation.md) | High | 020, 031, 032, 014, 030 | `todo` |
| 035 | [Retention Engine & Save Flows](./tasks/035-retention-engine.md) | High | 013, 016, 031, 032, 033 | `todo` |

**Exit criteria:** Real SMS and email conversations work, workflow triggers execute safely, cancellation/freeze/change-plan flows are auditable, campaigns can launch from segments, and at-risk members enter automated save paths.

---

## Phase 9 — AI Control Layer

> **Goal:** Deliver the "talk to your gym" experience. AI should reason over context, route to specialized agents, and invoke only approved workflows with safety checks and confirmations.

| # | Task | Priority | Depends On | Status |
|---|------|----------|------------|--------|
| 036 | [AI Tooling Layer, Model Routing & Prompt Management](./tasks/036-ai-tooling-layer.md) | Critical | 031, 032, 034, 035 | `todo` |
| 037 | [Command Center v2 & Specialized Agent Orchestration](./tasks/037-command-center-agents.md) | Critical | 030, 032, 036 | `todo` |

**Exit criteria:** The command center is real, command safety rules are enforced, specialized agents can route and execute approved actions, and all AI calls are observable and traceable.

---

## Phase 10 — Workspace, Memory & Brand Intelligence

> **Goal:** Turn communication, policies, and brand rules into structured institutional memory. Add the internal workspace layer and the cross-location executive control system described in the docs.

| # | Task | Priority | Depends On | Status |
|---|------|----------|------------|--------|
| 038 | [Internal Workspace, Channels & Thread-to-Task](./tasks/038-internal-workspace.md) | High | 021, 032, 036 | `todo` |
| 039 | [Knowledge Base, Brand Memory & Semantic Search](./tasks/039-knowledge-brand-memory.md) | Critical | 022, 030, 036, 038 | `todo` |
| 040 | [Executive Dashboards, Franchise Templates & White-Label Controls](./tasks/040-executive-dashboards-white-label.md) | High | 025, 030, 039 | `todo` |

**Exit criteria:** The app has a real internal workspace, AI can retrieve permission-aware company memory, brand rules govern generated content, and multi-location operators have executive dashboards and reusable templates.

---

## Phase 11 — Platform Expansion & Vertical Readiness

> **Goal:** Expand from the admin web app into member surfaces, partner integrations, and the vertical modules described in the strategic docs.

| # | Task | Priority | Depends On | Status |
|---|------|----------|------------|--------|
| 041 | [Member-Facing AI Assistant & Voice Ops](./tasks/041-member-facing-ai-voice.md) | Medium | 031, 037, 039 | `todo` |
| 042 | [Public API, Webhooks & Partner Integrations](./tasks/042-public-api-integrations.md) | Medium | 030, 032, 039, 024 | `todo` |
| 043 | [Medical-Fitness / HIPAA / JCC Readiness](./tasks/043-medical-fitness-readiness.md) | Medium | 030, 039, 024 | `todo` |

**Exit criteria:** Members can interact through AI-assisted channels, partners can integrate through stable APIs/webhooks, and the product has a concrete plan and data model for medical-adjacent and community-program workflows.

---

## Phase 12 — Full Agentic OS

> **Goal:** Shift from reactive admin software to proactive, semi-autonomous operations with strong approval, audit, and rollback controls.

| # | Task | Priority | Depends On | Status |
|---|------|----------|------------|--------|
| 044 | [Predictive Analytics & Autonomous Recommendations](./tasks/044-predictive-analytics.md) | Medium | 025, 035, 039, 040 | `todo` |
| 045 | [Autonomous Agent Execution & Marketplace Templates](./tasks/045-autonomous-agent-execution.md) | Medium | 037, 042, 044 | `todo` |

**Exit criteria:** The system produces trustworthy forecasts and next-best actions, proactive agents can execute within approval limits, and reusable workflow/agent templates exist for scaling across locations and operator types.

---

## Dependency Highlights

The critical chains are now:

```text
Foundation:
001 → 002 → 003 → 005/006 → 007 → 008 → 009

Revenue + Core Product:
009 → 010 → 011 → 012
007/008 → 013/014/015/021
015 → 016
013/014/015 → 019

Migration + Multi-Location:
007 + 013 + 014 + 015 + 010 → 029
007 + 008 + 009 → 030

Action Engine:
011 → 017 → 018/020
017 + 020 + 021 → 031
017 + 007 + 008 → 032
032 + billing foundations → 033
031 + 032 + leads/location foundations → 034
031 + 032 + member/booking/billing foundations → 035

AI Control:
031 + 032 + 034 + 035 → 036
030 + 032 + 036 → 037

Memory + Expansion:
021 + 032 + 036 → 038
022 + 030 + 036 + 038 → 039
025 + 030 + 039 → 040
031 + 037 + 039 → 041
030 + 032 + 039 + 024 → 042
030 + 039 + 024 → 043

Full Agentic OS:
025 + 035 + 039 + 040 → 044
037 + 042 + 044 → 045
```

---

## Parallel Work Opportunities

- **Phase 0:** `001` first, then `002`, then `003` and `004` in parallel.
- **Phase 1:** `005` and `006` in parallel, then `007`, then `008`, then `009`.
- **Phase 2:** Mostly sequential.
- **Phase 3:** `013`, `014`, `015`, and `021` can run in parallel. Then `016` and `019`.
- **Phase 4:** `017` first, then `018` and `020` in parallel.
- **Phase 5:** `022`, `023`, `024`, and `025` can overlap once dependencies are met.
- **Phase 7:** `029` and `030` can proceed in parallel after the data foundations exist.
- **Phase 8:** `031` and `032` can start in parallel; `033`, `034`, and `035` then branch from them.
- **Phase 10:** `038` and `039` can overlap partially if the workspace persistence lands before semantic retrieval.

---

## Coverage Notes

This roadmap now explicitly covers the major product requirements described in `docs/*`, including:

- migration-first onboarding and dual-system cutover
- multi-location and franchise-style operations
- Twilio SMS and real communication workflows
- approved workflow execution for membership, billing, and operational actions
- campaign automation and retention/save flows
- model routing, specialized agents, and the real command center
- internal workspace, company memory, and brand-governed AI
- executive cross-location dashboards and white-label controls
- member-facing AI, voice, partner APIs, and medical-fitness readiness
- predictive analytics and the long-horizon autonomous operating model
