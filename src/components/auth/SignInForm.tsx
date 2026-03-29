"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import AuthShell from "@/components/auth/AuthShell";

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        redirectTo?: string;
      };

      if (!response.ok) {
        setError(payload.error ?? "We couldn't sign you in.");
        setLoading(false);
        return;
      }

      router.push(payload.redirectTo ?? "/dashboard");
      router.refresh();
    } catch {
      setError("We couldn't sign you in.");
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Welcome Back"
      title="Sign in to GYM OS"
      description="Access your gym workspace, team tools, and member operations."
      footer={
        <p>
          New here?{" "}
          <Link href="/sign-up" className="text-gym-accent hover:underline">
            Create an account
          </Link>
        </p>
      }
    >
      {searchParams.get("verified") === "1" ? (
        <div className="mb-5 rounded-xl border border-gym-primary/20 bg-gym-primary/10 px-4 py-3 text-sm text-gym-accent">
          Your email is verified. You can sign in now.
        </div>
      ) : null}

      {error ? (
        <div className="mb-5 rounded-xl border border-gym-danger/20 bg-gym-danger/10 px-4 py-3 text-sm text-gym-danger">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-gym-text-secondary">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            className="w-full rounded-xl border border-gym-border bg-gym-bg px-4 py-3 text-gym-text outline-none transition-colors focus:border-gym-primary"
            placeholder="owner@ironjawboxing.com"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label className="block text-sm font-medium text-gym-text-secondary">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-gym-accent hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            className="w-full rounded-xl border border-gym-border bg-gym-bg px-4 py-3 text-gym-text outline-none transition-colors focus:border-gym-primary"
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gym-primary px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-gym-primary/85 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}
