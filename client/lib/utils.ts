import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date?: string | null) {
  if (!date) return "No date";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(date));
}

export function isOverdue(date?: string | null, status?: string) {
  return Boolean(date && status !== "DONE" && new Date(date) < new Date());
}

export function statusLabel(status: string) {
  return status.replace("_", " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

export function initials(name?: string | null) {
  if (!name) return "UN";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
