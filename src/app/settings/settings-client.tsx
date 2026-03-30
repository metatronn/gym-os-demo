"use client";

import { useState, useTransition } from "react";
import {
  Bell,
  Building2,
  CreditCard,
  ExternalLink,
  Globe,
  Loader2,
  Mail,
  MessageSquare,
  Plug,
  Save,
  Shield,
  Users,
} from "lucide-react";

import type { NotificationSettings, SettingsData } from "./actions";
import { updateGymProfile, updateNotificationSettings } from "./actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FeedbackMessage, formatCurrency } from "./settings-shared";
import {
  IntegrationsTab,
  StaffTab,
  SecurityTab,
} from "./settings-tabs-extended";

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
] as const;

export default function SettingsClient({ data }: { data: SettingsData }) {
  return (
    <Tabs defaultValue="gym" className="flex h-full flex-col lg:flex-row">
      <div className="border-border p-3 lg:w-[240px] lg:border-r lg:p-4">
        <h1 className="mb-3 px-1 text-lg font-bold text-foreground lg:mb-4">
          Settings
        </h1>
        <TabsList className="flex h-auto w-full flex-row gap-1 overflow-x-auto bg-transparent p-0 pb-1 lg:flex-col lg:overflow-x-visible lg:pb-0">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="justify-start whitespace-nowrap rounded-lg px-3 py-2 text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none lg:w-full lg:gap-3 lg:py-2.5"
            >
              {tab.icon}
              <span className="ml-2 text-xs lg:ml-0 lg:text-sm">
                {tab.label}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <div className="flex-1 overflow-auto p-4 lg:p-6">
        <TabsContent value="gym" className="mt-0">
          <GymProfileTab data={data} />
        </TabsContent>
        <TabsContent value="plans" className="mt-0">
          <PlansTab data={data} />
        </TabsContent>
        <TabsContent value="notifications" className="mt-0">
          <NotificationsTab data={data} />
        </TabsContent>
        <TabsContent value="integrations" className="mt-0">
          <IntegrationsTab data={data} />
        </TabsContent>
        <TabsContent value="staff" className="mt-0">
          <StaffTab data={data} />
        </TabsContent>
        <TabsContent value="security" className="mt-0">
          <SecurityTab data={data} />
        </TabsContent>
      </div>
    </Tabs>
  );
}

