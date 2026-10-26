import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import toast from "react-hot-toast";
import useAuthStore from "../lib/authStore";
import { getHomePathByRole } from "../lib/roles";
import { API_URL } from "../lib/axiosInstance";

let isFetchingSession = false;

export default function GoogleLoginButton({ tabIndex, rememberMe = false, text = "Sign in with Google" }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoogleLogin = () => {
    const rememberParam = rememberMe ? "true" : "false";
    window.location.href = `${API_URL}/auth/google?remember_me=${rememberParam}`;
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const googleAuth = params.get("google_auth");

    if (googleAuth === "success") {
      if (isFetchingSession) return;
      isFetchingSession = true;

      const fetchGoogleSession = async () => {
        try {
          const res = await useAuthStore.getState().refresh();
          if (res && res.user) {
            toast.success(res.message || "Logged in with Google successfully!");
            navigate(getHomePathByRole(res.user.role), { replace: true });
          } else {
            toast.error("Google session retrieval failed.");
            navigate("/login", { replace: true });
          }
        } catch (err) {
          toast.error(err?.message || "An error occurred during Google authentication.");
          navigate("/login", { replace: true });
        } finally {
          isFetchingSession = false;
        }
      };
      fetchGoogleSession();
    } else if (googleAuth === "error") {
      const message = params.get("message") || "Google authentication failed";
      toast.error(decodeURIComponent(message));
      navigate(location.pathname, { replace: true });
    }
  }, [location.search, navigate, location.pathname]);

  return (
    <div className="w-full">
      <div className="relative my-3">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center text-[10px] uppercase">
          <span className="bg-white px-2 text-slate-400 font-medium">Or continue with</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        tabIndex={tabIndex}
        className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all shadow-sm cursor-pointer active:scale-[0.99]"
      >
        <FcGoogle size={18} />
        <span>{text}</span>
      </button>
    </div>
  );
}
