import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import { AppError, asyncHandler } from "../utils/http";

export const listUsers = asyncHandler(async (_req: Request, res: Response) => {
  const [users, totalUsers] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            projectMemberships: true,
            tasksAssigned: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.user.count()
  ]);

  res.json({ users, totalUsers });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = String(req.params.id);
  if (userId === req.user!.id) throw new AppError(400, "You cannot delete your own admin account");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true }
  });
  if (!user) throw new AppError(404, "User not found");

  await prisma.user.delete({ where: { id: userId } });
  res.status(204).send();
});
