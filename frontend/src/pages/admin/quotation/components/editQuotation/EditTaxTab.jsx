import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Receipt, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { axiosInstance } from "../../../../../lib/axiosInstance";
import { currencyType, formatPrice } from "../../../../../lib/formatPrice";
import { syncInvoiceForQuotation } from "../../../../../lib/invoicePdfEnricher";

export default function EditTaxTab({
  quotation,
  priceBreakdown,
  onQuotationUpdated,
}) {
  const [taxType, setTaxType] = useState(quotation?.tax_type || "NON");
  const [taxValue, setTaxValue] = useState(
    quotation?.tax ? String(quotation.tax) : ""
  );
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (quotation) {
      setTaxType(quotation.tax_type || "NON");
      setTaxValue(quotation.tax ? String(quotation.tax) : "");
      setErrorMsg("");
    }
  }, [quotation]);

  const isDraft = quotation?.status === "DRAFT";

  const handleTypeChange = (e) => {
    const nextType = e.target.value;
    setTaxType(nextType);
    setErrorMsg("");
    if (nextType === "NON") {
      setTaxValue("");
    }
  };

  const handleValueChange = (e) => {
    setTaxValue(e.target.value);
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isDraft) {
      toast.error(`Cannot update tax for quotation in status: ${quotation?.status}`);
      return;
    }

    // Client-side validations matching quotations.service.ts & UpdateQuotationTaxDto
    let payload = { tax_type: taxType };

    if (taxType === "NON") {
      // Backend DTO requires a positive number even for NON type
      payload.tax = 1;
    } else {
      const numVal = parseFloat(taxValue);

      if (isNaN(numVal) || numVal <= 0) {
        setErrorMsg("Tax must be greater than 0");
        toast.error("Tax must be greater than 0");
        return;
      }

      if (taxType === "PERCENTAGE") {
        if (numVal >= 100) {
          setErrorMsg("Tax percentage cannot be 100% or greater");
          toast.error("Tax percentage cannot be 100% or greater");
          return;
        }
      }

      payload.tax = numVal;
    }

    setLoading(true);
    try {
      // Endpoint: PUT /quotations/:quotation_id/tax
      await axiosInstance.put(`/quotations/${quotation.id}/tax`, payload);

      // Automatically sync invoice prices if an invoice exists for this quotation
      await syncInvoiceForQuotation(quotation.id, quotation.invoice_id);

      toast.success("Tax configuration updated successfully");

      // Refetch latest quotation data
      const res = await axiosInstance.get(`/quotations/${quotation.id}`);
      const freshQuo = res.data?.data?.quotation || res.data?.quotation;
      const freshBreakdown =
        res.data?.data?.price_breakdown || res.data?.price_breakdown;

      if (onQuotationUpdated) {
        onQuotationUpdated(freshQuo || { ...quotation, ...payload }, freshBreakdown);
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      const formatted = Array.isArray(msg) ? msg.join(", ") : msg || "Failed to update tax";
      setErrorMsg(formatted);
      toast.error(formatted);
    } finally {
      setLoading(false);
    }
  };

  // Live preview calculation
  const subtotal = Number(priceBreakdown?.subtotal || 0);
  const discountAmount = Number(priceBreakdown?.discount || 0);
  const taxableBase = Math.max(0, subtotal - discountAmount);

  let previewTaxAmount = 0;
  if (taxType === "FIXED") {
    previewTaxAmount = Math.max(0, Number(taxValue) || 0);
  } else if (taxType === "PERCENTAGE") {
    const pct = Math.min(100, Math.max(0, Number(taxValue) || 0));
    previewTaxAmount = (taxableBase * pct) / 100;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isDraft && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center gap-2.5 text-xs text-amber-800 shadow-2xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>
            This quotation is in <strong>{quotation?.status}</strong> status. Tax rules can only be modified while in <strong>DRAFT</strong> status.
          </span>
        </div>
      )}

      {/* Tax Type Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
          Tax Type
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { id: "NON", title: "No Tax", desc: "Exempt from taxes" },
            { id: "PERCENTAGE", title: "Percentage (%)", desc: "VAT or percentage on balance" },
            { id: "FIXED", title: `Fixed (${currencyType})`, desc: "Flat tax addition" },
          ].map((type) => {
            const isSelected = taxType === type.id;
            return (
              <button
                type="button"
                key={type.id}
                disabled={!isDraft || loading}
                onClick={() => {
                  setTaxType(type.id);
                  setErrorMsg("");
                  if (type.id === "NON") setTaxValue("");
                }}
                className={`p-3 text-left rounded-xl border transition-all cursor-pointer shadow-2xs ${
                  isSelected
                    ? "bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-800"
                    : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{type.title}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                  {type.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tax Value Input */}
      {taxType !== "NON" && (
        <div className="space-y-2 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 shadow-2xs">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
            {taxType === "PERCENTAGE" ? "Tax Percentage (%)" : `Tax Amount (${currencyType})`}
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={taxType === "PERCENTAGE" ? "99.99" : undefined}
              disabled={!isDraft || loading}
              value={taxValue}
              onChange={handleValueChange}
              placeholder={taxType === "PERCENTAGE" ? "e.g. 2.5" : "e.g. 5000"}
              className="w-full pl-3.5 pr-12 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:opacity-50 shadow-2xs transition-all"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-medium text-slate-400 pointer-events-none">
              {taxType === "PERCENTAGE" ? "%" : currencyType}
            </span>
          </div>

          <p className="text-[11px] text-slate-500">
            {taxType === "PERCENTAGE"
              ? "Must be greater than 0% and less than 100%."
              : "Must be a positive value greater than 0."}
          </p>

          {previewTaxAmount > 0 && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs text-amber-700">
              <span className="font-medium">Estimated addition:</span>
              <span className="font-mono font-bold">+{formatPrice(previewTaxAmount)}</span>
            </div>
          )}
        </div>
      )}

      {errorMsg && (
        <p className="text-xs text-rose-600 font-semibold">{errorMsg}</p>
      )}

      {/* Save Button */}
      {isDraft && (
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs shadow-emerald-500/20 transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5 active:scale-[0.98]"
          >
            {loading && <Loader2 size={13} className="animate-spin" />}
            <span>Save Tax</span>
          </button>
        </div>
      )}
    </form>
  );
}
