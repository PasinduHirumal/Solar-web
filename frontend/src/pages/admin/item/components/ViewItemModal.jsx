import React, { useState, useEffect } from "react";
import { X, Package, Layers, ShieldCheck, ShieldAlert, Loader2, Calendar } from "lucide-react";
import { formatPrice } from "../../../../lib/formatPrice";
import { axiosInstance } from "../../../../lib/axiosInstance";

export default function ViewItemModal({ isOpen, onClose, item, categoryName }) {
  const [fetchedDetails, setFetchedDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !item?.id) return;

    let active = true;

    // Fetch full details with joined category from backend
    const fetchItemDetails = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/items/${item.id}`);
        if (active) {
          const fetched = res.data?.data || res.data;
          if (fetched) {
            setFetchedDetails(fetched);
          }
        }
      } catch (err) {
        console.error("Failed to load item full details", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchItemDetails();

    return () => {
      active = false;
    };
  }, [isOpen, item?.id]);

  if (!isOpen || !item) return null;

  const currentItem = (fetchedDetails?.id === item.id ? fetchedDetails : null) || item;
  const currentCategory = currentItem.category?.title || categoryName || "Uncategorized";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-left">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white leading-tight">
                Solar Item Details
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Detailed specifications and hardware metadata.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-2 text-xs text-blue-600 dark:text-blue-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Refreshing latest specs...</span>
            </div>
          )}

          {/* Item Main Info */}
          <div className="relative rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/40 dark:from-gray-800/80 dark:via-gray-800/50 dark:to-blue-950/30 border border-blue-100/80 dark:border-gray-800 shadow-xs flex flex-col gap-2.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100/80 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                    {currentItem.code}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-200/70 dark:border-gray-700">
                    <Layers className="w-3 h-3 text-gray-400" />
                    {currentCategory}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-snug">
                  {currentItem.title}
                </h2>
              </div>

              {/* Status Badge */}
              <div className="shrink-0">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold shadow-2xs ${
                    currentItem.is_active
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60"
                      : "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300 border border-red-300 dark:border-red-800/60"
                  }`}
                >
                  {currentItem.is_active ? (
                    <ShieldCheck className="w-3.5 h-3.5" />
                  ) : (
                    <ShieldAlert className="w-3.5 h-3.5" />
                  )}
                  {currentItem.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          {/* Price & Quantity Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
              <p className="text-[10px] uppercase font-semibold text-gray-500 dark:text-gray-400">
                Selling Price
              </p>
              <p className="text-sm sm:text-base font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                {formatPrice(currentItem.selling_price ?? currentItem.marked_price)}
              </p>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
              <p className="text-[10px] uppercase font-semibold text-gray-500 dark:text-gray-400">
                Marked Price
              </p>
              <p className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300 mt-0.5">
                {formatPrice(currentItem.marked_price)}
              </p>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 col-span-2 sm:col-span-1">
              <p className="text-[10px] uppercase font-semibold text-gray-500 dark:text-gray-400">
                In Stock
              </p>
              <p className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200 mt-0.5">
                {currentItem.quantity ?? 0} units
              </p>
            </div>
          </div>

          {/* Warranty Period Display */}
          {currentItem.warranty_period && (
            <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/80 dark:border-emerald-800/40 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-semibold text-emerald-800 dark:text-emerald-300">
                  Warranty Guarantee
                </p>
                <p className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-200">
                  {currentItem.warranty_period}
                </p>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-1">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Description
            </h4>
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap min-h-[60px]">
              {currentItem.description || (
                <span className="italic text-gray-400 dark:text-gray-500">
                  No description provided for this solar item.
                </span>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>Created: {new Date(currentItem.created_at).toLocaleDateString()}</span>
            </div>
            {currentItem.updated_at && (
              <div className="flex items-center gap-1">
                <span>Updated: {new Date(currentItem.updated_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
