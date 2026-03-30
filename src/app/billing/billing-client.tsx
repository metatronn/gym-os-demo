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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

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
  {
    icon: React.ReactNode;
    badgeVariant: "success" | "destructive" | "warning" | "default";
  }
> = {
  succeeded: {
    icon: <CheckCircle className="w-4 h-4" />,
    badgeVariant: "success",
  },
  failed: {
    icon: <XCircle className="w-4 h-4" />,
    badgeVariant: "destructive",
  },
  refunded: {
    icon: <RotateCcw className="w-4 h-4" />,
    badgeVariant: "warning",
  },
  pending: {
    icon: <Clock className="w-4 h-4" />,
    badgeVariant: "default",
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
          <h1 className="text-2xl font-bold text-foreground">
            Billing & Payments
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {data.summary.transactionCount} tenant-scoped transactions
          </p>
        </div>
        <Card className="min-w-[260px]">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
              Subscription
            </p>
            <p className="text-sm font-semibold text-foreground">
              {subscription.title}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {subscription.body}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {data.canCheckout ? (
                <Button
                  size="sm"
                  onClick={() => startBillingFlow("checkout")}
                  disabled={isPending}
                >
                  {data.subscription?.isActive
                    ? "Update Plan"
                    : "Start Checkout"}
                </Button>
              ) : null}
              {data.canManageBilling ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startBillingFlow("portal")}
                  disabled={isPending}
                >
                  Manage Billing
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>

      {error ? (
        <div className="mb-6 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-success" />
              <span className="text-xs text-muted-foreground">
                Monthly Revenue
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              ${data.summary.monthlyRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-success mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {data.summary.revenueGrowth >= 0 ? "+" : ""}
              {data.summary.revenueGrowth}% vs last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="text-xs text-muted-foreground">Collected</span>
            </div>
            <p className="text-2xl font-bold text-success">
              ${data.summary.collected.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {
                data.payments.filter(
                  (payment) => payment.status === "succeeded",
                ).length
              }{" "}
              successful payments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <span className="text-xs text-muted-foreground">Failed</span>
            </div>
            <p className="text-2xl font-bold text-destructive">
              ${data.summary.failedTotal.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {data.summary.failedCount} failed payments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-accent" />
              <span className="text-xs text-muted-foreground">
                Avg Transaction
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              ${data.summary.averageTransaction.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              per successful payment
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by member..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-1">
          {(["all", "succeeded", "failed", "pending", "refunded"] as const).map(
            (status) => (
              <Button
                key={status}
                variant={filter === status ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter(status)}
                className="capitalize"
              >
                {status}
              </Button>
            ),
          )}
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs uppercase">Member</TableHead>
              <TableHead className="text-xs uppercase">Amount</TableHead>
              <TableHead className="text-xs uppercase">Status</TableHead>
              <TableHead className="text-xs uppercase">Type</TableHead>
              <TableHead className="text-xs uppercase">Method</TableHead>
              <TableHead className="text-xs uppercase">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  No payments matched this filter.
                </TableCell>
              </TableRow>
            ) : (
              filteredPayments.map((payment) => {
                const config = statusConfig[payment.status];

                return (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium text-foreground">
                      {payment.memberName}
                    </TableCell>
                    <TableCell className="font-bold text-foreground">
                      ${payment.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={config.badgeVariant} className="gap-1.5">
                        {config.icon}
                        <span className="capitalize">{payment.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground capitalize">
                      {payment.type}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {payment.method}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(payment.date)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      <Card className="mt-6">
        <CardHeader className="border-b border-border px-4 py-3">
          <CardTitle className="text-sm">Invoice History</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs uppercase">Invoice</TableHead>
              <TableHead className="text-xs uppercase">Amount</TableHead>
              <TableHead className="text-xs uppercase">Status</TableHead>
              <TableHead className="text-xs uppercase">Date</TableHead>
              <TableHead className="text-xs uppercase">Links</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.invoices.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  No Stripe invoices are available yet.
                </TableCell>
              </TableRow>
            ) : (
              data.invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium text-foreground">
                    {invoice.id}
                  </TableCell>
                  <TableCell className="text-foreground">
                    ${invoice.amount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground capitalize">
                    {invoice.status}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(invoice.date)}
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="flex flex-wrap gap-3">
                      {invoice.hostedInvoiceUrl ? (
                        <a
                          href={invoice.hostedInvoiceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline"
                        >
                          View
                        </a>
                      ) : null}
                      {invoice.invoicePdfUrl ? (
                        <a
                          href={invoice.invoicePdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-muted-foreground hover:underline"
                        >
                          PDF
                        </a>
                      ) : null}
                      {!invoice.hostedInvoiceUrl && !invoice.invoicePdfUrl ? (
                        <span className="text-muted-foreground">
                          Unavailable
                        </span>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
