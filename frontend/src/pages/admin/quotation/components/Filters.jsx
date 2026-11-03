import React, { useState } from "react";
import { Check, ArrowUpDown, ArrowDownUp, ChevronDown } from "lucide-react";

export default function Filters({
  statusFilter = "",
  sortOrder = "DESC",
  onApply,
  onReset,
  onClose,
}) {
  const [status, setStatus] = useState(statusFilter || "");
  const [sortDir, setSortDir] = useState(sortOrder || "DESC");

  const handleStatusChange = (val) => {
    setStatus(val);
    if (onApply) {
      onApply({
        status: val,
        sort: sortDir,
      });
    }
  };

  const handleSortDirChange = (val) => {
    setSortDir(val);
    if (onApply) {
      onApply({
        status,
        sort: val,
      });
    }
  };

  const handleResetAll = () => {
    setStatus("");
    setSortDir("DESC");
    if (onReset) onReset();
    if (onClose) onClose();
  };

  const handleApplyAndClose = () => {
    if (onApply) {
      onApply({
        status,
        sort: sortDir,
      });
    }
    if (onClose) onClose();
  };

  return (
    <div className="space-y-4 text-left">
      <div className="space-y-3.5">
        {/* STATUS FILTER */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Quotation Status
          </label>
          <div className="relative">
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full pl-3 pr-8 py-2 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900 text-xs appearance-none shadow-2xs cursor-pointer transition-all font-medium"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* SORT ORDER */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Sort Order
          </label>
          <div className="relative">
            <select
              value={sortDir}
              onChange={(e) => handleSortDirChange(e.target.value)}
              className="w-full pl-3 pr-8 py-2 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900 text-xs appearance-none shadow-2xs cursor-pointer transition-all font-medium"
            >
              <option value="DESC">Descending / Newest</option>
              <option value="ASC">Ascending / Oldest</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ACTION FOOTER BUTTONS */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
        <button
          onClick={handleResetAll}
          type="button"
          className="flex-1 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition shadow-2xs active:scale-[0.98] cursor-pointer"
        >
          Reset All
        </button>
        <button
          onClick={handleApplyAndClose}
          type="button"
          className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-2xs shadow-blue-500/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Apply</span>
        </button>
      </div>
    </div>
  );
}
