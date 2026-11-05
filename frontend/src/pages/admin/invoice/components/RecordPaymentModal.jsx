import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  X,
  CreditCard,
  DollarSign,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
  Receipt,
  User,
  History,
  ShieldAlert,
  RotateCcw,
} from "lucide-react";
import { axiosInstance } from "../../../../lib/axiosInstance";
import { formatPrice } from "../../../../lib/formatPrice";
import { fetchInvoiceWithBreakdown } from "../../../../lib/invoicePdfEnricher";

/**
 * RecordPaymentModal
 * Integrates backend payments.controller.ts:
 * 1. POST /payments/:invoice_id/add/payment - Record an advance, partial, final, or full settlement
 * 2. GET  /payments?invoice_id=:invoice_id  - Retrieve chronological payment history & transaction ledger
 * 3. PUT  /payments/:invoice_id/:payment_id/revoke - Revoke a recorded payment with mandatory reason
 */
export default function RecordPaymentModal({
  isOpen,
  onClose,
  invoice,
  quotation: fallbackQuotation,
  onPaymentSuccess,
}) {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [paymentsList, setPaymentsList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentInvoiceState, setCurrentInvoiceState] = useState(invoice);

  // Payment Revocation State
  const [revokingPayment, setRevokingPayment] = useState(null);
  const [revocationReason, setRevocationReason] = useState("");
  const [revoking, setRevoking] = useState(false);
  const [revokeError, setRevokeError] = useState("");

  // Sync invoice prop to local state
  useEffect(() => {
    setCurrentInvoiceState(invoice);
  }, [invoice]);

  const activeInvoice = currentInvoiceState || invoice;
  const currentQuotation =
    activeInvoice?.quotation || fallbackQuotation || {};
  const customer = currentQuotation.customer || activeInvoice?.customer || {};

  const total = Number(activeInvoice?.total || 0);
  const paid = Number(activeInvoice?.paid_amount || 0);
  const balance = Math.max(0, Math.round((total - paid) * 100) / 100);
  const percentPaid = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;

  const isQuotationAccepted = currentQuotation.status === "ACCEPTED";
  const isFullySettled = balance <= 0 || activeInvoice?.payment_status === "PAID";

  // Fetch chronological payment history
  const loadPaymentHistory = useCallback(async () => {
    if (!activeInvoice?.id) return;
    try {
      setLoadingHistory(true);
      const res = await axiosInstance.get("/payments", {
        params: {
          invoice_id: activeInvoice.id,
          limit: 50,
          sort_order: "DESC",
        },
      });
      const data = res.data?.data || res.data;
      setPaymentsList(data.items || []);
    } catch (err) {
      console.warn("Could not load payment history", err);
    } finally {
      setLoadingHistory(false);
    }
  }, [activeInvoice?.id]);

  // Reset state on open and load payments
  useEffect(() => {
    if (isOpen && activeInvoice?.id) {
      setAmount("");
      setErrorMessage("");
      loadPaymentHistory();
    }
  }, [isOpen, activeInvoice?.id, loadPaymentHistory]);

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

  if (!isOpen || !activeInvoice) return null;

  // Determine what PaymentType will be assigned by backend rules
  const numAmount = Number(amount) || 0;
  const isFirstPayment = paid === 0;
  const isSettledAfterThis = numAmount >= balance && balance > 0;

  let projectedType = "";
  if (numAmount > 0 && numAmount <= balance) {
    if (isFirstPayment && isSettledAfterThis) projectedType = "FULL";
    else if (isFirstPayment) projectedType = "ADVANCE";
    else if (isSettledAfterThis) projectedType = "FINAL";
    else projectedType = "PARTIAL";
  }

  const handleQuickAmount = (val) => {
    const rounded = Math.round(val * 100) / 100;
    setAmount(String(rounded));
    setErrorMessage("");
  };

  const handleRecordPayment = async (e) => {
    e?.preventDefault();
    setErrorMessage("");

    if (!isQuotationAccepted) {
      const msg = `Please approve quotation ${currentQuotation.quotation_number || ""} in Manage Quotations before recording payments.`;
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    if (numAmount < 0.1) {
      toast.error("Please enter a valid payment amount (minimum LKR 0.10)");
      return;
    }

    if (numAmount > balance) {
      const msg = `Amount exceeds remaining balance. Maximum payable is ${formatPrice(balance)}`;
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    try {
      setSubmitting(true);

      // Endpoint: POST /payments/:invoice_id/add/payment
      const response = await axiosInstance.post(
        `/payments/${activeInvoice.id}/add/payment`,
        { amount: numAmount }
      );
      const createdPayment = response.data?.data || response.data;

      toast.success(
        `Payment of ${formatPrice(numAmount)} recorded successfully as ${createdPayment?.payment_type || projectedType}!`
      );

      setAmount("");

      // Re-fetch payment history
      await loadPaymentHistory();

      // Fetch updated invoice from backend: GET /invoices/:invoice_id (with auto-refresh)
      const quoId = activeInvoice.quotation_id || currentQuotation.id;
      let updatedInvoice = {
        ...activeInvoice,
        paid_amount: Math.round((paid + numAmount) * 100) / 100,
        payment_status:
          numAmount >= balance
            ? "PAID"
            : paid === 0
            ? "ADVANCED"
            : "PARTIAL",
      };

      try {
        const fullInv = await fetchInvoiceWithBreakdown(activeInvoice.id, quoId);
        if (fullInv?.id) {
          updatedInvoice = {
            ...updatedInvoice,
            ...fullInv,
          };
        }
      } catch (invErr) {
        console.warn("Could not reload invoice from backend:", invErr);
      }

      setCurrentInvoiceState(updatedInvoice);

      if (onPaymentSuccess) {
        onPaymentSuccess(updatedInvoice, createdPayment);
      }
    } catch (err) {
      console.error("Payment failed", err);
      const msg = err.response?.data?.message;
      const displayMsg = Array.isArray(msg)
        ? msg.join(", ")
        : msg || err.message || "Failed to record payment";
      setErrorMessage(displayMsg);
      toast.error(displayMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Payment Revocation Handlers (PUT /payments/:invoice_id/:payment_id/revoke)
  const handleOpenRevoke = (payment) => {
    setRevokingPayment(payment);
    setRevocationReason("");
    setRevokeError("");
  };

  const handleCancelRevoke = () => {
    setRevokingPayment(null);
    setRevocationReason("");
    setRevokeError("");
  };

  const handleConfirmRevoke = async (e) => {
    e?.preventDefault();
    if (!revokingPayment) return;

    const trimmed = revocationReason.trim();
    if (trimmed.length < 3) {
      setRevokeError("Revocation reason must be at least 3 characters long.");
      return;
    }
    if (trimmed.length > 500) {
      setRevokeError("Revocation reason cannot exceed 500 characters.");
      return;
    }

    try {
      setRevoking(true);
      setRevokeError("");

      const response = await axiosInstance.put(
        `/payments/${activeInvoice.id}/${revokingPayment.id}/revoke`,
        { revoked_reason: trimmed }
      );
      const updatedPayment = response.data?.data || response.data;

      toast.success(
        `Payment of ${formatPrice(revokingPayment.amount)} revoked successfully.`
      );

      setRevokingPayment(null);
      setRevocationReason("");

      // Reload payment history
      await loadPaymentHistory();

      // Reload invoice from backend
      const quoId = activeInvoice.quotation_id || currentQuotation.id;
      let updatedInvoice = {
        ...activeInvoice,
        paid_amount: Math.max(
          0,
          Math.round(((activeInvoice.paid_amount || 0) - revokingPayment.amount) * 100) / 100
        ),
      };

      try {
        const fullInv = await fetchInvoiceWithBreakdown(activeInvoice.id, quoId);
        if (fullInv?.id) {
          updatedInvoice = {
            ...updatedInvoice,
            ...fullInv,
          };
        }
      } catch (invErr) {
        console.warn("Could not refetch invoice after payment revoke:", invErr);
      }

      setCurrentInvoiceState(updatedInvoice);

      if (onPaymentSuccess) {
        onPaymentSuccess(updatedInvoice, updatedPayment);
      }
    } catch (err) {
      console.error("Revoke payment error:", err);
      const msg = err.response?.data?.message;
      const displayMsg = Array.isArray(msg)
        ? msg.join(", ")
        : msg || err.message || "Failed to revoke payment";
      setRevokeError(displayMsg);
      toast.error(displayMsg);
    } finally {
      setRevoking(false);
    }
  };

  const getPaymentTypeBadge = (type) => {
    switch (type) {
      case "FULL":
        return {
          pill: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
          text: "Full Settlement",
        };
      case "ADVANCE":
        return {
          pill: "bg-blue-50 text-blue-700 border-blue-200/80",
          text: "Advance Payment",
        };
      case "FINAL":
        return {
          pill: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
          text: "Final Settlement",
        };
      case "PARTIAL":
      default:
        return {
          pill: "bg-purple-50 text-purple-700 border-purple-200/80",
          text: "Partial Payment",
        };
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
        className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200/90 overflow-hidden flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-4 py-3 sm:px-5 sm:py-3.5 border-b border-slate-100 bg-slate-50/70 shrink-0 gap-2">
          <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shadow-2xs shrink-0 mt-0.5">
              <CreditCard className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                  Invoice Payment & Settlements
                </h3>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60 shadow-2xs">
                  {activeInvoice.invoice_number}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Record customer payments and view settlement history
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
        <div className="p-3.5 sm:p-5 pb-8 sm:pb-8 space-y-4 overflow-y-auto custom-scrollbar flex-1 min-h-0">
          {/* Customer & Settlement Overview Card */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                  {(customer.name || "C").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-900 text-xs truncate">
                    {customer.name || "Customer Account"}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 font-medium">
                    <span>Ref: {currentQuotation.quotation_number || "—"}</span>
                    <span>•</span>
                    <span
                      className={`font-semibold ${
                        isQuotationAccepted
                          ? "text-emerald-700"
                          : "text-amber-600"
                      }`}
                    >
                      Quotation: {currentQuotation.status || "DRAFT"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shadow-2xs ${
                    isFullySettled
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : paid > 0
                      ? "bg-purple-50 text-purple-700 border-purple-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isFullySettled
                        ? "bg-emerald-500"
                        : paid > 0
                        ? "bg-purple-500"
                        : "bg-amber-500"
                    }`}
                  />
                  {activeInvoice.payment_status || "PENDING"}
                </span>
              </div>
            </div>

            {/* Balances Grid */}
            <div className="pt-3 border-t border-slate-200/70 grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-white border border-slate-200/70 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Total Due
                </span>
                <span className="font-mono text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5 block truncate">
                  {formatPrice(total)}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-white border border-emerald-100 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-emerald-600 block tracking-wider">
                  Total Paid
                </span>
                <span className="font-mono text-xs sm:text-sm font-extrabold text-emerald-700 mt-0.5 block truncate">
                  {formatPrice(paid)}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-white border border-amber-100 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-amber-600 block tracking-wider">
                  Balance Remaining
                </span>
                <span className="font-mono text-xs sm:text-sm font-extrabold text-amber-700 mt-0.5 block truncate">
                  {formatPrice(balance)}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                <span>Settlement Progress</span>
                <span className="font-mono font-bold text-blue-700">
                  {percentPaid}%
                </span>
              </div>
              <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden shadow-inner">
                <div
                  className={`h-2 transition-all duration-500 rounded-full ${
                    isFullySettled
                      ? "bg-emerald-600"
                      : percentPaid > 0
                      ? "bg-blue-600"
                      : "bg-slate-300"
                  }`}
                  style={{ width: `${percentPaid}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quotation Status Check Notice if not Accepted */}
          {!isQuotationAccepted && (
            <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200/80 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-start gap-2.5 min-w-0">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="font-bold block text-amber-950">
                    Quotation Approval Required
                  </span>
                  <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                    Payments can only be added after the quotation is accepted. Please approve quotation{" "}
                    <span className="font-mono font-bold text-amber-950 bg-amber-100/70 px-1.5 py-0.5 rounded border border-amber-200/60">
                      {currentQuotation.quotation_number || "this quotation"}
                    </span>{" "}
                    first.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate("/admin/quotations");
                }}
                className="shrink-0 self-start sm:self-center px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition cursor-pointer active:scale-[0.98]"
              >
                <span>Manage Quotations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Fully Settled Notice */}
          {isFullySettled && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold block">Invoice Fully Paid</span>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  All invoiced obligations have been cleared in full (Balance: LKR 0.00).
                </p>
              </div>
            </div>
          )}

          {/* Error Message Notice */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="font-bold block">Payment Error:</span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Payment Form (Only if not fully settled & quotation is accepted) */}
          {!isFullySettled && (
            <form onSubmit={handleRecordPayment} className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Payment Amount to Add <span className="text-rose-500">*</span>
                </label>
                {balance > 0 && (
                  <span className="text-[11px] text-slate-500">
                    Max payable:{" "}
                    <strong className="text-slate-800 font-mono">
                      {formatPrice(balance)}
                    </strong>
                  </span>
                )}
              </div>

              {/* Number Input */}
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-xs text-slate-400">
                  LKR
                </span>
                <input
                  type="number"
                  step="any"
                  min="0.1"
                  max={balance}
                  disabled={!isQuotationAccepted || submitting}
                  placeholder={`e.g. ${balance > 0 ? balance : 10000}`}
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setErrorMessage("");
                  }}
                  required
                  className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-mono font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>

              {/* Quick Preset Buttons */}
              {balance > 0 && isQuotationAccepted && (
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">
                    Presets:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQuickAmount(balance)}
                    className="px-2 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 text-slate-700 rounded-md border border-slate-200 text-[11px] font-semibold transition cursor-pointer"
                  >
                    Full Balance ({formatPrice(balance)})
                  </button>
                  {balance > 100 && (
                    <button
                      type="button"
                      onClick={() => handleQuickAmount(balance * 0.5)}
                      className="px-2 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-slate-700 rounded-md border border-slate-200 text-[11px] font-semibold transition cursor-pointer"
                    >
                      50% ({formatPrice(balance * 0.5)})
                    </button>
                  )}
                  {balance > 200 && (
                    <button
                      type="button"
                      onClick={() => handleQuickAmount(balance * 0.25)}
                      className="px-2 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-700 rounded-md border border-slate-200 text-[11px] font-semibold transition cursor-pointer"
                    >
                      25% ({formatPrice(balance * 0.25)})
                    </button>
                  )}
                </div>
              )}

              {/* Projected Payment Classification */}
              {projectedType && (
                <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100 text-[11px] text-emerald-800 flex items-center justify-between">
                  <span className="font-semibold">Projected Classification:</span>
                  <span className="font-mono font-bold px-2 py-0.5 rounded bg-white border border-emerald-200 text-emerald-700 text-[10px]">
                    {projectedType === "FULL"
                      ? "FULL SETTLEMENT (FULL)"
                      : projectedType === "ADVANCE"
                      ? "ADVANCE PAYMENT (ADVANCE)"
                      : projectedType === "FINAL"
                      ? "FINAL SETTLEMENT (FINAL)"
                      : "PARTIAL PAYMENT (PARTIAL)"}
                  </span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isQuotationAccepted || submitting || numAmount <= 0}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs shadow-emerald-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer active:scale-[0.98]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing Payment in Database...</span>
                  </>
                ) : (
                  <>
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Record Payment of {numAmount > 0 ? formatPrice(numAmount) : "Amount"}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Chronological Payment Transactions Ledger */}
          <div className="space-y-2 pt-2 border-t border-slate-200/80">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-blue-600" />
                <span>Transaction History ({paymentsList.length})</span>
              </h4>
              <span className="text-[10px] text-slate-400 font-medium">
                Settlement Ledger
              </span>
            </div>

            {loadingHistory ? (
              <div className="py-6 flex items-center justify-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200/70">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span>Loading transaction history...</span>
              </div>
            ) : paymentsList.length === 0 ? (
              <div className="py-6 px-4 text-center bg-slate-50/70 rounded-xl border border-slate-200/70 text-slate-400 text-xs">
                <CreditCard className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                <p className="font-semibold text-slate-600">No payment transactions yet</p>
                <p className="text-[11px] mt-0.5">
                  Record an advance or partial payment above to initiate the settlement ledger.
                </p>
              </div>
            ) : (
              <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-2xs divide-y divide-slate-100">
                {paymentsList.map((p, idx) => {
                  const isRevoked = p.status === "REVOKED";
                  const badge = getPaymentTypeBadge(p.payment_type);
                  const isCurrentlyRevoking = revokingPayment?.id === p.id;

                  return (
                    <div
                      key={p.id || idx}
                      className={`p-3 space-y-2 transition-colors text-xs ${
                        isRevoked
                          ? "bg-rose-50/30 hover:bg-rose-50/50"
                          : "hover:bg-slate-50/60"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                              isRevoked
                                ? "bg-rose-100 text-rose-700 border border-rose-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            }`}
                          >
                            #{paymentsList.length - idx}
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {isRevoked ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-rose-50 text-rose-700 border-rose-200 shadow-2xs">
                                  REVOKED
                                </span>
                              ) : (
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.pill}`}
                                >
                                  {badge.text}
                                </span>
                              )}
                              <span className="font-mono text-[10px] text-slate-400 truncate">
                                ID: {p.id?.substring(0, 8)}...
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-400">
                              {p.authorized_admin && (
                                <span className="flex items-center gap-1 text-slate-500">
                                  <User className="w-3 h-3 text-slate-400" />
                                  <span>
                                    By:{" "}
                                    <strong className="text-slate-700">
                                      {p.authorized_admin.name || p.authorized_admin.email}
                                    </strong>
                                  </span>
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                <span>
                                  {p.created_at
                                    ? new Date(p.created_at).toLocaleString()
                                    : "N/A"}
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                          <div className="text-left sm:text-right">
                            <span
                              className={`font-mono font-extrabold text-xs sm:text-sm block ${
                                isRevoked
                                  ? "text-slate-400 line-through"
                                  : "text-emerald-700"
                              }`}
                            >
                              +{formatPrice(p.amount)}
                            </span>
                            <span
                              className={`text-[10px] uppercase font-semibold block ${
                                isRevoked ? "text-rose-600" : "text-slate-400"
                              }`}
                            >
                              {isRevoked ? "Revoked" : "Recorded"}
                            </span>
                          </div>

                          {!isRevoked && (
                            <button
                              type="button"
                              onClick={() => handleOpenRevoke(p)}
                              className="px-2.5 py-1 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 rounded-md text-[11px] font-semibold transition cursor-pointer shadow-2xs flex items-center gap-1 shrink-0"
                              title="Revoke this payment with mandatory reason (PUT /payments/:invoice_id/:payment_id/revoke)"
                            >
                              <RotateCcw className="w-3 h-3 text-rose-500" />
                              <span>Revoke</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Revoked reason callout */}
                      {isRevoked && p.revoked_reason && (
                        <div className="p-2 rounded-lg bg-rose-50/80 border border-rose-200/70 text-[11px] text-rose-900 flex items-start gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <span className="font-bold text-rose-950">Revocation Reason: </span>
                            <span className="italic font-medium">"{p.revoked_reason}"</span>
                            {p.revoked_by_admin && (
                              <span className="block text-[10px] text-rose-700 mt-0.5">
                                Revoked by: {p.revoked_by_admin.name || p.revoked_by_admin.email}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Inline Revocation Form */}
                      {isCurrentlyRevoking && (
                        <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl space-y-2 mt-2 animate-fade-in">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                Revoke Payment #{paymentsList.length - idx} ({formatPrice(p.amount)})
                              </span>
                              <p className="text-[11px] text-rose-800 mt-0.5">
                                Revoking this payment will deduct {formatPrice(p.amount)} from the invoice's paid total and restore the pending balance.
                              </p>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-slate-700">
                              Revocation Reason <span className="text-rose-500">* (min 3 chars)</span>
                            </label>
                            <textarea
                              rows={2}
                              value={revocationReason}
                              onChange={(e) => {
                                setRevocationReason(e.target.value);
                                setRevokeError("");
                              }}
                              placeholder="e.g., Customer refund issued, duplicate payment entered, cheque returned unpaid..."
                              maxLength={500}
                              className="w-full p-2 bg-white border border-rose-200 rounded-lg text-xs text-slate-900 outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 shadow-2xs resize-none"
                            />
                            <div className="flex justify-between text-[10px] text-slate-500">
                              <span>
                                {revokeError ? (
                                  <strong className="text-rose-600">{revokeError}</strong>
                                ) : (
                                  "Required by backend UpdatePaymentDto"
                                )}
                              </span>
                              <span>{revocationReason.length} / 500</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={handleCancelRevoke}
                              disabled={revoking}
                              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleConfirmRevoke}
                              disabled={revoking || revocationReason.trim().length < 3}
                              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-2xs shadow-rose-500/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              {revoking ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>Revoking in Database...</span>
                                </>
                              ) : (
                                <>
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Confirm Revocation</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-slate-50/80 border-t border-slate-100 shrink-0 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2">
            {paymentsList.length > 0 && (() => {
              const activePayments = paymentsList.filter((p) => p.status !== "REVOKED");
              const revokedCount = paymentsList.length - activePayments.length;
              const activeTotal = activePayments.reduce(
                (sum, p) => sum + (Number(p.amount) || 0),
                0
              );

              return (
                <>
                  <span>
                    Total Active Settled:{" "}
                    <strong className="text-slate-900 font-mono font-bold">
                      {formatPrice(activeTotal)}
                    </strong>
                  </span>
                  {revokedCount > 0 && (
                    <span className="text-rose-700 font-semibold text-[10px] bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 shadow-2xs">
                      ({revokedCount} revoked)
                    </span>
                  )}
                </>
              );
            })()}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-2xs hover:border-slate-300 transition cursor-pointer active:scale-[0.98] text-center"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
