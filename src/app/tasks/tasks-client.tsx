"use client";

import { useState, useTransition } from "react";
import type { Task } from "@/db/schema/tasks";
import { createTask, deleteTask, updateTask } from "./actions";
import {
  Plus,
  Calendar,
  User,
  CheckCircle2,
  Circle,
  Clock,
  X,
  ArrowRight,
  Pencil,
  Trash2,
} from "lucide-react";

type TaskStatus = Task["status"];
type TaskPriority = Task["priority"];
type TaskCategory = Task["category"];
type ViewMode = "board" | "list";
type ModalMode = "create" | "edit" | null;

type TaskFormState = {
  title: string;
  assignedTo: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  category: TaskCategory;
};

const columnConfig: Record<
  TaskStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  todo: {
    label: "To Do",
    color: "border-t-blue-500",
    icon: <Circle className="w-4 h-4 text-blue-400" />,
  },
  "in-progress": {
    label: "In Progress",
    color: "border-t-yellow-500",
    icon: <Clock className="w-4 h-4 text-yellow-400" />,
  },
  done: {
    label: "Done",
    color: "border-t-green-500",
    icon: <CheckCircle2 className="w-4 h-4 text-green-400" />,
  },
};

const priorityColors: Record<TaskPriority, string> = {
  high: "bg-red-500/20 text-red-400",
  medium: "bg-yellow-500/20 text-yellow-400",
  low: "bg-green-500/20 text-green-400",
};

const categoryColors: Record<NonNullable<TaskCategory>, string> = {
  "follow-up": "bg-blue-500/10 text-blue-400",
  billing: "bg-orange-500/10 text-orange-400",
  operations: "bg-purple-500/10 text-purple-400",
  coaching: "bg-cyan-500/10 text-cyan-400",
};

const statusOrder: TaskStatus[] = ["todo", "in-progress", "done"];

const emptyForm: TaskFormState = {
  title: "",
  assignedTo: "",
  dueDate: "",
  priority: "medium",
  status: "todo",
  category: null,
};

