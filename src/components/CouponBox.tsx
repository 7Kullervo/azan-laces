"use client";

import { useState } from "react";
import { Tag, X } from "lucide-react";
import { useCart } from "@/lib/cart-store";

export default function CouponBox({ message, ok, checking }: { message: string; ok: boolean; checking: boolean }) {
  const code = useCart((s) => s.couponCode);
  const setCoupon = useCart((s) => s.setCoupon);
  const [value, setValue] = useState("");

  return (
    <div>
      {code ? (
        <div className="flex items-center justify-between rounded-xl border border-gold/50 bg-gold-light/40 px-4 py-2.5 text-sm">
          <span className="flex items-center gap-2 font-medium">
            <Tag size={15} className="text-gold-dark" /> {code.toUpperCase()}
          </span>
          <button onClick={() => setCoupon("")} aria-label="Remove coupon" className="text-stone hover:text-ink">
            <X size={16} />
          </button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (value.trim()) setCoupon(value.trim());
          }}
          className="flex gap-2"
        >
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Coupon code"
            aria-label="Coupon code"
            className="input uppercase"
          />
          <button type="submit" className="btn-dark !px-5">Apply</button>
        </form>
      )}
      {code && (checking ? (
        <p className="mt-2 text-xs text-stone">Checking coupon…</p>
      ) : message ? (
        <p className={`mt-2 text-xs ${ok ? "text-emerald-700" : "text-red-700"}`}>{message}</p>
      ) : null)}
    </div>
  );
}
