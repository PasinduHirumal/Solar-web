import React, { useState, useEffect } from "react";
import { X, FileText, User, Phone, MapPin, Mail, ShieldCheck, Layers, Loader2, Calendar } from "lucide-react";
import { formatPrice } from "../../../../lib/formatPrice";
import { axiosInstance } from "../../../../lib/axiosInstance";

export default function ViewQuotationModal({
  isOpen,
  onClose,
  quotation,
  initialQuotation,
  quotationId,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const targetQuotation = quotation || initialQuotation;
  const targetId = quotationId || targetQuotation?.id;

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Fetch full quotation breakdown when modal opens
  useEffect(() => {
    if (!isOpen || !targetId) {
      setData(null);
      return;
    }

    let active = true;

    const fetchQuotation = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/quotations/${targetId}`);
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
  }, [isOpen, targetId]);

  if (!isOpen || (!targetQuotation && !targetId)) return null;

  const currentQuo = data?.quotation || targetQuotation || {};
  const customer = currentQuo.customer || {};
  const customerPhone = currentQuo.snap_customer_phone || customer.phone;
  const customerAddress = currentQuo.snap_customer_address || customer.address;
  const items = currentQuo.items || [];

  // Robust price breakdown calculation
  const calculatedSubtotal = items.reduce((sum, line) => {
    const unitPrice =
      line.snap_selling_price !== null && line.snap_selling_price !== undefined
        ? Number(line.snap_selling_price)
        : Number(line.solar_item?.selling_price || 0);
    return sum + unitPrice * (line.quantity || 1);
  }, 0);

  const subtotal = data?.price_breakdown?.subtotal ?? calculatedSubtotal;

  let discountAmount = data?.price_breakdown?.discount ?? 0;
  if (!discountAmount && currentQuo.discount && currentQuo.discount_type !== "NON") {
    if (currentQuo.discount_type === "PERCENTAGE") {
      discountAmount = (subtotal * Number(currentQuo.discount)) / 100;
    } else if (currentQuo.discount_type === "FIXED") {
      discountAmount = Number(currentQuo.discount);
    }
  }

  let taxAmount = data?.price_breakdown?.tax ?? 0;
  if (!taxAmount && currentQuo.tax && currentQuo.tax_type !== "NON") {
    const afterDiscount = Math.max(0, subtotal - discountAmount);
    if (currentQuo.tax_type === "PERCENTAGE") {
      taxAmount = (afterDiscount * Number(currentQuo.tax)) / 100;
    } else if (currentQuo.tax_type === "FIXED") {
      taxAmount = Number(currentQuo.tax);
    }
  }

  const grandTotal =
    data?.price_breakdown?.total ?? Math.max(0, subtotal - discountAmount + taxAmount);

  const getStatusBadge = (status) => {
    switch (status) {
      case "ACCEPTED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "REJECTED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "SENT":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getStatusDot = (status) => {
    switch (status) {
      case "ACCEPTED":
        return "bg-emerald-500";
      case "REJECTED":
        return "bg-rose-500";
      case "SENT":
        return "bg-blue-500";
      default:
        return "bg-slate-400";
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in text-left"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200/80 overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[90vh]"
      >
        {/* Header - Fixed */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shadow-2xs shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-900 leading-tight truncate">
                Quotation Details
              </h3>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                Formal customer pricing proposal and itemization breakdown
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 border border-transparent hover:border-slate-200 flex items-center justify-center transition cursor-pointer shrink-0 ml-2"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-3 text-xs font-medium text-blue-600 bg-blue-50/50 rounded-xl border border-blue-100">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading quotation details...</span>
            </div>
          )}

          {/* Top Summary Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/70 shadow-2xs">
                  {currentQuo.quotation_number || "N/A"}
                </span>
                <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {currentQuo.created_at
                    ? new Date(currentQuo.created_at).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 truncate">
                {customer.name || "Customer Quotation"}
              </h2>
            </div>

            <span
              title={
                currentQuo.status === "SENT"
                  ? "Quotation sent to customer (ready for SuperAdmin approval or rejection)"
                  : currentQuo.status === "ACCEPTED"
                  ? "Quotation approved and accepted"
                  : currentQuo.status === "REJECTED"
                  ? "Quotation rejected"
                  : "Draft quotation (must be sent to customer before approval/rejection)"
              }
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border self-start sm:self-auto shrink-0 shadow-2xs ${getStatusBadge(
                currentQuo.status
              )}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(currentQuo.status)}`} />
              {currentQuo.status || "DRAFT"}
            </span>
          </div>

          {/* Customer Metadata Card */}
          <div className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-slate-700 min-w-0">
              <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-slate-900 truncate">{customer.name || "Customer"}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700 min-w-0">
              <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <span className="truncate text-slate-600">{customer.email || currentQuo.customer_id || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700 min-w-0">
              <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                <Phone className="w-3.5 h-3.5" />
              </div>
              <span className="font-mono text-slate-700 truncate">{customerPhone || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700 min-w-0">
              <div className="w-6 h-6 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <span className="truncate text-slate-600" title={customerAddress}>{customerAddress || "N/A"}</span>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Quotation Line Items ({items.length})
              </h4>
            </div>
            <div className="border border-slate-200/80 rounded-xl overflow-x-auto bg-white custom-scrollbar shadow-2xs">
              <table className="w-full text-left text-xs min-w-[420px]">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 px-3.5">Solar Item</th>
                    <th className="py-2.5 px-3.5 text-right">Unit Price</th>
                    <th className="py-2.5 px-3.5 text-center">Qty</th>
                    <th className="py-2.5 px-3.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-slate-400 text-xs">
                        No items added to this quotation yet
                      </td>
                    </tr>
                  ) : (
                    items.map((line, idx) => {
                      const itemTitle = line.snap_title || line.solar_item?.title || "Solar Item";
                      const itemCode = line.solar_item?.code;
                      const itemCat = line.solar_item?.category?.title;
                      const unitPrice =
                        line.snap_selling_price !== null && line.snap_selling_price !== undefined
                          ? Number(line.snap_selling_price)
                          : Number(line.solar_item?.selling_price || 0);
                      const qty = Number(line.quantity || 1);
                      const lineTotal = unitPrice * qty;

                      return (
                        <tr key={line.id || idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-3.5">
                            <p className="font-semibold text-slate-900">{itemTitle}</p>
                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[10px] text-slate-500">
                              {itemCode && (
                                <span className="font-mono text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.2 rounded font-semibold">
                                  {itemCode}
                                </span>
                              )}
                              {itemCat && <span className="text-slate-400">• {itemCat}</span>}
                              {(line.snap_warranty_period || line.solar_item?.warranty_period) && (
                                <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.2 rounded font-medium flex items-center gap-0.5">
                                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                                  {line.snap_warranty_period || line.solar_item?.warranty_period}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3.5 text-right font-mono text-slate-700">
                            {formatPrice(unitPrice)}
                          </td>
                          <td className="py-3 px-3.5 text-center font-mono font-bold text-slate-800">
                            {qty}
                          </td>
                          <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900">
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
          <div className="p-4 rounded-xl bg-slate-50/60 border border-slate-200/80 space-y-2.5 shadow-2xs">
            <div className="flex justify-between text-xs text-slate-600">
              <span className="font-medium">Subtotal:</span>
              <span className="font-mono font-semibold text-slate-900">
                {formatPrice(subtotal)}
              </span>
            </div>

            {currentQuo.discount_type && currentQuo.discount_type !== "NON" && (
              <div className="flex justify-between text-xs text-emerald-700">
                <span className="font-medium">
                  Discount ({currentQuo.discount_type === "PERCENTAGE" ? `${currentQuo.discount}%` : "Fixed"}):
                </span>
                <span className="font-mono font-semibold">-{formatPrice(discountAmount)}</span>
              </div>
            )}

            {currentQuo.tax_type && currentQuo.tax_type !== "NON" && (
              <div className="flex justify-between text-xs text-amber-700">
                <span className="font-medium">
                  Tax ({currentQuo.tax_type === "PERCENTAGE" ? `${currentQuo.tax}%` : "Fixed"}):
                </span>
                <span className="font-mono font-semibold">+{formatPrice(taxAmount)}</span>
              </div>
            )}

            <div className="pt-2.5 border-t border-slate-200 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Grand Total:</span>
              <span className="font-mono font-extrabold text-blue-600 text-lg">
                {formatPrice(grandTotal)}
              </span>
            </div>
          </div>

          {/* Notes & Terms */}
          {(currentQuo.notes || currentQuo.terms) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {currentQuo.notes && (
                <div className="p-3.5 rounded-xl bg-slate-50/50 border border-slate-200/80">
                  <span className="font-bold text-slate-800 block mb-1">Notes</span>
                  <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{currentQuo.notes}</p>
                </div>
              )}
              {currentQuo.terms && (
                <div className="p-3.5 rounded-xl bg-slate-50/50 border border-slate-200/80">
                  <span className="font-bold text-slate-800 block mb-1">Terms & Conditions</span>
                  <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{currentQuo.terms}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 shrink-0 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-2xs hover:border-slate-300 transition cursor-pointer active:scale-[0.98]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
