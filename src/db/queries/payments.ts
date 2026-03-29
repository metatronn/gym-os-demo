import {
  count as drizzleCount,
  desc,
  eq,
  ilike,
  sum,
  type SQL,
} from "drizzle-orm";
import { payments } from "@/db/schema";
import type { TenantDb } from "@/db/tenant";

export type PaymentFilters = {
  status?: string;
  search?: string;
};

function buildFilterConditions(filters?: PaymentFilters): Array<SQL<unknown>> {
  const conditions: Array<SQL<unknown>> = [];

  if (filters?.status && filters.status !== "all") {
    conditions.push(
      eq(
        payments.status,
        filters.status as (typeof payments.status.enumValues)[number],
      ),
    );
  }

  if (filters?.search) {
    const term = `%${filters.search}%`;
    const searchCondition = ilike(payments.memberName, term);
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  return conditions;
}

export function paymentQueries({ db, tenantFilter }: TenantDb) {
  return {
    async list(filters?: PaymentFilters) {
      return db
        .select()
        .from(payments)
        .where(tenantFilter(payments, ...buildFilterConditions(filters)))
        .orderBy(desc(payments.createdAt));
    },

    async getStats() {
      const [succeededResult] = await db
        .select({ total: sum(payments.amount) })
        .from(payments)
        .where(tenantFilter(payments, eq(payments.status, "succeeded")));

      const [failedResult] = await db
        .select({
          total: sum(payments.amount),
          count: drizzleCount(),
        })
        .from(payments)
        .where(tenantFilter(payments, eq(payments.status, "failed")));

      const [pendingResult] = await db
        .select({ count: drizzleCount() })
        .from(payments)
        .where(tenantFilter(payments, eq(payments.status, "pending")));

      return {
        totalRevenue: Number(succeededResult?.total ?? 0),
        failedTotal: Number(failedResult?.total ?? 0),
        failedCount: failedResult?.count ?? 0,
        pendingCount: pendingResult?.count ?? 0,
      };
    },

    async count(filters?: PaymentFilters) {
      const [result] = await db
        .select({ count: drizzleCount() })
        .from(payments)
        .where(tenantFilter(payments, ...buildFilterConditions(filters)));

      return result?.count ?? 0;
    },
  };
}
