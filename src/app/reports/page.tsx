import ReportsClient, { type ReportsClientData } from "./reports-client";
import { tenantDb } from "@/db/tenant";
import { classes, leads, members, payments } from "@/db/schema";
import {
  buildMonthlyRevenueSeries,
  calculateMonthlyRevenue,
  calculatePercentChange,
} from "@/lib/reporting";

export const dynamic = "force-dynamic";

function formatPercent(value: number) {
  return Number(value.toFixed(1));
}

export default async function ReportsPage() {
  const { db, tenantFilter } = await tenantDb();
  const previousMonth = new Date();
  previousMonth.setMonth(previousMonth.getMonth() - 1);

  const [memberRows, leadRows, paymentRows, classRows] = await Promise.all([
    db.select().from(members).where(tenantFilter(members)),
    db.select().from(leads).where(tenantFilter(leads)),
    db.select().from(payments).where(tenantFilter(payments)),
    db.select().from(classes).where(tenantFilter(classes)),
  ]);

  const monthlyRevenue = calculateMonthlyRevenue(paymentRows);
  const previousMonthRevenue = calculateMonthlyRevenue(
    paymentRows,
    previousMonth,
  );
  const revenueGrowth = formatPercent(
    calculatePercentChange(monthlyRevenue, previousMonthRevenue),
  );
  const activeMembers = memberRows.filter(
    (member) => member.status === "active",
  ).length;
  const avgRisk = memberRows.length
    ? Math.round(
        memberRows.reduce((total, member) => total + member.riskScore, 0) /
          memberRows.length,
      )
    : 0;
  const conversionRate = leadRows.length
    ? Math.round(
        (leadRows.filter((lead) => lead.status === "converted").length /
          leadRows.length) *
          100,
      )
    : 0;
  const churnRate = formatPercent(
    memberRows.length === 0
      ? 0
      : (memberRows.filter((member) => member.status === "cancelled").length /
          memberRows.length) *
          100,
  );

  const leadSourceColors: Record<string, string> = {
    Instagram: "#E1306C",
    Google: "#4285F4",
    Referral: "#10B981",
    Facebook: "#1877F2",
    "Walk-in": "#F59E0B",
    Website: "#06B6D4",
  };

  const data: ReportsClientData = {
    metrics: {
      monthlyRevenue: Number(monthlyRevenue.toFixed(2)),
      revenueGrowth,
      activeMembers,
      newLeads: leadRows.filter((lead) => lead.status === "new").length,
      conversionRate,
      churnRate,
      avgRisk,
    },
    revenueData: buildMonthlyRevenueSeries(paymentRows, 7).map(
      (point, index) => ({
        ...point,
        members: Math.max(activeMembers - (6 - index), 0),
      }),
    ),
    classUtilData: classRows.map((cls) => ({
      name: cls.name.length > 15 ? `${cls.name.slice(0, 15)}...` : cls.name,
      utilization:
        !cls.capacity || cls.capacity === 0
          ? 0
          : Math.round((cls.enrolled / cls.capacity) * 100),
    })),
    leadSourceData: Object.entries(
      leadRows.reduce<Record<string, number>>((totals, lead) => {
        const source = lead.source ?? "Website";
        totals[source] = (totals[source] ?? 0) + 1;
        return totals;
      }, {}),
    ).map(([source, count]) => ({
      source,
      count,
      color: leadSourceColors[source] ?? "#64748B",
    })),
    memberPlanData: ["Premium", "Unlimited", "Basic", "Trial"].map((plan) => ({
      plan,
      count: memberRows.filter((member) => member.plan === plan).length,
      color:
        {
          Premium: "#0350FF",
          Unlimited: "#06B6D4",
          Basic: "#F59E0B",
          Trial: "#10B981",
        }[plan] ?? "#64748B",
    })),
    riskDistribution: [
      {
        level: "Low (0-30%)",
        count: memberRows.filter((member) => member.riskScore <= 30).length,
        color: "#10B981",
      },
      {
        level: "Medium (31-50%)",
        count: memberRows.filter(
          (member) => member.riskScore > 30 && member.riskScore <= 50,
        ).length,
        color: "#F59E0B",
      },
      {
        level: "High (51-75%)",
        count: memberRows.filter(
          (member) => member.riskScore > 50 && member.riskScore <= 75,
        ).length,
        color: "#F97316",
      },
      {
        level: "Critical (76-100%)",
        count: memberRows.filter((member) => member.riskScore > 75).length,
        color: "#EF4444",
      },
    ],
  };

  return <ReportsClient data={data} />;
}
