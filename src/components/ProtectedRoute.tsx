import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { PageSkeleton } from "@/components/Skeleton";

export function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, role, loading, authReady, roleLoaded } = useAuth();

  // Show skeleton instead of splash for smoother perceived loading
  if (loading || !authReady) return <PageSkeleton />;

  if (!user) return <Navigate to="/login" replace />;

  if (!allowedRoles) return <>{children}</>;

  // Wait only while role is being fetched
  if (!roleLoaded) return <PageSkeleton />;

  if (role && allowedRoles.includes(role)) return <>{children}</>;

  return <Navigate to="/painel" replace />;
}
