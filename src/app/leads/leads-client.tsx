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
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

const stageConfig = {
  new: { label: "New", color: "bg-primary", badgeVariant: "default" as const },
  contacted: {
    label: "Contacted",
    color: "bg-warning",
    badgeVariant: "warning" as const,
  },
  booked: {
    label: "Booked",
    color: "bg-accent",
    badgeVariant: "accent" as const,
  },
  converted: {
    label: "Converted",
    color: "bg-success",
    badgeVariant: "success" as const,
  },
  lost: {
    label: "Lost",
    color: "bg-destructive",
    badgeVariant: "destructive" as const,
  },
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
  if (!date) return "\u2014";
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
      <div className={cn("flex-1 p-6 overflow-auto", selected && "mr-[400px]")}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Leads Pipeline
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {totalLeads} total leads &middot; {newCount} new this week
            </p>
          </div>
          <Button onClick={() => setShowNewModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </Button>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex rounded-lg overflow-hidden border border-border">
            <Button
              variant={view === "pipeline" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("pipeline")}
              className="rounded-none"
            >
              Pipeline
            </Button>
            <Button
              variant={view === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("list")}
              className="rounded-none"
            >
              List
            </Button>
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
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
                      className={cn("w-2.5 h-2.5 rounded-full", config.color)}
                    />
                    <span className="text-sm font-medium text-foreground">
                      {config.label}
                    </span>
                    <Badge variant="secondary" className="text-xs px-2 py-0.5">
                      {stageLeads.length}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {stageLeads.map((lead) => (
                      <Card
                        key={lead.id}
                        onClick={() => setSelectedLead(lead.id)}
                        className={cn(
                          "cursor-pointer transition-all hover:border-primary/50",
                          selectedLead === lead.id && "border-primary",
                        )}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-foreground">
                              {lead.name}
                            </span>
                            <span className="text-xs font-bold text-primary">
                              {lead.score}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {lead.interest}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              {lead.source ? sourceIcons[lead.source] : null}
                              <span>{lead.source ?? "\u2014"}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(lead.createdAt)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {stageLeads.length === 0 && (
                      <div className="p-4 border border-dashed border-border rounded-lg text-center text-xs text-muted-foreground">
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
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs uppercase">Name</TableHead>
                  <TableHead className="text-xs uppercase">Source</TableHead>
                  <TableHead className="text-xs uppercase">Status</TableHead>
                  <TableHead className="text-xs uppercase">Score</TableHead>
                  <TableHead className="text-xs uppercase">Assigned</TableHead>
                  <TableHead className="text-xs uppercase">Created</TableHead>
                  <TableHead className="w-8"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((lead) => {
                  const config = stageConfig[lead.status];
                  return (
                    <TableRow
                      key={lead.id}
                      onClick={() => setSelectedLead(lead.id)}
                      className="cursor-pointer"
                    >
                      <TableCell>
                        <div>
                          <span className="text-sm font-medium text-foreground">
                            {lead.name}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {lead.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          {lead.source ? sourceIcons[lead.source] : null}
                          {lead.source ?? "\u2014"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={config.badgeVariant}>
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "text-sm font-bold",
                            lead.score >= 80
                              ? "text-success"
                              : lead.score >= 60
                                ? "text-warning"
                                : "text-destructive",
                          )}
                        >
                          {lead.score}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {lead.assignedTo ?? "\u2014"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(lead.createdAt)}
                      </TableCell>
                      <TableCell>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>

      {/* Detail Panel */}
      {selected && (
        <div className="fixed right-0 top-0 w-[400px] h-full bg-card border-l border-border p-6 overflow-auto z-40">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-foreground">Lead Details</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedLead(null)}
            >
              Close
            </Button>
          </div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
              {selected.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <h3 className="text-foreground font-semibold">{selected.name}</h3>
              <Badge variant={stageConfig[selected.status].badgeVariant}>
                {stageConfig[selected.status].label}
              </Badge>
            </div>
          </div>
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground">
                {selected.email ?? "\u2014"}
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground">
                {selected.phone ?? "\u2014"}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3 bg-background rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Lead Score</p>
              <p
                className={cn(
                  "text-xl font-bold",
                  selected.score >= 80
                    ? "text-success"
                    : selected.score >= 60
                      ? "text-warning"
                      : "text-destructive",
                )}
              >
                {selected.score}
              </p>
            </div>
            <div className="p-3 bg-background rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Source</p>
              <div className="flex items-center gap-1.5 text-sm text-foreground">
                {selected.source ? sourceIcons[selected.source] : null}
                {selected.source ?? "\u2014"}
              </div>
            </div>
            <div className="p-3 bg-background rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Created</p>
              <p className="text-sm text-foreground">
                {formatDate(selected.createdAt)}
              </p>
            </div>
            <div className="p-3 bg-background rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Last Contact</p>
              <p className="text-sm text-foreground">
                {formatDate(selected.lastContact)}
              </p>
            </div>
          </div>
          <div className="mb-6">
            <p className="text-xs text-muted-foreground mb-2">Interest</p>
            <p className="text-sm text-muted-foreground bg-background p-3 rounded-lg">
              {selected.interest ?? "\u2014"}
            </p>
          </div>
          <div className="mb-6">
            <p className="text-xs text-muted-foreground mb-2">Assigned To</p>
            <p className="text-sm text-foreground">
              {selected.assignedTo ?? "\u2014"}
            </p>
          </div>

          {/* Status Changer */}
          <div className="mb-6">
            <p className="text-xs text-muted-foreground mb-2">Move to Stage</p>
            <div className="flex flex-wrap gap-2">
              {stages
                .filter((s) => s !== selected.status)
                .map((stage) => {
                  const config = stageConfig[stage];
                  return (
                    <Button
                      key={stage}
                      variant="outline"
                      size="sm"
                      disabled={isPending}
                      onClick={() => handleStatusChange(selected.id, stage)}
                    >
                      <Badge
                        variant={config.badgeVariant}
                        className="mr-1.5 px-1.5 py-0"
                      >
                        &bull;
                      </Badge>
                      {config.label}
                    </Button>
                  );
                })}
            </div>
          </div>

          <div className="space-y-2">
            <Button className="w-full">
              <Phone className="w-4 h-4 mr-2" />
              Call Lead
            </Button>
            <Button variant="outline" className="w-full">
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleConvert(selected.id)}
              disabled={isPending || selected.status === "converted"}
            >
              <ArrowUpRight className="w-4 h-4 mr-2" />
              {selected.status === "converted"
                ? "Already Converted"
                : "Convert to Member"}
            </Button>
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => handleDelete(selected.id)}
              disabled={isPending}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Lead
            </Button>
          </div>
        </div>
      )}

      {/* New Lead Modal */}
      <NewLeadModal
        open={showNewModal}
        onOpenChange={setShowNewModal}
        isPending={isPending}
        startTransition={startTransition}
      />
    </div>
  );
}

function NewLeadModal({
  open,
  onOpenChange,
  isPending,
  startTransition,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Lead</DialogTitle>
          <DialogDescription>Add a new lead to the pipeline.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lead-name">Name *</Label>
            <Input
              id="lead-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lead-email">Email</Label>
              <Input
                id="lead-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead-phone">Phone</Label>
              <Input
                id="lead-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Source</Label>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {sourceOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead-score">Score (0-100)</Label>
              <Input
                id="lead-score"
                type="number"
                min="0"
                max="100"
                value={score}
                onChange={(e) => setScore(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lead-interest">Interest</Label>
            <Textarea
              id="lead-interest"
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lead-assigned">Assigned To</Label>
            <Input
              id="lead-assigned"
              type="text"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending ? "Creating..." : "Create Lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
