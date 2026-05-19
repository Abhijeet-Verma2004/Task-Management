import { api } from "./api";
import { DashboardStats } from "@/types";

export async function getDashboardStats() {
  const { data } = await api.get<DashboardStats>("/dashboard/stats");
  return data;
}
