import { TaskPriority, TaskStatus } from "@prisma/client";
import { z } from "zod";

const dateString = z
  .string()
  .datetime()
  .optional()
  .nullable()
  .transform((value) => {
    if (value === undefined) return undefined;
    return value ? new Date(value) : null;
  });

export const taskIdSchema = z.object({
  params: z.object({ id: z.string().min(1) })
});

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(2).max(160),
    description: z.string().max(1200).optional().nullable(),
    dueDate: dateString,
    priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
    status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
    assignedTo: z.string().optional().nullable(),
    projectId: z.string().min(1)
  })
});

export const updateTaskSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    title: z.string().min(2).max(160).optional(),
    description: z.string().max(1200).optional().nullable(),
    dueDate: dateString,
    priority: z.nativeEnum(TaskPriority).optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    assignedTo: z.string().optional().nullable(),
    projectId: z.string().min(1).optional()
  })
});

export const taskQuerySchema = z.object({
  query: z.object({
    projectId: z.string().optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    search: z.string().optional(),
    sortBy: z.enum(["createdAt", "dueDate", "priority", "status", "title"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc")
  })
});
