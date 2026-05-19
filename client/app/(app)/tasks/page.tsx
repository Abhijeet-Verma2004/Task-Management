"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Columns3, List, Plus, Search } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { TaskForm, TaskFormValues } from "@/components/task-form";
import { TaskBoard, TaskList } from "@/components/task-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toaster";
import { getApiError } from "@/services/api";
import { listProjects } from "@/services/projects";
import { createTask, deleteTask, listTasks, updateTask } from "@/services/tasks";
import { useAuthStore } from "@/store/auth-store";
import { Project, Task, TaskStatus } from "@/types";
import { isOverdue } from "@/lib/utils";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState<"list" | "board">("list");
  const [filters, setFilters] = useState({ search: "", status: "", priority: "", sortBy: "createdAt", sortOrder: "desc" });
  const toast = useToast();
  const { user } = useAuthStore();

  const adminProjectIds = useMemo(() => projects.filter((p) => p.members.some((m) => m.userId === user?.id && m.role === "ADMIN")).map((p) => p.id), [projects, user]);
  const taskSummary = useMemo(() => ({
    total: tasks.length,
    done: tasks.filter((task) => task.status === "DONE").length,
    overdue: tasks.filter((task) => isOverdue(task.dueDate, task.status)).length
  }), [tasks]);

  async function load() {
    setLoading(true);
    const [projectData, taskData] = await Promise.all([
      listProjects(),
      listTasks(Object.fromEntries(Object.entries(filters).filter(([, value]) => value)))
    ]);
    setProjects(projectData);
    setTasks(taskData);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function applyFilters() {
    setLoading(true);
    setTasks(await listTasks(Object.fromEntries(Object.entries(filters).filter(([, value]) => value))));
    setLoading(false);
  }

  async function submit(values: TaskFormValues) {
    try {
      await createTask({ ...values, dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null, assignedTo: values.assignedTo || null });
      toast.push({ title: "Task created" });
      setShowForm(false);
      await applyFilters();
    } catch (error) {
      toast.push({ title: "Could not save task", description: getApiError(error), variant: "error" });
    }
  }

  async function changeStatus(task: Task, status: TaskStatus) {
    try {
      await updateTask(task.id, { status });
      setTasks((items) => items.map((item) => (item.id === task.id ? { ...item, status } : item)));
    } catch (error) {
      toast.push({ title: "Could not update status", description: getApiError(error), variant: "error" });
    }
  }

  async function remove(task: Task) {
    try {
      await deleteTask(task.id);
      setTasks((items) => items.filter((item) => item.id !== task.id));
      toast.push({ title: "Task deleted" });
    } catch (error) {
      toast.push({ title: "Could not delete task", description: getApiError(error), variant: "error" });
    }
  }

  return (
    <div>
      <PageHeader
        title="Tasks"
        description="Search, filter, sort, and update the work assigned across your projects."
        action={<Button onClick={() => setShowForm((value) => !value)} disabled={!adminProjectIds.length}><Plus className="h-4 w-4" />New task</Button>}
      />
      {showForm ? <Card className="mb-6"><CardHeader><CardTitle>New task</CardTitle></CardHeader><CardContent><TaskForm projects={projects.filter((p) => adminProjectIds.includes(p.id))} onSubmit={submit} /></CardContent></Card> : null}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <TaskMetric label="Visible tasks" value={taskSummary.total} icon={<List className="h-4 w-4" />} />
        <TaskMetric label="Completed" value={taskSummary.done} icon={<CheckCircle2 className="h-4 w-4" />} />
        <TaskMetric label="Overdue" value={taskSummary.overdue} icon={<AlertTriangle className="h-4 w-4" />} />
      </div>
      <Card className="mb-6">
        <CardContent className="grid gap-3 p-4 lg:grid-cols-[1fr_150px_150px_150px_auto_auto]">
          <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search tasks" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} /></div>
          <Select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}><option value="">All statuses</option><option value="TODO">To Do</option><option value="IN_PROGRESS">In Progress</option><option value="DONE">Done</option></Select>
          <Select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}><option value="">All priorities</option><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></Select>
          <Select value={filters.sortBy} onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}><option value="createdAt">Created</option><option value="dueDate">Due date</option><option value="title">Title</option><option value="status">Status</option><option value="priority">Priority</option></Select>
          <Button variant="outline" onClick={applyFilters}>Apply</Button>
          <div className="grid grid-cols-2 rounded-md border bg-background p-1">
            <Button variant={view === "list" ? "default" : "ghost"} size="sm" onClick={() => setView("list")}><List className="h-4 w-4" /></Button>
            <Button variant={view === "board" ? "default" : "ghost"} size="sm" onClick={() => setView("board")}><Columns3 className="h-4 w-4" /></Button>
          </div>
        </CardContent>
      </Card>
      {loading ? <div className="space-y-3"><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /></div> : tasks.length ? (
        view === "list" ? <TaskList tasks={tasks} onStatus={changeStatus} onDelete={remove} canDelete={(task) => adminProjectIds.includes(task.projectId)} /> : <TaskBoard tasks={tasks} onStatus={changeStatus} onDelete={remove} canDelete={(task) => adminProjectIds.includes(task.projectId)} />
      ) : (
        <EmptyState title="No tasks found" description="Create a task or adjust your filters to see matching work." />
      )}
    </div>
  );
}

function TaskMetric({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <Card className="shadow-none">
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="mt-1 text-2xl font-semibold">{value}</div>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-md bg-muted text-muted-foreground">{icon}</div>
      </CardContent>
    </Card>
  );
}
