import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageSkeleton } from "@/components/Skeleton";

export function MasterOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, role, loading, authReady, roleLoaded } = useAuth();
  const [masterAdminId, setMasterAdminId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await supabase
          .from("system_config")
          .select("value")
          .eq("key", "masterAdminId")
          .maybeSingle();
        setMasterAdminId(data?.value || null);
      } catch {
        setMasterAdminId(null);
      } finally {
        setChecking(false);
      }
    };
    fetch();
  }, []);

  if (loading || !authReady || !roleLoaded || checking) return <PageSkeleton />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.id === masterAdminId) return <>{children}</>;
  return <Navigate to="/painel" replace />;
}
