# Task 038: Internal Workspace, Channels & Thread-to-Task

**Phase:** 10 — Workspace, Memory & Brand Intelligence
**Priority:** High
**Depends on:** [021](./021-tasks-messages-real.md), [032](./032-workflow-engine-actions.md), [036](./036-ai-tooling-layer.md)
**Blocks:** [039](./039-knowledge-brand-memory.md)

---

## Objective

Build the internal workspace layer called for in the docs. Team communication should live inside the product and become usable operational memory, not disappear into external chat tools.

## Steps

### 1. Workspace Data Model

Add persistence for:

- channels
- direct messages
- announcements
- threads
- attachments/linked records
- task references
- project boards or work queues

### 2. Core Workspace UX

Support essential collaboration flows:

- channel list and channel detail
- direct-message threads
- announcements for all staff or location teams
- searchable thread history
- linked tasks and linked operational records

### 3. AI-Assisted Thread Utilities

Use the AI tooling layer for:

- conversation summaries
- thread-to-task draft generation
- meeting recap extraction
- action-item detection

### 4. Operational Integrations

Allow workspace items to connect to:

- members
- leads
- locations
- campaigns
- workflows
- incidents or billing issues

### 5. Permission Boundaries

- channels may be tenant-wide or location-specific
- leaders can broadcast across locations
- staff only see permitted conversations

## Acceptance Criteria

- The app includes a real internal workspace, not just standalone tasks
- Channels, DMs, and announcements persist in the product
- Threads are searchable and can link to operational records
- AI can summarize threads and draft tasks from discussions
- Workspace visibility respects tenant and location permissions
