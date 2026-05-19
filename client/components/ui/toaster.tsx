"use client";

import { create } from "zustand";
import { cn } from "@/lib/utils";

type Toast = { id: string; title: string; description?: string; variant?: "default" | "error" };
type ToastState = { toasts: Toast[]; push: (toast: Omit<Toast, "id">) => void; remove: (id: string) => void };

export const useToast = create<ToastState>((set, get) => ({
  toasts: [],
  push: (toast) => {
    const id = crypto.randomUUID();
    set({ toasts: [...get().toasts, { ...toast, id }] });
    setTimeout(() => get().remove(id), 3500);
  },
  remove: (id) => set({ toasts: get().toasts.filter((toast) => toast.id !== id) })
}));

export function Toaster() {
  const { toasts, remove } = useToast();
  return (
    <div className="fixed right-4 top-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          onClick={() => remove(toast.id)}
          className={cn(
            "rounded-lg border bg-white p-4 text-left text-sm shadow-soft transition hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100",
            toast.variant === "error" && "border-red-200 dark:border-red-900"
          )}
        >
          <div className="font-semibold">{toast.title}</div>
          {toast.description ? <div className="mt-1 text-muted-foreground">{toast.description}</div> : null}
        </button>
      ))}
    </div>
  );
}
