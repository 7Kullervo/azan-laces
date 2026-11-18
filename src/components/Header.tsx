"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import type { Category } from "@/lib/types";
import { useCart } from "@/lib/cart-store";
import { useWishlist } from "@/lib/wishlist-store";

export default function Header({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const lines = useCart((s) => s.lines);
  const hydrated = useCart((s) => s.hydrated);
  const openDrawer = useCart((s) => s.openDrawer);
  const wishCount = useWishlist((s) => s.ids.length);
  const loggedIn = useWishlist((s) => s.loggedIn);

  const count = hydrated ? lines.length : 0;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    setSearchOpen(false);
    setMobileOpen(false);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  }

  const searchForm = (
    <form onSubmit={submit} role="search" className="relative w-full">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search laces, buttons, SKU…"
        aria-label="Search products"
        className="input !rounded-full !pl-5 !pr-12"
      />
      <button
        type="submit"
        aria-label="Search"
        className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-ink text-ivory transition hover:bg-gold-dark"
      >
        <Search size={16} />
      </button>
    </form>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ivory/95 backdrop-blur">
      <div className="container-page flex h-16 items-center gap-3 sm:h-20 sm:gap-6">
        <button
          className="-ml-2 flex h-11 w-11 items-center justify-center lg:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <Link href="/" className="shrink-0" aria-label="Azan Lace home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Azan Lace" className="h-9 w-auto sm:h-12" />
        </Link>

        <div className="mx-4 hidden max-w-xl flex-1 md:block">{searchForm}</div>

        <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
          <button
            className="flex h-11 w-11 items-center justify-center md:hidden"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Search"
          >
            <Search size={21} />
          </button>
          <Link
            href={loggedIn ? "/account" : "/login"}
            className="flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-cream"
            aria-label="Account"
          >
            <User size={21} />
          </Link>
          <Link
            href={loggedIn ? "/account/wishlist" : "/login?next=/account/wishlist"}
            className="relative flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-cream"
            aria-label="Wishlist"
          >
            <Heart size={21} />
            {wishCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-white">
                {wishCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => openDrawer(true)}
            className="relative flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-cream"
            aria-label={`Cart, ${count} items`}
          >
            <ShoppingBag size={21} />
            {count > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-white">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {searchOpen && <div className="container-page pb-3 md:hidden">{searchForm}</div>}

      {/* Desktop navigation */}
      <nav className="hidden border-t border-line lg:block" aria-label="Main">
        <ul className="container-page flex items-center justify-center gap-1">
          {categories.map((c) => (
            <li key={c.id} className="group relative">
              <Link
                href={`/collections/${c.slug}`}
                className="flex items-center gap-1 px-3.5 py-3.5 text-[13px] font-medium uppercase tracking-wider transition hover:text-gold-dark xl:px-4"
              >
                {c.name}
                {!!c.children?.length && <ChevronDown size={13} className="transition group-hover:rotate-180" />}
              </Link>
              {!!c.children?.length && (
                <div className="invisible absolute left-0 top-full z-50 min-w-[230px] translate-y-1 rounded-b-2xl border border-line bg-white p-2 opacity-0 shadow-xl transition duration-150 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  {c.children.map((s) => (
                    <Link
                      key={s.id}
                      href={`/collections/${c.slug}?sub=${s.slug}`}
                      className="block rounded-lg px-3 py-2 text-sm text-ink/85 transition hover:bg-cream hover:text-gold-dark"
                    >
                      {s.name}
                    </Link>
                  ))}
                  <Link
                    href={`/collections/${c.slug}`}
                    className="mt-1 block border-t border-line px-3 pt-2.5 pb-1.5 text-xs font-semibold uppercase tracking-wider text-gold-dark"
                  >
                    View all {c.name}
                  </Link>
                </div>
              )}
            </li>
          ))}
          <li>
            <Link
              href="/collections/all"
              className="block px-3.5 py-3.5 text-[13px] font-medium uppercase tracking-wider text-gold-dark transition hover:text-ink xl:px-4"
            >
              All Products
            </Link>
          </li>
        </ul>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-ivory shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-line px-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="Azan Lace" className="h-9 w-auto" />
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="flex h-11 w-11 items-center justify-center"
              >
                <X size={22} />
              </button>
            </div>
            <div className="border-b border-line p-4">{searchForm}</div>
            <ul className="flex-1 overflow-y-auto py-2">
              {categories.map((c) => (
                <li key={c.id} className="border-b border-line/60">
                  <div className="flex items-center">
                    <Link
                      href={`/collections/${c.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 px-5 py-3.5 text-sm font-medium uppercase tracking-wider"
                    >
                      {c.name}
                    </Link>
                    {!!c.children?.length && (
                      <button
                        aria-label={`Toggle ${c.name}`}
                        aria-expanded={expanded === c.id}
                        onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                        className="flex h-12 w-12 items-center justify-center"
                      >
                        <ChevronDown size={18} className={`transition ${expanded === c.id ? "rotate-180" : ""}`} />
                      </button>
                    )}
                  </div>
                  {expanded === c.id && (
                    <div className="bg-cream/60 pb-2">
                      {c.children?.map((s) => (
                        <Link
                          key={s.id}
                          href={`/collections/${c.slug}?sub=${s.slug}`}
                          onClick={() => setMobileOpen(false)}
                          className="block px-8 py-2.5 text-sm text-ink/80"
                        >
                          {s.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              ))}
              <li>
                <Link
                  href="/collections/all"
                  onClick={() => setMobileOpen(false)}
                  className="block px-5 py-3.5 text-sm font-medium uppercase tracking-wider text-gold-dark"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/contact" onClick={() => setMobileOpen(false)} className="block px-5 py-3.5 text-sm">
                  Contact us
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
