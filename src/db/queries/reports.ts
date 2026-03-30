import { desc, gte, lte } from "drizzle-orm";
import { classes, leads, members, payments } from "@/db/schema";
import { tenantDb, type TenantDb } from "@/db/tenant";
import {
  buildClassUtilization,
  buildLeadFunnel,
  buildMemberGrowthSeries,
  buildMonthlyRevenueSeries,
  buildRetentionCurves,
  computeKPIs,
  type ClassUtilization,
  type FunnelStage,
  type MemberGrowthMonth,
  type MonthlyRevenue,
  type ReportData,
  type ReportDateRange,
  type TopRiskMember,
} from "@/lib/reporting";

type DateRange = ReportDateRange;

async function loadMemberRows(tenant: TenantDb) {
  return tenant.db
    .select({
      id: members.id,
      name: members.name,
      plan: members.plan,
      status: members.status,
      riskScore: members.riskScore,
      riskLevel: members.riskLevel,
      monthlyVisits: members.monthlyVisits,
      billingStatus: members.billingStatus,
      joinDate: members.joinDate,
      lastCheckIn: members.lastCheckIn,
    })
    .from(members)
    .where(tenant.tenantFilter(members));
}

async function loadLeadRows(tenant: TenantDb, range: DateRange) {
  return tenant.db
    .select({
      status: leads.status,
      source: leads.source,
      createdAt: leads.createdAt,
    })
    .from(leads)
    .where(
      tenant.tenantFilter(
        leads,
        gte(leads.createdAt, range.from),
        lte(leads.createdAt, range.to),
      ),
    );
}

async function loadPaymentRows(tenant: TenantDb, range: DateRange) {
  return tenant.db
    .select({
      amount: payments.amount,
      status: payments.status,
      createdAt: payments.createdAt,
    })
    .from(payments)
    .where(
      tenant.tenantFilter(
        payments,
        gte(payments.createdAt, range.from),
        lte(payments.createdAt, range.to),
      ),
    );
}

async function loadPaymentsForKpis(tenant: TenantDb, range: DateRange) {
  const periodMs = range.to.getTime() - range.from.getTime();
  const previousFrom = new Date(range.from.getTime() - periodMs);

  return tenant.db
    .select({
      amount: payments.amount,
      status: payments.status,
      createdAt: payments.createdAt,
    })
    .from(payments)
    .where(
      tenant.tenantFilter(
        payments,
        gte(payments.createdAt, previousFrom),
        lte(payments.createdAt, range.to),
      ),
    );
}

async function loadClassRows(tenant: TenantDb) {
  return tenant.db
    .select({
      name: classes.name,
      capacity: classes.capacity,
      enrolled: classes.enrolled,
      time: classes.time,
    })
    .from(classes)
    .where(tenant.tenantFilter(classes))
    .orderBy(classes.name);
}

async function loadTopRiskMembers(tenant: TenantDb, limit: number) {
  const rows = await tenant.db
    .select({
      id: members.id,
      name: members.name,
      plan: members.plan,
      riskScore: members.riskScore,
      riskLevel: members.riskLevel,
      billingStatus: members.billingStatus,
      monthlyVisits: members.monthlyVisits,
      lastCheckIn: members.lastCheckIn,
    })
    .from(members)
    .where(tenant.tenantFilter(members))
    .orderBy(desc(members.riskScore), desc(members.lastCheckIn))
    .limit(limit);

  return rows.map<TopRiskMember>((member) => ({
    id: member.id,
    name: member.name,
    plan: member.plan,
    riskScore: Number(member.riskScore.toFixed(1)),
    riskLevel: member.riskLevel,
    billingStatus: member.billingStatus,
    monthlyVisits: member.monthlyVisits,
    lastCheckIn: member.lastCheckIn?.toISOString() ?? null,
  }));
}

export async function revenueByMonth(
  range: DateRange,
): Promise<MonthlyRevenue[]> {
  const tenant = await tenantDb();
  const paymentRows = await loadPaymentRows(tenant, range);
  return buildMonthlyRevenueSeries(paymentRows, range.from, range.to);
}

export async function memberGrowth(
  range: DateRange,
): Promise<MemberGrowthMonth[]> {
  const tenant = await tenantDb();
  const memberRows = await loadMemberRows(tenant);
  return buildMemberGrowthSeries(memberRows, range.from, range.to);
}

export async function leadConversionFunnel(
  range: DateRange,
): Promise<FunnelStage[]> {
  const tenant = await tenantDb();
  const leadRows = await loadLeadRows(tenant, range);
  return buildLeadFunnel(leadRows, range.from, range.to);
}

export async function classUtilization(): Promise<ClassUtilization[]> {
  const tenant = await tenantDb();
  const classRows = await loadClassRows(tenant);
  return buildClassUtilization(classRows);
}

export async function retentionCohorts(range: DateRange) {
  const tenant = await tenantDb();
  const memberRows = await loadMemberRows(tenant);
  return buildRetentionCurves(memberRows, range.to);
}

export async function topRiskMembers(limit = 5) {
  const tenant = await tenantDb();
  return loadTopRiskMembers(tenant, limit);
}

export async function getReportData(range: DateRange): Promise<ReportData> {
  const tenant = await tenantDb();

  const [
    memberRows,
    leadRows,
    paymentRows,
    paymentRowsForKpis,
    classRows,
    topRisk,
  ] = await Promise.all([
    loadMemberRows(tenant),
    loadLeadRows(tenant, range),
    loadPaymentRows(tenant, range),
    loadPaymentsForKpis(tenant, range),
    loadClassRows(tenant),
    loadTopRiskMembers(tenant, 5),
  ]);

  return {
    range: {
      key: range.key,
      from: range.from.toISOString(),
      to: range.to.toISOString(),
    },
    kpis: computeKPIs(memberRows, leadRows, paymentRowsForKpis, range),
    revenueSeries: buildMonthlyRevenueSeries(paymentRows, range.from, range.to),
    memberGrowth: buildMemberGrowthSeries(memberRows, range.from, range.to),
    leadFunnel: buildLeadFunnel(leadRows, range.from, range.to),
    classUtilization: buildClassUtilization(classRows),
    retentionCurves: buildRetentionCurves(memberRows, range.to),
    topRiskMembers: topRisk,
  };
}
