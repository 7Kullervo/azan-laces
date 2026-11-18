"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import type { Category } from "@/lib/types";

interface Props {
  categories: Category[];
  facets: { colours: string[]; materials: string[]; minPrice: number; maxPrice: number };
  activeCategory?: string;
  total: number;
  children?: React.ReactNode;
}

const SORT_OPTIONS = [
  ["featured", "Featured"],
  ["price-asc", "Price: Low to High"],
  ["price-desc", "Price: High to Low"],
  ["newest", "Newest"],
  ["best", "Best Selling"],
];

export default function FilterPanel({ categories, facets, activeCategory, total, children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [min, setMin] = useState(sp.get("min") ?? "");
  const [max, setMax] = useState(sp.get("max") ?? "");
  // Reflect clicks immediately; the URL (server result) catches up a moment later.
  const spString = sp.toString();
  const [optimistic, setOptimistic] = useState<string | null>(null);
  useEffect(() => setOptimistic(null), [spString]);
  const view = new URLSearchParams(optimistic ?? spString);

  function update(changes: Record<string, string | null>) {
    const next = new URLSearchParams(view.toString());
    for (const [k, v] of Object.entries(changes)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    next.delete("page");
    setOptimistic(next.toString());
    start(() => router.push(`${pathname}${next.toString() ? `?${next}` : ""}`, { scroll: false }));
  }

  function toggleMulti(key: string, value: string) {
    const cur = (view.get(key) ?? "").split("|").filter(Boolean);
    const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
    update({ [key]: next.join("|") || null });
  }

  const activeSub = view.get("sub");
  const currentCat = categories.find((c) => c.slug === (activeCategory ?? view.get("cat")));
  const selColours = (view.get("colour") ?? "").split("|").filter(Boolean);
  const selMaterials = (view.get("material") ?? "").split("|").filter(Boolean);
  const anyFilter = ["sub", "min", "max", "colour", "material", "stock", "new", "best", "sale", "cat"].some((k) => view.get(k));

  const panel = (
    <div className="space-y-7 text-sm">
      {anyFilter && (
        <button
          className="text-xs font-semibold uppercase tracking-wider text-gold-dark underline underline-offset-4"
          onClick={() => {
            const q = view.get("q");
            setOptimistic(q ? `q=${encodeURIComponent(q)}` : "");
            setMin(""); setMax("");
            start(() => router.push(q ? `${pathname}?q=${encodeURIComponent(q)}` : pathname));
            setOpen(false);
          }}
        >
          Clear all filters
        </button>
      )}

      <div>
        <h3 className="label">{currentCat ? "Subcategory" : "Category"}</h3>
        <ul className="space-y-1.5">
          {currentCat
            ? currentCat.children?.map((s) => (
                <li key={s.id}>
                  <label className="flex cursor-pointer items-center gap-2.5 py-1">
                    <input
                      type="radio"
                      name="sub"
                      checked={activeSub === s.slug}
                      onChange={() => update({ sub: activeSub === s.slug ? null : s.slug })}
                      onClick={() => activeSub === s.slug && update({ sub: null })}
                      className="accent-[#B8975A]"
                    />
                    {s.name}
                  </label>
                </li>
              ))
            : categories.map((c) => (
                <li key={c.id}>
                  <label className="flex cursor-pointer items-center gap-2.5 py-1">
                    <input
                      type="radio"
                      name="cat"
                      checked={view.get("cat") === c.slug}
                      onChange={() => update({ cat: c.slug, sub: null })}
                      className="accent-[#B8975A]"
                    />
                    {c.name}
                  </label>
                </li>
              ))}
        </ul>
      </div>

      <div>
        <h3 className="label">Price range (Rs.)</h3>
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            update({ min: min || null, max: max || null });
            setOpen(false);
          }}
        >
          <input
            type="number"
            min={0}
            inputMode="numeric"
            placeholder={String(facets.minPrice)}
            value={min}
            onChange={(e) => setMin(e.target.value)}
            className="input !px-3"
            aria-label="Minimum price"
          />
          <span className="text-stone">–</span>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            placeholder={String(facets.maxPrice)}
            value={max}
            onChange={(e) => setMax(e.target.value)}
            className="input !px-3"
            aria-label="Maximum price"
          />
          <button className="btn-dark !px-4" type="submit">Go</button>
        </form>
      </div>

      {facets.colours.length > 0 && (
        <div>
          <h3 className="label">Colour</h3>
          <ul className="space-y-1.5">
            {facets.colours.map((c) => (
              <li key={c}>
                <label className="flex cursor-pointer items-center gap-2.5 py-1">
                  <input type="checkbox" checked={selColours.includes(c)} onChange={() => toggleMulti("colour", c)} className="accent-[#B8975A]" />
                  {c}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {facets.materials.length > 0 && (
        <div>
          <h3 className="label">Material</h3>
          <ul className="space-y-1.5">
            {facets.materials.map((m) => (
              <li key={m}>
                <label className="flex cursor-pointer items-center gap-2.5 py-1">
                  <input type="checkbox" checked={selMaterials.includes(m)} onChange={() => toggleMulti("material", m)} className="accent-[#B8975A]" />
                  {m}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3 className="label">Availability &amp; more</h3>
        <ul className="space-y-1.5">
          {[
            ["stock", "In stock only"],
            ["new", "New arrivals"],
            ["best", "Best sellers"],
            ["sale", "On sale"],
          ].map(([key, label]) => (
            <li key={key}>
              <label className="flex cursor-pointer items-center gap-2.5 py-1">
                <input
                  type="checkbox"
                  checked={view.get(key) === "1"}
                  onChange={(e) => update({ [key]: e.target.checked ? "1" : null })}
                  className="accent-[#B8975A]"
                />
                {label}
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="lg:flex lg:gap-10">
      <aside className="hidden w-60 shrink-0 lg:block" aria-label="Filters">{panel}</aside>
      <div className="min-w-0 flex-1">
      <div className="mb-6 flex items-center justify-between gap-3">
        <button className="btn-outline !px-4 lg:hidden" onClick={() => setOpen(true)}>
          <SlidersHorizontal size={16} /> Filters
        </button>
        <p className="hidden text-sm text-stone lg:block">
          {total} product{total === 1 ? "" : "s"}
          {pending && " · updating…"}
        </p>
        <div className="ml-auto flex items-center gap-2">
          <label htmlFor="sort" className="hidden text-sm text-stone sm:block">Sort by</label>
          <select
            id="sort"
            value={view.get("sort") ?? "featured"}
            onChange={(e) => update({ sort: e.target.value === "featured" ? null : e.target.value })}
            className="input !w-auto !py-2"
          >
            {SORT_OPTIONS.map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      {children}
      </div>

      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="drawer-enter absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col bg-ivory">
            <div className="flex h-14 items-center justify-between border-b border-line px-5">
              <h2 className="font-display text-xl font-semibold">Filters</h2>
              <button onClick={() => setOpen(false)} aria-label="Close filters" className="flex h-11 w-11 items-center justify-center">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{panel}</div>
            <div className="border-t border-line p-4">
              <button className="btn-dark w-full" onClick={() => setOpen(false)}>
                Show {total} product{total === 1 ? "" : "s"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
