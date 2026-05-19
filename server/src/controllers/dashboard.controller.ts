import { Role, TaskStatus } from "@prisma/client";
import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import { asyncHandler } from "../utils/http";

export const dashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const memberships = await prisma.projectMember.findMany({ where: { userId: req.user!.id } });
  const adminProjectIds = memberships.filter((m) => m.role === Role.ADMIN).map((m) => m.projectId);
  const memberProjectIds = memberships.filter((m) => m.role === Role.MEMBER).map((m) => m.projectId);

  const visibility = {
    OR: [
      { projectId: { in: adminProjectIds } },
      { projectId: { in: memberProjectIds }, assignedTo: req.user!.id }
    ]
  };

  const [tasks, byStatusRaw, byUserRaw, overdueTasks, recentTasks] = await Promise.all([
    prisma.task.count({ where: visibility }),
    prisma.task.groupBy({ by: ["status"], where: visibility, _count: { _all: true } }),
    prisma.task.groupBy({ by: ["assignedTo"], where: visibility, _count: { _all: true } }),
    prisma.task.count({
      where: { ...visibility, dueDate: { lt: new Date() }, status: { not: TaskStatus.DONE } }
    }),
    prisma.task.findMany({
      where: visibility,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } }
      },
      orderBy: { updatedAt: "desc" },
      take: 6
    })
  ]);

  const assigneeIds = byUserRaw.map((item) => item.assignedTo).filter(Boolean) as string[];
  const users = await prisma.user.findMany({
    where: { id: { in: assigneeIds } },
    select: { id: true, name: true }
  });
  const userMap = new Map(users.map((user) => [user.id, user.name]));

  res.json({
    totalTasks: tasks,
    tasksByStatus: Object.values(TaskStatus).map((status) => ({
      status,
      count: byStatusRaw.find((item) => item.status === status)?._count._all ?? 0
    })),
    tasksPerUser: byUserRaw.map((item) => ({
      userId: item.assignedTo,
      name: item.assignedTo ? userMap.get(item.assignedTo) ?? "Unknown" : "Unassigned",
      count: item._count._all
    })),
    overdueTasks,
    recentTasks
  });
});
