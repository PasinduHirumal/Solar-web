import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ArrowLeft, UserPlus, Mail, Lock, User, Shield, Eye, EyeOff, Check, AlertCircle, Loader2 } from "lucide-react";
import { axiosInstance } from "../../../lib/axiosInstance";
import { UserRole, isSuperAdmin } from "../../../lib/roles";
import useAuthStore from "../../../lib/authStore";

const validatePasswordRules = (pwd) => ({
  length: pwd.length >= 8 && pwd.length <= 128,
  lower: /[a-z]/.test(pwd),
  upper: /[A-Z]/.test(pwd),
  number: /[0-9]/.test(pwd),
  special: /[^A-Za-z0-9]/.test(pwd),
  noSpace: !/\s/.test(pwd) && pwd.length > 0,
});

export default function CreateUser() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: UserRole.USER,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordRules = validatePasswordRules(formData.password);
  const isPasswordValid = Object.values(passwordRules).every(Boolean);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isPasswordValid) {
      toast.error("Password does not meet the complexity requirements");
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

      toast.success(response.data?.message || "User registered successfully");
      navigate("/admin/users");
    } catch (error) {
      const msg = error.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(", ") : (msg || error.message || "Failed to create user"));
    } finally {
      setLoading(false);
    }
  };

  if (!isSuperAdmin(currentUser?.role)) {
    return (
      <div className="p-6 max-w-lg mx-auto text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-900">Access Restricted</h2>
        <p className="text-gray-500 text-sm mt-1">Only Super Admins can register new users to the system.</p>
        <Link to="/admin/users" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold">
          Back to Users
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto w-full animate-fade-in">
      <div className="mb-6">
        <Link
          to="/admin/users"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-blue-600 transition"
        >
          <ArrowLeft size={16} />
          <span>Back to Manage Users</span>
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight mt-3">
          Register New User
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Create a new user, admin, or super admin account in the system.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                minLength={3}
                maxLength={255}
                placeholder="e.g. John Doe"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white text-sm transition"
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="e.g. user@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white text-sm transition"
              />
            </div>
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Assigned Role <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white text-sm transition appearance-none cursor-pointer"
              >
                <option value={UserRole.USER}>Standard User</option>
                <option value={UserRole.ADMIN}>Administrator</option>
                <option value={UserRole.SUPER_ADMIN}>Super Administrator</option>
              </select>
            </div>
            <p className="text-[11px] text-gray-400">
              {formData.role !== UserRole.USER && "Note: Admin roles will be flagged to change their password on first login by default."}
            </p>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Initial Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white text-sm transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Validation Rules Indicator */}
            {formData.password.length > 0 && (
              <div className="mt-2 text-xs space-y-1 bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-1.5">
                  {passwordRules.length ? <Check size={14} className="text-emerald-500" /> : <AlertCircle size={14} className="text-gray-400" />}
                  <span>Between 8 and 128 characters</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {passwordRules.upper && passwordRules.lower ? <Check size={14} className="text-emerald-500" /> : <AlertCircle size={14} className="text-gray-400" />}
                  <span>At least one uppercase and one lowercase letter</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {passwordRules.number && passwordRules.special ? <Check size={14} className="text-emerald-500" /> : <AlertCircle size={14} className="text-gray-400" />}
                  <span>At least one number and one special character (!@#$%^&*...)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {passwordRules.noSpace ? <Check size={14} className="text-emerald-500" /> : <AlertCircle size={14} className="text-gray-400" />}
                  <span>Must not contain any spaces</span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
            <Link
              to="/admin/users"
              className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !isPasswordValid || !formData.name || !formData.email}
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
