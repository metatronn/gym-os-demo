"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthShell from "@/components/auth/AuthShell";

type AcceptInviteFormProps = {
  token: string;
};

export default function AcceptInviteForm({ token }: AcceptInviteFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setHint(null);

    try {
      const response = await fetch("/api/tenants/accept-invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          name,
          password,
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        redirectTo?: string;
        requiresPassword?: boolean;
        tenantName?: string;
      };

      if (!response.ok) {
        setError(payload.error ?? "We couldn't accept this invite.");

        if (payload.requiresPassword) {
          setHint(
            payload.tenantName
              ? `Set a password to join ${payload.tenantName}.`
              : "Set a password to accept this invite.",
          );
        }

        setLoading(false);
        return;
      }

      router.push(payload.redirectTo ?? "/dashboard");
      router.refresh();
    } catch {
      setError("We couldn't accept this invite.");
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Team Access"
      title="Accept your invite"
      description="If you already have a password, you can leave that field blank. New teammates should set one now."
      footer={
        <p>
          Need to use a different account?{" "}
          <Link href="/sign-in" className="text-gym-accent hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      {error ? (
        <div className="mb-5 rounded-xl border border-gym-danger/20 bg-gym-danger/10 px-4 py-3 text-sm text-gym-danger">
          {error}
        </div>
      ) : null}

      {hint ? (
        <div className="mb-5 rounded-xl border border-gym-primary/20 bg-gym-primary/10 px-4 py-3 text-sm text-gym-accent">
          {hint}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-gym-text-secondary">
            Full name
            <span className="ml-2 text-xs text-gym-text-muted">(optional)</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            className="w-full rounded-xl border border-gym-border bg-gym-bg px-4 py-3 text-gym-text outline-none transition-colors focus:border-gym-primary"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gym-text-secondary">
            Password
            <span className="ml-2 text-xs text-gym-text-muted">
              (only required if you&apos;re new)
            </span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            className="w-full rounded-xl border border-gym-border bg-gym-bg px-4 py-3 text-gym-text outline-none transition-colors focus:border-gym-primary"
            placeholder="Set a password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gym-primary px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-gym-primary/85 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Joining workspace..." : "Accept invite"}
        </button>
      </form>
    </AuthShell>
  );
}
