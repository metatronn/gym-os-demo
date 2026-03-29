import { desc, eq } from "drizzle-orm";
import DashboardClient, {
  type DashboardActivityRow,
  type DashboardClassRow,
  type DashboardLeadRow,
  type DashboardMemberRow,
  type DashboardPaymentRow,
  type DashboardTaskRow,
} from "./dashboard-client";
import { tenantDb } from "@/db/tenant";
import {
  activityEvents,
  classes,
  leads,
  members,
  payments,
  tasks,
  tenants,
} from "@/db/schema";
import {
  buildMonthlyRevenueSeries,
  calculateMonthlyRevenue,
  calculatePercentChange,
  centsToDollars,
  sortClassesByTime,
} from "@/lib/reporting";

export const dynamic = "force-dynamic";

function formatPercent(value: number) {
  return Number(value.toFixed(1));
}

function buildDashboardActivityFeed({
  activityRows,
  leadRows,
  memberRows,
  paymentRows,
  taskRows,
}: {
  activityRows: Array<{
    id: string;
    type: string;
    description: string;
    relatedId: string | null;
    relatedName: string | null;
    createdAt: Date;
  }>;
  leadRows: Array<{
    id: string;
    name: string;
    source: string | null;
    createdAt: Date;
  }>;
  memberRows: Array<{
    id: string;
    name: string;
    createdAt: Date;
  }>;
  paymentRows: Array<{
    id: string;
    memberName: string | null;
    status: string;
    createdAt: Date;
  }>;
  taskRows: Array<{
    id: string;
    title: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
}) {
  const persisted = activityRows.map<DashboardActivityRow>((event) => ({
    id: event.id,
    type: event.type,
    description: event.description,
    relatedName: event.relatedName ?? "Activity",
    timestamp: event.createdAt.toISOString(),
  }));

  const knownEvents = new Set(
    activityRows.map((event) => `${event.type}:${event.relatedId ?? event.id}`),
  );

  const synthetic = [
    ...leadRows.slice(0, 8).flatMap<DashboardActivityRow>((lead) => {
      const key = `lead-new:${lead.id}`;
      if (knownEvents.has(key)) return [];

      return [
        {
          id: `lead-${lead.id}`,
          type: "lead-new",
          description: `New lead: ${lead.name}${lead.source ? ` from ${lead.source}` : ""}`,
          relatedName: lead.name,
          timestamp: lead.createdAt.toISOString(),
        },
      ];
    }),
    ...memberRows.slice(0, 8).map<DashboardActivityRow>((member) => ({
      id: `member-${member.id}`,
      type: "member-added",
      description: `Added member ${member.name}`,
      relatedName: member.name,
      timestamp: member.createdAt.toISOString(),
    })),
    ...taskRows.slice(0, 8).flatMap<DashboardActivityRow>((task) => {
      const type = task.status === "done" ? "task-completed" : "task-created";
      const key = `${type}:${task.id}`;
      if (knownEvents.has(key)) return [];

      return [
        {
          id: `task-${task.id}`,
          type,
          description:
            task.status === "done"
              ? `Completed task: ${task.title}`
              : `Created task: ${task.title}`,
          relatedName: task.title,
          timestamp:
            task.status === "done"
              ? task.updatedAt.toISOString()
              : task.createdAt.toISOString(),
        },
      ];
    }),
    ...paymentRows
      .filter(
        (payment) =>
          payment.status === "failed" || payment.status === "pending",
      )
      .slice(0, 8)
      .flatMap<DashboardActivityRow>((payment) => {
        const type =
          payment.status === "failed" ? "payment-failed" : "payment-pending";
        const key = `${type}:${payment.id}`;
        if (knownEvents.has(key)) return [];

        return [
          {
            id: `payment-${payment.id}`,
            type,
            description:
              payment.status === "failed"
                ? `Payment failed for ${payment.memberName ?? "subscription payment"}`
                : `Payment pending for ${payment.memberName ?? "subscription payment"}`,
            relatedName: payment.memberName ?? "Subscription payment",
            timestamp: payment.createdAt.toISOString(),
          },
        ];
      }),
  ];

  return [...persisted, ...synthetic]
    .sort(
      (left, right) =>
        new Date(right.timestamp).getTime() -
        new Date(left.timestamp).getTime(),
    )
    .slice(0, 8);
}

export default async function DashboardPage() {
  const { db, tenantFilter, tenantId } = await tenantDb();
  const now = new Date();
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    tenantRow,
    leadRows,
    memberRows,
    paymentRows,
    taskRows,
    classRows,
    activityRows,
  ] = await Promise.all([
    db
      .select({ name: tenants.name })
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .then((rows) => rows[0] ?? null),
    db
      .select()
      .from(leads)
      .where(tenantFilter(leads))
      .orderBy(desc(leads.createdAt)),
    db
      .select()
      .from(members)
      .where(tenantFilter(members))
      .orderBy(desc(members.createdAt)),
    db
      .select()
      .from(payments)
      .where(tenantFilter(payments))
      .orderBy(desc(payments.createdAt)),
    db
      .select()
      .from(tasks)
      .where(tenantFilter(tasks))
      .orderBy(desc(tasks.createdAt)),
    db
      .select()
      .from(classes)
      .where(tenantFilter(classes))
      .orderBy(desc(classes.createdAt)),
    db
      .select()
      .from(activityEvents)
      .where(tenantFilter(activityEvents))
      .orderBy(desc(activityEvents.createdAt))
      .limit(8),
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
  );
  const cancelledMembers = memberRows.filter(
    (member) => member.status === "cancelled",
  );
  const churnRate = formatPercent(
    memberRows.length === 0
      ? 0
      : (cancelledMembers.length / memberRows.length) * 100,
  );

  const convertedLeads = leadRows.filter((lead) => lead.status === "converted");
  const leadConversion = formatPercent(
    leadRows.length === 0 ? 0 : (convertedLeads.length / leadRows.length) * 100,
  );

  const newLeads = leadRows.filter((lead) => lead.status === "new").slice(0, 4);
  const atRiskMembers = memberRows
    .filter(
      (member) =>
        member.riskLevel === "high" || member.riskLevel === "critical",
    )
    .sort((left, right) => right.riskScore - left.riskScore)
    .slice(0, 4);
  const openTasks = [...taskRows]
    .filter((task) => task.status !== "done")
    .sort((left, right) => {
      if (!left.dueDate && !right.dueDate) {
        return 0;
      }

      if (!left.dueDate) {
        return 1;
      }

      if (!right.dueDate) {
        return -1;
      }

      return left.dueDate.getTime() - right.dueDate.getTime();
    })
    .slice(0, 4);
  const billingAlerts = paymentRows
    .filter(
      (payment) => payment.status === "failed" || payment.status === "pending",
    )
    .slice(0, 4);
  const todayClasses = sortClassesByTime(classRows).slice(0, 5);

  const data = {
    today: now.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    }),
    gymName: tenantRow?.name ?? "your gym",
    metrics: {
      monthlyRevenue: Number(monthlyRevenue.toFixed(2)),
      revenueGrowth,
      activeMembers: activeMembers.length,
      churnRate,
      newLeads: leadRows.filter((lead) => lead.status === "new").length,
      leadConversion,
    },
    revenueData: buildMonthlyRevenueSeries(paymentRows, 6),
    newLeads: newLeads.map<DashboardLeadRow>((lead) => ({
      id: lead.id,
      name: lead.name,
      source: lead.source ?? "Website",
      interest: lead.interest ?? "No interest noted yet.",
      score: lead.score,
      createdAt: lead.createdAt.toISOString(),
    })),
    atRiskMembers: atRiskMembers.map<DashboardMemberRow>((member) => ({
      id: member.id,
      name: member.name,
      avatar: member.avatar ?? null,
      billingStatus: member.billingStatus,
      lastCheckIn: member.lastCheckIn?.toISOString() ?? null,
      notes: member.notes ?? "No notes recorded yet.",
    })),
    activity: buildDashboardActivityFeed({
      activityRows,
      leadRows,
      memberRows,
      paymentRows,
      taskRows,
    }),
    openTasks: openTasks.map<DashboardTaskRow>((task) => ({
      id: task.id,
      title: task.title,
      assignedTo: task.assignedTo ?? "Unassigned",
      priority: task.priority,
      status: task.status,
    })),
    billingAlerts: billingAlerts.map<DashboardPaymentRow>((payment) => ({
      id: payment.id,
      memberName: payment.memberName ?? "Subscription payment",
      amount: centsToDollars(payment.amount),
      status: payment.status,
    })),
    classes: todayClasses.map<DashboardClassRow>((cls) => ({
      id: cls.id,
      name: cls.name,
      instructor: cls.instructor ?? "Staff",
      time: cls.time ?? "TBD",
      capacity: cls.capacity ?? 0,
      enrolled: cls.enrolled,
    })),
  };

  return <DashboardClient data={data} />;
}
