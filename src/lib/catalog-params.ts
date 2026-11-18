import type { CatalogQuery } from "./data";

export type SP = Record<string, string | string[] | undefined>;

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function num(v: string | string[] | undefined): number | undefined {
  const s = one(v);
  if (s === undefined || s === "") return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

function list(v: string | string[] | undefined): string[] | undefined {
  const s = one(v);
  return s ? s.split("|").filter(Boolean) : undefined;
}

const SORTS = ["featured", "price-asc", "price-desc", "newest", "best"] as const;

export function parseCatalogParams(sp: SP, category?: string): CatalogQuery {
  const sort = one(sp.sort);
  return {
    q: one(sp.q),
    category: category && category !== "all" ? category : one(sp.cat),
    sub: one(sp.sub),
    min: num(sp.min),
    max: num(sp.max),
    colour: list(sp.colour),
    material: list(sp.material),
    inStock: one(sp.stock) === "1",
    isNew: one(sp.new) === "1",
    best: one(sp.best) === "1",
    onSale: one(sp.sale) === "1",
    sort: (SORTS as readonly string[]).includes(sort ?? "") ? (sort as CatalogQuery["sort"]) : "featured",
    page: num(sp.page) ?? 1,
  };
}
