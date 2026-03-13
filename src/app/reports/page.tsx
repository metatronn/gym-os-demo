'use client';

import { dashboardKPIs, members, leads, payments, classes } from '@/lib/data';
import {
  TrendingUp, TrendingDown, Users, DollarSign, Target,
  Activity, Calendar, BarChart3, PieChart, ArrowUpRight
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const revenueData = [
  { month: 'Sep', revenue: 18200, members: 82 },
  { month: 'Oct', revenue: 19500, members: 86 },
  { month: 'Nov', revenue: 20100, members: 88 },
  { month: 'Dec', revenue: 19800, members: 85 },
  { month: 'Jan', revenue: 21400, members: 90 },
  { month: 'Feb', revenue: 22100, members: 94 },
  { month: 'Mar', revenue: 24850, members: 98 },
];

const leadSourceData = [
  { source: 'Instagram', count: 4, color: '#E1306C' },
  { source: 'Google', count: 2, color: '#4285F4' },
  { source: 'Referral', count: 2, color: '#10B981' },
  { source: 'Facebook', count: 2, color: '#1877F2' },
  { source: 'Walk-in', count: 1, color: '#F59E0B' },
  { source: 'Website', count: 1, color: '#06B6D4' },
];

const classUtilData = classes.map(c => ({
  name: c.name.length > 15 ? c.name.slice(0, 15) + '...' : c.name,
  utilization: Math.round((c.enrolled / c.capacity) * 100),
}));

export default function ReportsPage() {
  const activeMembers = members.filter(m => m.status === 'active').length;
  const avgRisk = Math.round(members.reduce((a, m) => a + m.riskScore, 0) / members.length);
  const totalCollected = payments.filter(p => p.status === 'succeeded').reduce((a, p) => a + p.amount, 0);
  const conversionRate = Math.round((leads.filter(l => l.status === 'converted').length / leads.length) * 100);

  return (
    <div className="p-4 lg:p-6 overflow-auto h-full">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gym-text">Reports & Analytics</h1>
          <p className="text-gym-text-muted text-sm mt-1">Performance overview for March 2026</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 bg-gym-card border border-gym-border rounded-lg text-xs text-gym-text-secondary hover:text-gym-text">This Month</button>
          <button className="px-3 py-2 bg-gym-card border border-gym-border rounded-lg text-xs text-gym-text-secondary hover:text-gym-text">Quarter</button>
          <button className="px-3 py-2 bg-gym-card border border-gym-border rounded-lg text-xs text-gym-text-secondary hover:text-gym-text">Year</button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { label: 'Revenue', value: `$${dashboardKPIs.monthlyRevenue.toLocaleString()}`, change: `+${dashboardKPIs.revenueGrowth}%`, up: true, icon: <DollarSign className="w-4 h-4" /> },
          { label: 'Active Members', value: activeMembers, change: '+3', up: true, icon: <Users className="w-4 h-4" /> },
          { label: 'New Leads', value: dashboardKPIs.newLeads, change: '+5', up: true, icon: <Target className="w-4 h-4" /> },
          { label: 'Conversion', value: `${conversionRate}%`, change: '+2%', up: true, icon: <ArrowUpRight className="w-4 h-4" /> },
          { label: 'Churn Rate', value: `${dashboardKPIs.churnRate}%`, change: '-1.2%', up: false, icon: <TrendingDown className="w-4 h-4" /> },
          { label: 'Avg Risk', value: `${avgRisk}%`, change: '-3%', up: false, icon: <Activity className="w-4 h-4" /> },
        ].map(kpi => (
          <div key={kpi.label} className="p-3 bg-gym-card border border-gym-border rounded-xl">
            <div className="flex items-center gap-1.5 mb-1 text-gym-text-muted">{kpi.icon}<span className="text-[10px]">{kpi.label}</span></div>
            <p className="text-lg font-bold text-gym-text">{kpi.value}</p>
            <p className={`text-[10px] flex items-center gap-0.5 ${kpi.up ? 'text-green-400' : 'text-red-400'}`}>
              {kpi.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}{kpi.change}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Revenue Trend */}
        <div className="bg-gym-card border border-gym-border rounded-xl p-4">
          <h3 className="text-sm font-medium text-gym-text mb-4">Revenue Trend (7 Months)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0350FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0350FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="month" stroke="#64748B" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748B" tick={{ fontSize: 11 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #1E293B', borderRadius: 8, fontSize: 12 }}
                formatter={((value: number) => [`$${Number(value ?? 0).toLocaleString()}`, 'Revenue']) as never} />
              <Area type="monotone" dataKey="revenue" stroke="#0350FF" fill="url(#revenueGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Class Utilization */}
        <div className="bg-gym-card border border-gym-border rounded-xl p-4">
          <h3 className="text-sm font-medium text-gym-text mb-4">Class Utilization</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={classUtilData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis type="number" domain={[0, 100]} stroke="#64748B" tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
              <YAxis type="category" dataKey="name" stroke="#64748B" tick={{ fontSize: 10 }} width={110} />
              <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #1E293B', borderRadius: 8, fontSize: 12 }}
                formatter={((value: number) => [`${value}%`, 'Utilization']) as never} />
              <Bar dataKey="utilization" fill="#06B6D4" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Lead Sources */}
        <div className="bg-gym-card border border-gym-border rounded-xl p-4">
          <h3 className="text-sm font-medium text-gym-text mb-4">Lead Sources</h3>
          <div className="space-y-3">
            {leadSourceData.map(src => (
              <div key={src.source} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: src.color }} />
                <span className="text-sm text-gym-text-secondary flex-1">{src.source}</span>
                <span className="text-sm font-bold text-gym-text">{src.count}</span>
                <div className="w-16 h-1.5 bg-gym-bg rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ backgroundColor: src.color, width: `${(src.count / 4) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Member Distribution */}
        <div className="bg-gym-card border border-gym-border rounded-xl p-4">
          <h3 className="text-sm font-medium text-gym-text mb-4">Member Plans</h3>
          <div className="space-y-3">
            {[
              { plan: 'Premium', count: members.filter(m => m.plan === 'Premium').length, color: '#0350FF' },
              { plan: 'Unlimited', count: members.filter(m => m.plan === 'Unlimited').length, color: '#06B6D4' },
              { plan: 'Basic', count: members.filter(m => m.plan === 'Basic').length, color: '#F59E0B' },
              { plan: 'Trial', count: members.filter(m => m.plan === 'Trial').length, color: '#10B981' },
            ].map(p => (
              <div key={p.plan}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gym-text-secondary">{p.plan}</span>
                  <span className="text-sm font-bold text-gym-text">{p.count}</span>
                </div>
                <div className="w-full h-2 bg-gym-bg rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ backgroundColor: p.color, width: `${(p.count / members.length) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="bg-gym-card border border-gym-border rounded-xl p-4">
          <h3 className="text-sm font-medium text-gym-text mb-4">Risk Distribution</h3>
          <div className="space-y-3">
            {[
              { level: 'Low (0-30%)', count: members.filter(m => m.riskScore <= 30).length, color: '#10B981' },
              { level: 'Medium (31-50%)', count: members.filter(m => m.riskScore > 30 && m.riskScore <= 50).length, color: '#F59E0B' },
              { level: 'High (51-75%)', count: members.filter(m => m.riskScore > 50 && m.riskScore <= 75).length, color: '#F97316' },
              { level: 'Critical (76-100%)', count: members.filter(m => m.riskScore > 75).length, color: '#EF4444' },
            ].map(r => (
              <div key={r.level}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gym-text-secondary">{r.level}</span>
                  <span className="text-sm font-bold text-gym-text">{r.count}</span>
                </div>
                <div className="w-full h-2 bg-gym-bg rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ backgroundColor: r.color, width: `${(r.count / members.length) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
