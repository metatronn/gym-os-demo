"use client";

import Link from "next/link";
import { useState } from "react";
import AuthShell from "@/components/auth/AuthShell";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "We couldn't start the reset flow.");
        setLoading(false);
        return;
      }

      setSuccess(
        "If that email is in GYM OS, we’ve sent password reset instructions.",
      );
      setLoading(false);
    } catch {
      setError("We couldn't start the reset flow.");
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Account Recovery"
      title="Reset your password"
      description="Enter your email and we’ll send you a secure reset link."
      footer={
        <p>
          Back to{" "}
          <Link href="/sign-in" className="text-gym-accent hover:underline">
            sign in
          </Link>
        </p>
      }
    >
      {error ? (
        <div className="mb-5 rounded-xl border border-gym-danger/20 bg-gym-danger/10 px-4 py-3 text-sm text-gym-danger">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mb-5 rounded-xl border border-gym-primary/20 bg-gym-primary/10 px-4 py-3 text-sm text-gym-accent">
          {success}
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

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gym-primary px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-gym-primary/85 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Sending reset link..." : "Send reset link"}
        </button>
      </form>
    </AuthShell>
  );
}
