"use client";

import { usePathname } from "next/navigation";

/** Hides storefront chrome (header, footer, cart drawer…) on admin pages. */
export default function ChromeGate({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  if (path.startsWith("/admin")) return null;
  return <>{children}</>;
}
