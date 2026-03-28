import { useState, useEffect, useRef, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Shield, AlertTriangle, KeyRound, Loader2, CheckCircle2 } from "lucide-react";

const CACHE_KEY = "license_validation_cache";
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours
const HEARTBEAT_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours

const MASTER_SERVER_URL = import.meta.env.VITE_SUPABASE_URL;

const MASTER_DOMAINS = ["recargasbrasill.com"];

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

async function callValidation(masterUrl: string, licenseKey: string) {
  const domain = window.location.hostname;
  const response = await fetch(`${masterUrl}/functions/v1/license-validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ license_key: licenseKey, domain }),
  });
  return await response.json();
}

/* ─── Activation Form (shown when no license is configured) ─── */
function LicenseActivationForm({ onActivated }: { onActivated: () => void }) {
  const [licenseKey, setLicenseKey] = useState("");
  const [masterUrl, setMasterUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleActivate = async () => {
    const key = licenseKey.trim();
    if (!key) { setError("Insira a chave de licença"); return; }

    setSaving(true);
    setError("");

    try {
      // Determine master URL
      const url = masterUrl.trim() || MASTER_SERVER_URL;

      // Validate BEFORE saving
      const result = await callValidation(url, key);

      if (!result.valid) {
        setError(result.reason || "Licença inválida. Verifique a chave e tente novamente.");
        setSaving(false);
        return;
      }

      // Save license_key to system_config (upsert)
      const { error: e1 } = await supabase
        .from("system_config")
        .upsert({ key: "license_key", value: key }, { onConflict: "key" });
      if (e1) throw e1;

      // Save master URL if provided
      if (masterUrl.trim()) {
        const { error: e2 } = await supabase
          .from("system_config")
          .upsert({ key: "license_master_url", value: url }, { onConflict: "key" });
        if (e2) throw e2;
      }

      // Cache successful validation
      setCache({
        valid: true,
        expires_at: result.expires_at,
        features: result.features,
        cached_at: Date.now(),
      });

      setSuccess(true);
      setTimeout(() => onActivated(), 1500);
    } catch (err: any) {
      setError(err.message || "Erro ao salvar licença");
    } finally {
      setSaving(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-card border border-primary/30 rounded-2xl p-8 text-center space-y-4 shadow-2xl">
          <CheckCircle2 className="w-16 h-16 text-primary mx-auto" />
          <h1 className="text-xl font-bold text-foreground">Licença Ativada!</h1>
          <p className="text-muted-foreground text-sm">Sistema sendo liberado...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <KeyRound className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Ativar Licença</h1>
          <p className="text-muted-foreground text-sm">
            Insira a chave de licença fornecida pelo administrador do sistema principal.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Chave de Licença *</label>
            <input
              type="text"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              placeholder="lic_xxxxxxxxxxxxxxxx"
              className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              URL do Servidor Principal
              <span className="text-muted-foreground font-normal ml-1">(opcional)</span>
            </label>
            <input
              type="url"
              value={masterUrl}
              onChange={(e) => setMasterUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              disabled={saving}
            />
            <p className="text-[11px] text-muted-foreground">
              Deixe em branco para usar o servidor padrão.
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-xs text-destructive">{error}</p>
            </div>
          )}

          <button
            onClick={handleActivate}
            disabled={saving || !licenseKey.trim()}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Validando...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Ativar Licença
              </>
            )}
          </button>
        </div>

        <p className="text-center text-[11px] text-muted-foreground">
          Entre em contato com o fornecedor do sistema para obter uma licença.
        </p>
      </div>
    </div>
  );
}

/* ─── Main Gate ─── */
export function LicenseGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<"checking" | "valid" | "invalid" | "no_license" | "master">("checking");
  const [reason, setReason] = useState("");
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval>>();

  const validate = async (mounted: { current: boolean }) => {
    try {
      // 1. Check if the LOGGED-IN user is the masterAdmin
      const { data: { user } } = await supabase.auth.getUser();

      const { data: masterConfig } = await supabase
        .from("system_config")
        .select("value")
        .eq("key", "masterAdminId")
        .maybeSingle();

      if (user && masterConfig?.value && user.id === masterConfig.value) {
        if (mounted.current) setStatus("master");
        return;
      }

      // 2. Get license key
      const { data: keyConfig } = await supabase
        .from("system_config")
        .select("value")
        .eq("key", "license_key")
        .maybeSingle();

      if (!keyConfig?.value) {
        // No license configured — show activation form
        if (mounted.current) setStatus("no_license");
        return;
      }

      // 3. Check cache
      const cached = getCache();
      if (cached?.valid) {
        if (mounted.current) {
          setStatus("valid");
          setExpiresAt(cached.expires_at || null);
        }
        backgroundValidate(mounted, keyConfig.value);
        return;
      }

      // 4. Get master URL
      const { data: masterUrlConfig } = await supabase
        .from("system_config")
        .select("value")
        .eq("key", "license_master_url")
        .maybeSingle();

      const masterUrl = masterUrlConfig?.value || MASTER_SERVER_URL;

      // 5. Validate against master
      const result = await callValidation(masterUrl, keyConfig.value);

      if (mounted.current) {
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
    } catch {
      const cached = getCache();
      if (cached?.valid) {
        if (mounted.current) {
          setStatus("valid");
          setExpiresAt(cached.expires_at || null);
        }
      } else {
        if (mounted.current) {
          setStatus("invalid");
          setReason("Erro ao validar licença. Verifique sua conexão.");
        }
      }
    }
  };

  const backgroundValidate = async (mounted: { current: boolean }, licenseKey: string) => {
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
        if (mounted.current) {
          setStatus("invalid");
          setReason(result.reason || "Licença inválida");
        }
      }
    } catch {}
  };

  useEffect(() => {
    const mounted = { current: true };
    validate(mounted);
    heartbeatRef.current = setInterval(() => validate(mounted), HEARTBEAT_INTERVAL);
    return () => {
      mounted.current = false;
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, []);

  // ─── Checking ───
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

  // ─── No license → show activation form ───
  if (status === "no_license") {
    return (
      <LicenseActivationForm
        onActivated={() => {
          setStatus("valid");
        }}
      />
    );
  }

  // ─── Invalid / expired ───
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
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStatus("no_license")}
              className="flex-1 py-3 bg-muted text-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Inserir Licença
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  // valid or master — render children
  return <>{children}</>;
}
