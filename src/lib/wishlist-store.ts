"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

interface WishlistState {
  ids: string[];
  loggedIn: boolean;
  loaded: boolean;
  load: () => Promise<void>;
  toggle: (productId: string) => Promise<"added" | "removed" | "login">;
}

/** Wishlist is stored in the database for signed-in customers. Guests are asked to sign in. */
export const useWishlist = create<WishlistState>((set, get) => ({
  ids: [],
  loggedIn: false,
  loaded: false,
  load: async () => {
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      set({ ids: [], loggedIn: false, loaded: true });
      return;
    }
    const { data } = await supabase.from("wishlists").select("product_id");
    set({ ids: (data ?? []).map((r) => r.product_id), loggedIn: true, loaded: true });
  },
  toggle: async (productId) => {
    if (!get().loggedIn) return "login";
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return "login";
    if (get().ids.includes(productId)) {
      set({ ids: get().ids.filter((i) => i !== productId) });
      await supabase.from("wishlists").delete().eq("product_id", productId).eq("user_id", auth.user.id);
      return "removed";
    }
    set({ ids: [...get().ids, productId] });
    await supabase.from("wishlists").insert({ user_id: auth.user.id, product_id: productId });
    return "added";
  },
}));
