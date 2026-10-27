import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { DollarSign, X, Loader2 } from "lucide-react";
import { axiosInstance } from "../../../../lib/axiosInstance";
import { formatPrice, currencyType } from "../../../../lib/formatPrice";

export default function UpdatePriceModal({
  isOpen,
  onClose,
  item,
  onItemUpdated,
}) {
  const [prevItem, setPrevItem] = useState(item);
  const [price, setPrice] = useState(
    item?.selling_price !== undefined
      ? String(item.selling_price)
      : item?.marked_price !== undefined
      ? String(item.marked_price)
      : ""
  );
  const [loading, setLoading] = useState(false);

  // Sync state during render if target item changed (React recommended pattern)
  if (prevItem?.id !== item?.id) {
    setPrevItem(item);
    setPrice(
      item?.selling_price !== undefined
        ? String(item.selling_price)
        : item?.marked_price !== undefined
        ? String(item.marked_price)
        : ""
    );
  }

  if (!isOpen || !item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice < 0.01) {
      toast.error("Price must be at least 0.01");
      return;
    }
    if (numericPrice > 1000000) {
      toast.error("Price cannot exceed 1,000,000");
      return;
    }

    // Check decimal precision (at most 2 decimal places)
    const priceStr = String(numericPrice);
    if (priceStr.includes(".") && priceStr.split(".")[1].length > 2) {
      toast.error("Price cannot have more than 2 decimal places");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.put(
        `/items/${item.id}/update/price`,
        { price: numericPrice }
      );
      let updated = response.data?.data || response.data;
      try {
        const detailRes = await axiosInstance.get(`/items/${item.id}`);
        const fetched = detailRes.data?.data || detailRes.data;
        if (fetched) {
          updated = fetched;
        }
      } catch (fetchErr) {
        console.error("Failed to fetch fresh item details after price update", fetchErr);
      }

      toast.success("Item price updated successfully");
      if (onItemUpdated) {
        onItemUpdated(updated);
      }
      onClose();
    } catch (error) {
      const msg = error.response?.data?.message;
      toast.error(
        Array.isArray(msg)
          ? msg.join(", ")
          : msg || error.message || "Failed to update item price"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-fade-in text-left">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-sm w-full border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                Update Item Price
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Super Admin price adjustment.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5">
          {/* Item Preview */}
          <div className="p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Product: <span className="font-semibold text-gray-900 dark:text-white">{item.title}</span>
            </p>
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-gray-500">Current Selling Price:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {formatPrice(item.selling_price ?? item.marked_price)}
              </span>
            </div>
          </div>

          {/* New Price Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              New Price <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="1000000"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 font-bold text-xs">
                {currencyType}
              </div>
            </div>
            <p className="text-[11px] text-gray-400">
              Between $0.01 and $1,000,000.00 (sets both marked & selling prices)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !price || parseFloat(price) <= 0}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              <span>Update Price</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
