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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in text-left">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-200/90 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shadow-2xs">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                Solar Item Details
              </h3>
              <p className="text-[11px] text-slate-500">
                Detailed specifications and hardware metadata.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-2 text-xs text-blue-600 font-semibold">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Refreshing latest specs...</span>
            </div>
          )}

          {/* Item Main Info */}
          <div className="relative rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 border border-blue-100/80 shadow-2xs flex flex-col gap-2.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200">
                    {currentItem.code}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    <Layers className="w-3 h-3 text-slate-400" />
                    {currentCategory}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {currentItem.title}
                </h2>
              </div>

              {/* Status Badge */}
              <div className="shrink-0">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold shadow-2xs ${
                    currentItem.is_active
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                      : "bg-rose-50 text-rose-800 border border-rose-300"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${currentItem.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  {currentItem.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          {/* Price & Quantity Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 shadow-2xs">
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Selling Price
              </p>
              <p className="text-sm sm:text-base font-extrabold text-blue-600 tabular-nums mt-0.5">
                {formatPrice(currentItem.selling_price ?? currentItem.marked_price)}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 shadow-2xs">
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Marked Price
              </p>
              <p className="text-sm sm:text-base font-semibold text-slate-700 tabular-nums mt-0.5">
                {formatPrice(currentItem.marked_price)}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 shadow-2xs col-span-2 sm:col-span-1">
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                In Stock
              </p>
              <p className="text-sm sm:text-base font-bold text-slate-900 tabular-nums mt-0.5">
                {currentItem.quantity ?? 0} units
              </p>
            </div>
          </div>

          {/* Warranty Guarantee & Details */}
          {(currentItem.warranty_period || currentItem.warranty_details) && (
            <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200/80 space-y-1.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                    Warranty Guarantee
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-emerald-900">
                    {currentItem.warranty_period || "Standard Coverage"}
                  </p>
                </div>
              </div>
              {currentItem.warranty_details && (
                <p className="text-xs text-emerald-900/90 pt-1.5 border-t border-emerald-200/60 leading-relaxed">
                  {currentItem.warranty_details}
                </p>
              )}
            </div>
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Description
            </h4>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap min-h-[60px]">
              {currentItem.description || (
                <span className="italic text-slate-400">
                  No description provided for this solar item.
                </span>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
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
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition shadow-2xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
