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

export const trialExpiringEmail = inngest.createFunction(
  { id: "trial-expiring-email", triggers: [{ event: "email/trial-expiring" }] },
  async ({ event, step }) => {
    const { tenantId, daysLeft } = event.data as {
      tenantId: string;
      daysLeft: number;
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

    if (!ownerEmail) return { skipped: true, reason: "no-admin-email" };

    await step.run("send-email", async () => {
      const { sendEmail } = await import("@/lib/send-email");
      await sendEmail({
        type: "trial-expiring",
        data: { gymName: tenant.name, ownerEmail, daysLeft },
      });
    });

    return { sent: true, daysLeft };
  },
);

export const trialExpiredEmail = inngest.createFunction(
  { id: "trial-expired-email", triggers: [{ event: "email/trial-expired" }] },
  async ({ event, step }) => {
    const { tenantId } = event.data as { tenantId: string };

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

    if (!ownerEmail) return { skipped: true, reason: "no-admin-email" };

    await step.run("send-email", async () => {
      const { sendEmail } = await import("@/lib/send-email");
      await sendEmail({
        type: "trial-expired",
        data: { gymName: tenant.name, ownerEmail },
      });
    });

    return { sent: true };
  },
);
