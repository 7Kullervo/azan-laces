"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { deleteUnit, saveSetting, saveUnit } from "@/app/admin/actions";
import type { Unit } from "@/lib/types";
import { Card, Check, Field, useAction } from "./ui";

export interface SettingsData {
  announcements: { enabled: boolean; messages: string[] };
  shipping: { flat_rate: number; free_over: number | null };
  payments: { cod_enabled: boolean; bank_transfer_enabled: boolean; bank_details: string };
  contact: Record<string, string | undefined>;
}

function Announcements({ initial }: { initial: SettingsData["announcements"] }) {
  const { run, pending, error } = useAction();
  const [enabled, setEnabled] = useState(initial.enabled);
  const [messages, setMessages] = useState<string[]>(initial.messages.length ? initial.messages : [""]);
  return (
    <Card className="space-y-4">
      <h2 className="text-xl font-semibold">Announcement bar</h2>
      <p className="text-sm text-stone">Promotional messages shown at the very top of the store. Several messages rotate automatically.</p>
      <Check label="Show announcement bar" checked={enabled} onChange={setEnabled} />
      {messages.map((m, i) => (
        <div key={i} className="flex gap-2">
          <input value={m} onChange={(e) => setMessages(messages.map((x, k) => (k === i ? e.target.value : x)))} className="input" placeholder="e.g. Free delivery on orders over Rs. 5,000" />
          <button type="button" aria-label="Remove message" onClick={() => setMessages(messages.filter((_, k) => k !== i))} className="px-2 text-stone hover:text-red-700"><Trash2 size={17} /></button>
        </div>
      ))}
      <div className="flex gap-3">
        <button type="button" onClick={() => setMessages([...messages, ""])} className="btn-outline !min-h-[38px] !px-4 !py-1.5"><Plus size={14} /> Add message</button>
        <button disabled={pending} onClick={() => run(() => saveSetting("announcements", { enabled, messages: messages.filter((m) => m.trim()) }), "Announcements saved")} className="btn-dark">Save</button>
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </Card>
  );
}

function Contact({ initial }: { initial: SettingsData["contact"] }) {
  const { run, pending, error } = useAction();
  const keys = ["business_name", "phone", "whatsapp", "email", "address", "hours", "map_embed", "facebook", "instagram", "tiktok"] as const;
  const [f, setF] = useState(() => Object.fromEntries(keys.map((k) => [k, initial[k] ?? ""])) as Record<(typeof keys)[number], string>);
  const input = (k: (typeof keys)[number], label: string, hint?: string, area = false) => (
    <Field label={label} hint={hint}>
      {area ? <textarea rows={3} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} className="input" /> : <input value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} className="input" />}
    </Field>
  );
  return (
    <Card className="space-y-4">
      <h2 className="text-xl font-semibold">Store contact &amp; WhatsApp</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {input("business_name", "Business name")}
        {input("phone", "Phone number")}
        {input("whatsapp", "WhatsApp number", "Digits only with country code, e.g. 923001234567")}
        {input("email", "Email address")}
        <div className="sm:col-span-2">{input("address", "Shop address", undefined, true)}</div>
        <div className="sm:col-span-2">{input("hours", "Business hours", "One line per entry", true)}</div>
        <div className="sm:col-span-2">{input("map_embed", "Google Maps embed URL", "In Google Maps: Share → Embed a map → copy the src=\"…\" link")}</div>
        {input("facebook", "Facebook URL")}
        {input("instagram", "Instagram URL")}
        {input("tiktok", "TikTok URL")}
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button disabled={pending} onClick={() => run(() => saveSetting("contact", f), "Contact details saved")} className="btn-dark">Save contact details</button>
    </Card>
  );
}

function Shipping({ initial }: { initial: SettingsData["shipping"] }) {
  const { run, pending, error } = useAction();
  const [flat, setFlat] = useState(String(initial.flat_rate));
  const [free, setFree] = useState(initial.free_over === null ? "" : String(initial.free_over));
  return (
    <Card className="space-y-4">
      <h2 className="text-xl font-semibold">Shipping charges</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Flat delivery charge (Rs.)"><input type="number" min={0} value={flat} onChange={(e) => setFlat(e.target.value)} className="input" /></Field>
        <Field label="Free delivery above (Rs.)" hint="Leave empty to never offer free delivery"><input type="number" min={0} value={free} onChange={(e) => setFree(e.target.value)} className="input" /></Field>
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button disabled={pending} onClick={() => run(() => saveSetting("shipping", { flat_rate: parseFloat(flat) || 0, free_over: free ? parseFloat(free) : null }), "Shipping saved")} className="btn-dark">Save shipping</button>
    </Card>
  );
}

