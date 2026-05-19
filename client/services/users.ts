import { api } from "./api";
import { ManagedUser } from "@/types";

export async function listUsers() {
  const { data } = await api.get<{ users: ManagedUser[]; totalUsers: number }>("/users");
  return data;
}

export async function deleteUser(id: string) {
  await api.delete(`/users/${id}`);
}
