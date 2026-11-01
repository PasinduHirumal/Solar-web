import React, { useState } from "react";
import { toast } from "react-hot-toast";
import {
  Package,
  X,
  Loader2,
  Layers,
  AlertCircle,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { axiosInstance } from "../../../../lib/axiosInstance";
import { currencyType } from "../../../../lib/formatPrice";

export default function CreateSolarItemModal({
  isOpen,
  onClose,
  categories = [],
  onItemCreated,
}) {
  const [formData, setFormData] = useState({
    title: "",
    category_id: "",
    marked_price: "",
    warranty_period: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetAndClose = () => {
    setFormData({
      title: "",
      category_id: "",
      marked_price: "",
      warranty_period: "",
      description: "",
    });
    setLoading(false);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedTitle = formData.title.trim();
    if (!trimmedTitle || trimmedTitle.length < 3) {
      toast.error("Item title must be at least 3 characters");
      return;
    }
    if (trimmedTitle.length > 255) {
      toast.error("Item title cannot exceed 255 characters");
      return;
    }

    if (!formData.category_id) {
      toast.error("Please select a category for this item");
      return;
    }

    const priceNum = parseFloat(formData.marked_price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error("Please enter a valid positive price");
      return;
    }
    if (priceNum > 1000000) {
      toast.error("Price cannot exceed 1,000,000");
      return;
    }

    const trimmedWarranty = formData.warranty_period.trim();
    if (trimmedWarranty && trimmedWarranty.length < 3) {
      toast.error("Warranty period must be at least 3 characters if provided");
      return;
    }
    if (trimmedWarranty && trimmedWarranty.length > 255) {
      toast.error("Warranty period cannot exceed 255 characters");
      return;
    }

    const trimmedDesc = formData.description.trim();
    if (trimmedDesc && trimmedDesc.length < 3) {
      toast.error("Description must be at least 3 characters if provided");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: trimmedTitle,
        category_id: formData.category_id,
        marked_price: priceNum,
      };

      if (trimmedWarranty) {
        payload.warranty_period = trimmedWarranty;
      }
      if (trimmedDesc) {
        payload.description = trimmedDesc;
      }

      // Backend accepts application/json body
      const response = await axiosInstance.post("/items", payload);

      const message =
        response.data?.message || "Solar item created successfully";
      toast.success(message);

      const created = response.data?.data || response.data;
      let fullCreatedItem = created;
      if (created?.id) {
        try {
          const detailRes = await axiosInstance.get(`/items/${created.id}`);
          const fetched = detailRes.data?.data || detailRes.data;
          if (fetched) {
            fullCreatedItem = fetched;
          }
        } catch (fetchErr) {
          console.error("Failed to fetch fresh item details after create", fetchErr);
        }
      }

      if (onItemCreated) {
        onItemCreated(fullCreatedItem);
      }
      handleResetAndClose();
    } catch (error) {
      const msg = error.response?.data?.message;
      toast.error(
        Array.isArray(msg)
          ? msg.join(", ")
          : msg || error.message || "Failed to create solar item"
      );
    } finally {
      setLoading(false);
    }
  };

  const activeCategories = categories.filter((c) => c.is_active);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-fade-in text-left">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                Create Solar Item
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Add a new hardware product to the inventory catalog.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1"
        >
          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Item Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              required
              minLength={3}
              maxLength={255}
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. 550W Monocrystalline Solar Panel"
              className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Category & Price in two columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Category */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="category_id"
                  required
                  value={formData.category_id}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition appearance-none cursor-pointer"
                >
                  <option value="">Select Category</option>
                  {activeCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.title}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              {activeCategories.length === 0 && (
                <p className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  No active categories found.
                </p>
              )}
            </div>

            {/* Price */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Marked Price <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="1000000"
                  name="marked_price"
                  required
                  value={formData.marked_price}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full pl-9 pr-3.5 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 font-bold text-xs">
                  {currencyType}
                </div>
              </div>
            </div>
          </div>

          {/* Warranty Period */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Warranty Period <span className="text-gray-400 font-normal lowercase">(optional)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="warranty_period"
                minLength={3}
                maxLength={255}
                value={formData.warranty_period}
                onChange={handleChange}
                placeholder="e.g. 5 Years / 10 Years Replacement"
                className="w-full pl-9 pr-3.5 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
            <p className="text-[10px] text-gray-400">
              Manufacturer or shop warranty guarantee (min. 3 characters if provided)
            </p>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-gray-400" />
              Description <span className="text-gray-400 font-normal lowercase">(optional)</span>
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Features, technical specs, installation notes, etc..."
              className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-gray-100 dark:border-gray-800 shrink-0">
            <button
              type="button"
              onClick={handleResetAndClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                loading ||
                !formData.title.trim() ||
                !formData.category_id ||
                !formData.marked_price
              }
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              <span>Create Item</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
