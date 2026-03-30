import { AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function FeedbackMessage({
  message,
  type,
}: {
  message: string;
  type: "success" | "error";
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
        type === "success"
          ? "bg-success/20 text-success"
          : "bg-destructive/20 text-destructive",
      )}
    >
      {type === "success" ? (
        <CheckCircle className="h-4 w-4" />
      ) : (
        <AlertCircle className="h-4 w-4" />
      )}
      {message}
    </div>
  );
}

export function formatCurrency(amount: number | null, currency: string | null) {
  if (amount === null || !currency) {
    return "Custom";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

export function formatDateTime(value: string | null) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatRelativeTime(value: string) {
  const then = new Date(value).getTime();
  const diffMinutes = Math.round((Date.now() - then) / 60_000);

  if (diffMinutes < 1) {
    return "Just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}

export function summarizeUserAgent(userAgent: string | null) {
  if (!userAgent) {
    return "Unknown device";
  }

  if (/iphone|ipad|ios/i.test(userAgent)) {
    return "iPhone / iPad";
  }

  if (/android/i.test(userAgent)) {
    return "Android";
  }

  if (/mac os/i.test(userAgent)) {
    return "macOS";
  }

  if (/windows/i.test(userAgent)) {
    return "Windows";
  }

  if (/linux/i.test(userAgent)) {
    return "Linux";
  }

  return "Browser session";
}
