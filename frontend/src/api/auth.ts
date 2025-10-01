import { apiClient } from "./client";
import type { AuthTokens, User } from "../types";

interface LoginResponse {
  tokens: AuthTokens;
  user: User;
}

export async function login(payload: { email: string; password: string }): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/auth/login", payload);
  return response.data;
}

export async function fetchCurrentUser(): Promise<User> {
  const response = await apiClient.get<User>("/auth/me");
  return response.data;
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}
