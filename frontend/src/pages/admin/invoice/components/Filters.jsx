import React, { useState } from "react";
import {
  CreditCard,
  FileText,
  Calendar,
  Receipt,
  ArrowDownUp,
  ChevronDown,
  Check,
  X,
  AlertCircle,
} from "lucide-react";
import { currencyType } from "../../../../lib/formatPrice";

export default function Filters({
  paymentStatusFilter = "",
  quotationStatusFilter = "",
  startDate = "",
  endDate = "",
  lowestBudget = "",
  maximumBudget = "",
  sortOrder = "DESC",
  onApply,
  onReset,
  onClose,
}) {
  const [prevProps, setPrevProps] = useState({
    paymentStatusFilter,
    quotationStatusFilter,
    startDate,
    endDate,
    lowestBudget,
    maximumBudget,
    sortOrder,
  });

  const [paymentStatus, setPaymentStatus] = useState(paymentStatusFilter || "");
  const [quotationStatus, setQuotationStatus] = useState(quotationStatusFilter || "");
  const [start, setStart] = useState(startDate || "");
  const [end, setEnd] = useState(endDate || "");
  const [lowBudget, setLowBudget] = useState(lowestBudget || "");
  const [maxBudget, setMaxBudget] = useState(maximumBudget || "");
  const [sortDir, setSortDir] = useState(sortOrder || "DESC");
  const [errorMessage, setErrorMessage] = useState("");

  // Adjust state during render when props change externally (React official pattern like ManageUsers)
  if (
    prevProps.paymentStatusFilter !== paymentStatusFilter ||
    prevProps.quotationStatusFilter !== quotationStatusFilter ||
    prevProps.startDate !== startDate ||
    prevProps.endDate !== endDate ||
    prevProps.lowestBudget !== lowestBudget ||
    prevProps.maximumBudget !== maximumBudget ||
    prevProps.sortOrder !== sortOrder
  ) {
    setPrevProps({
      paymentStatusFilter,
      quotationStatusFilter,
      startDate,
      endDate,
      lowestBudget,
      maximumBudget,
      sortOrder,
    });
    setPaymentStatus(paymentStatusFilter || "");
    setQuotationStatus(quotationStatusFilter || "");
    setStart(startDate || "");
    setEnd(endDate || "");
    setLowBudget(lowestBudget || "");
    setMaxBudget(maximumBudget || "");
    setSortDir(sortOrder || "DESC");
    setErrorMessage("");
  }

  const handlePaymentStatusChange = (val) => {
    setPaymentStatus(val);
    setErrorMessage("");
    if (onApply) {
      onApply({
        payment_status: val,
        quotation_status: quotationStatus,
        start_date: start,
        end_date: end,
        lowest_budget: lowBudget,
        maximum_budget: maxBudget,
        sort: sortDir,
      });
    }
  };

  const handleQuotationStatusChange = (val) => {
    setQuotationStatus(val);
    setErrorMessage("");
    if (onApply) {
      onApply({
        payment_status: paymentStatus,
        quotation_status: val,
        start_date: start,
        end_date: end,
        lowest_budget: lowBudget,
        maximum_budget: maxBudget,
        sort: sortDir,
      });
    }
  };

  const handleSortDirChange = (val) => {
    setSortDir(val);
    setErrorMessage("");
    if (onApply) {
      onApply({
        payment_status: paymentStatus,
        quotation_status: quotationStatus,
        start_date: start,
        end_date: end,
        lowest_budget: lowBudget,
        maximum_budget: maxBudget,
        sort: val,
      });
    }
  };

  const handleClearDates = () => {
    setStart("");
    setEnd("");
    setErrorMessage("");
    if (onApply) {
      onApply({
        payment_status: paymentStatus,
        quotation_status: quotationStatus,
        start_date: undefined,
        end_date: undefined,
        lowest_budget: lowBudget,
        maximum_budget: maxBudget,
        sort: sortDir,
      });
    }
  };

  const handleClearBudgets = () => {
    setLowBudget("");
    setMaxBudget("");
    setErrorMessage("");
    if (onApply) {
      onApply({
        payment_status: paymentStatus,
        quotation_status: quotationStatus,
        start_date: start,
        end_date: end,
        lowest_budget: undefined,
        maximum_budget: undefined,
        sort: sortDir,
      });
    }
  };

  const handleResetAll = () => {
    setPaymentStatus("");
    setQuotationStatus("");
    setStart("");
    setEnd("");
    setLowBudget("");
    setMaxBudget("");
    setSortDir("DESC");
    setErrorMessage("");
    if (onReset) onReset();
    if (onClose) onClose();
  };

  const handleApplyAndClose = () => {
    // Validate Date Range if both provided
    if (start && end) {
      if (new Date(end).getTime() <= new Date(start).getTime()) {
        setErrorMessage("To Date must be after From Date.");
        return;
      }
    }

    // Validate Budget Range
    const numLow = lowBudget !== "" ? Number(lowBudget) : null;
    const numMax = maxBudget !== "" ? Number(maxBudget) : null;

    if (numLow !== null && numLow < 0.01) {
      setErrorMessage("Minimum total must be at least 0.01.");
      return;
    }

    if (numLow !== null && numMax !== null && numMax < numLow) {
      setErrorMessage("Maximum total cannot be less than minimum total.");
      return;
    }

    setErrorMessage("");

    if (onApply) {
      onApply({
        payment_status: paymentStatus,
        quotation_status: quotationStatus,
        start_date: start,
        end_date: end,
        lowest_budget: lowBudget,
        maximum_budget: maxBudget,
        sort: sortDir,
      });
    }
    if (onClose) onClose();
  };

  return (
    <div className="flex flex-col h-full justify-between">
      {/* SELECTS LIST */}
      <div className="space-y-4 flex-1">
        {/* PAYMENT STATUS FILTER */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">
            <CreditCard className="w-3.5 h-3.5 text-blue-600" />
            Payment Status
          </label>
          <div className="relative">
            <select
              value={paymentStatus}
              onChange={(e) => handlePaymentStatusChange(e.target.value)}
              className="w-full pl-3.5 pr-8 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none text-slate-900 text-xs appearance-none shadow-2xs cursor-pointer transition-all font-semibold"
            >
              <option value="">All Payment Statuses</option>
              <option value="PENDING">Pending Payment</option>
              <option value="ADVANCED">Advance Payment</option>
              <option value="PARTIAL">Partial Payment</option>
              <option value="PAID">Paid in Full</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* QUOTATION STATUS FILTER */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            Quotation Status
          </label>
          <div className="relative">
            <select
              value={quotationStatus}
              onChange={(e) => handleQuotationStatusChange(e.target.value)}
              className="w-full pl-3.5 pr-8 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none text-slate-900 text-xs appearance-none shadow-2xs cursor-pointer transition-all font-semibold"
            >
              <option value="">All Quotation Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* DATE RANGE (CREATED AT) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              Created Date Range
            </label>
            {(start || end) && (
              <button
                type="button"
                onClick={handleClearDates}
                className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer"
                title="Clear dates"
              >
                <X size={12} />
                <span>Clear</span>
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="block text-[10px] text-slate-400 mb-1">From Date</span>
              <input
                type="date"
                value={start}
                onChange={(e) => {
                  setStart(e.target.value);
                  setErrorMessage("");
                }}
                className="w-full px-3 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none text-slate-900 text-xs shadow-2xs transition-all font-medium cursor-pointer"
              />
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 mb-1">To Date</span>
              <input
                type="date"
                value={end}
                min={start || undefined}
                onChange={(e) => {
                  setEnd(e.target.value);
                  setErrorMessage("");
                }}
                className="w-full px-3 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none text-slate-900 text-xs shadow-2xs transition-all font-medium cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* BUDGET RANGE */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">
              <Receipt className="w-3.5 h-3.5 text-amber-600" />
              Invoice Total Range ({currencyType})
            </label>
            {(lowBudget || maxBudget) && (
              <button
                type="button"
                onClick={handleClearBudgets}
                className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer"
                title="Clear total range"
              >
                <X size={12} />
                <span>Clear</span>
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="block text-[10px] text-slate-400 mb-1">Min Total</span>
              <input
                type="number"
                min="0.01"
                step="any"
                placeholder="e.g. 10000"
                value={lowBudget}
                onChange={(e) => {
                  setLowBudget(e.target.value);
                  setErrorMessage("");
                }}
                className="w-full px-3 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none text-slate-900 text-xs shadow-2xs transition-all font-medium"
              />
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 mb-1">Max Total</span>
              <input
                type="number"
                min="0.01"
                step="any"
                placeholder="e.g. 500000"
                value={maxBudget}
                onChange={(e) => {
                  setMaxBudget(e.target.value);
                  setErrorMessage("");
                }}
                className="w-full px-3 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none text-slate-900 text-xs shadow-2xs transition-all font-medium"
              />
            </div>
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

        {/* ERROR MESSAGE */}
        {errorMessage && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}
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
