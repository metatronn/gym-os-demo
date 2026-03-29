"use client";

import { useMemo, useState, useTransition } from "react";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  RotateCcw,
  Search,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { createCheckoutSession, createPortalSession } from "./actions";

export type BillingPaymentRow = {
  id: string;
  memberName: string;
  amount: number;
  status: "succeeded" | "failed" | "refunded" | "pending";
  type: "subscription" | "one-time";
  method: string;
  date: string;
};

export type BillingInvoiceRow = {
  id: string;
  amount: number;
  status: string;
  date: string;
  hostedInvoiceUrl: string | null;
  invoicePdfUrl: string | null;
};

export type BillingSubscriptionRow = {
  subscriptionStatus: string;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  isActive: boolean;
  isTrialExpired: boolean;
} | null;

type BillingClientData = {
  summary: {
    monthlyRevenue: number;
    revenueGrowth: number;
    collected: number;
    failedTotal: number;
    failedCount: number;
    averageTransaction: number;
    transactionCount: number;
  };
  subscription: BillingSubscriptionRow;
  payments: BillingPaymentRow[];
  invoices: BillingInvoiceRow[];
  canCheckout: boolean;
  canManageBilling: boolean;
};

const statusConfig: Record<
  BillingPaymentRow["status"],
  { icon: React.ReactNode; color: string; bg: string }
