"use client";

import { useState, useTransition } from "react";
import {
  Building2,
  CreditCard,
  Bell,
  Plug,
  Users,
  Shield,
  Save,
  Mail,
  MessageSquare,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import type { SettingsData, NotificationSettings } from "./actions";
import {
  updateGymProfile,
  updateNotificationSettings,
  updateSlackWebhook,
  testSlackWebhook,
} from "./actions";
import { StaffTab, SecurityTab } from "./settings-static-tabs";

// ── Tab Config ──

const tabs = [
  { id: "gym", label: "Gym Profile", icon: <Building2 className="w-4 h-4" /> },
  {
    id: "plans",
    label: "Membership Plans",
    icon: <CreditCard className="w-4 h-4" />,
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: <Bell className="w-4 h-4" />,
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: <Plug className="w-4 h-4" />,
  },
  { id: "staff", label: "Staff & Roles", icon: <Users className="w-4 h-4" /> },
  { id: "security", label: "Security", icon: <Shield className="w-4 h-4" /> },
];

const mockPlans = [
  {
    name: "Basic",
    price: 99,
    features: ["3x/week classes", "Open gym access", "Locker room"],
  },
  {
    name: "Premium",
    price: 199,
    features: [
      "Unlimited classes",
      "Open gym 24/7",
      "Locker room",
      "1 PT session/month",
      "InBody scan",
    ],
  },
  {
    name: "Unlimited",
    price: 249,
    features: [
      "Everything in Premium",
      "Unlimited PT",
      "Priority booking",
      "Guest passes",
      "Nutrition coaching",
    ],
  },
  {
    name: "Trial",
    price: 29,
    features: ["1 week access", "3 trial classes", "Gym tour", "InBody scan"],
  },
];

// ── Feedback Toast ──

function FeedbackMessage({
  message,
  type,
}: {
  message: string;
  type: "success" | "error";
}) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
        type === "success"
          ? "bg-green-500/20 text-green-400"
          : "bg-red-500/20 text-red-400"
      }`}
    >
      {type === "success" ? (
        <CheckCircle className="w-4 h-4" />
      ) : (
        <AlertCircle className="w-4 h-4" />
      )}
      {message}
    </div>
  );
}

// ── Toggle Component ──

function Toggle({
  on,
  onChange,
  disabled,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={() => onChange(!on)}
      className={`w-10 h-6 rounded-full flex items-center px-0.5 transition-colors ${
        on ? "bg-gym-primary justify-end" : "bg-gym-border justify-start"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <div className="w-5 h-5 bg-white rounded-full shadow" />
    </button>
  );
}

// ── Main Component ──

