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

const statusColors: Record<string, string> = {
  active: "bg-green-500/20 text-green-400",
  frozen: "bg-blue-500/20 text-blue-400",
  cancelled: "bg-red-500/20 text-red-400",
  trial: "bg-yellow-500/20 text-yellow-400",
};

const riskColors: Record<string, string> = {
  low: "text-green-400",
  medium: "text-yellow-400",
  high: "text-orange-400",
  critical: "text-red-400",
};

const billingColors: Record<string, string> = {
  current: "text-green-400",
  failed: "text-red-400",
  "past-due": "text-orange-400",
  pending: "text-yellow-400",
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
            <h1 className="text-2xl font-bold text-gym-text">Members</h1>
            <p className="text-gym-text-muted text-sm mt-1">
              {counts.total} total members
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-gym-primary hover:bg-gym-primary/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Member
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {[
            { label: "Active", value: counts.active, color: "text-green-400" },
            { label: "Trial", value: counts.trial, color: "text-yellow-400" },
            { label: "Frozen", value: counts.frozen, color: "text-blue-400" },
            {
              label: "Cancelled",
              value: counts.cancelled,
              color: "text-red-400",
            },
            {
              label: "At Risk",
              value: counts.atRisk,
              color: "text-orange-400",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-3 bg-gym-card border border-gym-border rounded-xl text-center"
            >
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gym-text-muted mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gym-text-muted" />
            <input
              type="text"
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gym-card border border-gym-border rounded-lg text-gym-text text-sm placeholder:text-gym-text-muted focus:outline-none focus:border-gym-primary"
            />
          </div>
          <div className="flex bg-gym-card border border-gym-border rounded-lg overflow-hidden overflow-x-auto">
            {["all", "active", "trial", "frozen", "cancelled"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 text-xs font-medium capitalize ${statusFilter === s ? "bg-gym-primary text-white" : "text-gym-text-secondary hover:text-gym-text"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-gym-card border border-gym-border rounded-xl overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gym-border">
                <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">
                  Member
                </th>
                <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">
                  Plan
                </th>
                <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">
                  Status
                </th>
                <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">
                  Risk
                </th>
                <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">
                  Visits/Mo
                </th>
                <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">
                  Last Check-in
                </th>
                <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">
                  Billing
                </th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((member) => (
                <tr
                  key={member.id}
                  onClick={() => setSelectedMember(member.id)}
                  className={`border-b border-gym-border/50 hover:bg-gym-bg/50 cursor-pointer transition-colors ${selectedMember === member.id ? "bg-gym-bg/50" : ""}`}
                >
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gym-primary/20 rounded-full flex items-center justify-center text-xs font-bold text-gym-primary">
                        {member.avatar || getInitials(member.name)}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gym-text">
                          {member.name}
                        </span>
                        <p className="text-xs text-gym-text-muted">
                          {member.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-gym-text-secondary">
                    {member.plan}
                  </td>
                  <td className="p-3">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${statusColors[member.status]}`}
                    >
                      {member.status}
                    </span>
                  </td>
                  <td className="p-3">
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
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      {member.monthlyVisits >= 15 ? (
                        <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                      ) : member.monthlyVisits <= 5 ? (
                        <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                      ) : null}
                      <span className="text-sm text-gym-text-secondary">
                        {member.monthlyVisits}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-xs text-gym-text-muted">
                    {formatDate(member.lastCheckIn)}
                  </td>
                  <td className="p-3">
                    <span
                      className={`text-xs font-medium capitalize ${billingColors[member.billingStatus]}`}
                    >
                      {member.billingStatus}
                    </span>
                  </td>
                  <td className="p-3">
                    <ChevronRight className="w-4 h-4 text-gym-text-muted" />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="p-8 text-center text-gym-text-muted text-sm"
                  >
                    No members found{search ? ` matching "${search}"` : ""}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Panel */}
      {selected && (
        <div className="fixed inset-0 lg:inset-auto lg:right-0 lg:top-0 w-full lg:w-[420px] h-full bg-gym-card border-l border-gym-border p-6 overflow-auto z-40">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gym-text">Member Profile</h2>
            <button
              onClick={() => setSelectedMember(null)}
              className="p-1 hover:bg-gym-bg rounded"
            >
              <X className="w-4 h-4 text-gym-text-muted" />
            </button>
          </div>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gym-primary/20 rounded-full flex items-center justify-center text-gym-primary text-xl font-bold">
              {selected.avatar || getInitials(selected.name)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gym-text">
                {selected.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusColors[selected.status]}`}
                >
                  {selected.status}
                </span>
                <span className="text-xs text-gym-text-muted">
                  {selected.plan} Plan
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-3 p-3 bg-gym-bg rounded-lg">
              <Mail className="w-4 h-4 text-gym-text-muted" />
              <span className="text-sm text-gym-text">{selected.email}</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gym-bg rounded-lg">
              <Phone className="w-4 h-4 text-gym-text-muted" />
              <span className="text-sm text-gym-text">
                {selected.phone || "No phone"}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3 bg-gym-bg rounded-lg">
              <div className="flex items-center gap-1.5 mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-gym-text-muted" />
                <p className="text-xs text-gym-text-muted">Risk Score</p>
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
            <div className="p-3 bg-gym-bg rounded-lg">
              <div className="flex items-center gap-1.5 mb-1">
                <Activity className="w-3.5 h-3.5 text-gym-text-muted" />
                <p className="text-xs text-gym-text-muted">Monthly Visits</p>
              </div>
              <p className="text-xl font-bold text-gym-text">
                {selected.monthlyVisits}
              </p>
            </div>
            <div className="p-3 bg-gym-bg rounded-lg">
              <div className="flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-gym-text-muted" />
                <p className="text-xs text-gym-text-muted">Last Check-in</p>
              </div>
              <p className="text-sm font-medium text-gym-text">
                {formatDate(selected.lastCheckIn)}
              </p>
            </div>
            <div className="p-3 bg-gym-bg rounded-lg">
              <div className="flex items-center gap-1.5 mb-1">
                <CreditCard className="w-3.5 h-3.5 text-gym-text-muted" />
                <p className="text-xs text-gym-text-muted">Billing</p>
              </div>
              <p
                className={`text-sm font-medium capitalize ${billingColors[selected.billingStatus]}`}
              >
                {selected.billingStatus}
              </p>
            </div>
          </div>
          <div className="mb-6">
            <p className="text-xs text-gym-text-muted mb-2">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {selected.tags.length > 0 ? (
                selected.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-gym-bg border border-gym-border px-2 py-1 rounded text-gym-text-secondary"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gym-text-muted">No tags</span>
              )}
            </div>
          </div>
          <div className="mb-6">
            <p className="text-xs text-gym-text-muted mb-2">Notes</p>
            <p className="text-sm text-gym-text-secondary bg-gym-bg p-3 rounded-lg">
              {selected.notes || "No notes"}
            </p>
          </div>
          <div className="mb-6">
            <p className="text-xs text-gym-text-muted mb-1">Member Since</p>
            <p className="text-sm text-gym-text">
              {formatDate(selected.joinDate)}
            </p>
          </div>
          <div className="space-y-2">
            <button className="w-full flex items-center justify-center gap-2 bg-gym-primary hover:bg-gym-primary/80 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
              <Mail className="w-4 h-4" />
              Send Message
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center justify-center gap-2 bg-gym-bg hover:bg-gym-border text-gym-text px-3 py-2 rounded-lg text-xs font-medium border border-gym-border"
              >
                <Phone className="w-3.5 h-3.5" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(selected.id)}
                className="flex items-center justify-center gap-2 bg-gym-bg hover:bg-red-500/20 text-gym-text hover:text-red-400 px-3 py-2 rounded-lg text-xs font-medium border border-gym-border"
              >
                <X className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gym-card border border-gym-border rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gym-text">Add Member</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-gym-bg rounded"
              >
                <X className="w-4 h-4 text-gym-text-muted" />
              </button>
            </div>
            <form action={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs text-gym-text-muted mb-1">
                  Name *
                </label>
                <input
                  name="name"
                  required
                  className="w-full px-3 py-2 bg-gym-bg border border-gym-border rounded-lg text-gym-text text-sm focus:outline-none focus:border-gym-primary"
                />
              </div>
              <div>
                <label className="block text-xs text-gym-text-muted mb-1">
                  Email *
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-3 py-2 bg-gym-bg border border-gym-border rounded-lg text-gym-text text-sm focus:outline-none focus:border-gym-primary"
                />
              </div>
              <div>
                <label className="block text-xs text-gym-text-muted mb-1">
                  Phone
                </label>
                <input
                  name="phone"
                  className="w-full px-3 py-2 bg-gym-bg border border-gym-border rounded-lg text-gym-text text-sm focus:outline-none focus:border-gym-primary"
                />
              </div>
              <div>
                <label className="block text-xs text-gym-text-muted mb-1">
                  Plan
                </label>
                <select
                  name="plan"
                  defaultValue="Trial"
                  className="w-full px-3 py-2 bg-gym-bg border border-gym-border rounded-lg text-gym-text text-sm focus:outline-none focus:border-gym-primary"
                >
                  <option value="Trial">Trial</option>
                  <option value="Basic">Basic</option>
                  <option value="Unlimited">Unlimited</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-gym-primary hover:bg-gym-primary/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isPending ? "Adding..." : "Add Member"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {showEditModal && selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gym-card border border-gym-border rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gym-text">Edit Member</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 hover:bg-gym-bg rounded"
              >
                <X className="w-4 h-4 text-gym-text-muted" />
              </button>
            </div>
            <form action={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs text-gym-text-muted mb-1">
                  Name *
                </label>
                <input
                  name="name"
                  required
                  defaultValue={selected.name}
                  className="w-full px-3 py-2 bg-gym-bg border border-gym-border rounded-lg text-gym-text text-sm focus:outline-none focus:border-gym-primary"
                />
              </div>
              <div>
                <label className="block text-xs text-gym-text-muted mb-1">
                  Email *
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  defaultValue={selected.email}
                  className="w-full px-3 py-2 bg-gym-bg border border-gym-border rounded-lg text-gym-text text-sm focus:outline-none focus:border-gym-primary"
                />
              </div>
              <div>
                <label className="block text-xs text-gym-text-muted mb-1">
                  Phone
                </label>
                <input
                  name="phone"
                  defaultValue={selected.phone ?? ""}
                  className="w-full px-3 py-2 bg-gym-bg border border-gym-border rounded-lg text-gym-text text-sm focus:outline-none focus:border-gym-primary"
                />
              </div>
              <div>
                <label className="block text-xs text-gym-text-muted mb-1">
                  Plan
                </label>
                <select
                  name="plan"
                  defaultValue={selected.plan}
                  className="w-full px-3 py-2 bg-gym-bg border border-gym-border rounded-lg text-gym-text text-sm focus:outline-none focus:border-gym-primary"
                >
                  <option value="Trial">Trial</option>
                  <option value="Basic">Basic</option>
                  <option value="Unlimited">Unlimited</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gym-text-muted mb-1">
                  Status
                </label>
                <select
                  name="status"
                  defaultValue={selected.status}
                  className="w-full px-3 py-2 bg-gym-bg border border-gym-border rounded-lg text-gym-text text-sm focus:outline-none focus:border-gym-primary"
                >
                  <option value="trial">Trial</option>
                  <option value="active">Active</option>
                  <option value="frozen">Frozen</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gym-text-muted mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  defaultValue={selected.notes ?? ""}
                  className="w-full px-3 py-2 bg-gym-bg border border-gym-border rounded-lg text-gym-text text-sm focus:outline-none focus:border-gym-primary resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-gym-primary hover:bg-gym-primary/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isPending ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
