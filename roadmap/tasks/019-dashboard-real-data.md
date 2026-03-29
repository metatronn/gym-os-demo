# Task 019: Dashboard → Real KPIs & Activity Feed

**Phase:** 3 — Core Features
**Priority:** High
**Depends on:** [013](./013-members-crud.md), [014](./014-leads-pipeline.md), [015](./015-schedule-classes.md)
**Blocks:** Nothing (leaf task)

---

## Objective

Replace the hardcoded dashboard KPIs and activity feed with real aggregated data from the database. The dashboard is the first thing gym owners see — it needs to be accurate.

## Steps

### 1. Dashboard Data Aggregation

Create `src/db/queries/dashboard.ts`:

```ts
import { db } from '@/db';
import { members, leads, payments, activityEvents } from '@/db/schema';
import { eq, and, gte, count, sum, desc } from 'drizzle-orm';

export function dashboardQueries(tenantId: string) {
  return {
    async getKPIs() {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Run all KPI queries in parallel
      const [
        memberStats,
        leadStats,
        revenueStats,
        atRiskCount,
      ] = await Promise.all([
        // Active members count
        db.select({ count: count() })
          .from(members)
          .where(and(
            eq(members.tenantId, tenantId),
            eq(members.status, 'active'),
          )),

        // New leads this month
        db.select({ count: count() })
          .from(leads)
          .where(and(
            eq(leads.tenantId, tenantId),
            gte(leads.createdAt, thirtyDaysAgo),
          )),

        // Monthly revenue (sum of successful payments)
        db.select({ total: sum(payments.amount) })
          .from(payments)
          .where(and(
            eq(payments.tenantId, tenantId),
            eq(payments.status, 'succeeded'),
            gte(payments.createdAt, thirtyDaysAgo),
          )),

        // At-risk members
        db.select({ count: count() })
          .from(members)
          .where(and(
            eq(members.tenantId, tenantId),
            eq(members.riskLevel, 'high'),
          )),
      ]);

      return {
        activeMembers: memberStats[0]?.count ?? 0,
        newLeads: leadStats[0]?.count ?? 0,
        monthlyRevenue: Number(revenueStats[0]?.total ?? 0) / 100, // cents → dollars
        atRiskMembers: atRiskCount[0]?.count ?? 0,
      };
    },

    async getRecentActivity(limit = 20) {
      return db.select()
        .from(activityEvents)
        .where(eq(activityEvents.tenantId, tenantId))
        .orderBy(desc(activityEvents.createdAt))
        .limit(limit);
    },

    async getRevenueChart(months = 6) {
      // Aggregate monthly revenue for the chart
      // Group payments by month, sum amounts
    },
  };
}
```

### 2. Dashboard Page Update

Convert `src/app/dashboard/page.tsx` to a server component:

```tsx
import { requireAuth } from '@/lib/auth';
import { dashboardQueries } from '@/db/queries/dashboard';
import { DashboardClient } from './dashboard-client';

export default async function DashboardPage() {
  const { orgId } = await requireAuth();
  const queries = dashboardQueries(orgId);

  const [kpis, activity, revenueChart] = await Promise.all([
    queries.getKPIs(),
    queries.getRecentActivity(),
    queries.getRevenueChart(),
  ]);

  return (
    <DashboardClient
      kpis={kpis}
      activity={activity}
      revenueChart={revenueChart}
    />
  );
}
```

### 3. Client Component

Extract current dashboard UI into `src/app/dashboard/dashboard-client.tsx`:
- Keep all existing Recharts, KPI cards, and activity feed layout
- Replace hardcoded values with props
- Remove the mock data imports

### 4. Revenue Chart

The Recharts area chart should show real monthly revenue:
- Query payments grouped by month for the last 6 months
- Format as `{ month: 'Mar', revenue: 18200 }` array
- Same chart styling as current mock

### 5. Activity Feed

The activity feed should show real events:
- Use the `activityEvents` table
- Same event type icons and color coding as current mock
- Relative timestamps ("2 minutes ago", "1 hour ago")

### 6. Remove Mock Data

Once the dashboard is wired to real data, remove the following from `src/lib/data.ts`:
- `dashboardKPIs` constant
- `activityEvents` constant
- `revenueData` constant from the dashboard page

Keep `data.ts` around until ALL pages are migrated — then delete it entirely.

## Acceptance Criteria

- Dashboard KPIs are calculated from real database aggregations
- Revenue chart shows real monthly revenue data
- Activity feed shows real events in chronological order
- All queries run in parallel (Promise.all) for fast load
- Dashboard loads in under 500ms
- No mock data imports remain in the dashboard page
