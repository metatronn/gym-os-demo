"use client";

import Link from "next/link";
import { useState } from "react";
import AuthShell from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
        "If that email is in GYM OS, we've sent password reset instructions.",
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
      description="Enter your email and we'll send you a secure reset link."
      footer={
        <p>
          Back to{" "}
          <Button variant="link" asChild className="h-auto p-0">
            <Link href="/sign-in">sign in</Link>
          </Button>
        </p>
      }
    >
      {error ? (
        <div className="mb-5 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mb-5 rounded-xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
          {success}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            placeholder="owner@ironjawboxing.com"
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Sending reset link..." : "Send reset link"}
        </Button>
      </form>
    </AuthShell>
  );
}
