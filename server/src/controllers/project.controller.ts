import { Role } from "@prisma/client";
import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import { requireProjectAdmin } from "../services/access.service";
import { AppError, asyncHandler } from "../utils/http";

const includeProject = {
  creator: { select: { id: true, name: true, email: true } },
  members: { include: { user: { select: { id: true, name: true, email: true } } } },
  _count: { select: { tasks: true } }
};

export const createProject = asyncHandler(async (req: Request, res: Response) => {
  if (req.user!.role !== Role.ADMIN) throw new AppError(403, "Only admins can create projects");

  const project = await prisma.project.create({
    data: {
      name: req.body.name,
      description: req.body.description,
      createdBy: req.user!.id,
      members: { create: { userId: req.user!.id, role: Role.ADMIN } }
    },
    include: includeProject
  });
  res.status(201).json({ project });
});

export const listProjects = asyncHandler(async (req: Request, res: Response) => {
  const projects = await prisma.project.findMany({
    where: { members: { some: { userId: req.user!.id } } },
    include: includeProject,
    orderBy: { updatedAt: "desc" }
  });
  res.json({ projects });
});

export const getProject = asyncHandler(async (req: Request, res: Response) => {
  const projectId = String(req.params.id);
  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: req.user!.id } }
  });
  if (!membership) throw new AppError(404, "Project not found");

  const project = await prisma.project.findFirst({
    where: { id: projectId },
    include: {
      ...includeProject,
      tasks: {
        where: membership.role === Role.ADMIN ? undefined : { assignedTo: req.user!.id },
        include: {
          assignee: { select: { id: true, name: true, email: true } },
          project: { select: { id: true, name: true } }
        },
        orderBy: { updatedAt: "desc" }
      }
    }
  });
  if (!project) throw new AppError(404, "Project not found");
  res.json({ project });
});

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const projectId = String(req.params.id);
  await requireProjectAdmin(projectId, req.user!.id);
  const project = await prisma.project.update({
    where: { id: projectId },
    data: { name: req.body.name, description: req.body.description },
    include: includeProject
  });
  res.json({ project });
});

export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  const projectId = String(req.params.id);
  await requireProjectAdmin(projectId, req.user!.id);
  await prisma.project.delete({ where: { id: projectId } });
  res.status(204).send();
});

export const addMember = asyncHandler(async (req: Request, res: Response) => {
  const projectId = String(req.params.id);
  await requireProjectAdmin(projectId, req.user!.id);
  const user = await prisma.user.findUnique({ where: { email: req.body.email } });
  if (!user) throw new AppError(404, "User not found");

  const member = await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId, userId: user.id } },
    update: { role: req.body.role },
    create: { projectId, userId: user.id, role: req.body.role },
    include: { user: { select: { id: true, name: true, email: true } } }
  });
  res.status(201).json({ member });
});

export const removeMember = asyncHandler(async (req: Request, res: Response) => {
  const projectId = String(req.params.id);
  const userId = String(req.params.userId);
  await requireProjectAdmin(projectId, req.user!.id);
  if (userId === req.user!.id) throw new AppError(400, "Admins cannot remove themselves");

  await prisma.projectMember.delete({
    where: { projectId_userId: { projectId, userId } }
  });
  await prisma.task.updateMany({
    where: { projectId, assignedTo: userId },
    data: { assignedTo: null }
  });
  res.status(204).send();
});
