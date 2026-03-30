type DateLike = Date | string | null | undefined;

export type RangeKey = "30d" | "90d" | "6m" | "12m" | "custom";

export const RANGE_OPTIONS: { label: string; value: RangeKey }[] = [
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
  { label: "Last 6 months", value: "6m" },
  { label: "Last 12 months", value: "12m" },
  { label: "Custom range", value: "custom" },
];

export type ReportDateRange = {
  key: RangeKey;
  from: Date;
  to: Date;
};

export type PaymentLike = {
  amount: number;
  status: string;
  createdAt?: Date | string;
  date?: Date | string;
};

export type MemberLike = {
  id: string;
  name: string;
  plan: string;
  status: string;
  riskScore: number;
  riskLevel: string;
  monthlyVisits: number;
  billingStatus: string;
  joinDate: Date | string;
  lastCheckIn: DateLike;
};

export type LeadLike = {
  status: string;
  source: string | null;
  createdAt: Date | string;
};

export type ClassLike = {
  name: string;
  capacity: number | null;
  enrolled: number;
  time: string | null;
};

export interface MonthlyRevenue {
  month: string;
  monthKey: string;
  revenue: number;
}

export interface MemberGrowthMonth {
  month: string;
  monthKey: string;
  newMembers: number;
  churned: number;
}

export interface FunnelStage {
  stage: string;
  count: number;
  color: string;
  conversionRate: number | null;
}

export interface ClassUtilization {
  name: string;
  utilization: number;
  enrolled: number;
  capacity: number;
}

export interface ReportKPIs {
  revenue: number;
  revenueChange: number;
  activeMembers: number;
  newLeads: number;
  conversionRate: number;
  churnRate: number;
  avgRisk: number;
}

export interface RetentionCurve {
  cohort: string;
  points: Array<{
    period: string;
    retention: number;
  }>;
}

export interface TopRiskMember {
  id: string;
  name: string;
  plan: string;
  riskScore: number;
  riskLevel: string;
  billingStatus: string;
  monthlyVisits: number;
  lastCheckIn: string | null;
}

export interface ReportData {
  range: {
    key: RangeKey;
    from: string;
    to: string;
  };
  kpis: ReportKPIs;
  revenueSeries: MonthlyRevenue[];
  memberGrowth: MemberGrowthMonth[];
  leadFunnel: FunnelStage[];
  classUtilization: ClassUtilization[];
  retentionCurves: RetentionCurve[];
  topRiskMembers: TopRiskMember[];
}

function toDate(value: DateLike): Date | null {
  return value ? new Date(value) : null;
}

function toMonthKey(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
}

