import { api } from "./api";
import { Task, TaskPriority, TaskStatus } from "@/types";

export type TaskPayload = {
  title?: string;
  description?: string | null;
  dueDate?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  assignedTo?: string | null;
  projectId?: string;
};

export async function listTasks(params?: Record<string, string>) {
  const { data } = await api.get<{ tasks: Task[] }>("/tasks", { params });
  return data.tasks;
}

export async function createTask(payload: TaskPayload & { projectId: string }) {
  const { data } = await api.post<{ task: Task }>("/tasks", payload);
  return data.task;
}

export async function updateTask(id: string, payload: TaskPayload) {
  const { data } = await api.put<{ task: Task }>(`/tasks/${id}`, payload);
  return data.task;
}

export async function deleteTask(id: string) {
  await api.delete(`/tasks/${id}`);
}
