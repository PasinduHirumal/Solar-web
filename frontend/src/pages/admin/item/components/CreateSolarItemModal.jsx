import React, { useState, useRef } from "react";
import { toast } from "react-hot-toast";
import {
  Package,
  Plus,
  X,
  Loader2,
  UploadCloud,
  DollarSign,
  Layers,
  Image as ImageIcon,
  Check,
  AlertCircle,
} from "lucide-react";
import { axiosInstance } from "../../../../lib/axiosInstance";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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
    description: "",
  });
  const [pictureFile, setPictureFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

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
      description: "",
    });
    setPictureFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setLoading(false);
    onClose();
  };

  const validateAndSetFile = (file) => {
    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      toast.error("Invalid image format. Please upload JPG, PNG, WEBP, or GIF");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image file must be under 10MB");
      return;
    }

    setPictureFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    validateAndSetFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    validateAndSetFile(file);
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

    if (!pictureFile) {
      toast.error("Please upload an image for this solar item");
      return;
    }

    const trimmedDesc = formData.description.trim();
    if (trimmedDesc && trimmedDesc.length < 3) {
      toast.error("Description must be at least 3 characters if provided");
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append("title", trimmedTitle);
      data.append("category_id", formData.category_id);
      data.append("marked_price", String(priceNum));
      if (trimmedDesc) {
        data.append("description", trimmedDesc);
      }
      data.append("picture", pictureFile);

      const response = await axiosInstance.post("/items", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

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
          className="p-4 sm:p-5 space-y-3.5 overflow-y-auto custom-scrollbar flex-1"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  className="w-full pl-8 pr-3.5 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 font-bold text-xs">
                  $
                </div>
              </div>
            </div>
          </div>

          {/* Picture Upload Zone */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Product Picture <span className="text-red-500">*</span>
            </label>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-3.5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1.5 ${
                isDragging
                  ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 bg-gray-50/50 dark:bg-gray-800/30"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                className="hidden"
              />

              {previewUrl ? (
                <div className="relative w-full aspect-video max-h-36 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-black/5">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-contain p-1"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition flex items-center justify-center text-white text-xs font-medium">
                    Click or drop to replace image
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <UploadCloud className="w-4 h-4" />
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      Click to upload
                    </span>{" "}
                    or drag & drop
                  </div>
                  <p className="text-[10px] text-gray-400">
                    PNG, JPG, WEBP, or GIF (max 10MB)
                  </p>
                </>
              )}

              {pictureFile && (
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  {pictureFile.name} ({(pictureFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              )}
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
              placeholder="Features, technical specs, warranty notes, etc..."
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
                !formData.marked_price ||
                !pictureFile
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
