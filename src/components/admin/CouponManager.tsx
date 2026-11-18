"use client";

import { useState } from "react";
import { deleteCoupon, saveCoupon } from "@/app/admin/actions";
import { Card, Check, Field, useAction } from "./ui";

export interface CouponRow {
  id: string;
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  min_order: number;
  usage_limit: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
}

const BLANK = { code: "", discount_type: "percent" as "percent" | "fixed", discount_value: "10", min_order: "0", usage_limit: "", expires_at: "", is_active: true };

export default function CouponManager({ coupons }: { coupons: CouponRow[] }) {
  const { run, pending, error } = useAction();
  const [f, setF] = useState(BLANK);
  const [editId, setEditId] = useState<string | undefined>();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    run(
      () =>
        saveCoupon({
          id: editId,
          code: f.code,
          discount_type: f.discount_type,
          discount_value: parseFloat(f.discount_value),
          min_order: parseFloat(f.min_order) || 0,
          usage_limit: f.usage_limit ? parseInt(f.usage_limit) : null,
          expires_at: f.expires_at ? new Date(f.expires_at + "T23:59:59").toISOString() : null,
          is_active: f.is_active,
        }),
      "Coupon saved",
      (r) => {
        if (r.ok) {
          setF(BLANK);
          setEditId(undefined);
        }
      }
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="mb-4 text-xl font-semibold">{editId ? "Edit coupon" : "Create coupon"}</h2>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-3">
          <Field label="Code"><input required value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} className="input uppercase" /></Field>
          <Field label="Type">
            <select value={f.discount_type} onChange={(e) => setF({ ...f, discount_type: e.target.value as "percent" | "fixed" })} className="input">
              <option value="percent">Percentage (%)</option>
              <option value="fixed">Fixed amount (Rs.)</option>
            </select>
          </Field>
          <Field label={f.discount_type === "percent" ? "Discount (%)" : "Discount (Rs.)"}><input required type="number" min={1} step="0.01" value={f.discount_value} onChange={(e) => setF({ ...f, discount_value: e.target.value })} className="input" /></Field>
          <Field label="Minimum order (Rs.)"><input type="number" min={0} value={f.min_order} onChange={(e) => setF({ ...f, min_order: e.target.value })} className="input" /></Field>
          <Field label="Usage limit" hint="Empty = unlimited"><input type="number" min={1} value={f.usage_limit} onChange={(e) => setF({ ...f, usage_limit: e.target.value })} className="input" /></Field>
          <Field label="Expires on" hint="Empty = never"><input type="date" value={f.expires_at} onChange={(e) => setF({ ...f, expires_at: e.target.value })} className="input" /></Field>
          <div className="flex items-center gap-4 sm:col-span-3">
            <Check label="Active" checked={f.is_active} onChange={(v) => setF({ ...f, is_active: v })} />
            <button disabled={pending} className="btn-dark">{editId ? "Update coupon" : "Create coupon"}</button>
            {editId && <button type="button" onClick={() => { setEditId(undefined); setF(BLANK); }} className="text-sm underline">Cancel</button>}
          </div>
          {error && <p className="text-sm text-red-700 sm:col-span-3">{error}</p>}
        </form>
      </Card>

      <div className="overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-line bg-cream/60 text-xs uppercase tracking-wider text-stone">
            <tr><th className="px-4 py-3">Code</th><th className="px-4 py-3">Discount</th><th className="px-4 py-3">Min order</th><th className="px-4 py-3">Used</th><th className="px-4 py-3">Expires</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {coupons.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-semibold">{c.code}</td>
                <td className="px-4 py-3">{c.discount_type === "percent" ? `${Number(c.discount_value)}%` : `Rs. ${Number(c.discount_value).toLocaleString("en-PK")}`}</td>
                <td className="px-4 py-3">Rs. {Number(c.min_order).toLocaleString("en-PK")}</td>
                <td className="px-4 py-3">{c.used_count}{c.usage_limit ? ` / ${c.usage_limit}` : ""}</td>
                <td className="px-4 py-3">{c.expires_at ? new Date(c.expires_at).toLocaleDateString("en-PK", { dateStyle: "medium" }) : "Never"}</td>
                <td className="px-4 py-3"><span className={`badge ${c.is_active ? "bg-emerald-100 text-emerald-800" : "bg-stone/20 text-stone"}`}>{c.is_active ? "Active" : "Off"}</span></td>
                <td className="px-4 py-3 text-right">
                  <button
                    className="mr-3 text-gold-dark underline"
                    onClick={() => {
                      setEditId(c.id);
                      setF({
                        code: c.code,
                        discount_type: c.discount_type,
                        discount_value: String(Number(c.discount_value)),
                        min_order: String(Number(c.min_order)),
                        usage_limit: c.usage_limit ? String(c.usage_limit) : "",
                        expires_at: c.expires_at ? c.expires_at.slice(0, 10) : "",
                        is_active: c.is_active,
                      });
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    Edit
                  </button>
                  <button disabled={pending} onClick={() => confirm(`Delete coupon ${c.code}?`) && run(() => deleteCoupon(c.id), "Coupon deleted")} className="text-red-700 underline">Delete</button>
                </td>
              </tr>
            ))}
            {!coupons.length && <tr><td colSpan={7} className="px-4 py-10 text-center text-stone">No coupons yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
