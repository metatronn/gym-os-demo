import { Suspense } from "react";
import { members, leads, payments, classes } from "@/lib/data";
import { buildReportData, type RangeKey } from "@/lib/reporting";
import ReportsClient from "./reports-client";

// Valid range keys for the date selector
const VALID_RANGES = new Set<RangeKey>(["30d", "90d", "6m", "12m", "ytd"]);

function parseRange(raw: string | string[] | undefined): RangeKey {
  if (typeof raw === "string" && VALID_RANGES.has(raw as RangeKey)) {
    return raw as RangeKey;
  }
  return "6m"; // default
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const range = parseRange(params.range);

  // Build all report data server-side.
  // TODO: When the DB layer is ready, replace this with tenant-scoped queries
  // from src/db/queries/reports.ts using tenantDb().
  const data = buildReportData(members, leads, payments, classes, range);

  return (
    <Suspense fallback={<ReportsLoading />}>
      <ReportsClient data={data} />
    </Suspense>
  );
}

function ReportsLoading() {
  return (
    <div className="p-4 lg:p-6 overflow-auto h-full">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gym-text">
            Reports & Analytics
          </h1>
          <p className="text-gym-text-muted text-sm mt-1">Loading...</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="p-3 bg-gym-card border border-gym-border rounded-xl animate-pulse"
          >
            <div className="h-4 w-16 bg-gym-border rounded mb-2" />
            <div className="h-6 w-12 bg-gym-border rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
