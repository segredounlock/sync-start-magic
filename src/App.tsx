import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { lazy, Suspense, useEffect, useState } from "react";
import { SplashScreen } from "@/components/SplashScreen";
import { supabase } from "@/integrations/supabase/client";
import Auth from "@/pages/Auth";
import RecargaPublica from "@/pages/RecargaPublica";
import TelegramMiniApp from "@/pages/TelegramMiniApp";
import NotFound from "@/pages/NotFound";
import LandingPage from "@/pages/LandingPage";
import ClientePortal from "@/pages/ClientePortal";
import ResetPassword from "@/pages/ResetPassword";
import MaintenancePage from "@/pages/MaintenancePage";

const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const RevendedorPainel = lazy(() => import("@/pages/RevendedorPainel"));
const Principal = lazy(() => import("@/pages/Principal"));
const ChatApp = lazy(() => import("@/pages/ChatApp"));

function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const { user, role } = useAuth();
  const [maintenance, setMaintenance] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase
        .from("system_config")
        .select("value")
        .eq("key", "maintenanceMode")
        .maybeSingle();
      setMaintenance(data?.value === "true");
    };
    check();

    // Listen for realtime changes
    const channel = supabase
      .channel("maintenance-mode")
      .on("postgres_changes", { event: "*", schema: "public", table: "system_config", filter: "key=eq.maintenanceMode" }, (payload: any) => {
        setMaintenance(payload.new?.value === "true");
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Still loading
  if (maintenance === null) return <SplashScreen />;

  // Maintenance ON but user is admin → let through
  if (maintenance && role === "admin") return <>{children}</>;

  // Maintenance ON → show page
  if (maintenance) return <MaintenancePage />;

  return <>{children}</>;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MaintenanceGuard>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/recarga" element={<RecargaPublica />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/loja/:slug" element={<ClientePortal />} />
            <Route path="/miniapp" element={<TelegramMiniApp />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin", "revendedor"]}>
                  <Suspense fallback={<SplashScreen />}>
                    <AdminDashboard />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/principal"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Suspense fallback={<SplashScreen />}>
                    <Principal />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/painel"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<SplashScreen />}>
                    <RevendedorPainel />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<SplashScreen />}>
                    <ChatApp />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MaintenanceGuard>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
