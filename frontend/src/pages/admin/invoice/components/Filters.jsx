import React, { useState, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";
import { currencyType } from "../../../../lib/formatPrice";

export default function Filters({
  paymentStatusFilter = "",
  sortOrder = "DESC",
  lowestBudget = "",
  maximumBudget = "",
  onApply,
  onReset,
  onClose,
}) {
  const [paymentStatus, setPaymentStatus] = useState(paymentStatusFilter || "");
  const [sortDir, setSortDir] = useState(sortOrder || "DESC");
  const [lowBudget, setLowBudget] = useState(lowestBudget || "");
  const [maxBudget, setMaxBudget] = useState(maximumBudget || "");

  useEffect(() => {
    setPaymentStatus(paymentStatusFilter || "");
    setSortDir(sortOrder || "DESC");
    setLowBudget(lowestBudget || "");
    setMaxBudget(maximumBudget || "");
  }, [paymentStatusFilter, sortOrder, lowestBudget, maximumBudget]);

  const handleApplyAndClose = () => {
    if (onApply) {
      onApply({
        payment_status: paymentStatus || undefined,
        sort: sortDir,
        lowest_budget: lowBudget ? Number(lowBudget) : undefined,
        maximum_budget: maxBudget ? Number(maxBudget) : undefined,
      });
    }
    if (onClose) onClose();
  };

  const handleResetAll = () => {
    setPaymentStatus("");
    setSortDir("DESC");
    setLowBudget("");
    setMaxBudget("");
    if (onReset) onReset();
    if (onClose) onClose();
  };

  return (
    <div className="space-y-4 text-left">
      <div className="space-y-3.5">
        {/* PAYMENT STATUS FILTER */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Payment Status
          </label>
          <div className="relative">
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full pl-3 pr-8 py-2 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900 text-xs appearance-none shadow-2xs cursor-pointer transition-all font-medium"
            >
              <option value="">All Payment Statuses</option>
              <option value="PENDING">Pending Payment</option>
              <option value="ADVANCED">Advance Payment</option>
              <option value="PARTIAL">Partial Payment</option>
              <option value="PAID">Paid in Full</option>
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
              onChange={(e) => setSortDir(e.target.value)}
              className="w-full pl-3 pr-8 py-2 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900 text-xs appearance-none shadow-2xs cursor-pointer transition-all font-medium"
            >
              <option value="DESC">Descending / Newest</option>
              <option value="ASC">Ascending / Oldest</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* BUDGET RANGE */}
        <div className="space-y-1.5 pt-1">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Invoice Total Range ({currencyType})
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <input
                type="number"
                placeholder="Min total"
                value={lowBudget}
                onChange={(e) => setLowBudget(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Max total"
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
              />
            </div>
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
