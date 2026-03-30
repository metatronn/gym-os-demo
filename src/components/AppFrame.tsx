"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import CommandPanel from "@/components/CommandPanel";
import { TrialBanner } from "@/components/TrialBanner";
import { cn } from "@/lib/utils";

const SHELLLESS_ROUTES = [
  "/",
  "/sign-in",
  "/sign-up",
  "/onboarding",
  "/forgot-password",
  "/reset-password",
  "/accept-invite",
  "/admin",
];

function isShelllessRoute(pathname: string): boolean {
  return SHELLLESS_ROUTES.some(
    (route) =>
      pathname === route || (route !== "/" && pathname.startsWith(`${route}/`)),
  );
}

export default function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (isShelllessRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <div
      className={cn(
        "flex h-screen overflow-hidden bg-background text-foreground",
      )}
    >
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TrialBanner />
        <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">{children}</main>
      </div>
      <CommandPanel />
    </div>
  );
}
