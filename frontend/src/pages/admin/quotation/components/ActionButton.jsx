import React, { useState } from "react";
import { toast } from "react-hot-toast";
import {
  Eye,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { axiosInstance } from "../../../../lib/axiosInstance";
import { confirmAction } from "../../../../lib/confirmAction";
import { isSuperAdmin } from "../../../../lib/roles";
import ViewQuotationModal from "./ViewQuotationModal";
import EditQuotationModal from "./EditQuotationModal";

export default function ActionButton({
  quotation,
  currentUser,
  onUpdateQuotation,
  onDeleteQuotation,
}) {
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Modal open states
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const isSuper = isSuperAdmin(currentUser?.role);
  const isDraft = quotation.status === "DRAFT";
  const isSent = quotation.status === "SENT";

  const handleAccept = async () => {
    const confirmed = await confirmAction({
      title: "Accept Quotation?",
      text: `Are you sure you want to approve and accept quotation "${quotation.quotation_number}"? This will lock item pricing snapshots.`,
      confirmButtonText: "Yes, accept",
    });

    if (!confirmed) return;

    setAcceptLoading(true);
    try {
      const response = await axiosInstance.put(
        `/quotations/${quotation.id}/status/accept`
      );
      const updated = response.data?.data || response.data;
      toast.success("Quotation accepted successfully");
      if (onUpdateQuotation) {
        onUpdateQuotation(updated || { ...quotation, status: "ACCEPTED" });
      }
    } catch (error) {
      const msg = error.response?.data?.message;
      toast.error(
        Array.isArray(msg)
          ? msg.join(", ")
          : msg || error.message || "Failed to accept quotation"
      );
    } finally {
      setAcceptLoading(false);
    }
  };

  const handleReject = async () => {
    const confirmed = await confirmAction({
      title: "Reject Quotation?",
      text: `Are you sure you want to reject quotation "${quotation.quotation_number}"?`,
      confirmButtonText: "Yes, reject",
    });

    if (!confirmed) return;

    setRejectLoading(true);
    try {
      const response = await axiosInstance.put(
        `/quotations/${quotation.id}/status/reject`
      );
      const updated = response.data?.data || response.data;
      toast.success("Quotation marked as rejected");
      if (onUpdateQuotation) {
        onUpdateQuotation(updated || { ...quotation, status: "REJECTED" });
      }
    } catch (error) {
      const msg = error.response?.data?.message;
      toast.error(
        Array.isArray(msg)
          ? msg.join(", ")
          : msg || error.message || "Failed to reject quotation"
      );
    } finally {
      setRejectLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = await confirmAction({
      title: "Delete Quotation?",
      text: `Are you sure you want to permanently delete draft quotation "${quotation.quotation_number}"? This cannot be undone.`,
      confirmButtonText: "Yes, delete",
    });

    if (!confirmed) return;

    setDeleteLoading(true);
    try {
      await axiosInstance.delete(`/quotations/${quotation.id}`);
      toast.success("Quotation deleted successfully");
      if (onDeleteQuotation) {
        onDeleteQuotation(quotation.id);
      }
    } catch (error) {
      const msg = error.response?.data?.message;
      toast.error(
        Array.isArray(msg)
          ? msg.join(", ")
          : msg || error.message || "Failed to delete quotation"
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
          title="View Quotation"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>

        {/* Edit Button (DRAFT status only) */}
        {isDraft && (
          <button
            onClick={() => setIsEditOpen(true)}
            className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors rounded-md ring-1 ring-blue-600/10 dark:ring-blue-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center"
            title="Edit Quotation (Terms, Tax, Discount)"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        )}

        {/* SuperAdmin Accept Button (SENT status only) */}
        {isSuper && isSent && (
          <button
            onClick={handleAccept}
            disabled={acceptLoading}
            className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 transition-colors rounded-md ring-1 ring-emerald-600/10 dark:ring-emerald-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center"
            title="Accept Quotation"
          >
            {acceptLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle className="w-3.5 h-3.5" />
            )}
          </button>
        )}

        {/* SuperAdmin Reject Button (SENT status only) */}
        {isSuper && isSent && (
          <button
            onClick={handleReject}
            disabled={rejectLoading}
            className="p-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50 transition-colors rounded-md ring-1 ring-amber-600/10 dark:ring-amber-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center"
            title="Reject Quotation"
          >
            {rejectLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <XCircle className="w-3.5 h-3.5" />
            )}
          </button>
        )}

        {/* Delete Button (DRAFT status only) */}
        {isDraft && (
          <button
            onClick={handleDelete}
            disabled={deleteLoading}
            className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors rounded-md ring-1 ring-red-600/10 dark:ring-red-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center"
            title="Delete Draft Quotation"
          >
            {deleteLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>

      {/* View Details Modal */}
      <ViewQuotationModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        quotation={quotation}
        quotationId={quotation.id}
      />

      {/* Edit Modal */}
      <EditQuotationModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        quotation={quotation}
        onQuotationUpdated={onUpdateQuotation}
      />
    </>
  );
}
