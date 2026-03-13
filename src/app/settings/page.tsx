'use client';

import { useState } from 'react';
import {
  Building2, CreditCard, Bell, Plug, Users, Shield,
  ChevronRight, Save, Globe, Palette, Mail, MessageSquare
} from 'lucide-react';

const tabs = [
  { id: 'gym', label: 'Gym Profile', icon: <Building2 className="w-4 h-4" /> },
  { id: 'plans', label: 'Membership Plans', icon: <CreditCard className="w-4 h-4" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
  { id: 'integrations', label: 'Integrations', icon: <Plug className="w-4 h-4" /> },
  { id: 'staff', label: 'Staff & Roles', icon: <Users className="w-4 h-4" /> },
  { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
];

const plans = [
  { name: 'Basic', price: 99, features: ['3x/week classes', 'Open gym access', 'Locker room'] },
  { name: 'Premium', price: 199, features: ['Unlimited classes', 'Open gym 24/7', 'Locker room', '1 PT session/month', 'InBody scan'] },
  { name: 'Unlimited', price: 249, features: ['Everything in Premium', 'Unlimited PT', 'Priority booking', 'Guest passes', 'Nutrition coaching'] },
  { name: 'Trial', price: 29, features: ['1 week access', '3 trial classes', 'Gym tour', 'InBody scan'] },
];

const integrations = [
  { name: 'Stripe', desc: 'Payment processing', status: 'connected', color: 'text-green-400' },
  { name: 'Twilio', desc: 'SMS messaging', status: 'connected', color: 'text-green-400' },
  { name: 'SendGrid', desc: 'Email campaigns', status: 'connected', color: 'text-green-400' },
  { name: 'Google Calendar', desc: 'Schedule sync', status: 'not connected', color: 'text-gym-text-muted' },
  { name: 'Zapier', desc: 'Workflow automation', status: 'not connected', color: 'text-gym-text-muted' },
  { name: 'ClubReady', desc: 'Legacy system import', status: 'not connected', color: 'text-gym-text-muted' },
];

const staff = [
  { name: 'Javier Laval', role: 'Owner / Admin', email: 'javier@undisputedboxinggym.com', status: 'active' },
  { name: 'Marcus Johnson', role: 'Head Coach', email: 'marcus@undisputedboxinggym.com', status: 'active' },
  { name: 'Alex Williams', role: 'Coach', email: 'alex@undisputedboxinggym.com', status: 'active' },
  { name: 'Sarah Chen', role: 'Coach', email: 'sarah@undisputedboxinggym.com', status: 'active' },
  { name: 'Michael Anderson', role: 'Coach', email: 'michael@undisputedboxinggym.com', status: 'active' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('gym');

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Tab Nav — horizontal scroll on mobile, vertical sidebar on desktop */}
      <div className="lg:w-[240px] border-b lg:border-b-0 lg:border-r border-gym-border p-3 lg:p-4">
        <h1 className="text-lg font-bold text-gym-text mb-3 lg:mb-4 px-1">Settings</h1>
        <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-1 lg:pb-0">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 lg:gap-3 px-3 py-2 lg:py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap lg:w-full ${activeTab === tab.id ? 'bg-gym-primary/10 text-gym-primary font-medium' : 'text-gym-text-secondary hover:text-gym-text hover:bg-gym-bg'}`}>
              {tab.icon}<span className="text-xs lg:text-sm">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 lg:p-6 overflow-auto">
        {activeTab === 'gym' && (
          <div>
            <h2 className="text-xl font-bold text-gym-text mb-1">Gym Profile</h2>
            <p className="text-sm text-gym-text-muted mb-6">Manage your gym information and branding</p>
            <div className="max-w-2xl space-y-4">
              <div>
                <label className="block text-xs text-gym-text-muted mb-1.5">Gym Name</label>
                <input type="text" defaultValue="Undisputed Boxing Gym" className="w-full px-3 py-2 bg-gym-card border border-gym-border rounded-lg text-sm text-gym-text focus:outline-none focus:border-gym-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gym-text-muted mb-1.5">Email</label>
                  <input type="email" defaultValue="info@undisputedboxinggym.com" className="w-full px-3 py-2 bg-gym-card border border-gym-border rounded-lg text-sm text-gym-text focus:outline-none focus:border-gym-primary" />
                </div>
                <div>
                  <label className="block text-xs text-gym-text-muted mb-1.5">Phone</label>
                  <input type="tel" defaultValue="+1 (555) 100-2000" className="w-full px-3 py-2 bg-gym-card border border-gym-border rounded-lg text-sm text-gym-text focus:outline-none focus:border-gym-primary" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gym-text-muted mb-1.5">Address</label>
                <input type="text" defaultValue="1234 Main Street, Los Angeles, CA 90012" className="w-full px-3 py-2 bg-gym-card border border-gym-border rounded-lg text-sm text-gym-text focus:outline-none focus:border-gym-primary" />
              </div>
              <div>
                <label className="block text-xs text-gym-text-muted mb-1.5">Website</label>
                <input type="url" defaultValue="https://undisputedboxinggym.com" className="w-full px-3 py-2 bg-gym-card border border-gym-border rounded-lg text-sm text-gym-text focus:outline-none focus:border-gym-primary" />
              </div>
              <div>
                <label className="block text-xs text-gym-text-muted mb-1.5">Description</label>
                <textarea rows={3} defaultValue="Premier boxing and fitness gym offering classes for all skill levels. Home of champions since 2018."
                  className="w-full px-3 py-2 bg-gym-card border border-gym-border rounded-lg text-sm text-gym-text focus:outline-none focus:border-gym-primary resize-none" />
              </div>
              <button className="flex items-center gap-2 bg-gym-primary hover:bg-gym-primary/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </div>
        )}

        {activeTab === 'plans' && (
          <div>
            <h2 className="text-xl font-bold text-gym-text mb-1">Membership Plans</h2>
            <p className="text-sm text-gym-text-muted mb-6">Configure pricing and plan features</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
              {plans.map(plan => (
                <div key={plan.name} className="p-4 bg-gym-card border border-gym-border rounded-xl hover:border-gym-primary/50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-gym-text">{plan.name}</h3>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-gym-primary">${plan.price}</span>
                      <span className="text-xs text-gym-text-muted">/{plan.name === 'Trial' ? 'week' : 'mo'}</span>
                    </div>
                  </div>
                  <ul className="space-y-1.5">
                    {plan.features.map(f => (
                      <li key={f} className="text-xs text-gym-text-secondary flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-gym-primary" />{f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            <h2 className="text-xl font-bold text-gym-text mb-1">Notifications</h2>
            <p className="text-sm text-gym-text-muted mb-6">Configure alerts and automated messaging</p>
            <div className="max-w-2xl space-y-4">
              {[
                { label: 'Payment failure alerts', desc: 'Get notified when a member payment fails', icon: <CreditCard className="w-4 h-4" />, on: true },
                { label: 'New lead notifications', desc: 'Alert when a new lead comes in', icon: <Mail className="w-4 h-4" />, on: true },
                { label: 'At-risk member alerts', desc: 'Flag when a member risk score exceeds threshold', icon: <Shield className="w-4 h-4" />, on: true },
                { label: 'Daily briefing email', desc: 'Receive a daily summary of gym activity', icon: <Bell className="w-4 h-4" />, on: false },
                { label: 'Automated follow-up SMS', desc: 'Send SMS to leads after 24hr no-response', icon: <MessageSquare className="w-4 h-4" />, on: true },
                { label: 'Class reminder emails', desc: 'Send reminders 2 hours before class', icon: <Mail className="w-4 h-4" />, on: true },
              ].map(n => (
                <div key={n.label} className="flex items-center justify-between p-4 bg-gym-card border border-gym-border rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="text-gym-text-muted">{n.icon}</div>
                    <div>
                      <p className="text-sm font-medium text-gym-text">{n.label}</p>
                      <p className="text-xs text-gym-text-muted">{n.desc}</p>
                    </div>
                  </div>
                  <div className={`w-10 h-6 rounded-full flex items-center px-0.5 cursor-pointer transition-colors ${n.on ? 'bg-gym-primary justify-end' : 'bg-gym-border justify-start'}`}>
                    <div className="w-5 h-5 bg-white rounded-full shadow" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'integrations' && (
          <div>
            <h2 className="text-xl font-bold text-gym-text mb-1">Integrations</h2>
            <p className="text-sm text-gym-text-muted mb-6">Connect external services and tools</p>
            <div className="max-w-2xl space-y-3">
              {integrations.map(i => (
                <div key={i.name} className="flex items-center justify-between p-4 bg-gym-card border border-gym-border rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gym-bg rounded-lg flex items-center justify-center"><Plug className="w-4 h-4 text-gym-text-muted" /></div>
                    <div>
                      <p className="text-sm font-medium text-gym-text">{i.name}</p>
                      <p className="text-xs text-gym-text-muted">{i.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium capitalize ${i.color}`}>{i.status}</span>
                    <button className={`px-3 py-1.5 rounded-lg text-xs font-medium ${i.status === 'connected' ? 'bg-gym-bg text-gym-text-secondary border border-gym-border' : 'bg-gym-primary text-white'}`}>
                      {i.status === 'connected' ? 'Configure' : 'Connect'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'staff' && (
          <div>
            <h2 className="text-xl font-bold text-gym-text mb-1">Staff & Roles</h2>
            <p className="text-sm text-gym-text-muted mb-6">Manage team members and permissions</p>
            <div className="max-w-3xl bg-gym-card border border-gym-border rounded-xl overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-gym-border">
                    <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">Name</th>
                    <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">Role</th>
                    <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">Email</th>
                    <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map(s => (
                    <tr key={s.name} className="border-b border-gym-border/50 hover:bg-gym-bg/50 cursor-pointer">
                      <td className="p-3 text-sm font-medium text-gym-text">{s.name}</td>
                      <td className="p-3 text-sm text-gym-text-secondary">{s.role}</td>
                      <td className="p-3 text-xs text-gym-text-muted">{s.email}</td>
                      <td className="p-3"><span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full capitalize">{s.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div>
            <h2 className="text-xl font-bold text-gym-text mb-1">Security</h2>
            <p className="text-sm text-gym-text-muted mb-6">Manage access and security settings</p>
            <div className="max-w-2xl space-y-4">
              {[
                { label: 'Two-factor authentication', desc: 'Require 2FA for all admin accounts', on: true },
                { label: 'Session timeout', desc: 'Auto-logout after 30 minutes of inactivity', on: true },
                { label: 'API access logging', desc: 'Log all API requests for audit', on: false },
                { label: 'IP allowlist', desc: 'Restrict dashboard access to specific IPs', on: false },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between p-4 bg-gym-card border border-gym-border rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gym-text">{s.label}</p>
                    <p className="text-xs text-gym-text-muted">{s.desc}</p>
                  </div>
                  <div className={`w-10 h-6 rounded-full flex items-center px-0.5 cursor-pointer transition-colors ${s.on ? 'bg-gym-primary justify-end' : 'bg-gym-border justify-start'}`}>
                    <div className="w-5 h-5 bg-white rounded-full shadow" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