export default function SettingsClient({ data }: { data: SettingsData }) {
  const [activeTab, setActiveTab] = useState("gym");

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Tab Nav */}
      <div className="lg:w-[240px] border-b lg:border-b-0 lg:border-r border-gym-border p-3 lg:p-4">
        <h1 className="text-lg font-bold text-gym-text mb-3 lg:mb-4 px-1">
          Settings
        </h1>
        <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-1 lg:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 lg:gap-3 px-3 py-2 lg:py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap lg:w-full ${activeTab === tab.id ? "bg-gym-primary/10 text-gym-primary font-medium" : "text-gym-text-secondary hover:text-gym-text hover:bg-gym-bg"}`}
            >
              {tab.icon}
              <span className="text-xs lg:text-sm">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 lg:p-6 overflow-auto">
        {activeTab === "gym" && <GymProfileTab data={data} />}
        {activeTab === "plans" && <PlansTab data={data} />}
        {activeTab === "notifications" && <NotificationsTab data={data} />}
        {activeTab === "integrations" && <IntegrationsTab data={data} />}
        {activeTab === "staff" && <StaffTab />}
        {activeTab === "security" && <SecurityTab />}
      </div>
    </div>
  );
}

// ── Gym Profile Tab ──

function GymProfileTab({ data }: { data: SettingsData }) {
  const [name, setName] = useState(data.tenant.name);
  const [slug, setSlug] = useState(data.tenant.slug ?? "");
  const [feedback, setFeedback] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setFeedback(null);
    startTransition(async () => {
      const result = await updateGymProfile({ name, slug });
      if (result.success) {
        setFeedback({ message: "Profile saved successfully", type: "success" });
      } else {
        setFeedback({
          message: result.error ?? "Failed to save",
          type: "error",
        });
      }
    });
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gym-text mb-1">Gym Profile</h2>
      <p className="text-sm text-gym-text-muted mb-6">
        Manage your gym information and branding
      </p>
      <div className="max-w-2xl space-y-4">
        <div>
          <label className="block text-xs text-gym-text-muted mb-1.5">
            Gym Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-gym-card border border-gym-border rounded-lg text-sm text-gym-text focus:outline-none focus:border-gym-primary"
          />
        </div>
        <div>
          <label className="block text-xs text-gym-text-muted mb-1.5">
            Slug
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="your-gym-name"
            className="w-full px-3 py-2 bg-gym-card border border-gym-border rounded-lg text-sm text-gym-text focus:outline-none focus:border-gym-primary"
          />
          <p className="text-xs text-gym-text-muted mt-1">
            Used in URLs: app.gymos.com/<strong>{slug || "your-slug"}</strong>
          </p>
        </div>

        {feedback && (
          <FeedbackMessage message={feedback.message} type={feedback.type} />
        )}

        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex items-center gap-2 bg-gym-primary hover:bg-gym-primary/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

// ── Plans Tab ──

function PlansTab({ data }: { data: SettingsData }) {
  const { stripeEnabled, stripeConnected } = data.integrations;

  if (stripeEnabled && stripeConnected) {
    return (
      <div>
        <h2 className="text-xl font-bold text-gym-text mb-1">
          Membership Plans
        </h2>
        <p className="text-sm text-gym-text-muted mb-6">
          Manage plans through your Stripe Dashboard
        </p>
        <div className="max-w-2xl">
          <div className="p-6 bg-gym-card border border-gym-border rounded-xl text-center">
            <CreditCard className="w-8 h-8 text-gym-primary mx-auto mb-3" />
            <p className="text-sm text-gym-text mb-2">
              Your Stripe account is connected
            </p>
            <p className="text-xs text-gym-text-muted mb-4">
              Create and manage membership plans, pricing, and coupons directly
              in Stripe.
            </p>
            <a
              href="https://dashboard.stripe.com/products"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gym-primary hover:bg-gym-primary/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Open Stripe Dashboard <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (stripeEnabled && !stripeConnected) {
    return (
      <div>
        <h2 className="text-xl font-bold text-gym-text mb-1">
          Membership Plans
        </h2>
        <p className="text-sm text-gym-text-muted mb-6">
          Configure pricing and plan features
        </p>
        <div className="max-w-2xl">
          <div className="p-6 bg-gym-card border border-gym-border rounded-xl text-center">
            <CreditCard className="w-8 h-8 text-gym-text-muted mx-auto mb-3" />
            <p className="text-sm text-gym-text mb-2">
              Connect Stripe to manage plans
            </p>
            <p className="text-xs text-gym-text-muted mb-4">
              Set up your Stripe account on the Billing page to create and
              manage membership plans.
            </p>
            <a
              href="/billing"
              className="inline-flex items-center gap-2 bg-gym-primary hover:bg-gym-primary/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Go to Billing
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Local dev / Stripe not configured — show mock plans
  return (
    <div>
      <h2 className="text-xl font-bold text-gym-text mb-1">Membership Plans</h2>
      <p className="text-sm text-gym-text-muted mb-6">
        Configure pricing and plan features
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
        {mockPlans.map((plan) => (
          <div
            key={plan.name}
            className="p-4 bg-gym-card border border-gym-border rounded-xl hover:border-gym-primary/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gym-text">{plan.name}</h3>
              <div className="text-right">
                <span className="text-2xl font-bold text-gym-primary">
                  ${plan.price}
                </span>
                <span className="text-xs text-gym-text-muted">
                  /{plan.name === "Trial" ? "week" : "mo"}
                </span>
              </div>
            </div>
            <ul className="space-y-1.5">
              {plan.features.map((f) => (
                <li
                  key={f}
                  className="text-xs text-gym-text-secondary flex items-center gap-2"
                >
                  <div className="w-1 h-1 rounded-full bg-gym-primary" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Notifications Tab ──

function NotificationsTab({ data }: { data: SettingsData }) {
  const [notifications, setNotifications] = useState<NotificationSettings>(
    data.notifications,
  );
  const [feedback, setFeedback] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const items: Array<{
    key: keyof NotificationSettings;
    label: string;
    desc: string;
    icon: React.ReactNode;
  }> = [
    {
      key: "paymentAlerts",
      label: "Payment failure alerts",
      desc: "Get notified when a member payment fails",
      icon: <CreditCard className="w-4 h-4" />,
    },
    {
      key: "leadNotifications",
      label: "New lead notifications",
      desc: "Alert when a new lead comes in",
      icon: <Mail className="w-4 h-4" />,
    },
    {
      key: "atRiskAlerts",
      label: "At-risk member alerts",
      desc: "Flag when a member risk score exceeds threshold",
      icon: <Shield className="w-4 h-4" />,
    },
    {
      key: "dailyDigest",
      label: "Daily briefing email",
      desc: "Receive a daily summary of gym activity",
      icon: <Bell className="w-4 h-4" />,
    },
    {
      key: "followUpSms",
      label: "Automated follow-up SMS",
      desc: "Send SMS to leads after 24hr no-response",
      icon: <MessageSquare className="w-4 h-4" />,
    },
    {
      key: "classReminders",
      label: "Class reminder emails",
      desc: "Send reminders 2 hours before class",
      icon: <Mail className="w-4 h-4" />,
    },
  ];

  function handleToggle(key: keyof NotificationSettings, value: boolean) {
    const updated = { ...notifications, [key]: value };
    setNotifications(updated);
    setFeedback(null);

    startTransition(async () => {
      const result = await updateNotificationSettings(updated);
      if (result.success) {
        setFeedback({
          message: "Notification settings saved",
          type: "success",
        });
      } else {
        // Revert on failure
        setNotifications(notifications);
        setFeedback({
          message: result.error ?? "Failed to save",
          type: "error",
        });
      }
    });
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gym-text mb-1">Notifications</h2>
      <p className="text-sm text-gym-text-muted mb-6">
        Configure alerts and automated messaging
      </p>
      <div className="max-w-2xl space-y-4">
        {feedback && (
          <FeedbackMessage message={feedback.message} type={feedback.type} />
        )}
        {items.map((n) => (
          <div
            key={n.key}
            className="flex items-center justify-between p-4 bg-gym-card border border-gym-border rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className="text-gym-text-muted">{n.icon}</div>
              <div>
                <p className="text-sm font-medium text-gym-text">{n.label}</p>
                <p className="text-xs text-gym-text-muted">{n.desc}</p>
              </div>
            </div>
            <Toggle
              on={notifications[n.key]}
              onChange={(v) => handleToggle(n.key, v)}
              disabled={isPending}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Integrations Tab ──

function IntegrationsTab({ data }: { data: SettingsData }) {
  const { stripeConnected, slackConnected, slackWebhookUrl, stripeEnabled } =
    data.integrations;
  const [webhookUrl, setWebhookUrl] = useState(slackWebhookUrl ?? "");
  const [feedback, setFeedback] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isTesting, startTestTransition] = useTransition();

  function handleSaveSlack() {
    setFeedback(null);
    startTransition(async () => {
      const result = await updateSlackWebhook(webhookUrl);
      if (result.success) {
        setFeedback({ message: "Slack webhook saved", type: "success" });
      } else {
        setFeedback({
          message: result.error ?? "Failed to save",
          type: "error",
        });
      }
    });
  }

  function handleTestSlack() {
    setFeedback(null);
    startTestTransition(async () => {
      const result = await testSlackWebhook();
      if (result.success) {
        setFeedback({
          message: "Test message sent to Slack!",
          type: "success",
        });
      } else {
        setFeedback({
          message: result.error ?? "Failed to send test",
          type: "error",
        });
      }
    });
  }

  const integrations = [
    {
      name: "Stripe",
      desc: "Payment processing",
      connected: stripeConnected,
      enabled: stripeEnabled,
      action: stripeConnected
        ? { label: "Dashboard", href: "https://dashboard.stripe.com" }
        : { label: "Set Up", href: "/billing" },
    },
    {
      name: "Slack",
      desc: "Team notifications",
      connected: slackConnected,
      enabled: true,
      custom: true,
    },
    {
      name: "Twilio",
      desc: "SMS messaging",
      connected: false,
      enabled: false,
      comingSoon: true,
    },
    {
      name: "Google Calendar",
      desc: "Schedule sync",
      connected: false,
      enabled: false,
      comingSoon: true,
    },
    {
      name: "Zapier",
      desc: "Workflow automation",
      connected: false,
      enabled: false,
      comingSoon: true,
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-gym-text mb-1">Integrations</h2>
      <p className="text-sm text-gym-text-muted mb-6">
        Connect external services and tools
      </p>
      <div className="max-w-2xl space-y-3">
        {feedback && (
          <FeedbackMessage message={feedback.message} type={feedback.type} />
        )}

        {integrations.map((i) => (
          <div key={i.name}>
            <div className="flex items-center justify-between p-4 bg-gym-card border border-gym-border rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gym-bg rounded-lg flex items-center justify-center">
                  <Plug className="w-4 h-4 text-gym-text-muted" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gym-text">{i.name}</p>
                  <p className="text-xs text-gym-text-muted">{i.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {i.comingSoon ? (
                  <span className="text-xs font-medium text-gym-text-muted">
                    Coming Soon
                  </span>
                ) : (
                  <>
                    <span
                      className={`text-xs font-medium capitalize ${
                        i.connected ? "text-green-400" : "text-gym-text-muted"
                      }`}
                    >
                      {i.connected ? "connected" : "not connected"}
                    </span>
                    {i.action && (
                      <a
                        href={i.action.href}
                        target={
                          i.action.href.startsWith("http")
                            ? "_blank"
                            : undefined
                        }
                        rel={
                          i.action.href.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                          i.connected
                            ? "bg-gym-bg text-gym-text-secondary border border-gym-border"
                            : "bg-gym-primary text-white"
                        }`}
                      >
                        {i.action.label}
                      </a>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Slack custom section */}
            {i.custom && i.name === "Slack" && (
              <div className="mt-2 ml-4 p-4 bg-gym-bg border border-gym-border rounded-xl space-y-3">
                <div>
                  <label className="block text-xs text-gym-text-muted mb-1.5">
                    Webhook URL
                  </label>
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://hooks.slack.com/services/..."
                    className="w-full px-3 py-2 bg-gym-card border border-gym-border rounded-lg text-sm text-gym-text focus:outline-none focus:border-gym-primary"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveSlack}
                    disabled={isPending}
                    className="flex items-center gap-2 bg-gym-primary hover:bg-gym-primary/80 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    {isPending ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Save className="w-3 h-3" />
                    )}
                    Save
                  </button>
                  {webhookUrl && (
                    <button
                      onClick={handleTestSlack}
                      disabled={isTesting}
                      className="flex items-center gap-2 bg-gym-bg hover:bg-gym-border text-gym-text px-3 py-1.5 rounded-lg text-xs font-medium border border-gym-border transition-colors disabled:opacity-50"
                    >
                      {isTesting ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : null}
                      Send Test
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
