import crypto from "crypto";
import { desc } from "drizzle-orm";
import { activityEvents } from "@/db/schema";
import type { TenantDb } from "@/db/tenant";

type NewActivityInput = Omit<
  typeof activityEvents.$inferInsert,
  "id" | "tenantId" | "createdAt"
> & {
  createdAt?: Date;
};

export function activityQueries({ db, tenantFilter, tenantId }: TenantDb) {
  return {
    async list(limit = 20) {
      return db
        .select()
        .from(activityEvents)
        .where(tenantFilter(activityEvents))
        .orderBy(desc(activityEvents.createdAt))
        .limit(limit);
    },

    async create(data: NewActivityInput) {
      const [event] = await db
        .insert(activityEvents)
        .values({
          id: `act-${crypto.randomUUID()}`,
          tenantId,
          ...data,
          createdAt: data.createdAt ?? new Date(),
        })
        .returning();

      return event;
    },
  };
}
