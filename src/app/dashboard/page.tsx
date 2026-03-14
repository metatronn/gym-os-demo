'use client';

import {
  dashboardKPIs,
  leads,
  members,
  classes,
  payments,
  tasks,
  activityEvents,
} from '@/lib/data';
import {
  DollarSign,
  Users,
  TrendingUp,
  Zap,
  AlertCircle,
  Activity,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  CreditCard,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Mock 6-month revenue data
const revenueData = [
  { month: 'Sep', revenue: 18200 },
  { month: 'Oct', revenue: 19800 },
  { month: 'Nov', revenue: 21500 },
  { month: 'Dec', revenue: 22100 },
  { month: 'Jan', revenue: 23400 },
  { month: 'Feb', revenue: 24850 },
];

// Format date helper
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

// Time ago helper
const timeAgo = (timestamp: string) => {
  const now = new Date();
  const then = new Date(timestamp);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

// Get source color
const getSourceColor = (source: string) => {
  const colors: Record<string, string> = {
    Instagram: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    Website: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    Facebook: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    'Walk-in': 'bg-green-500/10 text-green-400 border border-green-500/20',
    Referral: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
    Google: 'bg-red-500/10 text-red-400 border border-red-500/20',
  };
  return colors[source] || colors.Website;
};

// Get risk color
const getRiskColor = (risk: string) => {
  const colors: Record<string, string> = {
    critical: 'bg-red-500/20 text-red-300 border border-red-500/30',
    high: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
    medium: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
    low: 'bg-green-500/20 text-green-300 border border-green-500/30',
  };
  return colors[risk] || colors.low;
};

// Get activity color dot
const getActivityDotColor = (type: string) => {
  const colors: Record<string, string> = {
    'lead-new': 'bg-blue-500',
    'member-checkin': 'bg-green-500',
    'payment-failed': 'bg-red-500',
    'risk-flag': 'bg-orange-500',
    'outreach-sent': 'bg-cyan-500',
    'lead-converted': 'bg-emerald-500',
    'task-completed': 'bg-purple-500',
  };
  return colors[type] || 'bg-gray-500';
};

// Get billing status badge
const getBillingStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    failed: 'bg-red-500/10 text-red-400 border border-red-500/20',
    'past-due': 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
    current: 'bg-green-500/10 text-green-400 border border-green-500/20',
    pending: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  };
  return colors[status] || colors.current;
};

