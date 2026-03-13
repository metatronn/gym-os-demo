'use client';

import { payments, dashboardKPIs } from '@/lib/data';
import {
  DollarSign, TrendingUp, AlertCircle, CreditCard,
  CheckCircle, XCircle, Clock, RotateCcw, Search, Filter
} from 'lucide-react';
import { useState } from 'react';

const statusConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  succeeded: { icon: <CheckCircle className="w-4 h-4" />, color: 'text-green-400', bg: 'bg-green-500/10' },
  failed: { icon: <XCircle className="w-4 h-4" />, color: 'text-red-400', bg: 'bg-red-500/10' },
  refunded: { icon: <RotateCcw className="w-4 h-4" />, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  pending: { icon: <Clock className="w-4 h-4" />, color: 'text-blue-400', bg: 'bg-blue-500/10' },
};

export default function BillingPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = payments.filter(p => {
    const matchFilter = filter === 'all' || p.status === filter;
    const matchSearch = p.memberName.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalRevenue = payments.filter(p => p.status === 'succeeded').reduce((a, p) => a + p.amount, 0);
  const failedTotal = payments.filter(p => p.status === 'failed').reduce((a, p) => a + p.amount, 0);
  const failedCount = payments.filter(p => p.status === 'failed').length;

  return (
    <div className="p-4 lg:p-6 overflow-auto h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gym-text">Billing & Payments</h1>
          <p className="text-gym-text-muted text-sm mt-1">{payments.length} transactions this month</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        <div className="p-4 bg-gym-card border border-gym-border rounded-xl">
          <div className="flex items-center gap-2 mb-2"><DollarSign className="w-4 h-4 text-green-400" /><span className="text-xs text-gym-text-muted">Monthly Revenue</span></div>
          <p className="text-2xl font-bold text-gym-text">${dashboardKPIs.monthlyRevenue.toLocaleString()}</p>
          <p className="text-xs text-green-400 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" />+{dashboardKPIs.revenueGrowth}% vs last month</p>
        </div>
        <div className="p-4 bg-gym-card border border-gym-border rounded-xl">
          <div className="flex items-center gap-2 mb-2"><CheckCircle className="w-4 h-4 text-green-400" /><span className="text-xs text-gym-text-muted">Collected</span></div>
          <p className="text-2xl font-bold text-green-400">${totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-gym-text-muted mt-1">{payments.filter(p => p.status === 'succeeded').length} successful payments</p>
        </div>
        <div className="p-4 bg-gym-card border border-gym-border rounded-xl">
          <div className="flex items-center gap-2 mb-2"><AlertCircle className="w-4 h-4 text-red-400" /><span className="text-xs text-gym-text-muted">Failed</span></div>
          <p className="text-2xl font-bold text-red-400">${failedTotal.toLocaleString()}</p>
          <p className="text-xs text-gym-text-muted mt-1">{failedCount} failed payments</p>
        </div>
        <div className="p-4 bg-gym-card border border-gym-border rounded-xl">
          <div className="flex items-center gap-2 mb-2"><CreditCard className="w-4 h-4 text-gym-accent" /><span className="text-xs text-gym-text-muted">Avg Transaction</span></div>
          <p className="text-2xl font-bold text-gym-text">${Math.round(totalRevenue / Math.max(payments.filter(p => p.status === 'succeeded').length, 1))}</p>
          <p className="text-xs text-gym-text-muted mt-1">per payment</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gym-text-muted" />
          <input type="text" placeholder="Search by member..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gym-card border border-gym-border rounded-lg text-gym-text text-sm placeholder:text-gym-text-muted focus:outline-none focus:border-gym-primary" />
        </div>
        <div className="flex bg-gym-card border border-gym-border rounded-lg overflow-hidden">
          {['all', 'succeeded', 'failed', 'pending', 'refunded'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-2 text-xs font-medium capitalize ${filter === s ? 'bg-gym-primary text-white' : 'text-gym-text-secondary hover:text-gym-text'}`}>{s}</button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-gym-card border border-gym-border rounded-xl overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-gym-border">
              <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">Member</th>
              <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">Amount</th>
              <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">Status</th>
              <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">Type</th>
              <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">Method</th>
              <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(payment => {
              const config = statusConfig[payment.status];
              return (
                <tr key={payment.id} className="border-b border-gym-border/50 hover:bg-gym-bg/50 cursor-pointer transition-colors">
                  <td className="p-3 text-sm font-medium text-gym-text">{payment.memberName}</td>
                  <td className="p-3 text-sm font-bold text-gym-text">${payment.amount.toFixed(2)}</td>
                  <td className="p-3">
                    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${config.color} ${config.bg}`}>
                      {config.icon}<span className="capitalize">{payment.status}</span>
                    </div>
                  </td>
                  <td className="p-3 text-xs text-gym-text-secondary capitalize">{payment.type}</td>
                  <td className="p-3 text-xs text-gym-text-muted">{payment.method}</td>
                  <td className="p-3 text-xs text-gym-text-muted">{payment.date}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
