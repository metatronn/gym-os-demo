"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  ArrowUpRight,
  DollarSign,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { cn } from "@/lib/utils";
import type { ReportData } from "@/lib/reporting";
import { RANGE_OPTIONS, type RangeKey } from "@/lib/reporting";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const RETENTION_COLORS = ["#0350FF", "#06B6D4", "#10B981", "#F59E0B"];

function formatDateInput(value: string) {
  return value.slice(0, 10);
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Never";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getRiskBadgeVariant(
  riskLevel: string,
): "destructive" | "warning" | "success" {
  if (riskLevel === "high") return "destructive";
  if (riskLevel === "medium") return "warning";
  return "success";
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

  return variants[status] ?? "default";
}

export default function ReportsClient({ data }: { data: ReportData }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentRange =
    (searchParams.get("range") as RangeKey) || data.range.key;
  const currentFrom =
    searchParams.get("from") ?? formatDateInput(data.range.from);
  const currentTo = searchParams.get("to") ?? formatDateInput(data.range.to);
  const [fromDate, setFromDate] = useState(currentFrom);
  const [toDate, setToDate] = useState(currentTo);

  useEffect(() => {
    setFromDate(currentFrom);
    setToDate(currentTo);
  }, [currentFrom, currentTo]);

  function handleRangeChange(range: RangeKey) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", range);

    if (range !== "custom") {
      params.delete("from");
      params.delete("to");
    } else {
      params.set("from", fromDate);
      params.set("to", toDate);
    }

    router.push(`/reports?${params.toString()}`);
  }

  function applyCustomRange() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", "custom");
    params.set("from", fromDate);
    params.set("to", toDate);
    router.push(`/reports?${params.toString()}`);
  }

  const retentionChartData = ["1M", "3M", "6M", "12M"].map((period) => {
    const row: Record<string, string | number> = { period };

    data.retentionCurves.forEach((curve) => {
      const point = curve.points.find((entry) => entry.period === period);
      row[curve.cohort] = point?.retention ?? 0;
    });

    return row;
  });

  return (
    <div className="h-full overflow-auto p-4 lg:p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Reports & Analytics
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tenant-scoped performance data from your live gym records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={currentRange}
            onValueChange={(value) => handleRangeChange(value as RangeKey)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              {RANGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {currentRange === "custom" ? (
            <>
              <Input
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                className="w-auto"
              />
              <Input
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
                className="w-auto"
              />
              <Button onClick={applyCustomRange} size="sm">
                Apply
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          {
            label: "Revenue",
            value: `$${data.kpis.revenue.toLocaleString()}`,
            change: `${data.kpis.revenueChange >= 0 ? "+" : ""}${data.kpis.revenueChange}%`,
            up: data.kpis.revenueChange >= 0,
            icon: <DollarSign className="h-4 w-4" />,
          },
          {
            label: "Active Members",
            value: data.kpis.activeMembers,
            change: `${data.kpis.activeMembers} live`,
            up: true,
            icon: <Users className="h-4 w-4" />,
          },
          {
            label: "New Leads",
            value: data.kpis.newLeads,
            change: `${data.kpis.newLeads} in range`,
            up: true,
            icon: <Target className="h-4 w-4" />,
          },
          {
            label: "Conversion",
            value: `${data.kpis.conversionRate}%`,
            change: "lead to member",
            up: data.kpis.conversionRate >= 20,
            icon: <ArrowUpRight className="h-4 w-4" />,
          },
          {
            label: "Churn Rate",
            value: `${data.kpis.churnRate}%`,
            change: "membership base",
            up: false,
            icon: <TrendingDown className="h-4 w-4" />,
          },
          {
            label: "Avg Risk",
            value: `${data.kpis.avgRisk}%`,
            change: "member score",
            up: false,
            icon: <Activity className="h-4 w-4" />,
          },
        ].map((kpi) => (
          <Card key={kpi.label} className="bg-card/70 backdrop-blur">
            <CardContent className="p-3">
              <div className="mb-1 flex items-center gap-1.5 text-muted-foreground">
                {kpi.icon}
                <span className="text-[10px]">{kpi.label}</span>
              </div>
              <p className="text-lg font-bold text-foreground">{kpi.value}</p>
              <p
                className={cn(
                  "flex items-center gap-0.5 text-[10px]",
                  kpi.up ? "text-success" : "text-destructive",
                )}
              >
                {kpi.up ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {kpi.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="bg-card/70 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-sm">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={data.revenueSeries}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0350FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0350FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis
                  dataKey="month"
                  stroke="#64748B"
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  stroke="#64748B"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => `$${Number(value).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111827",
                    border: "1px solid #1E293B",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={
                    ((value: number) => [
                      `$${Number(value).toLocaleString()}`,
                      "Revenue",
                    ]) as never
                  }
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0350FF"
                  fill="url(#revenueGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card/70 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-sm">Member Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.memberGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis
                  dataKey="month"
                  stroke="#64748B"
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  stroke="#64748B"
                  tick={{ fontSize: 11 }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111827",
                    border: "1px solid #1E293B",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11 }}
                  formatter={(value: string) => (
                    <span className="text-muted-foreground">{value}</span>
                  )}
                />
                <Bar
                  dataKey="newMembers"
                  name="New Members"
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="churned"
                  name="Churned"
                  fill="#EF4444"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="bg-card/70 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-sm">Class Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.classUtilization} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  stroke="#64748B"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#64748B"
                  tick={{ fontSize: 10 }}
                  width={120}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111827",
                    border: "1px solid #1E293B",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={
                    ((value: number) => [`${value}%`, "Utilization"]) as never
                  }
                />
                <Bar
                  dataKey="utilization"
                  fill="#06B6D4"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card/70 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-sm">Lead Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.leadFunnel.map((stage) => (
                <div key={stage.stage}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {stage.stage}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">
                        {stage.count}
                      </span>
                      {stage.conversionRate !== null ? (
                        <span className="text-[10px] text-muted-foreground">
                          {stage.conversionRate}% from previous
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="h-7 w-full overflow-hidden rounded-lg bg-background">
                    <div
                      className="flex h-full items-center justify-end rounded-lg pr-2 text-[10px] font-bold text-primary-foreground"
                      style={{
                        width: `${Math.max(
                          (stage.count /
                            Math.max(
                              ...data.leadFunnel.map((entry) => entry.count),
                              1,
                            )) *
                            100,
                          8,
                        )}%`,
                        backgroundColor: stage.color,
                        opacity: 0.85,
                      }}
                    >
                      {stage.count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card className="bg-card/70 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-sm">Retention Cohorts</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={retentionChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis
                  dataKey="period"
                  stroke="#64748B"
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="#64748B"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111827",
                    border: "1px solid #1E293B",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11 }}
                  formatter={(value: string) => (
                    <span className="text-muted-foreground">{value}</span>
                  )}
                />
                {data.retentionCurves.map((curve, index) => (
                  <Line
                    key={curve.cohort}
                    type="monotone"
                    dataKey={curve.cohort}
                    stroke={RETENTION_COLORS[index % RETENTION_COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card/70 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-sm">Top Risk Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topRiskMembers.map((member) => (
                <div
                  key={member.id}
                  className="rounded-lg border border-border bg-background p-3"
                >
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">
                      {member.name}
                    </p>
                    <Badge variant={getRiskBadgeVariant(member.riskLevel)}>
                      {member.riskScore}%
                    </Badge>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>
                      {member.plan} plan &middot;{" "}
                      <Badge
                        variant={getRiskBadgeVariant(member.riskLevel)}
                        className="text-[10px] px-1.5 py-0"
                      >
                        {member.riskLevel} risk
                      </Badge>
                    </p>
                    <p>
                      {member.monthlyVisits} visits/month &middot;{" "}
                      <Badge
                        variant={getBillingBadgeVariant(member.billingStatus)}
                        className="text-[10px] px-1.5 py-0"
                      >
                        {member.billingStatus}
                      </Badge>
                    </p>
                    <p>Last check-in: {formatDateTime(member.lastCheckIn)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
