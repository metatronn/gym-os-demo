import {
  count as drizzleCount,
  desc,
  eq,
  ilike,
  or,
  type SQL,
} from "drizzle-orm";
import { members } from "@/db/schema";
import type { TenantDb } from "@/db/tenant";

export type MemberFilters = {
  status?: string;
  search?: string;
  plan?: string;
};

type NewMemberInput = Omit<
  typeof members.$inferInsert,
  "tenantId" | "createdAt" | "updatedAt"
>;

type UpdateMemberInput = Partial<
  Omit<typeof members.$inferInsert, "tenantId" | "createdAt" | "updatedAt">
>;

function buildFilterConditions(filters?: MemberFilters): Array<SQL<unknown>> {
  const conditions: Array<SQL<unknown>> = [];

  if (filters?.status && filters.status !== "all") {
    conditions.push(
      eq(
        members.status,
        filters.status as (typeof members.status.enumValues)[number],
      ),
    );
  }

  if (filters?.plan && filters.plan !== "all") {
    conditions.push(
      eq(
        members.plan,
        filters.plan as (typeof members.plan.enumValues)[number],
      ),
    );
  }

  if (filters?.search) {
    const term = `%${filters.search}%`;
    const searchCondition = or(
      ilike(members.name, term),
      ilike(members.email, term),
    );
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  return conditions;
}

export function memberQueries({ db, tenantFilter, tenantId }: TenantDb) {
  return {
    async list(filters?: MemberFilters) {
      return db
        .select()
        .from(members)
        .where(tenantFilter(members, ...buildFilterConditions(filters)))
        .orderBy(desc(members.createdAt));
    },

    async count(filters?: MemberFilters) {
      const [result] = await db
        .select({ count: drizzleCount() })
        .from(members)
        .where(tenantFilter(members, ...buildFilterConditions(filters)));

      return result?.count ?? 0;
    },

    async getById(id: string) {
      const [member] = await db
        .select()
        .from(members)
        .where(tenantFilter(members, eq(members.id, id)));

      return member ?? null;
    },

    async create(data: NewMemberInput) {
      const [member] = await db
        .insert(members)
        .values({ ...data, tenantId })
        .returning();

      return member;
    },

    async update(id: string, data: UpdateMemberInput) {
      const [member] = await db
        .update(members)
        .set({ ...data, updatedAt: new Date() })
        .where(tenantFilter(members, eq(members.id, id)))
        .returning();

      return member ?? null;
    },

    async delete(id: string) {
      await db.delete(members).where(tenantFilter(members, eq(members.id, id)));
    },
  };
}
