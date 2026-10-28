import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, FolderTree, Package, Menu, X, LogOut, Home, Sun } from "lucide-react";
import useAuthStore from "../lib/authStore";
import { confirmAction } from "../lib/confirmAction";
import { isSuperAdmin } from "../lib/roles";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    const isConfirmed = await confirmAction({
      title: "Logout?",
      text: "Are you sure you want to log out?",
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
  ];

  return (
    <div className="min-h-screen h-screen bg-slate-50 flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-56 bg-white border-r border-slate-200 transform transition-transform duration-300 md:relative md:translate-x-0 flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-13 px-3.5 border-b border-slate-200">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg text-white shadow-sm">
              <Sun size={18} className="text-amber-300" />
            </div>
            <span className="text-base font-bold text-slate-900 tracking-tight">
              Solar<span className="text-blue-600">Admin</span>
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar min-h-0">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path || location.pathname.startsWith(`${link.path}/`);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-200">
          <div className="flex items-center gap-2.5 mb-3 px-1">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0 shadow-inner">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-semibold text-slate-900 truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors mb-1"
          >
            <Home size={15} />
            <span>Back to Site</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-13 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center px-4 sticky top-0 z-30 shrink-0 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg mr-3 cursor-pointer"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-sm font-semibold text-slate-900 truncate flex-1">
            {navLinks.find((link) => location.pathname.startsWith(link.path))?.name || "Admin Panel"}
          </h1>
        </header>

        <div className="flex-1 p-3.5 md:p-5 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
