"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/field";
import { RolePermissions } from "@/components/role-permissions";
import { ThemeToggle } from "@/components/theme-toggle";
import { getApiError } from "@/services/api";
import { login } from "@/services/auth";
import { useAuthStore } from "@/store/auth-store";
import { useToast } from "@/components/ui/toaster";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { setSession } = useAuthStore();
  const toast = useToast();
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });

  async function onSubmit(values: FormValues) {
    try {
      const session = await login(values);
      setSession(session.user, session.token);
      toast.push({ title: "Welcome back", description: "Your workspace is ready." });
      router.push("/dashboard");
    } catch (error) {
      toast.push({ title: "Login failed", description: getApiError(error), variant: "error" });
    }
  }

  return (
    <main className="auth-background grid min-h-screen place-items-center p-4">
      <div className="fixed right-4 top-4"><ThemeToggle compact /></div>
      <Card className="w-full max-w-md border-white/80 bg-white/95 shadow-2xl dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
        <CardHeader>
          <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground">TM</div>
          <CardTitle className="text-2xl">Login</CardTitle>
          <p className="text-sm text-muted-foreground">Access your team workspace.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Field label="Email" error={form.formState.errors.email?.message}>
              <Input type="email" {...form.register("email")} />
            </Field>
            <Field label="Password" error={form.formState.errors.password?.message}>
              <Input type="password" {...form.register("password")} />
            </Field>
            <Button className="h-11 w-full" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Signing in..." : "Sign in"}</Button>
          </form>
          <div className="mt-5"><RolePermissions /></div>
          <p className="mt-5 text-center text-sm text-muted-foreground">
            New here? <Link className="font-medium text-foreground" href="/signup">Create an account</Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
