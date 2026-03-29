"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Lead } from "@/db/schema";
import { convertLead, createLead, updateLead, deleteLead } from "./actions";
import {
  Search,
  Plus,
  Phone,
  Mail,
  ChevronRight,
  Filter,
  Instagram,
  Globe,
  Facebook,
  Users,
  MapPin,
  ArrowUpRight,
  X,
  Trash2,
} from "lucide-react";

const stageConfig = {
  new: { label: "New", color: "bg-blue-500", textColor: "text-blue-400" },
  contacted: {
    label: "Contacted",
    color: "bg-yellow-500",
    textColor: "text-yellow-400",
  },
  booked: { label: "Booked", color: "bg-cyan-500", textColor: "text-cyan-400" },
  converted: {
    label: "Converted",
    color: "bg-green-500",
    textColor: "text-green-400",
  },
  lost: { label: "Lost", color: "bg-red-500", textColor: "text-red-400" },
};

const sourceIcons: Record<string, React.ReactNode> = {
  Instagram: <Instagram className="w-3.5 h-3.5" />,
  Website: <Globe className="w-3.5 h-3.5" />,
  Facebook: <Facebook className="w-3.5 h-3.5" />,
  Google: <Globe className="w-3.5 h-3.5" />,
  Referral: <Users className="w-3.5 h-3.5" />,
  "Walk-in": <MapPin className="w-3.5 h-3.5" />,
};

type ViewMode = "pipeline" | "list";
type StageName = keyof typeof stageConfig;

const stages: StageName[] = ["new", "contacted", "booked", "converted", "lost"];
const sourceOptions = [
  "Instagram",
  "Website",
  "Facebook",
  "Walk-in",
  "Referral",
  "Google",
] as const;

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type Props = {
  initialLeads: Lead[];
  initialCounts: Record<string, number>;
};

