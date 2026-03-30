import posthog from "posthog-js";

type EventProperties = Record<string, string | number | boolean | null>;

export function trackEvent(name: string, properties?: EventProperties) {
  if (typeof window === "undefined") return;
  try {
    posthog.capture(name, properties);
  } catch {
    // PostHog not initialized — ignore
  }
}

export function identifyUser(userId: string, properties?: EventProperties) {
  if (typeof window === "undefined") return;
  try {
    posthog.identify(userId, properties);
  } catch {
    // PostHog not initialized — ignore
  }
}
