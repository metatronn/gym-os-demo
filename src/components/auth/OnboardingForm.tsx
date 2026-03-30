"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthShell from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
        <div className="mb-5 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="gym-name">Gym name</Label>
          <Input
            id="gym-name"
            type="text"
            value={gymName}
            onChange={(event) => setGymName(event.target.value)}
            required
            maxLength={80}
            placeholder="Undisputed Boxing Gym"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">
            Location
            <span className="ml-2 text-xs text-muted-foreground">
              (optional)
            </span>
          </Label>
          <Input
            id="location"
            type="text"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            maxLength={120}
            placeholder="Los Angeles, CA"
          />
        </div>

        <div className="rounded-2xl border border-border bg-background/60 p-4">
          <p className="text-sm text-foreground">
            We&apos;ll create a workspace for{" "}
            <span className="font-semibold text-primary">
              {gymName || "your gym"}
            </span>
            {location ? (
              <span className="text-muted-foreground"> in {location}</span>
            ) : null}
            .
          </p>
        </div>

        <Button
          type="submit"
          disabled={loading || !gymName.trim()}
          className="w-full"
        >
          {loading ? "Creating gym..." : "Start free trial"}
        </Button>
      </form>
    </AuthShell>
  );
}
