"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
      <div className="border-b border-destructive/20 bg-destructive/10 px-4 py-2 text-center text-sm text-destructive">
        <Badge variant="destructive" className="mr-2">
          Expired
        </Badge>
        Your trial has expired.{" "}
        <Button
          variant="link"
          asChild
          className="h-auto p-0 text-destructive font-medium"
        >
          <Link href="/billing">Upgrade now</Link>
        </Button>{" "}
        to keep the gym online.
      </div>
    );
  }

  return (
    <div className="border-b border-primary/20 bg-primary/10 px-4 py-2 text-center text-sm text-accent-foreground">
      <Badge variant="default" className="mr-2">
        Trial
      </Badge>
      {daysLeft} day{daysLeft !== 1 ? "s" : ""} left in your free trial.{" "}
      <Button variant="link" asChild className="h-auto p-0 font-medium">
        <Link href="/billing">Upgrade now</Link>
      </Button>
      .
    </div>
  );
}
