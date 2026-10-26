import React, { useState } from 'react';
import { CheckCircle2, ArrowDownUp, ChevronDown, ArrowUpDown, Check } from 'lucide-react';

export default function Filters({
    statusFilter = "",
    sortBy = "created_at",
    sortOrder = "DESC",
    onApply,
    onReset,
    onClose,
}) {
    const [prevProps, setPrevProps] = useState({ statusFilter, sortBy, sortOrder });
    const [status, setStatus] = useState(statusFilter || "");
    const [sortField, setSortField] = useState(sortBy || "created_at");
    const [sortDir, setSortDir] = useState(sortOrder || "DESC");

    // Adjust state during render when props change externally (React official pattern)
    if (
        prevProps.statusFilter !== statusFilter ||
        prevProps.sortBy !== sortBy ||
        prevProps.sortOrder !== sortOrder
    ) {
        setPrevProps({ statusFilter, sortBy, sortOrder });
        setStatus(statusFilter || "");
        setSortField(sortBy || "created_at");
        setSortDir(sortOrder || "DESC");
    }

    const handleStatusChange = (val) => {
        setStatus(val);
        if (onApply) {
            onApply({
                status: val,
                sort_by: sortField,
                sort: sortDir,
            });
        }
    };

    const handleSortFieldChange = (val) => {
        setSortField(val);
        if (onApply) {
            onApply({
                status,
                sort_by: val,
                sort: sortDir,
            });
        }
    };

    const handleSortDirChange = (val) => {
        setSortDir(val);
        if (onApply) {
            onApply({
                status,
                sort_by: sortField,
                sort: val,
            });
        }
    };

    const handleResetAll = () => {
        setStatus("");
        setSortField("created_at");
        setSortDir("DESC");
        if (onReset) {
            onReset();
        }
        if (onClose) {
            onClose();
        }
    };

    const handleApplyAndClose = () => {
        if (onApply) {
            onApply({
                status,
                sort_by: sortField,
                sort: sortDir,
            });
        }
        if (onClose) {
            onClose();
        }
    };

    return (
        <div className="flex flex-col h-full justify-between">
            {/* SELECTS LIST */}
            <div className="space-y-4 flex-1">
                {/* STATUS FILTER */}
                <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        Category Status
                    </label>
                    <div className="relative">
                        <select
                            value={status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className="w-full pl-2.5 pr-8 py-1.5 bg-gray-50 hover:bg-gray-100/50 dark:bg-gray-800/40 dark:hover:bg-gray-800/70 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white text-xs appearance-none shadow-sm cursor-pointer transition-all"
                        >
                            <option value="">All Statuses</option>
                            <option value="true">Active Only</option>
                            <option value="false">Inactive Only</option>
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                    </div>
                </div>

                {/* SORT BY FIELD */}
                <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500" />
                        Sort Field
                    </label>
                    <div className="relative">
                        <select
                            value={sortField}
                            onChange={(e) => handleSortFieldChange(e.target.value)}
                            className="w-full pl-2.5 pr-8 py-1.5 bg-gray-50 hover:bg-gray-100/50 dark:bg-gray-800/40 dark:hover:bg-gray-800/70 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white text-xs appearance-none shadow-sm cursor-pointer transition-all"
                        >
                            <option value="created_at">Creation Date</option>
                            <option value="title">Category Title</option>
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                    </div>
                </div>

                {/* SORT ORDER */}
                <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        <ArrowDownUp className="w-3.5 h-3.5 text-blue-500" />
                        Sort Order
                    </label>
                    <div className="relative">
                        <select
                            value={sortDir}
                            onChange={(e) => handleSortDirChange(e.target.value)}
                            className="w-full pl-2.5 pr-8 py-1.5 bg-gray-50 hover:bg-gray-100/50 dark:bg-gray-800/40 dark:hover:bg-gray-800/70 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white text-xs appearance-none shadow-sm cursor-pointer transition-all"
                        >
                            <option value="DESC">Descending / Newest</option>
                            <option value="ASC">Ascending / Oldest</option>
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* ACTION FOOTER BUTTONS */}
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2.5">
                <button
                    onClick={handleResetAll}
                    type="button"
                    className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm active:scale-[0.98] cursor-pointer"
                >
                    Reset All
                </button>
                <button
                    onClick={handleApplyAndClose}
                    type="button"
                    className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-lg transition shadow-sm active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1"
                >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply</span>
                </button>
            </div>
        </div>
    );
}
