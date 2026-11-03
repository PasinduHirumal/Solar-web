import React, { useState } from "react";
import {
  CheckCircle2, FolderTree, ArrowUpDown, ArrowDownUp, ChevronDown, Check,
} from "lucide-react";

export default function Filters({
  statusFilter = "",
  categoryFilter = "",
  sortBy = "created_at",
  sortOrder = "DESC",
  categories = [],
  onApply,
  onReset,
  onClose,
}) {
  const [prevProps, setPrevProps] = useState({
    statusFilter,
    categoryFilter,
    sortBy,
    sortOrder,
  });

  const [status, setStatus] = useState(statusFilter || "");
  const [category, setCategory] = useState(categoryFilter || "");
  const [sortField, setSortField] = useState(sortBy || "created_at");
  const [sortDir, setSortDir] = useState(sortOrder || "DESC");

  // Adjust state during render when props change externally (React official pattern)
  if (
    prevProps.statusFilter !== statusFilter ||
    prevProps.categoryFilter !== categoryFilter ||
    prevProps.sortBy !== sortBy ||
    prevProps.sortOrder !== sortOrder
  ) {
    setPrevProps({
      statusFilter,
      categoryFilter,
      sortBy,
      sortOrder,
    });
    setStatus(statusFilter || "");
    setCategory(categoryFilter || "");
    setSortField(sortBy || "created_at");
    setSortDir(sortOrder || "DESC");
  }

  const handleCategoryChange = (val) => {
    setCategory(val);
    if (onApply) {
      onApply({
        category: val,
        status,
        sort_by: sortField,
        sort: sortDir,
      });
    }
  };

  const handleStatusChange = (val) => {
    setStatus(val);
    if (onApply) {
      onApply({
        category,
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
        category,
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
        category,
        status,
        sort_by: sortField,
        sort: val,
      });
    }
  };

  const handleResetAll = () => {
    setCategory("");
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
        category,
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
        {/* CATEGORY FILTER */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">
            <FolderTree className="w-3.5 h-3.5 text-blue-600" />
            Hardware Category
          </label>
          <div className="relative">
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full pl-3.5 pr-8 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none text-slate-900 text-xs appearance-none shadow-2xs cursor-pointer transition-all font-semibold"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.title}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* STATUS FILTER */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Item Status
          </label>
          <div className="relative">
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full pl-3.5 pr-8 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none text-slate-900 text-xs appearance-none shadow-2xs cursor-pointer transition-all"
            >
              <option value="">All Statuses</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* SORT FIELD */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">
            <ArrowUpDown className="w-3.5 h-3.5 text-indigo-600" />
            Sort Field
          </label>
          <div className="relative">
            <select
              value={sortField}
              onChange={(e) => handleSortFieldChange(e.target.value)}
              className="w-full pl-3.5 pr-8 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none text-slate-900 text-xs appearance-none shadow-2xs cursor-pointer transition-all"
            >
              <option value="created_at">Creation Date</option>
              <option value="selling_price">Selling Price</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* SORT ORDER */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">
            <ArrowDownUp className="w-3.5 h-3.5 text-blue-600" />
            Sort Order
          </label>
          <div className="relative">
            <select
              value={sortDir}
              onChange={(e) => handleSortDirChange(e.target.value)}
              className="w-full pl-3.5 pr-8 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none text-slate-900 text-xs appearance-none shadow-2xs cursor-pointer transition-all"
            >
              <option value="DESC">Descending / Newest</option>
              <option value="ASC">Ascending / Oldest</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ACTION FOOTER BUTTONS */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2.5">
        <button
          onClick={handleResetAll}
          type="button"
          className="flex-1 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition shadow-2xs cursor-pointer"
        >
          Reset All
        </button>
        <button
          onClick={handleApplyAndClose}
          type="button"
          className="flex-1 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Apply</span>
        </button>
      </div>
    </div>
  );
}
