"use client";

import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { formatQtyNumber, normalizeQty } from "@/lib/units";

interface Props {
  qty: number;
  onChange: (qty: number) => void;
  step: number;
  minQty: number;
  allowDecimal: boolean;
  max?: number;
  /** Plural unit name shown next to the selector: Yards, Pieces, Bottles, Needles */
  unitLabelPlural: string;
  compact?: boolean;
  showUnit?: boolean;
}

/** Quantity control that follows the product's own unit, step and minimum. */
export default function QuantitySelector({
  qty,
  onChange,
  step,
  minQty,
  allowDecimal,
  max,
  unitLabelPlural,
  compact,
  showUnit = true,
}: Props) {
  const [text, setText] = useState(formatQtyNumber(qty));
  const opts = { step, minQty, allowDecimal, max };
  const effStep = allowDecimal ? step : Math.max(1, Math.round(step));

  useEffect(() => setText(formatQtyNumber(qty)), [qty]);

  function commit(value: number) {
    const next = normalizeQty(value, opts);
    onChange(next);
    setText(formatQtyNumber(next));
  }

  const atMin = qty <= minQty;
  const atMax = max !== undefined && qty + effStep > max;

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center rounded-full border border-line bg-white">
          <button
            type="button"
            aria-label="Decrease quantity"
            disabled={atMin}
            onClick={() => commit(qty - effStep)}
            className={`flex items-center justify-center rounded-l-full transition hover:bg-cream disabled:opacity-35 ${compact ? "h-9 w-9" : "h-11 w-11"}`}
          >
            <Minus size={15} />
          </button>
          <input
            inputMode={allowDecimal ? "decimal" : "numeric"}
            aria-label={`Quantity in ${unitLabelPlural}`}
            value={text}
            onChange={(e) => setText(e.target.value.replace(/[^0-9.]/g, ""))}
            onBlur={() => commit(parseFloat(text))}
            onKeyDown={(e) => e.key === "Enter" && commit(parseFloat(text))}
            className={`bg-transparent text-center text-sm font-semibold outline-none ${compact ? "w-12" : "w-16"}`}
          />
          <button
            type="button"
            aria-label="Increase quantity"
            disabled={atMax}
            onClick={() => commit(qty + effStep)}
            className={`flex items-center justify-center rounded-r-full transition hover:bg-cream disabled:opacity-35 ${compact ? "h-9 w-9" : "h-11 w-11"}`}
          >
            <Plus size={15} />
          </button>
        </div>
        {showUnit && !compact && (
          <span className="text-sm text-stone">
            Unit: <strong className="font-semibold text-ink">{unitLabelPlural}</strong>
          </span>
        )}
      </div>
      {showUnit && !compact && (step !== 1 || minQty !== 1) && (
        <p className="mt-2 text-xs text-stone">
          {allowDecimal && step < 1 ? `Sold in steps of ${formatQtyNumber(step)}. ` : ""}
          {minQty > 1 ? `Minimum order ${formatQtyNumber(minQty)} ${unitLabelPlural.toLowerCase()}.` : ""}
        </p>
      )}
    </div>
  );
}
