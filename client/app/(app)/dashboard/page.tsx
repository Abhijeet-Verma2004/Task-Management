"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from "recharts";
import { AlertTriangle, CheckCircle2, Clock, ListChecks } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboardStats } from "@/services/dashboard";
import { DashboardStats } from "@/types";
import { formatDate } from "@/lib/utils";

const colors = ["#0f172a", "#2563eb", "#10b981"];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats().then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="space-y-5"><Skeleton className="h-20 w-full" /><Skeleton className="h-72 w-full" /><Skeleton className="h-56 w-full" /></div>;
  }

  const done = stats?.tasksByStatus.find((item) => item.status === "DONE")?.count ?? 0;
  const progress = stats?.totalTasks ? Math.round((done / stats.totalTasks) * 100) : 0;

  return (
    <div>
      <PageHeader title="Dashboard" description="A concise view of task volume, progress, assignment load, and recent activity." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric title="Total tasks" value={stats?.totalTasks ?? 0} icon={<ListChecks className="h-5 w-5" />} />
        <Metric title="Completed" value={done} icon={<CheckCircle2 className="h-5 w-5" />} />
        <Metric title="Overdue" value={stats?.overdueTasks ?? 0} icon={<AlertTriangle className="h-5 w-5" />} />
        <Card><CardContent className="p-5"><div className="flex items-center justify-between text-sm text-muted-foreground"><span>Progress</span><Clock className="h-5 w-5" /></div><div className="mt-3 text-3xl font-semibold">{progress}%</div><div className="mt-4 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${progress}%` }} /></div></CardContent></Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Tasks by status</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats?.tasksByStatus ?? []} dataKey="count" nameKey="status" innerRadius={64} outerRadius={92} paddingAngle={3}>
                  {(stats?.tasksByStatus ?? []).map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Tasks per user</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.tasksPerUser ?? []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#0f172a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Recent tasks</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {stats?.recentTasks.length ? stats.recentTasks.map((task) => (
            <div key={task.id} className="flex flex-col gap-3 rounded-md border p-4 md:flex-row md:items-center md:justify-between">
              <div><div className="font-medium">{task.title}</div><div className="text-sm text-muted-foreground">{task.project?.name} · {task.assignee?.name ?? "Unassigned"} · {formatDate(task.dueDate)}</div></div>
              <div className="flex gap-2"><Badge>{task.status}</Badge><Badge>{task.priority}</Badge></div>
            </div>
          )) : <p className="text-sm text-muted-foreground">No recent tasks yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return <Card><CardContent className="p-5"><div className="flex items-center justify-between text-sm text-muted-foreground"><span>{title}</span>{icon}</div><div className="mt-3 text-3xl font-semibold">{value}</div></CardContent></Card>;
}
