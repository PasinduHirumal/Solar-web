import React, { useState, useEffect } from "react";
import useAuthStore from "../../lib/authStore";
import { axiosInstance } from "../../lib/axiosInstance";
import {
  Users, FolderTree, Activity, BarChart3, Sparkles, CheckCircle2
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminDashboard() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCategories: 0,
    activeCategories: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, categoriesRes, activeCatsRes] = await Promise.all([
          axiosInstance.get("/users", { params: { limit: 1 } }),
          axiosInstance.get("/categories", { params: { limit: 1 } }),
          axiosInstance.get("/categories", { params: { limit: 1, is_active: true } }),
        ]);

        const extractTotal = (res) => {
          return res?.data?.data?.meta?.totalItems ?? res?.data?.meta?.totalItems ?? 0;
        };

        setStats({
          totalUsers: extractTotal(usersRes),
          totalCategories: extractTotal(categoriesRes),
          activeCategories: extractTotal(activeCatsRes),
        });
      } catch (error) {
        console.error("Failed to fetch analytics", error);
        toast.error("Failed to load dashboard analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      gradient: "from-blue-500 to-indigo-600",
      lightBg: "bg-blue-50",
      darkBg: "",
      iconColor: "text-blue-600",
      delay: "0",
    },
    {
      title: "Hardware Categories",
      value: stats.totalCategories,
      icon: FolderTree,
      gradient: "from-amber-500 to-orange-600",
      lightBg: "bg-amber-50",
      darkBg: "",
      iconColor: "text-amber-600",
      delay: "100",
    },
    {
      title: "Active Categories",
      value: stats.activeCategories,
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-teal-600",
      lightBg: "bg-emerald-50",
      darkBg: "",
      iconColor: "text-emerald-600",
      delay: "200",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto w-full animate-fade-in space-y-5">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-white rounded-2xl p-5 md:p-6 shadow-md border border-slate-200 transition-colors duration-300">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-blue-100/50 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-indigo-100/50 blur-2xl rounded-full pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium mb-2.5 backdrop-blur-sm transition-colors duration-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Solar Web System Overview</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-1 tracking-tight transition-colors duration-300">
              Welcome back, {user?.name?.split(' ')[0] || 'Admin'}! 👋
            </h1>
            <p className="text-xs text-slate-500">
              Role: <span className="font-semibold text-slate-700">{(user?.role || '').replace('_', ' ')}</span> • Email: <span className="text-slate-700">{user?.email}</span>
            </p>
          </div>
          <div className="hidden md:flex p-3 bg-slate-50 rounded-xl border border-slate-100 backdrop-blur-sm shadow-inner relative group cursor-default transition-colors duration-300">
            <Activity className="w-10 h-10 text-blue-600 opacity-80 group-hover:scale-110 group-hover:text-blue-500 transition-all duration-500" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* Analytics Header */}
      <div className="flex items-center gap-2.5 px-1">
        <div className="p-1.5 bg-blue-100 rounded-md shadow-inner">
          <BarChart3 className="w-4 h-4 text-blue-600" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">System Analytics</h2>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm animate-pulse h-32">
              <div className="flex justify-between items-start">
                <div className="space-y-3 w-full">
                  <div className="w-10 h-10 rounded-xl bg-slate-200"></div>
                  <div className="h-3.5 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((stat, i) => (
            <div
              key={i}
              className="group bg-white rounded-2xl p-4.5 md:p-5 border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden cursor-default"
              style={{ animationDelay: `${stat.delay}ms` }}
            >
              <div className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${stat.gradient} opacity-10 group-hover:opacity-20 blur-2xl rounded-full transition-opacity duration-300 pointer-events-none`}></div>

              <div className="flex justify-between items-start relative z-10">
                <div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.lightBg} ${stat.darkBg} group-hover:scale-105 transition-transform duration-300 shadow-inner`}>
                    <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                  <p className="text-slate-500 font-medium text-xs mb-1">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {stat.value.toLocaleString()}
                  </h3>
                </div>

                <div className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200`}>
                  All Time
                </div>
              </div>

              <div className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${stat.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
