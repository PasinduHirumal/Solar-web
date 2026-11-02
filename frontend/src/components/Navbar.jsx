import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogOut, User, LayoutDashboard, Phone, Mail, MessageCircle } from "lucide-react";
import useAuthStore from "../lib/authStore";
import { confirmAction } from "../lib/confirmAction";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { isAdmin, isSuperAdmin } from "../lib/roles";
import UserDropdown from "./UserDropdown";
import logoCircle from "../assets/logo/logo_circle.jpg";
import { contactDetails } from "../data/dataset";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const phone = contactDetails.phones[0]?.display || "+94 76 033 2537";
  const rawPhone = contactDetails.phones[0]?.number || "+94760332537";
  const whatsappNumber = contactDetails.whatsapp.clean || "94760332537";
  const email = contactDetails.emails[1]?.address || "shree.engsolar@gmail.com";

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
      setScrolled(window.scrollY > 15);
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

  // Clean navigation tabs only - no anchor pseudo-tabs
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Contact Us", path: "/contact" },
  ];

  return (
    <header className="fixed w-full z-50 transition-all duration-300 font-sans top-0 left-0">
      {/* Top utility contact bar matching corporate Shree Energy style */}
      <div
        className={`hidden md:block bg-[#031F4C] text-slate-300 text-xs transition-all duration-300 ${
          scrolled ? "h-0 py-0 opacity-0 overflow-hidden" : "py-2 border-b border-white/10 opacity-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a
              href={`tel:${rawPhone}`}
              className="flex items-center gap-1.5 hover:text-[#008BD7] transition-colors"
            >
              <Phone size={13} className="text-[#008BD7]" />
              <span className="font-semibold text-white">Hotline:</span>
              <span>{phone}</span>
            </a>
            <span className="text-white/20">|</span>
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-1.5 hover:text-[#008BD7] transition-colors"
            >
              <Mail size={13} className="text-[#008BD7]" />
              <span>{email}</span>
            </a>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[11px] font-semibold text-[#63B723] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#63B723] animate-pulse"></span>
              Powering Sri Lanka with Smart Energy Solutions
            </span>
            <span className="text-white/20">|</span>
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-[#63B723] hover:text-[#61CE70] font-bold transition-colors"
            >
              <MessageCircle size={13} />
              <span>WhatsApp Chat</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav
        className={`w-full transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-md border-b border-slate-200/80 py-2.5"
            : "bg-white/90 backdrop-blur-sm border-b border-slate-100 py-3.5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src={logoCircle}
                alt="Shree Energy"
                className="h-10 sm:h-11 w-10 sm:w-11 rounded-xl object-contain shadow-xs border border-slate-100 group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-black tracking-tight text-[#031F4C] leading-none">
                  SHREE <span className="text-[#008BD7]">ENERGY</span>
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-[#63B723] leading-tight mt-0.5">
                  (Pvt) Ltd • Smart Solutions
                </span>
              </div>
            </Link>

            {/* Desktop Navigation - Clean Real Routes Only */}
            <div className="hidden md:flex items-center gap-2 lg:gap-3">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`relative px-4 py-2 text-sm font-semibold transition-all duration-200 rounded-full flex items-center justify-center ${
                      isActive
                        ? "text-[#008BD7] font-bold bg-[#E6F1FA]"
                        : "text-slate-700 hover:text-[#008BD7] hover:bg-slate-50"
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <motion.div
                        layoutId="navbar-pill"
                        className="absolute inset-0 rounded-full border border-[#008BD7]/20 pointer-events-none"
                      />
                    )}
                  </Link>
                );
              })}

              <div className="w-px h-6 bg-slate-200 mx-2"></div>

              {/* Account / Login Actions - (No Get a Quote button) */}
              <div className="flex items-center gap-2.5">
                {user ? (
                  <UserDropdown user={user} onLogout={handleLogout} scrolled={scrolled} />
                ) : (
                  <Link
                    to="/login"
                    className="px-6 py-2 rounded-full bg-gradient-to-r from-[#008BD7] to-[#046bd2] hover:from-[#0077B8] hover:to-[#008BD7] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-[#008BD7]/25 transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              {user && (
                <div className="w-8 h-8 rounded-full bg-[#008BD7] text-white flex items-center justify-center text-xs font-bold mr-1">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-slate-700 hover:text-[#008BD7] rounded-xl hover:bg-slate-100 transition-colors"
                aria-label="Toggle Menu"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-slate-200 shadow-2xl overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-[#E6F1FA] text-[#008BD7] font-bold"
                          : "text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}

                <div className="pt-4 border-t border-slate-100 mt-2 space-y-3">
                  <div className="flex flex-col gap-1.5 px-4 py-2.5 bg-slate-50 rounded-xl text-xs text-slate-600">
                    <a href={`tel:${rawPhone}`} className="flex items-center gap-2 text-slate-900 font-bold">
                      <Phone size={13} className="text-[#008BD7]" />
                      <span>{phone}</span>
                    </a>
                    <a href={`mailto:${email}`} className="flex items-center gap-2 text-slate-600">
                      <Mail size={13} className="text-[#008BD7]" />
                      <span>{email}</span>
                    </a>
                  </div>

                  {user ? (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center gap-3 px-3 py-1">
                        <div className="p-2 bg-[#E6F1FA] rounded-full text-[#008BD7]">
                          <User size={16} />
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-bold text-slate-900 truncate text-xs">{user.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        </div>
                      </div>
                      {(isAdmin(user?.role) || isSuperAdmin(user?.role)) && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setIsOpen(false)}
                          className="flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold"
                        >
                          <LayoutDashboard size={16} />
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpen(false);
                          handleLogout();
                        }}
                        className="flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 text-xs font-bold cursor-pointer"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="pt-1">
                      <Link
                        to="/login"
                        onClick={() => setIsOpen(false)}
                        className="block w-full text-center px-4 py-2.5 rounded-xl bg-[#008BD7] text-white text-xs font-bold shadow-md shadow-[#008BD7]/25"
                      >
                        Login to Account
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
