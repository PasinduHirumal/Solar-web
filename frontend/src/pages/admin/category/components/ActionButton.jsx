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

    const canEdit = isSuperAdmin(currentUser?.role);
    const canDelete = isSuperAdmin(currentUser?.role);

    return (
        <>
            <div className="flex items-center justify-end gap-1.5">
                {!canEdit && !canDelete && (
                    <span className="text-[10px] text-slate-400 italic px-2 py-0.5">
                        Read only
                    </span>
                )}
                {/* Edit Category Button */}
                {canEdit && (
                    <button
                        onClick={handleOpenEdit}
                        className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all border border-blue-200/60 shadow-2xs disabled:opacity-50 cursor-pointer flex items-center justify-center"
                        title="Edit Category"
                    >
                        <Edit3 className="w-3.5 h-3.5" />
                    </button>
                )}

                {/* Toggle Status Button */}
                {canEdit && (
                    <button
                        onClick={() => handleToggleStatus(category.id, category.is_active)}
                        disabled={statusLoading}
                        className={`w-7 h-7 transition-all rounded-lg border shadow-2xs disabled:opacity-50 cursor-pointer flex items-center justify-center ${
                            category.is_active
                                ? 'bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white border-amber-200/60'
                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border-emerald-200/60'
                        }`}
                        title={category.is_active ? "Deactivate Category" : "Activate Category"}
                    >
                        {statusLoading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : category.is_active ? (
                            <Ban className="w-3.5 h-3.5" />
                        ) : (
                            <CheckCircle className="w-3.5 h-3.5" />
                        )}
                    </button>
                )}

                {/* Delete Category Button (Super Admin only) */}
                {canDelete && (
                    <button
                        onClick={() => handleDeleteCategory(category.id, category.title)}
                        disabled={deleteLoading}
                        className="w-7 h-7 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all rounded-lg border border-rose-200/60 shadow-2xs disabled:opacity-50 cursor-pointer flex items-center justify-center"
                        title="Delete Category"
                    >
                        {deleteLoading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                        )}
                    </button>
                )}
            </div>

            {/* EDIT CATEGORY MODAL */}
            {isEditOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in text-left">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200/90 overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shadow-2xs">
                                    <FolderTree className="w-4 h-4" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900">
                                    Edit Category
                                </h3>
                            </div>
                            <button
                                onClick={handleCloseEdit}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                    Category Title <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    minLength={3}
                                    maxLength={255}
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    placeholder="e.g. Solar Inverters"
                                    className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200/90 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                    Description <span className="text-slate-400 font-normal lowercase">(optional)</span>
                                </label>
                                <textarea
                                    rows={3}
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    placeholder="Brief description of items in this collection..."
                                    className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200/90 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 resize-none transition"
                                />
                            </div>

                            <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={handleCloseEdit}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editLoading || !editTitle.trim()}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/20 transition disabled:opacity-50 cursor-pointer flex items-center gap-2"
                                >
                                    {editLoading && <Loader2 size={14} className="animate-spin" />}
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
