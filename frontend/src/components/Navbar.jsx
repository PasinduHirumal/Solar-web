import { Link, useLocation } from "react-router-dom";
import { BookOpen, Menu, X, LogOut, User, LayoutDashboard, ShoppingBag } from "lucide-react";
import useAuthStore from "../lib/authStore";
import { confirmAction } from "../lib/confirmAction";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { isAdmin, isSuperAdmin } from "../lib/roles";
import UserDropdown from "./UserDropdown";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock background scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Contact Us", path: "/contact" },
  ];

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${scrolled
        ? "bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm py-2"
        : "bg-white/95 backdrop-blur-sm border-b border-transparent py-3"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg text-white shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300">
              <BookOpen size={24} strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900 transition-colors duration-300">
              Organization<span className="text-blue-600">Web</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2 lg:gap-4">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full flex items-center justify-center ${isActive
                    ? "text-blue-700 font-bold bg-blue-50 backdrop-blur-md border border-blue-100 shadow-sm"
                    : "text-slate-700 hover:text-blue-600 hover:bg-slate-100/50"
                    }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 border-2 border-blue-400/20 rounded-full pointer-events-none"
                    />
                  )}
                </Link>
              );
            })}
            <div className="w-px h-6 bg-slate-200 mx-2 transition-colors duration-300"></div>
            {user ? (
              <UserDropdown user={user} onLogout={handleLogout} scrolled={scrolled} />
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all duration-300 transform hover:-translate-y-0.5 border border-white/20"
                >
                  Login
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-3">
            <button
              className="p-2 focus:outline-none bg-slate-100 border border-slate-200 rounded-full text-slate-800 transition-colors duration-300"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-18 right-3 w-72 z-50 rounded-3xl md:hidden bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
          >
            {/* Scrollable Nav Links */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-2.5 rounded-xl text-base font-medium transition-all ${isActive
                      ? "bg-blue-50 text-blue-700 border border-blue-100 shadow-sm"
                      : "text-slate-700 hover:bg-slate-50"
                      }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {/* Fixed Footer Area (User Details & Buttons) */}
            <div className="p-4 bg-slate-50/50 border-t border-slate-100">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-2 py-1">
                    <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                      <User size={18} />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-slate-900 truncate text-sm">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  {(isAdmin(user?.role) || isSuperAdmin(user?.role)) && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-700 text-sm font-bold border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      <LayoutDashboard size={18} />
                      Dashboard
                    </Link>
                  )}
                  {!isAdmin(user?.role) && !isSuperAdmin(user?.role) && (
                    <>
                      <Link
                        to="/my-receipts"
                        onClick={() => setIsOpen(false)}
                        className="flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-700 text-sm font-bold border border-slate-200 hover:bg-slate-50 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><path d="M12 17V7" /></svg>
                        My Receipts
                      </Link>
                      <Link
                        to="/my-purchases"
                        onClick={() => setIsOpen(false)}
                        className="flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-700 text-sm font-bold border border-slate-200 hover:bg-slate-50 transition-colors"
                      >
                        <ShoppingBag size={18} />
                        My Purchases
                      </Link>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-bold hover:bg-red-100 transition-colors"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                >
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}