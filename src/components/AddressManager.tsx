"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUI } from "@/lib/ui-store";
import { PROVINCES } from "./CheckoutForm";

export interface Address {
  id: string;
  label: string | null;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postal_code: string | null;
  is_default: boolean;
}

export default function AddressManager({ userId, addresses }: { userId: string; addresses: Address[] }) {
  const router = useRouter();
  const toast = useUI((s) => s.toast);
  const [busy, setBusy] = useState(false);

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    const f = new FormData(form);
    const supabase = createClient();
    const makeDefault = addresses.length === 0 || f.get("is_default") === "on";
    if (makeDefault) await supabase.from("addresses").update({ is_default: false }).eq("user_id", userId);
    const { error } = await supabase.from("addresses").insert({
      user_id: userId,
      label: String(f.get("label") ?? "").trim() || null,
      full_name: String(f.get("full_name")).trim(),
      phone: String(f.get("phone")).trim(),
      address: String(f.get("address")).trim(),
      city: String(f.get("city")).trim(),
      province: String(f.get("province")),
      postal_code: String(f.get("postal_code") ?? "").trim() || null,
      is_default: makeDefault,
    });
    setBusy(false);
    if (error) return toast("Could not save address");
    form.reset();
    toast("Address saved");
    router.refresh();
  }

  async function remove(id: string) {
    await createClient().from("addresses").delete().eq("id", id);
    toast("Address removed");
    router.refresh();
  }

  async function setDefault(id: string) {
    const supabase = createClient();
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", userId);
    await supabase.from("addresses").update({ is_default: true }).eq("id", id);
    router.refresh();
  }

  return (
    <div className="space-y-8">
      {addresses.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <li key={a.id} className="rounded-2xl border border-line bg-white p-5 text-sm">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold">{a.label || a.full_name}{a.is_default && <span className="badge ml-2 bg-gold-light text-gold-dark">Default</span>}</p>
                <button onClick={() => remove(a.id)} aria-label="Delete address" className="text-stone hover:text-red-700"><Trash2 size={16} /></button>
              </div>
              <p className="mt-2">{a.full_name} · {a.phone}</p>
              <p className="text-stone">{a.address}</p>
              <p className="text-stone">{a.city}, {a.province} {a.postal_code}</p>
              {!a.is_default && (
                <button onClick={() => setDefault(a.id)} className="mt-3 text-xs font-medium text-gold-dark underline">Make default</button>
              )}
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={add} className="grid gap-4 rounded-3xl border border-line bg-white p-6 sm:grid-cols-2 sm:p-8">
        <h2 className="text-2xl font-semibold sm:col-span-2">Add a new address</h2>
        <div><label className="label" htmlFor="label">Label (Home, Shop…)</label><input id="label" name="label" className="input" /></div>
        <div><label className="label" htmlFor="full_name">Full name</label><input id="full_name" name="full_name" required className="input" /></div>
        <div><label className="label" htmlFor="phone">Phone</label><input id="phone" name="phone" type="tel" required className="input" /></div>
        <div><label className="label" htmlFor="postal_code">Postal code</label><input id="postal_code" name="postal_code" className="input" /></div>
        <div className="sm:col-span-2"><label className="label" htmlFor="address">Address</label><textarea id="address" name="address" rows={2} required className="input" /></div>
        <div><label className="label" htmlFor="city">City</label><input id="city" name="city" required className="input" /></div>
        <div>
          <label className="label" htmlFor="province">Province</label>
          <select id="province" name="province" required defaultValue="" className="input">
            <option value="" disabled>Select province</option>
            {PROVINCES.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" name="is_default" className="accent-[#B8975A]" /> Make this my default address</label>
        <div className="sm:col-span-2"><button disabled={busy} className="btn-dark">{busy ? "Saving…" : "Save address"}</button></div>
      </form>
    </div>
  );
}
