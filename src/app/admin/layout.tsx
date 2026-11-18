import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import AdminNav from "@/components/admin/AdminNav";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="min-h-screen bg-cream/60 lg:flex">
      <AdminNav />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between border-b border-line bg-white px-5 py-3 text-sm">
          <span className="font-medium text-stone">Store administration</span>
          <Link href="/" className="text-gold-dark underline">View store →</Link>
        </div>
        <div className="mx-auto max-w-6xl p-5 sm:p-8">{children}</div>
      </div>
    </div>
  );
}
