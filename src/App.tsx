import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { lazy, Suspense } from "react";
import { PageSkeleton } from "@/components/Skeleton";
import Auth from "@/pages/Auth";
import RecargaPublica from "@/pages/RecargaPublica";
import TelegramMiniApp from "@/pages/TelegramMiniApp";
import NotFound from "@/pages/NotFound";
import LandingPage from "@/pages/LandingPage";
import ClientePortal from "@/pages/ClientePortal";

const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const RevendedorPainel = lazy(() => import("@/pages/RevendedorPainel"));
const Principal = lazy(() => import("@/pages/Principal"));

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/recarga" element={<RecargaPublica />} />
          <Route path="/loja/:slug" element={<ClientePortal />} />
          <Route path="/miniapp" element={<TelegramMiniApp />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin", "revendedor"]}>
                <Suspense fallback={<PageSkeleton />}>
                  <AdminDashboard />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/principal"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Suspense fallback={<PageSkeleton />}>
                  <Principal />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/painel"
            element={
              <ProtectedRoute>
                <Suspense fallback={<PageSkeleton />}>
                  <RevendedorPainel />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
