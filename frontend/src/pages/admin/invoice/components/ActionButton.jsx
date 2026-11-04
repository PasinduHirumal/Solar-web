import React, { useState } from "react";
import { Eye, Mail, Loader2 } from "lucide-react";
import { enrichInvoiceAndQuotation } from "../../../../lib/invoicePdfEnricher";
import InvoiceDetailViewModal from "./InvoiceDetailViewModal";

export default function ActionButton({
  invoice,
  quotation,
  onOpenSendModal,
  onUpdateInvoice,
}) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);

  const handleSendEmail = async () => {
    if (!onOpenSendModal) return;
    try {
      setSendLoading(true);
      const { enrichedInvoice, enrichedQuotation } =
        await enrichInvoiceAndQuotation(invoice, quotation);
      onOpenSendModal(enrichedQuotation, enrichedInvoice);
    } catch (err) {
      console.error("Send modal preparation error", err);
      onOpenSendModal(quotation || invoice.quotation, invoice);
    } finally {
      setSendLoading(false);
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

        {/* Send / Resend Invoice Email Button */}
        {onOpenSendModal && (
          <button
            onClick={handleSendEmail}
            disabled={sendLoading}
            className="w-7 h-7 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all rounded-lg border border-indigo-200/60 shadow-2xs cursor-pointer flex items-center justify-center disabled:opacity-50"
            title="Send Invoice to Customer Email"
          >
            {sendLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Mail className="w-3.5 h-3.5" />
            )}
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
