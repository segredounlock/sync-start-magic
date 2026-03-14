import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { lazy, Suspense, useEffect, useState } from "react";
import { SplashScreen } from "@/components/SplashScreen";
import { supabase } from "@/integrations/supabase/client";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import LandingPage from "@/pages/LandingPage";
import { useCacheCleanup } from "@/hooks/useCacheCleanup";

// Lazy load ALL pages that aren't the initial landing
const RecargaPublica = lazy(() => import("@/pages/RecargaPublica"));
const TelegramMiniApp = lazy(() => import("@/pages/TelegramMiniApp"));
const ClientePortal = lazy(() => import("@/pages/ClientePortal"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const MaintenancePage = lazy(() => import("@/pages/MaintenancePage"));
const InstallApp = lazy(() => import("@/pages/InstallApp"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const RevendedorPainel = lazy(() => import("@/pages/RevendedorPainel"));
const Principal = lazy(() => import("@/pages/Principal"));
const ChatApp = lazy(() => import("@/pages/ChatApp"));
const UserProfile = lazy(() => import("@/pages/UserProfile"));

// Lazy load non-critical global components (render after initial paint)
const SeasonalEffects = lazy(() => import("@/components/SeasonalEffects"));
const PullToRefresh = lazy(() => import("@/components/PullToRefresh"));

function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const { user, role } = useAuth();
  const [maintenance, setMaintenance] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    const timeout = setTimeout(() => {
      if (mounted && maintenance === null) setMaintenance(false);
    }, 5000);

    const check = async () => {
      try {
        const { data, error } = await supabase.rpc("get_maintenance_mode" as any);
        if (!mounted) return;
        if (error) { setMaintenance(false); return; }
        setMaintenance(data === true);
      } catch {
        if (mounted) setMaintenance(false);
      }
    };
    check();

    // Listen for realtime changes
    const channel = supabase
      .channel("maintenance-mode")
      .on("postgres_changes", { event: "*", schema: "public", table: "system_config", filter: "key=eq.maintenanceMode" }, (payload: any) => {
        if (mounted) setMaintenance(payload.new?.value === "true");
      })
      .subscribe();

    return () => { mounted = false; clearTimeout(timeout); supabase.removeChannel(channel); };
  }, []);

  // Loading maintenance status
  if (maintenance === null) return <SplashScreen />;
  if (maintenance && role === "admin") return <>{children}</>;
  if (maintenance) return <Suspense fallback={<SplashScreen />}><MaintenancePage /></Suspense>;
  return <>{children}</>;
}

function DeferredEffects() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    // Defer non-critical effects until after initial paint
    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(() => setReady(true));
      return () => cancelIdleCallback(id);
    } else {
      const id = setTimeout(() => setReady(true), 1500);
      return () => clearTimeout(id);
    }
  }, []);
  if (!ready) return null;
  return (
    <Suspense fallback={null}>
      <SeasonalEffects />
      <PullToRefresh />
    </Suspense>
  );
}

function App() {
  useCacheCleanup();

  return (
    <ThemeProvider>
      <AuthProvider>
        <DeferredEffects />
        <MaintenanceGuard>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/recarga" element={<Suspense fallback={<SplashScreen />}><RecargaPublica /></Suspense>} />
            <Route path="/reset-password" element={<Suspense fallback={<SplashScreen />}><ResetPassword /></Suspense>} />
            <Route path="/loja/:slug" element={<Suspense fallback={<SplashScreen />}><ClientePortal /></Suspense>} />
            <Route path="/miniapp" element={<Suspense fallback={<SplashScreen />}><TelegramMiniApp /></Suspense>} />
            <Route path="/instalar" element={<Suspense fallback={<SplashScreen />}><InstallApp /></Suspense>} />
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
            <Route
              path="/perfil/:userId"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<SplashScreen />}>
                    <UserProfile />
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
