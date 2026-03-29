"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Target,
  Activity,
  ArrowUpRight,
  ChevronDown,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import type { ReportData } from "@/lib/reporting";
import { RANGE_OPTIONS, type RangeKey } from "@/lib/reporting";

interface ReportsClientProps {
  data: ReportData;
}

export default function ReportsClient({ data }: ReportsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentRange = (searchParams.get("range") as RangeKey) || "6m";

  const handleRangeChange = (range: string) => {
    router.push(`/reports?range=${range}`);
  };

  const {
    kpis,
    revenueSeries,
    memberGrowth,
    leadFunnel,
    leadSources,
    classUtilization,
    memberPlans,
    riskDistribution,
    totalMembers,
  } = data;

  const rangeLabel =
    RANGE_OPTIONS.find((o) => o.value === currentRange)?.label ||
    "Last 6 months";

  // Find max funnel count for scaling bars
  const maxFunnelCount = Math.max(...leadFunnel.map((s) => s.count), 1);

  return (
    <div className="p-4 lg:p-6 overflow-auto h-full">
      {/* Header with date range selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gym-text">
            Reports & Analytics
          </h1>
          <p className="text-gym-text-muted text-sm mt-1">
            Performance overview
          </p>
        </div>
        <div className="relative">
          <select
            value={currentRange}
            onChange={(e) => handleRangeChange(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 bg-gym-card border border-gym-border rounded-lg text-sm text-gym-text cursor-pointer hover:border-gym-primary/50 transition focus:outline-none focus:ring-1 focus:ring-gym-primary/50"
          >
            {RANGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gym-text-muted pointer-events-none" />
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          {
            label: "Revenue",
            value: `$${kpis.revenue.toLocaleString()}`,
            change: `${kpis.revenueChange >= 0 ? "+" : ""}${kpis.revenueChange}%`,
            up: kpis.revenueChange >= 0,
            icon: <DollarSign className="w-4 h-4" />,
          },
          {
            label: "Active Members",
            value: kpis.activeMembers,
            change: `+${kpis.activeMembers}`,
            up: true,
            icon: <Users className="w-4 h-4" />,
          },
          {
            label: "New Leads",
            value: kpis.newLeads,
            change: `+${kpis.newLeads}`,
            up: true,
            icon: <Target className="w-4 h-4" />,
          },
          {
            label: "Conversion",
            value: `${kpis.conversionRate}%`,
            change: `${kpis.conversionRate}%`,
            up: kpis.conversionRate > 0,
            icon: <ArrowUpRight className="w-4 h-4" />,
          },
          {
            label: "Churn Rate",
            value: `${kpis.churnRate}%`,
            change: `${kpis.churnRate}%`,
            up: false,
            icon: <TrendingDown className="w-4 h-4" />,
          },
          {
            label: "Avg Risk",
            value: `${kpis.avgRisk}%`,
            change: `${kpis.avgRisk}%`,
            up: false,
            icon: <Activity className="w-4 h-4" />,
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="p-3 bg-gym-card border border-gym-border rounded-xl"
          >
            <div className="flex items-center gap-1.5 mb-1 text-gym-text-muted">
              {kpi.icon}
              <span className="text-[10px]">{kpi.label}</span>
            </div>
            <p className="text-lg font-bold text-gym-text">{kpi.value}</p>
            <p
              className={`text-[10px] flex items-center gap-0.5 ${kpi.up ? "text-green-400" : "text-red-400"}`}
            >
              {kpi.up ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {kpi.change}
            </p>
          </div>
        ))}
      </div>

      {/* Row 1: Revenue Trend + Member Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Revenue Trend */}
        <div className="bg-gym-card border border-gym-border rounded-xl p-4">
          <h3 className="text-sm font-medium text-gym-text mb-4">
            Revenue Trend
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={revenueSeries}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0350FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0350FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="month" stroke="#64748B" tick={{ fontSize: 11 }} />
              <YAxis
                stroke="#64748B"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
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
                    `$${Number(value ?? 0).toLocaleString()}`,
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
        </div>

        {/* Member Growth */}
        <div className="bg-gym-card border border-gym-border rounded-xl p-4">
          <h3 className="text-sm font-medium text-gym-text mb-4">
            Member Growth
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={memberGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="month" stroke="#64748B" tick={{ fontSize: 11 }} />
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
                  <span className="text-gym-text-secondary">{value}</span>
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
        </div>
      </div>

      {/* Row 2: Class Utilization + Lead Conversion Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Class Utilization */}
        <div className="bg-gym-card border border-gym-border rounded-xl p-4">
          <h3 className="text-sm font-medium text-gym-text mb-4">
            Class Utilization
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={classUtilization} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis
                type="number"
                domain={[0, 100]}
                stroke="#64748B"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#64748B"
                tick={{ fontSize: 10 }}
                width={110}
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
              <Bar dataKey="utilization" fill="#06B6D4" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Lead Conversion Funnel */}
        <div className="bg-gym-card border border-gym-border rounded-xl p-4">
          <h3 className="text-sm font-medium text-gym-text mb-4">
            Lead Conversion Funnel
          </h3>
          <div className="space-y-3 mt-2">
            {leadFunnel.map((stage, i) => {
              const barWidthPct =
                maxFunnelCount > 0
                  ? Math.max((stage.count / maxFunnelCount) * 100, 8)
                  : 8;
              return (
                <div key={stage.stage}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-gym-text-secondary">
                      {stage.stage}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gym-text">
                        {stage.count}
                      </span>
                      {stage.conversionRate !== null && (
                        <span className="text-[10px] text-gym-text-muted">
                          ({stage.conversionRate}% from prev)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-full h-7 bg-gym-bg rounded-lg overflow-hidden flex items-center">
                    <div
                      className="h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-2"
                      style={{
                        backgroundColor: stage.color,
                        width: `${barWidthPct}%`,
                        opacity: 0.8,
                      }}
                    >
                      {barWidthPct > 20 && (
                        <span className="text-[10px] font-bold text-white">
                          {stage.count}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Arrow connector between stages */}
                  {i < leadFunnel.length - 1 && (
                    <div className="flex justify-center py-0.5">
                      <svg
                        width="12"
                        height="10"
                        className="text-gym-text-muted"
                      >
                        <polygon
                          points="6,10 0,0 12,0"
                          fill="currentColor"
                          opacity="0.3"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 3: Lead Sources, Member Plans, Risk Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Lead Sources */}
        <div className="bg-gym-card border border-gym-border rounded-xl p-4">
          <h3 className="text-sm font-medium text-gym-text mb-4">
            Lead Sources
          </h3>
          <div className="space-y-3">
            {leadSources.length === 0 ? (
              <p className="text-sm text-gym-text-muted">
                No leads in this period
              </p>
            ) : (
              leadSources.map((src) => {
                const maxCount = Math.max(
                  ...leadSources.map((s) => s.count),
                  1,
                );
                return (
                  <div key={src.source} className="flex items-center gap-3">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: src.color }}
                    />
                    <span className="text-sm text-gym-text-secondary flex-1">
                      {src.source}
                    </span>
                    <span className="text-sm font-bold text-gym-text">
                      {src.count}
                    </span>
                    <div className="w-16 h-1.5 bg-gym-bg rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: src.color,
                          width: `${(src.count / maxCount) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Member Plans */}
        <div className="bg-gym-card border border-gym-border rounded-xl p-4">
          <h3 className="text-sm font-medium text-gym-text mb-4">
            Member Plans
          </h3>
          <div className="space-y-3">
            {memberPlans.map((p) => (
              <div key={p.plan}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gym-text-secondary">
                    {p.plan}
                  </span>
                  <span className="text-sm font-bold text-gym-text">
                    {p.count}
                  </span>
                </div>
                <div className="w-full h-2 bg-gym-bg rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: p.color,
                      width: `${totalMembers > 0 ? (p.count / totalMembers) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="bg-gym-card border border-gym-border rounded-xl p-4">
          <h3 className="text-sm font-medium text-gym-text mb-4">
            Risk Distribution
          </h3>
          <div className="space-y-3">
            {riskDistribution.map((r) => (
              <div key={r.level}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gym-text-secondary">
                    {r.level}
                  </span>
                  <span className="text-sm font-bold text-gym-text">
                    {r.count}
                  </span>
                </div>
                <div className="w-full h-2 bg-gym-bg rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: r.color,
                      width: `${totalMembers > 0 ? (r.count / totalMembers) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
