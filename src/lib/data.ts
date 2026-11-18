import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { effectivePrice } from "@/lib/units";
import type { Category, Product } from "@/lib/types";

const PRODUCT_SELECT =
  "*, unit:units(*), category:categories(slug,name), subcategory:subcategories(slug,name), images:product_images(id,url,sort_order)";

type Row = Record<string, unknown>;

function shape(row: Row): Product {
  const p = row as unknown as Product;
  return {
    ...p,
    specs: Array.isArray(p.specs) ? p.specs : [],
    images: [...(p.images ?? [])].sort((a, b) => a.sort_order - b.sort_order),
  };
}

export const getSettings = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.from("store_settings").select("key,value");
  const map: Record<string, any> = {};
  (data ?? []).forEach((r) => (map[r.key] = r.value));
  return {
    announcements: (map.announcements ?? { messages: [], enabled: false }) as {
      messages: string[];
      enabled: boolean;
    },
    shipping: (map.shipping ?? { flat_rate: 250, free_over: 5000 }) as {
      flat_rate: number;
      free_over: number | null;
    },
    payments: (map.payments ?? { cod_enabled: true, bank_transfer_enabled: false, bank_details: "" }) as {
      cod_enabled: boolean;
      bank_transfer_enabled: boolean;
      bank_details: string;
    },
    contact: (map.contact ?? {}) as {
      business_name?: string;
      phone?: string;
      whatsapp?: string;
      email?: string;
      address?: string;
      hours?: string;
      map_embed?: string;
      facebook?: string;
      instagram?: string;
      tiktok?: string;
    },
  };
});

export const getCategoryTree = cache(async (): Promise<Category[]> => {
  const supabase = await createClient();
  const [{ data: cats }, { data: subs }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("subcategories").select("*").order("sort_order"),
  ]);
  return (cats ?? []).map((c) => ({
    ...(c as Category),
    parent_id: null,
    children: (subs ?? [])
      .filter((s) => s.category_id === c.id)
      .map((s) => ({
        id: s.id,
        slug: s.slug,
        name: s.name,
        image_url: null,
        sort_order: s.sort_order,
        parent_id: c.id,
      })),
  }));
});

export const getBanners = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("banners")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  return data ?? [];
});

export interface CatalogQuery {
  q?: string;
  category?: string;
  sub?: string;
  min?: number;
  max?: number;
  colour?: string[];
  material?: string[];
  inStock?: boolean;
  isNew?: boolean;
  best?: boolean;
  onSale?: boolean;
  sort?: "featured" | "price-asc" | "price-desc" | "newest" | "best";
  page?: number;
  pageSize?: number;
}

export interface CatalogResult {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  facets: { colours: string[]; materials: string[]; minPrice: number; maxPrice: number };
}

