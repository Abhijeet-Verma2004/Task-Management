import { Role, TaskPriority } from "@prisma/client";
import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import { canUpdateTask, getMembership, requireProjectAdmin } from "../services/access.service";
import { AppError, asyncHandler } from "../utils/http";

const includeTask = {
  project: { select: { id: true, name: true } },
  assignee: { select: { id: true, name: true, email: true } },
  creator: { select: { id: true, name: true, email: true } }
};

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  await requireProjectAdmin(req.body.projectId, req.user!.id);
  if (req.body.assignedTo) {
    await getMembership(req.body.projectId, req.body.assignedTo);
  }

  const task = await prisma.task.create({
    data: { ...req.body, createdBy: req.user!.id },
    include: includeTask
  });
  res.status(201).json({ task });
});

export const listTasks = asyncHandler(async (req: Request, res: Response) => {
  const memberships = await prisma.projectMember.findMany({ where: { userId: req.user!.id } });
  const adminProjectIds = memberships.filter((m) => m.role === Role.ADMIN).map((m) => m.projectId);
  const memberProjectIds = memberships.filter((m) => m.role === Role.MEMBER).map((m) => m.projectId);

  const where = {
    AND: [
      req.query.projectId ? { projectId: req.query.projectId as string } : {},
      req.query.status ? { status: req.query.status as never } : {},
      req.query.priority ? { priority: req.query.priority as never } : {},
      req.query.search
        ? {
            OR: [
              { title: { contains: req.query.search as string, mode: "insensitive" as const } },
              { description: { contains: req.query.search as string, mode: "insensitive" as const } }
            ]
          }
        : {},
      {
        OR: [
          { projectId: { in: adminProjectIds } },
          { projectId: { in: memberProjectIds }, assignedTo: req.user!.id }
        ]
      }
    ]
  };

  const orderBy =
    req.query.sortBy === "priority"
      ? { priority: req.query.sortOrder as "asc" | "desc" }
      : { [req.query.sortBy as string]: req.query.sortOrder as "asc" | "desc" };

  const tasks = await prisma.task.findMany({ where, include: includeTask, orderBy });
  res.json({ tasks });
});

export const getTask = asyncHandler(async (req: Request, res: Response) => {
  const taskId = String(req.params.id);
  const task = await prisma.task.findUnique({ where: { id: taskId }, include: includeTask });
  if (!task) throw new AppError(404, "Task not found");
  const membership = await getMembership(task.projectId, req.user!.id);
  if (membership.role === Role.MEMBER && task.assignedTo !== req.user!.id) {
    throw new AppError(403, "You can only view assigned tasks");
  }
  res.json({ task });
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const taskId = String(req.params.id);
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new AppError(404, "Task not found");
  const membership = await getMembership(task.projectId, req.user!.id);
  const keys = Object.keys(req.body).filter((key) => req.body[key] !== undefined);
  canUpdateTask(req.user!.id, membership.role, task, keys);

  const projectId = req.body.projectId ?? task.projectId;
  if (membership.role === Role.ADMIN && req.body.assignedTo) {
    await getMembership(projectId, req.body.assignedTo);
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: req.body,
    include: includeTask
  });
  res.json({ task: updated });
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const taskId = String(req.params.id);
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new AppError(404, "Task not found");
  await requireProjectAdmin(task.projectId, req.user!.id);
  await prisma.task.delete({ where: { id: taskId } });
  res.status(204).send();
});

export function priorityWeight(priority: TaskPriority) {
  return priority === TaskPriority.HIGH ? 3 : priority === TaskPriority.MEDIUM ? 2 : 1;
}
