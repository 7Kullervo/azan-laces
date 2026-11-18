"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Banknote, Landmark } from "lucide-react";
import { placeOrder } from "@/app/actions/shop";
import { useCart } from "@/lib/cart-store";
import { useSyncCart, useTotals, type Shipping } from "@/lib/use-totals";
import { formatPKR } from "@/lib/units";
import CouponBox from "./CouponBox";
import OrderSummary from "./OrderSummary";

export const PROVINCES = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Azad Jammu & Kashmir",
  "Gilgit-Baltistan",
];

export interface Prefill {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
}

interface Props {
  shipping: Shipping;
  payments: { cod_enabled: boolean; bank_transfer_enabled: boolean; bank_details: string };
  prefill: Prefill;
}

// Defined at module level: a component declared inside CheckoutForm gets a new identity on every
// render, which remounts the inputs and wipes what the customer typed after a validation error.
function Field({ name, label, error, children }: { name: string; label: string; error: string | null; children: React.ReactNode }) {
  return (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  );
}

export default function CheckoutForm({ shipping, payments, prefill }: Props) {
  const router = useRouter();
  const hydrated = useCart((s) => s.hydrated);
  const clear = useCart((s) => s.clear);
  const { synced, removed } = useSyncCart();
  const t = useTotals(shipping);
  const [pending, start] = useTransition();
  const [error, setError] = useState<{ message: string; field?: string } | null>(null);
  const [payment, setPayment] = useState<"cod" | "bank_transfer">(payments.cod_enabled ? "cod" : "bank_transfer");

  if (!hydrated || !synced) {
    return (
      <div className="container-page py-12">
        <div className="skeleton h-96 rounded-3xl" />
      </div>
    );
  }

  if (t.lines.length === 0) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-4xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-stone">Add some products before checking out.</p>
        <Link href="/collections/all" className="btn-dark mt-6">Continue shopping</Link>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "");
    start(async () => {
      const res = await placeOrder({
        items: t.lines.map((l) => ({ productId: l.productId, qty: l.qty })),
        name: get("name"),
        phone: get("phone"),
        email: get("email"),
        address: get("address"),
        city: get("city"),
        province: get("province"),
        postalCode: get("postalCode"),
        notes: get("notes"),
        payment,
        coupon: t.coupon.ok ? t.couponCode : "",
      });
      if (!res.ok) {
        setError({ message: res.error, field: res.field });
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      clear();
      router.push(`/order-confirmation/${res.orderNumber}?t=${res.token}`);
    });
  }

  const fieldErr = (name: string) => (error?.field === name ? error.message : null);

  return (
    <div className="container-page py-10">
      <h1 className="text-4xl font-semibold sm:text-5xl">Checkout</h1>
      {removed.length > 0 && (
        <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Removed because they are no longer available: {removed.join(", ")}.
        </p>
      )}
      {error && !error.field && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{error.message}</p>
      )}

      <form onSubmit={onSubmit} className="mt-8 grid gap-8 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <section className="rounded-3xl border border-line bg-white p-5 sm:p-7">
            <h2 className="mb-5 text-2xl font-semibold">Customer information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field name="name" error={fieldErr("name")} label="Full name">
                  <input id="name" name="name" required defaultValue={prefill.name} autoComplete="name" className="input" />
                </Field>
              </div>
              <Field name="phone" error={fieldErr("phone")} label="Phone number">
                <input id="phone" name="phone" type="tel" required defaultValue={prefill.phone} autoComplete="tel" placeholder="03XX XXXXXXX" className="input" />
              </Field>
              <Field name="email" error={fieldErr("email")} label="Email address">
                <input id="email" name="email" type="email" required defaultValue={prefill.email} autoComplete="email" className="input" />
              </Field>
              <div className="sm:col-span-2">
                <Field name="address" error={fieldErr("address")} label="Complete shipping address">
                  <textarea id="address" name="address" required rows={3} defaultValue={prefill.address} autoComplete="street-address" className="input" />
                </Field>
              </div>
              <Field name="city" error={fieldErr("city")} label="City">
                <input id="city" name="city" required defaultValue={prefill.city} autoComplete="address-level2" className="input" />
              </Field>
              <Field name="province" error={fieldErr("province")} label="Province">
                <select id="province" name="province" required defaultValue={prefill.province ?? ""} className="input">
                  <option value="" disabled>Select province</option>
                  {PROVINCES.map((p) => <option key={p}>{p}</option>)}
                </select>
              </Field>
              <Field name="postalCode" error={fieldErr("postalCode")} label="Postal code">
                <input id="postalCode" name="postalCode" defaultValue={prefill.postalCode} autoComplete="postal-code" className="input" />
              </Field>
              <div className="sm:col-span-2">
                <Field name="notes" error={fieldErr("notes")} label="Additional order notes (optional)">
                  <textarea id="notes" name="notes" rows={2} placeholder="Colour preferences, delivery instructions…" className="input" />
                </Field>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-line bg-white p-5 sm:p-7">
            <h2 className="mb-5 text-2xl font-semibold">Payment method</h2>
            <div className="space-y-3">
              {payments.cod_enabled && (
                <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${payment === "cod" ? "border-gold bg-gold-light/30" : "border-line"}`}>
                  <input type="radio" name="payment" checked={payment === "cod"} onChange={() => setPayment("cod")} className="mt-1 accent-[#B8975A]" />
                  <span>
                    <span className="flex items-center gap-2 font-medium"><Banknote size={17} /> Cash on Delivery</span>
                    <span className="text-sm text-stone">Pay in cash when your order arrives.</span>
                  </span>
                </label>
              )}
              {payments.bank_transfer_enabled && (
                <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${payment === "bank_transfer" ? "border-gold bg-gold-light/30" : "border-line"}`}>
                  <input type="radio" name="payment" checked={payment === "bank_transfer"} onChange={() => setPayment("bank_transfer")} className="mt-1 accent-[#B8975A]" />
                  <span>
                    <span className="flex items-center gap-2 font-medium"><Landmark size={17} /> Bank Transfer</span>
                    <span className="text-sm text-stone">Transfer to our bank account. Details are shown after you place the order.</span>
                  </span>
                </label>
              )}
              {!payments.cod_enabled && !payments.bank_transfer_enabled && (
                <p className="text-sm text-red-700">No payment method is currently available. Please contact us.</p>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-5 lg:col-span-2">
          <div className="rounded-3xl border border-line bg-white p-5 sm:p-6">
            <h2 className="mb-3 text-xl font-semibold">Coupon code</h2>
            <CouponBox message={t.coupon.message} ok={t.coupon.ok} checking={t.checking} />
          </div>
          <OrderSummary
            lines={t.lines}
            subtotal={t.subtotal}
            discount={t.discount}
            shipping={t.shippingCost}
            total={t.total}
            couponCode={t.coupon.ok ? t.couponCode : undefined}
            freeShipping={t.freeShipping}
          />
          <button type="submit" disabled={pending || (!payments.cod_enabled && !payments.bank_transfer_enabled)} className="btn-dark w-full !min-h-[52px] text-base">
            {pending ? "Placing order…" : `Place Order · ${formatPKR(t.total)}`}
          </button>
          <p className="text-center text-xs text-stone">
            By placing your order you agree to our <Link href="/policies/terms" className="underline">Terms</Link> and <Link href="/policies/returns" className="underline">Return Policy</Link>.
          </p>
        </div>
      </form>
    </div>
  );
}
