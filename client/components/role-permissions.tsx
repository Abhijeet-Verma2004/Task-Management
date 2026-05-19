import { ShieldCheck, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Role } from "@/types";

const roles = {
  ADMIN: {
    icon: ShieldCheck,
    title: "Admin",
    description: "Manage tasks and members, including removing project members."
  },
  MEMBER: {
    icon: UserCheck,
    title: "Member",
    description: "View assigned projects and update only assigned task status."
  }
};

export function RolePermissions({ selectedRole, compact = false }: { selectedRole?: Role; compact?: boolean }) {
  const entries = selectedRole ? [roles[selectedRole]] : [roles.ADMIN, roles.MEMBER];

  return (
    <div className={cn("grid gap-3", !compact && "sm:grid-cols-2")}>
      {entries.map((role) => {
        const Icon = role.icon;
        return (
          <div key={role.title} className="rounded-md border bg-background/70 p-3 text-foreground">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Icon className="h-4 w-4" />
              {role.title}
            </div>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{role.description}</p>
          </div>
        );
      })}
    </div>
  );
}
