"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { orderToken } from "@/lib/token";

export interface CouponPreview {
  ok: boolean;
  discount: number;
  message: string;
}

/** Validates a coupon against the REAL subtotal calculated from database prices. */
export async function previewCoupon(
  code: string,
  items: { productId: string; qty: number }[]
): Promise<CouponPreview> {
  const trimmed = code.trim();
  if (!trimmed) return { ok: false, discount: 0, message: "Enter a coupon code" };
  const admin = createAdminClient();

  const subtotal = await serverSubtotal(items);
  const { data: c } = await admin.from("coupons").select("*").ilike("code", trimmed).eq("is_active", true).maybeSingle();

  if (!c) return { ok: false, discount: 0, message: "This coupon code is not valid" };
  if (c.expires_at && new Date(c.expires_at) < new Date()) return { ok: false, discount: 0, message: "This coupon has expired" };
  if (c.usage_limit !== null && c.used_count >= c.usage_limit) return { ok: false, discount: 0, message: "This coupon has reached its usage limit" };
  if (subtotal < Number(c.min_order)) {
    return { ok: false, discount: 0, message: `Minimum order of Rs. ${Number(c.min_order).toLocaleString("en-PK")} required` };
  }
  const value = Number(c.discount_value);
  const discount =
    c.discount_type === "percent"
      ? Math.round(subtotal * Math.min(value, 100)) / 100
      : Math.min(value, subtotal);
  return { ok: true, discount, message: `Coupon ${c.code.toUpperCase()} applied` };
}

async function serverSubtotal(items: { productId: string; qty: number }[]): Promise<number> {
  if (!items.length) return 0;
  const admin = createAdminClient();
  const { data } = await admin
    .from("products")
    .select("id,price,sale_price")
    .in("id", items.map((i) => i.productId));
  const map = new Map((data ?? []).map((p) => [p.id, p]));
  let sum = 0;
  for (const it of items) {
    const p = map.get(it.productId);
    if (!p) continue;
    const price = p.sale_price !== null && Number(p.sale_price) < Number(p.price) ? Number(p.sale_price) : Number(p.price);
    sum += Math.round(price * it.qty * 100) / 100;
  }
  return Math.round(sum * 100) / 100;
}

const orderSchema = z.object({
  items: z
    .array(z.object({ productId: z.string().uuid(), qty: z.number().positive().max(100000) }))
    .min(1, "Your cart is empty")
    .max(100),
  name: z.string().trim().min(2, "Enter your full name").max(120),
  phone: z
    .string()
    .trim()
    .regex(/^[+0-9()\-\s]{10,18}$/, "Enter a valid phone number"),
  email: z.string().trim().email("Enter a valid email address").max(200),
  address: z.string().trim().min(8, "Enter your complete shipping address").max(400),
  city: z.string().trim().min(2, "Enter your city").max(80),
  province: z.string().trim().min(2, "Select your province").max(80),
  postalCode: z.string().trim().max(12).optional().default(""),
  notes: z.string().trim().max(600).optional().default(""),
  payment: z.enum(["cod", "bank_transfer"]),
  coupon: z.string().trim().max(40).optional().default(""),
});

export type PlaceOrderInput = z.input<typeof orderSchema>;
export type PlaceOrderResult =
  | { ok: true; orderNumber: string; token: string }
  | { ok: false; error: string; field?: string };

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const parsed = orderSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: issue.message, field: String(issue.path[0] ?? "") };
  }
  const d = parsed.data;
  const admin = createAdminClient();

  // Payment method must be enabled in store settings
  const { data: payRow } = await admin.from("store_settings").select("value").eq("key", "payments").maybeSingle();
  const pay = (payRow?.value ?? { cod_enabled: true, bank_transfer_enabled: false }) as {
    cod_enabled: boolean;
    bank_transfer_enabled: boolean;
  };
  if ((d.payment === "cod" && !pay.cod_enabled) || (d.payment === "bank_transfer" && !pay.bank_transfer_enabled)) {
    return { ok: false, error: "This payment method is not available", field: "payment" };
  }

  // Merge duplicate lines
  const merged = new Map<string, number>();
  d.items.forEach((i) => merged.set(i.productId, (merged.get(i.productId) ?? 0) + i.qty));

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  const { data, error } = await admin.rpc("place_order", {
    p_items: [...merged].map(([product_id, quantity]) => ({ product_id, quantity })),
    p_customer: {
      name: d.name,
      phone: d.phone,
      email: d.email,
      address: d.address,
      city: d.city,
      province: d.province,
      postal_code: d.postalCode,
      notes: d.notes,
    },
    p_payment: d.payment,
    p_coupon: d.coupon || null,
    p_user: auth.user?.id ?? null,
  });

  if (error) {
    // Friendly message from the database function (stock, step, coupon, etc.)
    return { ok: false, error: error.message.replace(/^.*?exception:\s*/i, "") };
  }
  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.order_number) return { ok: false, error: "Could not place your order. Please try again." };

  return { ok: true, orderNumber: row.order_number, token: orderToken(row.order_number) };
}

export async function trackOrder(orderNumber: string, phone: string) {
  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("*, items:order_items(*)")
    .ilike("order_number", orderNumber.trim())
    .maybeSingle();
  const digits = (s: string) => s.replace(/\D/g, "").slice(-10);
  if (!order || digits(order.phone) !== digits(phone)) return null;
  return order;
}

/** Current price / stock / unit for cart lines, so the cart never shows stale prices. */
export async function refreshCartLines(ids: string[]) {
  if (!ids.length) return [];
  const admin = createAdminClient();
  const { data } = await admin
    .from("products")
    .select("id,price,sale_price,stock,step,min_qty,is_active,unit:units(label,label_plural,allow_decimal)")
    .in("id", ids);
  return (data ?? []).map((p) => {
    const unit = (Array.isArray(p.unit) ? p.unit[0] : p.unit) as { label: string; label_plural: string; allow_decimal: boolean };
    const price = p.sale_price !== null && Number(p.sale_price) < Number(p.price) ? Number(p.sale_price) : Number(p.price);
    return {
      id: p.id as string,
      unitPrice: price,
      stock: Number(p.stock),
      step: Number(p.step),
      minQty: Number(p.min_qty),
      active: p.is_active as boolean,
      unitLabel: unit.label,
      unitLabelPlural: unit.label_plural,
      allowDecimal: unit.allow_decimal,
    };
  });
}

const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(120),
  email: z.string().trim().email("Enter a valid email").max(200),
  phone: z.string().trim().max(30).optional().default(""),
  message: z.string().trim().min(5, "Please write a short message").max(3000),
});

export async function sendContactMessage(input: z.input<typeof contactSchema>): Promise<{ ok: boolean; error?: string }> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { error } = await createAdminClient().from("contact_messages").insert(parsed.data);
  return error ? { ok: false, error: "Could not send your message. Please try WhatsApp instead." } : { ok: true };
}
