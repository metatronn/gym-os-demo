import { inngest } from "@/lib/inngest";
import { db } from "@/db";
import { tenants, members, leads, payments } from "@/db/schema";
import { eq, and, gte, lt, count, sql } from "drizzle-orm";

export const dailyDigest = inngest.createFunction(
  { id: "daily-digest", triggers: [{ cron: "0 7 * * *" }] },
  async ({ step }) => {
    const activeTenants = await step.run("get-active-tenants", async () => {
      return db
        .select({
          id: tenants.id,
          name: tenants.name,
          slackWebhookUrl: tenants.slackWebhookUrl,
        })
        .from(tenants)
        .where(sql`${tenants.subscriptionStatus} IN ('active', 'trialing')`);
    });

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const tenant of activeTenants) {
      const stats = await step.run(`stats-${tenant.id}`, async () => {
        const [newLeadsResult] = await db
          .select({ count: count() })
          .from(leads)
          .where(
            and(
              eq(leads.tenantId, tenant.id),
              gte(leads.createdAt, yesterday),
              lt(leads.createdAt, today),
            ),
          );

        const [newMembersResult] = await db
          .select({ count: count() })
          .from(members)
          .where(
            and(
              eq(members.tenantId, tenant.id),
              gte(members.createdAt, yesterday),
              lt(members.createdAt, today),
            ),
          );

        const [revenueResult] = await db
          .select({
            total: sql<number>`COALESCE(SUM(${payments.amount}), 0)`,
          })
          .from(payments)
          .where(
            and(
              eq(payments.tenantId, tenant.id),
              eq(payments.status, "succeeded"),
              gte(payments.createdAt, yesterday),
              lt(payments.createdAt, today),
            ),
          );

        return {
          newLeads: newLeadsResult?.count ?? 0,
          newMembers: newMembersResult?.count ?? 0,
          revenue: Number(revenueResult?.total ?? 0) / 100,
        };
      });

      if (tenant.slackWebhookUrl) {
        await step.sendEvent(`slack-digest-${tenant.id}`, {
          name: "notification/slack",
          data: {
            tenantId: tenant.id,
            templateName: "dailyDigest",
            templateData: {
              gymName: tenant.name,
              ...stats,
            },
          },
        });
      }
    }

    return { tenants: activeTenants.length };
  },
);
