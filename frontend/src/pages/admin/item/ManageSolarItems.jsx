import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Search, Filter, Package, Plus, X, Layers, Image as ImageIcon } from "lucide-react";
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
              picture: updatedItem.picture || item.picture,
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

  const canCreate = isAdmin(currentUser?.role) || isSuperAdmin(currentUser?.role);

  return (
    <div className="p-2 md:p-3 max-w-7xl mx-auto w-full animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Manage Solar Items
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-xs">
            View, create, and manage solar hardware catalog items.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 sm:flex-initial sm:w-56 md:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by code or title..."
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
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Filter Drawer Button */}
          <button
            onClick={() => setIsFilterOpen(true)}
            type="button"
            className={`flex items-center justify-center p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition shadow-sm h-[34px] w-[34px] cursor-pointer relative ${
              hasActiveFilters
                ? "ring-2 ring-blue-500/50 border-blue-500 dark:border-blue-500 text-blue-600 dark:text-blue-400"
                : ""
            }`}
            title="Filter Solar Items"
          >
            <Filter className="w-3.5 h-3.5" />
            {hasActiveFilters && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-500 rounded-full" />
            )}
          </button>

          {/* Create Item CTA Button */}
          {canCreate && (
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-sm h-[34px] cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Create Solar Item</span>
            </button>
          )}
        </div>
      </div>

      {/* Items Table Card */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                <th className="py-2.5 px-4 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Solar Item
                </th>
                <th className="py-2.5 px-4 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="py-2.5 px-4 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="py-2.5 px-4 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Stock
                </th>
                <th className="py-2.5 px-4 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-2.5 px-4 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center">
                    <div className="flex justify-center items-center gap-2.5 text-gray-500 dark:text-gray-400">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      <span className="text-xs font-medium">
                        Loading solar items...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center gap-1.5">
                      <Package className="w-6 h-6 text-gray-300 dark:text-gray-600 mb-1" />
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        No solar items found
                      </p>
                      <p className="text-xs">
                        Try adjusting your search terms or filters.
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
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                    >
                      {/* Item Thumbnail & Title */}
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 overflow-hidden flex items-center justify-center shrink-0">
                            {item.picture?.url ? (
                              <img
                                key={`${item.id}-${item.picture?.id || item.picture_id || ""}-${item.picture?.url || ""}`}
                                src={item.picture.url}
                                alt={item.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  if (e.target.nextSibling) {
                                    e.target.nextSibling.style.display = "flex";
                                  }
                                }}
                              />
                            ) : null}
                            <div
                              className={`w-full h-full flex items-center justify-center text-gray-400 ${
                                item.picture?.url ? "hidden" : "flex"
                              }`}
                            >
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          </div>

                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-gray-900 dark:text-gray-100 text-xs truncate max-w-xs sm:max-w-sm">
                              {item.title}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.2 rounded font-semibold">
                                {item.code}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                {new Date(item.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-2.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                          <Layers className="w-3 h-3 text-gray-400" />
                          <span className="truncate max-w-[120px]">{catTitle}</span>
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-2.5 px-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                            {formatPrice(item.selling_price ?? item.marked_price)}
                          </span>
                          {item.marked_price !== undefined &&
                            item.selling_price !== undefined &&
                            item.marked_price !== item.selling_price && (
                              <span className="text-[10px] text-gray-400 line-through">
                                {formatPrice(item.marked_price)}
                              </span>
                            )}
                        </div>
                      </td>

                      {/* Stock */}
                      <td className="py-2.5 px-4">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                          {item.quantity ?? 0}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            item.is_active
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 ring-1 ring-emerald-600/10 dark:ring-emerald-500/20"
                              : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 ring-1 ring-red-600/10 dark:ring-red-500/20"
                          }`}
                        >
                          {item.is_active ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                          )}
                          {item.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-4 text-right">
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
              ({totalItems} total items)
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
