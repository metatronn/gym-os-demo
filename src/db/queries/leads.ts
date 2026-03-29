import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { leads, type Lead } from "@/db/schema";
import type { TenantDb } from "@/db/tenant";

type LeadFilters = {
  status?: Lead["status"];
  source?: Lead["source"];
  search?: string;
};

type NewLeadInput = Omit<
  typeof leads.$inferInsert,
  "tenantId" | "createdAt" | "updatedAt"
>;

type UpdateLeadInput = Partial<
  Omit<typeof leads.$inferInsert, "tenantId" | "createdAt" | "updatedAt">
>;

export function leadQueries({ db, tenantFilter, tenantId }: TenantDb) {
  return {
    async list(filters?: LeadFilters) {
      const conditions: Array<ReturnType<typeof eq> | undefined> = [];

      if (filters?.status) {
        conditions.push(eq(leads.status, filters.status));
      }

      if (filters?.source) {
        conditions.push(eq(leads.source, filters.source));
      }

      if (filters?.search) {
        const pattern = `%${filters.search}%`;
        conditions.push(
          or(ilike(leads.name, pattern), ilike(leads.email, pattern)),
        );
      }

      return db
        .select()
        .from(leads)
        .where(tenantFilter(leads, ...conditions))
        .orderBy(desc(leads.createdAt));
    },

    async getById(id: string) {
      const [lead] = await db
        .select()
        .from(leads)
        .where(tenantFilter(leads, eq(leads.id, id)));

      return lead ?? null;
    },

    async create(data: NewLeadInput) {
      const [lead] = await db
        .insert(leads)
        .values({ ...data, tenantId })
        .returning();

      return lead;
    },

    async update(id: string, data: UpdateLeadInput) {
      const [lead] = await db
        .update(leads)
        .set({ ...data, updatedAt: new Date() })
        .where(tenantFilter(leads, eq(leads.id, id)))
        .returning();

      return lead ?? null;
    },

    async delete(id: string) {
      await db.delete(leads).where(tenantFilter(leads, eq(leads.id, id)));
    },

    async countByStatus() {
      const rows = await db
        .select({
          status: leads.status,
          count: sql<number>`cast(count(*) as int)`,
        })
        .from(leads)
        .where(tenantFilter(leads))
        .groupBy(leads.status);

      const counts: Record<string, number> = {
        new: 0,
        contacted: 0,
        booked: 0,
        converted: 0,
        lost: 0,
      };

      for (const row of rows) {
        counts[row.status] = row.count;
      }

      return counts as Record<Lead["status"], number>;
    },
  };
}
