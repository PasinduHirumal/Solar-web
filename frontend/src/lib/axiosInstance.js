import axios from "axios";
import useAuthStore from "./authStore";

const rawApiUrl = import.meta.env.VITE_APP_NODE_ENV === "production"
    ? import.meta.env.VITE_APP_PRODUCTION_API_URL
    : import.meta.env.VITE_APP_DEVELOPMENT_API_URL;

export const API_URL = (rawApiUrl || "http://localhost:5000").replace(/\/+$/, "");

export const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
});

// Attach access token to outgoing requests
axiosInstance.interceptors.request.use((config) => {
    try {
        const token = useAuthStore.getState().accessToken;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            const authStorage = localStorage.getItem("auth-storage");
            if (authStorage) {
                const { state } = JSON.parse(authStorage);
                if (state?.accessToken) {
                    config.headers.Authorization = `Bearer ${state.accessToken}`;
                }
            }
        }
    } catch {
        // ignore JSON parse error
    }
    return config;
});

// ===== REFRESH CONTROL =====
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const status = error?.response?.status;

        const is401 = status === 401;
        const isRefreshEndpoint = originalRequest?.url?.includes("/auth/refresh");
        const isLoginEndpoint = originalRequest?.url?.includes("/auth/login");

        if (!is401 || isRefreshEndpoint || isLoginEndpoint) {
            return Promise.reject(error);
        }

        if (originalRequest._retry) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({
                    resolve: (token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        resolve(axiosInstance(originalRequest));
                    },
                    reject: reject,
                });
            });
        }

        isRefreshing = true;

        try {
            // Call refresh endpoint directly using raw axios without Bearer token
            const response = await axios.post(
                `${API_URL}/auth/refresh`,
                {},
                { withCredentials: true }
            );

            const refreshData = response.data?.data || response.data;
            const newAccessToken = refreshData?.accessToken;
            const user = refreshData?.user;

            if (!newAccessToken) {
                throw new Error("Invalid refresh response format");
            }

            useAuthStore.getState().setAuth(newAccessToken, user);

            processQueue(null, newAccessToken);

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axiosInstance(originalRequest);
        } catch (err) {
            processQueue(err, null);
            useAuthStore.getState().logoutLocal();
            return Promise.reject(err);
        } finally {
            isRefreshing = false;
        }
    }
);
