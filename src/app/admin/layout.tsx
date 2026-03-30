import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { LOCAL_DEV_EMAIL } from "@/lib/env";

const ADMIN_DOMAIN = "@gymos.app";

async function isPlatformAdmin(userId: string): Promise<boolean> {
  const [user] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user?.email) return false;

  // In local dev, allow the seed user
  if (LOCAL_DEV_EMAIL && user.email === LOCAL_DEV_EMAIL) {
    return true;
  }

  // In production, allow @gymos.app emails
  return user.email.endsWith(ADMIN_DOMAIN);
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await requireAuth({ requireOrg: false });

  const allowed = await isPlatformAdmin(userId);

  if (!allowed) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <header className="border-b border-white/10 bg-[#12121a]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-white">GYM OS Admin</h1>
            <nav className="flex items-center gap-3 text-sm">
              <Link
                href="/admin"
                className="text-gray-400 transition-colors hover:text-white"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/tenants"
                className="text-gray-400 transition-colors hover:text-white"
              >
                Tenants
              </Link>
            </nav>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-gray-400 transition-colors hover:text-white"
          >
            &larr; Back to App
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
