import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Percent, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { axiosInstance } from "../../../../../lib/axiosInstance";
import { currencyType, formatPrice } from "../../../../../lib/formatPrice";

export default function EditDiscountTab({
  quotation,
  priceBreakdown,
  onQuotationUpdated,
}) {
  const [discountType, setDiscountType] = useState(
    quotation?.discount_type || "NON"
  );
  const [discountValue, setDiscountValue] = useState(
    quotation?.discount ? String(quotation.discount) : ""
  );
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (quotation) {
      setDiscountType(quotation.discount_type || "NON");
      setDiscountValue(quotation.discount ? String(quotation.discount) : "");
      setErrorMsg("");
    }
  }, [quotation]);

  const isDraft = quotation?.status === "DRAFT";

  const handleTypeChange = (e) => {
    const nextType = e.target.value;
    setDiscountType(nextType);
    setErrorMsg("");
    if (nextType === "NON") {
      setDiscountValue("");
    }
  };

  const handleValueChange = (e) => {
    setDiscountValue(e.target.value);
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isDraft) {
      toast.error(`Cannot update discount for quotation in status: ${quotation?.status}`);
      return;
    }

    // Client-side validations matching quotations.service.ts & UpdateQuotationDiscountDto
    let payload = { discount_type: discountType };

    if (discountType === "NON") {
      // Backend DTO requires a positive number even for NON type
      payload.discount = 1;
    } else {
      const numVal = parseFloat(discountValue);

      if (isNaN(numVal) || numVal <= 0) {
        setErrorMsg("Discount must be greater than 0");
        toast.error("Discount must be greater than 0");
        return;
      }

      if (discountType === "PERCENTAGE") {
        if (numVal >= 100) {
          setErrorMsg("Discount percentage cannot be 100% or greater");
          toast.error("Discount percentage cannot be 100% or greater");
          return;
        }
      }

      payload.discount = numVal;
    }

    setLoading(true);
    try {
      // Endpoint: PUT /quotations/:quotation_id/discount
      await axiosInstance.put(`/quotations/${quotation.id}/discount`, payload);

      toast.success("Discount updated successfully");

      // Refetch latest quotation data to get updated breakdown and values
      const res = await axiosInstance.get(`/quotations/${quotation.id}`);
      const freshQuo = res.data?.data?.quotation || res.data?.quotation;
      const freshBreakdown =
        res.data?.data?.price_breakdown || res.data?.price_breakdown;

      if (onQuotationUpdated) {
        onQuotationUpdated(freshQuo || { ...quotation, ...payload }, freshBreakdown);
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      const formatted = Array.isArray(msg) ? msg.join(", ") : msg || "Failed to update discount";
      setErrorMsg(formatted);
      toast.error(formatted);
    } finally {
      setLoading(false);
    }
  };

  // Live preview calculation
  const subtotal = Number(priceBreakdown?.subtotal || 0);
  let previewDiscountAmount = 0;
  if (discountType === "FIXED") {
    previewDiscountAmount = Math.max(0, Number(discountValue) || 0);
  } else if (discountType === "PERCENTAGE") {
    const pct = Math.min(100, Math.max(0, Number(discountValue) || 0));
    previewDiscountAmount = (subtotal * pct) / 100;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isDraft && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>
            This quotation is in <strong>{quotation?.status}</strong> status. Discounts can only be modified while in <strong>DRAFT</strong> status.
          </span>
        </div>
      )}

      {/* Discount Type Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
          Discount Type
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "NON", title: "No Discount", desc: "No price reduction" },
            { id: "PERCENTAGE", title: "Percentage (%)", desc: "Deduct a % from subtotal" },
            { id: "FIXED", title: `Fixed (${currencyType})`, desc: "Flat amount deduction" },
          ].map((type) => {
            const isSelected = discountType === type.id;
            return (
              <button
                type="button"
                key={type.id}
                disabled={!isDraft || loading}
                onClick={() => {
                  setDiscountType(type.id);
                  setErrorMsg("");
                  if (type.id === "NON") setDiscountValue("");
                }}
                className={`p-2.5 text-left rounded-xl border transition-all cursor-pointer ${isSelected
                    ? "bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20 text-blue-700 dark:text-blue-300"
                    : "bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{type.title}</span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                </div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                  {type.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Discount Value Input */}
      {discountType !== "NON" && (
        <div className="space-y-1.5 p-3 rounded-xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-200/80 dark:border-gray-700/60">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
            {discountType === "PERCENTAGE" ? "Discount Percentage (%)" : `Discount Amount (${currencyType})`}
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={discountType === "PERCENTAGE" ? "99.99" : undefined}
              disabled={!isDraft || loading}
              value={discountValue}
              onChange={handleValueChange}
              placeholder={discountType === "PERCENTAGE" ? "e.g. 10" : "e.g. 25000"}
              className="w-full pl-3 pr-12 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400 pointer-events-none">
              {discountType === "PERCENTAGE" ? "%" : currencyType}
            </span>
          </div>

          <p className="text-[10px] text-gray-400">
            {discountType === "PERCENTAGE"
              ? "Must be greater than 0% and less than 100%."
              : "Must be a positive value greater than 0."}
          </p>

          {previewDiscountAmount > 0 && subtotal > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200/60 dark:border-gray-700/60 flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400">
              <span>Estimated reduction:</span>
              <span className="font-bold">-{formatPrice(previewDiscountAmount)}</span>
            </div>
          )}
        </div>
      )}

      {errorMsg && (
        <p className="text-xs text-rose-500 font-medium">{errorMsg}</p>
      )}

      {/* Save Button */}
      {isDraft && (
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
          >
            {loading && <Loader2 size={13} className="animate-spin" />}
            <span>Save Discount</span>
          </button>
        </div>
      )}
    </form>
  );
}
