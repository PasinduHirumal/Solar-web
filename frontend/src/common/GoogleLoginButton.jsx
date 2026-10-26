import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import toast from "react-hot-toast";
import useAuthStore from "../lib/authStore";
import { getHomePathByRole } from "../lib/roles";
import { API_URL } from "../lib/axiosInstance";

let isFetchingSession = false;

export default function GoogleLoginButton({ tabIndex }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
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
          toast.error(err.message || "An error occurred during Google authentication.");
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
    <>
      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-secondary"></div>
        </div>
        <div className="relative flex justify-center text-[10px] uppercase">
          <span className="bg-white px-2 text-soft-gray font-light">Or continue with</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        tabIndex={tabIndex}
        className="w-full flex items-center justify-center gap-2 bg-white hover:bg-bg-soft border border-secondary text-charcoal py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all shadow-sm cursor-pointer hover:border-accent"
      >
        <FcGoogle size={16} />
        <span>Sign in with Google</span>
      </button>
    </>
  );
}
