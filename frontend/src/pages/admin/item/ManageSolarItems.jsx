import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Search, Filter, Package, Plus, X, Layers, ShieldCheck } from "lucide-react";
import { axiosInstance } from "../../../lib/axiosInstance";
import { isAdmin, isSuperAdmin } from "../../../lib/roles";
import { formatPrice } from "../../../lib/formatPrice";
import useAuthStore from "../../../lib/authStore";
import ActionButton from "./components/ActionButton";
import Filters from "./components/Filters";
import CreateSolarItemModal from "./components/CreateSolarItemModal";
import AdminFilterMenu from "../../../common/AdminFilterMenu";

export default function ManageSolarItems() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read direct params from URL
  const searchTerm = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "";
  const categoryFilter = searchParams.get("category") || "";
  const sortBy = searchParams.get("sort_by") || "created_at";
  const sortOrder = searchParams.get("sort") || "DESC";
  const page = parseInt(searchParams.get("page") || "1", 10) || 1;

  const [searchInput, setSearchInput] = useState(searchTerm);
  const [prevSearchTerm, setPrevSearchTerm] = useState(searchTerm);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refetchItems = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const { user: currentUser } = useAuthStore();

  // Adjust state during render when URL search param changes externally (React official pattern)
  if (prevSearchTerm !== searchTerm) {
    setPrevSearchTerm(searchTerm);
    setSearchInput(searchTerm);
  }

  // Helper to update search params cleanly
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
              (key === "sort_order" && val === "DESC") ||
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

  // Debounce search typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchTerm) {
        updateParams({ search: searchInput || undefined, page: 1 });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput, searchTerm, updateParams]);

  // Load Categories list for mapping and filter dropdown
  useEffect(() => {
    let active = true;

    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/categories", {
          params: { limit: 100 },
        });
        if (active) {
          const data = response.data?.data || response.data;
          setCategories(data.items || []);
        }
      } catch (err) {
        console.error("Failed to load categories for items", err);
      }
    };

    fetchCategories();

    return () => {
      active = false;
    };
  }, []);

  // Category lookup map (id -> category)
  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach((cat) => {
      if (cat?.id) {
        map[cat.id] = cat;
      }
    });
    return map;
  }, [categories]);

  // Data fetching for solar items
  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        setLoading(true);

        const params = {
          page,
          limit: 10,
          search_term: searchTerm.trim() || undefined,
          is_active: statusFilter === "" ? undefined : statusFilter === "true",
          category_id: categoryFilter || undefined,
          sort_by: sortBy || "created_at",
          sort_order: sortOrder || "DESC",
        };

        const response = await axiosInstance.get("/items", { params });

        if (active) {
          const data = response.data?.data || response.data;
          setItems(data.items || []);
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
              : msg || error.message || "Failed to fetch solar items"
          );
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [
    page,
    searchTerm,
    statusFilter,
    categoryFilter,
    sortBy,
    sortOrder,
    refreshTrigger,
  ]);

  const handleClearSearch = () => {
    setSearchInput("");
    updateParams({ search: undefined, page: 1 });
  };

  const handleUpdateItemRow = (updatedItem) => {
    if (!updatedItem || !updatedItem.id) return;
    setItems((prev) =>
      prev.map((item) =>
        item.id === updatedItem.id
          ? {
              ...item,
              ...updatedItem,
              category: updatedItem.category || item.category,
            }
          : item
      )
    );
  };

  const handleDeleteItemRow = (deletedItemId) => {
    setItems((prev) => prev.filter((item) => item.id !== deletedItemId));
    setTotalItems((prev) => Math.max(0, prev - 1));
  };

  const handleItemCreated = (newItem) => {
    if (newItem && newItem.id) {
      setItems((prev) => [newItem, ...prev.filter((i) => i.id !== newItem.id)]);
      setTotalItems((prev) => prev + 1);
    }
    refetchItems();
  };

  const hasActiveFilters = Boolean(
    statusFilter ||
      categoryFilter ||
      sortBy !== "created_at" ||
      sortOrder !== "DESC"
  );

  const canCreate = isSuperAdmin(currentUser?.role);

  return (
    <div className="max-w-7xl mx-auto w-full space-y-4">
      {/* Page Header Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-[0_1px_3px_0_rgba(0,0,0,0.03)]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Manage Solar Items
            </h1>
            {!loading && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                {totalItems} total
              </span>
            )}
          </div>
          <p className="text-slate-500 text-xs mt-0.5">
            View, price, inventory stock, and manage solar hardware catalog items.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 sm:flex-initial sm:w-64 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by code or title..."
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
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Drawer Toggle */}
          <button
            onClick={() => setIsFilterOpen(true)}
            type="button"
            className={`flex items-center justify-center p-2 rounded-xl border transition shadow-2xs h-10 w-10 cursor-pointer relative ${
              hasActiveFilters
                ? "bg-blue-50 border-blue-300 text-blue-600 font-semibold ring-2 ring-blue-500/20"
                : "bg-white border-slate-200/90 hover:bg-slate-50 text-slate-600 hover:text-slate-900"
            }`}
            title="Filter Solar Items"
          >
            <Filter className="w-4 h-4" />
            {hasActiveFilters && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* Create Item CTA Button */}
          {canCreate && (
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-sm shadow-blue-500/20 h-10 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create Solar Item</span>
            </button>
          )}
        </div>
      </div>

      {/* Items Table Card */}
      <div className="bg-white rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.03)] border border-slate-200/90 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80">
                <th className="py-3 px-4 sm:px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Solar Item
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3 px-4 sm:px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <div className="flex flex-col justify-center items-center gap-2 text-slate-500">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
                      <span className="text-xs font-semibold">
                        Loading solar hardware catalog...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
                        <Package className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        No solar items found
                      </p>
                      <p className="text-xs text-slate-400 max-w-xs">
                        Try adjusting your search terms or filters to find items.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const catTitle =
                    item.category?.title ||
                    categoryMap[item.category_id]?.title ||
                    "Uncategorized";

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-blue-50/25 transition-colors group"
                    >
                      {/* Solar Item */}
                      <td className="py-3 px-4 sm:px-5">
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-slate-900 text-xs truncate max-w-xs sm:max-w-sm">
                            {item.title}
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-[10px] text-blue-700 bg-blue-50 border border-blue-200/60 px-1.5 py-0.2 rounded font-semibold">
                              {item.code}
                            </span>
                            {item.warranty_period && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold border border-emerald-200/60">
                                <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                                {item.warranty_period}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400">
                              {new Date(item.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/60">
                          <Layers className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[130px]">{catTitle}</span>
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-extrabold text-slate-900 tabular-nums">
                            {formatPrice(item.selling_price ?? item.marked_price)}
                          </span>
                          {item.marked_price !== undefined &&
                            item.selling_price !== undefined &&
                            item.marked_price !== item.selling_price && (
                              <span className="text-[10px] text-slate-400 line-through tabular-nums">
                                {formatPrice(item.marked_price)}
                              </span>
                            )}
                        </div>
                      </td>

                      {/* Stock */}
                      <td className="py-3 px-4">
                        <span className="text-xs font-bold text-slate-800 tabular-nums">
                          {item.quantity ?? 0}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            item.is_active
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                              : "bg-rose-50 text-rose-700 border border-rose-200/60"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.is_active ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          />
                          {item.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 sm:px-5 text-right">
                        <ActionButton
                          item={item}
                          categoryName={catTitle}
                          categories={categories}
                          currentUser={currentUser}
                          onUpdateItem={handleUpdateItemRow}
                          onDeleteItem={handleDeleteItemRow}
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
              <span className="text-slate-900 font-bold">{totalPages}</span> ({totalItems} items total)
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

      {/* FILTER SIDE DRAWER MENU */}
      <AdminFilterMenu
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter Solar Items"
      >
        <Filters
          statusFilter={statusFilter}
          categoryFilter={categoryFilter}
          sortBy={sortBy}
          sortOrder={sortOrder}
          categories={categories}
          onApply={(newFilters) => updateParams({ ...newFilters, page: 1 })}
          onReset={() =>
            updateParams({
              status: undefined,
              category: undefined,
              sort_by: undefined,
              sort: undefined,
              page: 1,
            })
          }
          onClose={() => setIsFilterOpen(false)}
        />
      </AdminFilterMenu>

      {/* CREATE SOLAR ITEM MODAL */}
      <CreateSolarItemModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        categories={categories}
        onItemCreated={handleItemCreated}
      />
    </div>
  );
}
