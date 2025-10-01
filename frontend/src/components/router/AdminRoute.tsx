import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { LoadingState } from "../shared/LoadingState";

interface AdminRouteProps {
  children: JSX.Element;
}

export function AdminRoute({ children }: AdminRouteProps): JSX.Element {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingState message="Preparing dashboard" />;
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
