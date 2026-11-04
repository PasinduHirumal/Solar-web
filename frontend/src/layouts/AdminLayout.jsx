import { useState, useMemo } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FolderTree,
  Package,
  FileText,
  Receipt,
  Menu,
  X,
  LogOut,
  Home,
  Shield,
  Activity,
  Calendar,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import useAuthStore from "../lib/authStore";
import { confirmAction } from "../lib/confirmAction";
import { isSuperAdmin } from "../lib/roles";
import fullLogo from "../assets/logo/full_logo.png";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    const isConfirmed = await confirmAction({
      title: "Logout?",
      text: "Are you sure you want to log out of the admin panel?",
      confirmButtonText: "Yes, logout",
    });
    if (isConfirmed) {
      await logout();
    }
  };

  const navLinks = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={18} /> },
    ...(isSuperAdmin(user?.role)
      ? [{ name: "Manage Users", path: "/admin/users", icon: <Users size={18} /> }]
      : []),
    { name: "Manage Categories", path: "/admin/categories", icon: <FolderTree size={18} /> },
    { name: "Manage Solar Items", path: "/admin/items", icon: <Package size={18} /> },
    { name: "Manage Quotations", path: "/admin/quotations", icon: <FileText size={18} /> },
    { name: "Manage Invoices", path: "/admin/invoices", icon: <Receipt size={18} /> },
  ];

  const currentPage = useMemo(() => {
    return navLinks.find((link) => location.pathname.startsWith(link.path))?.name || "Admin Panel";
  }, [location.pathname, navLinks]);

  const formattedDate = useMemo(() => {
    try {
      return new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }).format(new Date());
    } catch {
      return "";
    }
  }, []);

  return (
    <div className="min-h-screen h-screen bg-[#F8FAFC] flex overflow-hidden font-sans antialiased selection:bg-blue-600 selection:text-white text-slate-800">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/90 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] transform transition-transform duration-300 md:relative md:translate-x-0 flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200/80 bg-white">
          <Link to="/admin/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center p-1 group-hover:scale-105 transition-transform duration-200">
              <img src={fullLogo} alt="Shree Energy" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold text-slate-900 tracking-tight leading-none">
                Shree<span className="text-blue-600">Admin</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-600 tracking-wider uppercase mt-0.5">
                Management System
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto custom-scrollbar min-h-0">
          <div>
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-600">
              Main Menu
            </p>
            <nav className="space-y-1">
              {navLinks.map((link) => {
                const isActive =
                  location.pathname === link.path || location.pathname.startsWith(`${link.path}/`);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-semibold"
                        : "text-slate-600 hover:bg-slate-100/90 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`transition-colors ${
                          isActive ? "text-white" : "text-slate-500 group-hover:text-blue-600"
                        }`}
                      >
                        {link.icon}
                      </span>
                      <span>{link.name}</span>
                    </div>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User Profile & System Actions Footer */}
        <div className="p-3 border-t border-slate-200/80 bg-slate-50/50">
          <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-xs mb-2">
            <div className="flex items-center gap-2.5">
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                  {user?.name?.charAt(0)?.toUpperCase() || "A"}
                </div>
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"
                  title="Online"
                />
              </div>
              <div className="flex-1 overflow-hidden min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate leading-tight">
                  {user?.name || "System Admin"}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200/60 uppercase tracking-wider truncate">
                    {(user?.role || "Admin").replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <Link
              to="/"
              className="flex items-center justify-center gap-1.5 px-2.5 py-2 text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all shadow-none hover:shadow-xs"
              title="Return to Public Website"
            >
              <Home size={13} className="text-slate-400" />
              <span>Back to Site</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 px-2.5 py-2 text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200/60 transition-all cursor-pointer"
              title="Log out of session"
            >
              <LogOut size={13} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Executive Desktop & Mobile Top Bar */}
        <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>

            {/* Breadcrumb / Page Title */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600 hidden sm:inline">System</span>
              <ChevronRight size={14} className="text-slate-300 hidden sm:inline" />
              <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                {currentPage}
              </h1>
            </div>
          </div>

          {/* Right Header Status Bar */}
          <div className="flex items-center gap-2.5">
            {/* System Status Pill */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-700 text-xs font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="hidden sm:inline">System Active</span>
            </div>

            {/* Live Date Pill */}
            {formattedDate && (
              <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/70 text-slate-600 text-xs font-medium">
                <Calendar size={13} className="text-slate-600" />
                <span>{formattedDate}</span>
              </div>
            )}
          </div>
        </header>

        {/* Page Content Body */}
        <div className="flex-1 p-4 sm:p-6 lg:p-7 overflow-y-auto custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
