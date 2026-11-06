import React, { useState } from "react";
import { Check, ArrowDownUp, ChevronDown, FileText } from "lucide-react";

export default function Filters({
  statusFilter = "",
  sortOrder = "DESC",
  onApply,
  onReset,
  onClose,
}) {
  const [prevProps, setPrevProps] = useState({ statusFilter, sortOrder });
  const [status, setStatus] = useState(statusFilter || "");
  const [sortDir, setSortDir] = useState(sortOrder || "DESC");

  // Adjust state during render when props change externally (React official pattern like ManageUsers)
  if (
    prevProps.statusFilter !== statusFilter ||
    prevProps.sortOrder !== sortOrder
  ) {
    setPrevProps({ statusFilter, sortOrder });
    setStatus(statusFilter || "");
    setSortDir(sortOrder || "DESC");
  }

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
    <div className="flex flex-col h-full justify-between">
      {/* SELECTS LIST */}
      <div className="space-y-4 flex-1">
        {/* QUOTATION STATUS FILTER */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            Quotation Status
          </label>
          <div className="relative">
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full pl-3.5 pr-8 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none text-slate-900 text-xs appearance-none shadow-2xs cursor-pointer transition-all font-semibold"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
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
              className="w-full pl-3.5 pr-8 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none text-slate-900 text-xs appearance-none shadow-2xs cursor-pointer transition-all font-semibold"
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
