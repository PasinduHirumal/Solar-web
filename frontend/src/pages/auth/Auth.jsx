import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useAuthStore from "../../lib/authStore";
import { getHomePathByRole } from "../../lib/roles";
import { Eye, EyeOff, Mail, Lock, User, Sparkles, ShieldCheck, ArrowLeft, BookOpen } from "lucide-react";
import GoogleLoginButton from "../../common/GoogleLoginButton";

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const isSignUp = location.pathname === "/register";

  const toggleMode = (signUpMode) => {
    navigate(signUpMode ? "/register" : "/login");
  };

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const res = await login({ email: loginEmail, password: loginPassword });
    if (res.success) {
      navigate(getHomePathByRole(res.user?.role));
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const res = await register({
      name: registerName,
      email: registerEmail,
      password: registerPassword,
    });
    if (res.success) {
      toggleMode(false);
      setRegisterName("");
      setRegisterEmail("");
      setRegisterPassword("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8 relative overflow-hidden">
      {/* Back to Home Button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="absolute top-4 left-4 md:top-8 md:left-8 z-30"
      >
        <Link
          to="/"
          className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-white transition duration-300 bg-white border border-slate-200 shadow-md hover:bg-blue-600 px-4 py-2.5 rounded-full group active:scale-95"
        >
          <ArrowLeft size={14} className="text-slate-500 group-hover:text-white transition-colors duration-300" />
          <span>Back to Home</span>
        </Link>
      </motion.div>

      <div className="absolute top-[-10%] left-[-10%] w-[35%] h-[35%] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[35%] h-[35%] rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-3xl h-[490px] bg-white border border-slate-200 shadow-2xl rounded-3xl overflow-hidden hidden md:flex">

        {/* Left Side Container (Sign Up Form) */}
        <motion.div
          animate={{
            opacity: isSignUp ? 1 : 0,
            x: isSignUp ? 0 : -30,
            pointerEvents: isSignUp ? "auto" : "none",
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="w-1/2 h-full flex flex-col justify-center px-10 py-6 text-left"
        >
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="text-cyan-600" size={16} />
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Organization Web</span>
          </div>
          <h2 className="text-2xl font-display font-bold text-slate-800 uppercase mb-1">Create Account</h2>
          <p className="text-xs text-slate-500 mb-4 font-light">
            Fill in your details to start your learning journey
          </p>

          <form onSubmit={handleRegisterSubmit} className="space-y-3" tabIndex={isSignUp ? 0 : -1}>
            {/* Name input */}
            <div className="relative">
              <User className="absolute left-3 top-3 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Full name"
                tabIndex={isSignUp ? 0 : -1}
                className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 placeholder-slate-400 pl-9 pr-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm font-light transition"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                required={isSignUp}
              />
            </div>

            {/* Email input */}
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={16} />
              <input
                type="email"
                placeholder="Email address"
                tabIndex={isSignUp ? 0 : -1}
                className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 placeholder-slate-400 pl-9 pr-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm font-light transition"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                required={isSignUp}
              />
            </div>

            {/* Password input */}
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={16} />
              <input
                type={showRegisterPassword ? "text" : "password"}
                placeholder="Password"
                tabIndex={isSignUp ? 0 : -1}
                className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 placeholder-slate-400 pl-9 pr-9 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm font-light transition"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                required={isSignUp}
              />
              <button
                type="button"
                onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                tabIndex={isSignUp ? 0 : -1}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition"
              >
                {showRegisterPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isAuthLoading}
              tabIndex={isSignUp ? 0 : -1}
              className="w-full mt-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all shadow-md hover:shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
            >
              {isAuthLoading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-[9px] text-center text-slate-400 mt-4 font-light">
            By continuing, you agree to Organization Web Terms & Privacy Policy
          </p>
        </motion.div>

        {/* Right Side Container (Sign In Form) */}
        <motion.div
          animate={{
            opacity: !isSignUp ? 1 : 0,
            x: !isSignUp ? 0 : 30,
            pointerEvents: !isSignUp ? "auto" : "none",
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="w-1/2 h-full flex flex-col justify-center px-10 py-6 ml-auto text-left"
        >
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="text-cyan-600" size={16} />
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Organization Web</span>
          </div>
          <h2 className="text-2xl font-display font-bold text-slate-800 uppercase mb-1">Sign In</h2>
          <p className="text-xs text-slate-500 mb-4 font-light">
            Enter credentials to access your account
          </p>

          <form onSubmit={handleLoginSubmit} className="space-y-3" tabIndex={!isSignUp ? 0 : -1}>
            {/* Email input */}
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={16} />
              <input
                type="email"
                placeholder="Email address"
                tabIndex={!isSignUp ? 0 : -1}
                className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 placeholder-slate-400 pl-9 pr-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm font-light transition"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required={!isSignUp}
              />
            </div>

            {/* Password input */}
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={16} />
              <input
                type={showLoginPassword ? "text" : "password"}
                placeholder="Password"
                tabIndex={!isSignUp ? 0 : -1}
                className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 placeholder-slate-400 pl-9 pr-9 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm font-light transition"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required={!isSignUp}
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                tabIndex={!isSignUp ? 0 : -1}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition"
              >
                {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="flex justify-end text-xs">
              <Link to="/forgot-password" className="text-xs text-cyan-600 hover:text-blue-600 transition font-semibold">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isAuthLoading}
              tabIndex={!isSignUp ? 0 : -1}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all shadow-md hover:shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
            >
              {isAuthLoading ? "Signing in..." : "Sign In"}
            </button>

            <GoogleLoginButton tabIndex={!isSignUp ? 0 : -1} />
          </form>

          <p className="text-[9px] text-center text-slate-400 mt-4 font-light">
            By continuing, you agree to Organization Web Terms & Privacy Policy
          </p>
        </motion.div>

        {/* Sliding Sliding Overlay Panel */}
        <motion.div
          className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-br from-blue-600 to-cyan-500 text-white p-8 flex flex-col justify-center overflow-hidden z-20 shadow-2xl"
          animate={{
            left: isSignUp ? "50%" : "0%",
            borderTopLeftRadius: isSignUp ? "0px" : "18px",
            borderBottomLeftRadius: isSignUp ? "0px" : "18px",
            borderTopRightRadius: isSignUp ? "18px" : "0px",
            borderBottomRightRadius: isSignUp ? "18px" : "0px",
          }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        >
          {/* Subtle Glow overlays */}
          <div className="absolute top-[-80px] right-[-80px] w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-[-80px] left-[-80px] w-48 h-48 bg-black/10 rounded-full blur-2xl pointer-events-none" />

          <AnimatePresence mode="wait">
            {isSignUp ? (
              <motion.div
                key="signin-promo"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex flex-col justify-center h-full relative z-10 text-left space-y-4"
              >
                <h2 className="text-2xl font-display font-bold uppercase tracking-wide">
                  Welcome Back!
                </h2>
                <p className="text-xs text-white/95 leading-relaxed font-light">
                  Log in to access your dashboard, courses, and account settings.
                </p>

                {/* Feature cards inside Promo */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 bg-white/10 p-2 rounded-xl backdrop-blur-md">
                    <Sparkles size={14} className="text-cyan-200" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Interactive Lessons & Guides</span>
                  </div>
                  <div className="flex items-center gap-2.5 bg-white/10 p-2 rounded-xl backdrop-blur-md">
                    <ShieldCheck size={14} className="text-cyan-200" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Freelancing Development Path</span>
                  </div>
                  <div className="flex items-center gap-2.5 bg-white/10 p-2 rounded-xl backdrop-blur-md">
                    <User size={14} className="text-cyan-200" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Confidence & Structured Growth</span>
                  </div>
                </div>

                <div className="flex flex-col items-center pt-2">
                  <p className="text-xs text-white/70 mb-2">Already have an account?</p>
                  <button
                    type="button"
                    onClick={() => toggleMode(false)}
                    className="px-8 py-2.5 border border-white hover:border-white text-white rounded-full text-xs font-bold uppercase tracking-wider bg-white/0 hover:bg-white hover:text-blue-600 transition duration-300 shadow-sm cursor-pointer"
                  >
                    Sign In
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="signup-promo"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex flex-col justify-center h-full relative z-10 text-left space-y-4"
              >
                <h2 className="text-2xl font-display font-bold uppercase tracking-wide">
                  Join the Community
                </h2>
                <p className="text-xs text-white/95 leading-relaxed font-light">
                  Register your account to securely save your progress, track your lessons, and join other learners.
                </p>

                {/* Feature cards inside Promo */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 bg-white/10 p-2 rounded-xl backdrop-blur-md">
                    <Sparkles size={14} className="text-cyan-200" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Free & Premium Courses</span>
                  </div>
                  <div className="flex items-center gap-2.5 bg-white/10 p-2 rounded-xl backdrop-blur-md">
                    <ShieldCheck size={14} className="text-cyan-200" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Trackable Learning Path</span>
                  </div>
                  <div className="flex items-center gap-2.5 bg-white/10 p-2 rounded-xl backdrop-blur-md">
                    <User size={14} className="text-cyan-200" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Dedicated Student Support</span>
                  </div>
                </div>

                <div className="flex flex-col items-center pt-2">
                  <p className="text-xs text-white/70 mb-2">New to Organization Web?</p>
                  <button
                    type="button"
                    onClick={() => toggleMode(true)}
                    className="px-8 py-2.5 border border-white hover:border-white text-white rounded-full text-xs font-bold uppercase tracking-wider bg-white/0 hover:bg-white hover:text-blue-600 transition duration-300 shadow-sm cursor-pointer"
                  >
                    Sign Up
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

        {/* MOBILE LAYOUT */}
        {/* ========================================================================= */}
        <div className="relative w-full max-w-sm bg-white border border-slate-200 shadow-2xl rounded-3xl p-6 md:hidden overflow-hidden">
          <div className="absolute top-[-40px] right-[-40px] w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

          <AnimatePresence mode="wait">
            {isSignUp ? (
              <motion.div
                key="mobile-signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="text-left"
              >
                <h2 className="text-xl font-display font-bold text-slate-800 uppercase mb-1">Create Account</h2>
                <p className="text-xs text-slate-500 mb-4 font-light">
                  Fill details to begin your learning journey
                </p>

                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  {/* Name */}
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-slate-400" size={16} />
                    <input
                      type="text"
                      placeholder="Full name"
                      className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 placeholder-slate-400 pl-9 pr-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm font-light transition"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 text-slate-400" size={16} />
                    <input
                      type="email"
                      placeholder="Email address"
                      className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 placeholder-slate-400 pl-9 pr-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm font-light transition"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                    />
                  </div>

                  {/* Password */}
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 text-slate-400" size={16} />
                    <input
                      type={showRegisterPassword ? "text" : "password"}
                      placeholder="Password"
                      className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 placeholder-slate-400 pl-9 pr-9 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm font-light transition"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-650 transition"
                    >
                      {showRegisterPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isAuthLoading}
                    className="w-full mt-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition shadow-md hover:shadow-blue-500/20 cursor-pointer"
                  >
                    {isAuthLoading ? "Creating account..." : "Create Account"}
                  </button>
                </form>

                <div className="text-xs text-center mt-4">
                  <span className="text-slate-500 font-light">Already have an account? </span>
                  <button
                    onClick={() => toggleMode(false)}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Sign In
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="mobile-signin"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                className="text-left"
              >
                <h2 className="text-xl font-display font-bold text-slate-800 uppercase mb-1">Sign In</h2>
                <p className="text-xs text-slate-500 mb-4 font-light">
                  Enter credentials to access your account
                </p>

                <form onSubmit={handleLoginSubmit} className="space-y-3">
                  {/* Email */}
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 text-slate-400" size={16} />
                    <input
                      type="email"
                      placeholder="Email address"
                      className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 placeholder-slate-400 pl-9 pr-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm font-light transition"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>

                  {/* Password */}
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 text-slate-400" size={16} />
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="Password"
                      className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 placeholder-slate-400 pl-9 pr-9 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm font-light transition"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-650 transition"
                    >
                      {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <div className="flex justify-end text-xs">
                    <Link to="/forgot-password" className="text-xs text-cyan-600 hover:text-blue-600 transition font-semibold">
                      Forgot password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={isAuthLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition shadow-md hover:shadow-blue-500/20 cursor-pointer"
                  >
                    {isAuthLoading ? "Signing in..." : "Sign In"}
                  </button>

                  <GoogleLoginButton />
                </form>

                <div className="text-xs text-center mt-4">
                  <span className="text-slate-500 font-light">Don't have an account yet? </span>
                  <button
                    onClick={() => toggleMode(true)}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Sign Up
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-[9px] text-center text-slate-400 mt-4 relative z-10 font-light">
            By continuing, you agree to Organization Web Terms & Privacy Policy
          </p>
        </div>
    </div>
  );
}
