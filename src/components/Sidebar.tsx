"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
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
  LogOut,
  RefreshCw,
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

type SessionPayload = {
  user: {
    id: string;
    email: string;
    fullName: string | null;
  } | null;
  activeTenant: {
    id: string;
    tenantId: string;
    tenantName: string;
    role: string;
  } | null;
  memberships: Array<{
    id: string;
    tenantId: string;
    tenantName: string;
    role: string;
  }>;
};

function NativeSidebarFooter() {
  const router = useRouter();
  const [session, setSession] = useState<SessionPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [switching, setSwitching] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      try {
        const response = await fetch("/api/auth/session", {
          cache: "no-store",
        });

        if (!response.ok) {
          if (active) {
            setSession(null);
          }
          return;
        }

        const payload = (await response.json()) as SessionPayload;

        if (active) {
          setSession(payload);
        }
      } catch {
        if (active) {
          setSession(null);
        }
      }
    }

    void loadSession();

    return () => {
      active = false;
    };
  }, []);

  async function handleTenantSwitch(nextTenantId: string) {
    if (!nextTenantId || nextTenantId === session?.activeTenant?.tenantId) {
      return;
    }

    setSwitching(true);
    setError(null);

    try {
      const response = await fetch("/api/tenants/switch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tenantId: nextTenantId,
        }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "We couldn't switch gyms.");
        setSwitching(false);
        return;
      }

      setSession((current) => {
        if (!current) {
          return current;
        }

        const nextActiveTenant =
          current.memberships.find(
            (membership) => membership.tenantId === nextTenantId,
          ) ?? null;

        return {
          ...current,
          activeTenant: nextActiveTenant,
        };
      });
      router.refresh();
      setSwitching(false);
    } catch {
      setError("We couldn't switch gyms.");
      setSwitching(false);
    }
  }

  async function handleSignOut() {
    setSigningOut(true);

    try {
      await fetch("/api/auth/sign-out", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
    } finally {
      router.push("/sign-in");
      router.refresh();
      setSigningOut(false);
    }
  }

  return (
    <>
      <p className="mb-3 text-xs text-gym-text-muted">Workspace</p>

      <div className="space-y-3">
        <div className="rounded-xl border border-gym-border bg-gym-card/70 p-3">
          <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-gym-text-muted">
            Active gym
          </label>
          <div className="relative">
            <select
              value={session?.activeTenant?.tenantId ?? ""}
              onChange={(event) => void handleTenantSwitch(event.target.value)}
              disabled={
                switching || !session || session.memberships.length === 0
              }
              className="w-full appearance-none rounded-lg border border-gym-border bg-gym-bg px-3 py-2 pr-10 text-sm text-gym-text outline-none transition-colors focus:border-gym-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {session?.memberships.length ? (
                session.memberships.map((membership) => (
                  <option key={membership.tenantId} value={membership.tenantId}>
                    {membership.tenantName}
                  </option>
                ))
              ) : (
                <option value="">No gyms yet</option>
              )}
            </select>
            <RefreshCw
              size={14}
              className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gym-text-muted ${
                switching ? "animate-spin" : ""
              }`}
            />
          </div>

          <p className="mt-2 truncate text-xs text-gym-text-muted">
            {session?.activeTenant?.role ?? "Create a gym to get started"}
          </p>
        </div>

        <div className="rounded-xl border border-gym-border bg-gym-card/70 p-3">
          <p className="truncate text-sm font-medium text-gym-text">
            {session?.user?.fullName ?? session?.user?.email ?? "Signed in"}
          </p>
          <p className="mt-1 truncate text-xs text-gym-text-muted">
            {session?.user?.email ?? "Loading account"}
          </p>

          <button
            type="button"
            onClick={() => void handleSignOut()}
            disabled={signingOut}
            className="mt-3 inline-flex items-center gap-2 rounded-lg border border-gym-border px-3 py-2 text-sm text-gym-text-secondary transition-colors hover:bg-gym-bg disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut size={14} />
            {signingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>

        {error ? (
          <div className="rounded-xl border border-gym-danger/20 bg-gym-danger/10 px-3 py-2 text-xs text-gym-danger">
            {error}
          </div>
        ) : null}
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
          <NativeSidebarFooter />
        </div>
      </aside>
    </>
  );
}
