import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  X,
  Receipt,
  Calendar,
  Loader2,
  CheckCircle2,
  Mail,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  FilePlus,
} from "lucide-react";
import { axiosInstance } from "../../../../lib/axiosInstance";
import { formatPrice } from "../../../../lib/formatPrice";

/**
 * CreateInvoiceModal
 * Implements Step 1: POST /invoices/:quotation_id
 * Creates an invoice directly in the backend database with a specified due date,
 * then updates the UI in real time and offers immediate email/view follow-ups.
 */
export default function CreateInvoiceModal({
  isOpen,
  onClose,
  quotation,
  onInvoiceCreated,
  onOpenSendModal,
  onOpenViewModal,
}) {
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0]; // YYYY-MM-DD
  });

  const [loading, setLoading] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setCreatedInvoice(null);
      setErrorMessage("");
      const d = new Date();
      d.setDate(d.getDate() + 14);
      setDueDate(d.toISOString().split("T")[0]);
    }
  }, [isOpen, quotation]);

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

  if (!isOpen || !quotation) return null;

  const customer = quotation.customer || {};
  const items = quotation.items || [];

  // Calculate pricing preview
  const subtotal = items.reduce((sum, line) => {
    const price =
      line.snap_selling_price !== null && line.snap_selling_price !== undefined
        ? Number(line.snap_selling_price)
        : Number(line.solar_item?.selling_price || 0);
    return sum + price * (Number(line.quantity) || 1);
  }, 0);

  let discountAmount = 0;
  if (quotation.discount && quotation.discount_type !== "NON") {
    if (quotation.discount_type === "PERCENTAGE") {
      discountAmount = (subtotal * Number(quotation.discount)) / 100;
    } else if (quotation.discount_type === "FIXED") {
      discountAmount = Number(quotation.discount);
    }
  }

  const taxableBase = Math.max(0, subtotal - discountAmount);
  let taxAmount = 0;
  if (quotation.tax && quotation.tax_type !== "NON") {
    if (quotation.tax_type === "PERCENTAGE") {
      taxAmount = (taxableBase * Number(quotation.tax)) / 100;
    } else if (quotation.tax_type === "FIXED") {
      taxAmount = Number(quotation.tax);
    }
  }

  const grandTotal = Math.max(0, subtotal - discountAmount + taxAmount);

  const handleCreateInvoice = async (e) => {
    e?.preventDefault();
    if (!dueDate) {
      toast.error("Please specify a valid payment due date");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      // Endpoint: POST /invoices/:quotation_id
      const payload = {
        due_date: new Date(dueDate).toISOString(),
      };

      const response = await axiosInstance.post(`/invoices/${quotation.id}`, payload);
      const newInvoice = response.data?.data || response.data;

      setCreatedInvoice(newInvoice);
      toast.success(`Invoice ${newInvoice.invoice_number || ""} created successfully!`);

      // Trigger real-time UI update without page refresh
      if (onInvoiceCreated) {
        onInvoiceCreated(newInvoice);
      }
    } catch (err) {
      console.error("Failed to create invoice", err);
      if (err.response?.status === 409) {
        setErrorMessage("An invoice has already been generated in the database for this quotation.");
        toast.error("Invoice already exists for this quotation.");
      } else {
        const msg = err.response?.data?.message;
        const displayMsg = Array.isArray(msg) ? msg.join(", ") : msg || err.message || "Failed to create invoice";
        setErrorMessage(displayMsg);
        toast.error(displayMsg);
      }
    } finally {
      setLoading(false);
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
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200/90 overflow-hidden flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-4 py-3 sm:px-5 sm:py-3.5 border-b border-slate-100 bg-slate-50/70 shrink-0 gap-2">
          <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shadow-2xs shrink-0 mt-0.5">
              <FilePlus className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                  Create Invoice in Database
                </h3>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60 shadow-2xs">
                  {quotation.quotation_number}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Calls POST /invoices/:quotation_id to initialize and freeze invoice records
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 border border-transparent hover:border-slate-200 flex items-center justify-center transition cursor-pointer shrink-0"
            title="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3.5 sm:p-5 pb-8 sm:pb-8 space-y-3.5 sm:space-y-4 overflow-y-auto custom-scrollbar flex-1 min-h-0">
          {/* Success State Banner */}
          {createdInvoice ? (
            <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-3 animate-fade-in">
              <div className="flex items-center gap-2.5 text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold">
                    Invoice Created & Saved Successfully!
                  </h4>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Official record stored in database with invoice number:
                  </p>
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-emerald-100 flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500 uppercase font-semibold">Invoice Number:</span>
                <span className="font-mono font-bold text-blue-700 text-sm">
                  {createdInvoice.invoice_number}
                </span>
              </div>

              <p className="text-[11px] text-slate-600">
                You can now preview/download the invoice vector PDF, or dispatch it directly to the customer's email.
              </p>

              {/* Follow-up actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                {onOpenSendModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenSendModal(quotation, createdInvoice);
                    }}
                    className="flex-1 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs shadow-blue-500/20 flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-[0.98]"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Send Invoice via Email</span>
                  </button>
                )}

                {onOpenViewModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenViewModal(createdInvoice, quotation);
                    }}
                    className="flex-1 px-3.5 py-2 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold shadow-2xs flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-[0.98]"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>View Invoice Details</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Error Notice if any */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="font-bold block">Could not create invoice:</span>
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}

              {/* Quotation & Customer Summary Card */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                      {(customer.name || "C").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-slate-900 text-xs truncate">
                        {customer.name || "Customer Account"}
                      </h4>
                      {customer.email ? (
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {customer.email}
                        </p>
                      ) : (
                        <p className="text-[11px] text-amber-600 italic mt-0.5">No email on file</p>
                      )}
                    </div>
                  </div>

                  <div className="w-full sm:w-auto flex items-center sm:flex-col sm:items-end justify-between sm:justify-center px-3 py-1.5 sm:px-3 sm:py-1 bg-white sm:bg-blue-50/50 rounded-lg sm:rounded-xl border border-slate-200/80 sm:border-blue-100/80 shrink-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 sm:text-blue-600/80 tracking-wider">
                      Total Invoiced Amount
                    </span>
                    <span className="text-sm font-mono font-extrabold text-blue-700">
                      {formatPrice(grandTotal)}
                    </span>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-200/70 grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px] text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Status</span>
                    <span className="font-semibold text-slate-800">{quotation.status}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Line Items</span>
                    <span className="font-semibold text-slate-800">{items.length} items</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Action Target</span>
                    <span className="font-mono text-[10px] text-indigo-700 font-semibold truncate block">
                      POST /invoices/:id
                    </span>
                  </div>
                </div>
              </div>

              {/* Due Date Config Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Payment Due Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                    className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <p className="text-[11px] text-slate-400">
                  Required by backend DTO. Stored as invoice due timestamp in database.
                </p>
              </div>

              {/* Informational Notice */}
              <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-[11px] text-slate-600 flex items-start gap-2">
                <Receipt className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">
                    Database Snapshots & Freezing
                  </p>
                  <p className="text-slate-500 mt-0.5">
                    Executing this action saves an immutable invoice row in the database, locks the equipment snapshots, and generates an official invoice number.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-slate-50/80 border-t border-slate-100 shrink-0 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg shadow-2xs hover:border-slate-300 transition cursor-pointer active:scale-[0.98] text-center"
          >
            {createdInvoice ? "Close" : "Cancel"}
          </button>

          {!createdInvoice && (
            <button
              type="button"
              onClick={handleCreateInvoice}
              disabled={loading || !dueDate}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs shadow-blue-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer active:scale-[0.98] text-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Creating in Database...</span>
                </>
              ) : (
                <>
                  <FilePlus className="w-3.5 h-3.5" />
                  <span>Create Invoice in Database</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
