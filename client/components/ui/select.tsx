import * as React from "react";
import { cn } from "@/lib/utils";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn("flex h-11 w-full rounded-md border border-input bg-white px-3 py-2 text-sm outline-none transition-all focus:border-slate-400 focus:ring-2 focus:ring-ring dark:bg-slate-950/80", className)}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";
