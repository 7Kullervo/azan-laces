"use client";

import { useEffect } from "react";
import { Check, X } from "lucide-react";
import { useWishlist } from "@/lib/wishlist-store";
import { useUI } from "@/lib/ui-store";
import { hydrateCart } from "@/lib/cart-store";

export default function Providers({ children }: { children: React.ReactNode }) {
  const load = useWishlist((s) => s.load);
  const toasts = useUI((s) => s.toasts);
  const dismiss = useUI((s) => s.dismiss);

  useEffect(() => {
    hydrateCart();
    load().catch(() => undefined);
  }, [load]);

  return (
    <>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[80] flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="fade-up pointer-events-auto flex max-w-sm items-center gap-3 rounded-full bg-ink px-5 py-3 text-sm text-ivory shadow-lg"
          >
            <Check size={16} className="shrink-0 text-gold-light" />
            <span>{t.message}</span>
            <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="opacity-70 hover:opacity-100">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
