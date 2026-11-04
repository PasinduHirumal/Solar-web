import React, { useState, useEffect } from "react";
import { X, Receipt, Loader2, Download, Eye, Mail } from "lucide-react";
import { generateInvoicePdf } from "../../../../lib/generateInvoicePdf";
import { enrichInvoiceAndQuotation } from "../../../../lib/invoicePdfEnricher";
import InvoiceDetails from "./InvoiceDetails";
import { toast } from "react-hot-toast";

export default function InvoiceDetailViewModal({
  isOpen,
  onClose,
  invoice,
  onOpenSendModal,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

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

  // Fetch full invoice with price breakdown, enriched line items, and solar item categories
  useEffect(() => {
    if (!isOpen || !invoice?.id) {
      setData(null);
      return;
    }

    let active = true;

    const fetchInvoiceDetails = async () => {
      try {
        setLoading(true);

        const { enrichedInvoice } = await enrichInvoiceAndQuotation(
          invoice,
          invoice.quotation
        );

        if (active) {
          setData(enrichedInvoice);
        }
      } catch (err) {
        console.error("Failed to load invoice details", err);
        if (active) setData(invoice);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchInvoiceDetails();

    return () => {
      active = false;
    };
  }, [isOpen, invoice]);

  if (!isOpen || !invoice) return null;

  const currentInvoice = data || invoice;
  const currentQuotation = currentInvoice.quotation || {};

  const handleDownloadPdf = () => {
    try {
      const result = generateInvoicePdf({
        invoice: currentInvoice,
        quotation: currentQuotation,
        customer: currentQuotation.customer,
        items: currentQuotation.items || [],
        dueDate: currentInvoice.due_date,
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
        quotation: currentQuotation,
        customer: currentQuotation.customer,
        items: currentQuotation.items || [],
        dueDate: currentInvoice.due_date,
      });

      window.open(result.url, "_blank");
    } catch (err) {
      console.error("Preview PDF error", err);
      toast.error("Failed to preview invoice PDF.");
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
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200/90 overflow-hidden flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[90vh]"
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
              <span>Loading invoice specifications and price breakdown...</span>
            </div>
          )}

          <InvoiceDetails
            invoice={currentInvoice}
            quotation={currentQuotation}
            onDownloadPdf={handleDownloadPdf}
            onPreviewPdf={handlePreviewPdf}
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

        {/* Footer */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-slate-50/80 border-t border-slate-100 shrink-0 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handlePreviewPdf}
              className="flex-1 sm:flex-initial text-center justify-center px-3 py-2 sm:py-1.5 bg-white text-blue-700 hover:bg-blue-50 border border-blue-200 rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview PDF</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="flex-1 sm:flex-initial text-center justify-center px-3 py-2 sm:py-1.5 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            {onOpenSendModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSendModal(currentQuotation, currentInvoice);
                }}
                className="w-full sm:w-auto text-center justify-center px-3.5 py-2 sm:py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs shadow-blue-500/20 flex items-center gap-1.5 transition cursor-pointer active:scale-[0.98]"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send Email</span>
              </button>
            )}
          </div>

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
