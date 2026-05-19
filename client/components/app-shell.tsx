"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, FolderKanban, LayoutDashboard, ListTodo, LogOut, Menu, Plus, Users, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { RolePermissions } from "./role-permissions";
import { ThemeToggle } from "./theme-toggle";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/users", label: "Users", icon: Users, adminOnly: true }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuthStore();

  function signOut() {
    logout();
    router.replace("/login");
  }

  const sidebar = (
    <aside className="flex h-full w-72 flex-col border-r border-slate-200 bg-white text-slate-950 shadow-2xl dark:border-slate-800 dark:bg-slate-950 dark:text-white">
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5 dark:border-white/10">
        <div className="grid h-9 w-9 place-items-center rounded-md bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <div className="font-semibold">Task Manager</div>
          <div className="text-xs text-muted-foreground">Team workspace</div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {nav.map((item) => {
          if (item.adminOnly && user?.role !== "ADMIN") return null;
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground dark:hover:bg-white/10 dark:hover:text-white",
                active && "bg-slate-950 text-white shadow-sm hover:bg-slate-950 hover:text-white dark:bg-white dark:text-slate-950 dark:hover:bg-white dark:hover:text-slate-950"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
        {user?.role === "ADMIN" ? (
          <Link href="/projects" onClick={() => setOpen(false)} className="mt-4 flex items-center justify-center gap-2 rounded-md border border-dashed border-border px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground dark:border-white/20 dark:hover:border-white/40 dark:hover:bg-white/10 dark:hover:text-white">
            <Plus className="h-4 w-4" />
            New project
          </Link>
        ) : null}
      </nav>
      <div className="border-t border-border p-4 dark:border-white/10">
        <div className="mb-3 min-w-0">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="truncate text-sm font-semibold">{user?.name}</div>
            {user?.role ? <Badge>{user.role}</Badge> : null}
          </div>
          <div className="truncate text-xs text-muted-foreground">{user?.email}</div>
        </div>
        {user?.role ? <div className="mb-3"><RolePermissions selectedRole={user.role} compact /></div> : null}
        <Button variant="outline" className="w-full justify-start" onClick={signOut}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );

  return (
    <div className="app-background min-h-screen">
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex">{sidebar}</div>
      {open ? <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setOpen(false)} /> : null}
      <div className={cn("fixed inset-y-0 left-0 z-50 transition-transform lg:hidden", open ? "translate-x-0" : "-translate-x-full")}>{sidebar}</div>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/70 bg-white/80 px-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/80 md:px-8">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div>
            <div className="text-sm font-semibold">Workspace</div>
            <div className="hidden text-xs text-muted-foreground sm:block">Plan, assign, and track work cleanly.</div>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <div className="rounded-full border bg-background px-3 py-1.5 text-xs text-muted-foreground">Signed in as {user?.role?.toLowerCase()}</div>
            <ThemeToggle compact />
          </div>
          <div className="md:hidden"><ThemeToggle compact /></div>
        </header>
        <main className="mx-auto w-full max-w-7xl p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
