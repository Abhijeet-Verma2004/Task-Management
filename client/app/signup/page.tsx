"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Field } from "@/components/field";
import { RolePermissions } from "@/components/role-permissions";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toaster";
import { getApiError } from "@/services/api";
import { signup } from "@/services/auth";
import { useAuthStore } from "@/store/auth-store";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8, "Use at least 8 characters"),
  role: z.enum(["ADMIN", "MEMBER"])
});

type FormValues = z.infer<typeof schema>;

export default function SignupPage() {
  const router = useRouter();
  const toast = useToast();
  const { setSession } = useAuthStore();
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: "", email: "", password: "", role: "MEMBER" } });
  const selectedRole = form.watch("role");

  async function onSubmit(values: FormValues) {
    try {
      const session = await signup(values);
      setSession(session.user, session.token);
      toast.push({ title: "Account created", description: "You can create your first project now." });
      router.push("/projects");
    } catch (error) {
      toast.push({ title: "Signup failed", description: getApiError(error), variant: "error" });
    }
  }

  return (
    <main className="auth-background grid min-h-screen place-items-center p-4">
      <div className="fixed right-4 top-4"><ThemeToggle compact /></div>
      <Card className="w-full max-w-md border-white/80 bg-white/95 shadow-2xl dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
        <CardHeader>
          <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground">TM</div>
          <CardTitle className="text-2xl">Create account</CardTitle>
          <p className="text-sm text-muted-foreground">Start a clean workspace for your team.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Field label="Name" error={form.formState.errors.name?.message}><Input {...form.register("name")} /></Field>
            <Field label="Email" error={form.formState.errors.email?.message}><Input type="email" {...form.register("email")} /></Field>
            <Field label="Password" error={form.formState.errors.password?.message}><Input type="password" {...form.register("password")} /></Field>
            <Field label="Account role" error={form.formState.errors.role?.message}>
              <Select {...form.register("role")}>
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </Select>
            </Field>
            <RolePermissions selectedRole={selectedRole} compact />
            <Button className="h-11 w-full" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Creating..." : "Create account"}</Button>
          </form>
          <p className="mt-5 text-center text-sm text-muted-foreground">
            Already have an account? <Link className="font-medium text-foreground" href="/login">Login</Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
