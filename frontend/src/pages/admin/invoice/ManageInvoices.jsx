import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Search,
  Filter,
  X,
  Receipt,
  Clock,
  Calendar,
  Mail,
  Phone,
  ArrowUpDown,
  FileCheck,
  CreditCard,
  RefreshCw,
} from "lucide-react";
import { axiosInstance } from "../../../lib/axiosInstance";
import { formatPrice } from "../../../lib/formatPrice";
import useAuthStore from "../../../lib/authStore";
import AdminFilterMenu from "../../../common/AdminFilterMenu";
import ActionButton from "./components/ActionButton";
import Filters from "./components/Filters";
import SendInvoiceModal from "../quotation/components/SendInvoiceModal";

export default function ManageInvoices() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL search params
  const searchTerm = searchParams.get("search") || "";
  const paymentStatusFilter = searchParams.get("payment_status") || "";
  const sortOrder = searchParams.get("sort") || "DESC";
  const page = parseInt(searchParams.get("page") || "1", 10) || 1;

  const [searchInput, setSearchInput] = useState(searchTerm);
  const [invoices, setInvoices] = useState([]);
  const [quotationsMap, setQuotationsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Send Invoice Modal state
  const [sendModalQuotation, setSendModalQuotation] = useState(null);
  const [sendModalInvoice, setSendModalInvoice] = useState(null);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  const currentUser = useAuthStore((s) => s.user);

  // Helper to update search params
  const updateParams = useCallback(
    (newParams) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(newParams).forEach(([key, val]) => {
            if (val === undefined || val === null || val === "") {
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

  // Fetch quotations map so we have complete customer and quotation details
  useEffect(() => {
    let active = true;

    const loadQuotations = async () => {
      try {
        const res = await axiosInstance.get("/quotations", {
          params: { limit: 100 },
        });
        if (active) {
          const list = res.data?.data?.items || res.data?.items || [];
          const map = {};
          list.forEach((q) => {
            if (q.id) map[q.id] = q;
          });
          setQuotationsMap(map);
        }
      } catch (err) {
        console.warn("Could not load quotation map for invoices", err);
      }
    };

    loadQuotations();

    return () => {
      active = false;
    };
  }, []);

  // Fetch invoices data
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
  }, [page, searchTerm, paymentStatusFilter, sortOrder, refreshTrigger]);

  const handleOpenSendModal = (quotation, invoice) => {
    const targetQuo =
      quotation || (invoice?.quotation_id ? quotationsMap[invoice.quotation_id] : null);
    if (!targetQuo) {
      toast.error("Could not locate quotation associated with this invoice.");
      return;
    }
    setSendModalQuotation(targetQuo);
    setSendModalInvoice(invoice || null);
    setIsSendModalOpen(true);
  };

  const handleInvoiceUpdated = (updatedQuotation) => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const hasActiveFilters = Boolean(
    paymentStatusFilter || sortOrder !== "DESC"
  );

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
          text: "Partial",
        };
      case "ADVANCED":
        return {
          pill: "bg-blue-50 text-blue-700 border-blue-200",
          dot: "bg-blue-500",
          text: "Advance",
        };
      default:
        return {
          pill: "bg-amber-50 text-amber-700 border-amber-200",
          dot: "bg-amber-500",
          text: "Pending",
        };
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 font-sans">
      {/* Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Manage Invoices
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
              {totalItems} total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
            Review, track, and send customer invoices, payment statuses, and settlement documents.
          </p>
        </div>

        {/* Search & Filter Actions */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64 md:w-72">
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
            className={`flex items-center justify-center p-2 rounded-xl border transition shadow-2xs h-10 w-10 cursor-pointer relative shrink-0 ${
              hasActiveFilters
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
            onClick={() => setRefreshTrigger((p) => p + 1)}
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
          <table className="w-full text-left border-collapse text-xs min-w-[720px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 sm:px-5">Invoice #</th>
                <th className="py-3 px-4">Quotation Ref</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Payment Status</th>
                <th className="py-3 px-4">Financials</th>
                <th className="py-3 px-4 sm:px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-semibold">Loading invoices...</span>
                    </div>
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
                        <Receipt className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        No invoices found
                      </p>
                      <p className="text-xs text-slate-400 max-w-xs">
                        Invoices are generated when sending formal proposals from the Manage Quotations screen.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const matchingQuo =
                    inv.quotation || (inv.quotation_id ? quotationsMap[inv.quotation_id] : null) || {};
                  const customer = matchingQuo.customer || {};
                  const badge = getPaymentStatusBadge(inv.payment_status);

                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-blue-50/25 transition-colors group"
                    >
                      {/* Invoice Number & Date */}
                      <td className="py-3.5 px-4 sm:px-5">
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
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col min-w-0">
                          <span className="font-mono text-xs font-semibold text-slate-800">
                            {matchingQuo.quotation_number || (inv.quotation_id ? `ID: ${inv.quotation_id.substring(0, 8)}...` : "—")}
                          </span>
                          {inv.due_date && (
                            <span className="text-[10px] text-amber-600 font-medium mt-0.5">
                              Due: {new Date(inv.due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            {(customer.name || "C").charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span
                              className="font-bold text-slate-900 text-xs truncate max-w-[200px]"
                              title={customer.name}
                            >
                              {customer.name || "Customer"}
                            </span>
                            {customer.email ? (
                              <span
                                className="text-[11px] text-slate-500 truncate max-w-[200px] flex items-center gap-1 mt-0.5"
                                title={customer.email}
                              >
                                <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">{customer.email}</span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                                Ref ID: {inv.quotation_id?.substring(0, 8)}...
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
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border shadow-2xs ${badge.pill}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {badge.text}
                        </span>
                      </td>

                      {/* Financials */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-0.5 text-xs">
                          <span className="font-mono font-bold text-slate-900">
                            {formatPrice(inv.total)}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Paid: <strong className="text-emerald-700 font-mono">{formatPrice(inv.paid_amount || 0)}</strong>
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-5 text-right">
                        <ActionButton
                          invoice={inv}
                          quotation={matchingQuo}
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

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="border-t border-slate-100 px-4 sm:px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
            <span className="text-xs text-slate-500 font-medium">
              Showing page <span className="text-slate-900 font-bold">{page}</span> of{" "}
              <span className="text-slate-900 font-bold">{totalPages}</span>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => updateParams({ page: Math.max(1, page - 1) })}
                disabled={page <= 1}
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition cursor-pointer"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => updateParams({ page: Math.min(totalPages, page + 1) })}
                disabled={page >= totalPages}
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter Side Drawer */}
      <AdminFilterMenu
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter Invoices"
        subtitle="Narrow invoices by settlement status, sorting order, or budget thresholds"
      >
        <Filters
          paymentStatusFilter={paymentStatusFilter}
          sortOrder={sortOrder}
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
    </div>
  );
}
