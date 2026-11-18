"use client";

import { useState } from "react";
import { updateOrderStatus } from "@/app/admin/actions";
import { ORDER_STATUSES } from "@/lib/types";
import { useAction } from "./ui";

export default function OrderStatusControl({ id, status }: { id: string; status: string }) {
  const { run, pending } = useAction();
  const [value, setValue] = useState(status);

  function apply(next: string) {
    if (next === "cancelled" && !confirm("Cancel this order? Stock will be returned to inventory.")) return;
    const prev = value;
    setValue(next);
    run(() => updateOrderStatus(id, next), `Order marked ${next}`, (r) => !r.ok && setValue(prev));
  }

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="status" className="label !mb-0">Status</label>
      <select id="status" value={value} disabled={pending} onChange={(e) => apply(e.target.value)} className="input !w-auto capitalize">
        {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      {value !== "cancelled" && (
        <button disabled={pending} onClick={() => apply("cancelled")} className="text-sm text-red-700 underline">Cancel order</button>
      )}
    </div>
  );
}
