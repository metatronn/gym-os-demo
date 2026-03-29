"use server";

import { dashboardQueries } from "@/db/queries/dashboard";
import { leadQueries } from "@/db/queries/leads";
import { memberQueries } from "@/db/queries/members";
import { paymentQueries } from "@/db/queries/payments";
import { taskQueries } from "@/db/queries/tasks";
import { classQueries } from "@/db/queries/classes";
import { tenantDb } from "@/db/tenant";

export async function getDashboardKPIs() {
  const tenant = await tenantDb();
  return dashboardQueries(tenant).getKPIs();
}

export async function getDashboardActivity() {
  const tenant = await tenantDb();
  return dashboardQueries(tenant).getRecentActivity();
}

export async function getDashboardRevenueChart() {
  const tenant = await tenantDb();
  return dashboardQueries(tenant).getRevenueChart();
}

export async function getDashboardNewLeads() {
  const tenant = await tenantDb();
  return leadQueries(tenant).list({ status: "new" });
}

export async function getDashboardAtRiskMembers() {
  const tenant = await tenantDb();
  const all = await memberQueries(tenant).list();
  return all.filter(
    (m) => m.riskLevel === "high" || m.riskLevel === "critical",
  );
}

export async function getDashboardTodayClasses() {
  const tenant = await tenantDb();
  const allClasses = await classQueries(tenant).list();
  // Return the first 5 classes as a reasonable "today" view
  return allClasses.slice(0, 5);
}

export async function getDashboardTodayTasks() {
  const tenant = await tenantDb();
  return taskQueries(tenant).list({ status: "todo" });
}

export async function getDashboardFailedPayments() {
  const tenant = await tenantDb();
  return paymentQueries(tenant).list({ status: "failed" });
}