function Payments({ initial }: { initial: SettingsData["payments"] }) {
  const { run, pending, error } = useAction();
  const [p, setP] = useState(initial);
  return (
    <Card className="space-y-4">
      <h2 className="text-xl font-semibold">Payment methods</h2>
      <Check label="Cash on Delivery" checked={p.cod_enabled} onChange={(v) => setP({ ...p, cod_enabled: v })} />
      <Check label="Bank Transfer" checked={p.bank_transfer_enabled} onChange={(v) => setP({ ...p, bank_transfer_enabled: v })} />
      <Field label="Bank account details" hint="Shown to the customer on the order confirmation page">
        <textarea rows={5} value={p.bank_details} onChange={(e) => setP({ ...p, bank_details: e.target.value })} className="input" />
      </Field>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button disabled={pending} onClick={() => run(() => saveSetting("payments", p), "Payment settings saved")} className="btn-dark">Save payment settings</button>
    </Card>
  );
}

function Units({ units }: { units: Unit[] }) {
  const { run, pending, error } = useAction();
  const [n, setN] = useState({ code: "", label: "", label_plural: "", allow_decimal: false, default_step: "1" });
  return (
    <Card className="space-y-4">
      <h2 className="text-xl font-semibold">Measurement units</h2>
      <p className="text-sm text-stone">These units can be chosen when adding a product. Add more at any time (Dozen, Meter, Roll…).</p>
      <ul className="divide-y divide-line rounded-xl border border-line text-sm">
        {units.map((u) => (
          <li key={u.code} className="flex items-center justify-between gap-3 px-4 py-2.5">
            <span><strong>{u.label}</strong> <span className="text-stone">/ {u.label_plural} · {u.allow_decimal ? `decimals, step ${Number(u.default_step)}` : "whole numbers"}</span></span>
            <button disabled={pending} aria-label={`Delete ${u.label}`} onClick={() => confirm(`Delete unit “${u.label}”?`) && run(() => deleteUnit(u.code), "Unit deleted")} className="text-stone hover:text-red-700"><Trash2 size={16} /></button>
          </li>
        ))}
      </ul>
      <form
        className="grid gap-3 sm:grid-cols-5"
        onSubmit={(e) => {
          e.preventDefault();
          run(() => saveUnit({ ...n, code: n.code.toLowerCase(), default_step: parseFloat(n.default_step) || 1 }), "Unit added", (r) => r.ok && setN({ code: "", label: "", label_plural: "", allow_decimal: false, default_step: "1" }));
        }}
      >
        <input required placeholder="code (dozen)" value={n.code} onChange={(e) => setN({ ...n, code: e.target.value })} className="input" aria-label="Unit code" />
        <input required placeholder="Label (Dozen)" value={n.label} onChange={(e) => setN({ ...n, label: e.target.value })} className="input" aria-label="Unit label" />
        <input required placeholder="Plural (Dozens)" value={n.label_plural} onChange={(e) => setN({ ...n, label_plural: e.target.value })} className="input" aria-label="Unit plural" />
        <input type="number" min={0.1} step="0.1" value={n.default_step} onChange={(e) => setN({ ...n, default_step: e.target.value })} className="input" aria-label="Default step" />
        <div className="flex items-center justify-between gap-2">
          <Check label="Decimals" checked={n.allow_decimal} onChange={(v) => setN({ ...n, allow_decimal: v })} />
          <button disabled={pending} className="btn-dark !px-4">Add</button>
        </div>
      </form>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </Card>
  );
}

export default function SettingsManager({ settings, units }: { settings: SettingsData; units: Unit[] }) {
  return (
    <div className="space-y-6">
      <Announcements initial={settings.announcements} />
      <Contact initial={settings.contact} />
      <Shipping initial={settings.shipping} />
      <Payments initial={settings.payments} />
      <Units units={units} />
    </div>
  );
}
