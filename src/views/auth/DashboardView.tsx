"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthController } from "@/controllers/useAuthController";
import { Card } from "@/views/components/Card";
import { Button } from "@/views/components/Button";

const steps = [
  { href: "/signup", label: "Create account", icon: "👤", done: true },
  { href: "/dashboard", label: "Face enrollment", icon: "🪪", done: false },
  { href: "/verify-document", label: "Document verification", icon: "📄", done: false },
];

export function DashboardView() {
  const router = useRouter();
  const { user, loading, logout } = useAuthController();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Welcome, {user.name}
            </h1>
            <p className="text-sm text-zinc-500">{user.email}</p>
          </div>
          <Button variant="ghost" onClick={logout}>Sign out</Button>
        </div>

        <Card className="mb-6">
          <h2 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-100">Verification progress</h2>
          <ol className="flex flex-col gap-4">
            {steps.map((step, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${step.done ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800"}`}>
                  {step.done ? "✓" : i + 1}
                </span>
                <span className="text-sm text-zinc-700 dark:text-zinc-300">{step.icon} {step.label}</span>
              </li>
            ))}
          </ol>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-100">Verify document</h3>
            <p className="mb-4 text-sm text-zinc-500">Upload a government ID to complete KYC.</p>
            <Link href="/verify-document">
              <Button className="w-full">Upload document</Button>
            </Link>
          </Card>
          <Card>
            <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-100">Hand control</h3>
            <p className="mb-4 text-sm text-zinc-500">Try gesture-based navigation with your webcam.</p>
            <Link href="/hand-control">
              <Button variant="secondary" className="w-full">Open hand control</Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
