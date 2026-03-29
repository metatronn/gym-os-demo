# Task 013: Members CRUD (Mock → Real Data)

**Phase:** 3 — Core Features
**Priority:** High
**Depends on:** [007](./007-db-schema.md), [008](./008-tenant-middleware.md)
**Blocks:** [019](./019-dashboard-real-data.md)

---

## Objective

Replace the mock members data with real database-backed CRUD. The members page is the most-used feature — it needs search, filter, create, edit, and delete.

## Steps

### 1. Query Layer

Create `src/db/queries/members.ts` following the pattern from Task 008. Include:

- `list(filters?)` — with optional status, plan, risk level, search term filters
- `getById(id)` — single member fetch
- `create(data)` — insert new member
- `update(id, data)` — partial update
- `delete(id)` — remove member
- `count(filters?)` — for KPIs and pagination

### 2. Server Actions

Create `src/app/members/actions.ts`:

```ts
'use server';

import { requireAuth } from '@/lib/auth';
import { memberQueries } from '@/db/queries/members';
import { revalidatePath } from 'next/cache';
import { nanoid } from 'nanoid';

export async function getMembers(filters?: {
  status?: string;
  search?: string;
  plan?: string;
}) {
  const { orgId } = await requireAuth();
  return memberQueries(orgId).list(filters);
}

export async function createMember(data: {
  name: string;
  email: string;
  phone?: string;
  plan?: string;
}) {
  const { orgId } = await requireAuth();
  const member = await memberQueries(orgId).create({
    id: `mem-${nanoid(8)}`,
    ...data,
  });
  revalidatePath('/members');
  return member;
}

export async function updateMember(id: string, data: Partial<{
  name: string;
  email: string;
  phone: string;
  status: string;
  plan: string;
  notes: string;
  tags: string[];
}>) {
  const { orgId } = await requireAuth();
  const member = await memberQueries(orgId).update(id, data);
  revalidatePath('/members');
  return member;
}

export async function deleteMember(id: string) {
  const { orgId } = await requireAuth();
  await memberQueries(orgId).delete(id);
  revalidatePath('/members');
}
```

### 3. Page Updates

Update `src/app/members/page.tsx`:

- Convert to server component for initial data fetch
- Extract the interactive table/filter parts into a client component
- Add "New Member" button → modal form
- Add inline edit capability (or click-to-edit modal)
- Add search bar (debounced, calls server action)
- Add status/plan filter dropdowns

### 4. Member Detail View

Create `src/app/members/[id]/page.tsx`:

- Full member profile (name, email, phone, plan, status, notes)
- Check-in history (from activity events)
- Payment history (from payments table)
- Risk score with explanation
- Edit and delete actions

### 5. Data Migration: Seed Existing Mock Data

The seed script (Task 007) should populate the test tenant with the same member data currently hardcoded in `data.ts`, so the app looks identical before and after the migration.

## Acceptance Criteria

- Members page loads data from the database, not `data.ts`
- Search and filter work (status, plan, text search)
- Create, edit, and delete members work
- Member detail page shows profile + history
- All queries are tenant-scoped (no cross-tenant data leaks)
- UI looks identical to current mock version
