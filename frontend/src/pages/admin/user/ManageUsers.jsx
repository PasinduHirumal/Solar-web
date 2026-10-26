import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Mail, Shield, ShieldAlert, ShieldCheck, Search, Filter, CheckCircle, Ban, UserPlus, X } from 'lucide-react';
import { axiosInstance } from '../../../lib/axiosInstance';
import { confirmAction } from '../../../lib/confirmAction';
import { UserRole, isSuperAdmin } from '../../../lib/roles';
import useAuthStore from '../../../lib/authStore';
import ActionButton from './components/ActionButton';
import Filters from './components/Filters';
import AdminFilterMenu from '../../../common/AdminFilterMenu';

export default function ManageUsers() {
    const [searchParams, setSearchParams] = useSearchParams();

    // Read initial URL params
    const urlSearch = searchParams.get("search") || "";
    const urlRole = searchParams.get("role") || "";
    const urlStatus = searchParams.get("status") || "";
    const urlSort = searchParams.get("sort") || "DESC";
    const urlPage = parseInt(searchParams.get("page") || "1", 10) || 1;

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(urlPage);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState(urlSearch);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(urlSearch);

    // Active filters
    const [roleFilter, setRoleFilter] = useState(urlRole);
    const [statusFilter, setStatusFilter] = useState(urlStatus);
    const [sortOrder, setSortOrder] = useState(urlSort);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const [totalItems, setTotalItems] = useState(0);
    const { user: currentUser } = useAuthStore();
    const [actionLoading, setActionLoading] = useState(null);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 250);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Sync state changes -> URL Search Params
    useEffect(() => {
        const params = new URLSearchParams();
        if (debouncedSearchTerm) params.set("search", debouncedSearchTerm);
        if (roleFilter) params.set("role", roleFilter);
        if (statusFilter) params.set("status", statusFilter);
        if (sortOrder && sortOrder !== "DESC") params.set("sort", sortOrder);
        if (page > 1) params.set("page", page.toString());

        if (params.toString() !== searchParams.toString()) {
            setSearchParams(params, { replace: true });
        }
    }, [debouncedSearchTerm, roleFilter, statusFilter, sortOrder, page, searchParams, setSearchParams]);

    // Sync URL Search Params -> State (e.g. browser back/forward)
    useEffect(() => {
        const s = searchParams.get("search") || "";
        const r = searchParams.get("role") || "";
        const st = searchParams.get("status") || "";
        const so = searchParams.get("sort") || "DESC";
        const p = parseInt(searchParams.get("page") || "1", 10) || 1;

        if (s !== searchTerm) {
            setSearchTerm(s);
            setDebouncedSearchTerm(s);
        }
        if (r !== roleFilter) setRoleFilter(r);
        if (st !== statusFilter) setStatusFilter(st);
        if (so !== sortOrder) setSortOrder(so);
        if (p !== page) setPage(p);
    }, [searchParams]);

    const fetchUsers = async (currentPage = page, search = debouncedSearchTerm, role = roleFilter, status = statusFilter, sort = sortOrder) => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/users', {
                params: {
                    page: currentPage,
                    limit: 10,
                    search_term: search || undefined,
                    role: role || undefined,
                    is_active: status === "" ? undefined : status === "true",
                    sort_order: sort || undefined
                }
            });
            const data = response.data?.data || response.data;
            setUsers(data.items || []);
            setTotalPages(data.meta?.totalPages || 1);
            setTotalItems(data.meta?.totalItems || 0);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(page, debouncedSearchTerm, roleFilter, statusFilter, sortOrder);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, debouncedSearchTerm, roleFilter, statusFilter, sortOrder]);

    const handleSearch = (e) => {
        e.preventDefault();
        setDebouncedSearchTerm(searchTerm);
        setPage(1);
    };

    const handleClearSearch = () => {
        setSearchTerm("");
        setDebouncedSearchTerm("");
        setPage(1);
    };

    // Update single user row in place without full table re-fetch
    const handleUpdateUserRow = (updatedUser) => {
        if (!updatedUser || !updatedUser.id) return;
        setUsers((prevUsers) =>
            prevUsers.map((u) => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u))
        );
    };

    const handleRoleChange = async (userId, newRole) => {
        const confirmed = await confirmAction({
            title: "Change User Role?",
            text: `Are you sure you want to change this user's role to ${newRole}?`,
            confirmButtonText: "Yes, change it",
        });

        if (!confirmed) return;

        setActionLoading(`${userId}-role`);
        try {
            const response = await axiosInstance.put(`/users/${userId}/change-role`, { role: newRole });
            const updatedUser = response.data?.data || response.data;
            toast.success("User role updated successfully");
            
            // Row-level update without full table reload
            setUsers((prevUsers) =>
                prevUsers.map((u) => (u.id === userId ? { ...u, ...updatedUser, role: newRole } : u))
            );
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update role");
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="p-4 max-w-7xl mx-auto w-full animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Manage Users</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">View, edit roles, and manage system user accounts.</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <form onSubmit={handleSearch} className="relative flex-1 sm:flex-initial sm:w-64 md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(1);
                            }}
                            className="w-full pl-10 pr-9 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white transition-shadow shadow-sm text-sm h-[38px]"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                                title="Clear search"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </form>

                    <button
                        onClick={() => setIsFilterOpen(true)}
                        type="button"
                        className={`flex items-center justify-center p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition shadow-sm h-[38px] w-[38px] cursor-pointer relative ${roleFilter || statusFilter || sortOrder !== "DESC"
                            ? "ring-2 ring-blue-500/50 border-blue-500 dark:border-blue-500 text-blue-600 dark:text-blue-400"
                            : ""
                            }`}
                        title="Filter Users"
                    >
                        <Filter className="w-4 h-4" />
                        {/* Dot indicator if active filters are present */}
                        {(roleFilter || statusFilter || sortOrder !== "DESC") && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                    </button>

                    <Link
                        to="/admin/users/create"
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition shadow-sm h-[38px] cursor-pointer shrink-0"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span className="hidden sm:inline">Register User</span>
                    </Link>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="py-12 text-center">
                                        <div className="flex justify-center items-center gap-3 text-gray-500 dark:text-gray-400">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                                            <span className="text-sm font-medium">Loading users...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-12 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
                                            <p className="text-base font-medium text-gray-900 dark:text-gray-100">No users found</p>
                                            <p className="text-sm">Try adjusting your search terms.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                users.map((u) => (
                                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-sm shrink-0 shadow-inner">
                                                    {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 text-sm">
                                                        {u.name}
                                                        {u.id === currentUser?.id && (
                                                            <span className="text-[10px] uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold">
                                                                You
                                                            </span>
                                                        )}
                                                    </span>
                                                    <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                                                        <Mail className="w-3 h-3" />
                                                        {u.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            {isSuperAdmin(currentUser?.role) && u.id !== currentUser?.id ? (
                                                <select
                                                    value={u.role}
                                                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                    disabled={actionLoading === `${u.id}-role`}
                                                    className="bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block py-1.5 pl-3 pr-8 transition-colors cursor-pointer appearance-none disabled:opacity-50"
                                                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                                                >
                                                    <option value={UserRole.USER}>User</option>
                                                    <option value={UserRole.ADMIN}>Admin</option>
                                                    <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
                                                </select>
                                            ) : (
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${u.role === UserRole.SUPER_ADMIN
                                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 ring-1 ring-purple-600/10 dark:ring-purple-500/20'
                                                    : u.role === UserRole.ADMIN
                                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 ring-1 ring-blue-600/10 dark:ring-blue-500/20'
                                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-300 ring-1 ring-gray-600/10 dark:ring-gray-500/20'
                                                    }`}>
                                                    {u.role === UserRole.SUPER_ADMIN && <ShieldAlert className="w-3.5 h-3.5" />}
                                                    {u.role === UserRole.ADMIN && <ShieldCheck className="w-3.5 h-3.5" />}
                                                    {u.role === UserRole.USER && <Shield className="w-3.5 h-3.5" />}
                                                    {(u.role || '').replace('_', ' ')}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${u.is_active
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 ring-1 ring-emerald-600/10 dark:ring-emerald-500/20'
                                                : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 ring-1 ring-red-600/10 dark:ring-red-500/20'
                                                }`}>
                                                {u.is_active ? <CheckCircle className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                                                {u.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <ActionButton
                                                user={u}
                                                currentUser={currentUser}
                                                onUpdateUser={handleUpdateUserRow}
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
                    <div className="border-t border-gray-100 dark:border-gray-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/30 dark:bg-gray-800/30">
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            Showing <span className="text-gray-900 dark:text-white font-semibold">{page}</span> of <span className="text-gray-900 dark:text-white font-semibold">{totalPages}</span> ({totalItems} total users)
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm active:scale-[0.98]"
                            >
                                Previous
                            </button>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(p => p + 1)}
                                className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm active:scale-[0.98]"
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
                    setRoleFilter={setRoleFilter}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                    setPage={setPage}
                    onClose={() => setIsFilterOpen(false)}
                />
            </AdminFilterMenu>
        </div>
    );
}
