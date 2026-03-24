import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { isProfileComplete } from "@/services/profile";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireComplete?: boolean;
}

export default function ProtectedRoute({ children, requireComplete = false }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signup" state={{ from: location }} replace />;
  }

  // If profile incomplete, force onboarding (unless already there)
  if (requireComplete && profile && !isProfileComplete(profile) && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