export default function LeadsClient({ initialLeads, initialCounts }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [view, setView] = useState<ViewMode>("pipeline");
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const allLeads = initialLeads;
  const counts = initialCounts;

  const filtered = allLeads.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      (l.email ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  const selected = selectedLead
    ? (allLeads.find((l) => l.id === selectedLead) ?? null)
    : null;

  const totalLeads = allLeads.length;
  const newCount = counts["new"] ?? 0;

  function handleStatusChange(id: string, newStatus: Lead["status"]) {
    startTransition(async () => {
      try {
        setError(null);
        await updateLead(id, { status: newStatus, lastContact: new Date() });
        router.refresh();
      } catch (nextError) {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Failed to update lead.",
        );
      }
    });
  }

  function handleDelete(id: string) {
    setSelectedLead(null);
    startTransition(async () => {
      try {
        setError(null);
        await deleteLead(id);
        router.refresh();
      } catch (nextError) {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Failed to delete lead.",
        );
      }
    });
  }

  function handleConvert(id: string) {
    startTransition(async () => {
      try {
        setError(null);
        await convertLead(id);
        router.refresh();
      } catch (nextError) {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Failed to convert lead.",
        );
      }
    });
  }

  return (
    <div className="flex h-full">
      <div
        className={`flex-1 p-6 overflow-auto ${selected ? "mr-[400px]" : ""}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gym-text">Leads Pipeline</h1>
            <p className="text-gym-text-muted text-sm mt-1">
              {totalLeads} total leads &middot; {newCount} new this week
            </p>
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 bg-gym-primary hover:bg-gym-primary/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Lead
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gym-text-muted" />
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gym-card border border-gym-border rounded-lg text-gym-text text-sm placeholder:text-gym-text-muted focus:outline-none focus:border-gym-primary"
            />
          </div>
          <div className="flex bg-gym-card border border-gym-border rounded-lg overflow-hidden">
            <button
              onClick={() => setView("pipeline")}
              className={`px-3 py-2 text-xs font-medium ${view === "pipeline" ? "bg-gym-primary text-white" : "text-gym-text-secondary hover:text-gym-text"}`}
            >
              Pipeline
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-3 py-2 text-xs font-medium ${view === "list" ? "bg-gym-primary text-white" : "text-gym-text-secondary hover:text-gym-text"}`}
            >
              List
            </button>
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-gym-card border border-gym-border rounded-lg text-gym-text-secondary text-sm hover:text-gym-text">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Pipeline View */}
        {view === "pipeline" && (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {stages.map((stage) => {
              const stageLeads = filtered.filter((l) => l.status === stage);
              const config = stageConfig[stage];
              return (
                <div key={stage} className="min-w-[260px] flex-1">
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${config.color}`}
                    />
                    <span className="text-sm font-medium text-gym-text">
                      {config.label}
                    </span>
                    <span className="text-xs text-gym-text-muted bg-gym-card px-2 py-0.5 rounded-full">
                      {stageLeads.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        onClick={() => setSelectedLead(lead.id)}
                        className={`p-3 bg-gym-card border rounded-lg cursor-pointer transition-all hover:border-gym-primary/50 ${selectedLead === lead.id ? "border-gym-primary" : "border-gym-border"}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gym-text">
                            {lead.name}
                          </span>
                          <span className="text-xs font-bold text-gym-primary">
                            {lead.score}
                          </span>
                        </div>
                        <p className="text-xs text-gym-text-muted mb-2 line-clamp-2">
                          {lead.interest}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-gym-text-muted">
                            {lead.source ? sourceIcons[lead.source] : null}
                            <span>{lead.source ?? "—"}</span>
                          </div>
                          <span className="text-xs text-gym-text-muted">
                            {formatDate(lead.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                    {stageLeads.length === 0 && (
                      <div className="p-4 border border-dashed border-gym-border rounded-lg text-center text-xs text-gym-text-muted">
                        No leads
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* List View */}
        {view === "list" && (
          <div className="bg-gym-card border border-gym-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gym-border">
                  <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">
                    Name
                  </th>
                  <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">
                    Source
                  </th>
                  <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">
                    Status
                  </th>
                  <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">
                    Score
                  </th>
                  <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">
                    Assigned
                  </th>
                  <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">
                    Created
                  </th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => {
                  const config = stageConfig[lead.status];
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLead(lead.id)}
                      className="border-b border-gym-border/50 hover:bg-gym-bg/50 cursor-pointer transition-colors"
                    >
                      <td className="p-3">
                        <div>
                          <span className="text-sm font-medium text-gym-text">
                            {lead.name}
                          </span>
                          <p className="text-xs text-gym-text-muted">
                            {lead.email}
                          </p>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5 text-xs text-gym-text-secondary">
                          {lead.source ? sourceIcons[lead.source] : null}
                          {lead.source ?? "—"}
                        </div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-xs font-medium ${config.textColor}`}
                        >
                          {config.label}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-sm font-bold ${lead.score >= 80 ? "text-green-400" : lead.score >= 60 ? "text-yellow-400" : "text-red-400"}`}
                        >
                          {lead.score}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-gym-text-secondary">
                        {lead.assignedTo ?? "—"}
                      </td>
                      <td className="p-3 text-xs text-gym-text-muted">
                        {formatDate(lead.createdAt)}
                      </td>
                      <td className="p-3">
                        <ChevronRight className="w-4 h-4 text-gym-text-muted" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {selected && (
        <div className="fixed right-0 top-0 w-[400px] h-full bg-gym-card border-l border-gym-border p-6 overflow-auto z-40">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gym-text">Lead Details</h2>
            <button
              onClick={() => setSelectedLead(null)}
              className="text-gym-text-muted hover:text-gym-text text-sm"
            >
              Close
            </button>
          </div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gym-primary/20 rounded-full flex items-center justify-center text-gym-primary font-bold">
              {selected.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <h3 className="text-gym-text font-semibold">{selected.name}</h3>
              <span
                className={`text-xs font-medium ${stageConfig[selected.status].textColor}`}
              >
                {stageConfig[selected.status].label}
              </span>
            </div>
          </div>
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 p-3 bg-gym-bg rounded-lg">
              <Mail className="w-4 h-4 text-gym-text-muted" />
              <span className="text-sm text-gym-text">
                {selected.email ?? "—"}
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gym-bg rounded-lg">
              <Phone className="w-4 h-4 text-gym-text-muted" />
              <span className="text-sm text-gym-text">
                {selected.phone ?? "—"}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3 bg-gym-bg rounded-lg">
              <p className="text-xs text-gym-text-muted mb-1">Lead Score</p>
              <p
                className={`text-xl font-bold ${selected.score >= 80 ? "text-green-400" : selected.score >= 60 ? "text-yellow-400" : "text-red-400"}`}
              >
                {selected.score}
              </p>
            </div>
            <div className="p-3 bg-gym-bg rounded-lg">
              <p className="text-xs text-gym-text-muted mb-1">Source</p>
              <div className="flex items-center gap-1.5 text-sm text-gym-text">
                {selected.source ? sourceIcons[selected.source] : null}
                {selected.source ?? "—"}
              </div>
            </div>
            <div className="p-3 bg-gym-bg rounded-lg">
              <p className="text-xs text-gym-text-muted mb-1">Created</p>
              <p className="text-sm text-gym-text">
                {formatDate(selected.createdAt)}
              </p>
            </div>
            <div className="p-3 bg-gym-bg rounded-lg">
              <p className="text-xs text-gym-text-muted mb-1">Last Contact</p>
              <p className="text-sm text-gym-text">
                {formatDate(selected.lastContact)}
              </p>
            </div>
          </div>
          <div className="mb-6">
            <p className="text-xs text-gym-text-muted mb-2">Interest</p>
            <p className="text-sm text-gym-text-secondary bg-gym-bg p-3 rounded-lg">
              {selected.interest ?? "—"}
            </p>
          </div>
          <div className="mb-6">
            <p className="text-xs text-gym-text-muted mb-2">Assigned To</p>
            <p className="text-sm text-gym-text">
              {selected.assignedTo ?? "—"}
            </p>
          </div>

          {/* Status Changer */}
          <div className="mb-6">
            <p className="text-xs text-gym-text-muted mb-2">Move to Stage</p>
            <div className="flex flex-wrap gap-2">
              {stages
                .filter((s) => s !== selected.status)
                .map((stage) => {
                  const config = stageConfig[stage];
                  return (
                    <button
                      key={stage}
                      disabled={isPending}
                      onClick={() => handleStatusChange(selected.id, stage)}
                      className={`text-xs px-3 py-1.5 rounded-lg border border-gym-border hover:border-gym-primary/50 transition-colors ${config.textColor} disabled:opacity-50`}
                    >
                      {config.label}
                    </button>
                  );
                })}
            </div>
          </div>

          <div className="space-y-2">
            <button className="w-full flex items-center justify-center gap-2 bg-gym-primary hover:bg-gym-primary/80 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
              <Phone className="w-4 h-4" />
              Call Lead
            </button>
            <button className="w-full flex items-center justify-center gap-2 bg-gym-bg hover:bg-gym-border text-gym-text px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border border-gym-border">
              <Mail className="w-4 h-4" />
              Send Email
            </button>
            <button
              onClick={() => handleConvert(selected.id)}
              disabled={isPending || selected.status === "converted"}
              className="w-full flex items-center justify-center gap-2 bg-gym-bg hover:bg-gym-border text-gym-text px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border border-gym-border disabled:opacity-50"
            >
              <ArrowUpRight className="w-4 h-4" />
              {selected.status === "converted"
                ? "Already Converted"
                : "Convert to Member"}
            </button>
            <button
              onClick={() => handleDelete(selected.id)}
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 bg-gym-bg hover:bg-red-500/10 text-red-400 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border border-gym-border disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              Delete Lead
            </button>
          </div>
        </div>
      )}

      {/* New Lead Modal */}
      {showNewModal && (
        <NewLeadModal
          onClose={() => setShowNewModal(false)}
          isPending={isPending}
          startTransition={startTransition}
        />
      )}
    </div>
  );
}

function NewLeadModal({
  onClose,
  isPending,
  startTransition,
}: {
  onClose: () => void;
  isPending: boolean;
  startTransition: (fn: () => Promise<void>) => void;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState("");
  const [interest, setInterest] = useState("");
  const [score, setScore] = useState("50");
  const [assignedTo, setAssignedTo] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    startTransition(async () => {
      await createLead({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        source: (source || undefined) as Lead["source"] | undefined,
        interest: interest.trim() || undefined,
        score: parseInt(score, 10) || 50,
        assignedTo: assignedTo.trim() || undefined,
      });
      router.refresh();
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gym-card border border-gym-border rounded-xl w-full max-w-lg p-6 mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gym-text">New Lead</h2>
          <button
            onClick={onClose}
            className="text-gym-text-muted hover:text-gym-text"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gym-text-muted mb-1">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gym-bg border border-gym-border rounded-lg text-gym-text text-sm focus:outline-none focus:border-gym-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gym-text-muted mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-gym-bg border border-gym-border rounded-lg text-gym-text text-sm focus:outline-none focus:border-gym-primary"
              />
            </div>
            <div>
              <label className="block text-xs text-gym-text-muted mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-gym-bg border border-gym-border rounded-lg text-gym-text text-sm focus:outline-none focus:border-gym-primary"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gym-text-muted mb-1">
                Source
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-3 py-2 bg-gym-bg border border-gym-border rounded-lg text-gym-text text-sm focus:outline-none focus:border-gym-primary"
              >
                <option value="">Select source</option>
                {sourceOptions.map((s) =>
                  s ? (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ) : null,
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gym-text-muted mb-1">
                Score (0-100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="w-full px-3 py-2 bg-gym-bg border border-gym-border rounded-lg text-gym-text text-sm focus:outline-none focus:border-gym-primary"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gym-text-muted mb-1">
              Interest
            </label>
            <textarea
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-gym-bg border border-gym-border rounded-lg text-gym-text text-sm focus:outline-none focus:border-gym-primary resize-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gym-text-muted mb-1">
              Assigned To
            </label>
            <input
              type="text"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-3 py-2 bg-gym-bg border border-gym-border rounded-lg text-gym-text text-sm focus:outline-none focus:border-gym-primary"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gym-bg border border-gym-border rounded-lg text-gym-text text-sm font-medium hover:bg-gym-border transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !name.trim()}
              className="flex-1 px-4 py-2.5 bg-gym-primary hover:bg-gym-primary/80 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isPending ? "Creating..." : "Create Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
