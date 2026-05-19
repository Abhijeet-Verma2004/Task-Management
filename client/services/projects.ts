import { api } from "./api";
import { Project, Role } from "@/types";

export async function listProjects() {
  const { data } = await api.get<{ projects: Project[] }>("/projects");
  return data.projects;
}

export async function getProject(id: string) {
  const { data } = await api.get<{ project: Project }>(`/projects/${id}`);
  return data.project;
}

export async function createProject(payload: { name: string; description?: string }) {
  const { data } = await api.post<{ project: Project }>("/projects", payload);
  return data.project;
}

export async function updateProject(id: string, payload: { name?: string; description?: string }) {
  const { data } = await api.put<{ project: Project }>(`/projects/${id}`, payload);
  return data.project;
}

export async function deleteProject(id: string) {
  await api.delete(`/projects/${id}`);
}

export async function addMember(projectId: string, payload: { email: string; role: Role }) {
  const { data } = await api.post(`/projects/${projectId}/members`, payload);
  return data.member;
}

export async function removeMember(projectId: string, userId: string) {
  await api.delete(`/projects/${projectId}/members/${userId}`);
}
