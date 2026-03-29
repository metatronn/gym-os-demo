/**
 * Report queries — tenant-scoped aggregation queries for the Reports page.
 *
 * PLACEHOLDER: This file defines the query signatures that will be implemented
 * once the DB layer (Drizzle ORM + Neon Postgres) is wired up. Each function
 * currently throws so that any accidental import fails loudly.
 *
 * When ready to implement, use:
 *   import { tenantDb } from "@/db/tenant";
 *   import { members, leads, payments, classes } from "@/db/schema";
 *   import { eq, and, gte, lte, sql, count } from "drizzle-orm";
 *
 * CRITICAL: Every query MUST use tenantFilter from tenantDb() to ensure
 * tenant isolation (WHERE tenant_id = ?).
 */

interface DateRange {
  from: Date;
  to: Date;
}

// --- Member Growth ---

export interface MemberGrowthRow {
  month: string; // "2026-01"
  newMembers: number;
  churned: number;
}

/**
 * Count members by createdAt month (new) and by status=cancelled with
 * updatedAt in range (churned).
 *
 * Implementation sketch:
 *   SELECT to_char(created_at, 'YYYY-MM') AS month, count(*) AS new_members
 *   FROM members
 *   WHERE tenant_id = ? AND created_at BETWEEN ? AND ?
 *   GROUP BY month
 *
 *   SELECT to_char(updated_at, 'YYYY-MM') AS month, count(*) AS churned
 *   FROM members
 *   WHERE tenant_id = ? AND status = 'cancelled' AND updated_at BETWEEN ? AND ?
 *   GROUP BY month
 */
export async function memberGrowthByMonth(
  _range: DateRange,
): Promise<MemberGrowthRow[]> {
  throw new Error(
    "Not implemented — awaiting DB layer. Use buildMemberGrowthSeries() from src/lib/reporting.ts for mock data.",
  );
}

// --- Revenue by Month ---

export interface RevenueRow {
  month: string; // "2026-01"
  revenue: number; // cents
}

/**
 * Sum payments.amount_cents by month within range where status = 'succeeded'.
 *
 * Implementation sketch:
 *   SELECT to_char(created_at, 'YYYY-MM') AS month, sum(amount_cents) AS revenue
 *   FROM payments
 *   WHERE tenant_id = ? AND status = 'succeeded' AND created_at BETWEEN ? AND ?
 *   GROUP BY month ORDER BY month
 */
export async function revenueByMonth(_range: DateRange): Promise<RevenueRow[]> {
  throw new Error(
    "Not implemented — awaiting DB layer. Use buildMonthlyRevenueSeries() from src/lib/reporting.ts for mock data.",
  );
}

// --- Lead Conversion Funnel ---

export interface LeadFunnelRow {
  status: string;
  count: number;
}

/**
 * Count leads by status within the date range.
 *
 * Implementation sketch:
 *   SELECT status, count(*) AS count
 *   FROM leads
 *   WHERE tenant_id = ? AND created_at BETWEEN ? AND ?
 *   GROUP BY status
 */
export async function leadConversionFunnel(
  _range: DateRange,
): Promise<LeadFunnelRow[]> {
  throw new Error(
    "Not implemented — awaiting DB layer. Use buildLeadFunnel() from src/lib/reporting.ts for mock data.",
  );
}

// --- Class Utilization ---

export interface ClassUtilRow {
  name: string;
  enrolled: number;
  capacity: number;
}

/**
 * Enrolled vs capacity for all active classes.
 *
 * Implementation sketch:
 *   SELECT name, enrolled, capacity
 *   FROM classes
 *   WHERE tenant_id = ?
 *   ORDER BY name
 */
export async function classUtilization(): Promise<ClassUtilRow[]> {
  throw new Error(
    "Not implemented — awaiting DB layer. Use buildClassUtilization() from src/lib/reporting.ts for mock data.",
  );
}

// --- Aggregate report data ---

/**
 * Fetch all report data for a given date range. This will replace the
 * buildReportData() call in page.tsx once the DB is available.
 *
 * Usage:
 *   const data = await getReportData({ from, to });
 *
 * The function should compose the above queries and return a shape compatible
 * with the ReportData interface from src/lib/reporting.ts.
 */
export async function getReportData(_range: DateRange) {
  throw new Error(
    "Not implemented — awaiting DB layer. Use buildReportData() from src/lib/reporting.ts for mock data.",
  );
}
