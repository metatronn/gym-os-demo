# Task 032: Workflow Engine & Approved Operational Actions

**Phase:** 8 — Action Engine
**Priority:** Critical
**Depends on:** [017](./017-inngest-background-jobs.md), [007](./007-db-schema.md), [008](./008-tenant-middleware.md)
**Blocks:** [033](./033-membership-lifecycle-actions.md), [034](./034-marketing-automation.md), [035](./035-retention-engine.md), [036](./036-ai-tooling-layer.md), [037](./037-command-center-agents.md), [042](./042-public-api-integrations.md), [045](./045-autonomous-agent-execution.md)

---

## Objective

Create the safe action layer described in the docs. AI, automation, and staff tooling must not directly mutate arbitrary records; they must call approved workflows with policy checks, confirmations, and audit logs.

## Steps

### 1. Workflow Registry

Define a central registry of approved actions, including:

- workflow name and version
- required role(s)
- affected entity types
- required confirmation/approval level
- tool/API surface that can invoke it

### 2. Initial Workflow Set

Implement first-class workflows for the most important operational actions:

- `cancel_membership`
- `freeze_membership`
- `pause_membership`
- `change_plan`
- `retry_payment`
- `send_follow_up_sequence`
- `launch_reactivation_campaign`
- `assign_task`
- `book_member_into_class`
- `check_in_member`
- `create_promotion`

### 3. Policy & Approval Layer

Before execution, workflows must be able to:

- validate tenant and role context
- validate location scope where relevant
- inspect contract/billing policy rules
- require confirmation for destructive actions
- require extra approval for financial or legal changes

### 4. Execution & Observability

- consistent input validation
- idempotency keys for retried runs
- durable run status (`pending`, `running`, `completed`, `failed`, `rolled_back`)
- audit log entries for request, execution, and outcome
- emitted domain events for downstream jobs/notifications

### 5. Human-Friendly Preview Support

For sensitive actions, the engine must support preview responses:

- billing impact before cancel/pause/change
- affected members or leads before bulk messaging
- ambiguity prompts when multiple records match

## Acceptance Criteria

- Operational changes run through a central workflow layer, not ad hoc page logic
- Each workflow validates permissions, tenant scope, and policy rules
- Destructive or sensitive actions support preview/confirmation
- Every workflow run is auditable and idempotent
- Downstream jobs can subscribe to workflow completion events
