import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import { axiosInstance, API_URL } from "./axiosInstance";
import toast from "react-hot-toast";

const extractErrorMessage = (error, fallback = "Operation failed") => {
    const errorMsg = error?.response?.data?.message;
    if (Array.isArray(errorMsg)) {
        return errorMsg.join(", ");
    }
    return errorMsg || error?.message || fallback;
};

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            isHydrated: false,
            isAuthLoading: false,

            setHydrated: () => set({ isHydrated: true }),

            setAuth: (accessToken, user) =>
                set((state) => ({
                    accessToken,
                    user: user || state.user,
                })),

            logoutLocal: () => {
                set({ accessToken: null, user: null });
                localStorage.removeItem("auth-storage");
            },

            login: async (credentials) => {
                try {
                    set({ isAuthLoading: true });
                    const response = await axiosInstance.post("/auth/login", credentials);

                    const responseData = response.data?.data || response.data;
                    const accessToken = responseData?.accessToken;
                    const user = responseData?.user;

                    if (!accessToken || !user) {
                        throw new Error("Invalid response format received from server");
                    }

                    set({ accessToken, user });
                    toast.success(response.data?.message || "Logged in successfully!");
                    return { success: true, user };
                } catch (error) {
                    const message = extractErrorMessage(error, "Login failed");
                    toast.error(message);
                    return { success: false, error: message };
                } finally {
                    set({ isAuthLoading: false });
                }
            },

            register: async (credentials) => {
                try {
                    set({ isAuthLoading: true });
                    const response = await axiosInstance.post("/auth/register", credentials);
                    const responseData = response.data?.data || response.data;
                    toast.success(response.data?.message || "User registered successfully!");
                    return { success: true, data: responseData?.result || responseData };
                } catch (error) {
                    const message = extractErrorMessage(error, "Registration failed");
                    toast.error(message);
                    return { success: false, error: message };
                } finally {
                    set({ isAuthLoading: false });
                }
            },

            checkAuth: async () => {
                try {
                    set({ isAuthLoading: true });
                    const response = await axiosInstance.get("/auth/check-auth");
                    const responseData = response.data?.data || response.data;
                    const user = responseData?.user || responseData;

                    if (user && user.id) {
                        set({ user });
                        return user;
                    }
                    return null;
                } catch {
                    // If check-auth fails after token refresh retry, clear state
                    if (get().accessToken) {
                        set({ accessToken: null, user: null });
                        localStorage.removeItem("auth-storage");
                    }
                    return null;
                } finally {
                    set({ isAuthLoading: false });
                }
            },

            refresh: async () => {
                try {
                    set({ isAuthLoading: true });
                    const response = await axios.post(
                        `${API_URL}/auth/refresh`,
                        {},
                        { withCredentials: true }
                    );

                    const responseData = response.data?.data || response.data;
                    const accessToken = responseData?.accessToken;
                    const user = responseData?.user;

                    if (!accessToken || !user) {
                        throw new Error("Invalid refresh response format");
                    }

                    set({ accessToken, user });
                    return { accessToken, user, message: response.data?.message };
                } catch (error) {
                    set({ accessToken: null, user: null });
                    localStorage.removeItem("auth-storage");
                    const message = extractErrorMessage(error, "Session refresh failed");
                    throw new Error(message, { cause: error });
                } finally {
                    set({ isAuthLoading: false });
                }
            },

            initAuth: async () => {
                const currentToken = get().accessToken;
                if (currentToken) {
                    await get().checkAuth();
                } else {
                    // Attempt silent refresh using httpOnly cookie
                    try {
                        const response = await axios.post(
                            `${API_URL}/auth/refresh`,
                            {},
                            { withCredentials: true }
                        );
                        const responseData = response.data?.data || response.data;
                        if (responseData?.accessToken && responseData?.user) {
                            set({ accessToken: responseData.accessToken, user: responseData.user });
                        }
                    } catch {
                        // Guest user, silently keep unauthenticated state
                        set({ accessToken: null, user: null });
                    }
                }
            },

            logout: async () => {
                try {
                    await axiosInstance.post("/auth/logout");
                    toast.success("Logged out successfully");
                } catch (e) {
                    console.error("Logout error:", e);
                } finally {
                    set({ accessToken: null, user: null });
                    localStorage.removeItem("auth-storage");
                }
            },

            isLoggedIn: () =>
                Boolean(get().accessToken && get().user),
        }),
        {
            name: "auth-storage",
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
            }),
            onRehydrateStorage: () => (state) => {
                state?.setHydrated?.();
            },
        }
    )
);

export default useAuthStore;
