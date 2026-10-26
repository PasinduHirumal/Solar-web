import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { FolderTree, Plus, X, Loader2 } from "lucide-react";
import { axiosInstance } from "../../../../lib/axiosInstance";

export default function CreateCategoryModal({ isOpen, onClose, onCategoryCreated }) {
  const [formData, setFormData] = useState({
    title: "",
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
      description: "",
    });
    setLoading(false);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedTitle = formData.title.trim();
    if (!trimmedTitle || trimmedTitle.length < 3) {
      toast.error("Category title must be at least 3 characters");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post("/categories", {
        title: trimmedTitle,
        description: formData.description.trim() || undefined,
      });

      const message = response.data?.message || "Category created successfully";
      toast.success(message);

      const rawCat = response.data?.data || response.data?.result || response.data;
      const createdCat = rawCat && typeof rawCat === "object" ? {
        id: rawCat.id,
        title: rawCat.title || trimmedTitle,
        description: rawCat.description || formData.description.trim() || undefined,
        is_active: rawCat.is_active !== undefined ? rawCat.is_active : true,
        created_at: rawCat.created_at || new Date().toISOString(),
        ...rawCat,
      } : null;

      if (onCategoryCreated) {
        onCategoryCreated(createdCat);
      }
      handleResetAndClose();
    } catch (error) {
      const msg = error.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(", ") : (msg || error.message || "Failed to create category"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in text-left">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                Create Category
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Add a new hardware collection to catalog.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          {/* Category Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Category Title <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FolderTree className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                minLength={3}
                maxLength={255}
                placeholder="e.g. Solar Inverters, PV Panels"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white text-sm transition"
              />
            </div>
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
              placeholder="Brief description of the equipment and items..."
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white text-sm transition resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={handleResetAndClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title.trim() || formData.title.trim().length < 3}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create Category</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
