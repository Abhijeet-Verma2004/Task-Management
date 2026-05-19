"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Field } from "./field";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Project, Task } from "@/types";

const schema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
  assignedTo: z.string().optional(),
  projectId: z.string().min(1, "Choose a project")
});

export type TaskFormValues = z.infer<typeof schema>;

export function TaskForm({
  projects,
  projectId,
  task,
  onSubmit
}: {
  projects: Project[];
  projectId?: string;
  task?: Task;
  onSubmit: (values: TaskFormValues) => Promise<void>;
}) {
  const selectedProject = projects.find((project) => project.id === (projectId ?? task?.projectId)) ?? projects[0];
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: task?.title ?? "",
      description: task?.description ?? "",
      dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : "",
      priority: task?.priority ?? "MEDIUM",
      status: task?.status ?? "TODO",
      assignedTo: task?.assignedTo ?? "",
      projectId: projectId ?? task?.projectId ?? selectedProject?.id ?? ""
    }
  });
  const currentProject = projects.find((project) => project.id === form.watch("projectId")) ?? selectedProject;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2"><Field label="Title" error={form.formState.errors.title?.message}><Input {...form.register("title")} /></Field></div>
      <div className="md:col-span-2"><Field label="Description" error={form.formState.errors.description?.message}><Textarea {...form.register("description")} /></Field></div>
      <Field label="Project" error={form.formState.errors.projectId?.message}>
        <Select disabled={Boolean(projectId)} {...form.register("projectId")}>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</Select>
      </Field>
      <Field label="Assigned user" error={form.formState.errors.assignedTo?.message}>
        <Select {...form.register("assignedTo")}><option value="">Unassigned</option>{currentProject?.members.map((member) => <option key={member.userId} value={member.userId}>{member.user.name}</option>)}</Select>
      </Field>
      <Field label="Due date" error={form.formState.errors.dueDate?.message}><Input type="date" {...form.register("dueDate")} /></Field>
      <Field label="Priority" error={form.formState.errors.priority?.message}><Select {...form.register("priority")}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></Select></Field>
      <Field label="Status" error={form.formState.errors.status?.message}><Select {...form.register("status")}><option value="TODO">To Do</option><option value="IN_PROGRESS">In Progress</option><option value="DONE">Done</option></Select></Field>
      <div className="flex items-end"><Button disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Saving..." : "Save task"}</Button></div>
    </form>
  );
}
