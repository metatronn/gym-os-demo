import { desc, eq, sql, type SQL } from "drizzle-orm";
import { tasks } from "@/db/schema";
import type { TenantDb } from "@/db/tenant";

type NewTaskInput = Omit<
  typeof tasks.$inferInsert,
  "tenantId" | "createdAt" | "updatedAt"
>;

type UpdateTaskInput = Partial<
  Omit<typeof tasks.$inferInsert, "tenantId" | "createdAt" | "updatedAt">
>;

export type TaskFilters = {
  status?: "todo" | "in-progress" | "done";
  priority?: "high" | "medium" | "low";
  category?: "follow-up" | "billing" | "operations" | "coaching";
};

export function taskQueries({ db, tenantFilter, tenantId }: TenantDb) {
  return {
    async list(filters?: TaskFilters) {
      const conditions: Array<SQL<unknown> | undefined> = [];

      if (filters?.status) {
        conditions.push(eq(tasks.status, filters.status));
      }
      if (filters?.priority) {
        conditions.push(eq(tasks.priority, filters.priority));
      }
      if (filters?.category) {
        conditions.push(eq(tasks.category, filters.category));
      }

      return db
        .select()
        .from(tasks)
        .where(tenantFilter(tasks, ...conditions))
        .orderBy(desc(tasks.createdAt));
    },

    async getById(id: string) {
      const [task] = await db
        .select()
        .from(tasks)
        .where(tenantFilter(tasks, eq(tasks.id, id)));

      return task ?? null;
    },

    async create(data: NewTaskInput) {
      const [task] = await db
        .insert(tasks)
        .values({ ...data, tenantId })
        .returning();

      return task;
    },

    async update(id: string, data: UpdateTaskInput) {
      const [task] = await db
        .update(tasks)
        .set({ ...data, updatedAt: new Date() })
        .where(tenantFilter(tasks, eq(tasks.id, id)))
        .returning();

      return task ?? null;
    },

    async delete(id: string) {
      await db.delete(tasks).where(tenantFilter(tasks, eq(tasks.id, id)));
    },

    async countByStatus() {
      const rows = await db
        .select({
          status: tasks.status,
          count: sql<number>`count(*)::int`,
        })
        .from(tasks)
        .where(tenantFilter(tasks))
        .groupBy(tasks.status);

      const counts: Record<string, number> = {
        todo: 0,
        "in-progress": 0,
        done: 0,
      };

      for (const row of rows) {
        counts[row.status] = row.count;
      }

      return counts;
    },
  };
}
