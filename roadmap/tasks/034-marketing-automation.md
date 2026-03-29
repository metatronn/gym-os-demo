# Task 034: Marketing Automation & Reactivation Campaigns

**Phase:** 8 — Action Engine
**Priority:** High
**Depends on:** [020](./020-resend-email.md), [031](./031-twilio-sms-inbox.md), [032](./032-workflow-engine-actions.md), [014](./014-leads-pipeline.md), [030](./030-multi-location-architecture.md)
**Blocks:** [036](./036-ai-tooling-layer.md), [037](./037-command-center-agents.md), [040](./040-executive-dashboards-white-label.md)

---

## Objective

Build the campaign and automation layer needed for zero-touch communication and reactivation. Operators should be able to segment audiences, launch campaigns, and trigger behavior-based outreach without manual busywork.

## Steps

### 1. Campaign Data Model

Add persistent models for:

- campaign definitions
- audience segments
- send schedules
- channel mix (email, SMS)
- offer/promotion references
- per-location variants
- performance metrics

### 2. Segmentation

Support useful operator segments from day one:

- new leads by source
- uncontacted leads
- no-show or inactive members
- billing-risk members
- anniversary and birthday cohorts
- class-interest or membership-plan cohorts

### 3. Trigger-Based Launches

Allow campaigns to trigger from operational events:

- lead created
- missed class
- declining attendance
- membership anniversary
- trial expiring
- payment failure

### 4. Approval & Scheduling

- draft mode vs active mode
- scheduled send windows
- location-specific review where needed
- suppress duplicate sends across overlapping campaigns

### 5. Reporting

Track campaign effectiveness:

- sends
- opens/clicks where applicable
- replies
- booked visits
- conversions
- reactivation revenue

## Acceptance Criteria

- Operators can define and launch segmented campaigns
- Campaigns support both scheduled and event-triggered sends
- Multi-location tenants can localize campaigns while preserving shared structure
- Campaign performance is measurable in the app
- Reactivation flows exist for inactive members and stale leads
