"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useOrganization, useOrganizationList } from "@clerk/nextjs";

const authEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function ClerkOnboardingPage() {
  const router = useRouter();
  const { organization } = useOrganization();
  const { isLoaded, createOrganization, setActive, userMemberships } =
    useOrganizationList({
      userMemberships: true,
    });
  const [gymName, setGymName] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const firstMembershipOrgId = useMemo(
    () => userMemberships.data?.[0]?.organization.id ?? null,
    [userMemberships.data],
  );

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const existingOrgId = organization?.id ?? firstMembershipOrgId;

    if (!existingOrgId) {
      return;
    }

    async function continueToDashboard() {
      if (!organization?.id && setActive) {
        await setActive({ organization: existingOrgId });
      }

      router.replace("/dashboard");
    }

    void continueToDashboard();
  }, [firstMembershipOrgId, isLoaded, organization?.id, router, setActive]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!createOrganization || !setActive) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const org = await createOrganization({
        name: gymName.trim(),
        slug: slugify(gymName),
      });

      await setActive({ organization: org.id });

      // Give the Clerk webhook a brief moment to create the tenant row
      // before the trial banner checks subscription state.
      await new Promise((resolve) => setTimeout(resolve, 800));

      router.push("/dashboard");
    } catch (cause) {
      const description =
        cause instanceof Error
          ? cause.message
          : "We couldn't create the gym yet. Please try again.";

      setError(description);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gym-bg px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl rounded-3xl border border-gym-border bg-gym-card/85 p-8 shadow-2xl"
      >
        <p className="text-xs uppercase tracking-[0.24em] text-gym-accent mb-3">
          Launch your gym OS
        </p>
        <h1 className="text-3xl font-bold text-gym-text mb-3">
          Set up your gym
        </h1>
        <p className="text-sm text-gym-text-secondary mb-8">
          Your 14-day free trial starts as soon as the organization is created.
          No card required up front.
        </p>

        <label className="block text-sm font-medium text-gym-text-secondary mb-2">
          Gym name
        </label>
        <input
          type="text"
          value={gymName}
          onChange={(event) => setGymName(event.target.value)}
          required
          maxLength={80}
          className="mb-5 w-full rounded-xl border border-gym-border bg-gym-bg px-4 py-3 text-gym-text outline-none transition-colors focus:border-gym-primary"
          placeholder="e.g. Undisputed Boxing Gym"
        />

        <label className="block text-sm font-medium text-gym-text-secondary mb-2">
          Location
          <span className="ml-2 text-xs text-gym-text-muted">(optional)</span>
        </label>
        <input
          type="text"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          maxLength={120}
          className="mb-6 w-full rounded-xl border border-gym-border bg-gym-bg px-4 py-3 text-gym-text outline-none transition-colors focus:border-gym-primary"
          placeholder="Los Angeles, CA"
        />

        <div className="rounded-2xl border border-gym-border bg-gym-bg/60 p-4 mb-6">
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

        {error ? (
          <div className="mb-5 rounded-xl border border-gym-danger/20 bg-gym-danger/10 px-4 py-3 text-sm text-gym-danger">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading || !gymName.trim()}
          className="w-full rounded-xl bg-gym-primary px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-gym-primary/85 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Creating your gym..." : "Start free trial"}
        </button>
      </form>
    </div>
  );
}

export default function OnboardingPage() {
  if (!authEnabled) {
    if (typeof window !== "undefined") {
      window.location.replace("/dashboard");
    }
    return null;
  }

  return <ClerkOnboardingPage />;
}
