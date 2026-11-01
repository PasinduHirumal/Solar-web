import React, { useState } from "react";
import { toast } from "react-hot-toast";
import {
  Ban,
  CheckCircle,
  Edit3,
  Trash2,
  Loader2,
  DollarSign,
  Eye,
} from "lucide-react";
import { axiosInstance } from "../../../../lib/axiosInstance";
import { confirmAction } from "../../../../lib/confirmAction";
import { isSuperAdmin, isAdmin } from "../../../../lib/roles";
import ViewItemModal from "./ViewItemModal";
import EditItemModal from "./EditItemModal";
import UpdatePriceModal from "./UpdatePriceModal";

export default function ActionButton({
  item,
  categoryName,
  categories = [],
  currentUser,
  onUpdateItem,
  onDeleteItem,
}) {
  const [statusLoading, setStatusLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Modal open states
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);

  const canEdit = isSuperAdmin(currentUser?.role);
  const canUpdatePrice = isSuperAdmin(currentUser?.role);
  const canDelete = isSuperAdmin(currentUser?.role);

  const handleToggleStatus = async () => {
    const actionText = item.is_active ? "deactivate" : "activate";
    const confirmed = await confirmAction({
      title: `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Solar Item?`,
      text: `Are you sure you want to ${actionText} "${item.title}"?`,
      confirmButtonText: `Yes, ${actionText}`,
    });

    if (!confirmed) return;

    setStatusLoading(true);
    try {
      const response = await axiosInstance.put(
        `/items/${item.id}/toggle/status`
      );
      const updated = response.data?.data || response.data;
      toast.success(`Solar item ${actionText}d successfully`);
      if (onUpdateItem) {
        onUpdateItem(updated || { ...item, is_active: !item.is_active });
      }
    } catch (error) {
      const msg = error.response?.data?.message;
      toast.error(
        Array.isArray(msg)
          ? msg.join(", ")
          : msg || error.message || "Failed to toggle item status"
      );
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDeleteItem = async () => {
    const confirmed = await confirmAction({
      title: "Delete Solar Item?",
      text: `Are you sure you want to permanently delete "${item.title}" (${item.code})? This action cannot be undone.`,
      confirmButtonText: "Yes, delete",
    });

    if (!confirmed) return;

    setDeleteLoading(true);
    try {
      await axiosInstance.delete(`/items/${item.id}`);
      toast.success("Solar item deleted successfully");
      if (onDeleteItem) {
        onDeleteItem(item.id);
      }
    } catch (error) {
      const msg = error.response?.data?.message;
      toast.error(
        Array.isArray(msg)
          ? msg.join(", ")
          : msg || error.message || "Failed to delete solar item"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        {/* View Details Button */}
        <button
          onClick={() => setIsViewOpen(true)}
          className="p-1.5 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors rounded-md ring-1 ring-slate-600/10 disabled:opacity-50 cursor-pointer flex items-center justify-center"
          title="View Details"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>

        {/* Edit Data Button */}
        {canEdit && (
          <button
            onClick={() => setIsEditOpen(true)}
            className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors rounded-md ring-1 ring-blue-600/10 dark:ring-blue-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center"
            title="Edit Item Details"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Update Price Button (SuperAdmin only) */}
        {canUpdatePrice && (
          <button
            onClick={() => setIsPriceOpen(true)}
            className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 transition-colors rounded-md ring-1 ring-emerald-600/10 dark:ring-emerald-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center"
            title="Update Price"
          >
            <DollarSign className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Toggle Status Button */}
        {canEdit && (
          <button
            onClick={handleToggleStatus}
            disabled={statusLoading}
            className={`p-1.5 transition-colors rounded-md ring-1 disabled:opacity-50 cursor-pointer flex items-center justify-center ${
              item.is_active
                ? "bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50 ring-amber-600/10 dark:ring-amber-500/20"
                : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 ring-emerald-600/10 dark:ring-emerald-500/20"
            }`}
            title={item.is_active ? "Deactivate Item" : "Activate Item"}
          >
            {statusLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : item.is_active ? (
              <Ban className="w-3.5 h-3.5" />
            ) : (
              <CheckCircle className="w-3.5 h-3.5" />
            )}
          </button>
        )}

        {/* Delete Item Button (Super Admin only) */}
        {canDelete && (
          <button
            onClick={handleDeleteItem}
            disabled={deleteLoading}
            className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors rounded-md ring-1 ring-red-600/10 dark:ring-red-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center"
            title="Delete Item"
          >
            {deleteLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>

      {/* View Item Details Modal */}
      <ViewItemModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        item={item}
        categoryName={categoryName}
      />

      {/* Edit Data Modal */}
      <EditItemModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        item={item}
        categories={categories}
        onItemUpdated={onUpdateItem}
      />

      {/* Update Price Modal */}
      <UpdatePriceModal
        isOpen={isPriceOpen}
        onClose={() => setIsPriceOpen(false)}
        item={item}
        onItemUpdated={onUpdateItem}
      />
    </>
  );
}
