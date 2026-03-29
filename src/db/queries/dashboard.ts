import {
  count as drizzleCount,
  desc,
  eq,
  gte,
  or,
  sql,
  sum,
} from "drizzle-orm";
import { activityEvents, leads, members, payments } from "@/db/schema";
import type { TenantDb } from "@/db/tenant";

export function dashboardQueries({ db, tenantFilter }: TenantDb) {
  return {
    async getKPIs() {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      const [
        activeMembersResult,
        newLeadsResult,
        revenueResult,
        atRiskResult,
        prevRevenueResult,
      ] = await Promise.all([
        // Active members count
        db
          .select({ count: drizzleCount() })
          .from(members)
          .where(tenantFilter(members, eq(members.status, "active"))),

        // New leads this month (last 30 days)
        db
          .select({ count: drizzleCount() })
          .from(leads)
          .where(tenantFilter(leads, gte(leads.createdAt, thirtyDaysAgo))),

        // Monthly revenue (sum of succeeded payments in last 30 days)
        db
          .select({ total: sum(payments.amount) })
          .from(payments)
          .where(
            tenantFilter(
              payments,
              eq(payments.status, "succeeded"),
              gte(payments.createdAt, thirtyDaysAgo),
            ),
          ),

        // At-risk members (high or critical)
        db
          .select({ count: drizzleCount() })
          .from(members)
          .where(
            tenantFilter(
              members,
              or(
                eq(members.riskLevel, "high"),
                eq(members.riskLevel, "critical"),
              ),
            ),
          ),

        // Previous month revenue (30-60 days ago) for trend comparison
        db
          .select({ total: sum(payments.amount) })
          .from(payments)
          .where(
            tenantFilter(
              payments,
              eq(payments.status, "succeeded"),
              gte(payments.createdAt, sixtyDaysAgo),
              sql`${payments.createdAt} < ${thirtyDaysAgo}`,
            ),
          ),
      ]);

      const monthlyRevenue = Number(revenueResult[0]?.total ?? 0) / 100;
      const prevMonthlyRevenue = Number(prevRevenueResult[0]?.total ?? 0) / 100;

      // Compute revenue trend as percentage change
      let revenueTrend = 0;
      if (prevMonthlyRevenue > 0) {
        revenueTrend = Math.round(
          ((monthlyRevenue - prevMonthlyRevenue) / prevMonthlyRevenue) * 100,
        );
      }

      return {
        activeMembers: activeMembersResult[0]?.count ?? 0,
        newLeads: newLeadsResult[0]?.count ?? 0,
        monthlyRevenue,
        atRiskMembers: atRiskResult[0]?.count ?? 0,
        revenueTrend,
      };
    },

    async getRecentActivity(limit = 20) {
      return db
        .select()
        .from(activityEvents)
        .where(tenantFilter(activityEvents))
        .orderBy(desc(activityEvents.createdAt))
        .limit(limit);
    },

    async getRevenueChart(months = 6) {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);

      const rows = await db
        .select({
          month: sql<string>`to_char(${payments.createdAt}, 'Mon')`,
          monthNum: sql<number>`extract(month from ${payments.createdAt})`,
          yearNum: sql<number>`extract(year from ${payments.createdAt})`,
          revenue: sql<number>`cast(sum(${payments.amount}) as int)`,
        })
        .from(payments)
        .where(
          tenantFilter(
            payments,
            eq(payments.status, "succeeded"),
            gte(payments.createdAt, startDate),
          ),
        )
        .groupBy(
          sql`to_char(${payments.createdAt}, 'Mon')`,
          sql`extract(month from ${payments.createdAt})`,
          sql`extract(year from ${payments.createdAt})`,
        )
        .orderBy(
          sql`extract(year from ${payments.createdAt})`,
          sql`extract(month from ${payments.createdAt})`,
        );

      return rows.map((row) => ({
        month: row.month.trim(),
        revenue: Math.round((row.revenue ?? 0) / 100),
      }));
    },
  };
}