// KPI Card Component
function KPICard({
  icon: Icon,
  label,
  value,
  change,
  isPositive,
}: {
  icon: React.ComponentType<any>;
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
              isPositive ? 'text-gym-success' : 'text-gym-danger'
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

export default function DashboardPage() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Filter data
  const newLeads = leads.filter((l) => l.status === 'new');
  const atRiskMembers = members.filter(
    (m) => m.riskLevel === 'critical' || m.riskLevel === 'high'
  );
  const todayTasks = tasks.filter(
    (t) => t.dueDate === '2026-03-13' || t.status !== 'done'
  );
  const failedPayments = payments.filter((p) => p.status === 'failed');
  const todayClasses = classes.slice(0, 5); // First 5 classes for today

  return (
    <div className="min-h-screen bg-gym-bg p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-4xl font-bold text-gym-text mb-2">
            Good morning, Javier
          </h1>
          <p className="text-gym-text-secondary mb-2">
            Here's what's happening at Undisputed Boxing Gym
          </p>
          <p className="text-xs text-gym-text-muted">{today}</p>
        </div>

        {/* KPI Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
          <KPICard
            icon={DollarSign}
            label="Monthly Revenue"
            value={`$${dashboardKPIs.monthlyRevenue.toLocaleString()}`}
            change={dashboardKPIs.revenueGrowth}
            isPositive={true}
          />
          <KPICard
            icon={Users}
            label="Active Members"
            value={dashboardKPIs.activeMembers}
            change={dashboardKPIs.churnRate}
            isPositive={false}
          />
          <KPICard
            icon={TrendingUp}
            label="New Leads"
            value={dashboardKPIs.newLeads}
            change={45}
            isPositive={true}
          />
          <KPICard
            icon={Zap}
            label="Lead Conversion"
            value={`${dashboardKPIs.leadConversion}%`}
            change={8.2}
            isPositive={true}
          />
        </div>

        {/* Second Row: Revenue Chart & Today's Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-gym-card/70 backdrop-blur border border-gym-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gym-text mb-6">
              Revenue Trend
            </h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
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
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#94A3B8"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      border: '1px solid #1E293B',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#F1F5F9' }}
                    formatter={((value: number) => [`$${Number(value ?? 0).toLocaleString()}`, 'Revenue']) as never}
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

          {/* Today's Classes */}
          <div className="bg-gym-card/70 backdrop-blur border border-gym-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gym-text mb-4">
              Today's Classes
            </h2>
            <div className="space-y-3">
              {todayClasses.map((cls) => {
                const capacity = (cls.enrolled / cls.capacity) * 100;
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
              })}
            </div>
          </div>
        </div>

        {/* Third Row: Three Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {/* New Leads */}
          <div className="bg-gym-card/70 backdrop-blur border border-gym-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gym-text">New Leads</h2>
              <span className="bg-gym-primary text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {newLeads.length}
              </span>
            </div>
            <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
              {newLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="bg-gym-bg/50 rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${getSourceColor(
                            lead.source
                          )}`}
                        >
                          {lead.source}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gym-text">
                        {lead.name}
                      </p>
                      <p className="text-xs text-gym-text-secondary line-clamp-1">
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
                  <button className="w-full text-xs bg-gym-primary hover:bg-gym-primary/80 text-white rounded px-2 py-1.5 font-medium transition">
                    Follow Up
                  </button>
                </div>
              ))}
            </div>
            <button className="w-full text-xs bg-gym-border hover:bg-gym-border/80 text-gym-text rounded-lg px-3 py-2 font-medium transition">
              Follow Up With All
            </button>
          </div>

          {/* At-Risk Members */}
          <div className="bg-gym-card/70 backdrop-blur border border-gym-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gym-text">
                At-Risk Members
              </h2>
              <span className="bg-gym-danger text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {atRiskMembers.length}
              </span>
            </div>
            <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
              {atRiskMembers.map((member) => {
                const avatarBg =
                  member.riskLevel === 'critical'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-orange-500/20 text-orange-400';
                return (
                  <div
                    key={member.id}
                    className="bg-gym-bg/50 rounded-lg p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarBg}`}
                        >
                          {member.avatar}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gym-text">
                            {member.name}
                          </p>
                          <p className="text-xs text-gym-text-secondary">
                            Last seen:{' '}
                            {formatDate(member.lastCheckIn)}
                          </p>
                          <p className="text-xs text-gym-text-muted mt-0.5">
                            {member.notes.substring(0, 40)}...
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${getBillingStatusColor(
                          member.billingStatus
                        )}`}
                      >
                        {member.billingStatus}
                      </span>
                    </div>
                    <button className="w-full text-xs bg-gym-primary hover:bg-gym-primary/80 text-white rounded px-2 py-1.5 font-medium transition">
                      Check In
                    </button>
                  </div>
                );
              })}
            </div>
            <button className="w-full text-xs bg-gym-border hover:bg-gym-border/80 text-gym-text rounded-lg px-3 py-2 font-medium transition">
              Send All Check-Ins
            </button>
          </div>

          {/* Recent Activity */}
          <div className="bg-gym-card/70 backdrop-blur border border-gym-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gym-text mb-4">
              Recent Activity
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activityEvents.slice(0, 8).map((event) => (
                <div key={event.id} className="flex gap-3">
                  <div
                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 ${getActivityDotColor(
                      event.type
                    )}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gym-text-secondary leading-tight">
                      <span className="font-medium text-gym-text">
                        {event.relatedName}
                      </span>{' '}
                      {event.description
                        .replace(event.relatedName, '')
                        .toLowerCase()}
                    </p>
                    <p className="text-xs text-gym-text-muted mt-0.5">
                      {timeAgo(event.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fourth Row: Tasks & Billing */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Tasks Due Today */}
          <div className="bg-gym-card/70 backdrop-blur border border-gym-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gym-text mb-4">
              Tasks Due Today
            </h2>
            <div className="space-y-2">
              {todayTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 bg-gym-bg/50 rounded-lg p-3"
                >
                  <input
                    type="checkbox"
                    checked={task.status === 'done'}
                    className="w-4 h-4 mt-0.5 accent-gym-primary cursor-pointer"
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
                          task.priority === 'high'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : task.priority === 'medium'
                              ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                              : 'bg-green-500/10 text-green-400 border border-green-500/20'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Billing Alerts */}
          <div className="bg-gym-card/70 backdrop-blur border border-gym-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gym-text mb-4">
              Billing Alerts
            </h2>
            <div className="space-y-2">
              {failedPayments.map((payment) => {
                const memberData = members.find(
                  (m) => m.id === payment.memberId
                );
                return (
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
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          payment.status === 'failed'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                        }`}
                      >
                        {payment.status}
                      </span>
                      <button className="text-xs bg-gym-primary hover:bg-gym-primary/80 text-white px-2.5 py-1 rounded font-medium transition">
                        Retry
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
