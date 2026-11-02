import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { FileText, Loader2, AlertCircle } from "lucide-react";
import { axiosInstance } from "../../../../../lib/axiosInstance";

export default function EditDataTab({
  quotation,
  onQuotationUpdated,
}) {
  const [notes, setNotes] = useState(quotation?.notes || "");
  const [terms, setTerms] = useState(quotation?.terms || "");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (quotation) {
      setNotes(quotation.notes || "");
      setTerms(quotation.terms || "");
      setErrorMsg("");
    }
  }, [quotation]);

  const isDraft = quotation?.status === "DRAFT";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isDraft) {
      toast.error(`Cannot update notes & terms for quotation in status: ${quotation?.status}`);
      return;
    }

    const trimmedNotes = notes.trim();
    const trimmedTerms = terms.trim();

    // Validation: UpdateQuotationDataDto requires minLength 3 if string is present
    if (trimmedNotes.length > 0 && trimmedNotes.length < 3) {
      setErrorMsg("Notes must be at least 3 characters long if provided");
      toast.error("Notes must be at least 3 characters long if provided");
      return;
    }

    if (trimmedTerms.length > 0 && trimmedTerms.length < 3) {
      setErrorMsg("Terms must be at least 3 characters long if provided");
      toast.error("Terms must be at least 3 characters long if provided");
      return;
    }

    const payload = {};
    if (trimmedNotes.length >= 3) {
      payload.notes = trimmedNotes;
    }
    if (trimmedTerms.length >= 3) {
      payload.terms = trimmedTerms;
    }

    setLoading(true);
    try {
      // Endpoint: PUT /quotations/:quotation_id/data
      await axiosInstance.put(`/quotations/${quotation.id}/data`, payload);

      toast.success("Notes and terms updated successfully");

      // Refetch latest quotation data
      const res = await axiosInstance.get(`/quotations/${quotation.id}`);
      const freshQuo = res.data?.data?.quotation || res.data?.quotation;
      const freshBreakdown =
        res.data?.data?.price_breakdown || res.data?.price_breakdown;

      if (onQuotationUpdated) {
        onQuotationUpdated(
          freshQuo || { ...quotation, notes: trimmedNotes, terms: trimmedTerms },
          freshBreakdown
        );
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      const formatted = Array.isArray(msg) ? msg.join(", ") : msg || "Failed to update quotation data";
      setErrorMsg(formatted);
      toast.error(formatted);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isDraft && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>
            This quotation is in <strong>{quotation?.status}</strong> status. Notes & terms can only be modified while in <strong>DRAFT</strong> status.
          </span>
        </div>
      )}

      {/* Notes Textarea */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
            Internal & Customer Notes
          </label>
          <span className="text-[10px] text-gray-400">
            Min 3 characters if provided
          </span>
        </div>
        <textarea
          rows={3}
          disabled={!isDraft || loading}
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setErrorMsg("");
          }}
          placeholder="Delivery instructions, site specifications, special customer requests..."
          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition disabled:opacity-50"
        />
      </div>

      {/* Terms Textarea */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
            Terms & Conditions
          </label>
          <span className="text-[10px] text-gray-400">
            Min 3 characters if provided
          </span>
        </div>
        <textarea
          rows={3}
          disabled={!isDraft || loading}
          value={terms}
          onChange={(e) => {
            setTerms(e.target.value);
            setErrorMsg("");
          }}
          placeholder="Payment schedule, validity days (e.g. valid 30 days), installation and warranty clauses..."
          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition disabled:opacity-50"
        />
      </div>

      {errorMsg && (
        <p className="text-xs text-rose-500 font-medium">{errorMsg}</p>
      )}

      {/* Save Button */}
      {isDraft && (
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
          >
            {loading && <Loader2 size={13} className="animate-spin" />}
            <span>Save Notes & Terms</span>
          </button>
        </div>
      )}
    </form>
  );
}
