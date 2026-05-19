import bcrypt from "bcryptjs";
import { PrismaClient, Role, TaskPriority, TaskStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("Password123!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@taskmanager.dev" },
    update: { name: "Jon Snow", role: Role.ADMIN },
    create: { name: "Jon Snow", email: "admin@taskmanager.dev", password, role: Role.ADMIN }
  });

  const member = await prisma.user.upsert({
    where: { email: "member@taskmanager.dev" },
    update: { name: "Peter Dinklage", role: Role.MEMBER },
    create: { name: "Peter Dinklage", email: "member@taskmanager.dev", password, role: Role.MEMBER }
  });

  const project = await prisma.project.upsert({
    where: { id: "seed-project" },
    update: {},
    create: {
      id: "seed-project",
      name: "Product Launch",
      description: "Coordinate launch tasks across design, engineering, and marketing.",
      createdBy: admin.id,
      members: {
        create: [
          { userId: admin.id, role: Role.ADMIN },
          { userId: member.id, role: Role.MEMBER }
        ]
      }
    }
  });

  await prisma.task.upsert({
    where: { id: "seed-task-copy" },
    update: {},
    create: {
      id: "seed-task-copy",
      title: "Finalize onboarding copy",
      description: "Review and polish the signup flow content.",
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
      priority: TaskPriority.HIGH,
      status: TaskStatus.IN_PROGRESS,
      assignedTo: member.id,
      projectId: project.id,
      createdBy: admin.id
    }
  });

  await prisma.task.upsert({
    where: { id: "seed-task-dashboard" },
    update: {},
    create: {
      id: "seed-task-dashboard",
      title: "QA dashboard charts",
      description: "Validate task status and user distribution charts.",
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6),
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.TODO,
      assignedTo: admin.id,
      projectId: project.id,
      createdBy: admin.id
    }
  });
}

main()
  .finally(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
