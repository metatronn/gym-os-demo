import { desc, eq } from "drizzle-orm";
import BillingClient, {
  type BillingInvoiceRow,
  type BillingPaymentRow,
  type BillingSubscriptionRow,
} from "./billing-client";
import { tenantDb } from "@/db/tenant";
import { payments, tenants } from "@/db/schema";
import {
  calculateMonthlyRevenue,
  calculatePercentChange,
  centsToDollars,
} from "@/lib/reporting";
import { getTenantSubscription } from "@/lib/subscription";
import {
  getStripeSubscriptionPeriodEnd,
  listBillingInvoices,
} from "@/lib/billing";
import {
  IS_STRIPE_CHECKOUT_ENABLED,
  IS_STRIPE_PORTAL_ENABLED,
} from "@/lib/env";

export const dynamic = "force-dynamic";

function formatPercent(value: number) {
  return Number(value.toFixed(1));
}

export default async function BillingPage() {
  const { db, tenantFilter, tenantId } = await tenantDb();
  const previousMonth = new Date();
  previousMonth.setMonth(previousMonth.getMonth() - 1);

  const [tenantRow, paymentRows, subscription, currentPeriodEnd, invoices] =
    await Promise.all([
      db
        .select({
          stripeCustomerId: tenants.stripeCustomerId,
          stripeSubscriptionId: tenants.stripeSubscriptionId,
        })
        .from(tenants)
        .where(eq(tenants.id, tenantId))
        .then((rows) => rows[0] ?? null),
      db
        .select()
        .from(payments)
        .where(tenantFilter(payments))
        .orderBy(desc(payments.createdAt)),
      getTenantSubscription(tenantId),
      getStripeSubscriptionPeriodEnd(tenantId),
      listBillingInvoices(tenantId),
    ]);

  const monthlyRevenue = calculateMonthlyRevenue(paymentRows);
  const previousMonthRevenue = calculateMonthlyRevenue(
    paymentRows,
    previousMonth,
  );
  const revenueGrowth = formatPercent(
    calculatePercentChange(monthlyRevenue, previousMonthRevenue),
  );
  const succeededPayments = paymentRows.filter(
    (payment) => payment.status === "succeeded",
  );
  const failedPayments = paymentRows.filter(
    (payment) => payment.status === "failed",
  );

  const data = {
    summary: {
      monthlyRevenue: Number(monthlyRevenue.toFixed(2)),
      revenueGrowth,
      collected: Number(
        succeededPayments
          .reduce((total, payment) => total + centsToDollars(payment.amount), 0)
          .toFixed(2),
      ),
      failedTotal: Number(
        failedPayments
          .reduce((total, payment) => total + centsToDollars(payment.amount), 0)
          .toFixed(2),
      ),
      failedCount: failedPayments.length,
      averageTransaction:
        succeededPayments.length === 0
          ? 0
          : Number(
              (
                succeededPayments.reduce(
                  (total, payment) => total + centsToDollars(payment.amount),
                  0,
                ) / succeededPayments.length
              ).toFixed(2),
            ),
      transactionCount: paymentRows.length,
    },
    subscription: subscription
      ? ({
          subscriptionStatus: subscription.subscriptionStatus,
          trialEndsAt: subscription.trialEndsAt?.toISOString() ?? null,
          currentPeriodEnd,
          isActive: subscription.isActive,
          isTrialExpired: subscription.isTrialExpired,
        } satisfies BillingSubscriptionRow)
      : null,
    payments: paymentRows.map<BillingPaymentRow>((payment) => ({
      id: payment.id,
      memberName: payment.memberName ?? "Subscription payment",
      amount: centsToDollars(payment.amount),
      status: payment.status,
      type: payment.type ?? "subscription",
      method: payment.method ?? "stripe",
      date: payment.createdAt.toISOString(),
    })),
    invoices: invoices.map<BillingInvoiceRow>((invoice) => ({
      id: invoice.id,
      amount: invoice.amount,
      status: invoice.status,
      date: invoice.date,
      hostedInvoiceUrl: invoice.hostedInvoiceUrl,
      invoicePdfUrl: invoice.invoicePdfUrl,
    })),
    canCheckout: IS_STRIPE_CHECKOUT_ENABLED,
    canManageBilling:
      IS_STRIPE_PORTAL_ENABLED && Boolean(tenantRow?.stripeCustomerId),
  };

  return <BillingClient data={data} />;
}
