"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

type SessionPayload = {
  user: {
    id: string;
    email: string;
    fullName: string | null;
  } | null;
  activeTenant: {
    id: string;
    tenantId: string;
    tenantName: string;
    role: string;
  } | null;
};

export default function SentryScopeLoader() {
  useEffect(() => {
    let active = true;

    async function loadSession() {
      try {
        const response = await fetch("/api/auth/session", {
          cache: "no-store",
        });

        if (!active) {
          return;
        }

        if (!response.ok) {
          Sentry.setUser(null);
          Sentry.setTag("tenant_id", "anonymous");
          return;
        }

        const payload = (await response.json()) as SessionPayload;

        Sentry.setUser(
          payload.user
            ? {
                id: payload.user.id,
                email: payload.user.email,
              }
            : null,
        );
        Sentry.setTag("tenant_id", payload.activeTenant?.tenantId ?? "none");
      } catch {
        if (!active) {
          return;
        }

        Sentry.setUser(null);
      }
    }

    void loadSession();

    return () => {
      active = false;
    };
  }, []);

  return null;
}
