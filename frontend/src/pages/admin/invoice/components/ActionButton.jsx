import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { Eye, Download, Mail, ExternalLink, Loader2 } from "lucide-react";
import { generateInvoicePdf } from "../../../../lib/generateInvoicePdf";
import { enrichInvoiceAndQuotation } from "../../../../lib/invoicePdfEnricher";
import InvoiceDetailViewModal from "./InvoiceDetailViewModal";

export default function ActionButton({
  invoice,
  quotation,
  onOpenSendModal,
  onUpdateInvoice,
}) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setPdfLoading(true);
      const { enrichedInvoice, enrichedQuotation, enrichedItems } =
        await enrichInvoiceAndQuotation(invoice, quotation);

      const result = generateInvoicePdf({
        invoice: enrichedInvoice,
        quotation: enrichedQuotation,
        customer: enrichedQuotation.customer,
        items: enrichedItems,
        dueDate: enrichedInvoice.due_date,
      });

      const a = document.createElement("a");
      a.href = result.url;
      a.download = result.file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Invoice PDF downloaded successfully!");
    } catch (err) {
      console.error("PDF download error", err);
      toast.error("Failed to generate PDF download.");
    } finally {
      setPdfLoading(false);
    }
  };

  const handlePreview = async () => {
    try {
      setPdfLoading(true);
      const { enrichedInvoice, enrichedQuotation, enrichedItems } =
        await enrichInvoiceAndQuotation(invoice, quotation);

      const result = generateInvoicePdf({
        invoice: enrichedInvoice,
        quotation: enrichedQuotation,
        customer: enrichedQuotation.customer,
        items: enrichedItems,
        dueDate: enrichedInvoice.due_date,
      });

      window.open(result.url, "_blank");
    } catch (err) {
      console.error("PDF preview error", err);
      toast.error("Failed to preview PDF.");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!onOpenSendModal) return;
    try {
      setPdfLoading(true);
      const { enrichedInvoice, enrichedQuotation } =
        await enrichInvoiceAndQuotation(invoice, quotation);
      onOpenSendModal(enrichedQuotation, enrichedInvoice);
    } catch (err) {
      console.error("Send modal preparation error", err);
      onOpenSendModal(quotation || invoice.quotation, invoice);
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-1.5">
        {/* View Details Button */}
        <button
          onClick={() => setIsDetailOpen(true)}
          className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all rounded-lg border border-slate-200/80 shadow-2xs cursor-pointer flex items-center justify-center"
          title="View Invoice Details"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>

        {/* Download PDF Button */}
        <button
          onClick={handleDownload}
          disabled={pdfLoading}
          className="w-7 h-7 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all rounded-lg border border-blue-200/60 shadow-2xs cursor-pointer flex items-center justify-center disabled:opacity-50"
          title="Download Invoice PDF"
        >
          {pdfLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Send / Resend Invoice Email Button */}
        {onOpenSendModal && (
          <button
            onClick={handleSendEmail}
            disabled={pdfLoading}
            className="w-7 h-7 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all rounded-lg border border-indigo-200/60 shadow-2xs cursor-pointer flex items-center justify-center disabled:opacity-50"
            title="Send Invoice to Customer Email"
          >
            <Mail className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Invoice Detail View Modal */}
      <InvoiceDetailViewModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        invoice={invoice}
        onOpenSendModal={onOpenSendModal}
      />
    </>
  );
}