function formatDate(date: Date | string | null): string {
  if (!date) return "No due date";

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function toDateInputValue(date: Date | string | null) {
  if (!date) return "";

  const value = new Date(date);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDueDate(value: string) {
  return value ? new Date(`${value}T12:00:00`) : null;
}

function nextStatus(status: TaskStatus): TaskStatus | null {
  if (status === "todo") return "in-progress";
  if (status === "in-progress") return "done";
  return null;
}

interface TasksClientProps {
  tasks: Task[];
}

export default function TasksClient({ tasks }: TasksClientProps) {
  const [taskItems, setTaskItems] = useState<Task[]>(tasks);
  const [view, setView] = useState<ViewMode>("board");
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [form, setForm] = useState<TaskFormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function openCreate() {
    setForm(emptyForm);
    setEditingTaskId(null);
    setFormError(null);
    setModalMode("create");
  }

  function openEdit(task: Task) {
    setForm({
      title: task.title,
      assignedTo: task.assignedTo ?? "",
      dueDate: toDateInputValue(task.dueDate),
      priority: task.priority,
      status: task.status,
      category: task.category,
    });
    setEditingTaskId(task.id);
    setFormError(null);
    setModalMode("edit");
  }

  function closeModal() {
    setModalMode(null);
    setEditingTaskId(null);
    setFormError(null);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!form.title.trim()) {
      setFormError("Task title is required.");
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          title: form.title.trim(),
          assignedTo: form.assignedTo.trim() || null,
          dueDate: parseDueDate(form.dueDate),
          priority: form.priority,
          status: form.status,
          category: form.category,
        };

        if (modalMode === "create") {
          const created = await createTask(payload);
          setTaskItems((current) => [created, ...current]);
        } else if (modalMode === "edit" && editingTaskId) {
          const updated = await updateTask(editingTaskId, payload);

          if (updated) {
            setTaskItems((current) =>
              current.map((task) => (task.id === updated.id ? updated : task)),
            );
          }
        }

        closeModal();
      } catch (error) {
        setFormError(
          error instanceof Error ? error.message : "Failed to save task.",
        );
      }
    });
  }

  function handleDelete(taskId: string) {
    startTransition(async () => {
      try {
        await deleteTask(taskId);
        setTaskItems((current) => current.filter((task) => task.id !== taskId));
        closeModal();
      } catch (error) {
        setFormError(
          error instanceof Error ? error.message : "Failed to delete task.",
        );
      }
    });
  }

  function handleQuickStatus(task: Task, status: TaskStatus) {
    startTransition(async () => {
      const updated = await updateTask(task.id, { status });

      if (updated) {
        setTaskItems((current) =>
          current.map((item) => (item.id === updated.id ? updated : item)),
        );
      }
    });
  }

  const openTaskCount = taskItems.filter(
    (task) => task.status !== "done",
  ).length;
  const highPriorityCount = taskItems.filter(
    (task) => task.priority === "high" && task.status !== "done",
  ).length;

  return (
    <div className="p-4 lg:p-6 overflow-auto h-full">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gym-text">Tasks</h1>
          <p className="text-gym-text-muted text-sm mt-1">
            {openTaskCount} open &middot; {highPriorityCount} high priority
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gym-card border border-gym-border rounded-lg overflow-hidden">
            <button
              onClick={() => setView("board")}
              className={`px-3 py-2 text-xs font-medium ${
                view === "board"
                  ? "bg-gym-primary text-white"
                  : "text-gym-text-secondary"
              }`}
            >
              Board
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-3 py-2 text-xs font-medium ${
                view === "list"
                  ? "bg-gym-primary text-white"
                  : "text-gym-text-secondary"
              }`}
            >
              List
            </button>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-gym-primary hover:bg-gym-primary/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
      </div>

      {view === "board" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statusOrder.map((status) => {
            const config = columnConfig[status];
            const columnTasks = taskItems.filter(
              (task) => task.status === status,
            );

            return (
              <div
                key={status}
                className={`bg-gym-card/50 border border-gym-border rounded-xl border-t-2 ${config.color}`}
              >
                <div className="p-3 flex items-center justify-between border-b border-gym-border">
                  <div className="flex items-center gap-2">
                    {config.icon}
                    <span className="text-sm font-medium text-gym-text">
                      {config.label}
                    </span>
                    <span className="text-xs text-gym-text-muted bg-gym-bg px-2 py-0.5 rounded-full">
                      {columnTasks.length}
                    </span>
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  {columnTasks.map((task) => {
                    const upcomingStatus = nextStatus(task.status);

                    return (
                      <div
                        key={task.id}
                        className="p-3 bg-gym-card border border-gym-border rounded-lg hover:border-gym-primary/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <button
                            onClick={() => openEdit(task)}
                            className="text-left"
                          >
                            <p className="text-sm font-medium text-gym-text leading-tight">
                              {task.title}
                            </p>
                          </button>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 capitalize ${priorityColors[task.priority]}`}
                          >
                            {task.priority}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {task.category ? (
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${categoryColors[task.category]}`}
                            >
                              {task.category}
                            </span>
                          ) : null}
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gym-border/50">
                          <div className="flex items-center gap-1 text-[10px] text-gym-text-muted">
                            <User className="w-3 h-3" />
                            <span>{task.assignedTo ?? "Unassigned"}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-gym-text-muted">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(task.dueDate)}</span>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            onClick={() => openEdit(task)}
                            className="flex-1 rounded-lg border border-gym-border px-3 py-2 text-xs font-medium text-gym-text hover:bg-gym-bg transition-colors"
                          >
                            <span className="inline-flex items-center gap-1">
                              <Pencil className="w-3.5 h-3.5" />
                              Edit
                            </span>
                          </button>
                          {upcomingStatus ? (
                            <button
                              onClick={() =>
                                handleQuickStatus(task, upcomingStatus)
                              }
                              disabled={isPending}
                              className="flex-1 rounded-lg bg-gym-primary px-3 py-2 text-xs font-medium text-white hover:bg-gym-primary/85 transition-colors disabled:opacity-50"
                            >
                              <span className="inline-flex items-center gap-1">
                                <ArrowRight className="w-3.5 h-3.5" />
                                {columnConfig[upcomingStatus].label}
                              </span>
                            </button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                  {columnTasks.length === 0 ? (
                    <div className="p-6 text-center text-xs text-gym-text-muted border border-dashed border-gym-border rounded-lg">
                      No tasks
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gym-card border border-gym-border rounded-xl overflow-x-auto">
          <table className="w-full min-w-[840px]">
            <thead>
              <tr className="border-b border-gym-border">
                <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">
                  Task
                </th>
                <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">
                  Priority
                </th>
                <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">
                  Category
                </th>
                <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">
                  Assigned
                </th>
                <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">
                  Due
                </th>
                <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">
                  Status
                </th>
                <th className="text-left p-3 text-xs font-medium text-gym-text-muted uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {taskItems.map((task) => {
                const upcomingStatus = nextStatus(task.status);

                return (
                  <tr
                    key={task.id}
                    className="border-b border-gym-border/50 hover:bg-gym-bg/50"
                  >
                    <td className="p-3">
                      <button
                        onClick={() => openEdit(task)}
                        className="text-sm font-medium text-gym-text text-left"
                      >
                        {task.title}
                      </button>
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full capitalize ${priorityColors[task.priority]}`}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="p-3">
                      {task.category ? (
                        <span
                          className={`text-xs px-2 py-1 rounded capitalize ${categoryColors[task.category]}`}
                        >
                          {task.category}
                        </span>
                      ) : (
                        <span className="text-xs text-gym-text-muted">-</span>
                      )}
                    </td>
                    <td className="p-3 text-xs text-gym-text-secondary">
                      {task.assignedTo ?? "Unassigned"}
                    </td>
                    <td className="p-3 text-xs text-gym-text-muted">
                      {formatDate(task.dueDate)}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        {columnConfig[task.status].icon}
                        <span className="text-xs text-gym-text-secondary capitalize">
                          {task.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(task)}
                          className="rounded-lg border border-gym-border px-2.5 py-1.5 text-xs font-medium text-gym-text hover:bg-gym-bg transition-colors"
                        >
                          Edit
                        </button>
                        {upcomingStatus ? (
                          <button
                            onClick={() =>
                              handleQuickStatus(task, upcomingStatus)
                            }
                            disabled={isPending}
                            className="rounded-lg bg-gym-primary px-2.5 py-1.5 text-xs font-medium text-white hover:bg-gym-primary/85 transition-colors disabled:opacity-50"
                          >
                            {columnConfig[upcomingStatus].label}
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modalMode ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-xl border border-gym-border bg-gym-card p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gym-text">
                  {modalMode === "create" ? "Add Task" : "Edit Task"}
                </h2>
                <p className="text-sm text-gym-text-muted mt-1">
                  Keep operations visible and assigned.
                </p>
              </div>
              <button
                onClick={closeModal}
                className="rounded-lg p-1 hover:bg-gym-bg transition-colors"
              >
                <X className="w-4 h-4 text-gym-text-muted" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs text-gym-text-muted">
                  Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gym-border bg-gym-bg px-3 py-2 text-sm text-gym-text focus:outline-none focus:border-gym-primary"
                  placeholder="Follow up with first-time trial lead"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs text-gym-text-muted">
                    Assigned To
                  </label>
                  <input
                    type="text"
                    value={form.assignedTo}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        assignedTo: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gym-border bg-gym-bg px-3 py-2 text-sm text-gym-text focus:outline-none focus:border-gym-primary"
                    placeholder="Front desk"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gym-text-muted">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        dueDate: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gym-border bg-gym-bg px-3 py-2 text-sm text-gym-text focus:outline-none focus:border-gym-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="mb-1 block text-xs text-gym-text-muted">
                    Priority
                  </label>
                  <select
                    value={form.priority}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        priority: event.target.value as TaskPriority,
                      }))
                    }
                    className="w-full rounded-lg border border-gym-border bg-gym-bg px-3 py-2 text-sm text-gym-text focus:outline-none focus:border-gym-primary"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gym-text-muted">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        status: event.target.value as TaskStatus,
                      }))
                    }
                    className="w-full rounded-lg border border-gym-border bg-gym-bg px-3 py-2 text-sm text-gym-text focus:outline-none focus:border-gym-primary"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gym-text-muted">
                    Category
                  </label>
                  <select
                    value={form.category ?? ""}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        category: event.target.value
                          ? (event.target.value as NonNullable<TaskCategory>)
                          : null,
                      }))
                    }
                    className="w-full rounded-lg border border-gym-border bg-gym-bg px-3 py-2 text-sm text-gym-text focus:outline-none focus:border-gym-primary"
                  >
                    <option value="">None</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="billing">Billing</option>
                    <option value="operations">Operations</option>
                    <option value="coaching">Coaching</option>
                  </select>
                </div>
              </div>

              {formError ? (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {formError}
                </div>
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div>
                  {modalMode === "edit" && editingTaskId ? (
                    <button
                      type="button"
                      onClick={() => handleDelete(editingTaskId)}
                      disabled={isPending}
                      className="inline-flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-300 hover:bg-red-500/15 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  ) : null}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-lg border border-gym-border px-4 py-2 text-sm font-medium text-gym-text hover:bg-gym-bg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="rounded-lg bg-gym-primary px-4 py-2 text-sm font-medium text-white hover:bg-gym-primary/85 transition-colors disabled:opacity-50"
                  >
                    {isPending
                      ? modalMode === "create"
                        ? "Creating..."
                        : "Saving..."
                      : modalMode === "create"
                        ? "Create Task"
                        : "Save Changes"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
