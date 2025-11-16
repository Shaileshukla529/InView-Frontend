// src/services/api.ts - PRODUCTION READY
import axios from "axios";
import { env } from "@/config/env";

// Helper to determine if an error is authentication-related
const isAuthError = (error: any) => {
  const status = error?.response?.status;
  return status === 401 || status === 419 || status === 440;
};

class TokenRefreshManager {
  private isRefreshing = false;
  private queue: Array<{ resolve: () => void; reject: (reason?: unknown) => void }> = [];

  async refreshToken(): Promise<void> {
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.queue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      await axios.post(
        `${env.apiBaseUrl}${env.authPaths.refresh}`,
        {},
        { withCredentials: true }
      );

      this.queue.forEach(({ resolve }) => resolve());
      this.queue = [];
    } catch (error) {
      this.queue.forEach(({ reject }) => reject(error));
      this.queue = [];
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }
}

const refreshManager = new TokenRefreshManager();

// Create default API client for auth and general endpoints
const api = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

// Create attendance API client for attendance-specific endpoints
export const attendanceApi = axios.create({
  baseURL: env.attendanceApiUrl,
  withCredentials: true,
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

// Apply interceptor to default API
api.interceptors.response.use(
  (response) => response,
  async (error: any) => {
  const originalRequest = error.config as (Record<string, any> & { _retry?: boolean }) | undefined;

    // If request opts out of auth handling, propagate error
    if (originalRequest?.headers?.["X-Skip-Interceptor"] === "true") {
      return Promise.reject(error);
    }

    if (originalRequest && !originalRequest._retry && isAuthError(error)) {
  originalRequest._retry = true;

      try {
        await refreshManager.refreshToken();
  return api(originalRequest as any);
      } catch (refreshError) {
        window.dispatchEvent(new CustomEvent("auth:session-expired"));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Apply interceptor to attendance API
attendanceApi.interceptors.response.use(
  (response) => response,
  async (error: any) => {
  const originalRequest = error.config as (Record<string, any> & { _retry?: boolean }) | undefined;

    // If request opts out of auth handling, propagate error
    if (originalRequest?.headers?.["X-Skip-Interceptor"] === "true") {
      return Promise.reject(error);
    }

    if (originalRequest && !originalRequest._retry && isAuthError(error)) {
  originalRequest._retry = true;

      try {
        await refreshManager.refreshToken();
  return attendanceApi(originalRequest as any);
      } catch (refreshError) {
        window.dispatchEvent(new CustomEvent("auth:session-expired"));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;