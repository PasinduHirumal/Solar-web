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
    role: UserRole.ADMIN,
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
      role: UserRole.ADMIN,
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
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                Register New User
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Create a new user, admin, or super admin account.
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
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 overflow-y-auto custom-scrollbar flex-1">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 pointer-events-none" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                minLength={3}
                maxLength={255}
                placeholder="e.g. Alexander Wright"
                className="w-full pl-9 pr-3 py-1.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white text-xs transition"
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 pointer-events-none" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="alexander@company.com"
                className="w-full pl-9 pr-3 py-1.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white text-xs transition"
              />
            </div>
          </div>

          {/* User Role */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Assigned Role <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 pointer-events-none" />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full pl-9 pr-3 py-1.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white text-xs transition appearance-none cursor-pointer"
              >
                <option value={UserRole.ADMIN}>Admin</option>
                <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
              </select>
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Initial Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full pl-9 pr-9 py-1.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white text-xs transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            {/* Password Validation Checklist */}
            {formData.password.length > 0 && (
              <div className="pt-1.5 grid grid-cols-2 gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                <span className={`flex items-center gap-1 ${passwordRules.length ? "text-emerald-600 font-medium" : ""}`}>
                  <Check size={11} className={passwordRules.length ? "opacity-100" : "opacity-30"} /> 8-128 chars
                </span>
                <span className={`flex items-center gap-1 ${passwordRules.upper && passwordRules.lower ? "text-emerald-600 font-medium" : ""}`}>
                  <Check size={11} className={passwordRules.upper && passwordRules.lower ? "opacity-100" : "opacity-30"} /> Upper & lower case
                </span>
                <span className={`flex items-center gap-1 ${passwordRules.number ? "text-emerald-600 font-medium" : ""}`}>
                  <Check size={11} className={passwordRules.number ? "opacity-100" : "opacity-30"} /> At least one number
                </span>
                <span className={`flex items-center gap-1 ${passwordRules.special && passwordRules.noSpace ? "text-emerald-600 font-medium" : ""}`}>
                  <Check size={11} className={passwordRules.special && passwordRules.noSpace ? "opacity-100" : "opacity-30"} /> Symbol, no space
                </span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={handleResetAndClose}
              className="px-3.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim() || !formData.email.trim() || !isPasswordValid}
              className="flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
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
