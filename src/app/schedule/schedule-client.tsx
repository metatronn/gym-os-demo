"use client";

import { useState, useTransition } from "react";
import { Clock, Users, Plus, ChevronLeft, ChevronRight, X } from "lucide-react";
import type { ClassSession } from "@/db/schema/classes";
import { createClass, updateClass, deleteClass } from "./actions";
import { useRouter } from "next/navigation";

const typeColors: Record<string, string> = {
  boxing: "bg-red-500/20 text-red-400 border-red-500/30",
  kickboxing: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  conditioning: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  fundamentals: "bg-green-500/20 text-green-400 border-green-500/30",
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
          <h1 className="text-2xl font-bold text-gym-text">Class Schedule</h1>
          <p className="text-gym-text-muted text-sm mt-1">
            {classes.length} classes this week &middot;{" "}
            {classes.reduce((a, c) => a + c.enrolled, 0)} total enrolled
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gym-card border border-gym-border rounded-lg overflow-hidden">
            <button
              onClick={() => setView("week")}
              className={`px-3 py-2 text-xs font-medium ${view === "week" ? "bg-gym-primary text-white" : "text-gym-text-secondary"}`}
            >
              Week
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-3 py-2 text-xs font-medium ${view === "list" ? "bg-gym-primary text-white" : "text-gym-text-secondary"}`}
            >
              List
            </button>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-gym-primary hover:bg-gym-primary/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Class
          </button>
        </div>
      </div>

      {/* Week Nav */}
      <div className="flex items-center justify-between mb-6 bg-gym-card border border-gym-border rounded-xl p-3">
        <button
          onClick={() => setWeekOffset((current) => current - 1)}
          className="p-1 hover:bg-gym-bg rounded"
        >
          <ChevronLeft className="w-5 h-5 text-gym-text-muted" />
        </button>
        <span className="text-sm font-medium text-gym-text">{weekLabel}</span>
        <button
          onClick={() => setWeekOffset((current) => current + 1)}
          className="p-1 hover:bg-gym-bg rounded"
        >
          <ChevronRight className="w-5 h-5 text-gym-text-muted" />
        </button>
      </div>

      {view === "week" ? (
        /* Week Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {days.map((day) => {
            const dayClasses = classes.filter((c) => c.dayOfWeek === day);
            const isToday = weekOffset === 0 && day === todayName;
            return (
              <div key={day} className="min-h-[300px]">
                <div
                  className={`text-center mb-3 pb-2 border-b ${isToday ? "border-gym-primary" : "border-gym-border"}`}
                >
                  <p
                    className={`text-xs font-medium ${isToday ? "text-gym-primary" : "text-gym-text-muted"}`}
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
                      <div
                        key={cls.id}
                        onClick={() => openEdit(cls)}
                        className={`p-2.5 rounded-lg border ${typeColors[cls.type ?? ""] ?? "bg-gray-500/20 text-gray-400 border-gray-500/30"} cursor-pointer hover:opacity-80 transition-opacity`}
                      >
                        <p className="text-xs font-semibold mb-1 leading-tight">
                          {cls.name}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] opacity-80 mb-1">
                          <Clock className="w-3 h-3" />
                          <span>{cls.time}</span>
                          <span>&middot;</span>
                          <span>{cls.duration}m</span>
                        </div>
                        <p className="text-[10px] opacity-70 mb-2">
                          {cls.instructor}
                        </p>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 opacity-70" />
                          <div className="flex-1 h-1.5 bg-black/20 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${fill >= 90 ? "bg-red-400" : fill >= 70 ? "bg-yellow-400" : "bg-green-400"}`}
                              style={{ width: `${fill}%` }}
                            />
                          </div>
                          <span className="text-[10px] opacity-70">
                            {cls.enrolled}/{cls.capacity}
                          </span>
                        </div>
                        {cls.waitlist > 0 && (
                          <p className="text-[10px] text-yellow-300 mt-1">
                            {cls.waitlist} waitlisted
                          </p>
                        )}
                      </div>
                    );
                  })}
                  {dayClasses.length === 0 && (
                    <p className="text-xs text-gym-text-muted text-center pt-8">
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
        <div className="bg-gym-card border border-gym-border rounded-xl overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-gym-border">
                <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">
                  Class
                </th>
                <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">
                  Day
                </th>
                <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">
                  Time
                </th>
                <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">
                  Instructor
                </th>
                <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">
                  Capacity
                </th>
                <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">
                  Type
                </th>
              </tr>
            </thead>
            <tbody>
              {classes.map((cls) => {
                const fill = cls.capacity
                  ? Math.round((cls.enrolled / cls.capacity) * 100)
                  : 0;
                return (
                  <tr
                    key={cls.id}
                    onClick={() => openEdit(cls)}
                    className="border-b border-gym-border/50 hover:bg-gym-bg/50 cursor-pointer"
                  >
                    <td className="p-3 text-sm font-medium text-gym-text">
                      {cls.name}
                    </td>
                    <td className="p-3 text-sm text-gym-text-secondary">
                      {cls.dayOfWeek}
                    </td>
                    <td className="p-3 text-sm text-gym-text-secondary">
                      {cls.time} ({cls.duration}m)
                    </td>
                    <td className="p-3 text-sm text-gym-text-secondary">
                      {cls.instructor}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gym-bg rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${fill >= 90 ? "bg-red-400" : fill >= 70 ? "bg-yellow-400" : "bg-green-400"}`}
                            style={{ width: `${fill}%` }}
                          />
                        </div>
                        <span className="text-xs text-gym-text-muted">
                          {cls.enrolled}/{cls.capacity}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full capitalize border ${typeColors[cls.type ?? ""] ?? "bg-gray-500/20 text-gray-400 border-gray-500/30"}`}
                      >
                        {cls.type}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-gym-card border border-gym-border rounded-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gym-text">
                {modalMode === "create" ? "Add Class" : "Edit Class"}
              </h2>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-gym-bg rounded"
              >
                <X className="w-5 h-5 text-gym-text-muted" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gym-text-muted mb-1">
                  Class Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="w-full bg-gym-bg border border-gym-border rounded-lg px-3 py-2 text-sm text-gym-text focus:outline-none focus:border-gym-primary"
                  placeholder="e.g. Advanced Boxing"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gym-text-muted mb-1">
                    Day
                  </label>
                  <select
                    value={form.dayOfWeek}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, dayOfWeek: e.target.value }))
                    }
                    className="w-full bg-gym-bg border border-gym-border rounded-lg px-3 py-2 text-sm text-gym-text focus:outline-none focus:border-gym-primary"
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gym-text-muted mb-1">
                    Time
                  </label>
                  <input
                    type="text"
                    value={form.time}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, time: e.target.value }))
                    }
                    className="w-full bg-gym-bg border border-gym-border rounded-lg px-3 py-2 text-sm text-gym-text focus:outline-none focus:border-gym-primary"
                    placeholder="6:00 PM"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gym-text-muted mb-1">
                    Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, type: e.target.value }))
                    }
                    className="w-full bg-gym-bg border border-gym-border rounded-lg px-3 py-2 text-sm text-gym-text focus:outline-none focus:border-gym-primary"
                  >
                    {classTypes.map((t) => (
                      <option key={t} value={t} className="capitalize">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gym-text-muted mb-1">
                    Duration (min)
                  </label>
                  <input
                    type="number"
                    value={form.duration}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, duration: e.target.value }))
                    }
                    className="w-full bg-gym-bg border border-gym-border rounded-lg px-3 py-2 text-sm text-gym-text focus:outline-none focus:border-gym-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gym-text-muted mb-1">
                  Instructor
                </label>
                <input
                  type="text"
                  value={form.instructor}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, instructor: e.target.value }))
                  }
                  className="w-full bg-gym-bg border border-gym-border rounded-lg px-3 py-2 text-sm text-gym-text focus:outline-none focus:border-gym-primary"
                  placeholder="e.g. Marcus Johnson"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gym-text-muted mb-1">
                  Capacity
                </label>
                <input
                  type="number"
                  value={form.capacity}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, capacity: e.target.value }))
                  }
                  className="w-full bg-gym-bg border border-gym-border rounded-lg px-3 py-2 text-sm text-gym-text focus:outline-none focus:border-gym-primary"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 bg-gym-primary hover:bg-gym-primary/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isPending
                    ? "Saving..."
                    : modalMode === "create"
                      ? "Add Class"
                      : "Save Changes"}
                </button>
                {modalMode === "edit" && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isPending}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 border border-red-500/30 transition-colors disabled:opacity-50"
                  >
                    Delete
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