function GymProfileTab({ data }: { data: SettingsData }) {
  const [name, setName] = useState(data.tenant.name);
  const [slug, setSlug] = useState(data.tenant.slug ?? "");
  const [logoUrl, setLogoUrl] = useState(data.tenant.logoUrl ?? "");
  const [feedback, setFeedback] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setFeedback(null);
    startTransition(async () => {
      const result = await updateGymProfile({ name, slug, logoUrl });
      setFeedback({
        message: result.success
          ? "Profile saved successfully"
          : (result.error ?? "Failed to save profile"),
        type: result.success ? "success" : "error",
      });
    });
  }

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-foreground">Gym Profile</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Manage your public gym identity and brand assets.
      </p>
      <div className="max-w-2xl space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="gym-name">Gym Name</Label>
          <Input
            id="gym-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="gym-slug">Slug</Label>
          <Input
            id="gym-slug"
            type="text"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            placeholder="your-gym-name"
          />
          <p className="text-xs text-muted-foreground">
            Future public URL: app.gymos.com/
            <strong>{slug || "your-slug"}</strong>
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="gym-logo">Logo URL</Label>
          <div className="flex gap-3">
            <Input
              id="gym-logo"
              type="url"
              value={logoUrl}
              onChange={(event) => setLogoUrl(event.target.value)}
              placeholder="https://cdn.example.com/logo.png"
            />
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-card">
              {logoUrl ? (
                <div
                  aria-label="Gym logo preview"
                  className="h-8 w-8 rounded bg-cover bg-center"
                  style={{ backgroundImage: `url(${logoUrl})` }}
                />
              ) : (
                <Globe className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </div>

        {feedback ? (
          <FeedbackMessage message={feedback.message} type={feedback.type} />
        ) : null}

        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}

function PlansTab({ data }: { data: SettingsData }) {
  const { stripeEnabled, stripeConnected } = data.integrations;

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-foreground">
        Membership Plans
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Live pricing from Stripe. Management still happens in the Stripe
        Dashboard.
      </p>

      {!stripeEnabled ? (
        <Card className="max-w-2xl text-center">
          <CardContent className="p-6">
            <CreditCard className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="mb-2 text-sm text-foreground">
              Stripe isn&apos;t configured for this environment yet.
            </p>
            <p className="text-xs text-muted-foreground">
              Add your Stripe keys to load real plan data here.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {stripeEnabled && !stripeConnected ? (
        <Card className="max-w-2xl text-center">
          <CardContent className="p-6">
            <CreditCard className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="mb-2 text-sm text-foreground">
              Connect billing to start selling plans.
            </p>
            <p className="mb-4 text-xs text-muted-foreground">
              The Stripe catalog is available, but this gym doesn&apos;t have a
              billing customer attached yet.
            </p>
            <Button asChild>
              <a href="/billing">Go to Billing</a>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {stripeEnabled ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={stripeConnected ? "success" : "warning"}>
              {stripeConnected ? "Stripe connected" : "Stripe not connected"}
            </Badge>
            <Button variant="link" asChild className="gap-2 p-0">
              <a
                href="https://dashboard.stripe.com/products"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Stripe Dashboard <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>

          {data.plans.length === 0 ? (
            <Card>
              <CardContent className="p-5 text-sm text-muted-foreground">
                No active recurring plans were found in Stripe.
              </CardContent>
            </Card>
          ) : (
            <div className="grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {data.plans.map((plan) => (
                <Card key={plan.id}>
                  <CardContent className="p-4">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-foreground">
                          {plan.name}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {plan.description || "Recurring membership plan"}
                        </p>
                      </div>
                      <Badge variant={plan.active ? "success" : "secondary"}>
                        {plan.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <div className="mb-4">
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(plan.unitAmount, plan.currency)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {plan.interval
                          ? `Billed every ${plan.interval}`
                          : "Custom billing cadence"}
                      </p>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center justify-between rounded-lg bg-background px-3 py-2">
                        <span>Trial</span>
                        <span className="font-medium text-foreground">
                          {plan.trialDays ? `${plan.trialDays} days` : "None"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-background px-3 py-2">
                        <span>Stripe price ID</span>
                        <span className="font-mono text-xs text-foreground">
                          {plan.id}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

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
      icon: <CreditCard className="h-4 w-4" />,
    },
    {
      key: "leadNotifications",
      label: "New lead notifications",
      desc: "Alert the team when a new lead comes in",
      icon: <Mail className="h-4 w-4" />,
    },
    {
      key: "atRiskAlerts",
      label: "At-risk member alerts",
      desc: "Flag members with high churn risk",
      icon: <Shield className="h-4 w-4" />,
    },
    {
      key: "dailyDigest",
      label: "Daily briefing email",
      desc: "Receive a summary of yesterday's activity",
      icon: <Bell className="h-4 w-4" />,
    },
    {
      key: "followUpSms",
      label: "Automated follow-up SMS",
      desc: "Queue follow-up texts for leads without replies",
      icon: <MessageSquare className="h-4 w-4" />,
    },
    {
      key: "classReminders",
      label: "Class reminder emails",
      desc: "Send reminder emails before class start",
      icon: <Mail className="h-4 w-4" />,
    },
  ];

  function handleToggle(key: keyof NotificationSettings, value: boolean) {
    const next = { ...notifications, [key]: value };
    setNotifications(next);
    setFeedback(null);

    startTransition(async () => {
      const result = await updateNotificationSettings(next);

      if (!result.success) {
        setNotifications(notifications);
      }

      setFeedback({
        message: result.success
          ? "Notification settings saved"
          : (result.error ?? "Failed to save settings"),
        type: result.success ? "success" : "error",
      });
    });
  }

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-foreground">Notifications</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Configure the alerts and automation settings stored on your tenant.
      </p>
      <div className="max-w-2xl space-y-4">
        {feedback ? (
          <FeedbackMessage message={feedback.message} type={feedback.type} />
        ) : null}
        {items.map((item) => (
          <Card key={item.key}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="text-muted-foreground">{item.icon}</div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {item.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
              <Switch
                checked={notifications[item.key]}
                onCheckedChange={(value) => handleToggle(item.key, value)}
                disabled={isPending}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
