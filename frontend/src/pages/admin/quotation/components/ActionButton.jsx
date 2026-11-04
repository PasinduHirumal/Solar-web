import React, { useState } from "react";
import { toast } from "react-hot-toast";
import {
  Eye,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  FilePlus,
} from "lucide-react";
import { axiosInstance } from "../../../../lib/axiosInstance";
import { confirmAction } from "../../../../lib/confirmAction";
import { isAdmin, isSuperAdmin } from "../../../../lib/roles";
import ViewQuotationModal from "./ViewQuotationModal";
import EditQuotationModal from "./editQuotation/EditQuotationModal";
import CreateInvoiceModal from "./CreateInvoiceModal";

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
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);

  const isSuper = isSuperAdmin(currentUser?.role);
  const isAdm = isAdmin(currentUser?.role);
  const isDraft = quotation.status === "DRAFT";
  const isSent = quotation.status === "SENT";
  const isFinalized = quotation.status === "ACCEPTED" || quotation.status === "REJECTED";

  // Create Invoice in Database (POST /invoices/:quotation_id - ADMIN, SUPER_ADMIN)
  const canCreateInvoice = (isAdm || isSuper) && quotation.status !== "REJECTED";

  /*
   * Role & status validation according to backend quotations.service.ts & quotations.controller.ts:
   * - SUPER_ADMIN status actions: Accept and Reject buttons (PUT /quotations/:id/status/accept & /status/reject)
   * Backend strictly enforces that quotation MUST be in "SENT" status to be accepted or rejected.
   * In "DRAFT" status, accepting/rejecting is blocked with: "Cannot update status for quotation in status: DRAFT"
   * When DRAFT, buttons are displayed disabled with explanatory tooltips for SuperAdmin.
   */
  const canAcceptReject = isSuper && !isFinalized;

  /*
   * - Edit button:
   * ADMIN can edit when DRAFT (all tabs) or SENT (items tab)
   * SUPER_ADMIN can edit when DRAFT (discount, tax, notes)
   */
  const canEdit = isAdm ? (isDraft || isSent) : (isSuper && isDraft);

  // - Delete button: DELETE /quotations/:id is allowed for ADMIN & SUPER_ADMIN when status is DRAFT
  const canDelete = (isAdm || isSuper) && isDraft;

  const handleAccept = async () => {
    if (!isSent) {
      toast.error(
        `Cannot accept quotation in "${quotation.status}" status. It must be in "SENT" status first.`
      );
      return;
    }

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
    if (!isSent) {
      toast.error(
        `Cannot reject quotation in "${quotation.status}" status. It must be in "SENT" status first.`
      );
      return;
    }

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
      <div className="flex items-center justify-end gap-1.5">
        {/* View Details Button (GET /quotations/:id - ADMIN, SUPER_ADMIN) */}
        <button
          onClick={() => setIsViewOpen(true)}
          className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all rounded-lg border border-slate-200/80 shadow-2xs disabled:opacity-50 cursor-pointer flex items-center justify-center"
          title="View Quotation Details"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>

        {/* Edit Button (Opens Modal with tab navigation by role & status) */}
        {canEdit && (
          <button
            onClick={() => setIsEditOpen(true)}
            className="w-7 h-7 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all rounded-lg border border-blue-200/60 shadow-2xs disabled:opacity-50 cursor-pointer flex items-center justify-center"
            title="Edit Quotation"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Create Invoice in Database Button (POST /invoices/:quotation_id - ADMIN, SUPER_ADMIN) */}
        {canCreateInvoice && (
          <button
            onClick={() => setIsCreateInvoiceOpen(true)}
            className="w-7 h-7 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all rounded-lg border border-blue-200/60 shadow-2xs disabled:opacity-50 cursor-pointer flex items-center justify-center"
            title="Create & Save Invoice"
          >
            <FilePlus className="w-3.5 h-3.5" />
          </button>
        )}

        {/* SuperAdmin Accept Button (SENT status only - PUT /quotations/:id/status/accept) */}
        {canAcceptReject && (
          <button
            onClick={isSent ? handleAccept : undefined}
            disabled={!isSent || acceptLoading}
            className={`w-7 h-7 transition-all rounded-lg border shadow-2xs flex items-center justify-center ${
              isSent
                ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border-emerald-200/60 cursor-pointer"
                : "bg-slate-100 text-slate-400 border-slate-200/60 opacity-60 cursor-not-allowed"
            }`}
            title={
              isSent
                ? "Approve & Accept Quotation"
                : "Cannot accept: Quotation must be in SENT status first"
            }
          >
            {acceptLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle className="w-3.5 h-3.5" />
            )}
          </button>
        )}

        {/* SuperAdmin Reject Button (SENT status only - PUT /quotations/:id/status/reject) */}
        {canAcceptReject && (
          <button
            onClick={isSent ? handleReject : undefined}
            disabled={!isSent || rejectLoading}
            className={`w-7 h-7 transition-all rounded-lg border shadow-2xs flex items-center justify-center ${
              isSent
                ? "bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white border-amber-200/60 cursor-pointer"
                : "bg-slate-100 text-slate-400 border-slate-200/60 opacity-60 cursor-not-allowed"
            }`}
            title={
              isSent
                ? "Reject Quotation"
                : "Cannot reject: Quotation must be in SENT status first"
            }
          >
            {rejectLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <XCircle className="w-3.5 h-3.5" />
            )}
          </button>
        )}

        {/* Delete Button (DRAFT status only - DELETE /quotations/:id - ADMIN, SUPER_ADMIN) */}
        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={deleteLoading}
            className="w-7 h-7 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all rounded-lg border border-rose-200/60 shadow-2xs disabled:opacity-50 cursor-pointer flex items-center justify-center"
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

      {/* Edit Modal with role-based tabs & switch-case navigation */}
      <EditQuotationModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        quotation={quotation}
        onQuotationUpdated={onUpdateQuotation}
      />

      {/* Create Invoice in Database Modal (POST /invoices/:quotation_id) */}
      <CreateInvoiceModal
        isOpen={isCreateInvoiceOpen}
        onClose={() => setIsCreateInvoiceOpen(false)}
        quotation={quotation}
        onInvoiceCreated={(createdInv) => {
          if (onUpdateQuotation) {
            onUpdateQuotation({
              ...quotation,
              invoice_id: createdInv?.id,
              invoice_number: createdInv?.invoice_number,
            });
          }
        }}
      />
    </>
  );
}
