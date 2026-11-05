import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  X,
  Calendar,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  FilePlus,
  Receipt,
} from "lucide-react";
import { axiosInstance } from "../../../../lib/axiosInstance";
import { formatPrice } from "../../../../lib/formatPrice";

/**
 * CreateInvoiceModal
 * Implements Step 1: POST /invoices/:quotation_id
 * Creates and saves an immutable invoice record directly in the backend database
 * with a specified due date, then updates the Manage Quotations table in real time.
 */
export default function CreateInvoiceModal({
  isOpen,
  onClose,
  quotation,
  onInvoiceCreated,
}) {
  const navigate = useNavigate();

  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0]; // YYYY-MM-DD
  });

  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [quotationDetails, setQuotationDetails] = useState(null);
  const [createdInvoice, setCreatedInvoice] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Reset state on modal open and fetch complete quotation details if needed
  useEffect(() => {
    if (!isOpen || !quotation?.id) {
      setCreatedInvoice(null);
      setErrorMessage("");
      setQuotationDetails(null);
      return;
    }

    setCreatedInvoice(null);
    setErrorMessage("");
    const d = new Date();
    d.setDate(d.getDate() + 14);
    setDueDate(d.toISOString().split("T")[0]);

    let active = true;
    const fetchFullDetails = async () => {
      try {
        setDetailsLoading(true);
        const res = await axiosInstance.get(`/quotations/${quotation.id}`);
        if (active) {
          setQuotationDetails(res.data?.data || res.data);
        }
      } catch (err) {
        console.warn("Could not preload full quotation breakdown", err);
      } finally {
        if (active) setDetailsLoading(false);
      }
    };

    fetchFullDetails();

    return () => {
      active = false;
    };
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

  const resolvedQuotation = quotationDetails?.quotation || quotation;
  const customer = resolvedQuotation.customer || quotation.customer || {};
  const items = resolvedQuotation.items || quotation.items || [];

  // Determine grand total from server breakdown or calculate fallback
  let grandTotal = 0;
  if (quotationDetails?.price_breakdown?.total !== undefined) {
    grandTotal = Number(quotationDetails.price_breakdown.total);
  } else {
    const subtotal = items.reduce((sum, line) => {
      const price =
        line.snap_selling_price !== null && line.snap_selling_price !== undefined
          ? Number(line.snap_selling_price)
          : Number(line.solar_item?.selling_price || 0);
      return sum + price * (Number(line.quantity) || 1);
    }, 0);

    let discountAmount = 0;
    if (resolvedQuotation.discount && resolvedQuotation.discount_type !== "NON") {
      if (resolvedQuotation.discount_type === "PERCENTAGE") {
        discountAmount = (subtotal * Number(resolvedQuotation.discount)) / 100;
      } else if (resolvedQuotation.discount_type === "FIXED") {
        discountAmount = Number(resolvedQuotation.discount);
      }
    }

    const taxableBase = Math.max(0, subtotal - discountAmount);
    let taxAmount = 0;
    if (resolvedQuotation.tax && resolvedQuotation.tax_type !== "NON") {
      if (resolvedQuotation.tax_type === "PERCENTAGE") {
        taxAmount = (taxableBase * Number(resolvedQuotation.tax)) / 100;
      } else if (resolvedQuotation.tax_type === "FIXED") {
        taxAmount = Number(resolvedQuotation.tax);
      }
    }
    grandTotal = Math.max(0, subtotal - discountAmount + taxAmount);
  }

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

      // Initialize price freshness timestamp in database (PUT /invoices/:invoice_id/:quotation_id)
      if (newInvoice?.id && quotation?.id) {
        try {
          await axiosInstance.put(`/invoices/${newInvoice.id}/${quotation.id}`);
          newInvoice.price_updated_at = new Date().toISOString();
        } catch (syncErr) {
          console.warn("Could not set initial price_updated_at:", syncErr);
        }
      }

      setCreatedInvoice(newInvoice);
      toast.success(
        `Invoice ${newInvoice.invoice_number || ""} created and saved successfully!`
      );

      // Trigger real-time UI update on the table row without page refresh
      if (onInvoiceCreated) {
        onInvoiceCreated(newInvoice);
      }
    } catch (err) {
      console.error("Failed to create invoice", err);
      if (err.response?.status === 409) {
        const errorText =
          "An invoice has already been generated in the database for this quotation.";
        setErrorMessage(errorText);
        toast.error("Invoice already exists for this quotation.");
      } else {
        const msg = err.response?.data?.message;
        const displayMsg = Array.isArray(msg)
          ? msg.join(", ")
          : msg || err.message || "Failed to create invoice";
        setErrorMessage(displayMsg);
        toast.error(displayMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

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
                Calls POST /invoices/:quotation_id to initialize and save invoice records
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
                <span className="text-xs text-slate-500 uppercase font-semibold">
                  Invoice Number:
                </span>
                <span className="font-mono font-bold text-blue-700 text-sm">
                  {createdInvoice.invoice_number}
                </span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-emerald-100 flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500 uppercase font-semibold">
                  Total Invoiced:
                </span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {formatPrice(createdInvoice.total || grandTotal)}
                </span>
              </div>

              <p className="text-[11px] text-slate-600">
                The invoice has been saved and is now ready in Manage Invoices. You can view its full breakdown, generate the official PDF, and send it to the customer.
              </p>

              {/* Follow-up actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate("/admin/invoices");
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs shadow-blue-500/20 flex items-center justify-center gap-2 transition cursor-pointer active:scale-[0.98]"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Go to Manage Invoices</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Error Notice if any */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex flex-col gap-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="font-bold block">Could not create invoice:</span>
                      <span>{errorMessage}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate("/admin/invoices");
                    }}
                    className="self-start text-[11px] font-semibold text-blue-700 hover:text-blue-800 underline flex items-center gap-1 cursor-pointer"
                  >
                    View existing invoice in Manage Invoices &rarr;
                  </button>
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
                        <p className="text-[11px] text-amber-600 italic mt-0.5">
                          No email on file
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="w-full sm:w-auto flex items-center sm:flex-col sm:items-end justify-between sm:justify-center px-3 py-1.5 sm:px-3 sm:py-1 bg-white sm:bg-blue-50/50 rounded-lg sm:rounded-xl border border-slate-200/80 sm:border-blue-100/80 shrink-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 sm:text-blue-600/80 tracking-wider">
                      Total Invoiced Amount
                    </span>
                    <span className="text-sm font-mono font-extrabold text-blue-700">
                      {detailsLoading ? "Calculating..." : formatPrice(grandTotal)}
                    </span>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-200/70 grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px] text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase tracking-wider">
                      Status
                    </span>
                    <span className="font-semibold text-slate-800">{quotation.status}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase tracking-wider">
                      Line Items
                    </span>
                    <span className="font-semibold text-slate-800">
                      {items.length > 0 ? `${items.length} items` : "Included in quotation"}
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
                    min={todayStr}
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
