import { Role, Task } from "@prisma/client";
import { prisma } from "../prisma/client";
import { AppError } from "../utils/http";

export async function getMembership(projectId: string, userId: string) {
  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } }
  });
  if (!membership) throw new AppError(403, "You do not have access to this project");
  return membership;
}

export async function requireProjectAdmin(projectId: string, userId: string) {
  const membership = await getMembership(projectId, userId);
  if (membership.role !== Role.ADMIN) throw new AppError(403, "Admin access required");
  return membership;
}

export function canUpdateTask(userId: string, role: Role, task: Pick<Task, "assignedTo">, keys: string[]) {
  if (role === Role.ADMIN) return true;
  const onlyStatus = keys.length === 1 && keys[0] === "status";
  if (!onlyStatus || task.assignedTo !== userId) {
    throw new AppError(403, "Members can update only their assigned task status");
  }
  return true;
}
