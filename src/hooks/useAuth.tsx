import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "admin" | "revendedor" | "cliente" | "usuario" | null;

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: AppRole;
  loading: boolean;
  authReady: boolean;
  roleLoaded: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  role: null,
  loading: true,
  authReady: false,
  roleLoaded: false,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole>(null);
  const [roleLoaded, setRoleLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const isMountedRef = useRef(true);

  const fetchRole = useCallback(async (userId: string) => {
    try {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (!isMountedRef.current) return;

      if (data && data.length > 0) {
        // Priority: admin > revendedor > cliente > usuario
        const priority: Record<string, number> = { admin: 1, revendedor: 2, cliente: 3, usuario: 4 };
        const sorted = data.sort((a, b) => (priority[a.role] ?? 99) - (priority[b.role] ?? 99));
        setRole((sorted[0].role as AppRole) ?? null);
      } else {
        setRole(null);
      }
    } catch {
      if (!isMountedRef.current) return;
      setRole(null);
    } finally {
      if (!isMountedRef.current) return;
      setRoleLoaded(true);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    const hydrateSession = async () => {
      const result = await supabase.auth.getSession();
      if (!isMountedRef.current) return;

      const currentSession = result.data.session;
      setSession(currentSession);
      if (currentSession?.user) {
        setRoleLoaded(false);
        void fetchRole(currentSession.user.id);
      } else {
        setRole(null);
        setRoleLoaded(true);
      }

      setAuthReady(true);
      setLoading(false);
    };

    void hydrateSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMountedRef.current) return;

      setSession(nextSession);
      if (nextSession?.user) {
        setRoleLoaded(false);
        void fetchRole(nextSession.user.id);
      } else {
        setRole(null);
        setRoleLoaded(true);
      }

      setLoading(false);
    });

    return () => {
      isMountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [fetchRole]);

  // Realtime subscription for role changes
  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;

    const channel = supabase
      .channel("user-role-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_roles", filter: `user_id=eq.${userId}` },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setRole(null);
          } else {
            const newRole = (payload.new as any)?.role as AppRole;
            setRole(newRole ?? null);
          }
          setRoleLoaded(true);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [session?.user?.id]);

  const signOut = async () => {
    try {
      // Clear PIN session cache on logout
      const { clearPinSession } = await import("@/components/PinProtection");
      clearPinSession();
    } catch {}
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Logout error:", e);
    }
    setSession(null);
    setRole(null);
    setRoleLoaded(true);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, role, loading, authReady, roleLoaded, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

