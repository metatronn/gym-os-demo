import { desc, eq, sql } from "drizzle-orm";
import { messages } from "@/db/schema";
import type { TenantDb } from "@/db/tenant";

export function messageQueries({ db, tenantFilter, tenantId }: TenantDb) {
  return {
    async list() {
      return db
        .select()
        .from(messages)
        .where(tenantFilter(messages))
        .orderBy(desc(messages.timestamp));
    },

    async getById(id: string) {
      const [message] = await db
        .select()
        .from(messages)
        .where(tenantFilter(messages, eq(messages.id, id)));

      return message ?? null;
    },

    async markRead(id: string) {
      const [message] = await db
        .update(messages)
        .set({ unread: false, updatedAt: new Date() })
        .where(tenantFilter(messages, eq(messages.id, id)))
        .returning();

      return message ?? null;
    },

    async countUnread() {
      const [result] = await db
        .select({
          count: sql<number>`count(*)::int`,
        })
        .from(messages)
        .where(tenantFilter(messages, eq(messages.unread, true)));

      return result?.count ?? 0;
    },
  };
}
