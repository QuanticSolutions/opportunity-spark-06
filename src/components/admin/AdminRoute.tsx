import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ADMIN_ROLES = ["admin", "editor", "viewer"] as const;

interface AdminRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "editor" | "viewer";
}

export default function AdminRoute({ children, requiredRole }: AdminRouteProps) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/signup" replace />;
  }

  const isAdminRole = ADMIN_ROLES.includes(profile.role as any);
  if (!isAdminRole) {
    return <Navigate to="/" replace />;
  }

  // Check specific role hierarchy: admin > editor > viewer
  if (requiredRole) {
    const roleHierarchy = { admin: 3, editor: 2, viewer: 1 };
    const userLevel = roleHierarchy[profile.role as keyof typeof roleHierarchy] || 0;
    const requiredLevel = roleHierarchy[requiredRole];
    if (userLevel < requiredLevel) {
      return <Navigate to="/admin" replace />;
    }
  }

  return <>{children}</>;
}
