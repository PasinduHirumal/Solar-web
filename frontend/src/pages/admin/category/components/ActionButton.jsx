import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Ban, CheckCircle, Edit3, Trash2, Loader2, X, FolderTree } from 'lucide-react';
import { axiosInstance } from '../../../../lib/axiosInstance';
import { confirmAction } from '../../../../lib/confirmAction';
import { isSuperAdmin, isAdmin } from '../../../../lib/roles';

export default function ActionButton({ category, currentUser, onUpdateCategory, onDeleteCategory }) {
    const [statusLoading, setStatusLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editTitle, setEditTitle] = useState(category.title || "");
    const [editDescription, setEditDescription] = useState(category.description || "");
    const [editLoading, setEditLoading] = useState(false);

    const handleOpenEdit = () => {
        setEditTitle(category.title || "");
        setEditDescription(category.description || "");
        setIsEditOpen(true);
    };

    const handleCloseEdit = () => {
        setIsEditOpen(false);
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        const trimmedTitle = editTitle.trim();
        if (!trimmedTitle || trimmedTitle.length < 3) {
            toast.error("Category title must be at least 3 characters");
            return;
        }

        setEditLoading(true);
        try {
            const payload = {
                title: trimmedTitle,
                description: editDescription.trim() || undefined,
            };

            const response = await axiosInstance.put(`/categories/${category.id}/update/data`, payload);
            const updated = response.data?.data || response.data;
            toast.success("Category updated successfully");
            if (onUpdateCategory) {
                onUpdateCategory(updated);
            }
            handleCloseEdit();
        } catch (error) {
            const msg = error.response?.data?.message;
            toast.error(Array.isArray(msg) ? msg.join(", ") : (msg || error.message || "Failed to update category"));
        } finally {
            setEditLoading(false);
        }
    };

    const handleToggleStatus = async (catId, currentStatus) => {
        const actionText = currentStatus ? "deactivate" : "activate";
        const confirmed = await confirmAction({
            title: `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Category?`,
            text: `Are you sure you want to ${actionText} "${category.title}"?`,
            confirmButtonText: `Yes, ${actionText}`,
        });

        if (!confirmed) return;

        setStatusLoading(true);
        try {
            const response = await axiosInstance.put(`/categories/${catId}/toggle/status`);
            const updated = response.data?.data || response.data;
            toast.success(`Category ${actionText}d successfully`);
            if (onUpdateCategory) {
                onUpdateCategory(updated || { ...category, is_active: !currentStatus });
            }
        } catch (error) {
            const msg = error.response?.data?.message;
            toast.error(Array.isArray(msg) ? msg.join(", ") : (msg || error.message || "Failed to toggle status"));
        } finally {
            setStatusLoading(false);
        }
    };

    const handleDeleteCategory = async (catId, catTitle) => {
        const confirmed = await confirmAction({
            title: "Delete Category?",
            text: `Are you sure you want to permanently delete "${catTitle}"? This action cannot be undone.`,
            confirmButtonText: "Yes, delete",
        });

        if (!confirmed) return;

        setDeleteLoading(true);
        try {
            await axiosInstance.delete(`/categories/${catId}`);
            toast.success("Category deleted successfully");
            if (onDeleteCategory) {
                onDeleteCategory(catId);
            }
        } catch (error) {
            const msg = error.response?.data?.message;
            toast.error(Array.isArray(msg) ? msg.join(", ") : (msg || error.message || "Failed to delete category"));
        } finally {
            setDeleteLoading(false);
        }
    };

    const canEdit = isAdmin(currentUser?.role) || isSuperAdmin(currentUser?.role);
    const canDelete = isSuperAdmin(currentUser?.role);

    return (
        <>
            <div className="flex items-center justify-end gap-1.5">
                {/* Edit Category Button */}
                {canEdit && (
                    <button
                        onClick={handleOpenEdit}
                        className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors rounded-lg ring-1 ring-blue-600/10 dark:ring-blue-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center"
                        title="Edit Category"
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>
                )}

                {/* Toggle Status Button */}
                {canEdit && (
                    <button
                        onClick={() => handleToggleStatus(category.id, category.is_active)}
                        disabled={statusLoading}
                        className={`p-2 transition-colors rounded-lg ring-1 disabled:opacity-50 cursor-pointer flex items-center justify-center ${
                            category.is_active
                                ? 'bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50 ring-amber-600/10 dark:ring-amber-500/20'
                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 ring-emerald-600/10 dark:ring-emerald-500/20'
                        }`}
                        title={category.is_active ? "Deactivate Category" : "Activate Category"}
                    >
                        {statusLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : category.is_active ? (
                            <Ban className="w-4 h-4" />
                        ) : (
                            <CheckCircle className="w-4 h-4" />
                        )}
                    </button>
                )}

                {/* Delete Category Button (Super Admin only) */}
                {canDelete && (
                    <button
                        onClick={() => handleDeleteCategory(category.id, category.title)}
                        disabled={deleteLoading}
                        className="p-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors rounded-lg ring-1 ring-red-600/10 dark:ring-red-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center"
                        title="Delete Category"
                    >
                        {deleteLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Trash2 className="w-4 h-4" />
                        )}
                    </button>
                )}
            </div>

            {/* EDIT CATEGORY MODAL */}
            {isEditOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in text-left">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full border border-gray-100 dark:border-gray-800 overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <FolderTree className="w-5 h-5 text-blue-600" />
                                Edit Category
                            </h3>
                            <button
                                onClick={handleCloseEdit}
                                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                    Category Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    minLength={3}
                                    maxLength={255}
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    placeholder="e.g. Solar Inverters"
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                    Description <span className="text-gray-400 font-normal lowercase">(optional)</span>
                                </label>
                                <textarea
                                    rows={3}
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    placeholder="Brief description of items in this collection..."
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
                                />
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    type="button"
                                    onClick={handleCloseEdit}
                                    className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-300 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editLoading || !editTitle.trim()}
                                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition disabled:opacity-50 cursor-pointer flex items-center gap-2"
                                >
                                    {editLoading && <Loader2 size={16} className="animate-spin" />}
                                    <span>Save Changes</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
