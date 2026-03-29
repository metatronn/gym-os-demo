import type { Member, Lead, Payment, ClassSession } from "@/lib/data";

type PaymentLike =
  | Payment
  | {
      amount: number;
      status: string;
      createdAt: Date | string;
      date?: string;
    };

function paymentTimestamp(payment: PaymentLike): Date {
  if ("createdAt" in payment) {
    return new Date(payment.createdAt);
  }

  return new Date(payment.date);
}

function paymentAmountDollars(payment: PaymentLike): number {
  if ("createdAt" in payment) {
    return centsToDollars(payment.amount);
  }

  return payment.amount;
}

// --- Date range helpers ---

export type RangeKey = "30d" | "90d" | "6m" | "12m" | "ytd";

export const RANGE_OPTIONS: { label: string; value: RangeKey }[] = [
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
  { label: "Last 6 months", value: "6m" },
  { label: "Last 12 months", value: "12m" },
  { label: "Year to date", value: "ytd" },
];

export function rangeToDateBounds(
  key: RangeKey,
  now: Date = new Date(),
): { from: Date; to: Date } {
  const to = new Date(now);
  let from: Date;

  switch (key) {
    case "30d":
      from = new Date(now);
      from.setDate(from.getDate() - 30);
      break;
    case "90d":
      from = new Date(now);
      from.setDate(from.getDate() - 90);
      break;
    case "6m":
      from = new Date(now);
      from.setMonth(from.getMonth() - 6);
      break;
    case "12m":
      from = new Date(now);
      from.setMonth(from.getMonth() - 12);
      break;
    case "ytd":
      from = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      from = new Date(now);
      from.setMonth(from.getMonth() - 6);
  }

  return { from, to };
}

// --- Revenue computation ---

export interface MonthlyRevenue {
  month: string; // "Jan 2026"
  monthKey: string; // "2026-01"
  revenue: number;
}

export function centsToDollars(value: number) {
  return value / 100;
}

export function calculatePercentChange(current: number, previous: number) {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return ((current - previous) / previous) * 100;
}

export function calculateMonthlyRevenue(
  payments: PaymentLike[],
  referenceDate: Date = new Date(),
) {
  return payments.reduce((total, payment) => {
    if (payment.status !== "succeeded") {
      return total;
    }

    const date = paymentTimestamp(payment);

    if (
      date.getFullYear() !== referenceDate.getFullYear() ||
      date.getMonth() !== referenceDate.getMonth()
    ) {
      return total;
    }

    return total + paymentAmountDollars(payment);
  }, 0);
}

export function sortClassesByTime<T extends { time: string | null }>(
  classes: T[],
): T[] {
  function parseTime(value: string | null) {
    if (!value) {
      return Number.MAX_SAFE_INTEGER;
    }

    const [rawTime, meridiem] = value.trim().split(/\s+/);
    const [hoursText, minutesText = "0"] = rawTime.split(":");
    let hours = Number(hoursText) % 12;

    if (meridiem?.toUpperCase() === "PM") {
      hours += 12;
    }

    return hours * 60 + Number(minutesText);
  }

  return [...classes].sort(
    (left, right) => parseTime(left.time) - parseTime(right.time),
  );
}

export function buildMonthlyRevenueSeries(
  payments: PaymentLike[],
  monthsBack: number,
): MonthlyRevenue[];
export function buildMonthlyRevenueSeries(
  payments: PaymentLike[],
  from: Date,
  to: Date,
): MonthlyRevenue[];
export function buildMonthlyRevenueSeries(
  payments: PaymentLike[],
  fromOrMonths: Date | number,
  to?: Date,
): MonthlyRevenue[] {
  const toDate =
    typeof fromOrMonths === "number" ? new Date() : new Date(to ?? new Date());
  const fromDate =
    typeof fromOrMonths === "number"
      ? new Date(
          toDate.getFullYear(),
          toDate.getMonth() - Math.max(fromOrMonths - 1, 0),
          1,
        )
      : new Date(fromOrMonths);

  // Generate all months in range
  const months: MonthlyRevenue[] = [];
  const cursor = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1);
  const end = new Date(toDate.getFullYear(), toDate.getMonth(), 1);

  while (cursor <= end) {
    const monthKey = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
    const label = cursor.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
    months.push({ month: label, monthKey, revenue: 0 });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  // Sum succeeded payments into months
  for (const p of payments) {
    if (p.status !== "succeeded") continue;
    const d = paymentTimestamp(p);
    if (d < fromDate || d > toDate) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const bucket = months.find((m) => m.monthKey === key);
    if (bucket) bucket.revenue += paymentAmountDollars(p);
  }

  return months;
}

// --- Member growth ---

export interface MemberGrowthMonth {
  month: string;
  monthKey: string;
  newMembers: number;
  churned: number;
}

