import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { UserPlus, Mail, Lock, User, Shield, Eye, EyeOff, Check, X, Loader2 } from "lucide-react";
import { axiosInstance } from "../../../../lib/axiosInstance";
import { UserRole } from "../../../../lib/roles";

const validatePasswordRules = (pwd) => ({
  length: pwd.length >= 8 && pwd.length <= 128,
  lower: /[a-z]/.test(pwd),
  upper: /[A-Z]/.test(pwd),
  number: /[0-9]/.test(pwd),
  special: /[^A-Za-z0-9]/.test(pwd),
  noSpace: !/\s/.test(pwd) && pwd.length > 0,
});

export default function RegisterUserModal({ isOpen, onClose, onUserCreated }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: UserRole.USER,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const passwordRules = validatePasswordRules(formData.password);
  const isPasswordValid = Object.values(passwordRules).every(Boolean);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetAndClose = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: UserRole.USER,
    });
    setShowPassword(false);
    setLoading(false);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isPasswordValid) {
      toast.error("Password does not meet complexity requirements");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post("/auth/register", {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
      });

      const message = response.data?.message || "User registered successfully";
      toast.success(message);

      const rawUser = response.data?.result || response.data?.data || response.data?.user || response.data;
      const createdUser = rawUser && typeof rawUser === "object" ? {
        id: rawUser.id,
        name: rawUser.name || formData.name.trim(),
        email: rawUser.email || formData.email.trim().toLowerCase(),
        role: rawUser.role || formData.role,
        is_active: rawUser.is_active !== undefined ? rawUser.is_active : true,
        created_at: rawUser.created_at || new Date().toISOString(),
        ...rawUser,
      } : null;

      if (onUserCreated) {
        onUserCreated(createdUser);
      }
      handleResetAndClose();
    } catch (error) {
      const msg = error.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(", ") : (msg || error.message || "Failed to register user"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in text-left">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                Register New User
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Create a new user, admin, or super admin account.
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
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                minLength={3}
                maxLength={255}
                placeholder="e.g. Alexander Wright"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white text-sm transition"
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="alexander@solar.com"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white text-sm transition"
              />
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Assigned Role <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white text-sm transition appearance-none cursor-pointer"
              >
                <option value={UserRole.USER}>Standard User (Customer)</option>
                <option value={UserRole.ADMIN}>Administrator</option>
                <option value={UserRole.SUPER_ADMIN}>Super Administrator</option>
              </select>
            </div>
            {formData.role !== UserRole.USER && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                Note: Administrative accounts possess elevated privileges.
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Temporary Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white text-sm transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Password Validation Checklist */}
            {formData.password.length > 0 && (
              <div className="pt-2 grid grid-cols-2 gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                <span className={`flex items-center gap-1 ${passwordRules.length ? "text-emerald-600 font-medium" : ""}`}>
                  <Check size={12} className={passwordRules.length ? "opacity-100" : "opacity-30"} /> 8-128 chars
                </span>
                <span className={`flex items-center gap-1 ${passwordRules.upper && passwordRules.lower ? "text-emerald-600 font-medium" : ""}`}>
                  <Check size={12} className={passwordRules.upper && passwordRules.lower ? "opacity-100" : "opacity-30"} /> Upper & lower case
                </span>
                <span className={`flex items-center gap-1 ${passwordRules.number ? "text-emerald-600 font-medium" : ""}`}>
                  <Check size={12} className={passwordRules.number ? "opacity-100" : "opacity-30"} /> At least one number
                </span>
                <span className={`flex items-center gap-1 ${passwordRules.special && passwordRules.noSpace ? "text-emerald-600 font-medium" : ""}`}>
                  <Check size={12} className={passwordRules.special && passwordRules.noSpace ? "opacity-100" : "opacity-30"} /> Symbol, no space
                </span>
              </div>
            )}
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
              disabled={loading || !formData.name.trim() || !formData.email.trim() || !isPasswordValid}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Register User</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
