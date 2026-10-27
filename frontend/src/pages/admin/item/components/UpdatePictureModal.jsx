import React, { useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { UploadCloud, X, Loader2, Image as ImageIcon, Check } from "lucide-react";
import { axiosInstance } from "../../../../lib/axiosInstance";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function UpdatePictureModal({
  isOpen,
  onClose,
  item,
  onItemUpdated,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen || !item) return null;

  const handleResetAndClose = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setLoading(false);
    onClose();
  };

  const validateAndSelectFile = (file) => {
    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      toast.error("Invalid file format. Please upload JPEG, PNG, WEBP, or GIF");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size exceeds 10MB limit");
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    validateAndSelectFile(file);
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
    validateAndSelectFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error("Please select an image file to upload");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("picture", selectedFile);

      const response = await axiosInstance.put(
        `/items/${item.id}/update/picture`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Fetch the full updated item with picture and category relations joined
      let freshItem = response.data?.data || response.data;
      try {
        const detailRes = await axiosInstance.get(`/items/${item.id}`);
        const fetched = detailRes.data?.data || detailRes.data;
        if (fetched) {
          freshItem = fetched;
        }
      } catch (fetchErr) {
        console.error("Failed to fetch fresh item details after picture update", fetchErr);
      }

      toast.success("Item picture updated successfully");
      if (onItemUpdated) {
        onItemUpdated(freshItem);
      }
      handleResetAndClose();
    } catch (error) {
      const msg = error.response?.data?.message;
      toast.error(
        Array.isArray(msg)
          ? msg.join(", ")
          : msg || error.message || "Failed to update item picture"
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
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                Update Item Picture
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Upload new catalog photo for {item.title}.
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
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          {/* Current / New Preview */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              {previewUrl ? "New Picture Preview" : "Current Picture"}
            </label>
            <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 aspect-video flex items-center justify-center">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="New Preview"
                  className="w-full h-full object-contain p-2"
                />
              ) : item.picture?.url ? (
                <img
                  src={item.picture.url}
                  alt={item.title}
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <div className="flex flex-col items-center gap-1 text-gray-400">
                  <ImageIcon className="w-8 h-8 stroke-1" />
                  <span className="text-xs">No picture currently</span>
                </div>
              )}
            </div>
          </div>

          {/* Upload Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1.5 ${
              isDragging
                ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20"
                : "border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-gray-50/50 dark:bg-gray-800/30"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              className="hidden"
            />
            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                Click to browse
              </span>{" "}
              or drag & drop
            </div>
            <p className="text-[10px] text-gray-400">
              PNG, JPG, WEBP, or GIF (max 10MB)
            </p>
            {selectedFile && (
              <span className="mt-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" />
                {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={handleResetAndClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedFile}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              <span>Upload Picture</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
