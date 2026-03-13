'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  CreditCard,
  MessageSquare,
  CheckSquare,
  BarChart3,
  Settings,
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
  { icon: <CreditCard size={20} />, label: 'Billing', href: '/billing' },
  { icon: <MessageSquare size={20} />, label: 'Messages', href: '/messages' },
  { icon: <CheckSquare size={20} />, label: 'Tasks', href: '/tasks' },
  { icon: <BarChart3 size={20} />, label: 'Reports', href: '/reports' },
  { icon: <Settings size={20} />, label: 'Settings', href: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gym-sidebar border-r border-gym-border flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-gym-border">
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
  );
}
