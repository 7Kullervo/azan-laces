"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BarChart3, Boxes, ImageIcon, Layers, Mail, Menu, Package, Settings, Tag, Users, X } from "lucide-react";

const ITEMS = [
  ["/admin", "Overview", BarChart3],
  ["/admin/orders", "Orders", Package],
  ["/admin/products", "Products", Boxes],
  ["/admin/categories", "Categories", Layers],
  ["/admin/coupons", "Coupons", Tag],
  ["/admin/banners", "Banners", ImageIcon],
  ["/admin/customers", "Customers", Users],
  ["/admin/messages", "Messages", Mail],
  ["/admin/settings", "Settings", Settings],
] as const;

export default function AdminNav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  const links = (
    <nav className="space-y-1 p-3" aria-label="Admin">
      {ITEMS.map(([href, label, Icon]) => {
        const active = href === "/admin" ? path === "/admin" : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition ${
              active ? "bg-gold text-white" : "text-ivory/80 hover:bg-ivory/10"
            }`}
          >
            <Icon size={17} /> {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <div className="flex items-center justify-between bg-ink px-4 py-3 text-ivory lg:hidden">
        <span className="font-display text-xl font-semibold">Azan Lace Admin</span>
        <button onClick={() => setOpen(!open)} aria-label="Toggle menu" className="flex h-10 w-10 items-center justify-center">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && <div className="bg-ink lg:hidden">{links}</div>}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 overflow-y-auto bg-ink text-ivory lg:block">
        <div className="border-b border-ivory/10 px-6 py-6">
          <p className="font-display text-2xl font-semibold">Azan Lace</p>
          <p className="text-xs uppercase tracking-widest text-gold-light">Admin</p>
        </div>
        {links}
      </aside>
    </>
  );
}
