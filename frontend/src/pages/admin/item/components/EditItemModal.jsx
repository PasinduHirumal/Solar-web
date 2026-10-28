import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { Package, X, Loader2, Layers, AlertCircle } from "lucide-react";
import { axiosInstance } from "../../../../lib/axiosInstance";

export default function EditItemModal({
  isOpen,
  onClose,
  item,
  categories = [],
  onItemUpdated,
}) {
  const [prevItem, setPrevItem] = useState(item);
  const [formData, setFormData] = useState({
    title: item?.title || "",
    category_id: item?.category_id || item?.category?.id || "",
    description: item?.description || "",
  });
  const [loading, setLoading] = useState(false);

  // Sync state during render if target item changed (React recommended pattern)
  if (prevItem?.id !== item?.id) {
    setPrevItem(item);
    setFormData({
      title: item?.title || "",
      category_id: item?.category_id || item?.category?.id || "",
      description: item?.description || "",
    });
  }

  if (!isOpen || !item) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      toast.error("Please select a category");
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
      };

      if (trimmedDesc) {
        payload.description = trimmedDesc;
      }

      const response = await axiosInstance.put(
        `/items/${item.id}/update/data`,
        payload
      );
      let updated = response.data?.data || response.data;
      try {
        const detailRes = await axiosInstance.get(`/items/${item.id}`);
        const fetched = detailRes.data?.data || detailRes.data;
        if (fetched) {
          updated = fetched;
        }
      } catch (fetchErr) {
        console.error("Failed to fetch fresh item details after edit", fetchErr);
      }

      toast.success("Solar item updated successfully");
      if (onItemUpdated) {
        onItemUpdated(updated);
      }
      onClose();
    } catch (error) {
      const msg = error.response?.data?.message;
      toast.error(
        Array.isArray(msg)
          ? msg.join(", ")
          : msg || error.message || "Failed to update solar item"
      );
    } finally {
      setLoading(false);
    }
  };

  const activeCategories = categories.filter((c) => c.is_active);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-fade-in text-left">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                Edit Solar Item
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Update item title, category, or specifications.
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
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-5 space-y-3.5 overflow-y-auto custom-scrollbar flex-1"
        >
          {/* Item Code Display */}
          <div className="p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
              Item Code:
            </span>
            <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
              {item.code}
            </span>
          </div>

          {/* Item Title */}
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

          {/* Category Dropdown */}
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
                <option value="">Select a category</option>
                {activeCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.title}
                  </option>
                ))}
                {/* Include current category if it was inactive */}
                {!activeCategories.some((c) => c.id === formData.category_id) &&
                  formData.category_id && (
                    <option value={formData.category_id}>
                      {item.category?.title || "Current Category"} (Inactive)
                    </option>
                  )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            {activeCategories.length === 0 && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                No active categories found. Please activate one first.
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Description <span className="text-gray-400 font-normal lowercase">(optional)</span>
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Technical specs, warranty, or feature description..."
              className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
            />
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
              disabled={loading || !formData.title.trim() || !formData.category_id}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
