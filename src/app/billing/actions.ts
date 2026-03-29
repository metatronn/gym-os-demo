"use server";

import { requireAuth } from "@/lib/auth";
import {
  createCheckoutSessionUrl,
  createPortalSessionUrl,
} from "@/lib/billing";
import { tenantDb } from "@/db/tenant";
import { paymentQueries, type PaymentFilters } from "@/db/queries/payments";
import { getTenantSubscription } from "@/lib/subscription";

export async function getPayments(filters?: PaymentFilters) {
  const ctx = await tenantDb();
  return paymentQueries(ctx).list(filters);
}

export async function getPaymentStats() {
  const ctx = await tenantDb();
  return paymentQueries(ctx).getStats();
}

export async function getPaymentCount() {
  const ctx = await tenantDb();
  return paymentQueries(ctx).count();
}

export async function getSubscriptionStatus() {
  const ctx = await tenantDb();
  return getTenantSubscription(ctx.tenantId);
}

export async function createCheckoutSession(): Promise<{
  url: string | null;
  error?: string;
}> {
  const { orgId, userId } = await requireAuth();

  try {
    const url = await createCheckoutSessionUrl(orgId, userId);
    return { url };
  } catch (error) {
    return {
      url: null,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create checkout session",
    };
  }
}

export async function createPortalSession(): Promise<{
  url: string | null;
  error?: string;
}> {
  const { orgId } = await requireAuth();

  try {
    const url = await createPortalSessionUrl(orgId);
    return { url };
  } catch (error) {
    return {
      url: null,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create portal session",
    };
  }
}
