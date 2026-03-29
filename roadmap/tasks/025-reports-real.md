# Task 025: Reports Page (Real Analytics)

**Phase:** 5 — Polish & Hardening
**Priority:** Medium
**Depends on:** [013](./013-members-crud.md), [014](./014-leads-pipeline.md)
**Blocks:** Nothing (leaf task)

---

## Objective

Wire the reports page to real database aggregations. Provide gym owners with actionable metrics: revenue trends, member retention, lead conversion rates, and class utilization.

## Steps

### 1. Report Queries

Create `src/db/queries/reports.ts`:

- `revenueByMonth(months)` — monthly revenue trend
- `memberGrowth(months)` — new members per month, churn per month, net growth
- `leadConversionFunnel()` — leads by stage, conversion rate per source
- `classUtilization()` — average capacity fill rate per class
- `retentionCohorts()` — percentage of members still active after 1, 3, 6, 12 months
- `topRiskMembers(limit)` — members most likely to churn

### 2. Page Update

Convert `src/app/reports/page.tsx` to server component:
- Fetch all report data in parallel
- Pass to client component for chart rendering
- Keep Recharts for all visualizations

### 3. Charts

| Report | Chart Type | Data |
|--------|-----------|------|
| Revenue Trend | Area Chart | Monthly revenue, 6-12 months |
| Member Growth | Bar Chart | New vs. churned per month |
| Lead Funnel | Funnel/Bar | Count at each pipeline stage |
| Class Utilization | Bar Chart | Fill rate per class type |
| Retention | Line Chart | Cohort retention curves |

### 4. Date Range Selector

Add a date range picker (last 30 days, 90 days, 6 months, 12 months, custom) that filters all report queries.

## Acceptance Criteria

- All report charts show real data
- Date range selector works across all charts
- Reports load in under 1 second (parallel queries)
- No mock data in reports page
