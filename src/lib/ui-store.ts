"use client";

import { create } from "zustand";

interface Toast {
  id: number;
  message: string;
}

interface UIState {
  toasts: Toast[];
  toast: (message: string) => void;
  dismiss: (id: number) => void;
}

let counter = 0;

export const useUI = create<UIState>((set, get) => ({
  toasts: [],
  toast: (message) => {
    const id = ++counter;
    set({ toasts: [...get().toasts, { id, message }] });
    setTimeout(() => get().dismiss(id), 3200);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));
