# Recruited Team: GYM OS SaaS

## Function
**What:** Convert GYM OS from a static demo into a production multi-tenant SaaS with auth, billing, email, notifications, and real data.
**Goal:** A gym owner can sign up, start a 14-day trial, manage their gym, convert to paid, and run their business — all from GYM OS.
**Phase:** All phases (0-6), 28 tasks across infrastructure, foundation, billing, features, notifications, hardening, and growth.

---

## User Perspectives

| Persona | Context | Key Question | Source |
|---------|---------|--------------|--------|
| **Javier — Gym Owner** | Runs a 24-bag boxing gym with 200+ members, 5 coaches. Currently duct-taping Mindbody + spreadsheets + WhatsApp. | "Can I know how my gym is doing in one glance, and manage everything without leaving this app?" | [.claude/agents/gym-owner.md](agents/gym-owner.md) |
| **Marcus — Head Coach** | Runs 3-4 classes/day, manages the floor, needs fast check-ins and schedule visibility. Didn't choose the software — the owner did. | "Is this faster than a clipboard? Can I run my class without fumbling with a screen?" | [.claude/agents/coach-staff.md](agents/coach-staff.md) |
| **Rita — Skeptical Owner** | Burned by two previous gym platforms. Uses pen-and-paper. Crossed arms walking in. | "Why should I trust this one? Show me real value in 5 minutes or I'm out." | [.claude/agents/saas-skeptic.md](agents/saas-skeptic.md) |

---

## Implementation Team

| Role | Source | Responsibility | Phases |
|------|--------|---------------|--------|
| **SaaS Infrastructure Engineer** | [.claude/agents/saas-infra-engineer.md](agents/saas-infra-engineer.md) | CI/CD, Vercel config, Neon setup, secrets, migrations, Sentry | 0, 1, 5 |
| **Billing & Payments Engineer** | [.claude/agents/billing-engineer.md](agents/billing-engineer.md) + `/stripe-subscriptions` | Stripe Checkout, webhooks, subscription lifecycle, dunning, billing page | 2 |
| **Next.js App Router** | `/nextjs-app-router` (global skill) | Server Components, data fetching, layouts, Server Actions, all frontend features | 1, 3, 5, 6 |
| **Task Implementer** | `/implement-task` (global skill) | General task execution with quality gates | All |
| **UX Prototyper** | `/design-and-prototype` + `ux-prototyper` (global agent) | Onboarding flow, landing page, settings redesign, mobile responsiveness | 1, 3, 6 |

---

## Quality Team

| Check | Source | When |
|-------|--------|------|
| **Code Review** | `/review-code` (global skill) | Every PR, every task completion |
| **Tenant Isolation Audit** | [.claude/agents/tenant-security-auditor.md](agents/tenant-security-auditor.md) | After every new query/route, Phase 5 comprehensive audit |
| **Feature Verification** | `/verify-feature` (global skill) | After each Phase 3 feature is wired to real data |
| **Enterprise Readiness** | `/enterprise-readiness` (global skill) | Phase 5 hardening assessment |
| **Fix All** | `/fix-all` (global skill) | Before each phase is marked complete |

---

## Gaps

| Gap | Severity | Action |
|-----|----------|--------|
| **No Inngest-specific expertise** | Medium | Inngest is well-documented; `/implement-task` + Inngest docs are sufficient. If job debugging gets complex, create an `inngest-specialist` agent. |
| **No Resend/React Email specialist** | Low | React Email is straightforward. `/nextjs-app-router` covers the React component side. Resend API is minimal. |
| **No dedicated QA/testing agent** | Medium | Relying on `/verify-feature` + `/fix-all`. If test coverage becomes a concern, recruit a test engineer agent. |
| **No gym member perspective** | Low | Members don't directly use GYM OS — they experience it through check-ins and communications. Javier and Marcus represent the member-facing interactions adequately. |

---

## Activation Sequence

### Phase 0 — Infrastructure (Tasks 001-004)
1. `saas-infra-engineer` — Executes all infrastructure tasks
2. `/review-code` — Reviews CI pipeline and config changes

### Phase 1 — Foundation (Tasks 005-009)
1. `saas-infra-engineer` — Database setup (005)
2. `/nextjs-app-router` — Clerk integration, middleware, layouts (006, 008)
3. `gym-owner` perspective — Review onboarding flow design (009)
4. `saas-skeptic` perspective — "Would Rita complete this onboarding?"
5. `/verify-feature` — Verify auth + tenant isolation works end-to-end

### Phase 2 — Billing (Tasks 010-012)
1. `billing-engineer` + `/stripe-subscriptions` — All Stripe work
2. `saas-skeptic` perspective — "Does the billing page feel trustworthy?"
3. `tenant-security-auditor` — Audit webhook handler security
4. `/verify-feature` — Verify checkout → webhook → status sync

### Phase 3 — Core Features (Tasks 013-016, 019, 021)
1. `/nextjs-app-router` — All feature pages (server components, actions)
2. `coach-staff` perspective — Review floor plan, schedule, check-in flows
3. `gym-owner` perspective — Review dashboard KPIs, member management
4. `tenant-security-auditor` — Audit every new query for tenant scoping
5. `/review-code` — Review each feature PR

### Phase 4 — Notifications (Tasks 017-018, 020)
1. `/implement-task` — Inngest jobs, Slack integration, Resend emails
2. `gym-owner` perspective — "Are these notifications useful or noisy?"
3. `saas-skeptic` perspective — "Is Slack required? What if I don't use Slack?"

### Phase 5 — Hardening (Tasks 022-025)
1. `tenant-security-auditor` — Comprehensive security audit (024)
2. `saas-infra-engineer` — Sentry setup (023)
3. `/enterprise-readiness` — Full production readiness assessment
4. `/fix-all` — Clean up any remaining issues
5. `/review-code` — Final review pass

### Phase 6 — Growth (Tasks 026-028)
1. `saas-skeptic` perspective — "Does the landing page convince me?"
2. `/design-and-prototype` — Landing page UX
3. `/nextjs-app-router` — Landing page + admin panel implementation

---

## Skill ↔ Task Mapping

| Skill / Agent | Tasks |
|---------------|-------|
| `saas-infra-engineer` | 001, 002, 003, 004, 005, 023 |
| `billing-engineer` + `/stripe-subscriptions` | 010, 011, 012 |
| `/nextjs-app-router` | 006, 008, 009, 012, 013, 014, 015, 016, 019, 021, 022, 025, 027, 028 |
| `tenant-security-auditor` | 008, 011, 024 (+ continuous audits) |
| `gym-owner` | 009, 012, 013, 014, 018, 019, 022 |
| `coach-staff` | 015, 016, 021 |
| `saas-skeptic` | 009, 012, 027 |
| `/implement-task` | 007, 017, 018, 020, 021, 026 |
| `/review-code` | Every PR |
| `/verify-feature` | End of each phase |
| `/fix-all` | End of Phase 5 |
| `/enterprise-readiness` | Phase 5 |

---

## Next
Start with Phase 0: `saas-infra-engineer` executes Tasks 001-004.
