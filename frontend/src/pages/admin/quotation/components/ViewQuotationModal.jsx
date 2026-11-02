import React, { useState, useEffect } from "react";
import { X, FileText, User, Phone, MapPin, Mail, ShieldCheck, Layers, Loader2, Calendar } from "lucide-react";
import { formatPrice } from "../../../../lib/formatPrice";
import { axiosInstance } from "../../../../lib/axiosInstance";

export default function ViewQuotationModal({ isOpen, onClose, quotation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !quotation?.id) return;

    let active = true;

    const fetchQuotation = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/quotations/${quotation.id}`);
        if (active) {
          setData(res.data?.data || res.data);
        }
      } catch (err) {
        console.error("Failed to load quotation details", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchQuotation();

    return () => {
      active = false;
    };
  }, [isOpen, quotation?.id]);

  if (!isOpen || !quotation) return null;

  const currentQuo = data?.quotation || quotation;
  const breakdown = data?.price_breakdown || {
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
  };
  const customer = currentQuo.customer || {};
  const items = currentQuo.items || [];

  const getStatusBadge = (status) => {
    switch (status) {
      case "ACCEPTED":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/60";
      case "REJECTED":
        return "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300 border-red-300 dark:border-red-800/60";
      case "SENT":
        return "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border-blue-300 dark:border-blue-800/60";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-left">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[90vh]">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white leading-tight truncate">
                Quotation Details
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                Formal customer pricing proposal and itemization.
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

        {/* Content - Scrollable */}
        <div className="p-3.5 sm:p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-2 text-xs text-blue-600 dark:text-blue-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading quotation details...</span>
            </div>
          )}

          {/* Top Summary Banner */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/40 dark:from-gray-800/80 dark:via-gray-800/50 dark:to-blue-950/30 border border-blue-100/80 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100/80 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                  {currentQuo.quotation_number}
                </span>
                <span className="text-[11px] text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  {new Date(currentQuo.created_at).toLocaleDateString()}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate">
                {customer.name || "Customer Quotation"}
              </h2>
            </div>

            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border self-start sm:self-auto shrink-0 ${getStatusBadge(
                currentQuo.status
              )}`}
            >
              {currentQuo.status}
            </span>
          </div>

          {/* Customer Metadata Card */}
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 min-w-0">
              <User className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="font-medium truncate">{customer.name || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 min-w-0">
              <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="truncate">{customer.email || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 min-w-0">
              <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="font-mono truncate">{customer.phone || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 min-w-0">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="truncate" title={customer.address}>{customer.address || "N/A"}</span>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Quotation Line Items ({items.length})
            </h4>
            <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-x-auto bg-white dark:bg-gray-900 custom-scrollbar">
              <table className="w-full text-left text-xs min-w-[420px]">
                <thead>
                  <tr className="bg-gray-50/70 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Solar Item</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-4 text-center text-gray-400">
                        No items in this quotation
                      </td>
                    </tr>
                  ) : (
                    items.map((line) => {
                      const itemTitle = line.snap_title || line.solar_item?.title || "Solar Item";
                      const itemCode = line.solar_item?.code;
                      const itemCat = line.solar_item?.category?.title;
                      const unitPrice =
                        line.snap_selling_price !== null && line.snap_selling_price !== undefined
                          ? line.snap_selling_price
                          : line.solar_item?.selling_price || 0;
                      const lineTotal = unitPrice * line.quantity;

                      return (
                        <tr key={line.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                          <td className="py-2.5 px-3">
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{itemTitle}</p>
                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[10px] text-gray-400">
                              {itemCode && (
                                <span className="font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1 py-0.2 rounded font-semibold">
                                  {itemCode}
                                </span>
                              )}
                              {itemCat && <span>{itemCat}</span>}
                              {(line.snap_warranty_period || line.solar_item?.warranty_period) && (
                                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                                  <ShieldCheck className="w-2.5 h-2.5" />
                                  {line.snap_warranty_period || line.solar_item?.warranty_period}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right font-medium text-gray-700 dark:text-gray-300">
                            {formatPrice(unitPrice)}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-gray-800 dark:text-gray-200">
                            {line.quantity}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-gray-900 dark:text-white">
                            {formatPrice(lineTotal)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing Breakdown Summary */}
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-2">
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300">
              <span>Subtotal:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatPrice(breakdown.subtotal)}
              </span>
            </div>

            {currentQuo.discount_type !== "NON" && (
              <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400">
                <span>
                  Discount ({currentQuo.discount_type === "PERCENTAGE" ? `${currentQuo.discount}%` : "Fixed"}):
                </span>
                <span className="font-semibold">-{formatPrice(breakdown.discount)}</span>
              </div>
            )}

            {currentQuo.tax_type !== "NON" && (
              <div className="flex justify-between text-xs text-amber-600 dark:text-amber-400">
                <span>
                  Tax ({currentQuo.tax_type === "PERCENTAGE" ? `${currentQuo.tax}%` : "Fixed"}):
                </span>
                <span className="font-semibold">+{formatPrice(breakdown.tax)}</span>
              </div>
            )}

            <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-sm">
              <span className="font-bold text-gray-900 dark:text-white">Grand Total:</span>
              <span className="font-extrabold text-blue-600 dark:text-blue-400 text-base">
                {formatPrice(breakdown.total)}
              </span>
            </div>
          </div>

          {/* Notes & Terms */}
          {(currentQuo.notes || currentQuo.terms) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {currentQuo.notes && (
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
                  <span className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Notes</span>
                  <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{currentQuo.notes}</p>
                </div>
              )}
              {currentQuo.terms && (
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
                  <span className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Terms & Conditions</span>
                  <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{currentQuo.terms}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="px-4 py-3 bg-gray-50/90 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-800 shrink-0 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
