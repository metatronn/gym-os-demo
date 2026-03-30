import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { tenants, members, leads } from "@/db/schema";
import { count, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

type Props = {
  params: { id: string };
};

export default async function AdminTenantDetailPage({ params }: Props) {
  const [tenant] = await db
    .select()
    .from(tenants)
    .where(eq(tenants.id, params.id))
    .limit(1);

  if (!tenant) {
    notFound();
  }

  const [[memberCountResult], [leadCountResult]] = await Promise.all([
    db
      .select({ value: count() })
      .from(members)
      .where(eq(members.tenantId, tenant.id)),
    db
      .select({ value: count() })
      .from(leads)
      .where(eq(leads.tenantId, tenant.id)),
  ]);

  const memberCount = memberCountResult?.value ?? 0;
  const leadCount = leadCountResult?.value ?? 0;

  const stripeUrl = tenant.stripeCustomerId
    ? `https://dashboard.stripe.com/customers/${tenant.stripeCustomerId}`
    : null;

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/admin/tenants" className="hover:text-white">
          Tenants
        </Link>
        <span>/</span>
        <span className="text-white">{tenant.name}</span>
      </div>

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">{tenant.name}</h2>
        {tenant.slug && (
          <p className="mt-1 text-sm text-gray-400">/{tenant.slug}</p>
        )}
      </div>

      {/* Info grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <InfoCard label="Subscription Status">
          <StatusBadge status={tenant.subscriptionStatus} />
        </InfoCard>

        <InfoCard label="Members">
          <span className="text-2xl font-bold text-white">{memberCount}</span>
        </InfoCard>

        <InfoCard label="Leads">
          <span className="text-2xl font-bold text-white">{leadCount}</span>
        </InfoCard>

        <InfoCard label="Created">
          <span className="text-white">
            {tenant.createdAt
              ? new Date(tenant.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "—"}
          </span>
        </InfoCard>

        <InfoCard label="Trial Ends">
          <span className="text-white">
            {tenant.trialEndsAt
              ? new Date(tenant.trialEndsAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "—"}
          </span>
        </InfoCard>

        <InfoCard label="Stripe Customer">
          {stripeUrl ? (
            <a
              href={stripeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-indigo-400 hover:text-indigo-300"
            >
              {tenant.stripeCustomerId}
            </a>
          ) : (
            <span className="text-sm text-gray-500">Not connected</span>
          )}
        </InfoCard>

        <InfoCard label="Stripe Subscription">
          {tenant.stripeSubscriptionId ? (
            <a
              href={`https://dashboard.stripe.com/subscriptions/${tenant.stripeSubscriptionId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-indigo-400 hover:text-indigo-300"
            >
              {tenant.stripeSubscriptionId}
            </a>
          ) : (
            <span className="text-sm text-gray-500">None</span>
          )}
        </InfoCard>

        <InfoCard label="Tenant ID">
          <code className="text-xs text-gray-400">{tenant.id}</code>
        </InfoCard>
      </div>
    </div>
  );
}

function InfoCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#12121a] p-4">
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
        {label}
      </p>
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-400",
    trialing: "bg-blue-500/10 text-blue-400",
    past_due: "bg-amber-500/10 text-amber-400",
    canceled: "bg-red-500/10 text-red-400",
    unpaid: "bg-red-500/10 text-red-400",
  };

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-sm font-medium ${colors[status] ?? "bg-gray-500/10 text-gray-400"}`}
    >
      {status}
    </span>
  );
}