export function buildMemberGrowthSeries(
  members: Member[],
  from: Date,
  to: Date,
): MemberGrowthMonth[] {
  const months: MemberGrowthMonth[] = [];
  const cursor = new Date(from.getFullYear(), from.getMonth(), 1);
  const end = new Date(to.getFullYear(), to.getMonth(), 1);

  while (cursor <= end) {
    const monthKey = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
    const label = cursor.toLocaleDateString("en-US", { month: "short" });
    months.push({ month: label, monthKey, newMembers: 0, churned: 0 });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  for (const m of members) {
    const joinDate = new Date(m.joinDate);
    if (joinDate >= from && joinDate <= to) {
      const key = `${joinDate.getFullYear()}-${String(joinDate.getMonth() + 1).padStart(2, "0")}`;
      const bucket = months.find((mo) => mo.monthKey === key);
      if (bucket) bucket.newMembers++;
    }

    // Count cancelled members as churned in the month they were last seen
    if (m.status === "cancelled") {
      const churnDate = new Date(m.lastCheckIn);
      if (churnDate >= from && churnDate <= to) {
        const key = `${churnDate.getFullYear()}-${String(churnDate.getMonth() + 1).padStart(2, "0")}`;
        const bucket = months.find((mo) => mo.monthKey === key);
        if (bucket) bucket.churned++;
      }
    }
  }

  return months;
}

// --- Lead funnel ---

export interface FunnelStage {
  stage: string;
  count: number;
  color: string;
  conversionRate: number | null; // null for first stage
}

const FUNNEL_STAGE_ORDER = ["new", "contacted", "booked", "converted"] as const;
const FUNNEL_STAGE_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  booked: "Tour / Trial Booked",
  converted: "Converted",
};
const FUNNEL_STAGE_COLORS: Record<string, string> = {
  new: "#3B82F6",
  contacted: "#8B5CF6",
  booked: "#F59E0B",
  converted: "#10B981",
};

export function buildLeadFunnel(
  leads: Lead[],
  from: Date,
  to: Date,
): FunnelStage[] {
  // Count leads that reached each stage (cumulative: converted also counts as new, contacted, booked)
  const stageIndex: Record<string, number> = {
    new: 0,
    contacted: 1,
    booked: 2,
    converted: 3,
    lost: -1, // lost leads count at whichever stage they were lost from — we include them in the total
  };

  // Filter leads within date range
  const filtered = leads.filter((l) => {
    const d = new Date(l.createdAt);
    return d >= from && d <= to;
  });

  // Cumulative counts: a lead at stage N has passed through all stages 0..N
  const counts: Record<string, number> = {};
  for (const stage of FUNNEL_STAGE_ORDER) {
    counts[stage] = 0;
  }

  for (const lead of filtered) {
    const idx = stageIndex[lead.status] ?? 0;
    // Count this lead in every stage it has passed through
    for (let i = 0; i < FUNNEL_STAGE_ORDER.length; i++) {
      if (i <= idx || (lead.status === "lost" && i === 0)) {
        // lost leads at minimum reached "new"
        counts[FUNNEL_STAGE_ORDER[i]]++;
      }
    }
  }

  // If there are lost leads, also count them at their estimated stage (for now, assume they reached "contacted")
  for (const lead of filtered) {
    if (lead.status === "lost") {
      // Count lost leads up to "contacted" stage
      if (counts["contacted"] !== undefined) counts["contacted"]++;
    }
  }

  const stages: FunnelStage[] = [];
  let prev: number | null = null;

  for (const stage of FUNNEL_STAGE_ORDER) {
    const count = counts[stage];
    stages.push({
      stage: FUNNEL_STAGE_LABELS[stage],
      count,
      color: FUNNEL_STAGE_COLORS[stage],
      conversionRate:
        prev !== null && prev > 0 ? Math.round((count / prev) * 100) : null,
    });
    prev = count;
  }

  return stages;
}

// --- Lead sources ---

export interface LeadSourceCount {
  source: string;
  count: number;
  color: string;
}

const SOURCE_COLORS: Record<string, string> = {
  Instagram: "#E1306C",
  Google: "#4285F4",
  Referral: "#10B981",
  Facebook: "#1877F2",
  "Walk-in": "#F59E0B",
  Website: "#06B6D4",
};

export function buildLeadSourceCounts(
  leads: Lead[],
  from: Date,
  to: Date,
): LeadSourceCount[] {
  const filtered = leads.filter((l) => {
    const d = new Date(l.createdAt);
    return d >= from && d <= to;
  });

  const counts: Record<string, number> = {};
  for (const l of filtered) {
    counts[l.source] = (counts[l.source] || 0) + 1;
  }

  return Object.entries(counts)
    .map(([source, count]) => ({
      source,
      count,
      color: SOURCE_COLORS[source] || "#94A3B8",
    }))
    .sort((a, b) => b.count - a.count);
}

// --- Class utilization ---

export interface ClassUtilization {
  name: string;
  utilization: number;
  enrolled: number;
  capacity: number;
}

export function buildClassUtilization(
  classes: ClassSession[],
): ClassUtilization[] {
  return classes.map((c) => ({
    name: c.name.length > 15 ? c.name.slice(0, 15) + "..." : c.name,
    utilization:
      c.capacity > 0 ? Math.round((c.enrolled / c.capacity) * 100) : 0,
    enrolled: c.enrolled,
    capacity: c.capacity,
  }));
}

