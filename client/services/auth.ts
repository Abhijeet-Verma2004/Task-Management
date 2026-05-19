import { api } from "./api";
import { User } from "@/types";

export async function signup(payload: { name: string; email: string; password: string; role: "ADMIN" | "MEMBER" }) {
  const { data } = await api.post<{ user: User; token: string }>("/auth/signup", payload);
  return data;
}

export async function login(payload: { email: string; password: string }) {
  const { data } = await api.post<{ user: User; token: string }>("/auth/login", payload);
  return data;
}

export async function me() {
  const { data } = await api.get<{ user: User }>("/auth/me");
  return data.user;
}
