import axios from "axios";

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;
      try {
        await apiClient.post("/auth/refresh");
        return apiClient(originalRequest);
      } catch (refreshError) {
        if (typeof window !== "undefined") {
          window.location.assign("/login");
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export const setAuthHeader = (token) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
};
