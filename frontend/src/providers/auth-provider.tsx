import { createContext, useContext, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchCurrentUser, login as loginRequest, logout as logoutRequest } from "../api/auth";
import { clearTokens, hasTokens, storeTokens } from "../lib/auth-storage";
import { showSuccessToast } from "../lib/toast";
import type { User } from "../types";

interface LoginValues {
  email: string;
  password: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (values: LoginValues) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const queryClient = useQueryClient();

  const authQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: fetchCurrentUser,
    enabled: hasTokens(),
    staleTime: 1000 * 60 * 10,
    retry: false
  });

  const loginMutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: ({ tokens, user }) => {
      storeTokens(tokens);
      queryClient.setQueryData(["auth", "me"], user);
      showSuccessToast(`Welcome back, ${user.name.split(" ")[0]}!`);
    }
  });

  const logoutMutation = useMutation({
    mutationFn: logoutRequest,
    onSuccess: () => {
      clearTokens();
      queryClient.removeQueries({ queryKey: ["auth"] });
      queryClient.removeQueries({ queryKey: ["cart"] });
      showSuccessToast("Signed out");
    },
    onError: () => {
      clearTokens();
      queryClient.removeQueries({ queryKey: ["auth"] });
      queryClient.removeQueries({ queryKey: ["cart"] });
    }
  });

  const { mutateAsync: loginMutateAsync, isPending: isLoggingIn } = loginMutation;
  const { mutateAsync: logoutMutateAsync, isPending: isLoggingOut } = logoutMutation;

  const value = useMemo<AuthContextValue>(() => {
    return {
      user: authQuery.data ?? null,
      isAuthenticated: Boolean(authQuery.data),
      isLoading: authQuery.isLoading || isLoggingIn || isLoggingOut,
      login: async (values: LoginValues) => {
        const result = await loginMutateAsync(values);
        return result.user;
      },
      logout: async () => {
        if (!isLoggingOut) {
          await logoutMutateAsync();
        }
      }
    };
  }, [authQuery.data, authQuery.isLoading, isLoggingIn, isLoggingOut, loginMutateAsync, logoutMutateAsync]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
