import { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";
import { prisma } from "../prisma/client";
import { AppError } from "../utils/http";
import { verifyToken } from "../utils/token";

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) return next(new AppError(401, "Authentication required"));

  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true, role: true }
    });
    if (!user) return next(new AppError(401, "Invalid session"));
    req.user = user;
    return next();
  } catch {
    return next(new AppError(401, "Invalid or expired token"));
  }
}

export function requireAccountAdmin(req: Request, _res: Response, next: NextFunction) {
  if (req.user?.role !== Role.ADMIN) return next(new AppError(403, "Admin access required"));
  return next();
}
