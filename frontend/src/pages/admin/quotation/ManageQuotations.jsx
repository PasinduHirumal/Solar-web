import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Search, Filter, Plus, X, FileText, Clock, Mail, Phone, MapPin
} from "lucide-react";
import { axiosInstance } from "../../../lib/axiosInstance";
import { isAdmin } from "../../../lib/roles";
import useAuthStore from "../../../lib/authStore";
import ActionButton from "./components/ActionButton";
import Filters from "./components/Filters";
import CreateQuotationModal from "./components/CreateQuotationModal";
import AdminFilterMenu from "../../../common/AdminFilterMenu";
import { formatPrice } from "../../../lib/formatPrice";

export default function ManageQuotations() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL search params
  const searchTerm = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "";
  const sortBy = searchParams.get("sort_by") || "created_at";
  const sortOrder = searchParams.get("sort") || "DESC";
  const page = parseInt(searchParams.get("page") || "1", 10) || 1;

  const [searchInput, setSearchInput] = useState(searchTerm);
  const [prevSearchTerm, setPrevSearchTerm] = useState(searchTerm);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Client-side cache to persist resolved customer profiles by customer_id
  const customerCache = useRef({});

  const { user: currentUser } = useAuthStore();

  const refetchQuotations = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  if (prevSearchTerm !== searchTerm) {
    setPrevSearchTerm(searchTerm);
    setSearchInput(searchTerm);
  }

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

  // Fetch quotations data
  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        setLoading(true);

        const params = {
          page,
          limit: 10,
          search_term: searchTerm.trim() || undefined,
          status: statusFilter || undefined,
          sort_by: sortBy || "created_at",
          sort_order: sortOrder || "DESC",
        };

        const response = await axiosInstance.get("/quotations", { params });

        if (active) {
          const data = response.data?.data || response.data;
          const rawItems = data.items || [];

          // Immediately attach any previously cached customer profiles
          const initialItems = rawItems.map((q) => {
            if (q.customer?.name) return q;
            if (q.customer_id && customerCache.current[q.customer_id]) {
              return { ...q, customer: customerCache.current[q.customer_id] };
            }
            return q;
          });

          setQuotations(initialItems);
          setTotalPages(data.meta?.totalPages || 1);
          setTotalItems(data.meta?.totalItems || 0);
          setLoading(false);

          // Asynchronously enrich customer details for rows on the active page
          const itemsNeedingCustomer = initialItems.filter(
            (q) => !q.customer?.name && q.id
          );

          if (itemsNeedingCustomer.length > 0) {
            Promise.allSettled(
              itemsNeedingCustomer.map((q) =>
                axiosInstance.get(`/quotations/${q.id}`)
              )
            ).then((results) => {
              if (!active) return;
              const freshMap = {};
              results.forEach((res) => {
                if (res.status === "fulfilled") {
                  const fullQuo =
                    res.value.data?.data?.quotation || res.value.data?.quotation;
                  if (fullQuo?.id && fullQuo?.customer) {
                    freshMap[fullQuo.id] = fullQuo.customer;
                    if (fullQuo.customer_id) {
                      customerCache.current[fullQuo.customer_id] = fullQuo.customer;
                    }
                  }
                }
              });

              if (Object.keys(freshMap).length > 0) {
                setQuotations((prev) =>
                  prev.map((q) => {
                    const resolvedCustomer =
                      freshMap[q.id] ||
                      (q.customer_id ? customerCache.current[q.customer_id] : null);
                    return resolvedCustomer
                      ? { ...q, customer: resolvedCustomer }
                      : q;
                  })
                );
              }
            });
          }
        }
      } catch (error) {
        if (active) {
          const msg = error.response?.data?.message;
          toast.error(
            Array.isArray(msg)
              ? msg.join(", ")
              : msg || error.message || "Failed to fetch quotations"
          );
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [page, searchTerm, statusFilter, sortBy, sortOrder, refreshTrigger]);

  const handleUpdateQuotationRow = (updatedQuotation) => {
    if (updatedQuotation.customer && updatedQuotation.customer_id) {
      customerCache.current[updatedQuotation.customer_id] = updatedQuotation.customer;
    }
    setQuotations((prev) =>
      prev.map((q) => (q.id === updatedQuotation.id ? { ...q, ...updatedQuotation } : q))
    );
  };

  const handleDeleteQuotationRow = (deletedId) => {
    setQuotations((prev) => prev.filter((q) => q.id !== deletedId));
    setTotalItems((prev) => Math.max(0, prev - 1));
  };

  const handleQuotationCreated = (newQuotation) => {
    if (newQuotation && newQuotation.id) {
      if (newQuotation.customer && newQuotation.customer_id) {
        customerCache.current[newQuotation.customer_id] = newQuotation.customer;
      }
      setQuotations((prev) => [newQuotation, ...prev.filter((q) => q.id !== newQuotation.id)]);
      setTotalItems((prev) => prev + 1);
    }
    refetchQuotations();
  };

  const hasActiveFilters = Boolean(
    statusFilter || sortBy !== "created_at" || sortOrder !== "DESC"
  );

  // POST /quotations has @Roles(UserRole.ADMIN) only in quotations.controller.ts
  const canCreate = isAdmin(currentUser?.role);

  const getStatusBadge = (status) => {
    switch (status) {
      case "ACCEPTED":
        return (
          <span
            title="Quotation accepted & locked"
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Accepted
          </span>
        );
      case "REJECTED":
        return (
          <span
            title="Quotation rejected"
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/60"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Rejected
          </span>
        );
      case "SENT":
        return (
          <span
            title="Quotation sent to customer (ready for SuperAdmin approval or rejection)"
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Sent
          </span>
        );
      case "DRAFT":
      default:
        return (
          <span
            title="Draft quotation (must be sent to customer before approval/rejection)"
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/60"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Draft
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full space-y-4">
      {/* Header Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-[0_1px_3px_0_rgba(0,0,0,0.03)]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Manage Quotations
            </h1>
            {!loading && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                {totalItems} total
              </span>
            )}
          </div>
          <p className="text-slate-500 text-xs mt-0.5">
            Review, draft, and track system quotations, commercial terms, and pricing proposals.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 sm:flex-initial sm:w-64 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by quote # or customer..."
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
            className={`flex items-center justify-center p-2 rounded-xl border transition shadow-2xs h-10 w-10 cursor-pointer relative ${
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

          {/* Create Button */}
          {canCreate && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-sm shadow-blue-500/20 h-10 cursor-pointer shrink-0"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Create Quotation</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.03)] border border-slate-200/90 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 sm:px-5">Quotation</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Discounts / Tax</th>
                <th className="py-3 px-4 sm:px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-semibold">Loading quotations...</span>
                    </div>
                  </td>
                </tr>
              ) : quotations.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
                        <FileText className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        No quotations found
                      </p>
                      <p className="text-xs text-slate-400 max-w-xs">
                        Try adjusting your search terms or filters to find quotations.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                quotations.map((quo) => {
                  return (
                    <tr
                      key={quo.id}
                      className="hover:bg-blue-50/25 transition-colors group"
                    >
                      {/* Quotation Number & Date */}
                      <td className="py-3 px-4 sm:px-5">
                        <div className="flex flex-col min-w-0">
                          <span className="font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-md text-xs w-fit">
                            {quo.quotation_number}
                          </span>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {quo.created_at
                                ? new Date(quo.created_at).toLocaleDateString()
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            {(quo.customer?.name || quo.quotation_number?.split("-")[2] || "C").charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span
                              className="font-bold text-slate-900 text-xs truncate max-w-[220px]"
                              title={quo.customer?.name || (quo.customer_id ? `Customer ID: ${quo.customer_id}` : "Customer")}
                            >
                              {quo.customer?.name || (
                                <span className="inline-flex items-center gap-1.5 text-slate-400 font-normal">
                                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
                                  Loading...
                                </span>
                              )}
                            </span>
                            {quo.customer?.email && (
                              <span
                                className="text-[11px] text-slate-500 truncate max-w-[220px] flex items-center gap-1 mt-0.5"
                                title={quo.customer.email}
                              >
                                <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">{quo.customer.email}</span>
                              </span>
                            )}
                            {quo.customer?.phone && (
                              <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                                <Phone className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                                <span>{quo.customer.phone}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">{getStatusBadge(quo.status)}</td>

                      {/* Discounts / Tax */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 text-[11px]">
                          <span className="text-slate-600">
                            Discount:{" "}
                            <span className="font-bold text-slate-900 tabular-nums">
                              {quo.discount_type === "PERCENTAGE"
                                ? `${quo.discount}%`
                                : quo.discount_type === "FIXED"
                                  ? `${formatPrice(quo.discount)}`
                                  : "None"}
                            </span>
                          </span>
                          <span className="text-slate-600">
                            Tax:{" "}
                            <span className="font-bold text-slate-900 tabular-nums">
                              {quo.tax_type === "PERCENTAGE"
                                ? `${quo.tax}%`
                                : quo.tax_type === "FIXED"
                                  ? `${formatPrice(quo.tax)}`
                                  : "None"}
                            </span>
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 sm:px-5 text-right">
                        <ActionButton
                          quotation={quo}
                          currentUser={currentUser}
                          onUpdateQuotation={handleUpdateQuotationRow}
                          onDeleteQuotation={handleDeleteQuotationRow}
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
              <span className="text-slate-900 font-bold">{totalPages}</span> ({totalItems} quotations total)
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
        title="Filter Quotations"
      >
        <Filters
          statusFilter={statusFilter}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onApply={(newFilters) => updateParams({ ...newFilters, page: 1 })}
          onReset={() =>
            updateParams({
              status: undefined,
              sort_by: undefined,
              sort: undefined,
              page: 1,
            })
          }
          onClose={() => setIsFilterOpen(false)}
        />
      </AdminFilterMenu>

      {/* CREATE QUOTATION MODAL */}
      <CreateQuotationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onQuotationCreated={handleQuotationCreated}
      />
    </div>
  );
}
