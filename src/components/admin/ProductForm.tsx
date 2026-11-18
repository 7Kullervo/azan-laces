"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { deleteProduct, saveProduct } from "@/app/admin/actions";
import type { Category, Unit } from "@/lib/types";
import { effectivePrice, formatPKR, formatPricePerUnit } from "@/lib/units";
import ImageUploader from "./ImageUploader";
import { Card, Check, Field, useAction } from "./ui";

export interface ProductFormData {
  id?: string;
  name: string;
  sku: string;
  slug: string;
  description: string;
  price: string;
  sale_price: string;
  unit_code: string;
  step: string;
  min_qty: string;
  stock: string;
  low_stock_threshold: string;
  category_id: string;
  subcategory_id: string;
  colour: string;
  material: string;
  specs: { label: string; value: string }[];
  is_featured: boolean;
  is_best_seller: boolean;
  is_new: boolean;
  is_active: boolean;
  images: string[];
}


/** Suggested spec labels per category so the owner can add them in one click. */
const SPEC_SUGGESTIONS: Record<string, string[]> = {
  laces: ["Lace width", "Lace length", "Design", "Pattern"],
  buttons: ["Button diameter", "Design"],
  "sewing-supplies": ["Bottle size", "Brand", "Size"],
  "tailoring-accessories": ["Ruler length", "Measurement type"],
};

