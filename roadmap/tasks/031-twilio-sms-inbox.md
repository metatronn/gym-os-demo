# Task 031: Twilio SMS, Inbox & Two-Way Conversations

**Phase:** 8 — Action Engine
**Priority:** High
**Depends on:** [017](./017-inngest-background-jobs.md), [020](./020-resend-email.md), [021](./021-tasks-messages-real.md)
**Blocks:** [034](./034-marketing-automation.md), [035](./035-retention-engine.md), [036](./036-ai-tooling-layer.md), [041](./041-member-facing-ai-voice.md)

---

## Objective

Turn the current CRM-style messages page into real two-way SMS infrastructure. Follow-up and check-in actions should be able to send real messages, receive replies, and maintain thread history.

## Steps

### 1. Twilio Setup

- create tenant-safe Twilio configuration support
- define phone number strategy: shared pool first, dedicated numbers later
- store provider identifiers and message delivery metadata

### 2. Messaging Data Model

Evolve the messages schema into real conversation storage:

- `message_threads`
- `message_events` / individual message records
- outbound/inbound direction
- delivery states (`queued`, `sent`, `delivered`, `failed`)
- opt-in / opt-out tracking
- contact linkage to member or lead

### 3. Outbound Send Path

Create safe server actions and jobs for:

- single SMS sends
- templated follow-up sends
- system-triggered reminders and alerts
- idempotent retry behavior for transient provider failures

### 4. Inbound Webhook Path

Add public Twilio webhook routes that:

- verify provider authenticity where supported
- append inbound replies to the correct thread
- resolve member/lead identity
- surface unread state to staff
- emit downstream workflow events

### 5. Inbox UI

Upgrade the messages surface so staff can:

- view thread list and thread detail
- see delivery status and inbound replies
- respond manually
- filter by lead/member, location, unread, or campaign

### 6. Compliance & Controls

- opt-out handling (`STOP`, `UNSUBSCRIBE`, etc.)
- quiet-hours and channel preference hooks
- message audit trail
- no SMS sends without tenant context and actor attribution

## Acceptance Criteria

- GYM OS can send real outbound SMS messages through Twilio
- Inbound replies are captured and threaded correctly
- Delivery state is visible in the inbox
- Staff can reply from the app
- Opt-out handling is respected
- All message records are tenant-scoped and auditable
