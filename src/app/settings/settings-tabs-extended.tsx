"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Clock3,
  ExternalLink,
  KeyRound,
  Loader2,
  MonitorSmartphone,
  Plug,
  Save,
  Trash2,
  UserPlus,
} from "lucide-react";
import type { SettingsData } from "./actions";
import {
  changePassword,
  changeStaffRole as updateStaffRole,
  inviteStaff,
  removeStaffMember,
  signOutOtherSessions,
  testSlackWebhook,
  updateSlackWebhook,
} from "./actions";
import { ORG_ROLE_LABELS, ORG_ROLES, type OrgRole } from "@/lib/org-roles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FeedbackMessage,
  formatDateTime,
  formatRelativeTime,
  summarizeUserAgent,
} from "./settings-shared";

export function IntegrationsTab({ data }: { data: SettingsData }) {
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
      setFeedback({
        message: result.success
          ? "Slack webhook saved"
          : (result.error ?? "Failed to save webhook"),
        type: result.success ? "success" : "error",
      });
    });
  }

  function handleTestSlack() {
    setFeedback(null);
    startTestTransition(async () => {
      const result = await testSlackWebhook();
      setFeedback({
        message: result.success
          ? "Test message sent to Slack"
          : (result.error ?? "Failed to send test"),
        type: result.success ? "success" : "error",
      });
    });
  }

  const integrations = [
    {
      name: "Stripe",
      desc: "Billing, subscriptions, and payment recovery",
      connected: stripeConnected,
      action: stripeConnected
        ? { label: "Dashboard", href: "https://dashboard.stripe.com" }
        : { label: "Set Up", href: "/billing" },
      comingSoon: !stripeEnabled,
    },
    {
      name: "Slack",
      desc: "Team notifications and internal alerts",
      connected: slackConnected,
      custom: true,
    },
    {
      name: "Google Calendar",
      desc: "Schedule sync and staff visibility",
      connected: false,
      comingSoon: true,
    },
    {
      name: "Zapier",
      desc: "Trigger no-code workflows from gym events",
      connected: false,
      comingSoon: true,
    },
  ];

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-foreground">Integrations</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Keep your gym tools connected and verified.
      </p>
      <div className="max-w-2xl space-y-3">
        {feedback ? (
          <FeedbackMessage message={feedback.message} type={feedback.type} />
        ) : null}

        {integrations.map((integration) => (
          <div key={integration.name}>
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background">
                    <Plug className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {integration.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {integration.desc}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {integration.comingSoon ? (
                    <Badge variant="secondary">Coming soon</Badge>
                  ) : (
                    <>
                      <Badge
                        variant={integration.connected ? "success" : "warning"}
                      >
                        {integration.connected ? "Connected" : "Not connected"}
                      </Badge>
                      {integration.action ? (
                        <Button
                          variant={
                            integration.connected ? "outline" : "default"
                          }
                          size="sm"
                          asChild
                        >
                          <a
                            href={integration.action.href}
                            target={
                              integration.action.href.startsWith("http")
                                ? "_blank"
                                : undefined
                            }
                            rel={
                              integration.action.href.startsWith("http")
                                ? "noopener noreferrer"
                                : undefined
                            }
                          >
                            {integration.action.label}
                          </a>
                        </Button>
                      ) : null}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {integration.custom ? (
              <div className="ml-4 mt-2 space-y-3 rounded-xl border border-border bg-background p-4">
                <div className="space-y-1.5">
                  <Label htmlFor="slack-webhook">Slack webhook URL</Label>
                  <Input
                    id="slack-webhook"
                    type="url"
                    value={webhookUrl}
                    onChange={(event) => setWebhookUrl(event.target.value)}
                    placeholder="https://hooks.slack.com/services/..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveSlack}
                    disabled={isPending}
                  >
                    {isPending ? (
                      <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                    ) : (
                      <Save className="mr-1.5 h-3 w-3" />
                    )}
                    Save
                  </Button>
                  {webhookUrl ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleTestSlack}
                      disabled={isTesting}
                    >
                      {isTesting ? (
                        <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                      ) : null}
                      Send Test
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export function StaffTab({ data }: { data: SettingsData }) {
  const router = useRouter();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<OrgRole>("org:staff");
  const [feedback, setFeedback] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [isInviting, startInviteTransition] = useTransition();
  const [pendingMemberId, setPendingMemberId] = useState<string | null>(null);

  function handleInvite() {
    setFeedback(null);
    startInviteTransition(async () => {
      const result = await inviteStaff({
        email: inviteEmail,
        role: inviteRole,
      });

      if (result.success) {
        setInviteEmail("");
        setInviteRole("org:staff");
        router.refresh();
      }

      setFeedback({
        message: result.success
          ? "Invite sent successfully"
          : (result.error ?? "Failed to invite teammate"),
        type: result.success ? "success" : "error",
      });
    });
  }

  function handleRoleChange(membershipId: string, role: string) {
    setPendingMemberId(membershipId);
    setFeedback(null);

    void (async () => {
      const result = await updateStaffRole({ membershipId, role });

      if (result.success) {
        router.refresh();
      }

      setFeedback({
        message: result.success
          ? "Role updated"
          : (result.error ?? "Failed to update role"),
        type: result.success ? "success" : "error",
      });
      setPendingMemberId(null);
    })();
  }

  function handleRemove(membershipId: string) {
    setPendingMemberId(membershipId);
    setFeedback(null);

    void (async () => {
      const result = await removeStaffMember({ membershipId });

      if (result.success) {
        router.refresh();
      }

      setFeedback({
        message: result.success
          ? "Teammate removed"
          : (result.error ?? "Failed to remove teammate"),
        type: result.success ? "success" : "error",
      });
      setPendingMemberId(null);
    })();
  }

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-foreground">Staff & Roles</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Invite teammates, manage roles, and keep admin access contained.
      </p>

      <Card className="mb-6 max-w-3xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-sm">
            <UserPlus className="h-4 w-4 text-primary" />
            Invite Staff
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
            <Input
              type="email"
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
              placeholder="coach@yourgym.com"
            />
            <Select
              value={inviteRole}
              onValueChange={(value) => setInviteRole(value as OrgRole)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORG_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {ORG_ROLE_LABELS[role]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleInvite}
              disabled={isInviting || !inviteEmail.trim()}
            >
              {isInviting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              Send Invite
            </Button>
          </div>
        </CardContent>
      </Card>

      {feedback ? (
        <div className="mb-4 max-w-3xl">
          <FeedbackMessage message={feedback.message} type={feedback.type} />
        </div>
      ) : null}

      <div className="max-w-4xl space-y-3">
        {data.staff.map((member) => (
          <Card key={member.id}>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-foreground">
                      {member.name}
                    </p>
                    {member.isCurrentUser ? (
                      <Badge variant="secondary">You</Badge>
                    ) : null}
                    <Badge
                      variant={
                        member.status === "active"
                          ? "success"
                          : member.status === "invited"
                            ? "warning"
                            : "destructive"
                      }
                    >
                      {member.status === "active"
                        ? "Active"
                        : member.status === "invited"
                          ? "Invited"
                          : "Revoked"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {member.email}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {member.acceptedAt
                      ? `Joined ${formatDateTime(member.acceptedAt)}`
                      : member.inviteExpiresAt
                        ? `Invite expires ${formatDateTime(member.inviteExpiresAt)}`
                        : `Added ${formatDateTime(member.createdAt)}`}
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Select
                    value={member.role}
                    onValueChange={(value) =>
                      handleRoleChange(member.id, value)
                    }
                    disabled={
                      member.isCurrentUser ||
                      member.status === "revoked" ||
                      pendingMemberId === member.id
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ORG_ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {ORG_ROLE_LABELS[role]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemove(member.id)}
                    disabled={
                      member.isCurrentUser ||
                      member.status === "revoked" ||
                      pendingMemberId === member.id
                    }
                  >
                    {pendingMemberId === member.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    Remove
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function SecurityTab({ data }: { data: SettingsData }) {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [feedback, setFeedback] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [isChangingPassword, startPasswordTransition] = useTransition();
  const [isEndingSessions, startSessionTransition] = useTransition();

  function handlePasswordChange() {
    setFeedback(null);
    startPasswordTransition(async () => {
      const result = await changePassword({
        currentPassword,
        newPassword,
      });

      if (result.success) {
        setCurrentPassword("");
        setNewPassword("");
        router.refresh();
      }

      setFeedback({
        message: result.success
          ? "Password changed and other sessions signed out"
          : (result.error ?? "Failed to change password"),
        type: result.success ? "success" : "error",
      });
    });
  }

  function handleSignOutOtherSessions() {
    setFeedback(null);
    startSessionTransition(async () => {
      const result = await signOutOtherSessions();

      if (result.success) {
        router.refresh();
      }

      setFeedback({
        message: result.success
          ? "Other sessions signed out"
          : (result.error ?? "Failed to sign out other sessions"),
        type: result.success ? "success" : "error",
      });
    });
  }

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-foreground">Security</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Update your password, review active sessions, and audit recent access.
      </p>

      {feedback ? (
        <div className="mb-4 max-w-3xl">
          <FeedbackMessage message={feedback.message} type={feedback.type} />
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-sm">
                <KeyRound className="h-4 w-4 text-primary" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder="Current password"
              />
              <Input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="New password"
              />
              <Button
                onClick={handlePasswordChange}
                disabled={
                  isChangingPassword || !currentPassword || !newPassword
                }
              >
                {isChangingPassword ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <KeyRound className="mr-2 h-4 w-4" />
                )}
                Update Password
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <MonitorSmartphone className="h-4 w-4 text-primary" />
                  Active Sessions
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOutOtherSessions}
                  disabled={
                    isEndingSessions || data.security.sessions.length <= 1
                  }
                >
                  {isEndingSessions ? "Ending..." : "Sign out other sessions"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.security.sessions.map((session) => (
                <div
                  key={session.id}
                  className="rounded-lg border border-border bg-background p-3"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <MonitorSmartphone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">
                        {summarizeUserAgent(session.userAgent)}
                      </span>
                    </div>
                    {session.current ? (
                      <Badge variant="success">Current session</Badge>
                    ) : (
                      <Badge variant="secondary">Active</Badge>
                    )}
                  </div>
                  <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                    <p>Last seen: {formatRelativeTime(session.lastSeenAt)}</p>
                    <p>Created: {formatDateTime(session.createdAt)}</p>
                    <p>Expires: {formatDateTime(session.expiresAt)}</p>
                    <p>IP: {session.ipAddress ?? "Unknown"}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock3 className="h-4 w-4 text-primary" />
              Recent Sign-ins & Security Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.security.activity.map((entry) => (
              <div
                key={entry.id}
                className="rounded-lg border border-border bg-background p-3"
              >
                <div className="mb-1 flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-foreground">
                    {entry.description}
                  </p>
                  <Badge variant="secondary">{entry.type}</Badge>
                </div>
                <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                  <p>{formatDateTime(entry.createdAt)}</p>
                  <p>IP: {entry.ipAddress ?? "Unknown"}</p>
                  <p className="sm:col-span-2">
                    {summarizeUserAgent(entry.userAgent)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
