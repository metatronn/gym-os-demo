import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { tenants } from "@/db/schema";
import {
  IS_STRIPE_CHECKOUT_ENABLED,
  IS_STRIPE_PORTAL_ENABLED,
  NEXT_PUBLIC_APP_URL,
  STRIPE_PRICE_ID_PRO,
} from "@/lib/env";
import { isStripeEnabled, stripe } from "@/lib/stripe";

export type BillingInvoiceSummary = {
  id: string;
  amount: number;
  status: string;
  date: string;
  hostedInvoiceUrl: string | null;
  invoicePdfUrl: string | null;
};

export type StripeMembershipPlan = {
  id: string;
  productId: string;
  name: string;
  description: string | null;
  active: boolean;
  unitAmount: number | null;
  currency: string | null;
  interval: string | null;
  trialDays: number | null;
};

async function getTenantRecord(tenantId: string) {
  const [tenant] = await db
    .select()
    .from(tenants)
    .where(eq(tenants.id, tenantId));

  return tenant ?? null;
}

export async function getStripeSubscriptionPeriodEnd(tenantId: string) {
  if (!isStripeEnabled) {
    return null;
  }

  const tenant = await getTenantRecord(tenantId);

  if (!tenant?.stripeSubscriptionId) {
    return null;
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(
      tenant.stripeSubscriptionId,
    );
    const currentPeriodEnd = subscription.items.data.reduce<number | null>(
      (latest, item) =>
        latest === null || item.current_period_end > latest
          ? item.current_period_end
          : latest,
      null,
    );

    return currentPeriodEnd
      ? new Date(currentPeriodEnd * 1000).toISOString()
      : null;
  } catch {
    return null;
  }
}

export async function listBillingInvoices(
  tenantId: string,
): Promise<BillingInvoiceSummary[]> {
  if (!isStripeEnabled) {
    return [];
  }

  const tenant = await getTenantRecord(tenantId);

  if (!tenant?.stripeCustomerId) {
    return [];
  }

  try {
    const invoiceList = await stripe.invoices.list({
      customer: tenant.stripeCustomerId,
      limit: 12,
    });

    return invoiceList.data.map((invoice) => ({
      id: invoice.id,
      amount: (invoice.amount_paid || invoice.amount_due || 0) / 100,
      status: invoice.status ?? "draft",
      date: new Date(invoice.created * 1000).toISOString(),
      hostedInvoiceUrl: invoice.hosted_invoice_url ?? null,
      invoicePdfUrl: invoice.invoice_pdf ?? null,
    }));
  } catch {
    return [];
  }
}

export async function createCheckoutSessionUrl(
  tenantId: string,
  userId: string,
) {
  if (!isStripeEnabled || !IS_STRIPE_CHECKOUT_ENABLED) {
    throw new Error("Stripe checkout is not fully configured");
  }

  const tenant = await getTenantRecord(tenantId);

  if (!tenant) {
    throw new Error("Tenant not found");
  }

  let customerId = tenant.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      metadata: { tenantId, userId },
    });
    customerId = customer.id;

    await db
      .update(tenants)
      .set({ stripeCustomerId: customerId, updatedAt: new Date() })
      .where(eq(tenants.id, tenantId));
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [
      {
        price: STRIPE_PRICE_ID_PRO,
        quantity: 1,
      },
    ],
    subscription_data: {
      trial_period_days: 14,
      metadata: { tenantId },
    },
    success_url: `${NEXT_PUBLIC_APP_URL}/billing?success=true`,
    cancel_url: `${NEXT_PUBLIC_APP_URL}/billing?canceled=true`,
    metadata: { tenantId },
  });

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL");
  }

  return session.url;
}

export async function createPortalSessionUrl(tenantId: string) {
  if (!isStripeEnabled || !IS_STRIPE_PORTAL_ENABLED) {
    throw new Error("Stripe billing portal is not fully configured");
  }

  const tenant = await getTenantRecord(tenantId);

  if (!tenant?.stripeCustomerId) {
    throw new Error("No billing account");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: tenant.stripeCustomerId,
    return_url: `${NEXT_PUBLIC_APP_URL}/billing`,
  });

  if (!session.url) {
    throw new Error("Stripe did not return a billing portal URL");
  }

  return session.url;
}

function parseTrialDays(
  price: Stripe.Price,
  product: Stripe.Product | Stripe.DeletedProduct,
) {
  const productMetadata = "deleted" in product ? {} : product.metadata;
  const trialSource =
    price.metadata?.trial_days || productMetadata?.trial_days || null;

  if (!trialSource) {
    return null;
  }

  const parsed = Number(trialSource);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export async function listStripeMembershipPlans(): Promise<
  StripeMembershipPlan[]
> {
  if (!isStripeEnabled) {
    return [];
  }

  try {
    const prices = await stripe.prices.list({
      active: true,
      expand: ["data.product"],
      limit: 100,
      type: "recurring",
    });

    return prices.data
      .filter((price) => {
        const product = price.product;
        return typeof product !== "string" && !("deleted" in product);
      })
      .map((price) => {
        const product = price.product as Stripe.Product;

        return {
          id: price.id,
          productId: product.id,
          name: product.name,
          description: product.description,
          active: price.active && product.active,
          unitAmount: price.unit_amount,
          currency: price.currency ?? null,
          interval: price.recurring?.interval ?? null,
          trialDays: parseTrialDays(price, product),
        };
      })
      .sort((left, right) => {
        const leftAmount = left.unitAmount ?? Number.MAX_SAFE_INTEGER;
        const rightAmount = right.unitAmount ?? Number.MAX_SAFE_INTEGER;
        return leftAmount - rightAmount || left.name.localeCompare(right.name);
      });
  } catch {
    return [];
  }
}
