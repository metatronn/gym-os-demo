import { getReportData } from "@/db/queries/reports";
import { resolveReportDateRange, type RangeKey } from "@/lib/reporting";
import ReportsClient from "./reports-client";

export const dynamic = "force-dynamic";

const VALID_RANGES = new Set<RangeKey>(["30d", "90d", "6m", "12m", "custom"]);

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseRange(raw: string | undefined): RangeKey {
  if (raw && VALID_RANGES.has(raw as RangeKey)) {
    return raw as RangeKey;
  }

  return "6m";
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const range = resolveReportDateRange({
    key: parseRange(firstParam(params.range)),
    from: firstParam(params.from),
    to: firstParam(params.to),
  });
  const data = await getReportData(range);

  return <ReportsClient data={data} />;
}
