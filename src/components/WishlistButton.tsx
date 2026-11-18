"use client";

import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { useWishlist } from "@/lib/wishlist-store";
import { useUI } from "@/lib/ui-store";

export default function WishlistButton({
  productId,
  variant = "icon",
}: {
  productId: string;
  variant?: "icon" | "full";
}) {
  const router = useRouter();
  const active = useWishlist((s) => s.ids.includes(productId));
  const toggle = useWishlist((s) => s.toggle);
  const toast = useUI((s) => s.toast);

  async function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const result = await toggle(productId);
    if (result === "login") {
      toast("Please sign in to save items to your wishlist");
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
    } else toast(result === "added" ? "Added to wishlist" : "Removed from wishlist");
  }

  if (variant === "full") {
    return (
      <button onClick={onClick} className="btn-outline" aria-pressed={active}>
        <Heart size={16} className={active ? "fill-gold text-gold" : ""} />
        {active ? "Saved to wishlist" : "Add to wishlist"}
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={active}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:scale-110"
    >
      <Heart size={17} className={active ? "fill-gold text-gold" : "text-ink"} />
    </button>
  );
}
