# Task 033: Membership Lifecycle Actions & Billing Recovery

**Phase:** 8 — Action Engine
**Priority:** High
**Depends on:** [010](./010-stripe-setup.md), [011](./011-stripe-webhooks.md), [012](./012-billing-page.md), [032](./032-workflow-engine-actions.md)
**Blocks:** [035](./035-retention-engine.md), [037](./037-command-center-agents.md)

---

## Objective

Implement the highest-value operational workflows around membership state changes and revenue protection. Owners and staff should be able to cancel, freeze, pause, upgrade, downgrade, and recover failed payments safely.

## Steps

### 1. Membership State Model

Introduce the business rules needed for lifecycle actions:

- active
- trialing
- paused
- frozen
- pending cancellation
- canceled
- past due / unpaid

Track effective dates, actor, reason, and billing consequences.

### 2. Contract & Billing Rules

Before a lifecycle action executes, the system should evaluate:

- contract end dates and minimum terms
- freeze allowances
- proration rules
- next invoice timing
- outstanding balance and payment method status

### 3. Operational Flows

Add concrete flows for:

- cancel now / cancel at period end
- freeze for a time window
- pause until a chosen date
- resume
- upgrade / downgrade plan
- retry failed payment
- send card-update prompts

### 4. User Experience

For each action, show:

- what changes immediately
- what changes later
- billing impact summary
- who will be notified
- audit note / reason capture

### 5. Recovery Queue

Create a visible billing recovery queue that surfaces:

- failed payments
- retry status
- next scheduled outreach
- accounts approaching cancellation
- manual intervention actions for staff

## Acceptance Criteria

- Membership lifecycle actions exist as auditable workflows
- Billing and contract rules are evaluated before execution
- Staff can preview the impact of cancel/freeze/pause/change-plan actions
- Failed payments enter a visible recovery queue
- Card-update prompts and retry actions integrate with billing recovery jobs
