import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "@/context/user/user.context";
import path from "@/constants/path";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { user, loading } = useUser();
  const location = useLocation();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    // Redirect to login with the current location
    return <Navigate to={path.login} state={{ from: location }} replace />;
  }

  // Check if user has required role (if specified)
  if (requiredRole && user.role?.value !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    const roleRoutes = {
      Admin: path.ADMIN_DASHBOARD,
      Candidate: path.CANDIDATE_HOME,
      Recruiter: path.RECRUITER_HOME,
      Center: path.CENTER_HOME,
    };

    const redirectPath =
      roleRoutes[user.role?.value as keyof typeof roleRoutes] || path.login;
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
