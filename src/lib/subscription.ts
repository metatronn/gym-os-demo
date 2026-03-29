import { eq } from "drizzle-orm";
import { db } from "@/db";
import { tenants } from "@/db/schema";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid";

export async function getTenantSubscription(tenantId: string) {
  const [tenant] = await db
    .select({
      subscriptionStatus: tenants.subscriptionStatus,
      trialEndsAt: tenants.trialEndsAt,
    })
    .from(tenants)
    .where(eq(tenants.id, tenantId));

  if (!tenant) {
    return null;
  }

  const isTrialExpired = Boolean(
    tenant.trialEndsAt && new Date() > tenant.trialEndsAt,
  );
  const isActive =
    tenant.subscriptionStatus === "active" ||
    (tenant.subscriptionStatus === "trialing" && !isTrialExpired);

  return {
    ...tenant,
    isActive,
    isTrialExpired,
  };
}

export async function requireActiveSubscription(tenantId: string) {
  const subscription = await getTenantSubscription(tenantId);

  if (!subscription?.isActive) {
    throw new Error("Subscription required");
  }

  return subscription;
}
