import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Mail, Shield, ShieldAlert, ShieldCheck, Search, Filter, CheckCircle, Ban, UserPlus, X, Phone, MapPin } from 'lucide-react';
import { axiosInstance } from '../../../lib/axiosInstance';
import { confirmAction } from '../../../lib/confirmAction';
import { UserRole, isSuperAdmin } from '../../../lib/roles';
import useAuthStore from '../../../lib/authStore';
import ActionButton from './components/ActionButton';
import Filters from './components/Filters';
import RegisterUserModal from './components/RegisterUserModal';
import AdminFilterMenu from '../../../common/AdminFilterMenu';

export default function ManageUsers() {
    const [searchParams, setSearchParams] = useSearchParams();

    // Read direct params from URL
    const searchTerm = searchParams.get("search") || "";
    const roleFilter = searchParams.get("role") || "";
    const statusFilter = searchParams.get("status") || "";
    const sortBy = searchParams.get("sort_by") || "created_at";
    const sortOrder = searchParams.get("sort") || "DESC";
    const page = parseInt(searchParams.get("page") || "1", 10) || 1;

    const [searchInput, setSearchInput] = useState(searchTerm);
    const [prevSearchTerm, setPrevSearchTerm] = useState(searchTerm);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const refetchUsers = useCallback(() => {
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
                const response = await axiosInstance.get('/users', {
                    params: {
                        page,
                        limit: 10,
                        search_term: searchTerm.trim() || undefined,
                        role: roleFilter || undefined,
                        is_active: statusFilter === "" ? undefined : statusFilter === "true",
                        sort_by: sortBy || "created_at",
                        sort_order: sortOrder || "DESC",
                    }
                });

                if (active) {
                    const data = response.data?.data || response.data;
                    setUsers(data.items || []);
                    setTotalPages(data.meta?.totalPages || 1);
                    setTotalItems(data.meta?.totalItems || 0);
                    setLoading(false);
                }
            } catch (error) {
                if (active) {
                    const msg = error.response?.data?.message;
                    toast.error(Array.isArray(msg) ? msg.join(", ") : (msg || error.message || "Failed to fetch users"));
                    setLoading(false);
                }
            }
        };

        loadData();

        return () => {
            active = false;
        };
    }, [page, searchTerm, roleFilter, statusFilter, sortBy, sortOrder, refreshTrigger]);

    const handleClearSearch = () => {
        setSearchInput("");
        updateParams({ search: undefined, page: 1 });
    };

    const handleUpdateUserRow = (updatedUser) => {
        if (!updatedUser || !updatedUser.id) return;
        setUsers((prevUsers) =>
            prevUsers.map((u) => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u))
        );
    };

    const handleDeleteUserRow = (deletedUserId) => {
        setUsers((prevUsers) => prevUsers.filter((u) => u.id !== deletedUserId));
        setTotalItems((prev) => Math.max(0, prev - 1));
    };

    const handleRoleChange = async (userId, newRole) => {
        const confirmed = await confirmAction({
            title: "Change User Role?",
            text: `Are you sure you want to change this account's role to ${newRole.replace('_', ' ')}?`,
            confirmButtonText: "Yes, change it",
        });

        if (!confirmed) return;

        setActionLoading(`${userId}-role`);
        try {
            const response = await axiosInstance.put(`/users/${userId}/change-role`, { role: newRole });
            const updatedUser = response.data?.data || response.data;
            toast.success("User role updated successfully");
            
            setUsers((prevUsers) =>
                prevUsers.map((u) => (u.id === userId ? { ...u, ...updatedUser, role: newRole } : u))
            );
        } catch (error) {
            const msg = error.response?.data?.message;
            toast.error(Array.isArray(msg) ? msg.join(", ") : (msg || error.message || "Failed to update role"));
        } finally {
            setActionLoading(null);
        }
    };

    const hasActiveFilters = Boolean(roleFilter || statusFilter || sortBy !== "created_at" || sortOrder !== "DESC");

    return (
        <div className="max-w-7xl mx-auto w-full space-y-4">
            {/* Page Header Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-[0_1px_3px_0_rgba(0,0,0,0.03)]">
                <div>
                    <div className="flex items-center gap-2.5">
                        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                            Manage Users
                        </h1>
                        {!loading && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                                {totalItems} total
                            </span>
                        )}
                    </div>
                    <p className="text-slate-500 text-xs mt-0.5">
                        View, edit roles, credentials, and manage system user access accounts.
                    </p>
                </div>

                <div className="flex items-center gap-2.5 w-full md:w-auto">
                    {/* Search Bar */}
                    <div className="relative flex-1 sm:flex-initial sm:w-64 md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
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
                        title="Filter Users"
                    >
                        <Filter className="w-4 h-4" />
                        {hasActiveFilters && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white" />
                        )}
                    </button>

                    {/* Register User CTA Button */}
                    {isSuperAdmin(currentUser?.role) && (
                        <button
                            type="button"
                            onClick={() => setIsRegisterModalOpen(true)}
                            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-sm shadow-blue-500/20 h-10 cursor-pointer shrink-0"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span className="hidden sm:inline">Register User</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Users Table Card */}
            <div className="bg-white rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.03)] border border-slate-200/90 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200/80">
                                <th className="py-3 px-4 sm:px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    Role
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
                                            <span className="text-xs font-semibold">Loading user accounts...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
                                                <Search className="w-6 h-6" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-900">No users found</p>
                                            <p className="text-xs text-slate-400 max-w-xs">
                                                Try adjusting your search terms or filters to find system user accounts.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                users.map((u) => (
                                    <tr key={u.id} className="hover:bg-blue-50/25 transition-colors group">
                                        <td className="py-3 px-4 sm:px-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200/60 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0 shadow-2xs">
                                                    {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                                                        {u.name}
                                                        {u.id === currentUser?.id && (
                                                            <span className="text-[9px] uppercase tracking-wider bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded-full font-bold">
                                                                You
                                                            </span>
                                                        )}
                                                    </span>
                                                    <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                                        <Mail className="w-3 h-3 text-slate-400" />
                                                        {u.email}
                                                    </span>
                                                    {u.phone && (
                                                        <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                                            <Phone className="w-3 h-3 text-blue-500" />
                                                            {u.phone}
                                                        </span>
                                                    )}
                                                    {u.address && (
                                                        <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 truncate max-w-xs" title={u.address}>
                                                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                                            {u.address}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            {/* Backend restricts changing USER role to another role. Only ADMIN <-> SUPER_ADMIN can be changed. */}
                                            {isSuperAdmin(currentUser?.role) && u.id !== currentUser?.id && u.role !== UserRole.USER ? (
                                                <select
                                                    value={u.role}
                                                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                    disabled={actionLoading === `${u.id}-role`}
                                                    className="bg-slate-50 hover:bg-white border border-slate-200 text-slate-900 text-xs rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 block py-1.5 pl-3 pr-7 transition-colors cursor-pointer appearance-none disabled:opacity-50 font-semibold"
                                                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em' }}
                                                >
                                                    <option value={UserRole.ADMIN}>Admin</option>
                                                    <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
                                                </select>
                                            ) : (
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                                                    u.role === UserRole.SUPER_ADMIN
                                                        ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                                                        : u.role === UserRole.ADMIN
                                                            ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                                                            : 'bg-slate-100 text-slate-700 border border-slate-200/60'
                                                }`}>
                                                    {u.role === UserRole.SUPER_ADMIN && <ShieldAlert className="w-3 h-3" />}
                                                    {u.role === UserRole.ADMIN && <ShieldCheck className="w-3 h-3" />}
                                                    {u.role === UserRole.USER && <Shield className="w-3 h-3" />}
                                                    {(u.role || '').replace('_', ' ')}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                                                u.is_active
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                                    : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                {u.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 sm:px-5 text-right">
                                            <ActionButton
                                                user={u}
                                                currentUser={currentUser}
                                                onUpdateUser={handleUpdateUserRow}
                                                onDeleteUser={handleDeleteUserRow}
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
                            <span className="text-slate-900 font-bold">{totalPages}</span> ({totalItems} users total)
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
                title="Filter Users"
            >
                <Filters
                    roleFilter={roleFilter}
                    statusFilter={statusFilter}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onApply={(newFilters) => updateParams({ ...newFilters, page: 1 })}
                    onReset={() => updateParams({ role: undefined, status: undefined, sort_by: undefined, sort: undefined, page: 1 })}
                    onClose={() => setIsFilterOpen(false)}
                />
            </AdminFilterMenu>

            {/* REGISTER USER MODAL */}
            <RegisterUserModal
                isOpen={isRegisterModalOpen}
                onClose={() => setIsRegisterModalOpen(false)}
                onUserCreated={(newUser) => {
                    if (newUser && newUser.id) {
                        setUsers((prev) => [newUser, ...prev.filter((u) => u.id !== newUser.id)]);
                        setTotalItems((prev) => prev + 1);
                    }
                    refetchUsers();
                }}
            />
        </div>
    );
}
