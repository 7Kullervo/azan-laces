import type { Product, Unit } from "./types";

/** Format a Pakistani Rupee amount, e.g. 1250 -> "Rs. 1,250" */
export function formatPKR(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  const hasDecimals = rounded % 1 !== 0;
  return (
    "Rs. " +
    rounded.toLocaleString("en-PK", {
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: 2,
    })
  );
}

/** Effective selling price (sale price wins when lower than regular). */
export function effectivePrice(p: Pick<Product, "price" | "sale_price">): number {
  return p.sale_price !== null && p.sale_price < p.price ? p.sale_price : p.price;
}

export function discountPercent(p: Pick<Product, "price" | "sale_price">): number {
  if (p.sale_price === null || p.sale_price >= p.price) return 0;
  return Math.round(((p.price - p.sale_price) / p.price) * 100);
}

/** "Rs. 150 / Yard" — always uses the product's own unit, never "per item". */
export function formatPricePerUnit(price: number, unit: Pick<Unit, "label">): string {
  return `${formatPKR(price)} / ${unit.label}`;
}

/** Singular vs plural unit label for a quantity: 1 Yard, 5 Yards, 0.5 Yard */
export function unitLabelFor(
  qty: number,
  unit: Pick<Unit, "label" | "label_plural">
): string {
  return qty === 1 || qty < 1 ? unit.label : unit.label_plural;
}

/** "5 Yards", "10 Pieces", "2 Bottles", "0.5 Yard" */
export function formatQuantity(
  qty: number,
  unit: Pick<Unit, "label" | "label_plural">
): string {
  return `${formatQtyNumber(qty)} ${unitLabelFor(qty, unit)}`;
}

export function formatQtyNumber(qty: number): string {
  return Number.isInteger(qty) ? String(qty) : String(Math.round(qty * 100) / 100);
}

/** Snap a quantity to the product's step and minimum; whole numbers when decimals not allowed. */
export function normalizeQty(
  qty: number,
  opts: { step: number; minQty: number; allowDecimal: boolean; max?: number }
): number {
  const step = opts.allowDecimal ? opts.step : Math.max(1, Math.round(opts.step));
  let q = Number.isFinite(qty) ? qty : opts.minQty;
  q = Math.round(q / step) * step;
  // avoid float drift such as 0.30000000000000004
  q = Math.round(q * 1000) / 1000;
  if (q < opts.minQty) q = opts.minQty;
  if (opts.max !== undefined && q > opts.max) {
    q = Math.floor(opts.max / step) * step;
    q = Math.round(q * 1000) / 1000;
  }
  return q;
}

/** Line subtotal, rounded to paisa. */
export function lineTotal(unitPrice: number, qty: number): number {
  return Math.round(unitPrice * qty * 100) / 100;
}
