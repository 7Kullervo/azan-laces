"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useUI } from "@/lib/ui-store";
import type { Result } from "@/app/admin/actions";

export function PageHead({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-line bg-white p-5 sm:p-6 ${className}`}>{children}</div>;
}

export function Stat({ label, value, hint, tone }: { label: string; value: string | number; hint?: string; tone?: "warn" }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <p className="text-xs uppercase tracking-wider text-stone">{label}</p>
      <p className={`mt-1 font-display text-4xl font-semibold ${tone === "warn" ? "text-amber-700" : ""}`}>{value}</p>
      {hint && <p className="mt-0.5 text-xs text-stone">{hint}</p>}
    </div>
  );
}

/** Runs a server action, toasts the result and refreshes data. */
export function useAction() {
  const router = useRouter();
  const toast = useUI((s) => s.toast);
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  function run(fn: () => Promise<Result>, success = "Saved", after?: (r: Result) => void) {
    setError("");
    start(async () => {
      const r = await fn();
      if (r.ok) {
        toast(success);
        router.refresh();
      } else {
        setError(r.error);
        toast(r.error);
      }
      after?.(r);
    });
  }
  return { run, pending, error };
}

export function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[#B8975A]" />
      {label}
    </label>
  );
}

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block">
        <span className="label">{label}</span>
        {children}
      </label>
      {hint && <p className="mt-1 text-xs text-stone">{hint}</p>}
    </div>
  );
}
