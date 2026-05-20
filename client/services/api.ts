import axios from "axios";

const API_ROOT = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
const normalizedApiRoot = API_ROOT.replace(/\/+$/, "").replace(/\/api$/, "");

export const api = axios.create({
  baseURL: `${normalizedApiRoot}/api`
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("ttm-token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getApiError(error: unknown) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? "Something went wrong";
  }
  return "Something went wrong";
}
