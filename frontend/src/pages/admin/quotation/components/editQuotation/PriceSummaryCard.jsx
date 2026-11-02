import React from "react";
import { formatPrice } from "../../../../../lib/formatPrice";

export default function PriceSummaryCard({ quotation, priceBreakdown }) {
  if (!quotation) return null;

  // Use price breakdown from backend if provided, otherwise compute from quotation fields
  const subtotal =
    priceBreakdown?.subtotal !== undefined
      ? Number(priceBreakdown.subtotal)
      : (quotation.items || []).reduce((sum, line) => {
          const unitPrice =
            line.snap_selling_price !== null && line.snap_selling_price !== undefined
              ? Number(line.snap_selling_price)
              : Number(line.solar_item?.selling_price || line.solar_item?.marked_price || 0);
          return sum + unitPrice * (Number(line.quantity) || 1);
        }, 0);

  let discountAmount = 0;
  if (priceBreakdown?.discount !== undefined) {
    discountAmount = Number(priceBreakdown.discount);
  } else if (quotation.discount_type === "FIXED") {
    discountAmount = Math.max(0, Number(quotation.discount) || 0);
  } else if (quotation.discount_type === "PERCENTAGE") {
    const pct = Math.min(100, Math.max(0, Number(quotation.discount) || 0));
    discountAmount = (subtotal * pct) / 100;
  }

  let taxAmount = 0;
  if (priceBreakdown?.tax !== undefined) {
    taxAmount = Number(priceBreakdown.tax);
  } else if (quotation.tax_type === "FIXED") {
    taxAmount = Math.max(0, Number(quotation.tax) || 0);
  } else if (quotation.tax_type === "PERCENTAGE") {
    const pct = Math.min(100, Math.max(0, Number(quotation.tax) || 0));
    taxAmount = (Math.max(0, subtotal - discountAmount) * pct) / 100;
  }

  const grandTotal =
    priceBreakdown?.total !== undefined
      ? Number(priceBreakdown.total)
      : Math.max(0, subtotal - discountAmount + taxAmount);

  return (
    <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/50 space-y-1.5 text-xs">
      <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
        <span>Subtotal ({quotation.items?.length || 0} line items):</span>
        <span className="font-semibold text-gray-900 dark:text-white">
          {formatPrice(subtotal)}
        </span>
      </div>

      {discountAmount > 0 && (
        <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
          <span>
            Discount (
            {quotation.discount_type === "PERCENTAGE"
              ? `${quotation.discount}%`
              : "Fixed"}
            ):
          </span>
          <span className="font-semibold">-{formatPrice(discountAmount)}</span>
        </div>
      )}

      {taxAmount > 0 && (
        <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
          <span>
            Tax / VAT (
            {quotation.tax_type === "PERCENTAGE"
              ? `${quotation.tax}%`
              : "Fixed"}
            ):
          </span>
          <span className="font-semibold">+{formatPrice(taxAmount)}</span>
        </div>
      )}

      <div className="pt-2 border-t border-blue-200/60 dark:border-blue-900/60 flex items-center justify-between">
        <span className="font-bold text-gray-800 dark:text-gray-200">
          Live Total Proposal:
        </span>
        <span className="text-sm sm:text-base font-extrabold text-blue-600 dark:text-blue-400">
          {formatPrice(grandTotal)}
        </span>
      </div>
    </div>
  );
}
