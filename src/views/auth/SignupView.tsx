"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthController } from "@/controllers/useAuthController";
import { signupSchema } from "@/models/schemas/auth";
import { Input } from "@/views/components/Input";
import { Button } from "@/views/components/Button";
import { Card } from "@/views/components/Card";

export function SignupView() {
  const router = useRouter();
  const { signup, loading, error } = useAuthController();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = signupSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((e) => { errs[e.path[0] as string] = e.message; });
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    const ok = await signup(parsed.data);
    if (ok) router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <Card className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Create account</h1>
          <p className="mt-1 text-sm text-zinc-500">Start your identity verification</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Full name" type="text" placeholder="Jane Doe" value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={fieldErrors.name} />
          <Input label="Email" type="email" placeholder="you@example.com" value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} error={fieldErrors.email} />
          <Input label="Password" type="password" placeholder="Min. 8 characters" value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} error={fieldErrors.password} />
          <Button type="submit" loading={loading} className="mt-2 w-full">Create account</Button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-indigo-600 hover:underline">Sign in</Link>
        </p>
      </Card>
    </div>
  );
}
