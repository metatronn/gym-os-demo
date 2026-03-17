'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  MapPin,
  CreditCard,
  MessageSquare,
  CheckSquare,
  BarChart3,
  Settings,
  Menu,
  X,
} from 'lucide-react';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { icon: <LayoutDashboard size={20} />, label: 'Briefing', href: '/dashboard' },
  { icon: <Users size={20} />, label: 'Leads', href: '/leads' },
  { icon: <UserCheck size={20} />, label: 'Members', href: '/members' },
  { icon: <Calendar size={20} />, label: 'Schedule', href: '/schedule' },
  { icon: <MapPin size={20} />, label: 'Floor Plan', href: '/floor-plan' },
  { icon: <CreditCard size={20} />, label: 'Billing', href: '/billing' },
  { icon: <MessageSquare size={20} />, label: 'Messages', href: '/messages' },
  { icon: <CheckSquare size={20} />, label: 'Tasks', href: '/tasks' },
  { icon: <BarChart3 size={20} />, label: 'Reports', href: '/reports' },
  { icon: <Settings size={20} />, label: 'Settings', href: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 lg:hidden bg-gym-sidebar border-b border-gym-border h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-gym-text">GYM</span>
          <span className="text-xl font-bold text-gym-primary">OS</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-gym-text-secondary hover:text-gym-text rounded-lg hover:bg-gym-card transition-colors"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-14 left-0 bottom-0 z-40 w-64 bg-gym-sidebar border-r border-gym-border flex flex-col transform transition-transform duration-200 ease-in-out lg:static lg:top-0 lg:transform-none lg:h-screen ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo - desktop only */}
        <div className="hidden lg:block p-6 border-b border-gym-border">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gym-text">GYM</span>
            <span className="text-xl font-bold text-gym-primary">OS</span>
          </div>
          <p className="text-xs text-gym-text-muted mt-1">AI Operating System</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-gym-primary text-white'
                        : 'text-gym-text-secondary hover:bg-gym-card'
                    }`}
                  >
                    {item.icon}
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Agents Online */}
        <div className="p-6 border-t border-gym-border">
          <p className="text-xs text-gym-text-muted mb-3">Agents Online</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gym-success rounded-full animate-pulse"></div>
              <span className="text-sm text-gym-text">Sales</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gym-success rounded-full animate-pulse"></div>
              <span className="text-sm text-gym-text">Retention</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
