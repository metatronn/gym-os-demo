import { and, eq, type SQL } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { db } from "@/db";
import { requireAuth } from "@/lib/auth";

type TenantScopedTable = {
  tenantId: AnyPgColumn;
};

export async function tenantDb() {
  const { orgId: tenantId, userId } = await requireAuth();

  return {
    db,
    tenantId,
    userId,
    tenantFilter<T extends TenantScopedTable>(
      table: T,
      ...conditions: Array<SQL<unknown> | undefined>
    ) {
      const scopedConditions = conditions.filter(
        (condition): condition is SQL<unknown> => Boolean(condition),
      );

      if (scopedConditions.length === 0) {
        return eq(table.tenantId, tenantId);
      }

      return and(eq(table.tenantId, tenantId), ...scopedConditions);
    },
  };
}

export type TenantDb = Awaited<ReturnType<typeof tenantDb>>;
