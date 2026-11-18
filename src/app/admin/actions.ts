"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/slug";
import { ORDER_STATUSES } from "@/lib/types";

export type Result = { ok: true; id?: string } | { ok: false; error: string };

const fail = (error: string): Result => ({ ok: false, error });
const refresh = () => revalidatePath("/", "layout");
const msg = (e: { message: string } | null) => (e ? e.message.replace(/duplicate key value violates unique constraint "(\w+)"/, "That value is already used ($1)") : "");

// ---------------------------------------------------------------- products
const specSchema = z.object({ label: z.string().trim().min(1).max(60), value: z.string().trim().min(1).max(200) });

const productSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2, "Enter a product name").max(160),
  sku: z.string().trim().min(1, "Enter a SKU / product code").max(40),
  slug: z.string().trim().max(100).optional().default(""),
  description: z.string().trim().max(5000).optional().default(""),
  price: z.number().min(0, "Price cannot be negative"),
  sale_price: z.number().min(0).nullable(),
  unit_code: z.string().min(1, "Select a selling unit"),
  step: z.number().positive("Step must be above 0"),
  min_qty: z.number().positive("Minimum quantity must be above 0"),
  stock: z.number().min(0, "Stock cannot be negative"),
  low_stock_threshold: z.number().min(0),
  category_id: z.string().uuid().nullable(),
  subcategory_id: z.string().uuid().nullable(),
  colour: z.string().trim().max(60).optional().default(""),
  material: z.string().trim().max(80).optional().default(""),
  specs: z.array(specSchema).max(30),
  is_featured: z.boolean(),
  is_best_seller: z.boolean(),
  is_new: z.boolean(),
  is_active: z.boolean(),
  images: z.array(z.string().url().or(z.string().startsWith("/"))).max(12),
});

export type ProductPayload = z.input<typeof productSchema>;

export async function saveProduct(input: ProductPayload): Promise<Result> {
  const { supabase } = await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  const p = parsed.data;
  if (p.sale_price !== null && p.sale_price >= p.price) return fail("Discounted price must be lower than the regular price");

  const { data: unit } = await supabase.from("units").select("*").eq("code", p.unit_code).maybeSingle();
  if (!unit) return fail("Unknown unit");
  if (!unit.allow_decimal && (!Number.isInteger(p.step) || !Number.isInteger(p.min_qty))) {
    return fail(`${unit.label} products must use whole-number steps and minimum quantity`);
  }

  const row = {
    name: p.name,
    sku: p.sku,
    slug: slugify(p.slug || p.name) || slugify(p.sku),
    description: p.description || null,
    price: p.price,
    sale_price: p.sale_price,
    unit_code: p.unit_code,
    step: p.step,
    min_qty: p.min_qty,
    stock: p.stock,
    low_stock_threshold: p.low_stock_threshold,
    category_id: p.category_id,
    subcategory_id: p.category_id ? p.subcategory_id : null,
    colour: p.colour || null,
    material: p.material || null,
    specs: p.specs,
    is_featured: p.is_featured,
    is_best_seller: p.is_best_seller,
    is_new: p.is_new,
    is_active: p.is_active,
    updated_at: new Date().toISOString(),
  };

  let id = p.id;
  if (id) {
    const { error } = await supabase.from("products").update(row).eq("id", id);
    if (error) return fail(msg(error));
  } else {
    const { data, error } = await supabase.from("products").insert(row).select("id").single();
    if (error) return fail(msg(error));
    id = data.id;
  }

  // Replace the image list in the chosen order
  await supabase.from("product_images").delete().eq("product_id", id!);
  if (p.images.length) {
    const { error } = await supabase
      .from("product_images")
      .insert(p.images.map((url, i) => ({ product_id: id!, url, sort_order: i })));
    if (error) return fail(msg(error));
  }
  refresh();
  return { ok: true, id };
}

export async function deleteProduct(id: string): Promise<Result> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return fail(msg(error));
  refresh();
  return { ok: true };
}

export async function quickUpdateProduct(
  id: string,
  patch: Partial<{ is_active: boolean; is_featured: boolean; is_best_seller: boolean; is_new: boolean; stock: number }>
): Promise<Result> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("products").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return fail(msg(error));
  refresh();
  return { ok: true };
}

// ---------------------------------------------------------------- orders
export async function updateOrderStatus(id: string, status: string): Promise<Result> {
  const { supabase } = await requireAdmin();
  if (!(ORDER_STATUSES as string[]).includes(status)) return fail("Invalid status");
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) return fail(msg(error));
  revalidatePath("/admin/orders");
  revalidatePath("/account/orders");
  return { ok: true };
}

