"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Trash2, Users } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toaster";
import { getApiError } from "@/services/api";
import { deleteUser, listUsers } from "@/services/users";
import { useAuthStore } from "@/store/auth-store";
import { ManagedUser } from "@/types";

export default function UsersPage() {
  const { user } = useAuthStore();
  const toast = useToast();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const visibleUsers = useMemo(() => users.filter((item) => {
    const value = `${item.name} ${item.email} ${item.role}`.toLowerCase();
    return value.includes(search.toLowerCase());
  }), [search, users]);

  async function load() {
    setLoading(true);
    try {
      const data = await listUsers();
      setUsers(data.users);
      setTotalUsers(data.totalUsers);
    } catch (error) {
      toast.push({ title: "Could not load users", description: getApiError(error), variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function removeUser(id: string) {
    try {
      await deleteUser(id);
      setUsers((items) => items.filter((item) => item.id !== id));
      setTotalUsers((count) => Math.max(0, count - 1));
      toast.push({ title: "User deleted" });
    } catch (error) {
      toast.push({ title: "Could not delete user", description: getApiError(error), variant: "error" });
    }
  }

  if (user?.role !== "ADMIN") {
    return <EmptyState title="Admin access required" description="Only admins can view registered users and remove accounts from the site." />;
  }

  return (
    <div>
      <PageHeader title="Users" description="Admin-only module to view registered users and remove accounts from the site." />
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Card className="shadow-none">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <div className="text-sm text-muted-foreground">Registered users</div>
              <div className="mt-1 text-2xl font-semibold">{totalUsers}</div>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-md bg-muted text-muted-foreground"><Users className="h-4 w-4" /></div>
          </CardContent>
        </Card>
      </div>
      <Card className="mb-6 shadow-none">
        <CardContent className="p-4">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search users by name, email, or role" value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
        </CardContent>
      </Card>
      {loading ? (
        <div className="space-y-3"><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" /></div>
      ) : visibleUsers.length ? (
        <div className="space-y-3">
          {visibleUsers.map((item) => (
            <Card key={item.id} className="transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg dark:hover:border-slate-700">
              <CardContent className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_140px_150px_130px_auto] lg:items-center">
                <div className="min-w-0">
                  <div className="truncate font-semibold">{item.name}</div>
                  <div className="truncate text-sm text-muted-foreground">{item.email}</div>
                </div>
                <Badge>{item.role}</Badge>
                <div className="text-sm text-muted-foreground">{item._count.projectMemberships} projects</div>
                <div className="text-sm text-muted-foreground">{item._count.tasksAssigned} tasks</div>
                <Button variant="destructive" size="sm" disabled={item.id === user?.id} onClick={() => removeUser(item.id)}>
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No users found" description="Try a different search term." />
      )}
    </div>
  );
}
