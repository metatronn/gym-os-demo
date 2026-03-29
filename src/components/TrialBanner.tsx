"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SubscriptionPayload = {
  subscriptionStatus: string;
  trialEndsAt: string | null;
  isActive: boolean;
  isTrialExpired: boolean;
} | null;

export function TrialBanner() {
  const [subscription, setSubscription] = useState<
    SubscriptionPayload | undefined
  >(undefined);

  useEffect(() => {
    let active = true;

    async function loadSubscription() {
      try {
        const response = await fetch("/api/tenant/subscription", {
          cache: "no-store",
        });

        if (!response.ok) {
          if (active) {
            setSubscription(null);
          }
          return;
        }

        const payload = (await response.json()) as {
          subscription: SubscriptionPayload;
        };

        if (active) {
          setSubscription(payload.subscription);
        }
      } catch {
        if (active) {
          setSubscription(null);
        }
      }
    }

    void loadSubscription();

    return () => {
      active = false;
    };
  }, []);

  if (
    subscription === undefined ||
    !subscription ||
    subscription.subscriptionStatus !== "trialing" ||
    !subscription.trialEndsAt
  ) {
    return null;
  }

  const daysLeft = Math.ceil(
    (new Date(subscription.trialEndsAt).getTime() - Date.now()) /
      (1000 * 60 * 60 * 24),
  );

  if (daysLeft <= 0) {
    return (
      <div className="border-b border-gym-danger/20 bg-gym-danger/10 px-4 py-2 text-center text-sm text-gym-danger">
        Your trial has expired.{" "}
        <Link href="/billing" className="font-medium underline">
          Upgrade now
        </Link>{" "}
        to keep the gym online.
      </div>
    );
  }

  return (
    <div className="border-b border-gym-primary/20 bg-gym-primary/10 px-4 py-2 text-center text-sm text-gym-accent">
      {daysLeft} day{daysLeft !== 1 ? "s" : ""} left in your free trial.{" "}
      <Link href="/billing" className="font-medium underline">
        Upgrade now
      </Link>
      .
    </div>
  );
}
