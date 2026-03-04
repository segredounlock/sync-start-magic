import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SplashScreen } from "@/components/SplashScreen";

export function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, role, loading, authReady, roleLoaded } = useAuth();

  if (loading || !authReady) return <SplashScreen />;

  if (!user) return <Navigate to="/login" replace />;

  if (!allowedRoles) return <>{children}</>;

  // Wait only while role is being fetched
  if (!roleLoaded) return <SplashScreen />;

  if (role && allowedRoles.includes(role)) return <>{children}</>;

  return <Navigate to="/painel" replace />;
}

