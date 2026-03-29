import { inngest } from "@/lib/inngest";
import { db } from "@/db";
import { tenants, staffMemberships, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";

async function resolveAdminEmail(tenantId: string): Promise<string | null> {
  const [admin] = await db
    .select({ email: staffMemberships.email, userId: staffMemberships.userId })
    .from(staffMemberships)
    .where(
      and(
        eq(staffMemberships.tenantId, tenantId),
        eq(staffMemberships.role, "org:admin"),
      ),
    )
    .limit(1);

  if (admin?.email) return admin.email;

  if (admin?.userId) {
    const [user] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, admin.userId));
    return user?.email ?? null;
  }

  return null;
}

export const paymentFailedFollowUp = inngest.createFunction(
  {
    id: "payment-failed-follow-up",
    triggers: [{ event: "billing/payment-failed" }],
  },
  async ({ event, step }) => {
    const { tenantId, invoiceId } = event.data as {
      tenantId: string;
      invoiceId: string;
    };

    const tenant = await step.run("get-tenant", async () => {
      const [t] = await db
        .select({ id: tenants.id, name: tenants.name })
        .from(tenants)
        .where(eq(tenants.id, tenantId));
      return t ?? null;
    });

    if (!tenant) return { skipped: true, reason: "tenant-not-found" };

    const ownerEmail = await step.run("resolve-email", () =>
      resolveAdminEmail(tenantId),
    );

    if (ownerEmail) {
      await step.run("send-failed-email", async () => {
        const { sendEmail } = await import("@/lib/send-email");
        await sendEmail({
          type: "payment-failed",
          data: { gymName: tenant.name, ownerEmail, amount: 0 },
        });
      });
    }

    await step.sendEvent("slack-payment-failed", {
      name: "notification/slack",
      data: {
        tenantId,
        templateName: "paymentFailed",
        templateData: { gymName: tenant.name, invoiceId },
      },
    });

    await step.sleep("wait-3-days", "3 days");

    const stillFailed = await step.run("check-status", async () => {
      const [current] = await db
        .select({ subscriptionStatus: tenants.subscriptionStatus })
        .from(tenants)
        .where(eq(tenants.id, tenantId));

      return current?.subscriptionStatus === "past_due";
    });

    if (!stillFailed) return { resolved: true };

    if (ownerEmail) {
      await step.run("send-followup-email", async () => {
        const { sendEmail } = await import("@/lib/send-email");
        await sendEmail({
          type: "payment-failed",
          data: { gymName: tenant.name, ownerEmail, amount: 0 },
        });
      });
    }

    await step.sleep("wait-4-more-days", "4 days");

    const stillFailedFinal = await step.run("final-check", async () => {
      const [current] = await db
        .select({ subscriptionStatus: tenants.subscriptionStatus })
        .from(tenants)
        .where(eq(tenants.id, tenantId));

      return current?.subscriptionStatus === "past_due";
    });

    if (stillFailedFinal && ownerEmail) {
      await step.run("send-final-warning", async () => {
        const { sendEmail } = await import("@/lib/send-email");
        await sendEmail({
          type: "payment-failed",
          data: { gymName: tenant.name, ownerEmail, amount: 0 },
        });
      });
    }

    return { completed: true, stillFailed: stillFailedFinal };
  },
);
