import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/** Signed token so a guest can open their own order confirmation without an account. */
export function orderToken(orderNumber: string): string {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "dev-secret";
  return createHmac("sha256", secret).update(orderNumber).digest("hex").slice(0, 24);
}

export function verifyOrderToken(orderNumber: string, token: string | undefined): boolean {
  if (!token) return false;
  const expected = Buffer.from(orderToken(orderNumber));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}