export default function ProductForm({
  initial,
  categories,
  units,
}: {
  initial: ProductFormData;
  categories: Category[];
  units: Unit[];
}) {
  const router = useRouter();
  const { run, pending, error } = useAction();
  const [f, setF] = useState(initial);
  const set = <K extends keyof ProductFormData>(k: K, v: ProductFormData[K]) => setF((p) => ({ ...p, [k]: v }));

  const unit = units.find((u) => u.code === f.unit_code);
  const category = categories.find((c) => c.id === f.category_id);
  const suggestions = (category && SPEC_SUGGESTIONS[category.slug]) ?? [];
  const price = parseFloat(f.price) || 0;
  const sale = f.sale_price ? parseFloat(f.sale_price) : null;

  function changeUnit(code: string) {
    const u = units.find((x) => x.code === code);
    setF((p) => ({
      ...p,
      unit_code: code,
      step: String(u?.default_step ?? 1),
      min_qty: u && !u.allow_decimal ? String(Math.max(1, Math.round(parseFloat(p.min_qty) || 1))) : p.min_qty,
    }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    run(
      () =>
        saveProduct({
          id: f.id,
          name: f.name,
          sku: f.sku,
          slug: f.slug,
          description: f.description,
          price: parseFloat(f.price),
          sale_price: f.sale_price ? parseFloat(f.sale_price) : null,
          unit_code: f.unit_code,
          step: parseFloat(f.step),
          min_qty: parseFloat(f.min_qty),
          stock: parseFloat(f.stock),
          low_stock_threshold: parseFloat(f.low_stock_threshold) || 0,
          category_id: f.category_id || null,
          subcategory_id: f.subcategory_id || null,
          colour: f.colour,
          material: f.material,
          specs: f.specs.filter((s) => s.label.trim() && s.value.trim()),
          is_featured: f.is_featured,
          is_best_seller: f.is_best_seller,
          is_new: f.is_new,
          is_active: f.is_active,
          images: f.images,
        }),
      "Product saved",
      (r) => r.ok && router.push("/admin/products")
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <Card className="space-y-4">
        <h2 className="text-xl font-semibold">Basic information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Product name"><input required value={f.name} onChange={(e) => set("name", e.target.value)} className="input" /></Field>
          </div>
          <Field label="SKU / product code" hint="Example: L001, B001, O001"><input required value={f.sku} onChange={(e) => set("sku", e.target.value)} className="input" /></Field>
          <Field label="URL slug" hint="Leave empty to generate from the name"><input value={f.slug} onChange={(e) => set("slug", e.target.value)} className="input" /></Field>
          <div className="sm:col-span-2">
            <Field label="Description"><textarea rows={4} value={f.description} onChange={(e) => set("description", e.target.value)} className="input" /></Field>
          </div>
          <Field label="Category">
            <select value={f.category_id} onChange={(e) => setF((p) => ({ ...p, category_id: e.target.value, subcategory_id: "" }))} className="input">
              <option value="">No category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Subcategory">
            <select value={f.subcategory_id} onChange={(e) => set("subcategory_id", e.target.value)} disabled={!category} className="input">
              <option value="">None</option>
              {category?.children?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
        </div>
      </Card>

      <Card className="space-y-4">
        <h2 className="text-xl font-semibold">Selling unit, pricing &amp; stock</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Selling unit" hint="Shown everywhere: price, cart, checkout and orders">
            <select value={f.unit_code} onChange={(e) => changeUnit(e.target.value)} required className="input">
              {units.map((u) => <option key={u.code} value={u.code}>{u.label}</option>)}
            </select>
          </Field>
          <Field label={`Price per ${unit?.label ?? "unit"} (Rs.)`}>
            <input required type="number" min={0} step="0.01" value={f.price} onChange={(e) => set("price", e.target.value)} className="input" />
          </Field>
          <Field label="Discounted price (Rs.)" hint="Optional, must be lower than the price">
            <input type="number" min={0} step="0.01" value={f.sale_price} onChange={(e) => set("sale_price", e.target.value)} className="input" />
          </Field>
          <Field label={`Quantity step (${unit?.label_plural ?? "units"})`} hint={unit?.allow_decimal ? "Use 0.5 for half-yard steps, 1 for whole yards" : "Whole numbers only for this unit"}>
            <input required type="number" min={unit?.allow_decimal ? 0.1 : 1} step={unit?.allow_decimal ? "0.1" : "1"} value={f.step} onChange={(e) => set("step", e.target.value)} className="input" />
          </Field>
          <Field label="Minimum order quantity">
            <input required type="number" min={unit?.allow_decimal ? 0.1 : 1} step={unit?.allow_decimal ? "0.1" : "1"} value={f.min_qty} onChange={(e) => set("min_qty", e.target.value)} className="input" />
          </Field>
          <Field label={`Stock (${unit?.label_plural ?? "units"})`}>
            <input required type="number" min={0} step={unit?.allow_decimal ? "0.1" : "1"} value={f.stock} onChange={(e) => set("stock", e.target.value)} className="input" />
          </Field>
          <Field label="Low-stock alert at">
            <input type="number" min={0} value={f.low_stock_threshold} onChange={(e) => set("low_stock_threshold", e.target.value)} className="input" />
          </Field>
        </div>
        {price > 0 && unit && (
          <p className="rounded-xl bg-cream px-4 py-3 text-sm">
            Customers will see: <strong>{formatPricePerUnit(effectivePrice({ price, sale_price: sale }), unit)}</strong>
            {sale !== null && sale < price && <span className="text-stone"> (was {formatPKR(price)})</span>}
          </p>
        )}
      </Card>

      <Card className="space-y-4">
        <h2 className="text-xl font-semibold">Images</h2>
        <p className="text-sm text-stone">The first image is the main product image. Use the arrows to reorder.</p>
        <ImageUploader images={f.images} onChange={(v) => set("images", v)} folder="products" />
      </Card>

      <Card className="space-y-4">
        <h2 className="text-xl font-semibold">Filters &amp; specifications</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Colour"><input value={f.colour} onChange={(e) => set("colour", e.target.value)} className="input" /></Field>
          <Field label="Material"><input value={f.material} onChange={(e) => set("material", e.target.value)} className="input" /></Field>
        </div>
        <div className="space-y-2">
          <p className="label">Specifications (optional)</p>
          {f.specs.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input placeholder="Label (e.g. Lace width)" value={s.label} onChange={(e) => set("specs", f.specs.map((x, k) => (k === i ? { ...x, label: e.target.value } : x)))} className="input" />
              <input placeholder="Value (e.g. 2 inch)" value={s.value} onChange={(e) => set("specs", f.specs.map((x, k) => (k === i ? { ...x, value: e.target.value } : x)))} className="input" />
              <button type="button" aria-label="Remove specification" onClick={() => set("specs", f.specs.filter((_, k) => k !== i))} className="px-2 text-stone hover:text-red-700"><Trash2 size={17} /></button>
            </div>
          ))}
          <div className="flex flex-wrap gap-2 pt-1">
            <button type="button" onClick={() => set("specs", [...f.specs, { label: "", value: "" }])} className="btn-outline !min-h-[38px] !px-4 !py-1.5"><Plus size={14} /> Add specification</button>
            {suggestions.filter((l) => !f.specs.some((s) => s.label === l)).map((l) => (
              <button key={l} type="button" onClick={() => set("specs", [...f.specs, { label: l, value: "" }])} className="rounded-full border border-dashed border-gold px-3 text-xs text-gold-dark hover:bg-gold-light/50">+ {l}</button>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-xl font-semibold">Visibility &amp; labels</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Check label="Active (visible in store)" checked={f.is_active} onChange={(v) => set("is_active", v)} />
          <Check label="Featured product" checked={f.is_featured} onChange={(v) => set("is_featured", v)} />
          <Check label="Best seller" checked={f.is_best_seller} onChange={(v) => set("is_best_seller", v)} />
          <Check label="New arrival" checked={f.is_new} onChange={(v) => set("is_new", v)} />
        </div>
      </Card>

      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <button disabled={pending} className="btn-dark px-10">{pending ? "Saving…" : f.id ? "Save changes" : "Create product"}</button>
        <Link href="/admin/products" className="btn-outline">Cancel</Link>
        {f.id && (
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (confirm("Delete this product permanently? Past orders keep their details.")) {
                run(() => deleteProduct(f.id!), "Product deleted", (r) => r.ok && router.push("/admin/products"));
              }
            }}
            className="ml-auto text-sm text-red-700 underline"
          >
            Delete product
          </button>
        )}
      </div>
    </form>
  );
}
