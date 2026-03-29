"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  OrganizationSwitcher,
  UserButton,
  useOrganization,
  useUser,
} from "@clerk/nextjs";
import { dark } from "@clerk/themes";
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
} from "lucide-react";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  {
    icon: <LayoutDashboard size={20} />,
    label: "Briefing",
    href: "/dashboard",
  },
  { icon: <Users size={20} />, label: "Leads", href: "/leads" },
  { icon: <UserCheck size={20} />, label: "Members", href: "/members" },
  { icon: <Calendar size={20} />, label: "Schedule", href: "/schedule" },
  { icon: <MapPin size={20} />, label: "Floor Plan", href: "/floor-plan" },
  { icon: <CreditCard size={20} />, label: "Billing", href: "/billing" },
  { icon: <MessageSquare size={20} />, label: "Messages", href: "/messages" },
  { icon: <CheckSquare size={20} />, label: "Tasks", href: "/tasks" },
  { icon: <BarChart3 size={20} />, label: "Reports", href: "/reports" },
  { icon: <Settings size={20} />, label: "Settings", href: "/settings" },
];

const authEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

function LocalSidebarFooter() {
  return (
    <>
      <p className="text-xs text-gym-text-muted mb-3">Workspace</p>
      <div className="rounded-xl border border-gym-border bg-gym-card/70 p-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gym-text">
            Iron Jaw Boxing
          </p>
          <p className="truncate text-xs text-gym-text-muted mt-1">Owner</p>
        </div>
      </div>
    </>
  );
}

function ClerkSidebarFooter() {
  const { organization } = useOrganization();
  const { user } = useUser();

  return (
    <>
      <p className="text-xs text-gym-text-muted mb-3">Workspace</p>
      <div className="space-y-3">
        <OrganizationSwitcher
          hidePersonal
          afterCreateOrganizationUrl="/onboarding"
          afterLeaveOrganizationUrl="/onboarding"
          afterSelectOrganizationUrl="/dashboard"
          appearance={{
            baseTheme: dark,
            elements: {
              rootBox: "w-full",
              organizationSwitcherTrigger:
                "w-full justify-between rounded-xl border border-gym-border bg-gym-card px-3 py-2 text-gym-text hover:bg-gym-bg",
              organizationPreviewMainIdentifier:
                "text-sm font-medium text-gym-text",
              organizationPreviewSecondaryIdentifier:
                "text-xs text-gym-text-muted",
            },
          }}
        />

        <div className="rounded-xl border border-gym-border bg-gym-card/70 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gym-text">
                {organization?.name ?? "Choose a gym"}
              </p>
              <p className="truncate text-xs text-gym-text-muted mt-1">
                {user?.fullName ??
                  user?.primaryEmailAddress?.emailAddress ??
                  "Signed in"}
              </p>
            </div>
            <UserButton
              afterSignOutUrl="/sign-in"
              appearance={{ baseTheme: dark }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

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
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo - desktop only */}
        <div className="hidden lg:block p-6 border-b border-gym-border">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gym-text">GYM</span>
            <span className="text-xl font-bold text-gym-primary">OS</span>
          </div>
          <p className="text-xs text-gym-text-muted mt-1">
            AI Operating System
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-gym-primary text-white"
                        : "text-gym-text-secondary hover:bg-gym-card"
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
          {authEnabled ? <ClerkSidebarFooter /> : <LocalSidebarFooter />}
        </div>
      </aside>
    </>
  );
}
