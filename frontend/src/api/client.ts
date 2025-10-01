import axios, { type AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";
import { env } from "../config/env";
import { clearTokens, getAccessToken, getRefreshToken, storeTokens } from "../lib/auth-storage";
import type { AuthTokens } from "../types";
import { showErrorToast } from "../lib/toast";

type RetryableConfig = AxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  refreshPromise = axios
    .post<AuthTokens>(`${env.apiUrl}/auth/refresh`, { refreshToken })
    .then((response: AxiosResponse<AuthTokens>) => {
      storeTokens(response.data);
      return response.data.accessToken;
    })
    .catch(() => null)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  headers: {
    "Content-Type": "application/json"
  }
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalRequest = error.config as RetryableConfig | undefined;

    if (status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const newAccessToken = await refreshAccessToken();
      if (newAccessToken && originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      }
      clearTokens();
    }

    if (status && status >= 400) {
      const message =
        (typeof error.response?.data === "object" && error.response?.data && "detail" in error.response.data
          ? String((error.response.data as { detail: string }).detail)
          : error.message) ?? "Unexpected error";
      showErrorToast(message);
    }

    return Promise.reject(error);
  }
);
