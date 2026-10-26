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
        <div className="p-2 md:p-3 max-w-7xl mx-auto w-full animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Manage Categories</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-xs">View, create, and manage solar hardware collections.</p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    {/* Search Bar */}
                    <div className="relative flex-1 sm:flex-initial sm:w-56 md:w-64">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search by category title..."
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
                            hasActiveFilters ? "ring-2 ring-blue-500/50 border-blue-500 dark:border-blue-500 text-blue-600 dark:text-blue-400" : ""
                        }`}
                        title="Filter Categories"
                    >
                        <Filter className="w-3.5 h-3.5" />
                        {hasActiveFilters && (
                            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        )}
                    </button>

                    {/* Create Category CTA Button */}
                    {canCreate && (
                        <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-sm h-[34px] cursor-pointer shrink-0"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Create Category</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Categories Table Card */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                                <th className="py-2.5 px-4 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                                <th className="py-2.5 px-4 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                                <th className="py-2.5 px-4 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="py-2.5 px-4 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="py-8 text-center">
                                        <div className="flex justify-center items-center gap-2.5 text-gray-500 dark:text-gray-400">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                            <span className="text-xs font-medium">Loading categories...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : categories.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-8 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center gap-1.5">
                                            <FolderTree className="w-6 h-6 text-gray-300 dark:text-gray-600 mb-1" />
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">No categories found</p>
                                            <p className="text-xs">Try adjusting your search terms or filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                categories.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                        <td className="py-2.5 px-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xs shrink-0 shadow-inner">
                                                    {cat.title ? cat.title.charAt(0).toUpperCase() : 'C'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-900 dark:text-gray-100 text-xs">
                                                        {cat.title}
                                                    </span>
                                                    <span className="text-[11px] text-gray-400 mt-0.5">
                                                        Created {new Date(cat.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-2.5 px-4">
                                            <span className="text-xs text-gray-500 dark:text-gray-400 max-w-sm block truncate">
                                                {cat.description || <span className="italic text-gray-400 text-[11px]">No description provided</span>}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                                cat.is_active
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 ring-1 ring-emerald-600/10 dark:ring-emerald-500/20'
                                                    : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 ring-1 ring-red-600/10 dark:ring-red-500/20'
                                            }`}>
                                                {cat.is_active ? <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> : <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>}
                                                {cat.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-4 text-right">
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
                    <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/30 dark:bg-gray-800/30">
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            Showing <span className="text-gray-900 dark:text-white font-semibold">{page}</span> of <span className="text-gray-900 dark:text-white font-semibold">{totalPages}</span> ({totalItems} total categories)
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
