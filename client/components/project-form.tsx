"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Field } from "./field";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

const schema = z.object({
  name: z.string().min(2, "Project name is required"),
  description: z.string().optional()
});

export type ProjectFormValues = z.infer<typeof schema>;

export function ProjectForm({ onSubmit, initial }: { onSubmit: (values: ProjectFormValues) => Promise<void>; initial?: ProjectFormValues }) {
  const form = useForm<ProjectFormValues>({ resolver: zodResolver(schema), defaultValues: initial ?? { name: "", description: "" } });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Project name" error={form.formState.errors.name?.message}><Input {...form.register("name")} /></Field>
      <Field label="Description" error={form.formState.errors.description?.message}><Textarea {...form.register("description")} /></Field>
      <Button disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Saving..." : "Save project"}</Button>
    </form>
  );
}
