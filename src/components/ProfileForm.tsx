"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUI } from "@/lib/ui-store";

export default function ProfileForm({ userId, name, phone }: { userId: string; name: string; phone: string }) {
  const [busy, setBusy] = useState(false);
  const toast = useUI((s) => s.toast);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const f = new FormData(e.currentTarget);
    const { error } = await createClient()
      .from("profiles")
      .update({ full_name: String(f.get("name")).trim(), phone: String(f.get("phone")).trim() })
      .eq("id", userId);
    setBusy(false);
    toast(error ? "Could not save your profile" : "Profile saved");
  }

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-4 rounded-3xl border border-line bg-white p-6 sm:p-8">
      <h2 className="text-2xl font-semibold">Profile details</h2>
      <div>
        <label className="label" htmlFor="name">Full name</label>
        <input id="name" name="name" defaultValue={name} className="input" required />
      </div>
      <div>
        <label className="label" htmlFor="phone">Phone</label>
        <input id="phone" name="phone" type="tel" defaultValue={phone} className="input" />
      </div>
      <button disabled={busy} className="btn-dark">{busy ? "Saving…" : "Save changes"}</button>
    </form>
  );
}
