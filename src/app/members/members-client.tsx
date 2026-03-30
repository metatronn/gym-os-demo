"use client";

import { useState, useTransition } from "react";
import {
  Search,
  Plus,
  ChevronRight,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Activity,
  AlertTriangle,
  X,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type { Member } from "@/db/schema/members";
import { createMember, updateMember, deleteMember } from "./actions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

type MemberCounts = {
  total: number;
  active: number;
  trial: number;
  frozen: number;
  cancelled: number;
  atRisk: number;
};

type Props = {
  initialMembers: Member[];
  counts: MemberCounts;
};

const statusVariant: Record<
  string,
  "success" | "warning" | "destructive" | "default"
> = {
  active: "success",
  frozen: "default",
  cancelled: "destructive",
  trial: "warning",
};

const riskColors: Record<string, string> = {
  low: "text-success",
  medium: "text-warning",
  high: "text-orange-400",
  critical: "text-destructive",
};

const billingColors: Record<string, string> = {
  current: "text-success",
  failed: "text-destructive",
  "past-due": "text-orange-400",
  pending: "text-warning",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(date: Date | string | null): string {
  if (!date) return "Never";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
}

function AddPlanSelect() {
  const [value, setValue] = useState("Trial");
  return (
    <>
      <input type="hidden" name="plan" value={value} />
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger>
          <SelectValue placeholder="Select plan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Trial">Trial</SelectItem>
          <SelectItem value="Basic">Basic</SelectItem>
          <SelectItem value="Unlimited">Unlimited</SelectItem>
          <SelectItem value="Premium">Premium</SelectItem>
        </SelectContent>
      </Select>
    </>
  );
}

function EditPlanSelect({ defaultValue }: { defaultValue: string }) {
  const [value, setValue] = useState(defaultValue);
  return (
    <>
      <input type="hidden" name="plan" value={value} />
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger>
          <SelectValue placeholder="Select plan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Trial">Trial</SelectItem>
          <SelectItem value="Basic">Basic</SelectItem>
          <SelectItem value="Unlimited">Unlimited</SelectItem>
          <SelectItem value="Premium">Premium</SelectItem>
        </SelectContent>
      </Select>
    </>
  );
}

function EditStatusSelect({ defaultValue }: { defaultValue: string }) {
  const [value, setValue] = useState(defaultValue);
  return (
    <>
      <input type="hidden" name="status" value={value} />
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger>
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="trial">Trial</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="frozen">Frozen</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>
    </>
  );
}

export default function MembersClient({ initialMembers, counts }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const filtered = members.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const selected = selectedMember
    ? (members.find((m) => m.id === selectedMember) ?? null)
    : null;

  function handleCreate(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = (formData.get("phone") as string) || undefined;
    const plan =
      (formData.get("plan") as "Premium" | "Unlimited" | "Basic" | "Trial") ||
      "Trial";

    if (!name || !email) return;

    startTransition(async () => {
      const member = await createMember({ name, email, phone, plan });
      if (member) {
        setMembers((prev) => [member, ...prev]);
        setShowAddModal(false);
      }
    });
  }

  function handleUpdate(formData: FormData) {
    if (!selected) return;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = (formData.get("phone") as string) || undefined;
    const plan = formData.get("plan") as
      | "Premium"
      | "Unlimited"
      | "Basic"
      | "Trial";
    const status = formData.get("status") as
      | "active"
      | "frozen"
      | "cancelled"
      | "trial";
    const notes = (formData.get("notes") as string) || undefined;

    startTransition(async () => {
      const updated = await updateMember(selected.id, {
        name,
        email,
        phone,
        plan,
        status,
        notes,
      });
      if (updated) {
        setMembers((prev) =>
          prev.map((m) => (m.id === updated.id ? updated : m)),
        );
        setShowEditModal(false);
        setSelectedMember(updated.id);
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this member?")) return;
    startTransition(async () => {
      await deleteMember(id);
      setMembers((prev) => prev.filter((m) => m.id !== id));
      setSelectedMember(null);
    });
  }

  return (
    <div className="flex h-full">
      <div
        className={`flex-1 p-4 lg:p-6 overflow-auto ${selected ? "lg:mr-[420px]" : ""}`}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Members</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {counts.total} total members
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Member
          </Button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {[
            { label: "Active", value: counts.active, color: "text-success" },
            { label: "Trial", value: counts.trial, color: "text-warning" },
            { label: "Frozen", value: counts.frozen, color: "text-blue-400" },
            {
              label: "Cancelled",
              value: counts.cancelled,
              color: "text-destructive",
            },
            {
              label: "At Risk",
              value: counts.atRisk,
              color: "text-orange-400",
            },
          ].map((stat) => (
            <Card key={stat.label} className="text-center">
              <CardContent className="p-3">
                <p className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex rounded-lg overflow-hidden overflow-x-auto border border-border">
            {["all", "active", "trial", "frozen", "cancelled"].map((s) => (
              <Button
                key={s}
                variant={statusFilter === s ? "default" : "ghost"}
                size="sm"
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "rounded-none capitalize",
                  statusFilter === s ? "" : "text-muted-foreground",
                )}
              >
                {s}
              </Button>
            ))}
          </div>
        </div>

        {/* Table */}
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs uppercase">Member</TableHead>
                <TableHead className="text-xs uppercase">Plan</TableHead>
                <TableHead className="text-xs uppercase">Status</TableHead>
                <TableHead className="text-xs uppercase">Risk</TableHead>
                <TableHead className="text-xs uppercase">Visits/Mo</TableHead>
                <TableHead className="text-xs uppercase">
                  Last Check-in
                </TableHead>
                <TableHead className="text-xs uppercase">Billing</TableHead>
                <TableHead className="w-8"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((member) => (
                <TableRow
                  key={member.id}
                  onClick={() => setSelectedMember(member.id)}
                  className={cn(
                    "cursor-pointer",
                    selectedMember === member.id && "bg-secondary/50",
                  )}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                          {member.avatar || getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="text-sm font-medium text-foreground">
                          {member.name}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {member.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {member.plan}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={statusVariant[member.status] ?? "secondary"}
                      className="capitalize"
                    >
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {(member.riskLevel === "high" ||
                        member.riskLevel === "critical") && (
                        <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                      )}
                      <span
                        className={`text-xs font-medium capitalize ${riskColors[member.riskLevel]}`}
                      >
                        {member.riskScore}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {member.monthlyVisits >= 15 ? (
                        <TrendingUp className="w-3.5 h-3.5 text-success" />
                      ) : member.monthlyVisits <= 5 ? (
                        <TrendingDown className="w-3.5 h-3.5 text-destructive" />
                      ) : null}
                      <span className="text-sm text-muted-foreground">
                        {member.monthlyVisits}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(member.lastCheckIn)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-xs font-medium capitalize ${billingColors[member.billingStatus]}`}
                    >
                      {member.billingStatus}
                    </span>
                  </TableCell>
                  <TableCell>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-muted-foreground text-sm"
                  >
                    No members found{search ? ` matching "${search}"` : ""}.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Detail Panel */}
      {selected && (
        <Card className="fixed inset-0 lg:inset-auto lg:right-0 lg:top-0 w-full lg:w-[420px] h-full rounded-none z-40 overflow-auto">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground">
                Member Profile
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedMember(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/20 text-primary text-xl font-bold">
                  {selected.avatar || getInitials(selected.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {selected.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={statusVariant[selected.status] ?? "secondary"}
                    className="capitalize"
                  >
                    {selected.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {selected.plan} Plan
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">
                  {selected.email}
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">
                  {selected.phone || "No phone"}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3 bg-background rounded-lg">
                <div className="flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Risk Score</p>
                </div>
                <p
                  className={`text-xl font-bold ${riskColors[selected.riskLevel]}`}
                >
                  {selected.riskScore}%
                </p>
                <p
                  className={`text-xs capitalize ${riskColors[selected.riskLevel]}`}
                >
                  {selected.riskLevel}
                </p>
              </div>
              <div className="p-3 bg-background rounded-lg">
                <div className="flex items-center gap-1.5 mb-1">
                  <Activity className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    Monthly Visits
                  </p>
                </div>
                <p className="text-xl font-bold text-foreground">
                  {selected.monthlyVisits}
                </p>
              </div>
              <div className="p-3 bg-background rounded-lg">
                <div className="flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Last Check-in</p>
                </div>
                <p className="text-sm font-medium text-foreground">
                  {formatDate(selected.lastCheckIn)}
                </p>
              </div>
              <div className="p-3 bg-background rounded-lg">
                <div className="flex items-center gap-1.5 mb-1">
                  <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Billing</p>
                </div>
                <p
                  className={`text-sm font-medium capitalize ${billingColors[selected.billingStatus]}`}
                >
                  {selected.billingStatus}
                </p>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-xs text-muted-foreground mb-2">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {selected.tags.length > 0 ? (
                  selected.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">No tags</span>
                )}
              </div>
            </div>
            <div className="mb-6">
              <p className="text-xs text-muted-foreground mb-2">Notes</p>
              <p className="text-sm text-muted-foreground bg-background p-3 rounded-lg">
                {selected.notes || "No notes"}
              </p>
            </div>
            <div className="mb-6">
              <p className="text-xs text-muted-foreground mb-1">Member Since</p>
              <p className="text-sm text-foreground">
                {formatDate(selected.joinDate)}
              </p>
            </div>
            <div className="space-y-2">
              <Button className="w-full">
                <Mail className="w-4 h-4 mr-2" />
                Send Message
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditModal(true)}
                >
                  <Phone className="w-3.5 h-3.5 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(selected.id)}
                  className="hover:bg-destructive/20 hover:text-destructive hover:border-destructive/50"
                >
                  <X className="w-3.5 h-3.5 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Member Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Member</DialogTitle>
            <DialogDescription>Add a new member to the gym.</DialogDescription>
          </DialogHeader>
          <form action={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">Name *</Label>
              <Input id="add-name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-email">Email *</Label>
              <Input id="add-email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-phone">Phone</Label>
              <Input id="add-phone" name="phone" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-plan">Plan</Label>
              <AddPlanSelect />
            </div>
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Adding..." : "Add Member"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Member Modal */}
      <Dialog
        open={showEditModal && !!selected}
        onOpenChange={setShowEditModal}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
            <DialogDescription>Update member information.</DialogDescription>
          </DialogHeader>
          {selected && (
            <form action={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  name="name"
                  required
                  defaultValue={selected.name}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  required
                  defaultValue={selected.email}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  name="phone"
                  defaultValue={selected.phone ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-plan">Plan</Label>
                <EditPlanSelect defaultValue={selected.plan} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <EditStatusSelect defaultValue={selected.status} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  name="notes"
                  rows={3}
                  defaultValue={selected.notes ?? ""}
                />
              </div>
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
