"use client";

import { AlertTriangle, CalendarDays, Trash2 } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Select } from "./ui/select";
import { formatDate, initials, isOverdue, statusLabel } from "@/lib/utils";
import { Task, TaskStatus } from "@/types";

export function TaskList({
  tasks,
  onStatus,
  onDelete,
  canDelete
}: {
  tasks: Task[];
  onStatus: (task: Task, status: TaskStatus) => void;
  onDelete?: (task: Task) => void;
  canDelete?: (task: Task) => boolean;
}) {
  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <Card key={task.id} className="transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
          <CardContent className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_170px_120px_150px_auto] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold">{task.title}</h3>
                {isOverdue(task.dueDate, task.status) ? <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700"><AlertTriangle className="h-3 w-3" />Overdue</span> : null}
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{task.description || "No description"}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-muted px-2 py-1">{task.project?.name}</span>
                <span className="flex items-center gap-1">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">{initials(task.assignee?.name)}</span>
                  {task.assignee?.name ?? "Unassigned"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays className="h-4 w-4" />{formatDate(task.dueDate)}</div>
            <Badge>{task.priority}</Badge>
            <Select value={task.status} onChange={(event) => onStatus(task, event.target.value as TaskStatus)}>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </Select>
            {onDelete && canDelete?.(task) ? <Button variant="ghost" size="icon" onClick={() => onDelete(task)}><Trash2 className="h-4 w-4" /></Button> : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function TaskBoard({
  tasks,
  onStatus,
  onDelete,
  canDelete
}: {
  tasks: Task[];
  onStatus: (task: Task, status: TaskStatus) => void;
  onDelete?: (task: Task) => void;
  canDelete?: (task: Task) => boolean;
}) {
  const columns: { status: TaskStatus; title: string }[] = [
    { status: "TODO", title: "To Do" },
    { status: "IN_PROGRESS", title: "In Progress" },
    { status: "DONE", title: "Done" }
  ];

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {columns.map((column) => {
        const columnTasks = tasks.filter((task) => task.status === column.status);
        return (
          <div key={column.status} className="rounded-lg border bg-white/75 p-3 shadow-soft dark:border-slate-800 dark:bg-slate-950/60 dark:shadow-none">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold">{column.title}</div>
              <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">{columnTasks.length}</span>
            </div>
            <div className="space-y-3">
              {columnTasks.length ? columnTasks.map((task) => (
                <Card key={task.id} className="shadow-none transition hover:-translate-y-0.5 hover:shadow-soft">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate font-semibold">{task.title}</div>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{task.description || "No description"}</p>
                      </div>
                      {onDelete && canDelete?.(task) ? <Button variant="ghost" size="icon" onClick={() => onDelete(task)}><Trash2 className="h-4 w-4" /></Button> : null}
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <Badge>{task.priority}</Badge>
                      {isOverdue(task.dueDate, task.status) ? <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">Overdue</span> : null}
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                      <span>{formatDate(task.dueDate)}</span>
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-primary font-semibold text-primary-foreground">{initials(task.assignee?.name)}</span>
                    </div>
                    <Select className="mt-3" value={task.status} onChange={(event) => onStatus(task, event.target.value as TaskStatus)}>
                      <option value="TODO">{statusLabel("TODO")}</option>
                      <option value="IN_PROGRESS">{statusLabel("IN_PROGRESS")}</option>
                      <option value="DONE">{statusLabel("DONE")}</option>
                    </Select>
                  </CardContent>
                </Card>
              )) : (
                <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">No tasks in this stage.</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
