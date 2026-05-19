export type Role = "ADMIN" | "MEMBER";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
};

export type ManagedUser = User & {
  _count: {
    projectMemberships: number;
    tasksAssigned: number;
  };
};

export type ProjectMember = {
  id: string;
  projectId: string;
  userId: string;
  role: Role;
  user: User;
};

export type Project = {
  id: string;
  name: string;
  description?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  members: ProjectMember[];
  _count?: { tasks: number };
  tasks?: Task[];
};

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo?: string | null;
  projectId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  assignee?: User | null;
  project?: Pick<Project, "id" | "name">;
};

export type DashboardStats = {
  totalTasks: number;
  tasksByStatus: { status: TaskStatus; count: number }[];
  tasksPerUser: { userId: string | null; name: string; count: number }[];
  overdueTasks: number;
  recentTasks: Task[];
};
