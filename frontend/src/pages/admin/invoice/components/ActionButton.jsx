import React, { useState } from "react";
import { Eye, Mail, CreditCard } from "lucide-react";
import InvoiceDetailViewModal from "./InvoiceDetailViewModal";
import RecordPaymentModal from "./RecordPaymentModal";

export default function ActionButton({
  invoice,
  quotation,
  onOpenDetailModal,
  onOpenPaymentModal,
  onOpenSendModal,
  onUpdateInvoice,
}) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const handleOpenDetail = () => {
    if (onOpenDetailModal) {
      onOpenDetailModal(invoice, quotation);
    } else {
      setIsDetailOpen(true);
    }
  };

  const handleOpenPayment = () => {
    if (onOpenPaymentModal) {
      onOpenPaymentModal(invoice, quotation);
    } else {
      setIsPaymentOpen(true);
    }
  };

  const handleSendEmail = () => {
    if (!onOpenSendModal) return;
    onOpenSendModal(invoice.quotation || quotation, invoice);
  };

  const quoStatus = invoice.quotation?.status || quotation?.status;
  const isFinalized = quoStatus === "ACCEPTED" || quoStatus === "REJECTED";
  const isQuoAccepted = quoStatus === "ACCEPTED";

  const isPaidInFull =
    invoice.payment_status === "PAID" ||
    (invoice.total > 0 && invoice.paid_amount >= invoice.total);

  return (
    <>
      <div className="flex items-center justify-end gap-1.5">
        {/* View Details Button */}
        <button
          onClick={handleOpenDetail}
          className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all rounded-lg border border-slate-200/80 shadow-2xs cursor-pointer flex items-center justify-center"
          title="View Invoice Details"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>

        {/* Add Payment / View Transactions Button */}
        <button
          onClick={handleOpenPayment}
          className={`w-7 h-7 transition-all rounded-lg border shadow-2xs cursor-pointer flex items-center justify-center ${
            isPaidInFull
              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border-emerald-200/70"
              : "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border-emerald-200/60"
          }`}
          title={
            isPaidInFull
              ? "View Payment Transaction History (Paid in Full)"
              : !isQuoAccepted
              ? "View Settlement History (Quotation Not Approved Yet)"
              : "Record Payment / View Transactions"
          }
        >
          <CreditCard className="w-3.5 h-3.5" />
        </button>

        {/* Send / Resend Invoice Email Button (Quotation must not be finalized) */}
        {onOpenSendModal && !isFinalized && (
          <button
            onClick={handleSendEmail}
            className="w-7 h-7 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all rounded-lg border border-indigo-200/60 shadow-2xs cursor-pointer flex items-center justify-center"
            title="Send Invoice to Customer Email"
          >
            <Mail className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Fallback Modals if not managed at page level */}
      {!onOpenDetailModal && (
        <InvoiceDetailViewModal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          invoice={invoice}
          quotation={quotation}
          onOpenSendModal={onOpenSendModal}
          onOpenPaymentModal={() => {
            setIsDetailOpen(false);
            setIsPaymentOpen(true);
          }}
          onInvoiceUpdated={onUpdateInvoice}
        />
      )}

      {!onOpenPaymentModal && (
        <RecordPaymentModal
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          invoice={invoice}
          quotation={quotation}
          onPaymentSuccess={(updatedInv) => {
            if (onUpdateInvoice) {
              onUpdateInvoice(updatedInv);
            }
          }}
        />
      )}
    </>
  );
}
