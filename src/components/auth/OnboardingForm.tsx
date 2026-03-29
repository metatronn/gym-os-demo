"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthShell from "@/components/auth/AuthShell";

export default function OnboardingForm() {
  const router = useRouter();
  const [gymName, setGymName] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/tenants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: gymName,
          location,
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        redirectTo?: string;
      };

      if (!response.ok) {
        setError(payload.error ?? "We couldn't create your gym.");
        setLoading(false);
        return;
      }

      router.push(payload.redirectTo ?? "/dashboard");
      router.refresh();
    } catch {
      setError("We couldn't create your gym.");
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Launch Your Gym"
      title="Set up your first workspace"
      description="Your 14-day trial starts as soon as the gym is created. No card required up front."
    >
      {error ? (
        <div className="mb-5 rounded-xl border border-gym-danger/20 bg-gym-danger/10 px-4 py-3 text-sm text-gym-danger">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-gym-text-secondary">
            Gym name
          </label>
          <input
            type="text"
            value={gymName}
            onChange={(event) => setGymName(event.target.value)}
            required
            maxLength={80}
            className="w-full rounded-xl border border-gym-border bg-gym-bg px-4 py-3 text-gym-text outline-none transition-colors focus:border-gym-primary"
            placeholder="Undisputed Boxing Gym"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gym-text-secondary">
            Location
            <span className="ml-2 text-xs text-gym-text-muted">(optional)</span>
          </label>
          <input
            type="text"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            maxLength={120}
            className="w-full rounded-xl border border-gym-border bg-gym-bg px-4 py-3 text-gym-text outline-none transition-colors focus:border-gym-primary"
            placeholder="Los Angeles, CA"
          />
        </div>

        <div className="rounded-2xl border border-gym-border bg-gym-bg/60 p-4">
          <p className="text-sm text-gym-text">
            We&apos;ll create a workspace for{" "}
            <span className="font-semibold text-white">
              {gymName || "your gym"}
            </span>
            {location ? (
              <span className="text-gym-text-secondary"> in {location}</span>
            ) : null}
            .
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !gymName.trim()}
          className="w-full rounded-xl bg-gym-primary px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-gym-primary/85 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Creating gym..." : "Start free trial"}
        </button>
      </form>
    </AuthShell>
  );
}