export async function getCatalog(query: CatalogQuery): Promise<CatalogResult> {
  const supabase = await createClient();
  const tree = await getCategoryTree();
  const pageSize = query.pageSize ?? 12;
  const page = Math.max(1, query.page ?? 1);

  let req = supabase.from("products").select(PRODUCT_SELECT).eq("is_active", true).limit(1000);

  if (query.category) {
    const cat = tree.find((c) => c.slug === query.category);
    if (!cat) return emptyResult(page, pageSize);
    req = req.eq("category_id", cat.id);
  }
  if (query.sub) {
    const sub = tree.flatMap((c) => c.children ?? []).find((s) => s.slug === query.sub);
    if (!sub) return emptyResult(page, pageSize);
    req = req.eq("subcategory_id", sub.id);
  }
  if (query.q) {
    const term = query.q.trim().replace(/[%,()]/g, " ");
    if (term) {
      const t = term.toLowerCase();
      const catIds = tree.filter((c) => c.name.toLowerCase().includes(t)).map((c) => c.id);
      const subIds = tree
        .flatMap((c) => c.children ?? [])
        .filter((s) => s.name.toLowerCase().includes(t))
        .map((s) => s.id);
      const clauses = [
        `name.ilike.%${term}%`,
        `sku.ilike.%${term}%`,
        `description.ilike.%${term}%`,
        `colour.ilike.%${term}%`,
        `material.ilike.%${term}%`,
        `unit_code.ilike.%${term}%`,
      ];
      if (catIds.length) clauses.push(`category_id.in.(${catIds.join(",")})`);
      if (subIds.length) clauses.push(`subcategory_id.in.(${subIds.join(",")})`);
      req = req.or(clauses.join(","));
    }
  }
  if (query.isNew) req = req.eq("is_new", true);
  if (query.best) req = req.eq("is_best_seller", true);

  const { data } = await req;
  let items = (data ?? []).map((r) => shape(r as Row));

  if (query.onSale) items = items.filter((p) => p.sale_price !== null && p.sale_price < p.price);

  // facets come from the set before the colour/material/price/stock filters
  const prices = items.map(effectivePrice);
  const facets = {
    colours: uniqueSorted(items.map((p) => p.colour)),
    materials: uniqueSorted(items.map((p) => p.material)),
    minPrice: prices.length ? Math.floor(Math.min(...prices)) : 0,
    maxPrice: prices.length ? Math.ceil(Math.max(...prices)) : 0,
  };

  if (query.colour?.length) items = items.filter((p) => p.colour && query.colour!.includes(p.colour));
  if (query.material?.length) items = items.filter((p) => p.material && query.material!.includes(p.material));
  if (query.min !== undefined) items = items.filter((p) => effectivePrice(p) >= query.min!);
  if (query.max !== undefined) items = items.filter((p) => effectivePrice(p) <= query.max!);
  if (query.inStock) items = items.filter((p) => p.stock >= p.min_qty);

  switch (query.sort) {
    case "price-asc":
      items.sort((a, b) => effectivePrice(a) - effectivePrice(b));
      break;
    case "price-desc":
      items.sort((a, b) => effectivePrice(b) - effectivePrice(a));
      break;
    case "newest":
      items.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
      break;
    case "best":
      items.sort((a, b) => b.sales_count - a.sales_count || Number(b.is_best_seller) - Number(a.is_best_seller));
      break;
    default:
      items.sort(
        (a, b) =>
          Number(b.is_featured) - Number(a.is_featured) ||
          +new Date(b.created_at) - +new Date(a.created_at)
      );
  }

  const total = items.length;
  const start = (page - 1) * pageSize;
  return { products: items.slice(start, start + pageSize), total, page, pageSize, facets };
}

function emptyResult(page: number, pageSize: number): CatalogResult {
  return {
    products: [],
    total: 0,
    page,
    pageSize,
    facets: { colours: [], materials: [], minPrice: 0, maxPrice: 0 },
  };
}

function uniqueSorted(values: (string | null)[]): string[] {
  return [...new Set(values.filter((v): v is string => !!v))].sort();
}

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  return data ? shape(data as Row) : null;
});

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const supabase = await createClient();
  let req = supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .neq("id", product.id)
    .limit(limit);
  if (product.subcategory_id) req = req.eq("subcategory_id", product.subcategory_id);
  else if (product.category_id) req = req.eq("category_id", product.category_id);
  const { data } = await req;
  let items = (data ?? []).map((r) => shape(r as Row));
  if (items.length < limit && product.category_id) {
    const { data: more } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("is_active", true)
      .eq("category_id", product.category_id)
      .neq("id", product.id)
      .limit(limit);
    const have = new Set(items.map((i) => i.id));
    items = [...items, ...(more ?? []).map((r) => shape(r as Row)).filter((p) => !have.has(p.id))].slice(0, limit);
  }
  return items;
}

export const getHomeProducts = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(500);
  const all = (data ?? []).map((r) => shape(r as Row));
  return {
    featured: all.filter((p) => p.is_featured).slice(0, 8),
    best: all.filter((p) => p.is_best_seller).sort((a, b) => b.sales_count - a.sales_count).slice(0, 8),
    newest: all.filter((p) => p.is_new).slice(0, 8),
    offers: all.filter((p) => p.sale_price !== null && p.sale_price < p.price).slice(0, 4),
  };
});

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (!ids.length) return [];
  const supabase = await createClient();
  const { data } = await supabase.from("products").select(PRODUCT_SELECT).in("id", ids);
  return (data ?? []).map((r) => shape(r as Row));
}
