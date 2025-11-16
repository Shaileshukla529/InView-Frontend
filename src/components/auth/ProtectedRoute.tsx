import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ReactNode, memo } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "admin" | "manager" | "employee";
}

// Memoized loading component
const LoadingSpinner = memo(() => (
  <div className="flex h-screen items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
      <p className="mt-4 text-gray-600">Verifying session...</p>
    </div>
  </div>
));

LoadingSpinner.displayName = "LoadingSpinner";

const ProtectedRoute = memo(({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  // Save the attempted location for redirect after login
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location.pathname }} replace />;
  }

  // Check role-based access if required
  if (requiredRole && user) {
    const roleHierarchy = {
      admin: 3,
      manager: 2,
      employee: 1,
    };

    const userRoleLevel = roleHierarchy[user.role];
    const requiredRoleLevel = roleHierarchy[requiredRole];

    // If user's role level is lower than required, redirect to dashboard
    if (userRoleLevel < requiredRoleLevel) {
      console.warn(`Access denied: User role ${user.role} insufficient for required role ${requiredRole}`);
      return <Navigate to="/dashboard" replace />;
    }
  }

  // User is authenticated and has required permissions
  return <>{children}</>;
});

ProtectedRoute.displayName = "ProtectedRoute";

export default ProtectedRoute;