import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import { AppError, asyncHandler } from "../utils/http";
import { signToken } from "../utils/token";

const publicUser = { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true };

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const existing = await prisma.user.findUnique({ where: { email: req.body.email } });
  if (existing) throw new AppError(409, "Email is already registered");

  const password = await bcrypt.hash(req.body.password, 12);
  const user = await prisma.user.create({
    data: { name: req.body.name, email: req.body.email, password, role: req.body.role },
    select: publicUser
  });

  res.status(201).json({ user, token: signToken({ userId: user.id }) });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { email: req.body.email } });
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    throw new AppError(401, "Invalid email or password");
  }

  res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt, updatedAt: user.updatedAt },
    token: signToken({ userId: user.id })
  });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  res.json({ user: req.user });
});