// ---------------------------------------------------------------- categories
const catSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().max(80).optional().default(""),
  image_url: z.string().trim().max(500).optional().default(""),
  sort_order: z.number().int().min(0).max(999),
});

export async function saveCategory(input: z.input<typeof catSchema>): Promise<Result> {
  const { supabase } = await requireAdmin();
  const p = catSchema.safeParse(input);
  if (!p.success) return fail(p.error.issues[0].message);
  const row = { name: p.data.name, slug: slugify(p.data.slug || p.data.name), image_url: p.data.image_url || null, sort_order: p.data.sort_order };
  const { error } = p.data.id
    ? await supabase.from("categories").update(row).eq("id", p.data.id)
    : await supabase.from("categories").insert(row);
  if (error) return fail(msg(error));
  refresh();
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<Result> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return fail(msg(error));
  refresh();
  return { ok: true };
}

const subSchema = z.object({
  id: z.string().uuid().optional(),
  category_id: z.string().uuid(),
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().max(80).optional().default(""),
  sort_order: z.number().int().min(0).max(999),
});

export async function saveSubcategory(input: z.input<typeof subSchema>): Promise<Result> {
  const { supabase } = await requireAdmin();
  const p = subSchema.safeParse(input);
  if (!p.success) return fail(p.error.issues[0].message);
  const row = { category_id: p.data.category_id, name: p.data.name, slug: slugify(p.data.slug || p.data.name), sort_order: p.data.sort_order };
  const { error } = p.data.id
    ? await supabase.from("subcategories").update(row).eq("id", p.data.id)
    : await supabase.from("subcategories").insert(row);
  if (error) return fail(msg(error));
  refresh();
  return { ok: true };
}

export async function deleteSubcategory(id: string): Promise<Result> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("subcategories").delete().eq("id", id);
  if (error) return fail(msg(error));
  refresh();
  return { ok: true };
}

// ---------------------------------------------------------------- coupons
const couponSchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().trim().min(3, "Code must be at least 3 characters").max(30).regex(/^[A-Za-z0-9_-]+$/, "Use letters, numbers, - or _ only"),
  discount_type: z.enum(["percent", "fixed"]),
  discount_value: z.number().positive("Discount must be above 0"),
  min_order: z.number().min(0),
  usage_limit: z.number().int().positive().nullable(),
  expires_at: z.string().nullable(),
  is_active: z.boolean(),
});

export async function saveCoupon(input: z.input<typeof couponSchema>): Promise<Result> {
  const { supabase } = await requireAdmin();
  const p = couponSchema.safeParse(input);
  if (!p.success) return fail(p.error.issues[0].message);
  if (p.data.discount_type === "percent" && p.data.discount_value > 100) return fail("Percentage cannot exceed 100");
  const row = { ...p.data, code: p.data.code.toUpperCase(), expires_at: p.data.expires_at || null };
  delete (row as { id?: string }).id;
  const { error } = p.data.id
    ? await supabase.from("coupons").update(row).eq("id", p.data.id)
    : await supabase.from("coupons").insert(row);
  if (error) return fail(msg(error));
  revalidatePath("/admin/coupons");
  return { ok: true };
}

export async function deleteCoupon(id: string): Promise<Result> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) return fail(msg(error));
  revalidatePath("/admin/coupons");
  return { ok: true };
}

// ---------------------------------------------------------------- banners
const bannerSchema = z.object({
  id: z.string().uuid().optional(),
  eyebrow: z.string().trim().max(60).optional().default(""),
  title: z.string().trim().min(2, "Enter a headline").max(120),
  subtitle: z.string().trim().max(300).optional().default(""),
  image_url: z.string().trim().min(1, "Upload or enter an image"),
  cta_label: z.string().trim().max(40).optional().default(""),
  cta_href: z.string().trim().max(200).optional().default(""),
  cta2_label: z.string().trim().max(40).optional().default(""),
  cta2_href: z.string().trim().max(200).optional().default(""),
  sort_order: z.number().int().min(0).max(999),
  is_active: z.boolean(),
});

export async function saveBanner(input: z.input<typeof bannerSchema>): Promise<Result> {
  const { supabase } = await requireAdmin();
  const p = bannerSchema.safeParse(input);
  if (!p.success) return fail(p.error.issues[0].message);
  const { id, ...rest } = p.data;
  const row = Object.fromEntries(Object.entries(rest).map(([k, v]) => [k, v === "" ? null : v]));
  const { error } = id ? await supabase.from("banners").update(row).eq("id", id) : await supabase.from("banners").insert(row);
  if (error) return fail(msg(error));
  refresh();
  return { ok: true };
}

