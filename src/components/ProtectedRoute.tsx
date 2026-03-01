import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

export function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // If no allowedRoles specified, any authenticated user can access
  if (!allowedRoles) return <>{children}</>;

  // If allowedRoles specified, check if user has one of them
  if (role && allowedRoles.includes(role)) return <>{children}</>;

  // User doesn't have required role - redirect to appropriate page
  return <Navigate to="/painel" replace />;
}
