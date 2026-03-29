# Task 041: Member-Facing AI Assistant & Voice Ops

**Phase:** 11 — Platform Expansion & Vertical Readiness
**Priority:** Medium
**Depends on:** [031](./031-twilio-sms-inbox.md), [037](./037-command-center-agents.md), [039](./039-knowledge-brand-memory.md)
**Blocks:** long-horizon conversational channels

---

## Objective

Extend GYM OS beyond staff operations into member-facing conversational experiences across SMS, web, and voice-assisted surfaces.

## Steps

### 1. Member-Facing Assistant Scope

Support high-confidence flows first:

- booking help
- class and schedule questions
- FAQ answers
- account-status questions
- membership-update request capture
- escalation to human staff when confidence or permissions are insufficient

### 2. Channel Surfaces

Support:

- SMS assistant mode on top of Twilio threads
- embedded web chat for logged-in members
- voice command capture / phone-assist experiments

### 3. Voice Stack

Add the provider and product shape for:

- speech-to-text
- text-to-speech
- voice session orchestration

This can start as a constrained pilot rather than a full call-center replacement.

### 4. Guardrails

- never expose admin-only data
- never execute sensitive membership/billing changes without explicit approval flow
- route uncertain requests to staff
- log all assistant actions and handoffs

## Acceptance Criteria

- Members can get useful answers and assistance through at least one conversational channel
- The assistant can answer from approved knowledge and workflow tools
- Voice stack plumbing exists for pilot use cases
- Escalation to staff is built into the product experience
- Member-facing AI is constrained by strong permission boundaries