// --- KPI summary ---

export interface ReportKPIs {
  revenue: number;
  revenueChange: number;
  activeMembers: number;
  newLeads: number;
  conversionRate: number;
  churnRate: number;
  avgRisk: number;
}

export function computeKPIs(
  members: Member[],
  leads: Lead[],
  payments: Payment[],
  from: Date,
  to: Date,
): ReportKPIs {
  const succeededPayments = payments.filter((p) => {
    if (p.status !== "succeeded") return false;
    const d = new Date(p.date);
    return d >= from && d <= to;
  });
  const revenue = succeededPayments.reduce((a, p) => a + p.amount, 0);

  // Rough previous-period revenue for comparison
  const periodMs = to.getTime() - from.getTime();
  const prevFrom = new Date(from.getTime() - periodMs);
  const prevTo = new Date(from);
  const prevRevenue = payments
    .filter((p) => {
      if (p.status !== "succeeded") return false;
      const d = new Date(p.date);
      return d >= prevFrom && d < prevTo;
    })
    .reduce((a, p) => a + p.amount, 0);

  const revenueChange =
    prevRevenue > 0
      ? Math.round(((revenue - prevRevenue) / prevRevenue) * 100)
      : 0;

  const activeMembers = members.filter((m) => m.status === "active").length;
  const cancelledMembers = members.filter(
    (m) => m.status === "cancelled",
  ).length;
  const churnRate =
    members.length > 0
      ? Math.round((cancelledMembers / members.length) * 100 * 10) / 10
      : 0;

  const filteredLeads = leads.filter((l) => {
    const d = new Date(l.createdAt);
    return d >= from && d <= to;
  });
  const newLeads = filteredLeads.length;
  const converted = filteredLeads.filter(
    (l) => l.status === "converted",
  ).length;
  const conversionRate =
    filteredLeads.length > 0
      ? Math.round((converted / filteredLeads.length) * 100)
      : 0;

  const avgRisk =
    members.length > 0
      ? Math.round(
          members.reduce((a, m) => a + m.riskScore, 0) / members.length,
        )
      : 0;

  return {
    revenue,
    revenueChange,
    activeMembers,
    newLeads,
    conversionRate,
    churnRate,
    avgRisk,
  };
}

// --- Aggregated report data (ready for DB swap) ---

export interface ReportData {
  kpis: ReportKPIs;
  revenueSeries: MonthlyRevenue[];
  memberGrowth: MemberGrowthMonth[];
  leadFunnel: FunnelStage[];
  leadSources: LeadSourceCount[];
  classUtilization: ClassUtilization[];
  memberPlans: { plan: string; count: number; color: string }[];
  riskDistribution: { level: string; count: number; color: string }[];
  totalMembers: number;
  range: RangeKey;
}

export function buildReportData(
  allMembers: Member[],
  allLeads: Lead[],
  allPayments: Payment[],
  allClasses: ClassSession[],
  range: RangeKey,
): ReportData {
  const { from, to } = rangeToDateBounds(range);

  const kpis = computeKPIs(allMembers, allLeads, allPayments, from, to);
  const revenueSeries = buildMonthlyRevenueSeries(allPayments, from, to);
  const memberGrowth = buildMemberGrowthSeries(allMembers, from, to);
  const leadFunnel = buildLeadFunnel(allLeads, from, to);
  const leadSources = buildLeadSourceCounts(allLeads, from, to);
  const classUtilization = buildClassUtilization(allClasses);

  const memberPlans = [
    {
      plan: "Premium",
      count: allMembers.filter((m) => m.plan === "Premium").length,
      color: "#0350FF",
    },
    {
      plan: "Unlimited",
      count: allMembers.filter((m) => m.plan === "Unlimited").length,
      color: "#06B6D4",
    },
    {
      plan: "Basic",
      count: allMembers.filter((m) => m.plan === "Basic").length,
      color: "#F59E0B",
    },
    {
      plan: "Trial",
      count: allMembers.filter((m) => m.plan === "Trial").length,
      color: "#10B981",
    },
  ];

  const riskDistribution = [
    {
      level: "Low (0-30%)",
      count: allMembers.filter((m) => m.riskScore <= 30).length,
      color: "#10B981",
    },
    {
      level: "Medium (31-50%)",
      count: allMembers.filter((m) => m.riskScore > 30 && m.riskScore <= 50)
        .length,
      color: "#F59E0B",
    },
    {
      level: "High (51-75%)",
      count: allMembers.filter((m) => m.riskScore > 50 && m.riskScore <= 75)
        .length,
      color: "#F97316",
    },
    {
      level: "Critical (76-100%)",
      count: allMembers.filter((m) => m.riskScore > 75).length,
      color: "#EF4444",
    },
  ];

  return {
    kpis,
    revenueSeries,
    memberGrowth,
    leadFunnel,
    leadSources,
    classUtilization,
    memberPlans,
    riskDistribution,
    totalMembers: allMembers.length,
    range,
  };
}
