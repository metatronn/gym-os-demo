import { desc, eq } from "drizzle-orm";
import { classes } from "@/db/schema";
import type { TenantDb } from "@/db/tenant";
import type { ClassSession } from "@/db/schema/classes";

type NewClassInput = Omit<
  typeof classes.$inferInsert,
  "tenantId" | "createdAt" | "updatedAt"
>;

type UpdateClassInput = Partial<
  Omit<typeof classes.$inferInsert, "tenantId" | "createdAt" | "updatedAt">
>;

type ListFilters = {
  day?: string;
  type?: NonNullable<ClassSession["type"]>;
  instructor?: string;
};

export function classQueries({ db, tenantFilter, tenantId }: TenantDb) {
  return {
    async list(filters?: ListFilters) {
      const conditions: Array<ReturnType<typeof eq> | undefined> = [];

      if (filters?.day) {
        conditions.push(eq(classes.dayOfWeek, filters.day));
      }
      if (filters?.type) {
        conditions.push(eq(classes.type, filters.type));
      }
      if (filters?.instructor) {
        conditions.push(eq(classes.instructor, filters.instructor));
      }

      return db
        .select()
        .from(classes)
        .where(tenantFilter(classes, ...conditions))
        .orderBy(desc(classes.createdAt));
    },

    async getById(id: string) {
      const [cls] = await db
        .select()
        .from(classes)
        .where(tenantFilter(classes, eq(classes.id, id)));

      return cls ?? null;
    },

    async create(data: NewClassInput) {
      const [cls] = await db
        .insert(classes)
        .values({ ...data, tenantId })
        .returning();

      return cls;
    },

    async update(id: string, data: UpdateClassInput) {
      const [cls] = await db
        .update(classes)
        .set({ ...data, updatedAt: new Date() })
        .where(tenantFilter(classes, eq(classes.id, id)))
        .returning();

      return cls ?? null;
    },

    async delete(id: string) {
      await db.delete(classes).where(tenantFilter(classes, eq(classes.id, id)));
    },

    async listByDay(): Promise<Record<string, ClassSession[]>> {
      const all = await db
        .select()
        .from(classes)
        .where(tenantFilter(classes))
        .orderBy(classes.time);

      const grouped: Record<string, ClassSession[]> = {};
      for (const cls of all) {
        const day = cls.dayOfWeek ?? "Unscheduled";
        if (!grouped[day]) {
          grouped[day] = [];
        }
        grouped[day].push(cls);
      }
      return grouped;
    },
  };
}
