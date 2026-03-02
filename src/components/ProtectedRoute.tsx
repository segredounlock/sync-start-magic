import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SplashScreen } from "@/components/SplashScreen";

export function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, role, loading } = useAuth();

  if (loading) return <SplashScreen />;

  if (!user) return <Navigate to="/login" replace />;

  if (!allowedRoles) return <>{children}</>;

  // Role is still loading
  if (role === null) return <SplashScreen />;

  if (allowedRoles.includes(role)) return <>{children}</>;

  return <Navigate to="/painel" replace />;
}
