# Task 021: Tasks & Messages (Mock → Real Data)

**Phase:** 3 — Core Features
**Priority:** Medium
**Depends on:** [007](./007-db-schema.md), [008](./008-tenant-middleware.md)
**Blocks:** Nothing (leaf task)

---

## Objective

Replace mock tasks and messages data with database-backed CRUD. Tasks are internal staff tasks; messages are the communication log with members/leads.

## Steps

### 1. Tasks

#### Query Layer — `src/db/queries/tasks.ts`

- `list(filters?)` — filter by status, priority, category, assignee
- `create(data)` — new task
- `update(id, data)` — edit task, change status
- `delete(id)` — remove task
- `countByStatus()` — for the sidebar badge counts

#### Server Actions — `src/app/tasks/actions.ts`

- `getTasks(filters?)`
- `createTask(data)`
- `updateTask(id, data)` — including status transitions (todo → in-progress → done)
- `deleteTask(id)`

#### Page Update — `src/app/tasks/page.tsx`

- Keep existing layout (grouped by status or priority)
- "New Task" button → modal form
- Drag-and-drop status change (or dropdown)
- Assignment to staff members (from Clerk org members)
- Due date with overdue highlighting

### 2. Messages

#### Query Layer — `src/db/queries/messages.ts`

- `list()` — all message threads, sorted by most recent
- `getThread(id)` — single thread with all messages
- `markRead(id)` — mark thread as read
- `countUnread()` — for sidebar badge

#### Page Update — `src/app/messages/page.tsx`

- Thread list on the left (contact name, last message preview, unread badge)
- Message detail on the right (conversation view)
- Channel indicator (SMS / Email)

**Note:** Actual SMS/email sending is a future feature. For now, this is a read-only log of communications — a CRM-style view. Actual sending would require Twilio (SMS) or expanding the Resend integration.

### 3. Remove Mock Data

After both pages are wired to the database, remove from `data.ts`:
- `tasks` constant
- `messages` constant

## Acceptance Criteria

- Tasks page loads from database
- CRUD operations work for tasks
- Status transitions work (todo → in-progress → done)
- Messages page loads from database
- Unread count is accurate
- All queries tenant-scoped
- UI matches current mock design
