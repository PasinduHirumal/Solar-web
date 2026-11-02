import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { FileText, X, Loader2 } from "lucide-react";
import { axiosInstance } from "../../../../lib/axiosInstance";
import { currencyType } from "../../../../lib/formatPrice";

export default function EditQuotationModal({
  isOpen,
  onClose,
  quotation,
  onQuotationUpdated,
}) {
  const [prevQuotation, setPrevQuotation] = useState(quotation);
  const [formData, setFormData] = useState({
    notes: quotation?.notes || "",
    terms: quotation?.terms || "",
    discount_type: quotation?.discount_type || "NON",
    discount: quotation?.discount ? String(quotation.discount) : "",
    tax_type: quotation?.tax_type || "NON",
    tax: quotation?.tax ? String(quotation.tax) : "",
  });
  const [loading, setLoading] = useState(false);

  if (prevQuotation?.id !== quotation?.id) {
    setPrevQuotation(quotation);
    setFormData({
      notes: quotation?.notes || "",
      terms: quotation?.terms || "",
      discount_type: quotation?.discount_type || "NON",
      discount: quotation?.discount ? String(quotation.discount) : "",
      tax_type: quotation?.tax_type || "NON",
      tax: quotation?.tax ? String(quotation.tax) : "",
    });
  }

  if (!isOpen || !quotation) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      // 1. Update notes & terms
      const dataPayload = {
        notes: formData.notes.trim() || undefined,
        terms: formData.terms.trim() || undefined,
      };
      await axiosInstance.put(`/quotations/${quotation.id}/data`, dataPayload);

      // 2. Update discount
      const discountVal =
        formData.discount_type !== "NON" && Number(formData.discount) > 0
          ? Number(formData.discount)
          : 0;
      await axiosInstance.put(`/quotations/${quotation.id}/discount`, {
        discount_type: formData.discount_type,
        discount: discountVal,
      });

      // 3. Update tax
      const taxVal =
        formData.tax_type !== "NON" && Number(formData.tax) > 0
          ? Number(formData.tax)
          : 0;
      await axiosInstance.put(`/quotations/${quotation.id}/tax`, {
        tax_type: formData.tax_type,
        tax: taxVal,
      });

      // Fetch fresh updated quotation
      const freshRes = await axiosInstance.get(`/quotations/${quotation.id}`);
      const updated = freshRes.data?.data?.quotation || freshRes.data?.quotation || {
        ...quotation,
        ...formData,
      };

      toast.success("Quotation updated successfully");
      if (onQuotationUpdated) {
        onQuotationUpdated(updated);
      }
      onClose();
    } catch (error) {
      const msg = error.response?.data?.message;
      toast.error(
        Array.isArray(msg)
          ? msg.join(", ")
          : msg || error.message || "Failed to update quotation"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-left">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[90vh]">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white leading-tight truncate">
                Edit Quotation ({quotation.quotation_number})
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                Update discount, taxes, notes, and terms for this draft.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer shrink-0 ml-2"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-3.5 sm:p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
            {/* Discount & Tax */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {/* Discount */}
              <div className="space-y-1.5 p-2.5 sm:p-3 rounded-xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                  Discount
                </label>
                <div className="flex items-center gap-2">
                  <select
                    name="discount_type"
                    value={formData.discount_type}
                    onChange={handleChange}
                    className="w-36 shrink-0 px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="NON">None</option>
                    <option value="FIXED">Fixed ({currencyType})</option>
                    <option value="PERCENTAGE">Percentage (%)</option>
                  </select>

                  {formData.discount_type !== "NON" && (
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      name="discount"
                      value={formData.discount}
                      onChange={handleChange}
                      placeholder="Value"
                      className="flex-1 min-w-0 px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              </div>

              {/* Tax */}
              <div className="space-y-1.5 p-2.5 sm:p-3 rounded-xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                  Tax / VAT
                </label>
                <div className="flex items-center gap-2">
                  <select
                    name="tax_type"
                    value={formData.tax_type}
                    onChange={handleChange}
                    className="w-36 shrink-0 px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="NON">None</option>
                    <option value="FIXED">Fixed ({currencyType})</option>
                    <option value="PERCENTAGE">Percentage (%)</option>
                  </select>

                  {formData.tax_type !== "NON" && (
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      name="tax"
                      value={formData.tax}
                      onChange={handleChange}
                      placeholder="Value"
                      className="flex-1 min-w-0 px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Notes
              </label>
              <textarea
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                placeholder="Delivery instructions, site specifications, etc..."
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
              />
            </div>

            {/* Terms */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Terms & Conditions
              </label>
              <textarea
                name="terms"
                rows={3}
                value={formData.terms}
                onChange={handleChange}
                placeholder="Payment schedule, validity days, warranty clause, etc..."
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
              />
            </div>
          </div>

          {/* Sticky Footer Actions */}
          <div className="px-4 py-3 bg-gray-50/90 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-800 shrink-0 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              {loading && <Loader2 size={13} className="animate-spin" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
