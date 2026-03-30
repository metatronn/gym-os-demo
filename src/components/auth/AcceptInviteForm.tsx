"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthShell from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
          <Button variant="link" asChild className="h-auto p-0">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </p>
      }
    >
      {error ? (
        <div className="mb-5 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {hint ? (
        <div className="mb-5 rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
          {hint}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name">
            Full name
            <span className="ml-2 text-xs text-muted-foreground">
              (optional)
            </span>
          </Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            placeholder="Your name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">
            Password
            <span className="ml-2 text-xs text-muted-foreground">
              (only required if you&apos;re new)
            </span>
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            placeholder="Set a password"
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Joining workspace..." : "Accept invite"}
        </Button>
      </form>
    </AuthShell>
  );
}