> = {
  succeeded: {
    icon: <CheckCircle className="w-4 h-4" />,
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  failed: {
    icon: <XCircle className="w-4 h-4" />,
    color: "text-red-400",
    bg: "bg-red-500/10",
  },
  refunded: {
    icon: <RotateCcw className="w-4 h-4" />,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
  pending: {
    icon: <Clock className="w-4 h-4" />,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function subscriptionCopy(subscription: BillingSubscriptionRow) {
  if (!subscription) {
    return {
      title: "Billing not connected",
      body: "Configure Stripe to manage subscriptions and customer billing.",
    };
  }

  if (
    subscription.subscriptionStatus === "trialing" &&
    subscription.trialEndsAt
  ) {
    return {
      title: "Trial active",
      body: `Free trial ends ${formatDate(subscription.trialEndsAt)}.`,
    };
  }

  if (subscription.isActive) {
    return {
      title: "Subscription active",
      body: subscription.currentPeriodEnd
        ? `Next billing date: ${formatDate(subscription.currentPeriodEnd)}.`
        : "Billing is in good standing for this tenant.",
    };
  }

  if (subscription.isTrialExpired) {
    return {
      title: "Trial expired",
      body: "Upgrade to restore full billing access for this tenant.",
    };
  }

  return {
    title: "Billing needs attention",
    body: `Current subscription status: ${subscription.subscriptionStatus}.`,
  };
}

export default function BillingClient({ data }: { data: BillingClientData }) {
  const [filter, setFilter] = useState<"all" | BillingPaymentRow["status"]>(
    "all",
  );
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredPayments = useMemo(() => {
    return data.payments.filter((payment) => {
      const matchFilter = filter === "all" || payment.status === filter;
      const matchSearch = payment.memberName
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchFilter && matchSearch;
    });
  }, [data.payments, filter, search]);

  const subscription = subscriptionCopy(data.subscription);

  function startBillingFlow(kind: "checkout" | "portal") {
    setError(null);

    startTransition(async () => {
      const result =
        kind === "checkout"
          ? await createCheckoutSession()
          : await createPortalSession();

      if (!result.url) {
        setError(result.error ?? "We couldn't start the billing flow.");
        return;
      }

      window.location.assign(result.url);
    });
  }

  return (
    <div className="p-4 lg:p-6 overflow-auto h-full">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gym-text">
            Billing & Payments
          </h1>
          <p className="text-gym-text-muted text-sm mt-1">
            {data.summary.transactionCount} tenant-scoped transactions
          </p>
        </div>
        <div className="min-w-[260px] rounded-xl border border-gym-border bg-gym-card p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-gym-text-muted mb-2">
            Subscription
          </p>
          <p className="text-sm font-semibold text-gym-text">
            {subscription.title}
          </p>
          <p className="text-xs text-gym-text-secondary mt-1">
            {subscription.body}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {data.canCheckout ? (
              <button
                onClick={() => startBillingFlow("checkout")}
                disabled={isPending}
                className="rounded-lg bg-gym-primary px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-gym-primary/85 disabled:opacity-50"
              >
                {data.subscription?.isActive ? "Update Plan" : "Start Checkout"}
              </button>
            ) : null}
            {data.canManageBilling ? (
              <button
                onClick={() => startBillingFlow("portal")}
                disabled={isPending}
                className="rounded-lg border border-gym-border bg-gym-bg px-3 py-2 text-xs font-medium text-gym-text transition-colors hover:bg-gym-border disabled:opacity-50"
              >
                Manage Billing
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {error ? (
        <div className="mb-6 rounded-xl border border-gym-danger/20 bg-gym-danger/10 px-4 py-3 text-sm text-gym-danger">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        <div className="p-4 bg-gym-card border border-gym-border rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gym-text-muted">Monthly Revenue</span>
          </div>
          <p className="text-2xl font-bold text-gym-text">
            ${data.summary.monthlyRevenue.toLocaleString()}
          </p>
          <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {data.summary.revenueGrowth >= 0 ? "+" : ""}
            {data.summary.revenueGrowth}% vs last month
          </p>
        </div>
        <div className="p-4 bg-gym-card border border-gym-border rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gym-text-muted">Collected</span>
          </div>
          <p className="text-2xl font-bold text-green-400">
            ${data.summary.collected.toLocaleString()}
          </p>
          <p className="text-xs text-gym-text-muted mt-1">
            {
              data.payments.filter((payment) => payment.status === "succeeded")
                .length
            }{" "}
            successful payments
          </p>
        </div>
        <div className="p-4 bg-gym-card border border-gym-border rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-xs text-gym-text-muted">Failed</span>
          </div>
          <p className="text-2xl font-bold text-red-400">
            ${data.summary.failedTotal.toLocaleString()}
          </p>
          <p className="text-xs text-gym-text-muted mt-1">
            {data.summary.failedCount} failed payments
          </p>
        </div>
        <div className="p-4 bg-gym-card border border-gym-border rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-4 h-4 text-gym-accent" />
            <span className="text-xs text-gym-text-muted">Avg Transaction</span>
          </div>
          <p className="text-2xl font-bold text-gym-text">
            ${data.summary.averageTransaction.toLocaleString()}
          </p>
          <p className="text-xs text-gym-text-muted mt-1">
            per successful payment
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gym-text-muted" />
          <input
            type="text"
            placeholder="Search by member..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gym-card border border-gym-border rounded-lg text-gym-text text-sm placeholder:text-gym-text-muted focus:outline-none focus:border-gym-primary"
          />
        </div>
        <div className="flex bg-gym-card border border-gym-border rounded-lg overflow-hidden">
          {(["all", "succeeded", "failed", "pending", "refunded"] as const).map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-2 text-xs font-medium capitalize ${
                  filter === status
                    ? "bg-gym-primary text-white"
                    : "text-gym-text-secondary hover:text-gym-text"
                }`}
              >
                {status}
              </button>
            ),
          )}
        </div>
      </div>

      <div className="bg-gym-card border border-gym-border rounded-xl overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-gym-border">
              <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">
                Member
              </th>
              <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">
                Amount
              </th>
              <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">
                Status
              </th>
              <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">
                Type
              </th>
              <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">
                Method
              </th>
              <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-sm text-gym-text-muted"
                >
                  No payments matched this filter.
                </td>
              </tr>
            ) : (
              filteredPayments.map((payment) => {
                const config = statusConfig[payment.status];

                return (
                  <tr
                    key={payment.id}
                    className="border-b border-gym-border/50 hover:bg-gym-bg/50 transition-colors"
                  >
                    <td className="p-3 text-sm font-medium text-gym-text">
                      {payment.memberName}
                    </td>
                    <td className="p-3 text-sm font-bold text-gym-text">
                      ${payment.amount.toFixed(2)}
                    </td>
                    <td className="p-3">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${config.color} ${config.bg}`}
                      >
                        {config.icon}
                        <span className="capitalize">{payment.status}</span>
                      </div>
                    </td>
                    <td className="p-3 text-xs text-gym-text-secondary capitalize">
                      {payment.type}
                    </td>
                    <td className="p-3 text-xs text-gym-text-muted">
                      {payment.method}
                    </td>
                    <td className="p-3 text-xs text-gym-text-muted">
                      {formatDate(payment.date)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 bg-gym-card border border-gym-border rounded-xl overflow-x-auto">
        <div className="border-b border-gym-border px-4 py-3">
          <h2 className="text-sm font-semibold text-gym-text">
            Invoice History
          </h2>
        </div>
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-gym-border">
              <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">
                Invoice
              </th>
              <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">
                Amount
              </th>
              <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">
                Status
              </th>
              <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">
                Date
              </th>
              <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">
                Links
              </th>
            </tr>
          </thead>
          <tbody>
            {data.invoices.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-8 text-center text-sm text-gym-text-muted"
                >
                  No Stripe invoices are available yet.
                </td>
              </tr>
            ) : (
              data.invoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="border-b border-gym-border/50 hover:bg-gym-bg/50 transition-colors"
                >
                  <td className="p-3 text-sm font-medium text-gym-text">
                    {invoice.id}
                  </td>
                  <td className="p-3 text-sm text-gym-text">
                    ${invoice.amount.toFixed(2)}
                  </td>
                  <td className="p-3 text-xs text-gym-text-secondary capitalize">
                    {invoice.status}
                  </td>
                  <td className="p-3 text-xs text-gym-text-muted">
                    {formatDate(invoice.date)}
                  </td>
                  <td className="p-3 text-xs">
                    <div className="flex flex-wrap gap-3">
                      {invoice.hostedInvoiceUrl ? (
                        <a
                          href={invoice.hostedInvoiceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-gym-primary hover:underline"
                        >
                          View
                        </a>
                      ) : null}
                      {invoice.invoicePdfUrl ? (
                        <a
                          href={invoice.invoicePdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-gym-text-secondary hover:underline"
                        >
                          PDF
                        </a>
                      ) : null}
                      {!invoice.hostedInvoiceUrl && !invoice.invoicePdfUrl ? (
                        <span className="text-gym-text-muted">Unavailable</span>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
