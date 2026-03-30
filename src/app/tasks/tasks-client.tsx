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
  ArrowRight,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    color: "border-t-primary",
    icon: <Circle className="w-4 h-4 text-primary" />,
  },
  "in-progress": {
    label: "In Progress",
    color: "border-t-warning",
    icon: <Clock className="w-4 h-4 text-warning" />,
  },
  done: {
    label: "Done",
    color: "border-t-success",
    icon: <CheckCircle2 className="w-4 h-4 text-success" />,
  },
};

const priorityBadgeVariant: Record<
  TaskPriority,
  "destructive" | "warning" | "success"
> = {
  high: "destructive",
  medium: "warning",
  low: "success",
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
          <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {openTaskCount} open &middot; {highPriorityCount} high priority
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg overflow-hidden border border-border">
            <Button
              variant={view === "board" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("board")}
              className="rounded-none"
            >
              Board
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
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" /> Add Task
          </Button>
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
              <Card
                key={status}
                className={cn("bg-card/50 border-t-2", config.color)}
              >
                <div className="p-3 flex items-center justify-between border-b border-border">
                  <div className="flex items-center gap-2">
                    {config.icon}
                    <span className="text-sm font-medium text-foreground">
                      {config.label}
                    </span>
                    <Badge variant="secondary" className="text-xs px-2 py-0.5">
                      {columnTasks.length}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-3 space-y-2">
                  {columnTasks.map((task) => {
                    const upcomingStatus = nextStatus(task.status);

                    return (
                      <Card
                        key={task.id}
                        className="hover:border-primary/50 transition-colors"
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <button
                              onClick={() => openEdit(task)}
                              className="text-left"
                            >
                              <p className="text-sm font-medium text-foreground leading-tight">
                                {task.title}
                              </p>
                            </button>
                            <Badge
                              variant={priorityBadgeVariant[task.priority]}
                              className="text-[10px] px-1.5 py-0 flex-shrink-0 capitalize"
                            >
                              {task.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {task.category ? (
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0 capitalize"
                              >
                                {task.category}
                              </Badge>
                            ) : null}
                          </div>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <User className="w-3 h-3" />
                              <span>{task.assignedTo ?? "Unassigned"}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(task.dueDate)}</span>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => openEdit(task)}
                            >
                              <Pencil className="w-3.5 h-3.5 mr-1" />
                              Edit
                            </Button>
                            {upcomingStatus ? (
                              <Button
                                size="sm"
                                className="flex-1"
                                onClick={() =>
                                  handleQuickStatus(task, upcomingStatus)
                                }
                                disabled={isPending}
                              >
                                <ArrowRight className="w-3.5 h-3.5 mr-1" />
                                {columnConfig[upcomingStatus].label}
                              </Button>
                            ) : null}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  {columnTasks.length === 0 ? (
                    <div className="p-6 text-center text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                      No tasks
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs uppercase">Task</TableHead>
                <TableHead className="text-xs uppercase">Priority</TableHead>
                <TableHead className="text-xs uppercase">Category</TableHead>
                <TableHead className="text-xs uppercase">Assigned</TableHead>
                <TableHead className="text-xs uppercase">Due</TableHead>
                <TableHead className="text-xs uppercase">Status</TableHead>
                <TableHead className="text-xs uppercase">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taskItems.map((task) => {
                const upcomingStatus = nextStatus(task.status);

                return (
                  <TableRow key={task.id}>
                    <TableCell>
                      <button
                        onClick={() => openEdit(task)}
                        className="text-sm font-medium text-foreground text-left"
                      >
                        {task.title}
                      </button>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={priorityBadgeVariant[task.priority]}
                        className="capitalize"
                      >
                        {task.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {task.category ? (
                        <Badge variant="outline" className="capitalize">
                          {task.category}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {task.assignedTo ?? "Unassigned"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(task.dueDate)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {columnConfig[task.status].icon}
                        <span className="text-xs text-muted-foreground capitalize">
                          {task.status}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEdit(task)}
                        >
                          Edit
                        </Button>
                        {upcomingStatus ? (
                          <Button
                            size="sm"
                            onClick={() =>
                              handleQuickStatus(task, upcomingStatus)
                            }
                            disabled={isPending}
                          >
                            {columnConfig[upcomingStatus].label}
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog
        open={modalMode !== null}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modalMode === "create" ? "Add Task" : "Edit Task"}
            </DialogTitle>
            <DialogDescription>
              Keep operations visible and assigned.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Title</Label>
              <Input
                id="task-title"
                type="text"
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="Follow up with first-time trial lead"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task-assigned">Assigned To</Label>
                <Input
                  id="task-assigned"
                  type="text"
                  value={form.assignedTo}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      assignedTo: event.target.value,
                    }))
                  }
                  placeholder="Front desk"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-due">Due Date</Label>
                <Input
                  id="task-due"
                  type="date"
                  value={form.dueDate}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      dueDate: event.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      priority: value as TaskPriority,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      status: value as TaskStatus,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={form.category ?? "__none__"}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      category:
                        value === "__none__"
                          ? null
                          : (value as NonNullable<TaskCategory>),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    <SelectItem value="follow-up">Follow-up</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="coaching">Coaching</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formError ? (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {formError}
              </div>
            ) : null}

            <DialogFooter className="flex-wrap justify-between gap-3">
              <div>
                {modalMode === "edit" && editingTaskId ? (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => handleDelete(editingTaskId)}
                    disabled={isPending}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                ) : null}
              </div>
              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending
                    ? modalMode === "create"
                      ? "Creating..."
                      : "Saving..."
                    : modalMode === "create"
                      ? "Create Task"
                      : "Save Changes"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
