"use client";

import type { LucideIcon } from "lucide-react";
import {
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type DashboardLeadRow = {
  id: string;
  name: string;
  source: string;
  interest: string;
  score: number;
  createdAt: string;
};

export type DashboardMemberRow = {
  id: string;
  name: string;
  avatar: string | null;
  billingStatus: string;
  lastCheckIn: string | null;
  notes: string;
};

export type DashboardActivityRow = {
  id: string;
  type: string;
  description: string;
  relatedName: string;
  timestamp: string;
};

export type DashboardTaskRow = {
  id: string;
  title: string;
  assignedTo: string;
  priority: string;
  status: string;
};

export type DashboardPaymentRow = {
  id: string;
  memberName: string;
  amount: number;
  status: string;
};

export type DashboardClassRow = {
  id: string;
  name: string;
  instructor: string;
  time: string;
  capacity: number;
  enrolled: number;
};

type DashboardClientData = {
  today: string;
  gymName: string;
  metrics: {
    monthlyRevenue: number;
    revenueGrowth: number;
    activeMembers: number;
    churnRate: number;
    newLeads: number;
    leadConversion: number;
  };
  revenueData: Array<{ month: string; revenue: number }>;
  newLeads: DashboardLeadRow[];
  atRiskMembers: DashboardMemberRow[];
  activity: DashboardActivityRow[];
  openTasks: DashboardTaskRow[];
  billingAlerts: DashboardPaymentRow[];
  classes: DashboardClassRow[];
};

function formatDate(date: string | null) {
  if (!date) {
    return "Never";
  }

  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function timeAgo(timestamp: string) {
  const now = new Date();
  const then = new Date(timestamp);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getSourceColor(source: string) {
  const colors: Record<string, string> = {
    Instagram: "bg-pink-500/10 text-pink-400 border border-pink-500/20",
    Website: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    Facebook: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
    "Walk-in": "bg-green-500/10 text-green-400 border border-green-500/20",
    Referral: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
    Google: "bg-red-500/10 text-red-400 border border-red-500/20",
  };

  return colors[source] ?? colors.Website;
}

function getBillingStatusColor(status: string) {
  const colors: Record<string, string> = {
    failed: "bg-red-500/10 text-red-400 border border-red-500/20",
    "past-due": "bg-orange-500/10 text-orange-400 border border-orange-500/20",
    current: "bg-green-500/10 text-green-400 border border-green-500/20",
    pending: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  };

  return colors[status] ?? colors.current;
}

function getActivityDotColor(type: string) {
  const colors: Record<string, string> = {
    "lead-new": "bg-blue-500",
    "member-checkin": "bg-green-500",
    "member-added": "bg-emerald-500",
    "payment-failed": "bg-red-500",
    "payment-pending": "bg-yellow-500",
    "risk-flag": "bg-orange-500",
    "outreach-sent": "bg-cyan-500",
    "lead-converted": "bg-emerald-500",
    "task-completed": "bg-purple-500",
    "task-created": "bg-indigo-500",
  };

  return colors[type] ?? "bg-gray-500";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function KPICard({
  icon: Icon,
  label,
  value,
  change,
  isPositive,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  change: number;
  isPositive: boolean;
}) {
  return (
    <div className="bg-gym-card/70 backdrop-blur border border-gym-border rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <Icon className="w-5 h-5 text-gym-primary" />
        <div className="flex items-center gap-1">
          {isPositive ? (
            <ArrowUpRight className="w-4 h-4 text-gym-success" />
          ) : (
            <ArrowDownRight className="w-4 h-4 text-gym-danger" />
          )}
          <span
            className={`text-xs font-medium ${
              isPositive ? "text-gym-success" : "text-gym-danger"
            }`}
          >
            {Math.abs(change)}%
          </span>
        </div>
      </div>
      <div className="mb-2">
        <p className="text-2xl font-bold text-gym-text">{value}</p>
      </div>
      <p className="text-xs text-gym-text-secondary">{label}</p>
    </div>
  );
}

export default function DashboardClient({
  data,
}: {
  data: DashboardClientData;
}) {
  return (
    <div className="min-h-screen bg-gym-bg p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-4xl font-bold text-gym-text mb-2">
            Good morning
          </h1>
          <p className="text-gym-text-secondary mb-2">
            Here&apos;s what&apos;s happening at {data.gymName}
          </p>
          <p className="text-xs text-gym-text-muted">{data.today}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
          <KPICard
            icon={DollarSign}
            label="Monthly Revenue"
            value={`$${data.metrics.monthlyRevenue.toLocaleString()}`}
            change={data.metrics.revenueGrowth}
            isPositive={data.metrics.revenueGrowth >= 0}
          />
          <KPICard
            icon={Users}
            label="Active Members"
            value={data.metrics.activeMembers}
            change={data.metrics.churnRate}
            isPositive={false}
          />
          <KPICard
            icon={TrendingUp}
            label="New Leads"
            value={data.metrics.newLeads}
            change={data.metrics.leadConversion}
            isPositive={data.metrics.leadConversion >= 0}
          />
          <KPICard
            icon={Zap}
            label="Lead Conversion"
            value={`${data.metrics.leadConversion}%`}
            change={data.metrics.leadConversion}
            isPositive={data.metrics.leadConversion >= 0}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="lg:col-span-2 bg-gym-card/70 backdrop-blur border border-gym-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gym-text mb-6">
              Revenue Trend
            </h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={data.revenueData}>
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#1E293B"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    stroke="#94A3B8"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis
                    stroke="#94A3B8"
                    style={{ fontSize: "12px" }}
                    tickFormatter={(value) => `$${Number(value) / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111827",
                      border: "1px solid #1E293B",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#F1F5F9" }}
                    formatter={(value) => [
                      `$${Number(value).toLocaleString()}`,
                      "Revenue",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#06B6D4"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gym-card/70 backdrop-blur border border-gym-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gym-text mb-4">
              Today&apos;s Classes
            </h2>
            <div className="space-y-3">
              {data.classes.length === 0 ? (
                <p className="text-sm text-gym-text-muted">
                  No classes scheduled yet.
                </p>
              ) : (
                data.classes.map((cls) => {
                  const capacity =
                    cls.capacity === 0
                      ? 0
                      : (cls.enrolled / cls.capacity) * 100;

                  return (
                    <div key={cls.id} className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-gym-text">
                            {cls.time}
                          </p>
                          <p className="text-xs text-gym-text-secondary">
                            {cls.name}
                          </p>
                          <p className="text-xs text-gym-text-muted">
                            {cls.instructor}
                          </p>
                        </div>
                        <p className="text-xs text-gym-text-secondary">
                          {cls.enrolled}/{cls.capacity}
                        </p>
                      </div>
                      <div className="w-full bg-gym-bg rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-gym-accent"
                          style={{ width: `${capacity}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="bg-gym-card/70 backdrop-blur border border-gym-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gym-text">New Leads</h2>
              <span className="bg-gym-primary text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {data.newLeads.length}
              </span>
            </div>
            <div className="space-y-3">
              {data.newLeads.length === 0 ? (
                <p className="text-sm text-gym-text-muted">No new leads yet.</p>
              ) : (
                data.newLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="bg-gym-bg/50 rounded-lg p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${getSourceColor(
                              lead.source,
                            )}`}
                          >
                            {lead.source}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gym-text">
                          {lead.name}
                        </p>
                        <p className="text-xs text-gym-text-secondary line-clamp-2">
                          {lead.interest}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-gym-primary">
                          {lead.score}
                        </span>
                        <p className="text-xs text-gym-text-muted">
                          {timeAgo(lead.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-gym-card/70 backdrop-blur border border-gym-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gym-text">
                At-Risk Members
              </h2>
              <span className="bg-gym-danger text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {data.atRiskMembers.length}
              </span>
            </div>
            <div className="space-y-3">
              {data.atRiskMembers.length === 0 ? (
                <p className="text-sm text-gym-text-muted">
                  No at-risk members right now.
                </p>
              ) : (
                data.atRiskMembers.map((member) => (
                  <div
                    key={member.id}
                    className="bg-gym-bg/50 rounded-lg p-3 space-y-2"
                  >
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-bold">
                        {member.avatar ?? getInitials(member.name)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gym-text">
                          {member.name}
                        </p>
                        <p className="text-xs text-gym-text-secondary">
                          Last seen: {formatDate(member.lastCheckIn)}
                        </p>
                        <p className="text-xs text-gym-text-muted mt-0.5">
                          {member.notes}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${getBillingStatusColor(
                        member.billingStatus,
                      )}`}
                    >
                      {member.billingStatus}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-gym-card/70 backdrop-blur border border-gym-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gym-text mb-4">
              Recent Activity
            </h2>
            <div className="space-y-3">
              {data.activity.length === 0 ? (
                <p className="text-sm text-gym-text-muted">
                  No recent activity yet.
                </p>
              ) : (
                data.activity.map((event) => (
                  <div key={event.id} className="flex gap-3">
                    <div
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 ${getActivityDotColor(
                        event.type,
                      )}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gym-text-secondary leading-tight">
                        <span className="font-medium text-gym-text">
                          {event.relatedName}
                        </span>{" "}
                        {event.description
                          .replace(event.relatedName, "")
                          .trim()}
                      </p>
                      <p className="text-xs text-gym-text-muted mt-0.5">
                        {timeAgo(event.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <div className="bg-gym-card/70 backdrop-blur border border-gym-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gym-text mb-4">
              Open Tasks
            </h2>
            <div className="space-y-2">
              {data.openTasks.length === 0 ? (
                <p className="text-sm text-gym-text-muted">
                  No open tasks right now.
                </p>
              ) : (
                data.openTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 bg-gym-bg/50 rounded-lg p-3"
                  >
                    <input
                      type="checkbox"
                      checked={task.status === "done"}
                      readOnly
                      className="w-4 h-4 mt-0.5 accent-gym-primary"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm text-gym-text font-medium">
                            {task.title}
                          </p>
                          <p className="text-xs text-gym-text-secondary">
                            {task.assignedTo}
                          </p>
                        </div>
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${
                            task.priority === "high"
                              ? "bg-red-500/10 text-red-400 border border-red-500/20"
                              : task.priority === "medium"
                                ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                                : "bg-green-500/10 text-green-400 border border-green-500/20"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-gym-card/70 backdrop-blur border border-gym-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gym-text mb-4">
              Billing Alerts
            </h2>
            <div className="space-y-2">
              {data.billingAlerts.length === 0 ? (
                <p className="text-sm text-gym-text-muted">
                  No billing alerts right now.
                </p>
              ) : (
                data.billingAlerts.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between bg-gym-bg/50 rounded-lg p-3"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gym-text">
                        {payment.memberName}
                      </p>
                      <p className="text-xs text-gym-text-secondary">
                        ${payment.amount.toFixed(2)}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        payment.status === "failed"
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
