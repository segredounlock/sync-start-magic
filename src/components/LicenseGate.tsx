import { useState, useEffect, useRef, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Shield, AlertTriangle, KeyRound } from "lucide-react";

const CACHE_KEY = "license_validation_cache";
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours
const HEARTBEAT_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours

// The master server URL — mirrors call THIS to validate
// This must point to the ORIGINAL server, not the mirror's own backend
const MASTER_SERVER_URL = import.meta.env.VITE_SUPABASE_URL;

interface CachedValidation {
  valid: boolean;
  expires_at?: string;
  features?: string[];
  cached_at: number;
}

function getCache(): CachedValidation | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data: CachedValidation = JSON.parse(raw);
    if (Date.now() - data.cached_at > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCache(data: CachedValidation) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {}
}

export function LicenseGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<"checking" | "valid" | "invalid" | "master">("checking");
  const [reason, setReason] = useState("");
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    let mounted = true;

    const validate = async () => {
      try {
        // 1. Check if the LOGGED-IN user is the masterAdmin
        // This is more secure than checking if license_key is absent
        const { data: { user } } = await supabase.auth.getUser();
        
        const { data: masterConfig } = await supabase
          .from("system_config")
          .select("value")
          .eq("key", "masterAdminId")
          .maybeSingle();

        // Only bypass if the CURRENT user is the masterAdmin
        // On mirrors, even though a masterAdmin exists locally,
        // they won't match the original server's masterAdmin
        if (user && masterConfig?.value && user.id === masterConfig.value) {
          // Current user IS the master admin — bypass license check
          if (mounted) setStatus("master");
          return;
        }

        // 2. Get the license key from system_config
        const { data: keyConfig } = await supabase
          .from("system_config")
          .select("value")
          .eq("key", "license_key")
          .maybeSingle();

        if (!keyConfig?.value) {
          if (mounted) {
            setStatus("invalid");
            setReason("Nenhuma licença configurada. Entre em contato com o administrador.");
          }
          return;
        }

        // 3. Check cache first
        const cached = getCache();
        if (cached?.valid) {
          if (mounted) {
            setStatus("valid");
            setExpiresAt(cached.expires_at || null);
          }
          // Still do a background revalidation
          backgroundValidate(keyConfig.value);
          return;
        }

        // 4. Get the master server URL from system_config
        const { data: masterUrlConfig } = await supabase
          .from("system_config")
          .select("value")
          .eq("key", "license_master_url")
          .maybeSingle();

        const masterUrl = masterUrlConfig?.value || MASTER_SERVER_URL;

        // 5. Validate against master server
        const result = await callValidation(masterUrl, keyConfig.value);

        if (mounted) {
          if (result.valid) {
            setStatus("valid");
            setExpiresAt(result.expires_at || null);
            setCache({ valid: true, expires_at: result.expires_at, features: result.features, cached_at: Date.now() });
          } else {
            setStatus("invalid");
            setReason(result.reason || "Licença inválida");
            setCache({ valid: false, cached_at: Date.now() });
          }
        }
      } catch (err) {
        // On network error, if we have a valid cache, allow through
        const cached = getCache();
        if (cached?.valid) {
          if (mounted) {
            setStatus("valid");
            setExpiresAt(cached.expires_at || null);
          }
        } else {
          if (mounted) {
            setStatus("invalid");
            setReason("Erro ao validar licença. Verifique sua conexão.");
          }
        }
      }
    };

    const backgroundValidate = async (licenseKey: string) => {
      try {
        const { data: masterUrlConfig } = await supabase
          .from("system_config")
          .select("value")
          .eq("key", "license_master_url")
          .maybeSingle();

        const masterUrl = masterUrlConfig?.value || MASTER_SERVER_URL;
        const result = await callValidation(masterUrl, licenseKey);

        if (result.valid) {
          setCache({ valid: true, expires_at: result.expires_at, features: result.features, cached_at: Date.now() });
        } else {
          localStorage.removeItem(CACHE_KEY);
          if (mounted) {
            setStatus("invalid");
            setReason(result.reason || "Licença inválida");
          }
        }
      } catch {}
    };

    validate();

    // Heartbeat
    heartbeatRef.current = setInterval(validate, HEARTBEAT_INTERVAL);

    return () => {
      mounted = false;
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, []);

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Shield className="w-12 h-12 text-primary mx-auto animate-pulse" />
          <p className="text-muted-foreground text-sm">Verificando licença...</p>
        </div>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full bg-card border border-destructive/30 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Sistema Bloqueado</h1>
          <p className="text-muted-foreground text-sm">{reason}</p>
          <div className="bg-muted/50 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground">
              <KeyRound className="w-4 h-4" />
              <span>Licença necessária para operar</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Entre em contato com o fornecedor do sistema para obter uma licença válida.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // valid or master — render children
  return <>{children}</>;
}

async function callValidation(masterUrl: string, licenseKey: string) {
  const domain = window.location.hostname;

  const response = await fetch(`${masterUrl}/functions/v1/license-validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ license_key: licenseKey, domain }),
  });

  return await response.json();
}
