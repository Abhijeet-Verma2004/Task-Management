import Link from "next/link";
import { ArrowRight, CheckCircle2, FolderKanban, ListTodo, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LandingPage() {
  return (
    <main className="premium-gradient min-h-screen">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-3 text-lg font-semibold text-foreground">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-primary text-sm text-primary-foreground shadow-sm">TM</span>
          Team Task Manager
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle compact />
          <Button variant="ghost" asChild><Link href="/login">Login</Link></Button>
          <Button asChild><Link href="/signup">Sign up</Link></Button>
        </div>
      </nav>
      <section className="mx-auto grid max-w-7xl gap-10 px-6 pb-16 pt-12 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:pt-20">
        <div>
          <div className="mb-5 inline-flex rounded-full border bg-white/80 px-3 py-1 text-sm font-medium text-slate-600 shadow-sm dark:bg-slate-950/70 dark:text-slate-300">Built for focused project teams</div>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-normal text-foreground md:text-6xl">Team Task Manager</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            A focused workspace for projects, assigned tasks, status tracking, and clean team visibility.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="default" asChild><Link href="/signup">Start managing tasks <ArrowRight className="h-4 w-4" /></Link></Button>
            <Button variant="outline" asChild><Link href="/login">Open workspace</Link></Button>
          </div>
          <div className="mt-10 grid gap-3 text-sm text-foreground sm:grid-cols-3">
            {["Projects and members", "Assigned task views", "Dashboard analytics"].map((item) => (
              <div key={item} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-teal-600" />{item}</div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-white/80 bg-white/90 p-4 shadow-2xl backdrop-blur dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
          <div className="mb-4 flex items-center justify-between border-b pb-4">
            <div><div className="font-semibold">Product Launch</div><div className="text-sm text-muted-foreground">12 tasks across 4 teammates</div></div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">On track</span>
          </div>
          <div className="mb-4 grid grid-cols-3 gap-3">
            {[
              { label: "Projects", value: "4", icon: FolderKanban },
              { label: "Tasks", value: "28", icon: ListTodo },
              { label: "Members", value: "8", icon: Users }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-md bg-muted p-3">
                  <Icon className="mb-2 h-4 w-4 text-muted-foreground" />
                  <div className="font-semibold">{item.value}</div>
                  <div className="text-xs text-muted-foreground">{item.label}</div>
                </div>
              );
            })}
          </div>
          <div className="space-y-3">
            {["Finalize onboarding copy", "QA dashboard charts", "Review billing checklist", "Publish release notes"].map((task, index) => (
              <div key={task} className="rounded-md border bg-muted p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="font-medium">{task}</div>
                  <div className="text-xs text-muted-foreground">{index < 2 ? "In Progress" : "To Do"}</div>
                </div>
                <div className="mt-3 h-2 rounded-full bg-background">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${35 + index * 15}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
