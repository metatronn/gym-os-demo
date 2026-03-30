import { db } from "@/db";
import { tenants, members } from "@/db/schema";
import { count, desc, eq, ilike, or, sql } from "drizzle-orm";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: { q?: string };
};

export default async function AdminTenantsPage({ searchParams }: Props) {
  const query = searchParams.q?.trim() ?? "";

  const baseQuery = db
    .select({
      id: tenants.id,
      name: tenants.name,
      slug: tenants.slug,
      subscriptionStatus: tenants.subscriptionStatus,
      createdAt: tenants.createdAt,
    })
    .from(tenants)
    .orderBy(desc(tenants.createdAt));

  const allTenants = query
    ? await baseQuery.where(
        or(
          ilike(tenants.name, `%${query}%`),
          ilike(tenants.slug, `%${query}%`),
        ),
      )
    : await baseQuery;

  // Get member counts per tenant in one query
  const memberCounts = await db
    .select({
      tenantId: members.tenantId,
      count: count(),
    })
    .from(members)
    .groupBy(members.tenantId);

  const memberCountMap = new Map(
    memberCounts.map((mc) => [mc.tenantId, mc.count]),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-white">All Tenants</h2>
        <form method="GET" className="flex gap-2">
          <input
            type="text"
            name="q"
            placeholder="Search by name or slug..."
            defaultValue={query}
            className="rounded-lg border border-white/10 bg-[#12121a] px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Search
          </button>
        </form>
      </div>

      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 bg-[#12121a]">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-400">Name</th>
              <th className="px-4 py-3 font-medium text-gray-400">Slug</th>
              <th className="px-4 py-3 font-medium text-gray-400">Status</th>
              <th className="px-4 py-3 font-medium text-gray-400">Members</th>
              <th className="px-4 py-3 font-medium text-gray-400">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {allTenants.map((t) => (
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
                  {memberCountMap.get(t.id) ?? 0}
                </td>
                <td className="px-4 py-3 text-gray-400">
                  {t.createdAt
                    ? new Date(t.createdAt).toLocaleDateString()
                    : "—"}
                </td>
              </tr>
            ))}
            {allTenants.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  {query
                    ? `No tenants matching "${query}".`
                    : "No tenants yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500">
        {allTenants.length} tenant{allTenants.length !== 1 ? "s" : ""}{" "}
        {query ? `matching "${query}"` : "total"}
      </p>
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
