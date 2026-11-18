"use client";

import { useState, useTransition } from "react";
import { sendContactMessage } from "@/app/actions/shop";

export default function ContactForm() {
  const [pending, start] = useTransition();
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    start(async () => {
      const res = await sendContactMessage({
        name: String(f.get("name")),
        email: String(f.get("email")),
        phone: String(f.get("phone") ?? ""),
        message: String(f.get("message")),
      });
      if (res.ok) {
        form.reset();
        setStatus({ ok: true, text: "Thank you! Your message has been sent. We'll get back to you soon." });
      } else setStatus({ ok: false, text: res.error ?? "Something went wrong." });
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-line bg-white p-6 sm:p-8">
      <h2 className="text-2xl font-semibold">Send us a message</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label" htmlFor="c-name">Name</label><input id="c-name" name="name" required className="input" /></div>
        <div><label className="label" htmlFor="c-phone">Phone</label><input id="c-phone" name="phone" type="tel" className="input" /></div>
      </div>
      <div><label className="label" htmlFor="c-email">Email</label><input id="c-email" name="email" type="email" required className="input" /></div>
      <div><label className="label" htmlFor="c-msg">Message</label><textarea id="c-msg" name="message" rows={5} required className="input" /></div>
      {status && (
        <p role="status" className={`rounded-xl px-4 py-2.5 text-sm ${status.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>{status.text}</p>
      )}
      <button disabled={pending} className="btn-dark">{pending ? "Sending…" : "Send message"}</button>
    </form>
  );
}
