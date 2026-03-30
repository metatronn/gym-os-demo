import { db } from "@/db";
import { tenants, members } from "@/db/schema";
import { count, eq, gte, desc } from "drizzle-orm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    [totalResult],
    [activeResult],
    [trialingResult],
    [newThisMonthResult],
    recentTenants,
    [memberCountResult],
  ] = await Promise.all([
    db.select({ value: count() }).from(tenants),
    db
      .select({ value: count() })
      .from(tenants)
      .where(eq(tenants.subscriptionStatus, "active")),
    db
      .select({ value: count() })
      .from(tenants)
      .where(eq(tenants.subscriptionStatus, "trialing")),
    db
      .select({ value: count() })
      .from(tenants)
      .where(gte(tenants.createdAt, thirtyDaysAgo)),
    db
      .select({
        id: tenants.id,
        name: tenants.name,
        slug: tenants.slug,
        subscriptionStatus: tenants.subscriptionStatus,
        createdAt: tenants.createdAt,
      })
      .from(tenants)
      .orderBy(desc(tenants.createdAt))
      .limit(10),
    db.select({ value: count() }).from(members),
  ]);

  const totalTenants = totalResult?.value ?? 0;
  const activeSubs = activeResult?.value ?? 0;
  const trialing = trialingResult?.value ?? 0;
  const newThisMonth = newThisMonthResult?.value ?? 0;
  const totalMembers = memberCountResult?.value ?? 0;

  const cards = [
    { label: "Total Tenants", value: totalTenants },
    { label: "Active Subscriptions", value: activeSubs },
    { label: "Trialing", value: trialing },
    { label: "Est. MRR", value: `$${(activeSubs * 99).toLocaleString()}` },
    { label: "New This Month", value: newThisMonth },
    { label: "Total Members", value: totalMembers },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">Platform Overview</h2>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-white/10 bg-[#12121a] p-4"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
              {card.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-white">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Recent tenants table */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Recent Tenants</h3>
          <Link
            href="/admin/tenants"
            className="text-sm text-indigo-400 hover:text-indigo-300"
          >
            View all &rarr;
          </Link>
        </div>
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-[#12121a]">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-400">Name</th>
                <th className="px-4 py-3 font-medium text-gray-400">Slug</th>
                <th className="px-4 py-3 font-medium text-gray-400">Status</th>
                <th className="px-4 py-3 font-medium text-gray-400">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentTenants.map((t) => (
                <tr key={t.id} className="transition-colors hover:bg-white/5">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/tenants/${t.id}`}
                      className="font-medium text-white hover:text-indigo-400"
                    >
                      {t.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{t.slug ?? "—"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={t.subscriptionStatus} />
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {t.createdAt
                      ? new Date(t.createdAt).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
              {recentTenants.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No tenants yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
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
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] ?? "bg-gray-500/10 text-gray-400"}`}
    >
      {status}
    </span>
  );
}
