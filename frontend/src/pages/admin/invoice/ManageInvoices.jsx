import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Search, Filter, X, Receipt, Clock, Mail, Phone, RefreshCw,
} from "lucide-react";
import { axiosInstance } from "../../../lib/axiosInstance";
import { formatPrice } from "../../../lib/formatPrice";
import { updateInvoicePrices } from "../../../lib/invoicePdfEnricher";
import AdminFilterMenu from "../../../common/AdminFilterMenu";
import ActionButton from "./components/ActionButton";
import Filters from "./components/Filters";
import SendInvoiceModal from "./components/SendInvoiceModal";
import InvoiceDetailViewModal from "./components/InvoiceDetailViewModal";
import RecordPaymentModal from "./components/RecordPaymentModal";

export default function ManageInvoices() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL search params
  const searchTerm = searchParams.get("search") || "";
  const paymentStatusFilter = searchParams.get("payment_status") || "";
  const lowestBudget = searchParams.get("lowest_budget") || "";
  const maximumBudget = searchParams.get("maximum_budget") || "";
  const sortOrder = searchParams.get("sort") || "DESC";
  const page = parseInt(searchParams.get("page") || "1", 10) || 1;

  const [searchInput, setSearchInput] = useState(searchTerm);
  const [prevSearchTerm, setPrevSearchTerm] = useState(searchTerm);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [syncingInvoiceId, setSyncingInvoiceId] = useState(null);

  // Detail Modal state (lifted to prevent unmounting/closing during price updates)
  const [detailModalInvoice, setDetailModalInvoice] = useState(null);
  const [detailModalQuotation, setDetailModalQuotation] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Payment Modal state
  const [paymentModalInvoice, setPaymentModalInvoice] = useState(null);
  const [paymentModalQuotation, setPaymentModalQuotation] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Send Invoice Modal state
  const [sendModalQuotation, setSendModalQuotation] = useState(null);
  const [sendModalInvoice, setSendModalInvoice] = useState(null);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  const refetchInvoices = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  if (prevSearchTerm !== searchTerm) {
    setPrevSearchTerm(searchTerm);
    setSearchInput(searchTerm);
  }

  // Helper to update search params
  const updateParams = useCallback(
    (updates) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(updates).forEach(([key, val]) => {
            if (
              val === undefined ||
              val === null ||
              val === "" ||
              (key === "sort_by" && val === "created_at") ||
              (key === "sort" && val === "DESC") ||
              (key === "page" && Number(val) <= 1)
            ) {
              next.delete(key);
            } else {
              next.set(key, String(val));
            }
          });
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  // Debounced search handler
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchTerm) {
        updateParams({ search: searchInput.trim() || undefined, page: 1 });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, searchTerm, updateParams]);

  const handleClearSearch = () => {
    setSearchInput("");
    updateParams({ search: undefined, page: 1 });
  };

  // Fetch invoices data with asynchronous customer and quotation enrichment
  useEffect(() => {
    let active = true;

    const loadInvoices = async () => {
      try {
        setLoading(true);

        const params = {
          page,
          limit: 10,
          search_term: searchTerm.trim() || undefined,
          payment_status: paymentStatusFilter || undefined,
          sort_order: sortOrder || "DESC",
          lowest_budget: lowestBudget ? Number(lowestBudget) : undefined,
          maximum_budget: maximumBudget ? Number(maximumBudget) : undefined,
        };

        const response = await axiosInstance.get("/invoices", { params });

        if (active) {
          const data = response.data?.data || response.data;
          setInvoices(data.items || []);
          setTotalPages(data.meta?.totalPages || 1);
          setTotalItems(data.meta?.totalItems || 0);
          setLoading(false);
        }

      } catch (error) {
        if (active) {
          const msg = error.response?.data?.message;
          toast.error(
            Array.isArray(msg)
              ? msg.join(", ")
              : msg || error.message || "Failed to fetch invoices"
          );
          setLoading(false);
        }
      }
    };

    loadInvoices();

    return () => {
      active = false;
    };
  }, [page, searchTerm, paymentStatusFilter, sortOrder, lowestBudget, maximumBudget, refreshTrigger]);

  const handleOpenDetailModal = (invoice, quotation) => {
    setDetailModalInvoice(invoice);
    setDetailModalQuotation(quotation || invoice?.quotation || null);
    setIsDetailModalOpen(true);
  };

  const handleOpenPaymentModal = (invoice, quotation) => {
    setPaymentModalInvoice(invoice);
    setPaymentModalQuotation(quotation || invoice?.quotation || null);
    setIsPaymentModalOpen(true);
  };

  const handleOpenSendModal = (quotation, invoice) => {
    const targetQuo = quotation || invoice?.quotation || null;
    if (!targetQuo) {
      toast.error("Could not locate quotation associated with this invoice.");
      return;
    }
    setSendModalQuotation(targetQuo);
    setSendModalInvoice(invoice || null);
    setIsSendModalOpen(true);
  };

  // Immediate row update without refreshing full table (prevents closing modal & table reloading flicker)
  const handleInvoiceUpdated = useCallback((updatedInv) => {
    if (updatedInv?.id) {
      setInvoices((prev) =>
        prev.map((i) =>
          i.id === updatedInv.id ? { ...i, ...updatedInv } : i
        )
      );
      setDetailModalInvoice((prev) =>
        prev?.id === updatedInv.id ? { ...prev, ...updatedInv } : prev
      );
      setPaymentModalInvoice((prev) =>
        prev?.id === updatedInv.id ? { ...prev, ...updatedInv } : prev
      );
    }
  }, []);

  // Sync latest equipment prices for a specific invoice row from backend PUT /invoices/:id/:quoId
  const handleSyncRowPrices = async (inv) => {
    const quoId = inv.quotation_id || inv.quotation?.id;
    if (!inv.id || !quoId) {
      toast.error("Quotation reference missing. Cannot sync prices.");
      return;
    }

    try {
      setSyncingInvoiceId(inv.id);
      const updatedInv = await updateInvoicePrices(inv.id, quoId);

      // Immediately update row data without refreshing the entire table
      handleInvoiceUpdated(updatedInv);
      toast.success(`Prices synchronized for ${inv.invoice_number}`);
    } catch (err) {
      console.error("Failed to sync row prices:", err);
      const msg = err.response?.data?.message;
      toast.error(
        Array.isArray(msg)
          ? msg.join(", ")
          : msg || err.message || "Failed to sync prices"
      );
    } finally {
      setSyncingInvoiceId(null);
    }
  };

  const hasActiveFilters = Boolean(
    paymentStatusFilter || sortOrder !== "DESC" || lowestBudget || maximumBudget
  );

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case "PAID":
        return {
          pill: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
          dot: "bg-emerald-500",
          text: "Paid in Full",
        };
      case "PARTIAL":
        return {
          pill: "bg-purple-50 text-purple-700 border-purple-200/60",
          dot: "bg-purple-500",
          text: "Partial",
        };
      case "ADVANCED":
        return {
          pill: "bg-blue-50 text-blue-700 border-blue-200/60",
          dot: "bg-blue-500",
          text: "Advance",
        };
      default:
        return {
          pill: "bg-amber-50 text-amber-700 border-amber-200/60",
          dot: "bg-amber-500",
          text: "Pending",
        };
    }
  };

  // Quotation status badge (adjust cases to match your quotation status enum)
  const getQuotationStatusBadge = (status) => {
    switch (status) {
      case "ACCEPTED":
        return {
          pill: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
          dot: "bg-emerald-500",
          text: "Accepted",
        };
      case "REJECTED":
        return {
          pill: "bg-red-50 text-red-700 border-red-200/60",
          dot: "bg-red-500",
          text: "Rejected",
        };
      case "SENT":
        return {
          pill: "bg-blue-50 text-blue-700 border-blue-200/60",
          dot: "bg-blue-500",
          text: "Sent",
        };
      case "DRAFT":
        return {
          pill: "bg-slate-100 text-slate-600 border-slate-200/80",
          dot: "bg-slate-400",
          text: "Draft",
        };
      default:
        return {
          pill: "bg-slate-100 text-slate-500 border-slate-200/80",
          dot: "bg-slate-300",
          text: status || "Unknown",
        };
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full space-y-4 font-sans">
      {/* Header Toolbar - Identical to Manage Quotations */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-[0_1px_3px_0_rgba(0,0,0,0.03)]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Manage Invoices
            </h1>
            {!loading && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                {totalItems} total
              </span>
            )}
          </div>
          <p className="text-slate-500 text-xs mt-0.5">
            Review, track, and send customer invoices, payment statuses, and settlement documents.
          </p>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-1 sm:flex-initial sm:w-64 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by invoice # or customer..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none text-slate-900 placeholder:text-slate-400 transition-all text-xs h-10"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer"
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className={`flex items-center justify-center p-2 rounded-xl border transition shadow-2xs h-10 w-10 cursor-pointer relative shrink-0 ${hasActiveFilters
                ? "bg-blue-50 border-blue-300 text-blue-600 font-semibold ring-2 ring-blue-500/20"
                : "bg-white border-slate-200/90 hover:bg-slate-50 text-slate-600 hover:text-slate-900"
              }`}
            title="Filters"
          >
            <Filter size={14} />
            {hasActiveFilters && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* Refresh Action */}
          <button
            onClick={() => refetchInvoices()}
            className="flex items-center justify-center p-2 rounded-xl border border-slate-200/90 hover:bg-slate-50 text-slate-600 hover:text-slate-900 shadow-2xs h-10 w-10 cursor-pointer shrink-0"
            title="Refresh Invoices"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.03)] border border-slate-200/90 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs min-w-205">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 sm:px-5">Invoice #</th>
                <th className="py-3 px-4">Quotation Ref</th>
                <th className="py-3 px-4">Quotation Status</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Payment Status</th>
                <th className="py-3 px-4">Financial</th>
                <th className="py-3 px-4 sm:px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-semibold">Loading invoices...</span>
                    </div>
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
                        <Receipt className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        No invoices found
                      </p>
                      <p className="text-xs text-slate-400 max-w-xs">
                        Try adjusting your search terms or filters to find invoices.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const quotation = inv.quotation || {};
                  const customer = inv.customer || quotation.customer || {};
                  const badge = getPaymentStatusBadge(inv.payment_status);
                  const quotationBadge = getQuotationStatusBadge(quotation.status);
                  const isFinalized = quotation.status === "ACCEPTED" || quotation.status === "REJECTED";

                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-blue-50/25 transition-colors group"
                    >
                      {/* Invoice Number & Date */}
                      <td className="py-3 px-4 sm:px-5">
                        <div className="flex flex-col min-w-0">
                          <span className="font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-md text-xs w-fit">
                            {inv.invoice_number}
                          </span>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>
                              {inv.created_at
                                ? new Date(inv.created_at).toLocaleDateString()
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Quotation Reference */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col min-w-0">
                          <span className="font-mono text-xs font-semibold text-slate-800">
                            {quotation.quotation_number || (inv.quotation_id ? `Ref: ${inv.quotation_id.substring(0, 8)}...` : "—")}
                          </span>
                          {inv.due_date && (
                            <span className="text-[10px] text-amber-600 font-medium mt-0.5">
                              Due: {new Date(inv.due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Quotation Status */}
                      <td className="py-3 px-4">
                        {quotation.status ? (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border shadow-2xs ${quotationBadge.pill}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${quotationBadge.dot}`} />
                            {quotationBadge.text}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Customer Info - Exactly matching Manage Quotations */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            {(customer.name || quotation.quotation_number?.split("-")[2] || inv.invoice_number?.split("-")[2] || "C")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span
                              className="font-bold text-slate-900 text-xs truncate max-w-55"
                              title={customer.name || (inv.quotation_id ? `Customer ID: ${inv.quotation_id}` : "Customer")}
                            >
                              {customer.name || (
                                <span className="inline-flex items-center gap-1.5 text-slate-400 font-normal">
                                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
                                  Loading...
                                </span>
                              )}
                            </span>
                            {customer.email && (
                              <span
                                className="text-[11px] text-slate-500 truncate max-w-55 flex items-center gap-1 mt-0.5"
                                title={customer.email}
                              >
                                <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">{customer.email}</span>
                              </span>
                            )}
                            {customer.phone && (
                              <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                                <Phone className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                                <span>{customer.phone}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Payment Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border shadow-2xs ${badge.pill}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {badge.text}
                        </span>
                      </td>

                      {/* Financial */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-between gap-2 max-w-47.5">
                          <div className="flex flex-col gap-0.5 text-xs min-w-0">
                            <span className="font-mono font-bold text-slate-900">
                              {formatPrice(inv.total)}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              Paid:{" "}
                              <strong className="text-emerald-700 font-mono">
                                {formatPrice(inv.paid_amount || 0)}
                              </strong>
                            </span>
                            {Number(inv.total) > 0 && (
                              <div className="w-24 bg-slate-100 rounded-full h-1 overflow-hidden mt-0.5">
                                <div
                                  className={`h-1 rounded-full ${
                                    inv.payment_status === "PAID"
                                      ? "bg-emerald-600"
                                      : "bg-blue-600"
                                  }`}
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      Math.round(
                                        ((inv.paid_amount || 0) / Number(inv.total)) * 100
                                      )
                                    )}%`,
                                  }}
                                />
                              </div>
                            )}
                          </div>

                          {/* Row Price Sync Button (Financial Column - Available when quotation is not finalized) */}
                          {!isFinalized && (
                            <button
                              type="button"
                              onClick={() => handleSyncRowPrices(inv)}
                              disabled={syncingInvoiceId === inv.id}
                              className={`w-7 h-7 rounded-lg border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                                syncingInvoiceId === inv.id
                                  ? "bg-blue-50 text-blue-600 border-blue-200 shadow-2xs"
                                  : "text-slate-400 hover:text-blue-600 hover:bg-blue-50/80 border-slate-200/60 hover:border-blue-200/80 shadow-2xs"
                              }`}
                              title="Sync latest equipment catalog prices"
                            >
                              <RefreshCw
                                className={`w-3.5 h-3.5 ${
                                  syncingInvoiceId === inv.id ? "animate-spin text-blue-600" : ""
                                }`}
                              />
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 sm:px-5 text-right">
                        <ActionButton
                          invoice={inv}
                          quotation={quotation}
                          onOpenDetailModal={handleOpenDetailModal}
                          onOpenPaymentModal={handleOpenPaymentModal}
                          onOpenSendModal={handleOpenSendModal}
                          onUpdateInvoice={handleInvoiceUpdated}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination - Matching Manage Quotations */}
        {!loading && totalPages > 1 && (
          <div className="border-t border-slate-100 px-4 sm:px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
            <span className="text-xs text-slate-500 font-medium">
              Showing page <span className="text-slate-900 font-bold">{page}</span> of{" "}
              <span className="text-slate-900 font-bold">{totalPages}</span> ({totalItems} invoices total)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => updateParams({ page: page - 1 })}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-2xs cursor-pointer"
              >
                Previous
              </button>
              <span className="text-xs font-semibold px-2 text-slate-600">
                {page} / {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => updateParams({ page: page + 1 })}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-2xs cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FILTER DRAWER */}
      <AdminFilterMenu
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter Invoices"
        subtitle="Narrow invoices by settlement status, sorting order, or budget thresholds"
      >
        <Filters
          paymentStatusFilter={paymentStatusFilter}
          sortOrder={sortOrder}
          lowestBudget={lowestBudget}
          maximumBudget={maximumBudget}
          onApply={(filters) => {
            updateParams({
              ...filters,
              page: 1,
            });
            setIsFilterOpen(false);
          }}
          onReset={() => {
            updateParams({
              payment_status: undefined,
              sort: "DESC",
              lowest_budget: undefined,
              maximum_budget: undefined,
              page: 1,
            });
            setIsFilterOpen(false);
          }}
          onClose={() => setIsFilterOpen(false)}
        />
      </AdminFilterMenu>

      {/* Send Invoice Modal */}
      {isSendModalOpen && sendModalQuotation && (
        <SendInvoiceModal
          isOpen={isSendModalOpen}
          onClose={() => {
            setIsSendModalOpen(false);
            setSendModalQuotation(null);
            setSendModalInvoice(null);
          }}
          quotation={sendModalQuotation}
          invoice={sendModalInvoice}
          onQuotationUpdated={handleInvoiceUpdated}
        />
      )}

      {/* Invoice Detail View Modal (Lifted to page level - Never closes during row price sync) */}
      {isDetailModalOpen && detailModalInvoice && (
        <InvoiceDetailViewModal
          key={detailModalInvoice.id}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setDetailModalInvoice(null);
            setDetailModalQuotation(null);
          }}
          invoice={detailModalInvoice}
          quotation={detailModalQuotation}
          onOpenSendModal={handleOpenSendModal}
          onOpenPaymentModal={() => {
            const curInv = detailModalInvoice;
            const curQuo = detailModalQuotation;
            setIsDetailModalOpen(false);
            handleOpenPaymentModal(curInv, curQuo);
          }}
          onInvoiceUpdated={handleInvoiceUpdated}
        />
      )}

      {/* Record Payment & Transactions History Modal */}
      {isPaymentModalOpen && paymentModalInvoice && (
        <RecordPaymentModal
          key={paymentModalInvoice.id}
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setPaymentModalInvoice(null);
            setPaymentModalQuotation(null);
          }}
          invoice={paymentModalInvoice}
          quotation={paymentModalQuotation}
          onPaymentSuccess={(updatedInv) => {
            handleInvoiceUpdated(updatedInv);
          }}
        />
      )}
    </div>
  );
}