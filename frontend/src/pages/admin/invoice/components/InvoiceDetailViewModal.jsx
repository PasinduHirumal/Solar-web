import React, { useState, useEffect } from "react";
import { X, Receipt, Loader2 } from "lucide-react";
import { axiosInstance } from "../../../../lib/axiosInstance";
import { generateInvoicePdf } from "../../../../lib/generateInvoicePdf";
import { updateInvoicePrices } from "../../../../lib/invoicePdfEnricher";
import InvoiceDetails from "./InvoiceDetails";
import { toast } from "react-hot-toast";

export default function InvoiceDetailViewModal({
  isOpen,
  onClose,
  invoice,
  quotation,
  onOpenSendModal,
  onOpenPaymentModal,
  onInvoiceUpdated,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [syncStatusText, setSyncStatusText] = useState("");
  const [updatingPrices, setUpdatingPrices] = useState(false);

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

  // Fetch full invoice specifications and price breakdown safely
  useEffect(() => {
    if (!isOpen || !invoice?.id) return;

    let active = true;

    const fetchInvoiceDetails = async () => {
      const quoId = invoice.quotation_id || invoice.quotation?.id || quotation?.id;
      const quoStatus = invoice.quotation?.status || quotation?.status;
      const isFinalized = quoStatus === "ACCEPTED" || quoStatus === "REJECTED";
      const isStale =
        !isFinalized &&
        (!invoice.price_updated_at ||
          Date.now() - new Date(invoice.price_updated_at).getTime() > 50000);

      try {
        setLoading(true);

        let canFetchDirectly = !isStale;

        // Proactively synchronize prices before calling GET /invoices/:id to avoid backend 400 BadRequestException
        if (isStale && quoId) {
          try {
            setSyncStatusText("Synchronizing latest price breakdown with catalog...");
            await axiosInstance.put(`/invoices/${invoice.id}/${quoId}`);
            canFetchDirectly = true;
          } catch (syncErr) {
            console.warn("Could not pre-sync prices via PUT /invoices/:id/:quoId:", syncErr);
            canFetchDirectly = false;
          }
        }

        if (canFetchDirectly) {
          setSyncStatusText("Loading invoice specifications and price breakdown...");
          const res = await axiosInstance.get(`/invoices/${invoice.id}`);
          const inv = res.data?.data || res.data;
          if (active && inv) {
            setData(inv);
            if (isStale && onInvoiceUpdated) {
              onInvoiceUpdated(inv);
            }
            return;
          }
        }

        // If prices were stale and could not be pre-synced, do NOT call GET /invoices/:id (prevents backend 400).
        // Instead, load quotation details to ensure line items and customer information are available.
        if (active && quoId) {
          try {
            const quoRes = await axiosInstance.get(`/quotations/${quoId}`);
            const quo =
              quoRes.data?.data?.quotation ||
              quoRes.data?.quotation ||
              quoRes.data?.data ||
              quoRes.data;
            if (active && quo) {
              setData({
                ...invoice,
                quotation: quo,
                customer: invoice.customer || quo.customer,
                snap_customer_phone: invoice.snap_customer_phone || quo.snap_customer_phone,
                snap_customer_address: invoice.snap_customer_address || quo.snap_customer_address,
              });
              return;
            }
          } catch (quoErr) {
            console.warn("Could not load quotation details:", quoErr);
          }
        }

        if (active) setData(invoice);
      } catch (err) {
        console.error("Failed to load invoice details:", err);
        if (active) setData(invoice);
      } finally {
        if (active) {
          setLoading(false);
          setSyncStatusText("");
        }
      }
    };

    fetchInvoiceDetails();

    return () => {
      active = false;
    };
  }, [isOpen, invoice?.id, invoice?.price_updated_at]);

  if (!isOpen || !invoice) return null;

  const currentInvoice = data || invoice;
  const currentQuotation = currentInvoice.quotation || quotation || {};
  const isFinalized = currentQuotation.status === "ACCEPTED" || currentQuotation.status === "REJECTED";

  const handleDownloadPdf = () => {
    try {
      const result = generateInvoicePdf({
        invoice: currentInvoice,
      });

      const a = document.createElement("a");
      a.href = result.url;
      a.download = result.file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Invoice PDF downloaded successfully!");
    } catch (err) {
      console.error("Download PDF error", err);
      toast.error("Failed to generate PDF download.");
    }
  };

  const handlePreviewPdf = () => {
    try {
      const result = generateInvoicePdf({
        invoice: currentInvoice,
      });

      window.open(result.url, "_blank");
    } catch (err) {
      console.error("Preview PDF error", err);
      toast.error("Failed to preview invoice PDF.");
    }
  };

  const handleUpdatePrices = async () => {
    const quoId = currentQuotation?.id || invoice?.quotation_id;
    if (!invoice?.id || !quoId) {
      toast.error("Quotation reference missing. Cannot update prices.");
      return;
    }

    try {
      setUpdatingPrices(true);
      const freshInv = await updateInvoicePrices(invoice.id, quoId);
      toast.success("Invoice prices updated to latest catalog prices!");
      setData(freshInv);

      if (onInvoiceUpdated) {
        onInvoiceUpdated(freshInv);
      }
    } catch (err) {
      console.error("Failed to update invoice prices:", err);
      const msg = err.response?.data?.message;
      toast.error(
        Array.isArray(msg)
          ? msg.join(", ")
          : msg || err.message || "Failed to update prices"
      );
    } finally {
      setUpdatingPrices(false);
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
        className="bg-white rounded-2xl shadow-2xl max-w-2xl sm:max-w-3xl w-full border border-slate-200/90 overflow-hidden flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[90vh]"
      >
        {/* Header - Fixed */}
        <div className="flex items-start justify-between px-4 py-3 sm:px-5 sm:py-3.5 border-b border-slate-100 bg-slate-50/70 shrink-0 gap-2">
          <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shadow-2xs shrink-0 mt-0.5">
              <Receipt className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                  Invoice Details
                </h3>
                {currentInvoice.invoice_number && (
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60 shadow-2xs">
                    {currentInvoice.invoice_number}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Comprehensive customer invoice, payment breakdown, and commercial equipment
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

        {/* Content - Scrollable */}
        <div className="p-3.5 sm:p-5 pb-8 sm:pb-8 space-y-3.5 sm:space-y-4 overflow-y-auto custom-scrollbar flex-1 min-h-0">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-3 text-xs font-medium text-blue-600 bg-blue-50/50 rounded-xl border border-blue-100">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{syncStatusText || "Loading invoice specifications and price breakdown..."}</span>
            </div>
          )}

          <InvoiceDetails
            invoice={currentInvoice}
            quotation={currentQuotation}
            onDownloadPdf={handleDownloadPdf}
            onPreviewPdf={handlePreviewPdf}
            onOpenPaymentModal={onOpenPaymentModal}
            onUpdatePrices={handleUpdatePrices}
            updatingPrices={updatingPrices}
            onOpenSendModal={
              onOpenSendModal
                ? () => {
                    onClose();
                    onOpenSendModal(currentQuotation, currentInvoice);
                  }
                : undefined
            }
          />
        </div>

        {/* Sticky Footer */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-slate-50/80 border-t border-slate-100 shrink-0 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-2xs hover:border-slate-300 transition cursor-pointer active:scale-[0.98] text-center"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
