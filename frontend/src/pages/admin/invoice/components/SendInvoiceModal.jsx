import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  X, FileText, Mail, Send, Loader2, Calendar, Eye, Download, Receipt, FileCheck, RefreshCw, AlertCircle,
} from "lucide-react";
import { axiosInstance } from "../../../../lib/axiosInstance";
import { formatPrice } from "../../../../lib/formatPrice";
import { generateInvoicePdf } from "../../../../lib/generateInvoicePdf";

export default function SendInvoiceModal({
  isOpen,
  onClose,
  quotation,
  invoice: propInvoice,
  onQuotationUpdated,
}) {
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [fullQuotation, setFullQuotation] = useState(quotation);
  const [existingInvoice, setExistingInvoice] = useState(propInvoice || null);

  // Form states
  const [dueDate, setDueDate] = useState(() => {
    if (propInvoice?.due_date) {
      return new Date(propInvoice.due_date).toISOString().split("T")[0];
    }
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0]; // YYYY-MM-DD
  });

  // Generated PDF state
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [generatedPdf, setGeneratedPdf] = useState(null); // { file, url, blob, invoiceNumber }
  const [sendingEmail, setSendingEmail] = useState(false);

  // Synchronize quotation & invoice prop
  useEffect(() => {
    if (quotation) {
      setFullQuotation(quotation);
    }
  }, [quotation]);

  useEffect(() => {
    if (propInvoice) {
      setExistingInvoice(propInvoice);
      if (propInvoice.due_date) {
        setDueDate(new Date(propInvoice.due_date).toISOString().split("T")[0]);
      }
    }
  }, [propInvoice]);

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

  // Load latest full quotation data with categories and check for existing invoice
  useEffect(() => {
    const quoId = quotation?.id || quotation?.quotation_id || propInvoice?.quotation_id || propInvoice?.quotation?.id;
    if (!isOpen || !quoId) {
      setGeneratedPdf(null);
      setExistingInvoice(null);
      return;
    }

    let active = true;

    const loadQuotationAndInvoice = async () => {
      try {
        setLoadingInitial(true);

        let inv = propInvoice || existingInvoice;
        if (inv?.id) {
          const isStale =
            !inv.price_updated_at ||
            Date.now() - new Date(inv.price_updated_at).getTime() > 50000;

          let canFetchDirectly = !isStale;

          // Proactively synchronize prices before calling GET /invoices/:id to avoid backend 400 error
          if (isStale && quoId) {
            try {
              await axiosInstance.put(`/invoices/${inv.id}/${quoId}`);
              canFetchDirectly = true;
            } catch (syncErr) {
              console.warn("Could not pre-sync prices in SendInvoiceModal:", syncErr);
              canFetchDirectly = false;
            }
          }

          if (canFetchDirectly) {
            try {
              const invRes = await axiosInstance.get(`/invoices/${inv.id}`);
              const freshInv = invRes.data?.data || invRes.data;
              if (active && freshInv?.id) {
                inv = freshInv;
                setExistingInvoice(freshInv);
                if (freshInv.due_date) {
                  setDueDate(new Date(freshInv.due_date).toISOString().split("T")[0]);
                }
                if (freshInv.quotation) {
                  setFullQuotation(freshInv.quotation);
                }
                if (isStale && onQuotationUpdated) {
                  onQuotationUpdated(freshInv);
                }
              }
            } catch (e) {
              console.warn("Could not load invoice by id:", e);
            }
          }
        }

        if (active && (!inv?.quotation?.items || inv.quotation.items.length === 0)) {
          try {
            const quoRes = await axiosInstance.get(`/quotations/${quoId}`);
            const loadedQuo =
              quoRes.data?.data?.quotation ||
              quoRes.data?.quotation ||
              quoRes.data?.data ||
              quoRes.data;
            if (active && loadedQuo?.id) {
              setFullQuotation(loadedQuo);
            }
          } catch (e) {
            console.warn("Could not load quotation by id:", e);
          }
        }
      } catch (err) {
        console.error("Failed to load invoice and quotation", err);
      } finally {
        if (active) setLoadingInitial(false);
      }
    };

    loadQuotationAndInvoice();

    return () => {
      active = false;
    };
  }, [isOpen, quotation?.id, propInvoice?.id, propInvoice?.quotation_id, propInvoice?.price_updated_at]);

  if (!isOpen || !quotation) return null;

  const customer = fullQuotation?.customer || quotation.customer || {};
  const items = fullQuotation?.items || quotation.items || [];
  const customerEmail = customer.email;
  const isRejected = fullQuotation?.status === "REJECTED";

  // Calculate pricing
  const subtotal = items.reduce((sum, line) => {
    const unitPrice =
      line.snap_selling_price !== null && line.snap_selling_price !== undefined
        ? Number(line.snap_selling_price)
        : Number(line.solar_item?.selling_price || 0);
    return sum + unitPrice * (Number(line.quantity) || 1);
  }, 0);

  let discountAmount = 0;
  if (fullQuotation?.discount && fullQuotation?.discount_type !== "NON") {
    if (fullQuotation.discount_type === "PERCENTAGE") {
      discountAmount = (subtotal * Number(fullQuotation.discount)) / 100;
    } else if (fullQuotation.discount_type === "FIXED") {
      discountAmount = Number(fullQuotation.discount);
    }
  }

  const taxableBase = Math.max(0, subtotal - discountAmount);
  let taxAmount = 0;
  if (fullQuotation?.tax && fullQuotation?.tax_type !== "NON") {
    if (fullQuotation.tax_type === "PERCENTAGE") {
      taxAmount = (taxableBase * Number(fullQuotation.tax)) / 100;
    } else if (fullQuotation.tax_type === "FIXED") {
      taxAmount = Number(fullQuotation.tax);
    }
  }

  const grandTotal = Math.max(0, subtotal - discountAmount + taxAmount);

  // 1. Generate PDF Directly on Frontend
  const handleGeneratePdf = () => {
    try {
      setGeneratingPdf(true);

      const targetInvoice = existingInvoice || {
        quotation: fullQuotation,
        due_date: dueDate,
        subtotal,
        discount: discountAmount,
        tax: taxAmount,
        total: grandTotal,
        paid_amount: Number(existingInvoice?.paid_amount || 0),
      };

      const result = generateInvoicePdf({
        invoice: targetInvoice,
        quotation: fullQuotation,
      });

      setGeneratedPdf(result);
      toast.success(`Invoice PDF generated successfully! Attached to modal.`);
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error("Failed to generate PDF. Please verify quotation details.");
    } finally {
      setGeneratingPdf(false);
    }
  };

  // 2. Send Invoice to Customer with attached PDF
  const handleSendInvoice = async () => {
    if (!customerEmail) {
      toast.error("Customer does not have an email address configured.");
      return;
    }

    if (!generatedPdf?.file) {
      toast.error("Please generate the Invoice PDF first before sending.");
      return;
    }

    try {
      setSendingEmail(true);

      let invoiceId = existingInvoice?.id;
      let freshInvoice = existingInvoice;

      // Step A: Ensure invoice record exists in backend
      if (!invoiceId) {
        try {
          const createRes = await axiosInstance.post(
            `/invoices/${quotation.id}`,
            {
              due_date: new Date(`${dueDate}T12:00:00`).toISOString(),
            }
          );
          freshInvoice = createRes.data?.data || createRes.data;
          invoiceId = freshInvoice?.id;
          setExistingInvoice(freshInvoice);
        } catch (createErr) {
          // If already exists, retrieve it
          if (createErr.response?.status === 409) {
            const listRes = await axiosInstance.get("/invoices", {
              params: {
                search_term: quotation.quotation_number,
                limit: 5,
              },
            });
            const all = listRes.data?.data?.items || listRes.data?.items || [];
            const found = all.find(
              (i) => i.quotation_id === quotation.id || i.quotation?.id === quotation.id
            );
            if (found) {
              invoiceId = found.id;
              freshInvoice = found;
              setExistingInvoice(found);
            }
          } else {
            throw createErr;
          }
        }
      }

      if (!invoiceId) {
        throw new Error("Unable to initialize invoice reference on backend.");
      }

      const quoId = quotation.id || quotation.quotation_id || freshInvoice?.quotation_id;

      // Step B: Ensure invoice prices are synchronized and fresh in backend (PUT /invoices/:invoice_id/:quotation_id)
      if (quoId && invoiceId) {
        try {
          await axiosInstance.put(`/invoices/${invoiceId}/${quoId}`);
        } catch (updateErr) {
          console.warn("Could not pre-update invoice prices:", updateErr);
        }
      }

      // Step C: Send invoice to customer with generated PDF attachment
      const formData = new FormData();
      formData.append("pdf", generatedPdf.file);

      try {
        await axiosInstance.post(`/invoices/${invoiceId}/send/email`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } catch (sendErr) {
        // If failed due to stale prices, update prices and retry send once
        const msg = sendErr.response?.data?.message;
        const isStale =
          sendErr.response?.status === 400 &&
          (typeof msg === "string" &&
            (msg.toLowerCase().includes("out of date") ||
              msg.toLowerCase().includes("update the invoice")));

        if (isStale && quoId) {
          await axiosInstance.put(`/invoices/${invoiceId}/${quoId}`);
          await axiosInstance.post(`/invoices/${invoiceId}/send/email`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
        } else {
          throw sendErr;
        }
      }

      toast.success(`Invoice sent successfully to ${customerEmail}!`);

      // Step C: Immediately update the corresponding row in Manage Quotations
      if (onQuotationUpdated) {
        onQuotationUpdated({
          ...fullQuotation,
          ...quotation,
          status: "SENT",
          updated_at: new Date().toISOString(),
        });
      }

      onClose();
    } catch (err) {
      console.error("Failed to send invoice", err);
      const msg = err.response?.data?.message;
      toast.error(
        Array.isArray(msg)
          ? msg.join(", ")
          : msg || err.message || "Failed to send invoice email"
      );
    } finally {
      setSendingEmail(false);
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
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shadow-2xs shrink-0 mt-0.5">
              <Receipt className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                  Send Invoice via Email
                </h3>
                {fullQuotation?.quotation_number && (
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60 shadow-2xs">
                    {fullQuotation.quotation_number}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Generate invoice PDF on frontend and dispatch directly to customer
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
          {loadingInitial && (
            <div className="flex items-center justify-center gap-2 py-3 text-xs font-medium text-blue-600 bg-blue-50/50 rounded-xl border border-blue-100">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading quotation details and invoice metadata...</span>
            </div>
          )}

          {isRejected && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2 shadow-2xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                Quotation status is <strong>REJECTED</strong>. Invoices cannot be transmitted for rejected quotations.
              </span>
            </div>
          )}

          {/* Customer & Quotation Summary Card */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
              {/* Customer Info */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                  {(customer.name || "C").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-slate-900 text-xs truncate">
                    {customer.name || "Customer Account"}
                  </h4>
                  {customerEmail ? (
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate mt-0.5">
                      <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{customerEmail}</span>
                    </p>
                  ) : (
                    <p className="text-[11px] text-amber-600 italic mt-0.5">No email on file</p>
                  )}
                </div>
              </div>

              {/* Total Payable Box */}
              <div className="w-full sm:w-auto flex items-center sm:flex-col sm:items-end justify-between sm:justify-center px-3 py-1.5 sm:px-3 sm:py-1 bg-white sm:bg-blue-50/50 rounded-lg sm:rounded-xl border border-slate-200/80 sm:border-blue-100/80 shrink-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 sm:text-blue-600/80 tracking-wider">
                  Total Payable
                </span>
                <span className="text-sm font-mono font-extrabold text-blue-700">
                  {formatPrice(grandTotal)}
                </span>
              </div>
            </div>

            <div className="pt-2.5 border-t border-slate-200/70 grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px] text-slate-600">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Quotation Status</span>
                <span className="font-semibold text-slate-800">{fullQuotation?.status}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Line Items</span>
                <span className="font-semibold text-slate-800">{items.length} items</span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Invoice Ref</span>
                <span className="font-mono font-semibold text-blue-700 break-all">
                  {existingInvoice?.invoice_number || "Will generate automatically"}
                </span>
              </div>
            </div>
          </div>

          {/* Terms & Notes - Only displayed when actual backend data is present */}
          {(Boolean(fullQuotation?.terms?.trim()) || Boolean(fullQuotation?.notes?.trim())) && (
            <div className="space-y-2 text-xs">
              {Boolean(fullQuotation?.terms?.trim()) && (
                <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Terms & Conditions
                  </span>
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-[11px]">
                    {fullQuotation.terms.trim()}
                  </p>
                </div>
              )}
              {Boolean(fullQuotation?.notes?.trim()) && (
                <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Special Notes & Instructions
                  </span>
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-[11px]">
                    {fullQuotation.notes.trim()}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Due Date Config */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Invoice Payment Due Date
            </label>
            <div className="relative">
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full pl-3.5 pr-10 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <p className="text-[11px] text-slate-400">
              Customer payment schedule due date printed on the generated invoice document.
            </p>
          </div>

          {/* PDF Generation Action Section */}
          <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200/80 bg-white shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Client-side PDF Generation
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Compile quotation line items, warranties, and pricing into a formal PDF
                </p>
              </div>
              <button
                type="button"
                onClick={handleGeneratePdf}
                disabled={generatingPdf}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs shadow-blue-500/20 flex items-center justify-center gap-1.5 transition active:scale-[0.98] cursor-pointer disabled:opacity-50 shrink-0"
              >
                {generatingPdf ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : generatedPdf ? (
                  <RefreshCw className="w-3.5 h-3.5" />
                ) : (
                  <FileText className="w-3.5 h-3.5" />
                )}
                <span>{generatedPdf ? "Re-generate PDF" : "Generate PDF"}</span>
              </button>
            </div>

            {/* Automatically Attached PDF Card */}
            {generatedPdf && (
              <div className="p-3 sm:p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-emerald-900 truncate max-w-[180px] sm:max-w-xs">
                        {generatedPdf.file.name}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                        Attached
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-600 block mt-0.5">
                      {(generatedPdf.file.size / 1024).toFixed(1)} KB • Ready for email transmission
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-emerald-200/60">
                  <a
                    href={generatedPdf.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-initial text-center justify-center px-3 py-1.5 bg-white text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition shadow-2xs"
                    title="Open PDF Preview in new tab"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </a>
                  <a
                    href={generatedPdf.url}
                    download={generatedPdf.file.name}
                    className="flex-1 sm:flex-initial text-center justify-center px-3 py-1.5 bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition shadow-2xs"
                    title="Download copy"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-slate-50/80 border-t border-slate-100 shrink-0 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg shadow-2xs hover:border-slate-300 transition cursor-pointer active:scale-[0.98] text-center"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSendInvoice}
            disabled={!generatedPdf?.file || sendingEmail || !customerEmail || isRejected}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs shadow-blue-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer active:scale-[0.98] text-center"
          >
            {sendingEmail ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Sending to Customer...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Send Invoice via Email</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
