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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

function getInitials(
  name: string | null | undefined,
  email: string | null | undefined,
): string {
  if (name) {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  if (email) {
    return email[0].toUpperCase();
  }
  return "?";
}

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
      <p className="mb-3 text-xs text-muted-foreground">Workspace</p>

      <div className="space-y-3">
        <div className="rounded-xl border border-border bg-card/70 p-3">
          <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Active gym
          </label>
          <Select
            value={session?.activeTenant?.tenantId ?? ""}
            onValueChange={(value) => void handleTenantSwitch(value)}
            disabled={switching || !session || session.memberships.length === 0}
          >
            <SelectTrigger
              className={cn("w-full", switching && "[&>svg]:animate-spin")}
            >
              <SelectValue placeholder="No gyms yet" />
            </SelectTrigger>
            <SelectContent>
              {session?.memberships.length ? (
                session.memberships.map((membership) => (
                  <SelectItem
                    key={membership.tenantId}
                    value={membership.tenantId}
                  >
                    {membership.tenantName}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="__none__" disabled>
                  No gyms yet
                </SelectItem>
              )}
            </SelectContent>
          </Select>

          <Badge variant="secondary" className="mt-2">
            {session?.activeTenant?.role ?? "Create a gym to get started"}
          </Badge>
        </div>

        <div className="rounded-xl border border-border bg-card/70 p-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {getInitials(session?.user?.fullName, session?.user?.email)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {session?.user?.fullName ?? session?.user?.email ?? "Signed in"}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {session?.user?.email ?? "Loading account"}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleSignOut()}
            disabled={signingOut}
            className="mt-3"
          >
            <LogOut size={14} />
            {signingOut ? "Signing out..." : "Sign out"}
          </Button>
        </div>

        {error ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
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
      <header className="fixed top-0 left-0 right-0 z-50 lg:hidden bg-sidebar border-b border-border h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-foreground">GYM</span>
          <span className="text-xl font-bold text-primary">OS</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
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
        className={cn(
          "fixed top-14 left-0 bottom-0 z-40 w-64 bg-sidebar border-r border-border flex flex-col transform transition-transform duration-200 ease-in-out lg:static lg:top-0 lg:transform-none lg:h-screen",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Logo - desktop only */}
        <div className="hidden lg:block p-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-foreground">GYM</span>
            <span className="text-xl font-bold text-primary">OS</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            AI Operating System
          </p>
        </div>

        <Separator className="hidden lg:block" />

        {/* Navigation */}
        <ScrollArea className="flex-1 py-6">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground",
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </ScrollArea>

        <Separator />

        {/* Workspace Footer */}
        <div className="p-6">
          <NativeSidebarFooter />
        </div>
      </aside>
    </>
  );
}
