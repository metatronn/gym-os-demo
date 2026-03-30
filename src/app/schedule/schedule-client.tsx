"use client";

import { useState, useTransition } from "react";
import { Clock, Users, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import type { ClassSession } from "@/db/schema/classes";
import { createClass, updateClass, deleteClass } from "./actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
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

const typeColors: Record<string, string> = {
  boxing: "border-l-destructive bg-destructive/10",
  kickboxing: "border-l-warning bg-warning/10",
  conditioning: "border-l-accent bg-accent/10",
  fundamentals: "border-l-success bg-success/10",
};

const typeBadgeVariant: Record<
  string,
  "destructive" | "warning" | "accent" | "success"
> = {
  boxing: "destructive",
  kickboxing: "warning",
  conditioning: "accent",
  fundamentals: "success",
};

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const classTypes = [
  "boxing",
  "kickboxing",
  "conditioning",
  "fundamentals",
] as const;

type ModalMode = "create" | "edit" | null;

type FormData = {
  name: string;
  instructor: string;
  dayOfWeek: string;
  time: string;
  duration: string;
  capacity: string;
  type: string;
};

const emptyForm: FormData = {
  name: "",
  instructor: "",
  dayOfWeek: "Monday",
  time: "6:00 PM",
  duration: "60",
  capacity: "12",
  type: "boxing",
};

function addDays(date: Date, daysToAdd: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + daysToAdd);
  return next;
}

function startOfWeek(date: Date) {
  const next = new Date(date);
  const day = next.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  next.setHours(0, 0, 0, 0);
  next.setDate(next.getDate() + offset);
  return next;
}

