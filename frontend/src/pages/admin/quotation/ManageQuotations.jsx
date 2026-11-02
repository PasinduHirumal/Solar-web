import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Search,
  Filter,
  Plus,
  X,
  FileText,
  Clock,
  User,
  Percent,
} from "lucide-react";
import { axiosInstance } from "../../../lib/axiosInstance";
import { isAdmin, isSuperAdmin } from "../../../lib/roles";
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
          setQuotations(data.items || []);
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
      setQuotations((prev) => [newQuotation, ...prev.filter((q) => q.id !== newQuotation.id)]);
      setTotalItems((prev) => prev + 1);
    }
    refetchQuotations();
  };

  const hasActiveFilters = Boolean(
    statusFilter || sortBy !== "created_at" || sortOrder !== "DESC"
  );

  const canCreate = isAdmin(currentUser?.role) || isSuperAdmin(currentUser?.role);

  const getStatusBadge = (status) => {
    switch (status) {
      case "ACCEPTED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Accepted
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-300 dark:border-rose-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Rejected
          </span>
        );
      case "SENT":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-300 dark:border-blue-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Sent
          </span>
        );
      case "DRAFT":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Draft
          </span>
        );
    }
  };

  return (
    <div className="p-2 md:p-3 max-w-7xl mx-auto w-full animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Manage Quotations
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-xs">
            Review, draft, and track system quotations and pricing proposals.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 sm:flex-initial sm:w-56 md:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by quote # or customer..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white transition-shadow shadow-sm text-xs h-[34px]"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className={`p-1.5 border rounded-lg transition-colors flex items-center justify-center shrink-0 h-[34px] w-[34px] cursor-pointer ${
              hasActiveFilters
                ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
            title="Filters"
          >
            <Filter size={14} />
          </button>

          {/* Create Button */}
          {canCreate && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition shadow-sm shrink-0 h-[34px] cursor-pointer"
            >
              <Plus size={14} />
              <span>Create Quotation</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/75 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-4">Quotation</th>
                <th className="py-2.5 px-4">Customer</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Discounts / Tax</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-medium">Loading quotations...</span>
                    </div>
                  </td>
                </tr>
              ) : quotations.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center gap-1.5">
                      <FileText className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-1" />
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        No quotations found
                      </p>
                      <p className="text-xs">
                        Try adjusting your search terms or filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                quotations.map((quo) => {
                  return (
                    <tr
                      key={quo.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                    >
                      {/* Quotation Number & Date */}
                      <td className="py-2.5 px-4">
                        <div className="flex flex-col min-w-0">
                          <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">
                            {quo.quotation_number}
                          </span>
                          <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
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
                      <td className="py-2.5 px-4">
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-gray-900 dark:text-gray-100 text-xs truncate max-w-xs">
                            {quo.customer?.name || "Customer"}
                          </span>
                          <span className="text-[11px] text-gray-400 truncate max-w-xs">
                            {quo.customer?.email || quo.customer_id}
                          </span>
                          {quo.customer?.phone && (
                            <span className="text-[10px] text-gray-500 font-mono">
                              {quo.customer.phone}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-4">{getStatusBadge(quo.status)}</td>

                      {/* Discounts / Tax */}
                      <td className="py-2.5 px-4">
                        <div className="flex flex-col gap-0.5 text-[11px]">
                          <span className="text-gray-600 dark:text-gray-300">
                            Discount:{" "}
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {quo.discount_type === "PERCENTAGE"
                                ? `${quo.discount}%`
                                : quo.discount_type === "FIXED"
                                ? `${formatPrice(quo.discount)}`
                                : "None"}
                            </span>
                          </span>
                          <span className="text-gray-600 dark:text-gray-300">
                            Tax:{" "}
                            <span className="font-medium text-gray-900 dark:text-gray-100">
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
                      <td className="py-2.5 px-4 text-right">
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
          <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/30 dark:bg-gray-800/30">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Showing{" "}
              <span className="text-gray-900 dark:text-white font-semibold">
                {page}
              </span>{" "}
              of{" "}
              <span className="text-gray-900 dark:text-white font-semibold">
                {totalPages}
              </span>{" "}
              ({totalItems} total quotations)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page === 1}
                onClick={() => updateParams({ page: page - 1 })}
                className="px-3 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm active:scale-[0.98] cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => updateParams({ page: page + 1 })}
                className="px-3 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm active:scale-[0.98] cursor-pointer"
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
