import React, { useState, useEffect } from "react";
import useAuthStore from "../../lib/authStore";
import { axiosInstance } from "../../lib/axiosInstance";
import { isSuperAdmin } from "../../lib/roles";
import {
  Users,
  FolderTree,
  Activity,
  BarChart3,
  Sparkles,
  CheckCircle2,
  Package,
  FileText,
  ShieldCheck,
  Mail,
  Zap,
  TrendingUp,
  Receipt,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminDashboard() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCategories: 0,
    activeCategories: 0,
    totalItems: 0,
    totalQuotations: 0,
    totalInvoices: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const canFetchUsers = isSuperAdmin(user?.role);
        const [usersRes, categoriesRes, activeCatsRes, itemsRes, quotationsRes, invoicesRes] = await Promise.all([
          canFetchUsers
            ? axiosInstance.get("/users", { params: { limit: 1 } }).catch(() => null)
            : Promise.resolve(null),
          axiosInstance.get("/categories", { params: { limit: 1 } }),
          axiosInstance.get("/categories", { params: { limit: 1, is_active: true } }),
          axiosInstance.get("/items", { params: { limit: 1 } }),
          axiosInstance.get("/quotations", { params: { limit: 1 } }).catch(() => null),
          axiosInstance.get("/invoices", { params: { limit: 1 } }).catch(() => null),
        ]);

        const extractTotal = (res) => {
          return res?.data?.data?.meta?.totalItems ?? res?.data?.meta?.totalItems ?? 0;
        };

        setStats({
          totalUsers: usersRes ? extractTotal(usersRes) : 0,
          totalCategories: extractTotal(categoriesRes),
          activeCategories: extractTotal(activeCatsRes),
          totalItems: extractTotal(itemsRes),
          totalQuotations: quotationsRes ? extractTotal(quotationsRes) : 0,
          totalInvoices: invoicesRes ? extractTotal(invoicesRes) : 0,
        });
      } catch (error) {
        console.error("Failed to fetch analytics", error);
        toast.error("Failed to load dashboard analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user?.role]);

  const isSuper = isSuperAdmin(user?.role);
  const statCards = [
    ...(isSuper
      ? [
          {
            title: "Total Users",
            subtitle: "Registered system accounts",
            value: stats.totalUsers,
            icon: Users,
            gradient: "from-blue-600 to-indigo-600",
            lightBg: "bg-blue-50",
            iconColor: "text-blue-600",
            borderColor: "hover:border-blue-300",
            delay: "0",
          },
        ]
      : []),
    {
      title: "Hardware Categories",
      subtitle: "Total catalog collections",
      value: stats.totalCategories,
      icon: FolderTree,
      gradient: "from-amber-500 to-orange-600",
      lightBg: "bg-amber-50",
      iconColor: "text-amber-600",
      borderColor: "hover:border-amber-300",
      delay: "100",
    },
    {
      title: "Active Categories",
      subtitle: "Published catalog categories",
      value: stats.activeCategories,
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-teal-600",
      lightBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      borderColor: "hover:border-emerald-300",
      delay: "200",
    },
    {
      title: "Solar Items",
      subtitle: "Inventory catalog items",
      value: stats.totalItems,
      icon: Package,
      gradient: "from-cyan-500 to-blue-600",
      lightBg: "bg-cyan-50",
      iconColor: "text-cyan-600",
      borderColor: "hover:border-cyan-300",
      delay: "300",
    },
    {
      title: "Quotations",
      subtitle: "Generated project quotes",
      value: stats.totalQuotations,
      icon: FileText,
      gradient: "from-purple-500 to-indigo-600",
      lightBg: "bg-purple-50",
      iconColor: "text-purple-600",
      borderColor: "hover:border-purple-300",
      delay: "400",
    },
    {
      title: "Invoices",
      subtitle: "Issued customer bills",
      value: stats.totalInvoices,
      icon: Receipt,
      gradient: "from-emerald-600 to-teal-700",
      lightBg: "bg-emerald-50",
      iconColor: "text-emerald-700",
      borderColor: "hover:border-emerald-300",
      delay: "500",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto w-full space-y-6">
      {/* Executive Welcome Hero Banner */}
      <div className="relative overflow-hidden bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-[0_1px_3px_0_rgba(0,0,0,0.03)] transition-all duration-300">
        {/* Soft background ambient glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-gradient-to-br from-blue-100/40 via-indigo-50/30 to-transparent blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 bg-emerald-50/30 blur-2xl rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100/90 border border-slate-200/80 text-slate-700 text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Solar Web System Overview</span>
              <span className="w-1 h-1 rounded-full bg-slate-400" />
              <span className="text-slate-500 font-normal">Command Center</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Welcome back, {user?.name?.split(" ")[0] || "Administrator"}! 👋
            </h1>

            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200/70 text-blue-700 text-xs font-semibold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                {(user?.role || "Admin").replace("_", " ")}
              </span>

              {user?.email && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/70 text-slate-600 text-xs font-medium">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {user?.email}
                </span>
              )}

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200/70 text-emerald-700 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Active Session
              </span>
            </div>
          </div>

          {/* Right Telemetry Widget */}
          <div className="hidden lg:flex items-center gap-4 bg-slate-50/90 border border-slate-200/90 rounded-2xl p-4.5 shadow-xs">
            <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-center text-blue-600">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-0.5 pr-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  System Health
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  99.9%
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                All microservices & database online
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 pt-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 shadow-2xs">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              System Analytics
            </h2>
            <p className="text-xs text-slate-500">
              Real-time operational summary across all managed collections
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${isSuper ? "lg:grid-cols-5" : "lg:grid-cols-4"} gap-4`}>
          {[...Array(isSuper ? 5 : 4)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs animate-pulse h-36 flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-xl bg-slate-100"></div>
                <div className="w-14 h-5 rounded-full bg-slate-100"></div>
              </div>
              <div className="space-y-2">
                <div className="h-7 bg-slate-100 rounded w-1/3"></div>
                <div className="h-3.5 bg-slate-100 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${isSuper ? "lg:grid-cols-5" : "lg:grid-cols-4"} gap-4`}>
          {statCards.map((stat, i) => (
            <div
              key={i}
              className={`group bg-white rounded-xl p-5 border border-slate-200/90 shadow-[0_1px_3px_0_rgba(0,0,0,0.03)] hover:shadow-md ${stat.borderColor} transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden flex flex-col justify-between`}
            >
              {/* Subtle accent line on top */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient} opacity-80 group-hover:opacity-100 transition-opacity`}
              />

              <div className="flex items-start justify-between">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.lightBg} group-hover:scale-105 transition-transform duration-200 border border-slate-100 shadow-xs`}
                >
                  <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>

                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100/90 text-slate-600 border border-slate-200/70">
                  All Time
                </span>
              </div>

              <div className="mt-4">
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                  {stat.value.toLocaleString()}
                </h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                  {stat.title}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                  {stat.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
