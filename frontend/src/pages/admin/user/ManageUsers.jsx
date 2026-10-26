import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Mail, Shield, ShieldAlert, ShieldCheck, Search, Filter, CheckCircle, Ban, UserPlus, X } from 'lucide-react';
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
        <div className="p-2 md:p-3 max-w-7xl mx-auto w-full animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Manage Users</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-xs">View, edit roles, and manage system user accounts.</p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    {/* Search Bar */}
                    <div className="relative flex-1 sm:flex-initial sm:w-56 md:w-64">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
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
                        title="Filter Users"
                    >
                        <Filter className="w-3.5 h-3.5" />
                        {hasActiveFilters && (
                            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        )}
                    </button>

                    {/* Register User CTA Button */}
                    {isSuperAdmin(currentUser?.role) && (
                        <button
                            type="button"
                            onClick={() => setIsRegisterModalOpen(true)}
                            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-sm h-[34px] cursor-pointer shrink-0"
                        >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Register User</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Users Table Card */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                                <th className="py-2.5 px-4 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                                <th className="py-2.5 px-4 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
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
                                            <span className="text-xs font-medium">Loading users...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-8 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center gap-1.5">
                                            <Search className="w-6 h-6 text-gray-300 dark:text-gray-600 mb-1" />
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">No users found</p>
                                            <p className="text-xs">Try adjusting your search terms or filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                users.map((u) => (
                                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                        <td className="py-2.5 px-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xs shrink-0 shadow-inner">
                                                    {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5 text-xs">
                                                        {u.name}
                                                        {u.id === currentUser?.id && (
                                                            <span className="text-[9px] uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-1.5 py-0.5 rounded-full font-bold">
                                                                You
                                                            </span>
                                                        )}
                                                    </span>
                                                    <span className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                                                        <Mail className="w-2.5 h-2.5" />
                                                        {u.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-2.5 px-4">
                                            {/* Backend restricts changing USER role to another role. Only ADMIN <-> SUPER_ADMIN can be changed. */}
                                            {isSuperAdmin(currentUser?.role) && u.id !== currentUser?.id && u.role !== UserRole.USER ? (
                                                <select
                                                    value={u.role}
                                                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                    disabled={actionLoading === `${u.id}-role`}
                                                    className="bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-xs rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block py-1 pl-2.5 pr-7 transition-colors cursor-pointer appearance-none disabled:opacity-50"
                                                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.4rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em' }}
                                                >
                                                    <option value={UserRole.ADMIN}>Admin</option>
                                                    <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
                                                </select>
                                            ) : (
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                                    u.role === UserRole.SUPER_ADMIN
                                                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 ring-1 ring-purple-600/10 dark:ring-purple-500/20'
                                                        : u.role === UserRole.ADMIN
                                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 ring-1 ring-blue-600/10 dark:ring-blue-500/20'
                                                            : 'bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-300 ring-1 ring-gray-600/10 dark:ring-gray-500/20'
                                                }`}>
                                                    {u.role === UserRole.SUPER_ADMIN && <ShieldAlert className="w-3 h-3" />}
                                                    {u.role === UserRole.ADMIN && <ShieldCheck className="w-3 h-3" />}
                                                    {u.role === UserRole.USER && <Shield className="w-3 h-3" />}
                                                    {(u.role || '').replace('_', ' ')}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-2.5 px-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                                u.is_active
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 ring-1 ring-emerald-600/10 dark:ring-emerald-500/20'
                                                    : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 ring-1 ring-red-600/10 dark:ring-red-500/20'
                                            }`}>
                                                {u.is_active ? <CheckCircle className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                                                {u.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-4 text-right">
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
                    <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/30 dark:bg-gray-800/30">
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            Showing <span className="text-gray-900 dark:text-white font-semibold">{page}</span> of <span className="text-gray-900 dark:text-white font-semibold">{totalPages}</span> ({totalItems} total users)
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
