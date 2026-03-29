import { inngest } from "@/lib/inngest";
import { db } from "@/db";
import { tenants } from "@/db/schema";
import { eq, and, lt } from "drizzle-orm";

export const trialExpirationCheck = inngest.createFunction(
  { id: "trial-expiration-check", triggers: [{ cron: "0 9 * * *" }] },
  async ({ step }) => {
    const now = new Date();
    const threeDaysOut = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const expiringTrials = await step.run("find-expiring", async () => {
      return db
        .select()
        .from(tenants)
        .where(
          and(
            eq(tenants.subscriptionStatus, "trialing"),
            lt(tenants.trialEndsAt, threeDaysOut),
          ),
        );
    });

    for (const tenant of expiringTrials) {
      if (!tenant.trialEndsAt) continue;

      const trialEnd = new Date(tenant.trialEndsAt);
      const daysLeft = Math.ceil(
        (trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysLeft <= 0) {
        await step.run(`expire-${tenant.id}`, async () => {
          await db
            .update(tenants)
            .set({ subscriptionStatus: "canceled", updatedAt: new Date() })
            .where(eq(tenants.id, tenant.id));
        });

        await step.sendEvent(`email-trial-expired-${tenant.id}`, {
          name: "email/trial-expired",
          data: { tenantId: tenant.id },
        });
      } else {
        await step.sendEvent(`email-trial-expiring-${tenant.id}`, {
          name: "email/trial-expiring",
          data: { tenantId: tenant.id, daysLeft },
        });
      }
    }

    return { processed: expiringTrials.length };
  },
);
