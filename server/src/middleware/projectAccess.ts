import { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";
import { prisma } from "../prisma/client";
import { AppError } from "../utils/http";

export async function requireProjectMember(req: Request, _res: Response, next: NextFunction) {
  const projectId = req.params.id || req.params.projectId || req.body.projectId || req.query.projectId;
  if (!projectId || typeof projectId !== "string") return next(new AppError(400, "Project id is required"));

  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: req.user!.id } },
    select: { role: true, projectId: true }
  });

  if (!membership) return next(new AppError(403, "You do not have access to this project"));
  req.membership = membership;
  return next();
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (req.membership?.role !== Role.ADMIN) return next(new AppError(403, "Admin access required"));
  return next();
}
