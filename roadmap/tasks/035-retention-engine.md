# Task 035: Retention Engine & Save Flows

**Phase:** 8 — Action Engine
**Priority:** High
**Depends on:** [013](./013-members-crud.md), [016](./016-floor-plan-real.md), [031](./031-twilio-sms-inbox.md), [032](./032-workflow-engine-actions.md), [033](./033-membership-lifecycle-actions.md)
**Blocks:** [036](./036-ai-tooling-layer.md), [044](./044-predictive-analytics.md)

---

## Objective

Build the retention engine described in the docs: identify at-risk members early, create save workflows, and give owners and coaches a real system for churn prevention instead of passive reporting.

## Steps

### 1. Risk Inputs

Combine multiple signals into retention monitoring:

- attendance decline
- recent no-shows
- payment failures
- app/message inactivity
- recent complaints or support flags
- membership anniversary / lifecycle timing

### 2. Deterministic Risk Scoring

Start with rules-based scoring before full predictive models:

- low / medium / high / critical tiers
- explainable reasons attached to each score
- location-aware thresholds where needed

### 3. Save Flows

Create workflow-backed interventions such as:

- coach check-in tasks
- win-back SMS/email outreach
- class recommendations
- retention offers
- escalation to manager or owner

### 4. Visibility

Surface at-risk accounts across the app:

- dashboard cards
- member detail view
- retention queue
- daily digest
- Slack/email alerts for high-risk events

### 5. Measurement

Track the metrics the docs care about:

- churn rate
- save rate
- recovered-at-risk accounts
- 30/60/90-day retention
- revenue retained from save actions

## Acceptance Criteria

- Members receive explainable retention risk tiers
- At-risk members enter defined save flows automatically or by rule
- Coaches and staff see concrete next-best operational actions
- Retention metrics are measurable over time
- The system reduces reliance on manual churn review