function formatWeekRange(weekStart: Date) {
  const weekEnd = addDays(weekStart, 6);
  const startMonth = weekStart.toLocaleDateString("en-US", { month: "long" });
  const endMonth = weekEnd.toLocaleDateString("en-US", { month: "long" });
  const startDay = weekStart.getDate();
  const endDay = weekEnd.getDate();
  const year = weekEnd.getFullYear();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} - ${endDay}, ${year}`;
  }

  return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
}

export default function ScheduleClient({
  classes,
}: {
  classes: ClassSession[];
}) {
  const [view, setView] = useState<"week" | "list">("week");
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [weekOffset, setWeekOffset] = useState(0);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const today = new Date();
  const selectedWeekStart = startOfWeek(addDays(today, weekOffset * 7));
  const weekLabel = formatWeekRange(selectedWeekStart);
  const todayIndex = (today.getDay() + 6) % 7;
  const todayName = days[todayIndex];

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setModalMode("create");
  }

  function openEdit(cls: ClassSession) {
    setForm({
      name: cls.name,
      instructor: cls.instructor ?? "",
      dayOfWeek: cls.dayOfWeek ?? "Monday",
      time: cls.time ?? "",
      duration: String(cls.duration ?? 60),
      capacity: String(cls.capacity ?? 12),
      type: cls.type ?? "boxing",
    });
    setEditingId(cls.id);
    setModalMode("edit");
  }

  function closeModal() {
    setModalMode(null);
    setEditingId(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const payload = {
        name: form.name,
        instructor: form.instructor || null,
        dayOfWeek: form.dayOfWeek,
        time: form.time,
        duration: parseInt(form.duration) || 60,
        capacity: parseInt(form.capacity) || 12,
        type: form.type as ClassSession["type"],
      };

      if (modalMode === "create") {
        await createClass(payload);
      } else if (modalMode === "edit" && editingId) {
        await updateClass(editingId, payload);
      }

      closeModal();
      router.refresh();
    });
  }

  function handleDelete() {
    if (!editingId) return;
    startTransition(async () => {
      await deleteClass(editingId);
      closeModal();
      router.refresh();
    });
  }

  return (
    <div className="p-4 lg:p-6 overflow-auto h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Class Schedule</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {classes.length} classes this week &middot;{" "}
            {classes.reduce((a, c) => a + c.enrolled, 0)} total enrolled
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex">
            <Button
              variant={view === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("week")}
              className="rounded-r-none"
            >
              Week
            </Button>
            <Button
              variant={view === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("list")}
              className="rounded-l-none"
            >
              List
            </Button>
          </div>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" /> Add Class
          </Button>
        </div>
      </div>

      {/* Week Nav */}
      <Card className="mb-6">
        <CardContent className="flex items-center justify-between p-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setWeekOffset((current) => current - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium text-foreground">
            {weekLabel}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setWeekOffset((current) => current + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>

      {view === "week" ? (
        /* Week Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {days.map((day) => {
            const dayClasses = classes.filter((c) => c.dayOfWeek === day);
            const isToday = weekOffset === 0 && day === todayName;
            return (
              <div key={day} className="min-h-[300px]">
                <div
                  className={cn(
                    "text-center mb-3 pb-2 border-b",
                    isToday ? "border-primary" : "border-border",
                  )}
                >
                  <p
                    className={cn(
                      "text-xs font-medium",
                      isToday ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {day.slice(0, 3).toUpperCase()}
                  </p>
                </div>
                <div className="space-y-2">
                  {dayClasses.map((cls) => {
                    const fill = cls.capacity
                      ? Math.round((cls.enrolled / cls.capacity) * 100)
                      : 0;
                    return (
                      <Card
                        key={cls.id}
                        onClick={() => openEdit(cls)}
                        className={cn(
                          "cursor-pointer hover:opacity-80 transition-opacity border-l-4 p-2.5",
                          typeColors[cls.type ?? ""] ??
                            "border-l-gray-500 bg-gray-500/10",
                        )}
                      >
                        <p className="text-xs font-semibold mb-1 leading-tight text-foreground">
                          {cls.name}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
                          <Clock className="w-3 h-3" />
                          <span>{cls.time}</span>
                          <span>&middot;</span>
                          <span>{cls.duration}m</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mb-2">
                          {cls.instructor}
                        </p>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-muted-foreground" />
                          <Progress
                            value={fill}
                            className={cn(
                              "h-1.5 flex-1",
                              fill >= 90
                                ? "[&>div]:bg-destructive"
                                : fill >= 70
                                  ? "[&>div]:bg-warning"
                                  : "[&>div]:bg-success",
                            )}
                          />
                          <span className="text-[10px] text-muted-foreground">
                            {cls.enrolled}/{cls.capacity}
                          </span>
                        </div>
                        {cls.waitlist > 0 && (
                          <p className="text-[10px] text-warning mt-1">
                            {cls.waitlist} waitlisted
                          </p>
                        )}
                      </Card>
                    );
                  })}
                  {dayClasses.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center pt-8">
                      No classes
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Day</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((cls) => {
                const fill = cls.capacity
                  ? Math.round((cls.enrolled / cls.capacity) * 100)
                  : 0;
                return (
                  <TableRow
                    key={cls.id}
                    onClick={() => openEdit(cls)}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-medium text-foreground">
                      {cls.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {cls.dayOfWeek}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {cls.time} ({cls.duration}m)
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {cls.instructor}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={fill}
                          className={cn(
                            "h-1.5 w-16",
                            fill >= 90
                              ? "[&>div]:bg-destructive"
                              : fill >= 70
                                ? "[&>div]:bg-warning"
                                : "[&>div]:bg-success",
                          )}
                        />
                        <span className="text-xs text-muted-foreground">
                          {cls.enrolled}/{cls.capacity}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          typeBadgeVariant[cls.type ?? ""] ?? "secondary"
                        }
                        className="capitalize"
                      >
                        {cls.type}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Dialog
        open={modalMode !== null}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modalMode === "create" ? "Add Class" : "Edit Class"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Schedule a new class session."
                : "Update class details."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="class-name">Class Name</Label>
              <Input
                id="class-name"
                required
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Advanced Boxing"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Day</Label>
                <Select
                  value={form.dayOfWeek}
                  onValueChange={(value) =>
                    setForm((f) => ({ ...f, dayOfWeek: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="class-time">Time</Label>
                <Input
                  id="class-time"
                  value={form.time}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, time: e.target.value }))
                  }
                  placeholder="6:00 PM"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(value) =>
                    setForm((f) => ({ ...f, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {classTypes.map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="class-duration">Duration (min)</Label>
                <Input
                  id="class-duration"
                  type="number"
                  value={form.duration}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, duration: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="class-instructor">Instructor</Label>
              <Input
                id="class-instructor"
                value={form.instructor}
                onChange={(e) =>
                  setForm((f) => ({ ...f, instructor: e.target.value }))
                }
                placeholder="e.g. Marcus Johnson"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="class-capacity">Capacity</Label>
              <Input
                id="class-capacity"
                type="number"
                value={form.capacity}
                onChange={(e) =>
                  setForm((f) => ({ ...f, capacity: e.target.value }))
                }
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              {modalMode === "edit" && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="sm:mr-auto"
                >
                  Delete
                </Button>
              )}
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? "Saving..."
                  : modalMode === "create"
                    ? "Add Class"
                    : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
