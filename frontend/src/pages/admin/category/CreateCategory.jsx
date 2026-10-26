import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ArrowLeft, FolderTree, Plus, Loader2, AlertCircle } from "lucide-react";
import { axiosInstance } from "../../../lib/axiosInstance";
import { isAdmin, isSuperAdmin } from "../../../lib/roles";
import useAuthStore from "../../../lib/authStore";

export default function CreateCategory() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

      toast.success(response.data?.message || "Category created successfully");
      navigate("/admin/categories");
    } catch (error) {
      const msg = error.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(", ") : (msg || error.message || "Failed to create category"));
    } finally {
      setLoading(false);
    }
  };

  const canCreate = isAdmin(currentUser?.role) || isSuperAdmin(currentUser?.role);

  if (!canCreate) {
    return (
      <div className="p-6 max-w-lg mx-auto text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-900">Access Restricted</h2>
        <p className="text-gray-500 text-sm mt-1">Only Administrators can create new categories.</p>
        <Link to="/admin/categories" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold">
          Back to Categories
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto w-full animate-fade-in">
      <div className="mb-6">
        <Link
          to="/admin/categories"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-blue-600 transition"
        >
          <ArrowLeft size={16} />
          <span>Back to Manage Categories</span>
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight mt-3">
          Create New Category
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Add a new solar hardware collection or equipment category to the catalog.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Category Title <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FolderTree className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                minLength={3}
                maxLength={255}
                placeholder="e.g. Solar Batteries, Inverters, PV Panels"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white text-sm transition"
              />
            </div>
            <p className="text-[11px] text-gray-400">Title must be between 3 and 255 characters.</p>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Description <span className="text-gray-400 font-normal lowercase">(optional)</span>
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of the equipment and items included in this collection..."
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white text-sm transition resize-none"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
            <Link
              to="/admin/categories"
              className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </Link>
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
