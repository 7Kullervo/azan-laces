"use client";

import { useState } from "react";
import { deleteBanner, saveBanner } from "@/app/admin/actions";
import ImageUploader from "./ImageUploader";
import { Card, Check, Field, useAction } from "./ui";

export interface BannerRow {
  id?: string;
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  image_url: string;
  cta_label: string | null;
  cta_href: string | null;
  cta2_label: string | null;
  cta2_href: string | null;
  sort_order: number;
  is_active: boolean;
}

const BLANK: BannerRow = { eyebrow: "", title: "", subtitle: "", image_url: "", cta_label: "Shop Now", cta_href: "/collections/all", cta2_label: "", cta2_href: "", sort_order: 99, is_active: true };

function BannerForm({ initial }: { initial: BannerRow }) {
  const { run, pending, error } = useAction();
  const [b, setB] = useState(initial);
  const s = (k: keyof BannerRow, v: string | number | boolean) => setB({ ...b, [k]: v });
  const str = (v: string | null) => v ?? "";

  return (
    <Card className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Small heading (optional)"><input value={str(b.eyebrow)} onChange={(e) => s("eyebrow", e.target.value)} className="input" /></Field>
        <Field label="Headline"><input value={b.title} onChange={(e) => s("title", e.target.value)} className="input" /></Field>
        <div className="sm:col-span-2"><Field label="Supporting text"><textarea rows={2} value={str(b.subtitle)} onChange={(e) => s("subtitle", e.target.value)} className="input" /></Field></div>
        <Field label="Button 1 label"><input value={str(b.cta_label)} onChange={(e) => s("cta_label", e.target.value)} className="input" /></Field>
        <Field label="Button 1 link"><input value={str(b.cta_href)} onChange={(e) => s("cta_href", e.target.value)} placeholder="/collections/laces" className="input" /></Field>
        <Field label="Button 2 label"><input value={str(b.cta2_label)} onChange={(e) => s("cta2_label", e.target.value)} className="input" /></Field>
        <Field label="Button 2 link"><input value={str(b.cta2_href)} onChange={(e) => s("cta2_href", e.target.value)} className="input" /></Field>
        <Field label="Display order"><input type="number" min={0} value={b.sort_order} onChange={(e) => s("sort_order", parseInt(e.target.value) || 0)} className="input" /></Field>
        <div className="flex items-end pb-2"><Check label="Active" checked={b.is_active} onChange={(v) => s("is_active", v)} /></div>
      </div>
      <div>
        <p className="label">Banner image (wide, about 1600 × 700)</p>
        <ImageUploader images={b.image_url ? [b.image_url] : []} onChange={(u) => s("image_url", u[0] ?? "")} folder="banners" multiple={false} />
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <div className="flex gap-3">
        <button disabled={pending} onClick={() => run(() => saveBanner({ ...b, id: b.id, eyebrow: str(b.eyebrow), subtitle: str(b.subtitle), cta_label: str(b.cta_label), cta_href: str(b.cta_href), cta2_label: str(b.cta2_label), cta2_href: str(b.cta2_href) }), "Banner saved", (r) => r.ok && !b.id && setB(BLANK))} className="btn-dark">
          {b.id ? "Save banner" : "Add banner"}
        </button>
        {b.id && (
          <button disabled={pending} onClick={() => confirm("Delete this banner?") && run(() => deleteBanner(b.id!), "Banner deleted")} className="text-sm text-red-700 underline">Delete</button>
        )}
      </div>
    </Card>
  );
}

export default function BannerManager({ banners }: { banners: BannerRow[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-3 text-xl font-semibold">Add a new banner</h2>
        <BannerForm initial={BLANK} />
      </div>
      <h2 className="text-xl font-semibold">Current banners</h2>
      {banners.map((b) => <BannerForm key={b.id} initial={b} />)}
      {!banners.length && <p className="text-sm text-stone">No banners yet. The homepage hero will be empty until you add one.</p>}
    </div>
  );
}
