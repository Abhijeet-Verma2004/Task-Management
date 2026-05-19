import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  TODO: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  IN_PROGRESS: "bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-200",
  DONE: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-200",
  LOW: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  MEDIUM: "bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-200",
  HIGH: "bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-200",
  ADMIN: "bg-neutral-900 text-white dark:bg-white dark:text-slate-950",
  MEMBER: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
};

export function Badge({ children, className }: { children: string; className?: string }) {
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", styles[children] ?? "bg-slate-100", className)}>{children.replace("_", " ")}</span>;
}
