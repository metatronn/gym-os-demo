# Task 016: Floor Plan → Real Booking System

**Phase:** 3 — Core Features
**Priority:** Medium
**Depends on:** [015](./015-schedule-classes.md)
**Blocks:** Nothing (leaf task)

---

## Objective

Wire the visual floor plan to real class data. Clicking a station shows real enrollment data. The booking panel should allow checking members into specific stations.

## Steps

### 1. Schema Addition

Add a `bookings` table:

```ts
export const bookings = pgTable('bookings', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  classId: text('class_id').notNull().references(() => classes.id),
  memberId: text('member_id').notNull().references(() => members.id),
  stationNumber: integer('station_number'),
  status: text('status').default('booked'),  // booked, checked-in, no-show
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
```

### 2. Query Layer

Create `src/db/queries/bookings.ts`:

- `listByClass(classId)` — all bookings for a class
- `getStationMap(classId)` — station number → member mapping (for floor plan render)
- `book(classId, memberId, stationNumber?)` — create booking
- `checkIn(bookingId)` — mark as checked in
- `cancel(bookingId)` — cancel booking

### 3. Floor Plan Updates

Update `src/app/floor-plan/page.tsx`:

- Class selector pulls from real schedule data
- Station grid shows real occupancy (color-coded: booked, checked-in, available)
- Clicking an available station opens a member search to book
- Clicking an occupied station shows member info + check-in button
- Coach roster pulls from the class's instructor field

### 4. Preserve Visual Design

The current floor plan has a distinctive 24-bag visual layout. Keep the exact same layout, grid, and color coding — just wire it to real data.

## Acceptance Criteria

- Floor plan shows real booking data for the selected class
- Stations are color-coded by occupancy status
- Booking and check-in work from the floor plan UI
- Class selector shows real classes from the schedule
- Design matches current visual layout exactly