function toMonthLabel(value: Date, includeYear = false) {
  return value.toLocaleDateString("en-US", {
    month: "short",
    ...(includeYear ? { year: "numeric" } : {}),
  });
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

export function resolveReportDateRange(input: {
  key: RangeKey;
  from?: string | null;
  to?: string | null;
  now?: Date;
}): ReportDateRange {
  const now = input.now ?? new Date();
  const to = input.to ? new Date(input.to) : new Date(now);

  if (input.key === "custom") {
    const from = input.from ? new Date(input.from) : new Date(to);

    if (
      Number.isNaN(from.getTime()) ||
      Number.isNaN(to.getTime()) ||
      from > to
    ) {
      const fallbackFrom = new Date(now);
      fallbackFrom.setMonth(fallbackFrom.getMonth() - 6);
      return {
        key: "6m",
        from: fallbackFrom,
        to: now,
      };
    }

    return {
      key: "custom",
      from,
      to,
    };
  }

  const from = new Date(to);

  switch (input.key) {
    case "30d":
      from.setDate(from.getDate() - 30);
      break;
    case "90d":
      from.setDate(from.getDate() - 90);
      break;
    case "12m":
      from.setMonth(from.getMonth() - 12);
      break;
    case "6m":
    default:
      from.setMonth(from.getMonth() - 6);
      break;
  }

  return {
    key: input.key,
    from,
    to,
  };
}

export function calculateMonthlyRevenue(
  payments: PaymentLike[],
  referenceDate: Date = new Date(),
) {
  return payments.reduce((total, payment) => {
    if (payment.status !== "succeeded") {
      return total;
    }

    const date = toDate(payment.createdAt ?? payment.date);

    if (
      !date ||
      date.getFullYear() !== referenceDate.getFullYear() ||
      date.getMonth() !== referenceDate.getMonth()
    ) {
      return total;
    }

    return total + centsToDollars(payment.amount);
  }, 0);
}

export function buildMonthlyRevenueSeries(
  payments: PaymentLike[],
  monthsBack: number,
  referenceDate?: Date,
): MonthlyRevenue[];
export function buildMonthlyRevenueSeries(
  payments: PaymentLike[],
  from: Date,
  to: Date,
): MonthlyRevenue[];
export function buildMonthlyRevenueSeries(
  payments: PaymentLike[],
  fromOrMonthsBack: Date | number,
  toOrReferenceDate?: Date,
): MonthlyRevenue[] {
  let from: Date;
  let to: Date;

  if (typeof fromOrMonthsBack === "number") {
    const monthsBack = Math.max(fromOrMonthsBack, 1);
    const referenceDate = toOrReferenceDate ?? new Date();
    to = new Date(referenceDate);
    from = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
    from.setMonth(from.getMonth() - (monthsBack - 1));
  } else {
    from = fromOrMonthsBack;
    to = toOrReferenceDate ?? new Date();
  }

  const months: MonthlyRevenue[] = [];
  const cursor = new Date(from.getFullYear(), from.getMonth(), 1);
  const end = new Date(to.getFullYear(), to.getMonth(), 1);

  while (cursor <= end) {
    const monthKey = toMonthKey(cursor);
    months.push({
      month: toMonthLabel(cursor, true),
      monthKey,
      revenue: 0,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  for (const payment of payments) {
    if (payment.status !== "succeeded") {
      continue;
    }

    const date = toDate(payment.createdAt ?? payment.date);

    if (!date || date < from || date > to) {
      continue;
    }

    const bucket = months.find((month) => month.monthKey === toMonthKey(date));

    if (bucket) {
      bucket.revenue += centsToDollars(payment.amount);
    }
  }

  return months;
}

function parseClassTime(value: string | null) {
  if (!value) {
    return Number.POSITIVE_INFINITY;
  }

  const parsed = Date.parse(`1970-01-01 ${value}`);
  return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed;
}

export function sortClassesByTime<T extends { time: string | null }>(
  rows: T[],
) {
  return [...rows].sort(
    (left, right) => parseClassTime(left.time) - parseClassTime(right.time),
  );
}

export function buildMemberGrowthSeries(
  members: MemberLike[],
  from: Date,
  to: Date,
): MemberGrowthMonth[] {
  const months: MemberGrowthMonth[] = [];
  const cursor = new Date(from.getFullYear(), from.getMonth(), 1);
  const end = new Date(to.getFullYear(), to.getMonth(), 1);

  while (cursor <= end) {
    const monthKey = toMonthKey(cursor);
    months.push({
      month: toMonthLabel(cursor),
      monthKey,
      newMembers: 0,
      churned: 0,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  for (const member of members) {
    const joinDate = toDate(member.joinDate);

    if (joinDate && joinDate >= from && joinDate <= to) {
      const bucket = months.find(
        (month) => month.monthKey === toMonthKey(joinDate),
      );
      if (bucket) {
        bucket.newMembers += 1;
      }
    }

    if (member.status === "cancelled") {
      const churnDate = toDate(member.lastCheckIn);
      if (churnDate && churnDate >= from && churnDate <= to) {
        const bucket = months.find(
          (month) => month.monthKey === toMonthKey(churnDate),
        );
        if (bucket) {
          bucket.churned += 1;
        }
      }
    }
  }

  return months;
}

const FUNNEL_STAGES = [
  { key: "new", label: "New", color: "#3B82F6" },
  { key: "contacted", label: "Contacted", color: "#8B5CF6" },
  { key: "booked", label: "Tour / Trial Booked", color: "#F59E0B" },
  { key: "converted", label: "Converted", color: "#10B981" },
] as const;

export function buildLeadFunnel(
  leads: LeadLike[],
  from: Date,
  to: Date,
): FunnelStage[] {
  const filtered = leads.filter((lead) => {
    const createdAt = toDate(lead.createdAt);
    return Boolean(createdAt && createdAt >= from && createdAt <= to);
  });

  const stageDepth: Record<string, number> = {
    new: 0,
    contacted: 1,
    booked: 2,
    converted: 3,
    lost: 1,
  };

  const counts = Object.fromEntries(
    FUNNEL_STAGES.map((stage) => [stage.key, 0]),
  ) as Record<(typeof FUNNEL_STAGES)[number]["key"], number>;

  for (const lead of filtered) {
    const depth = stageDepth[lead.status] ?? 0;

    FUNNEL_STAGES.forEach((stage, index) => {
      if (index <= depth) {
        counts[stage.key] += 1;
      }
    });
  }

  let previous: number | null = null;

  return FUNNEL_STAGES.map((stage) => {
    const count = counts[stage.key];
    const conversionRate =
      previous !== null && previous > 0
        ? Math.round((count / previous) * 100)
        : null;
    previous = count;

    return {
      stage: stage.label,
      count,
      color: stage.color,
      conversionRate,
    };
  });
}

export function buildClassUtilization(
  classes: ClassLike[],
): ClassUtilization[] {
  return classes
    .map((classSession) => ({
      name:
        classSession.name.length > 18
          ? `${classSession.name.slice(0, 18)}...`
          : classSession.name,
      utilization:
        classSession.capacity && classSession.capacity > 0
          ? Math.round((classSession.enrolled / classSession.capacity) * 100)
          : 0,
      enrolled: classSession.enrolled,
      capacity: classSession.capacity ?? 0,
    }))
    .sort((left, right) => right.utilization - left.utilization);
}

export function computeKPIs(
  members: MemberLike[],
  leads: LeadLike[],
  payments: PaymentLike[],
  range: ReportDateRange,
): ReportKPIs {
  const succeededInRange = payments.filter((payment) => {
    const createdAt = toDate(payment.createdAt ?? payment.date);
    return Boolean(
      payment.status === "succeeded" &&
      createdAt &&
      createdAt >= range.from &&
      createdAt <= range.to,
    );
  });

  const revenue = succeededInRange.reduce(
    (total, payment) => total + centsToDollars(payment.amount),
    0,
  );

  const periodMs = range.to.getTime() - range.from.getTime();
  const previousRange = {
    from: new Date(range.from.getTime() - periodMs),
    to: new Date(range.to.getTime() - periodMs),
  };

  const previousRevenue = payments
    .filter((payment) => {
      const createdAt = toDate(payment.createdAt ?? payment.date);
      return Boolean(
        payment.status === "succeeded" &&
        createdAt &&
        createdAt >= previousRange.from &&
        createdAt <= previousRange.to,
      );
    })
    .reduce((total, payment) => total + centsToDollars(payment.amount), 0);

  const revenueChange = Math.round(
    calculatePercentChange(revenue, previousRevenue),
  );
  const activeMembers = members.filter(
    (member) => member.status === "active",
  ).length;
  const cancelledMembers = members.filter(
    (member) => member.status === "cancelled",
  ).length;
  const churnRate =
    members.length > 0
      ? Math.round((cancelledMembers / members.length) * 1000) / 10
      : 0;

  const leadsInRange = leads.filter((lead) => {
    const createdAt = toDate(lead.createdAt);
    return Boolean(
      createdAt && createdAt >= range.from && createdAt <= range.to,
    );
  });

  const newLeads = leadsInRange.length;
  const convertedLeads = leadsInRange.filter(
    (lead) => lead.status === "converted",
  ).length;
  const conversionRate =
    newLeads > 0 ? Math.round((convertedLeads / newLeads) * 100) : 0;
  const avgRisk =
    members.length > 0
      ? Math.round(
          members.reduce((total, member) => total + member.riskScore, 0) /
            members.length,
        )
      : 0;

  return {
    revenue: Number(revenue.toFixed(2)),
    revenueChange,
    activeMembers,
    newLeads,
    conversionRate,
    churnRate,
    avgRisk,
  };
}

function addMonths(value: Date, months: number) {
  const next = new Date(value);
  next.setMonth(next.getMonth() + months);
  return next;
}

export function buildRetentionCurves(
  members: MemberLike[],
  now: Date,
): RetentionCurve[] {
  const periods = [
    { months: 1, label: "1M" },
    { months: 3, label: "3M" },
    { months: 6, label: "6M" },
    { months: 12, label: "12M" },
  ] as const;

  const cohorts = new Map<string, MemberLike[]>();

  for (const member of members) {
    const joinDate = toDate(member.joinDate);
    if (!joinDate) {
      continue;
    }

    const cohortKey = `${joinDate.getFullYear()} Q${Math.floor(joinDate.getMonth() / 3) + 1}`;
    const existing = cohorts.get(cohortKey) ?? [];
    existing.push(member);
    cohorts.set(cohortKey, existing);
  }

  return Array.from(cohorts.entries())
    .sort((left, right) => left[0].localeCompare(right[0]))
    .slice(-4)
    .map(([cohort, cohortMembers]) => ({
      cohort,
      points: periods.map((period) => {
        const eligible = cohortMembers.filter((member: MemberLike) => {
          const joinDate = toDate(member.joinDate);
          return Boolean(joinDate && addMonths(joinDate, period.months) <= now);
        });

        if (eligible.length === 0) {
          return {
            period: period.label,
            retention: 0,
          };
        }

        const retained = eligible.filter((member: MemberLike) => {
          if (member.status !== "cancelled") {
            return true;
          }

          const joinDate = toDate(member.joinDate);
          const lastSeen = toDate(member.lastCheckIn);

          return Boolean(
            joinDate &&
            lastSeen &&
            lastSeen >= addMonths(joinDate, period.months),
          );
        });

        return {
          period: period.label,
          retention: Math.round((retained.length / eligible.length) * 100),
        };
      }),
    }));
}
