"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Clock, ListChecks, Plus, Trash2, UserPlus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { EmptyState } from "@/components/empty-state";
import { Field } from "@/components/field";
import { PageHeader } from "@/components/page-header";
import { ProjectForm, ProjectFormValues } from "@/components/project-form";
import { TaskForm, TaskFormValues } from "@/components/task-form";
import { TaskList } from "@/components/task-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toaster";
import { getApiError } from "@/services/api";
import { addMember, deleteProject, getProject, removeMember, updateProject } from "@/services/projects";
import { createTask, deleteTask, updateTask } from "@/services/tasks";
import { useAuthStore } from "@/store/auth-store";
import { Project, Task, TaskStatus } from "@/types";
import { isOverdue } from "@/lib/utils";

const memberSchema = z.object({ email: z.string().email(), role: z.enum(["ADMIN", "MEMBER"]) });

export default function ProjectDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuthStore();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTask, setShowTask] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const memberForm = useForm<z.infer<typeof memberSchema>>({ resolver: zodResolver(memberSchema), defaultValues: { email: "", role: "MEMBER" } });

  const isAdmin = useMemo(() => project?.members.some((member) => member.userId === user?.id && member.role === "ADMIN") ?? false, [project, user]);
  const taskStats = useMemo(() => {
    const tasks = project?.tasks ?? [];
    const done = tasks.filter((task) => task.status === "DONE").length;
    return {
      total: tasks.length,
      done,
      active: tasks.filter((task) => task.status === "IN_PROGRESS").length,
      overdue: tasks.filter((task) => isOverdue(task.dueDate, task.status)).length,
      progress: tasks.length ? Math.round((done / tasks.length) * 100) : 0
    };
  }, [project]);

  async function load() {
    setLoading(true);
    setProject(await getProject(params.id));
    setLoading(false);
  }

  useEffect(() => { load(); }, [params.id]);

  async function saveProject(values: ProjectFormValues) {
    try {
      setProject(await updateProject(params.id, values));
      setShowEdit(false);
      toast.push({ title: "Project updated" });
    } catch (error) {
      toast.push({ title: "Could not update project", description: getApiError(error), variant: "error" });
    }
  }

  async function submitMember(values: z.infer<typeof memberSchema>) {
    try {
      await addMember(params.id, values);
      memberForm.reset({ email: "", role: "MEMBER" });
      toast.push({ title: "Member added" });
      await load();
    } catch (error) {
      toast.push({ title: "Could not add member", description: getApiError(error), variant: "error" });
    }
  }

  async function submitTask(values: TaskFormValues) {
    try {
      await createTask({ ...values, projectId: params.id, dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null, assignedTo: values.assignedTo || null });
      setShowTask(false);
      toast.push({ title: "Task created" });
      await load();
    } catch (error) {
      toast.push({ title: "Could not save task", description: getApiError(error), variant: "error" });
    }
  }

  async function changeStatus(task: Task, status: TaskStatus) {
    try {
      await updateTask(task.id, { status });
      setProject((current) => current ? { ...current, tasks: current.tasks?.map((item) => item.id === task.id ? { ...item, status } : item) } : current);
    } catch (error) {
      toast.push({ title: "Could not update status", description: getApiError(error), variant: "error" });
    }
  }

  async function removeTask(task: Task) {
    try {
      await deleteTask(task.id);
      setProject((current) => current ? { ...current, tasks: current.tasks?.filter((item) => item.id !== task.id) } : current);
      toast.push({ title: "Task deleted" });
    } catch (error) {
      toast.push({ title: "Could not delete task", description: getApiError(error), variant: "error" });
    }
  }

  async function removeUser(userId: string) {
    try {
      await removeMember(params.id, userId);
      await load();
      toast.push({ title: "Member removed" });
    } catch (error) {
      toast.push({ title: "Could not remove member", description: getApiError(error), variant: "error" });
    }
  }

  async function destroyProject() {
    try {
      await deleteProject(params.id);
      toast.push({ title: "Project deleted" });
      router.push("/projects");
    } catch (error) {
      toast.push({ title: "Could not delete project", description: getApiError(error), variant: "error" });
    }
  }

  if (loading || !project) return <div className="space-y-4"><Skeleton className="h-24" /><Skeleton className="h-60" /><Skeleton className="h-72" /></div>;

  return (
    <div>
      <PageHeader
        title={project.name}
        description={project.description || "No description provided."}
        action={isAdmin ? <div className="flex gap-2"><Button variant="outline" onClick={() => setShowEdit((v) => !v)}>Edit</Button><Button onClick={() => setShowTask((v) => !v)}><Plus className="h-4 w-4" />Task</Button></div> : null}
      />

      {showEdit ? <Card className="mb-6"><CardHeader><CardTitle>Edit project</CardTitle></CardHeader><CardContent><ProjectForm initial={{ name: project.name, description: project.description ?? "" }} onSubmit={saveProject} /></CardContent></Card> : null}
      {showTask ? <Card className="mb-6"><CardHeader><CardTitle>New task</CardTitle></CardHeader><CardContent><TaskForm projects={[project]} projectId={project.id} onSubmit={submitTask} /></CardContent></Card> : null}

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ProjectMetric label="Total tasks" value={taskStats.total} icon={<ListChecks className="h-4 w-4" />} />
        <ProjectMetric label="In progress" value={taskStats.active} icon={<Clock className="h-4 w-4" />} />
        <ProjectMetric label="Done" value={taskStats.done} icon={<CheckCircle2 className="h-4 w-4" />} />
        <ProjectMetric label="Overdue" value={taskStats.overdue} icon={<AlertTriangle className="h-4 w-4" />} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div>
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Project tasks</CardTitle>
                <div className="w-full sm:w-56">
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground"><span>Progress</span><span>{taskStats.progress}%</span></div>
                  <div className="h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${taskStats.progress}%` }} /></div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {project.tasks?.length ? <TaskList tasks={project.tasks} onStatus={changeStatus} onDelete={removeTask} canDelete={() => isAdmin} /> : <EmptyState title="No tasks yet" description="Create a task to start tracking project work." />}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Members</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {project.members.map((member) => (
                <div key={member.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
                  <div className="min-w-0"><div className="truncate text-sm font-medium">{member.user.name}</div><div className="truncate text-xs text-muted-foreground">{member.user.email}</div></div>
                  <div className="flex items-center gap-2"><Badge>{member.role}</Badge>{isAdmin && member.userId !== user?.id ? <Button variant="ghost" size="icon" onClick={() => removeUser(member.userId)}><Trash2 className="h-4 w-4" /></Button> : null}</div>
                </div>
              ))}
            </CardContent>
          </Card>
          {isAdmin ? (
            <Card>
              <CardHeader><CardTitle>Add member</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={memberForm.handleSubmit(submitMember)} className="space-y-3">
                  <Field label="Email" error={memberForm.formState.errors.email?.message}><Input type="email" {...memberForm.register("email")} /></Field>
                  <Field label="Role" error={memberForm.formState.errors.role?.message}><Select {...memberForm.register("role")}><option value="MEMBER">Member</option><option value="ADMIN">Admin</option></Select></Field>
                  <Button className="w-full" disabled={memberForm.formState.isSubmitting}><UserPlus className="h-4 w-4" />Add member</Button>
                </form>
              </CardContent>
            </Card>
          ) : null}
          {isAdmin ? <Button variant="destructive" className="w-full" onClick={destroyProject}>Delete project</Button> : null}
        </div>
      </div>
    </div>
  );
}

function ProjectMetric({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
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
