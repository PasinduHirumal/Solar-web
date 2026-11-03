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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in text-left">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200/90 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shadow-2xs">
              <FolderTree className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                Create Category
              </h3>
              <p className="text-[11px] text-slate-500">
                Add a new hardware collection to catalog.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          {/* Category Title */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Category Title <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <FolderTree className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                minLength={3}
                maxLength={255}
                placeholder="e.g. Solar Inverters, PV Panels"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none text-slate-900 placeholder:text-slate-400 text-xs transition"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Description <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of the equipment and items..."
              className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none text-slate-900 placeholder:text-slate-400 text-xs transition resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={handleResetAndClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold text-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title.trim() || formData.title.trim().length < 3}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-sm shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
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