export async function deleteBanner(id: string): Promise<Result> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("banners").delete().eq("id", id);
  if (error) return fail(msg(error));
  refresh();
  return { ok: true };
}

// ---------------------------------------------------------------- settings
const settingSchemas = {
  announcements: z.object({ enabled: z.boolean(), messages: z.array(z.string().trim().min(1).max(160)).max(10) }),
  shipping: z.object({ flat_rate: z.number().min(0), free_over: z.number().min(0).nullable() }),
  payments: z.object({ cod_enabled: z.boolean(), bank_transfer_enabled: z.boolean(), bank_details: z.string().max(1000) }),
  contact: z.object({
    business_name: z.string().trim().max(100),
    phone: z.string().trim().max(40),
    whatsapp: z.string().trim().regex(/^\d{8,15}$|^$/, "WhatsApp number: digits only with country code, e.g. 923001234567"),
    email: z.string().trim().max(120),
    address: z.string().trim().max(300),
    hours: z.string().trim().max(300),
    map_embed: z.string().trim().max(600),
    facebook: z.string().trim().max(200),
    instagram: z.string().trim().max(200),
    tiktok: z.string().trim().max(200),
  }),
} as const;

export async function saveSetting(key: keyof typeof settingSchemas, value: unknown): Promise<Result> {
  const { supabase } = await requireAdmin();
  const schema = settingSchemas[key];
  if (!schema) return fail("Unknown setting");
  const p = schema.safeParse(value);
  if (!p.success) return fail(p.error.issues[0].message);
  const { error } = await supabase
    .from("store_settings")
    .upsert({ key, value: p.data, updated_at: new Date().toISOString() });
  if (error) return fail(msg(error));
  refresh();
  return { ok: true };
}

// ---------------------------------------------------------------- units
const unitSchema = z.object({
  code: z.string().trim().min(2).max(20).regex(/^[a-z0-9_-]+$/, "Code: lowercase letters, numbers, - or _"),
  label: z.string().trim().min(1).max(30),
  label_plural: z.string().trim().min(1).max(30),
  allow_decimal: z.boolean(),
  default_step: z.number().positive(),
});

export async function saveUnit(input: z.input<typeof unitSchema>): Promise<Result> {
  const { supabase } = await requireAdmin();
  const p = unitSchema.safeParse(input);
  if (!p.success) return fail(p.error.issues[0].message);
  if (!p.data.allow_decimal && !Number.isInteger(p.data.default_step)) return fail("Whole-number units need a whole-number step");
  const { error } = await supabase.from("units").upsert(p.data);
  if (error) return fail(msg(error));
  refresh();
  return { ok: true };
}

export async function deleteUnit(code: string): Promise<Result> {
  const { supabase } = await requireAdmin();
  const { count } = await supabase.from("products").select("id", { count: "exact", head: true }).eq("unit_code", code);
  if (count) return fail(`${count} product(s) still use this unit. Change them first.`);
  const { error } = await supabase.from("units").delete().eq("code", code);
  if (error) return fail(msg(error));
  refresh();
  return { ok: true };
}

// ---------------------------------------------------------------- customers & messages
export async function setUserRole(userId: string, role: "customer" | "admin"): Promise<Result> {
  const { supabase, user } = await requireAdmin();
  if (userId === user.id && role !== "admin") return fail("You cannot remove your own admin access");
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  if (error) return fail(msg(error));
  revalidatePath("/admin/customers");
  return { ok: true };
}

export async function listCustomerEmails(): Promise<Record<string, string>> {
  await requireAdmin();
  const admin = createAdminClient();
  const { data } = await admin.auth.admin.listUsers({ perPage: 1000 });
  return Object.fromEntries((data?.users ?? []).map((u) => [u.id, u.email ?? ""]));
}

export async function setMessageRead(id: string, is_read: boolean): Promise<Result> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("contact_messages").update({ is_read }).eq("id", id);
  if (error) return fail(msg(error));
  revalidatePath("/admin/messages");
  return { ok: true };
}

export async function deleteMessage(id: string): Promise<Result> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("contact_messages").delete().eq("id", id);
  if (error) return fail(msg(error));
  revalidatePath("/admin/messages");
  return { ok: true };
}
