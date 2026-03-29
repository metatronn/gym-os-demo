"use client";

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
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type ReportsClientData = {
  metrics: {
    monthlyRevenue: number;
    revenueGrowth: number;
    activeMembers: number;
    newLeads: number;
    conversionRate: number;
    churnRate: number;
    avgRisk: number;
  };
  revenueData: Array<{ month: string; revenue: number; members: number }>;
  classUtilData: Array<{ name: string; utilization: number }>;
  leadSourceData: Array<{ source: string; count: number; color: string }>;
  memberPlanData: Array<{ plan: string; count: number; color: string }>;
  riskDistribution: Array<{ level: string; count: number; color: string }>;
};

export default function ReportsClient({ data }: { data: ReportsClientData }) {
  const totalMembers = data.memberPlanData.reduce(
    (total, plan) => total + plan.count,
    0,
  );

  return (
    <div className="p-4 lg:p-6 overflow-auto h-full">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gym-text">
            Reports & Analytics
          </h1>
          <p className="text-gym-text-muted text-sm mt-1">
            Tenant-scoped performance overview
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          {
            label: "Revenue",
            value: `$${data.metrics.monthlyRevenue.toLocaleString()}`,
            change: `+${data.metrics.revenueGrowth}%`,
            up: data.metrics.revenueGrowth >= 0,
            icon: <DollarSign className="w-4 h-4" />,
          },
          {
            label: "Active Members",
            value: data.metrics.activeMembers,
            change: `${data.metrics.activeMembers}`,
            up: true,
            icon: <Users className="w-4 h-4" />,
          },
          {
            label: "New Leads",
            value: data.metrics.newLeads,
            change: `${data.metrics.newLeads}`,
            up: true,
            icon: <Target className="w-4 h-4" />,
          },
          {
            label: "Conversion",
            value: `${data.metrics.conversionRate}%`,
            change: `+${data.metrics.conversionRate}%`,
            up: true,
            icon: <ArrowUpRight className="w-4 h-4" />,
          },
          {
            label: "Churn Rate",
            value: `${data.metrics.churnRate}%`,
            change: `${data.metrics.churnRate}%`,
            up: false,
            icon: <TrendingDown className="w-4 h-4" />,
          },
          {
            label: "Avg Risk",
            value: `${data.metrics.avgRisk}%`,
            change: `${data.metrics.avgRisk}%`,
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
              className={`text-[10px] flex items-center gap-0.5 ${
                kpi.up ? "text-green-400" : "text-red-400"
              }`}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-gym-card border border-gym-border rounded-xl p-4">
          <h3 className="text-sm font-medium text-gym-text mb-4">
            Revenue Trend
          </h3>
          <ResponsiveContainer width="100%" height={250} minWidth={0}>
            <AreaChart data={data.revenueData}>
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
                tickFormatter={(value) => `$${Number(value) / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111827",
                  border: "1px solid #1E293B",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value) => [
                  `$${Number(value ?? 0).toLocaleString()}`,
                  "Revenue",
                ]}
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

        <div className="bg-gym-card border border-gym-border rounded-xl p-4">
          <h3 className="text-sm font-medium text-gym-text mb-4">
            Class Utilization
          </h3>
          <ResponsiveContainer width="100%" height={250} minWidth={0}>
            <BarChart data={data.classUtilData} layout="vertical">
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
                width={110}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111827",
                  border: "1px solid #1E293B",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value) => [`${Number(value ?? 0)}%`, "Utilization"]}
              />
              <Bar dataKey="utilization" fill="#06B6D4" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gym-card border border-gym-border rounded-xl p-4">
          <h3 className="text-sm font-medium text-gym-text mb-4">
            Lead Sources
          </h3>
          <div className="space-y-3">
            {data.leadSourceData.length === 0 ? (
              <p className="text-sm text-gym-text-muted">
                No leads captured yet.
              </p>
            ) : (
              data.leadSourceData.map((source) => (
                <div key={source.source} className="flex items-center gap-3">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: source.color }}
                  />
                  <span className="text-sm text-gym-text-secondary flex-1">
                    {source.source}
                  </span>
                  <span className="text-sm font-bold text-gym-text">
                    {source.count}
                  </span>
                  <div className="w-16 h-1.5 bg-gym-bg rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: source.color,
                        width: `${Math.min(source.count * 20, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-gym-card border border-gym-border rounded-xl p-4">
          <h3 className="text-sm font-medium text-gym-text mb-4">
            Member Plans
          </h3>
          <div className="space-y-3">
            {data.memberPlanData.map((plan) => (
              <div key={plan.plan}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gym-text-secondary">
                    {plan.plan}
                  </span>
                  <span className="text-sm font-bold text-gym-text">
                    {plan.count}
                  </span>
                </div>
                <div className="w-full h-2 bg-gym-bg rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: plan.color,
                      width: `${totalMembers === 0 ? 0 : (plan.count / totalMembers) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gym-card border border-gym-border rounded-xl p-4">
          <h3 className="text-sm font-medium text-gym-text mb-4">
            Risk Distribution
          </h3>
          <div className="space-y-3">
            {data.riskDistribution.map((risk) => (
              <div key={risk.level}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gym-text-secondary">
                    {risk.level}
                  </span>
                  <span className="text-sm font-bold text-gym-text">
                    {risk.count}
                  </span>
                </div>
                <div className="w-full h-2 bg-gym-bg rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: risk.color,
                      width: `${totalMembers === 0 ? 0 : (risk.count / totalMembers) * 100}%`,
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
