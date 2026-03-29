# Task 015: Schedule & Classes (Mock → Real Data)

**Phase:** 3 — Core Features
**Priority:** Medium
**Depends on:** [007](./007-db-schema.md), [008](./008-tenant-middleware.md)
**Blocks:** [016](./016-floor-plan-real.md), [019](./019-dashboard-real-data.md)

---

## Objective

Replace mock class data with database-backed CRUD. Enable gym staff to manage the weekly schedule, assign coaches, and track capacity.

## Steps

### 1. Query Layer

Create `src/db/queries/classes.ts`:

- `list(filters?)` — filter by day, type, instructor
- `getById(id)` — single class
- `create(data)` — new class
- `update(id, data)` — edit class details
- `delete(id)` — remove class
- `listByDay(day)` — for schedule view grouped by day

### 2. Server Actions

Create `src/app/schedule/actions.ts`:

- `getSchedule()` — full weekly schedule
- `createClass(data)` — add a class to the schedule
- `updateClass(id, data)` — edit time, instructor, capacity
- `deleteClass(id)` — remove from schedule

### 3. Page Updates

Update `src/app/schedule/page.tsx`:

- Weekly view (Mon-Sun columns) showing classes per day
- Color-coded by class type (boxing = red, kickboxing = blue, etc.)
- Click to edit class details
- "Add Class" button → modal with day, time, type, instructor, capacity
- Capacity indicator (enrolled / capacity with waitlist count)

### 4. Instructor Management

For now, instructors are free-text names (matching the mock data pattern). A future task could link them to Clerk org members. No separate instructors table needed yet.

## Acceptance Criteria

- Schedule page loads from database
- Weekly view renders correctly with color-coded class types
- CRUD operations work for classes
- Capacity tracking shows enrolled vs. capacity
- All queries tenant-scoped
- UI matches current mock design
