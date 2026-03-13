'use client';

import { useState } from 'react';
import { members } from '@/lib/data';
import {
  Search, Plus, ChevronRight, Phone, Mail,
  Calendar, CreditCard, Activity, AlertTriangle, X, TrendingDown, TrendingUp
} from 'lucide-react';

const statusColors: Record<string, string> = {
  active: 'bg-green-500/20 text-green-400',
  frozen: 'bg-blue-500/20 text-blue-400',
  cancelled: 'bg-red-500/20 text-red-400',
  trial: 'bg-yellow-500/20 text-yellow-400',
};

const riskColors: Record<string, string> = {
  low: 'text-green-400', medium: 'text-yellow-400', high: 'text-orange-400', critical: 'text-red-400',
};

const billingColors: Record<string, string> = {
  current: 'text-green-400', failed: 'text-red-400', 'past-due': 'text-orange-400', pending: 'text-yellow-400',
};

export default function MembersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  const filtered = members.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const selected = selectedMember ? members.find(m => m.id === selectedMember) : null;
  const statCounts = {
    active: members.filter(m => m.status === 'active').length,
    frozen: members.filter(m => m.status === 'frozen').length,
    cancelled: members.filter(m => m.status === 'cancelled').length,
    trial: members.filter(m => m.status === 'trial').length,
    atRisk: members.filter(m => m.riskLevel === 'high' || m.riskLevel === 'critical').length,
  };

  return (
    <div className="flex h-full">
      <div className={`flex-1 p-4 lg:p-6 overflow-auto ${selected ? 'lg:mr-[420px]' : ''}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gym-text">Members</h1>
            <p className="text-gym-text-muted text-sm mt-1">{members.length} total members</p>
          </div>
          <button className="flex items-center gap-2 bg-gym-primary hover:bg-gym-primary/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Add Member
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Active', value: statCounts.active, color: 'text-green-400' },
            { label: 'Trial', value: statCounts.trial, color: 'text-yellow-400' },
            { label: 'Frozen', value: statCounts.frozen, color: 'text-blue-400' },
            { label: 'Cancelled', value: statCounts.cancelled, color: 'text-red-400' },
            { label: 'At Risk', value: statCounts.atRisk, color: 'text-orange-400' },
          ].map(stat => (
            <div key={stat.label} className="p-3 bg-gym-card border border-gym-border rounded-xl text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gym-text-muted mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gym-text-muted" />
            <input type="text" placeholder="Search members..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gym-card border border-gym-border rounded-lg text-gym-text text-sm placeholder:text-gym-text-muted focus:outline-none focus:border-gym-primary" />
          </div>
          <div className="flex bg-gym-card border border-gym-border rounded-lg overflow-hidden overflow-x-auto">
            {['all', 'active', 'trial', 'frozen', 'cancelled'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 text-xs font-medium capitalize ${statusFilter === s ? 'bg-gym-primary text-white' : 'text-gym-text-secondary hover:text-gym-text'}`}>{s}</button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-gym-card border border-gym-border rounded-xl overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gym-border">
                <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">Member</th>
                <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">Plan</th>
                <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">Status</th>
                <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">Risk</th>
                <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">Visits/Mo</th>
                <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">Last Check-in</th>
                <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">Billing</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(member => (
                <tr key={member.id} onClick={() => setSelectedMember(member.id)}
                  className={`border-b border-gym-border/50 hover:bg-gym-bg/50 cursor-pointer transition-colors ${selectedMember === member.id ? 'bg-gym-bg/50' : ''}`}>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gym-primary/20 rounded-full flex items-center justify-center text-xs font-bold text-gym-primary">{member.avatar}</div>
                      <div><span className="text-sm font-medium text-gym-text">{member.name}</span><p className="text-xs text-gym-text-muted">{member.email}</p></div>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-gym-text-secondary">{member.plan}</td>
                  <td className="p-3"><span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${statusColors[member.status]}`}>{member.status}</span></td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      {(member.riskLevel === 'high' || member.riskLevel === 'critical') && <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />}
                      <span className={`text-xs font-medium capitalize ${riskColors[member.riskLevel]}`}>{member.riskScore}%</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      {member.monthlyVisits >= 15 ? <TrendingUp className="w-3.5 h-3.5 text-green-400" /> : member.monthlyVisits <= 5 ? <TrendingDown className="w-3.5 h-3.5 text-red-400" /> : null}
                      <span className="text-sm text-gym-text-secondary">{member.monthlyVisits}</span>
                    </div>
                  </td>
                  <td className="p-3 text-xs text-gym-text-muted">{member.lastCheckIn}</td>
                  <td className="p-3"><span className={`text-xs font-medium capitalize ${billingColors[member.billingStatus]}`}>{member.billingStatus}</span></td>
                  <td className="p-3"><ChevronRight className="w-4 h-4 text-gym-text-muted" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Panel */}
      {selected && (
        <div className="fixed inset-0 lg:inset-auto lg:right-0 lg:top-0 w-full lg:w-[420px] h-full bg-gym-card border-l border-gym-border p-6 overflow-auto z-40">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gym-text">Member Profile</h2>
            <button onClick={() => setSelectedMember(null)} className="p-1 hover:bg-gym-bg rounded"><X className="w-4 h-4 text-gym-text-muted" /></button>
          </div>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gym-primary/20 rounded-full flex items-center justify-center text-gym-primary text-xl font-bold">{selected.avatar}</div>
            <div>
              <h3 className="text-lg font-semibold text-gym-text">{selected.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusColors[selected.status]}`}>{selected.status}</span>
                <span className="text-xs text-gym-text-muted">{selected.plan} Plan</span>
              </div>
            </div>
          </div>
          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-3 p-3 bg-gym-bg rounded-lg"><Mail className="w-4 h-4 text-gym-text-muted" /><span className="text-sm text-gym-text">{selected.email}</span></div>
            <div className="flex items-center gap-3 p-3 bg-gym-bg rounded-lg"><Phone className="w-4 h-4 text-gym-text-muted" /><span className="text-sm text-gym-text">{selected.phone}</span></div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3 bg-gym-bg rounded-lg">
              <div className="flex items-center gap-1.5 mb-1"><AlertTriangle className="w-3.5 h-3.5 text-gym-text-muted" /><p className="text-xs text-gym-text-muted">Risk Score</p></div>
              <p className={`text-xl font-bold ${riskColors[selected.riskLevel]}`}>{selected.riskScore}%</p>
              <p className={`text-xs capitalize ${riskColors[selected.riskLevel]}`}>{selected.riskLevel}</p>
            </div>
            <div className="p-3 bg-gym-bg rounded-lg">
              <div className="flex items-center gap-1.5 mb-1"><Activity className="w-3.5 h-3.5 text-gym-text-muted" /><p className="text-xs text-gym-text-muted">Monthly Visits</p></div>
              <p className="text-xl font-bold text-gym-text">{selected.monthlyVisits}</p>
            </div>
            <div className="p-3 bg-gym-bg rounded-lg">
              <div className="flex items-center gap-1.5 mb-1"><Calendar className="w-3.5 h-3.5 text-gym-text-muted" /><p className="text-xs text-gym-text-muted">Last Check-in</p></div>
              <p className="text-sm font-medium text-gym-text">{selected.lastCheckIn}</p>
            </div>
            <div className="p-3 bg-gym-bg rounded-lg">
              <div className="flex items-center gap-1.5 mb-1"><CreditCard className="w-3.5 h-3.5 text-gym-text-muted" /><p className="text-xs text-gym-text-muted">Billing</p></div>
              <p className={`text-sm font-medium capitalize ${billingColors[selected.billingStatus]}`}>{selected.billingStatus}</p>
            </div>
          </div>
          <div className="mb-6"><p className="text-xs text-gym-text-muted mb-2">Tags</p>
            <div className="flex flex-wrap gap-1.5">{selected.tags.map(tag => (<span key={tag} className="text-xs bg-gym-bg border border-gym-border px-2 py-1 rounded text-gym-text-secondary">{tag}</span>))}</div>
          </div>
          <div className="mb-6"><p className="text-xs text-gym-text-muted mb-2">Notes</p><p className="text-sm text-gym-text-secondary bg-gym-bg p-3 rounded-lg">{selected.notes}</p></div>
          <div className="mb-6"><p className="text-xs text-gym-text-muted mb-1">Member Since</p><p className="text-sm text-gym-text">{selected.joinDate}</p></div>
          <div className="space-y-2">
            <button className="w-full flex items-center justify-center gap-2 bg-gym-primary hover:bg-gym-primary/80 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"><Mail className="w-4 h-4" />Send Message</button>
            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center justify-center gap-2 bg-gym-bg hover:bg-gym-border text-gym-text px-3 py-2 rounded-lg text-xs font-medium border border-gym-border"><Phone className="w-3.5 h-3.5" />Call</button>
              <button className="flex items-center justify-center gap-2 bg-gym-bg hover:bg-gym-border text-gym-text px-3 py-2 rounded-lg text-xs font-medium border border-gym-border"><Calendar className="w-3.5 h-3.5" />Book Class</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
