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

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

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

function getSourceVariant(
  source: string,
): "default" | "success" | "destructive" | "warning" | "accent" | "secondary" {
  const variants: Record<
    string,
    "default" | "success" | "destructive" | "warning" | "accent" | "secondary"
  > = {
    Instagram: "accent",
    Website: "default",
    Facebook: "default",
    "Walk-in": "success",
    Referral: "warning",
    Google: "destructive",
  };

  return variants[source] ?? "default";
}

function getBillingBadgeVariant(
  status: string,
): "destructive" | "warning" | "success" | "default" {
  const variants: Record<
    string,
    "destructive" | "warning" | "success" | "default"
  > = {
    failed: "destructive",
    "past-due": "warning",
    current: "success",
    pending: "warning",
  };

  return variants[status] ?? "success";
}

function getActivityDotColor(type: string) {
  const colors: Record<string, string> = {
    "lead-new": "bg-primary",
    "member-checkin": "bg-success",
    "member-added": "bg-success",
    "payment-failed": "bg-destructive",
    "payment-pending": "bg-warning",
    "risk-flag": "bg-warning",
    "outreach-sent": "bg-accent",
    "lead-converted": "bg-success",
    "task-completed": "bg-primary",
    "task-created": "bg-primary",
  };

  return colors[type] ?? "bg-muted-foreground";
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
    <Card className="bg-card/70 backdrop-blur">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <Icon className="w-5 h-5 text-primary" />
          <div className="flex items-center gap-1">
            {isPositive ? (
              <ArrowUpRight className="w-4 h-4 text-success" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-destructive" />
            )}
            <span
              className={cn(
                "text-xs font-medium",
                isPositive ? "text-success" : "text-destructive",
              )}
            >
              {Math.abs(change)}%
            </span>
          </div>
        </div>
        <div className="mb-2">
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

export default function DashboardClient({
  data,
}: {
  data: DashboardClientData;
}) {
  return (
    <div className="min-h-screen bg-background p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-4xl font-bold text-foreground mb-2">
            Good morning
          </h1>
          <p className="text-muted-foreground mb-2">
            Here&apos;s what&apos;s happening at {data.gymName}
          </p>
          <p className="text-xs text-muted-foreground">{data.today}</p>
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
          <Card className="lg:col-span-2 bg-card/70 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg">Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
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
                        <stop
                          offset="5%"
                          stopColor="#06B6D4"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#06B6D4"
                          stopOpacity={0}
                        />
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
            </CardContent>
          </Card>

          <Card className="bg-card/70 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg">Today&apos;s Classes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.classes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
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
                            <p className="text-sm font-medium text-foreground">
                              {cls.time}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {cls.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {cls.instructor}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {cls.enrolled}/{cls.capacity}
                          </p>
                        </div>
                        <Progress
                          value={capacity}
                          className="h-1.5 bg-background"
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <Card className="bg-card/70 backdrop-blur">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg">New Leads</CardTitle>
              <Badge>{data.newLeads.length}</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.newLeads.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No new leads yet.
                  </p>
                ) : (
                  data.newLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="bg-background/50 rounded-lg p-3 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={getSourceVariant(lead.source)}>
                              {lead.source}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-foreground">
                            {lead.name}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {lead.interest}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-primary">
                            {lead.score}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {timeAgo(lead.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/70 backdrop-blur">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg">At-Risk Members</CardTitle>
              <Badge variant="destructive">{data.atRiskMembers.length}</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.atRiskMembers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No at-risk members right now.
                  </p>
                ) : (
                  data.atRiskMembers.map((member) => (
                    <div
                      key={member.id}
                      className="bg-background/50 rounded-lg p-3 space-y-2"
                    >
                      <div className="flex items-start gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-warning/20 text-warning text-xs font-bold">
                            {member.avatar ?? getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {member.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Last seen: {formatDate(member.lastCheckIn)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {member.notes}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={getBillingBadgeVariant(member.billingStatus)}
                      >
                        {member.billingStatus}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/70 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.activity.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No recent activity yet.
                  </p>
                ) : (
                  data.activity.map((event) => (
                    <div key={event.id} className="flex gap-3">
                      <div
                        className={cn(
                          "w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5",
                          getActivityDotColor(event.type),
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground leading-tight">
                          <span className="font-medium text-foreground">
                            {event.relatedName}
                          </span>{" "}
                          {event.description
                            .replace(event.relatedName, "")
                            .trim()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {timeAgo(event.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <Card className="bg-card/70 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg">Open Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.openTasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No open tasks right now.
                  </p>
                ) : (
                  data.openTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 bg-background/50 rounded-lg p-3"
                    >
                      <input
                        type="checkbox"
                        checked={task.status === "done"}
                        readOnly
                        className="w-4 h-4 mt-0.5 accent-primary"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm text-foreground font-medium">
                              {task.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {task.assignedTo}
                            </p>
                          </div>
                          <Badge
                            variant={
                              task.priority === "high"
                                ? "destructive"
                                : task.priority === "medium"
                                  ? "warning"
                                  : "success"
                            }
                            className="flex-shrink-0"
                          >
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/70 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg">Billing Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.billingAlerts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No billing alerts right now.
                  </p>
                ) : (
                  data.billingAlerts.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between bg-background/50 rounded-lg p-3"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {payment.memberName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ${payment.amount.toFixed(2)}
                        </p>
                      </div>
                      <Badge
                        variant={
                          payment.status === "failed"
                            ? "destructive"
                            : "warning"
                        }
                      >
                        {payment.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
