# Task 014: Leads Pipeline (Mock → Real Data)

**Phase:** 3 — Core Features
**Priority:** High
**Depends on:** [007](./007-db-schema.md), [008](./008-tenant-middleware.md)
**Blocks:** [019](./019-dashboard-real-data.md)

---

## Objective

Replace mock leads data with database-backed CRUD. Build a pipeline view where leads move through statuses: new → contacted → booked → converted (or lost).

## Steps

### 1. Query Layer

Create `src/db/queries/leads.ts`:

- `list(filters?)` — with status, source, assignee, search filters
- `getById(id)` — single lead fetch
- `create(data)` — insert new lead
- `update(id, data)` — partial update (including status transitions)
- `delete(id)` — remove lead
- `countByStatus()` — pipeline stage counts for the header
- `convert(id, memberData)` — transition lead to member (insert member row, update lead status to `converted`)

### 2. Server Actions

Create `src/app/leads/actions.ts`:

- `getLeads(filters?)` — list with filters
- `createLead(data)` — new lead
- `updateLead(id, data)` — update fields or move stages
- `convertLead(id)` — convert to member
- `deleteLead(id)` — remove

### 3. Page Updates

Update `src/app/leads/page.tsx`:

- Server component for initial data fetch
- Pipeline stage counts at the top (New: 5, Contacted: 3, Booked: 2, etc.)
- Table view with status badges, source icons, score, and assigned coach
- "New Lead" button → modal form
- Click a lead → detail/edit panel
- Dropdown to change status (move through pipeline)

### 4. Lead → Member Conversion

When a lead is marked as "converted":

1. Create a new member record from the lead data
2. Update lead status to `converted`
3. Log an activity event: `lead-converted`
4. (Future) Trigger welcome email via Inngest

### 5. Activity Logging

Every lead status change should log an activity event:

```ts
await activityQueries(tenantId).create({
  type: 'lead-new',
  description: `New lead: ${lead.name} from ${lead.source}`,
  relatedId: lead.id,
  relatedName: lead.name,
});
```

## Acceptance Criteria

- Leads page loads from database, not `data.ts`
- Pipeline counts are accurate and real-time
- CRUD operations work (create, edit, status change, delete)
- Lead → Member conversion creates a member record
- Activity events are logged for status changes
- All queries tenant-scoped
- UI matches current mock design
