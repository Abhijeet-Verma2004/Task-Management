"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FolderPlus, Search } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { ProjectForm, ProjectFormValues } from "@/components/project-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toaster";
import { getApiError } from "@/services/api";
import { createProject, listProjects } from "@/services/projects";
import { useAuthStore } from "@/store/auth-store";
import { Project } from "@/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const { user } = useAuthStore();
  const toast = useToast();
  const visibleProjects = useMemo(() => projects.filter((project) => {
    const membership = project.members.find((member) => member.userId === user?.id);
    const matchesSearch = [project.name, project.description ?? ""].join(" ").toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter ? membership?.role === roleFilter : true;
    return matchesSearch && matchesRole;
  }), [projects, roleFilter, search, user]);

  async function load() {
    setLoading(true);
    setProjects(await listProjects());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function submit(values: ProjectFormValues) {
    try {
      await createProject(values);
      toast.push({ title: "Project created" });
      setShowForm(false);
      await load();
    } catch (error) {
      toast.push({ title: "Could not create project", description: getApiError(error), variant: "error" });
    }
  }

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Create workspaces, add members, and organize tasks around clear project goals."
        action={user?.role === "ADMIN" ? <Button onClick={() => setShowForm((value) => !value)}><FolderPlus className="h-4 w-4" />New project</Button> : null}
      />
      {showForm ? <Card className="mb-6"><CardHeader><CardTitle>New project</CardTitle></CardHeader><CardContent><ProjectForm onSubmit={submit} /></CardContent></Card> : null}
      <Card className="mb-6 shadow-none">
        <CardContent className="grid gap-3 p-4 md:grid-cols-[1fr_180px]">
          <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search projects" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
          <Select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
            <option value="">All roles</option>
            <option value="ADMIN">Admin</option>
            <option value="MEMBER">Member</option>
          </Select>
        </CardContent>
      </Card>
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"><Skeleton className="h-44" /><Skeleton className="h-44" /><Skeleton className="h-44" /></div>
      ) : visibleProjects.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleProjects.map((project) => {
            const membership = project.members.find((member) => member.userId === user?.id);
            return (
              <Link key={project.id} href={`/projects/${project.id}`} className="group">
                <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle>{project.name}</CardTitle>
                      {membership ? <Badge>{membership.role}</Badge> : null}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-3 min-h-16 text-sm text-muted-foreground">{project.description || "No description provided."}</p>
                    <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                      <div className="rounded-md bg-muted p-3"><div className="text-xs">Members</div><div className="mt-1 font-semibold text-foreground">{project.members.length}</div></div>
                      <div className="rounded-md bg-muted p-3"><div className="text-xs">Tasks</div><div className="mt-1 font-semibold text-foreground">{project._count?.tasks ?? 0}</div></div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No projects yet" description="Create your first project to invite members and start assigning tasks." />
      )}
    </div>
  );
}
