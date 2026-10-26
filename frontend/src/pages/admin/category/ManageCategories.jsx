import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FolderTree, Plus, Search, CheckCircle, Ban, Edit, Trash2, X, Loader2, Calendar
} from 'lucide-react';
import { axiosInstance } from '../../../lib/axiosInstance';
import { confirmAction } from '../../../lib/confirmAction';
import { isSuperAdmin } from '../../../lib/roles';
import useAuthStore from '../../../lib/authStore';

export default function ManageCategories() {
  const [searchParams, setSearchParams] = useSearchParams();

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

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const { user: currentUser } = useAuthStore();

  // Adjust state during render when URL search param changes externally (React official pattern)
  if (prevSearchTerm !== searchTerm) {
    setPrevSearchTerm(searchTerm);
    setSearchInput(searchTerm);
  }

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

  // Debounce search
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

    const loadCategories = async () => {
      try {
        const response = await axiosInstance.get('/categories', {
          params: {
            page,
            limit: 10,
            search_term: searchTerm.trim() || undefined,
            is_active: statusFilter === "" ? undefined : statusFilter === "true",
            sort_by: sortBy || "created_at",
            sort_order: sortOrder || "DESC",
          },
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
          toast.error(Array.isArray(msg) ? msg.join(", ") : (msg || error.message || "Failed to load categories"));
          setLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      active = false;
    };
  }, [page, searchTerm, statusFilter, sortBy, sortOrder]);

  const handleOpenCreateModal = () => {
    setFormTitle("");
    setFormDescription("");
    setEditingCategory(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setFormTitle(cat.title || "");
    setFormDescription(cat.description || "");
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingCategory(null);
    setFormTitle("");
    setFormDescription("");
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!formTitle.trim() || formTitle.trim().length < 3) {
      toast.error("Title must be at least 3 characters");
      return;
    }

    setModalLoading(true);
    try {
      if (editingCategory) {
        const payload = {
          title: formTitle.trim(),
          description: formDescription.trim() || undefined,
        };
        const res = await axiosInstance.put(`/categories/${editingCategory.id}/update/data`, payload);
        const updated = res.data?.data || res.data;
        toast.success("Category updated successfully");
        setCategories((prev) =>
          prev.map((c) => (c.id === editingCategory.id ? { ...c, ...updated } : c))
        );
      } else {
        const payload = {
          title: formTitle.trim(),
          description: formDescription.trim() || undefined,
        };
        await axiosInstance.post('/categories', payload);
        toast.success("Category created successfully");
        updateParams({ page: 1 });
      }
      handleCloseModal();
    } catch (error) {
      const msg = error.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(", ") : (msg || error.message || "Failed to save category"));
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleStatus = async (cat) => {
    const actionText = cat.is_active ? "deactivate" : "activate";
    const confirmed = await confirmAction({
      title: `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Category?`,
      text: `Are you sure you want to ${actionText} "${cat.title}"?`,
      confirmButtonText: `Yes, ${actionText}`,
    });

    if (!confirmed) return;

    setActionLoading(`${cat.id}-toggle`);
    try {
      const res = await axiosInstance.put(`/categories/${cat.id}/toggle/status`);
      const updated = res.data?.data || res.data;
      toast.success(`Category ${actionText}d successfully`);
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, ...updated, is_active: !cat.is_active } : c))
      );
    } catch (error) {
      const msg = error.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(", ") : (msg || error.message || "Failed to toggle status"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCategory = async (cat) => {
    const confirmed = await confirmAction({
      title: "Delete Category?",
      text: `Are you sure you want to permanently delete "${cat.title}"?`,
      confirmButtonText: "Yes, delete",
    });

    if (!confirmed) return;

    setActionLoading(`${cat.id}-delete`);
    try {
      await axiosInstance.delete(`/categories/${cat.id}`);
      toast.success("Category deleted successfully");
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      setTotalItems((prev) => Math.max(0, prev - 1));
    } catch (error) {
      const msg = error.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(", ") : (msg || error.message || "Failed to delete category"));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto w-full animate-fade-in space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <FolderTree className="w-8 h-8 text-blue-600" />
            Manage Categories
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Organize solar hardware collections and item categories.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition shadow-sm cursor-pointer"
        >
          <Plus size={18} />
          <span>Add Category</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-9 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white text-sm"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput("");
                updateParams({ search: undefined, page: 1 });
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter & Sort controls */}
        <div className="flex items-center gap-2.5">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => updateParams({ status: e.target.value, page: 1 })}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-xs font-medium cursor-pointer outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>

          {/* Sort By */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [f, o] = e.target.value.split("-");
              updateParams({ sort_by: f, sort: o, page: 1 });
            }}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-xs font-medium cursor-pointer outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="created_at-DESC">Newest First</option>
            <option value="created_at-ASC">Oldest First</option>
            <option value="title-ASC">Title (A-Z)</option>
            <option value="title-DESC">Title (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center">
                    <div className="flex justify-center items-center gap-3 text-gray-500 dark:text-gray-400">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                      <span className="text-sm font-medium">Loading categories...</span>
                    </div>
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <FolderTree className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
                      <p className="text-base font-medium text-gray-900 dark:text-gray-100">No categories found</p>
                      <p className="text-sm">Click "Add Category" to create your first collection.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 font-bold">
                          <FolderTree size={20} />
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                          {cat.title}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 max-w-xs truncate text-sm text-gray-500 dark:text-gray-400">
                      {cat.description || <span className="italic text-gray-400 text-xs">No description provided</span>}
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-gray-400" />
                        <span>{new Date(cat.created_at).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        cat.is_active
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                      }`}>
                        {cat.is_active ? <CheckCircle size={13} /> : <Ban size={13} />}
                        {cat.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(cat)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition cursor-pointer"
                          title="Edit Category"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(cat)}
                          disabled={actionLoading === `${cat.id}-toggle`}
                          className={`p-2 rounded-lg transition cursor-pointer ${
                            cat.is_active
                              ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30'
                              : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
                          }`}
                          title={cat.is_active ? "Deactivate" : "Activate"}
                        >
                          {actionLoading === `${cat.id}-toggle` ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : cat.is_active ? (
                            <Ban size={16} />
                          ) : (
                            <CheckCircle size={16} />
                          )}
                        </button>
                        {isSuperAdmin(currentUser?.role) && (
                          <button
                            onClick={() => handleDeleteCategory(cat)}
                            disabled={actionLoading === `${cat.id}-delete`}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition cursor-pointer"
                            title="Delete Category"
                          >
                            {actionLoading === `${cat.id}-delete` ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="border-t border-gray-100 dark:border-gray-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/30 dark:bg-gray-800/30">
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Showing page <span className="font-semibold text-gray-900 dark:text-white">{page}</span> of <span className="font-semibold text-gray-900 dark:text-white">{totalPages}</span> ({totalItems} total)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => updateParams({ page: page - 1 })}
                className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => updateParams({ page: page + 1 })}
                className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-blue-600" />
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Category Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  minLength={3}
                  maxLength={255}
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Solar Inverters"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Description <span className="text-gray-400 font-normal lowercase">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Brief description of hardware in this category..."
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading || !formTitle.trim()}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {modalLoading && <Loader2 size={16} className="animate-spin" />}
                  <span>{editingCategory ? "Save Changes" : "Create Category"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
