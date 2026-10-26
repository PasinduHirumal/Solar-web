import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Ban, CheckCircle, KeyRound, Loader2, Trash2 } from 'lucide-react';
import { axiosInstance } from '../../../../lib/axiosInstance';
import { confirmAction } from '../../../../lib/confirmAction';
import { isSuperAdmin, isAdmin } from '../../../../lib/roles';

export default function ActionButton({ user, currentUser, onUpdateUser, onDeleteUser }) {
    const [statusLoading, setStatusLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const handleSendResetLink = async (email) => {
        const confirmed = await confirmAction({
            title: "Send Password Reset Link?",
            text: `This will send a password reset email to ${email}.`,
            confirmButtonText: "Yes, send it",
        });

        if (!confirmed) return;

        setResetLoading(true);
        try {
            const response = await axiosInstance.post('/users/reset-password-link', { email });
            toast.success(response.data?.message || "Reset link sent successfully");
        } catch (error) {
            const msg = error.response?.data?.message;
            toast.error(Array.isArray(msg) ? msg.join(", ") : (msg || error.message || "Failed to send reset link"));
        } finally {
            setResetLoading(false);
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        const actionText = currentStatus ? "deactivate" : "activate";
        const confirmed = await confirmAction({
            title: `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} User?`,
            text: `Are you sure you want to ${actionText} this account?`,
            confirmButtonText: `Yes, ${actionText}`,
        });

        if (!confirmed) return;

        setStatusLoading(true);
        try {
            const response = await axiosInstance.put(`/users/${userId}/toggle-status`);
            const updatedUser = response.data?.data || response.data;
            toast.success(`User ${actionText}d successfully`);
            if (onUpdateUser) {
                onUpdateUser(updatedUser || { id: userId, is_active: !currentStatus });
            }
        } catch (error) {
            const msg = error.response?.data?.message;
            toast.error(Array.isArray(msg) ? msg.join(", ") : (msg || error.message || "Failed to toggle status"));
        } finally {
            setStatusLoading(false);
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        const confirmed = await confirmAction({
            title: "Delete User?",
            text: `Are you sure you want to permanently delete "${userName}"? This action cannot be undone.`,
            confirmButtonText: "Yes, delete",
        });

        if (!confirmed) return;

        setDeleteLoading(true);
        try {
            await axiosInstance.delete(`/users/${userId}`);
            toast.success("User deleted successfully");
            if (onDeleteUser) {
                onDeleteUser(userId);
            }
        } catch (error) {
            const msg = error.response?.data?.message;
            toast.error(Array.isArray(msg) ? msg.join(", ") : (msg || error.message || "Failed to delete user"));
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-end gap-1">
            {/* Send Reset Password Link (Available to SuperAdmin/Admin for any user, or self) */}
            {(isAdmin(currentUser?.role) || isSuperAdmin(currentUser?.role) || user.id === currentUser?.id) && (
                <button
                    onClick={() => handleSendResetLink(user.email)}
                    disabled={resetLoading}
                    className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors rounded-md ring-1 ring-blue-600/10 dark:ring-blue-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center"
                    title="Send Password Reset Link"
                >
                    {resetLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
                </button>
            )}

            {/* Toggle Active / Inactive (Super Admin only, cannot toggle self) */}
            {isSuperAdmin(currentUser?.role) && user.id !== currentUser?.id && (
                <button
                    onClick={() => handleToggleStatus(user.id, user.is_active)}
                    disabled={statusLoading}
                    className={`p-1.5 transition-colors rounded-md ring-1 disabled:opacity-50 cursor-pointer flex items-center justify-center ${user.is_active
                        ? 'bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50 ring-amber-600/10 dark:ring-amber-500/20'
                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 ring-emerald-600/10 dark:ring-emerald-500/20'
                        }`}
                    title={user.is_active ? "Deactivate User" : "Activate User"}
                >
                    {statusLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : user.is_active ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                </button>
            )}

            {/* Delete User (Super Admin only, cannot delete self) */}
            {isSuperAdmin(currentUser?.role) && user.id !== currentUser?.id && (
                <button
                    onClick={() => handleDeleteUser(user.id, user.name)}
                    disabled={deleteLoading}
                    className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors rounded-md ring-1 ring-red-600/10 dark:ring-red-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center"
                    title="Delete User"
                >
                    {deleteLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                </button>
            )}
        </div>
    );
}
