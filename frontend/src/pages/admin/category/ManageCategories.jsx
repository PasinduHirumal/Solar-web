import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Search, Filter, FolderTree, Plus, X } from 'lucide-react';
import { axiosInstance } from '../../../lib/axiosInstance';
import { isAdmin, isSuperAdmin } from '../../../lib/roles';
import useAuthStore from '../../../lib/authStore';
import ActionButton from './components/ActionButton';
import Filters from './components/Filters';
import CreateCategoryModal from './components/CreateCategoryModal';
import AdminFilterMenu from '../../../common/AdminFilterMenu';

export default function ManageCategories() {
    const [searchParams, setSearchParams] = useSearchParams();

    // Read direct params from URL
    const searchTerm = searchParams.get("search") || "";
    const statusFilter = searchParams.get("status") || "";
    const sortBy = searchParams.get("sort_by") || "created_at";
    const sortOrder = searchParams.get("sort") || "DESC";
    const page = parseInt(searchParams.get("page") || "1", 10) || 1;

    const [searchInput, setSearchInput] = useState(searchTerm);
    const [prevSearchTerm, setPrevSearchTerm] = useState(searchTerm);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const refetchCategories = useCallback(() => {
        setRefreshTrigger((prev) => prev + 1);
    }, []);

    const { user: currentUser } = useAuthStore();

    // Adjust state during render when URL search param changes externally (React official pattern)
    if (prevSearchTerm !== searchTerm) {
        setPrevSearchTerm(searchTerm);
        setSearchInput(searchTerm);
    }

    // Helper to update search params cleanly
    const updateParams = useCallback((updates) => {
        setSearchParams((prev) => {
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
        }, { replace: true });
    }, [setSearchParams]);

    // Debounce search typing
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput !== searchTerm) {
                updateParams({ search: searchInput || undefined, page: 1 });
            }
        }, 350);

        return () => clearTimeout(timer);
    }, [searchInput, searchTerm, updateParams]);

    // Data fetching
    useEffect(() => {
        let active = true;

        const loadData = async () => {
            try {
                const response = await axiosInstance.get('/categories', {
                    params: {
                        page,
                        limit: 10,
                        search_term: searchTerm.trim() || undefined,
                        is_active: statusFilter === "" ? undefined : statusFilter === "true",
                        sort_by: sortBy || "created_at",
                        sort_order: sortOrder || "DESC",
                    }
                });

                if (active) {
                    const data = response.data?.data || response.data;
                    setCategories(data.items || []);
                    setTotalPages(data.meta?.totalPages || 1);
                    setTotalItems(data.meta?.totalItems || 0);
                    setLoading(false);
                }
            } catch (error) {
                if (active) {
                    const msg = error.response?.data?.message;
                    toast.error(Array.isArray(msg) ? msg.join(", ") : (msg || error.message || "Failed to fetch categories"));
                    setLoading(false);
                }
            }
        };

        loadData();

        return () => {
            active = false;
        };
    }, [page, searchTerm, statusFilter, sortBy, sortOrder, refreshTrigger]);

    const handleClearSearch = () => {
        setSearchInput("");
        updateParams({ search: undefined, page: 1 });
    };

    const handleUpdateCategoryRow = (updatedCategory) => {
        if (!updatedCategory || !updatedCategory.id) return;
        setCategories((prev) =>
            prev.map((c) => (c.id === updatedCategory.id ? { ...c, ...updatedCategory } : c))
        );
    };

    const handleDeleteCategoryRow = (deletedCatId) => {
        setCategories((prev) => prev.filter((c) => c.id !== deletedCatId));
        setTotalItems((prev) => Math.max(0, prev - 1));
    };

    const hasActiveFilters = Boolean(statusFilter || sortBy !== "created_at" || sortOrder !== "DESC");
    const canCreate = isAdmin(currentUser?.role) || isSuperAdmin(currentUser?.role);

    return (
        <div className="max-w-7xl mx-auto w-full space-y-4">
            {/* Page Header Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-[0_1px_3px_0_rgba(0,0,0,0.03)]">
                <div>
                    <div className="flex items-center gap-2.5">
                        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                            Manage Categories
                        </h1>
                        {!loading && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                                {totalItems} total
                            </span>
                        )}
                    </div>
                    <p className="text-slate-500 text-xs mt-0.5">
                        View, organize, and manage solar hardware catalog collections and taxonomy.
                    </p>
                </div>

                <div className="flex items-center gap-2.5 w-full md:w-auto">
                    {/* Search Bar */}
                    <div className="relative flex-1 sm:flex-initial sm:w-64 md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search categories..."
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
                        title="Filter Categories"
                    >
                        <Filter className="w-4 h-4" />
                        {hasActiveFilters && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white" />
                        )}
                    </button>

                    {/* Create Category CTA */}
                    {canCreate && (
                        <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-sm shadow-blue-500/20 h-10 cursor-pointer shrink-0"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Create Category</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Categories Table Card */}
            <div className="bg-white rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.03)] border border-slate-200/90 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200/80">
                                <th className="py-3 px-4 sm:px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    Description
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
                                    <td colSpan="4" className="py-12 text-center">
                                        <div className="flex flex-col justify-center items-center gap-2 text-slate-500">
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
                                            <span className="text-xs font-semibold">Loading category records...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : categories.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
                                                <FolderTree className="w-6 h-6" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-900">No categories found</p>
                                            <p className="text-xs text-slate-400 max-w-xs">
                                                Try adjusting your search terms or clearing active filters to see results.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                categories.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-blue-50/25 transition-colors group">
                                        <td className="py-3 px-4 sm:px-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200/60 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0 shadow-2xs">
                                                    {cat.title ? cat.title.charAt(0).toUpperCase() : "C"}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-bold text-slate-900 text-xs truncate">
                                                        {cat.title}
                                                    </span>
                                                    <span className="text-[11px] text-slate-400 mt-0.5">
                                                        Created {new Date(cat.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="text-xs text-slate-600 max-w-md block truncate">
                                                {cat.description || (
                                                    <span className="italic text-slate-400 text-[11px]">
                                                        No description provided
                                                    </span>
                                                )}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                                                    cat.is_active
                                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                                        : "bg-rose-50 text-rose-700 border border-rose-200/60"
                                                }`}
                                            >
                                                <span
                                                    className={`w-1.5 h-1.5 rounded-full ${
                                                        cat.is_active ? "bg-emerald-500" : "bg-rose-500"
                                                    }`}
                                                />
                                                {cat.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 sm:px-5 text-right">
                                            <ActionButton
                                                category={cat}
                                                currentUser={currentUser}
                                                onUpdateCategory={handleUpdateCategoryRow}
                                                onDeleteCategory={handleDeleteCategoryRow}
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="border-t border-slate-100 px-4 sm:px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
                        <span className="text-xs text-slate-500 font-medium">
                            Showing page <span className="text-slate-900 font-bold">{page}</span> of{" "}
                            <span className="text-slate-900 font-bold">{totalPages}</span> ({totalItems} categories total)
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

            {/* FILTER SIDE Drawer MENU */}
            <AdminFilterMenu
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                title="Filter Categories"
            >
                <Filters
                    statusFilter={statusFilter}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onApply={(newFilters) => updateParams({ ...newFilters, page: 1 })}
                    onReset={() => updateParams({ status: undefined, sort_by: undefined, sort: undefined, page: 1 })}
                    onClose={() => setIsFilterOpen(false)}
                />
            </AdminFilterMenu>

            {/* CREATE CATEGORY MODAL */}
            <CreateCategoryModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCategoryCreated={(newCat) => {
                    if (newCat && newCat.id) {
                        setCategories((prev) => [newCat, ...prev.filter((c) => c.id !== newCat.id)]);
                        setTotalItems((prev) => prev + 1);
                    }
                    refetchCategories();
                }}
            />
        </div>
    );
}
