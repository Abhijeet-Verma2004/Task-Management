import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex h-11 w-full rounded-md border border-input bg-white px-3 py-2 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-slate-400 focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-950/80",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";
