import React from "react";
import {
  FileText, User, Phone, Mail, MapPin, Calendar, Download, Eye, CreditCard, ShieldCheck, Building2, Clock, RefreshCw, Loader2,
} from "lucide-react";
import { formatPrice } from "../../../../lib/formatPrice";
import { paymentDetails } from "../../../../data/dataset";

export default function InvoiceDetails({
  invoice,
  quotation: fallbackQuotation,
  onGeneratePdf,
  onDownloadPdf,
  onPreviewPdf,
  onOpenSendModal,
  onOpenPaymentModal,
  onUpdatePrices,
  updatingPrices,
}) {
  if (!invoice) return null;

  const currentQuo = invoice.quotation || fallbackQuotation || {};
  const customer = invoice.customer || currentQuo.customer || {};
  const customerPhone = invoice.snap_customer_phone || currentQuo.snap_customer_phone || customer.phone;
  const customerAddress = invoice.snap_customer_address || currentQuo.snap_customer_address || customer.address;
  const items = currentQuo.items || [];
  const isFinalized = currentQuo.status === "ACCEPTED" || currentQuo.status === "REJECTED";
  const isRejected = currentQuo.status === "REJECTED";
  const isPaid = invoice.payment_status === "PAID";

  const subtotal = invoice.subtotal || 0;
  const discount = invoice.discount || 0;
  const tax = invoice.tax || 0;
  const total = invoice.total || 0;
  const paidAmount = invoice.paid_amount || 0;
  const balanceDue = Math.max(0, total - paidAmount);

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case "PAID":
        return {
          pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
          dot: "bg-emerald-500",
          text: "Paid in Full",
        };
      case "PARTIAL":
        return {
          pill: "bg-purple-50 text-purple-700 border-purple-200",
          dot: "bg-purple-500",
          text: "Partially Settled",
        };
      case "ADVANCED":
        return {
          pill: "bg-blue-50 text-blue-700 border-blue-200",
          dot: "bg-blue-500",
          text: "Advance Payment Received",
        };
      default:
        return {
          pill: "bg-amber-50 text-amber-700 border-amber-200",
          dot: "bg-amber-500",
          text: "Payment Pending",
        };
    }
  };

  const badge = getPaymentStatusBadge(invoice.payment_status);

  return (
    <div className="space-y-4 text-left">
      {/* Top Banner Card */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/70 shadow-2xs">
              {invoice.invoice_number || "Invoice"}
            </span>
            {currentQuo.quotation_number && (
              <span className="font-mono text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                Ref: {currentQuo.quotation_number}
              </span>
            )}
            {currentQuo.status && (
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Quote: {currentQuo.status}
              </span>
            )}
          </div>
          <h2 className="text-base font-bold text-slate-900 truncate">
            {customer.name ? `Invoice for ${customer.name}` : "Commercial Customer Invoice"}
          </h2>
          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 mt-1 font-medium">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Issued:{" "}
              {invoice.created_at
                ? new Date(invoice.created_at).toLocaleDateString()
                : "N/A"}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Due Date:{" "}
              {invoice.due_date
                ? new Date(invoice.due_date).toLocaleDateString()
                : "N/A"}
            </span>
            {invoice.price_updated_at && (
              <span className="flex items-center gap-1 text-slate-500">
                <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
                Prices Synced:{" "}
                {new Date(invoice.price_updated_at).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${badge.pill}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
            {badge.text}
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            Total: <strong className="text-slate-900 font-bold">{formatPrice(total)}</strong>
          </span>
        </div>
      </div>

      {/* Customer Information Card - Only rendered when backend customer data is present */}
      {(customer.name || customer.email || customerPhone || customerAddress) && (
        <div className="p-4 rounded-xl bg-slate-50/60 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs shadow-2xs">
          {customer.name && (
            <div className="flex items-center gap-2.5 text-slate-700 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Customer Name</span>
                <span className="font-bold text-slate-900 truncate block">{customer.name}</span>
              </div>
            </div>
          )}

          {customer.email && (
            <div className="flex items-center gap-2.5 text-slate-700 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Email Address</span>
                <span className="text-slate-700 truncate block">{customer.email}</span>
              </div>
            </div>
          )}

          {customerPhone && (
            <div className="flex items-center gap-2.5 text-slate-700 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                <Phone className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Phone Contact</span>
                <span className="font-mono text-slate-700 truncate block">{customerPhone}</span>
              </div>
            </div>
          )}

          {customerAddress && (
            <div className="flex items-center gap-2.5 text-slate-700 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Billing Address</span>
                <span className="text-slate-700 truncate block" title={customerAddress}>
                  {customerAddress}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Line Items Table (if quotation items loaded) */}
      {items.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Invoiced Hardware Equipment ({items.length})
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
                {items.map((line, idx) => {
                  const itemTitle = line.snap_title || "Solar Equipment";
                  const warranty = line.snap_warranty_period;
                  const unitPrice = Number(line.snap_selling_price || 0);
                  const qty = Number(line.quantity || 1);
                  const lineTotal = unitPrice * qty;

                  return (
                    <tr key={line.id || idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-2.5 px-3.5">
                        <p className="font-semibold text-slate-900">{itemTitle}</p>
                        {warranty && (
                          <div className="flex items-center gap-1.5 mt-0.5 text-[10px]">
                            <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                              <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                              {warranty}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-mono text-slate-700">
                        {formatPrice(unitPrice)}
                      </td>
                      <td className="py-2.5 px-3.5 text-center font-mono font-bold text-slate-800">
                        {qty}
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-mono font-bold text-slate-900">
                        {formatPrice(lineTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Financials & Balances Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Settlement Status Card & Bank Details */}
        <div className="p-4 rounded-xl bg-slate-50/60 border border-slate-200/80 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Payment & Settlement Overview
            </span>
            {onOpenPaymentModal && (
              <button
                type="button"
                onClick={onOpenPaymentModal}
                className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200/80 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                title={balanceDue <= 0 ? "View transaction & settlement history" : "Record customer payment"}
              >
                <CreditCard className="w-3 h-3" />
                <span>{balanceDue <= 0 ? "View Payments" : "Record Payment"}</span>
              </button>
            )}
          </div>
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Paid to Date:</span>
              <span className="font-mono font-bold text-emerald-700">
                {formatPrice(paidAmount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Balance Remaining:</span>
              <span className="font-mono font-bold text-amber-700">
                {formatPrice(balanceDue)}
              </span>
            </div>
            {total > 0 && (
              <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden my-1">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    balanceDue <= 0 ? "bg-emerald-600" : "bg-blue-600"
                  }`}
                  style={{
                    width: `${Math.min(100, Math.round((paidAmount / total) * 100))}%`,
                  }}
                />
              </div>
            )}
            <div className="pt-2 border-t border-slate-200 space-y-1 text-[11px] text-slate-600">
              <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                {paymentDetails.bankName}
              </span>
              <div className="text-[10px] text-slate-500 pl-5 space-y-0.5">
                <div>
                  Acc: <span className="font-mono font-semibold text-slate-700">{paymentDetails.accountNumber}</span> ({paymentDetails.accountName})
                </div>
                <div>Branch: {paymentDetails.branch} | Swift: {paymentDetails.swiftCode}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="p-4 rounded-xl bg-slate-50/60 border border-slate-200/80 shadow-2xs space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal:</span>
            <span className="font-mono font-semibold text-slate-900">
              {formatPrice(subtotal)}
            </span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Discount:</span>
              <span className="font-mono font-semibold">-{formatPrice(discount)}</span>
            </div>
          )}

          {tax > 0 && (
            <div className="flex justify-between text-amber-700">
              <span>Tax / VAT:</span>
              <span className="font-mono font-semibold">+{formatPrice(tax)}</span>
            </div>
          )}

          <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Total Invoiced:
            </span>
            <span className="font-mono font-extrabold text-blue-600 text-base">
              {formatPrice(total)}
            </span>
          </div>
        </div>
      </div>

      {/* Terms & Conditions, Notes & Cheque Notice - Only displayed when actual data exists */}
      {(Boolean(currentQuo.terms?.trim()) || Boolean(currentQuo.notes?.trim()) || Boolean(paymentDetails?.chequeNote)) && (
        <div className="space-y-2.5">
          {/* Terms & Conditions - Only rendered if actual data is received from backend */}
          {Boolean(currentQuo.terms?.trim()) && (
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 shadow-2xs space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Terms & Conditions
              </span>
              <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                {currentQuo.terms.trim()}
              </p>
            </div>
          )}

          {/* Notes - Displayed below Terms & Conditions if provided by backend */}
          {Boolean(currentQuo.notes?.trim()) && (
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 shadow-2xs space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Special Notes & Instructions
              </span>
              <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                {currentQuo.notes.trim()}
              </p>
            </div>
          )}

          {/* Cheque Notice - Displayed below Terms & Conditions and Notes */}
          {Boolean(paymentDetails?.chequeNote) && (
            <div className="px-4 py-2.5 rounded-xl bg-amber-50/60 border border-amber-200/70 text-[11px] text-amber-800 flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{paymentDetails.chequeNote}</span>
            </div>
          )}
        </div>
      )}

      {/* PDF Document Controls Bar */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-50/60 border border-blue-100/90 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 shadow-2xs">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-900 block">
              Official Commercial Invoice PDF
            </span>
            <span className="text-[11px] text-slate-500 block">
              Vector document with bank details & line items
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto">
          {onUpdatePrices && !isFinalized && (
            <button
              type="button"
              onClick={onUpdatePrices}
              disabled={updatingPrices}
              className="flex-1 md:flex-initial text-center justify-center px-3 py-1.5 bg-white text-blue-700 hover:bg-blue-50 border border-blue-200 rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              title="Sync latest prices from equipment catalog (PUT /invoices/:invoice_id/:quotation_id)"
            >
              {updatingPrices ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              <span>Sync Prices</span>
            </button>
          )}

          {onPreviewPdf && (
            <button
              type="button"
              onClick={onPreviewPdf}
              className="flex-1 md:flex-initial text-center justify-center px-3 py-1.5 bg-white text-blue-700 hover:bg-blue-100/70 border border-blue-200 rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          )}

          {onDownloadPdf && (
            <button
              type="button"
              onClick={onDownloadPdf}
              className="flex-1 md:flex-initial text-center justify-center px-3 py-1.5 bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          )}

          {onOpenSendModal && !isRejected && (
            <button
              type="button"
              onClick={onOpenSendModal}
              disabled={isPaid}
              className={`flex-1 md:flex-initial text-center justify-center px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition ${
                isPaid
                  ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 cursor-pointer active:scale-[0.98]"
              }`}
              title={
                isPaid
                  ? "Invoice is paid in full (Cannot be resent)"
                  : "Send invoice PDF to customer email"
              }
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{isPaid ? "Paid in Full" : "Send Email"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
