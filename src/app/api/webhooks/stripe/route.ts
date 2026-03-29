import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { stripe, isStripeEnabled } from "@/lib/stripe";
import { STRIPE_WEBHOOK_SECRET } from "@/lib/env";
import { inngest } from "@/lib/inngest";
import { db } from "@/db";
import { tenants, payments } from "@/db/schema";
import type { SubscriptionStatus } from "@/lib/subscription";

export const dynamic = "force-dynamic";

// ── Stripe status -> our subscription_status enum ──

const STRIPE_STATUS_MAP: Record<string, SubscriptionStatus> = {
  active: "active",
  trialing: "trialing",
  past_due: "past_due",
  canceled: "canceled",
  unpaid: "unpaid",
  incomplete: "unpaid",
  incomplete_expired: "canceled",
  paused: "canceled",
};

function mapStripeStatus(stripeStatus: string): SubscriptionStatus {
  return STRIPE_STATUS_MAP[stripeStatus] ?? "unpaid";
}

// ── Tenant lookup by Stripe customer ID ──

async function findTenantByCustomerId(customerId: string) {
  const [tenant] = await db
    .select({ id: tenants.id })
    .from(tenants)
    .where(eq(tenants.stripeCustomerId, customerId));
  return tenant ?? null;
}

// ── Helpers ──

/**
 * Extract the PaymentIntent ID from an invoice.
 * In Stripe v21+ `payment_intent` is no longer a top-level field on Invoice.
 * It lives under `invoice.payments.data[].payment.payment_intent`.
 */
function extractPaymentIntentId(invoice: Stripe.Invoice): string | null {
  const firstPayment = invoice.payments?.data?.[0];
  if (!firstPayment) return null;

  const pi = firstPayment.payment?.payment_intent;
  if (!pi) return null;

  return typeof pi === "string" ? pi : pi.id;
}

function extractCustomerId(invoice: Stripe.Invoice): string | null {
  if (!invoice.customer) return null;
  return typeof invoice.customer === "string"
    ? invoice.customer
    : invoice.customer.id;
}

// ── Event handlers ──

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const tenantId = session.metadata?.tenantId;
  if (!tenantId) {
    console.warn(
      "Stripe webhook: checkout.session.completed missing tenantId in metadata",
    );
    return;
  }

  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : (session.customer?.id ?? null);

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : (session.subscription?.id ?? null);

  await db
    .update(tenants)
    .set({
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, tenantId));
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  // Try metadata first, fall back to customer ID lookup
  let tenantId = subscription.metadata?.tenantId;

  if (!tenantId) {
    const customerId =
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id;
    const tenant = await findTenantByCustomerId(customerId);
    tenantId = tenant?.id;
  }

  if (!tenantId) {
    console.warn(
      "Stripe webhook: subscription change — could not resolve tenantId",
    );
    return;
  }

  await db
    .update(tenants)
    .set({
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: mapStripeStatus(subscription.status),
      trialEndsAt: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, tenantId));
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  let tenantId = subscription.metadata?.tenantId;

  if (!tenantId) {
    const customerId =
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id;
    const tenant = await findTenantByCustomerId(customerId);
    tenantId = tenant?.id;
  }

  if (!tenantId) {
    console.warn(
      "Stripe webhook: subscription deleted — could not resolve tenantId",
    );
    return;
  }

  await db
    .update(tenants)
    .set({
      subscriptionStatus: "canceled",
      stripeSubscriptionId: null,
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, tenantId));
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const customerId = extractCustomerId(invoice);

  if (!customerId) {
    console.warn("Stripe webhook: invoice.paid missing customer");
    return;
  }

  const tenant = await findTenantByCustomerId(customerId);
  if (!tenant) {
    console.warn(
      "Stripe webhook: invoice.paid — no tenant for customer",
      customerId,
    );
    return;
  }

  const paymentIntentId = extractPaymentIntentId(invoice);

  // Use the Stripe invoice ID as our payment record ID for idempotency
  const paymentId = `pay_${invoice.id}`;

  await db
    .insert(payments)
    .values({
      id: paymentId,
      tenantId: tenant.id,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: "succeeded",
      type: "subscription",
      stripePaymentIntentId: paymentIntentId,
      method: "stripe",
      createdAt: new Date(),
    })
    .onConflictDoUpdate({
      target: payments.id,
      set: {
        status: "succeeded",
        amount: invoice.amount_paid,
      },
    });

  // Notify via Slack (async, non-blocking)
  await inngest.send({
    name: "notification/slack",
    data: {
      tenantId: tenant.id,
      templateName: "paymentReceived",
      templateData: {
        memberName: invoice.customer_name ?? "Customer",
        amount: invoice.amount_paid,
      },
    },
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = extractCustomerId(invoice);

  if (!customerId) {
    console.warn("Stripe webhook: invoice.payment_failed missing customer");
    return;
  }

  const tenant = await findTenantByCustomerId(customerId);
  if (!tenant) {
    console.warn(
      "Stripe webhook: invoice.payment_failed — no tenant for customer",
      customerId,
    );
    return;
  }

  const paymentIntentId = extractPaymentIntentId(invoice);

  const paymentId = `pay_${invoice.id}`;

  // Record the failed payment
  await db
    .insert(payments)
    .values({
      id: paymentId,
      tenantId: tenant.id,
      amount: invoice.amount_due,
      currency: invoice.currency,
      status: "failed",
      type: "subscription",
      stripePaymentIntentId: paymentIntentId,
      method: "stripe",
      createdAt: new Date(),
    })
    .onConflictDoUpdate({
      target: payments.id,
      set: {
        status: "failed",
        amount: invoice.amount_due,
      },
    });

  // Mark tenant as past_due
  await db
    .update(tenants)
    .set({
      subscriptionStatus: "past_due",
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, tenant.id));

  // Fire async dunning sequence via Inngest
  await inngest.send({
    name: "billing/payment-failed",
    data: {
      tenantId: tenant.id,
      invoiceId: invoice.id,
    },
  });
}

// ── POST handler ──

export async function POST(request: Request) {
  if (!isStripeEnabled || !STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Stripe is not configured." },
      { status: 501 },
    );
  }

  const body = await request.text();
  const headersList = headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header." },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  console.log(`Stripe webhook: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutComplete(
          event.data.object as Stripe.Checkout.Session,
        );
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionChange(
          event.data.object as Stripe.Subscription,
        );
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
        );
        break;

      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Stripe webhook: unhandled event type ${event.type}`);
    }
  } catch (err) {
    console.error(`Stripe webhook: error handling ${event.type}:`, err);
    return NextResponse.json(
      { error: "Stripe webhook handling failed." },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
