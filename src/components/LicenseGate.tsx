import { useState, useEffect, useRef, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Shield, AlertTriangle, KeyRound, Loader2, CheckCircle2, Clock } from "lucide-react";
import { InstallWizard } from "@/components/InstallWizard";
import {
  MASTER_SUPABASE_URL,
  MASTER_PROJECT_URL,
  isMasterEnvironment,
  getSystemConfigValue,
  normalizeUrl,
} from "@/utils/licenseConfig";
import {
  validateMirrorConfig,
  isValidLicenseResponse,
} from "@/utils/licenseValidation";

const SESSION_KEY = "license_session";
const HEARTBEAT_INTERVAL = 55 * 60 * 1000; // 55 min

/* ─── Anti-tampering: signed local session ─── */
interface LocalSession {
  token: string;
  expires_at: string;
  session_expires: number;
  integrity: string;
  ts: number;
}

async function computeIntegrity(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const material = `${window.location.origin}::${navigator.userAgent}::license-gate-v2`;
  const keyData = await crypto.subtle.digest("SHA-256", encoder.encode(material));
  const key = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function saveSession(session: Omit<LocalSession, "integrity" | "ts">): Promise<void> {
  const ts = Date.now();
  const raw = JSON.stringify({ token: session.token, expires_at: session.expires_at, session_expires: session.session_expires, ts });
  const integrity = await computeIntegrity(raw);
  const full: LocalSession = { ...session, integrity, ts };
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(full)); } catch {}
}

async function loadSession(): Promise<LocalSession | null> {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session: LocalSession = JSON.parse(raw);

    const checkRaw = JSON.stringify({ token: session.token, expires_at: session.expires_at, session_expires: session.session_expires, ts: session.ts });
    const expected = await computeIntegrity(checkRaw);
    if (expected !== session.integrity) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }

    if (Date.now() / 1000 > session.session_expires) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }

    return session;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

/* ─── License Expiration Countdown ─── */
function LicenseCountdown({ expiresAt }: { expiresAt: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date().getTime();
      const exp = new Date(expiresAt).getTime();
      const diff = exp - now;
      if (diff <= 0) { setTimeLeft("Expirada"); return; }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${days}d ${hours}h ${mins}m`);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-card/95 backdrop-blur border border-border rounded-xl px-3 py-2 shadow-lg flex items-center gap-2 text-xs">
      <Clock className="w-3.5 h-3.5 text-primary" />
      <span className="text-muted-foreground">Licença:</span>
      <span className="font-mono font-bold text-foreground">{timeLeft}</span>
    </div>
  );
}

/* ─── Server-side validation call ─── */
async function callServerCheck(domain: string): Promise<{
  valid: boolean;
  reason?: string;
  expires_at?: string;
  session_token?: string;
  session_expires?: number;
  features?: string[];
  code?: string;
}> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const resp = await fetch(`${supabaseUrl}/functions/v1/license-check-server`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return resp.json();
  } catch (err: any) {
    clearTimeout(timeout);
    // Fail closed: network error = invalid
    throw new Error("Falha na comunicação com o servidor de licenças.");
  }
}

/* ─── Error states ─── */
type LicenseStatus =
  | "checking"
  | "valid"
  | "invalid"
  | "no_license"
  | "master"
  | "install"
  | "config_error";

interface LicenseError {
  code: string;
  message: string;
}

/* ─── Main Gate ─── */
export function LicenseGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<LicenseStatus>("checking");
  const [licenseError, setLicenseError] = useState<LicenseError>({ code: "", message: "" });
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval>>();

  const validate = async (mounted: { current: boolean }) => {
    try {
      // 0. Check if running on master environment — bypass everything
      if (isMasterEnvironment()) {
        if (mounted.current) setStatus("master");
        return;
      }

      // 1. Check if installation has been completed
      const { data: installConfig } = await supabase
        .from("system_config")
        .select("value")
        .eq("key", "install_completed")
        .maybeSingle();

      const { data: masterConfig } = await supabase
        .from("system_config")
        .select("value")
        .eq("key", "masterAdminId")
        .maybeSingle();

      // Fresh install → show wizard
      if (!installConfig?.value && !masterConfig?.value) {
        if (mounted.current) setStatus("install");
        return;
      }

      // 2. Load and validate mirror configuration
      let storedMasterUrl: string | null = null;
      let storedMasterProjectUrl: string | null = null;
      try {
        storedMasterUrl = await getSystemConfigValue(supabase, "license_master_url");
        storedMasterProjectUrl = await getSystemConfigValue(supabase, "masterProjectUrl");
      } catch {
        // If we can't read config, fail closed
      }

      const configCheck = validateMirrorConfig({
        licenseMasterUrl: storedMasterUrl,
        masterProjectUrl: storedMasterProjectUrl,
        currentSupabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      });

      if (!configCheck.valid) {
        // If install was completed but config is bad, show config error
        if (installConfig?.value === "true") {
          if (mounted.current) {
            setStatus("config_error");
            setLicenseError({ code: configCheck.errorCode, message: configCheck.message });
          }
          return;
        }
        // Otherwise show install wizard
        if (mounted.current) setStatus("install");
        return;
      }

      // 3. Check local session (anti-tampered)
      const session = await loadSession();
      if (session) {
        if (mounted.current) {
          setStatus("valid");
          setExpiresAt(session.expires_at);
        }
        backgroundValidate(mounted);
        return;
      }

      // 4. No valid session → validate server-side
      const result = await callServerCheck(window.location.hostname.toLowerCase());

      if (!result.valid) {
        if (result.code === "NO_LICENSE") {
          if (installConfig?.value === "true") {
            if (mounted.current) setStatus("no_license");
          } else {
            if (mounted.current) setStatus("install");
          }
        } else {
          if (mounted.current) {
            setStatus("invalid");
            setLicenseError({
              code: result.code || "LICENSE_VALIDATION_FAILED",
              message: result.reason || "Licença inválida",
            });
          }
        }
        return;
      }

      // 5. Validate response structure
      if (!result.session_token || !result.expires_at || !result.session_expires) {
        if (mounted.current) {
          setStatus("invalid");
          setLicenseError({
            code: "LICENSE_RESPONSE_INCOMPLETE",
            message: "Resposta de validação incompleta do servidor.",
          });
        }
        return;
      }

      // 6. Valid → save signed session
      await saveSession({
        token: result.session_token,
        expires_at: result.expires_at,
        session_expires: result.session_expires,
      });

      if (mounted.current) {
        setStatus("valid");
        setExpiresAt(result.expires_at);
      }
    } catch (err: any) {
      // On error, check local session as fallback
      const session = await loadSession();
      if (session) {
        if (mounted.current) {
          setStatus("valid");
          setExpiresAt(session.expires_at);
        }
      } else {
        // Fail closed
        if (mounted.current) {
          setStatus("invalid");
          setLicenseError({
            code: "MASTER_SERVER_UNREACHABLE",
            message: err?.message || "Erro ao validar licença. Verifique sua conexão.",
          });
        }
      }
    }
  };

  const backgroundValidate = async (mounted: { current: boolean }) => {
    try {
      const hostname = window.location.hostname.toLowerCase();
      const result = await callServerCheck(hostname);

      if (result.valid && result.session_token && result.expires_at && result.session_expires) {
        await saveSession({
          token: result.session_token,
          expires_at: result.expires_at,
          session_expires: result.session_expires,
        });
        if (mounted.current) setExpiresAt(result.expires_at);
      } else if (!result.valid) {
        localStorage.removeItem(SESSION_KEY);
        if (mounted.current) {
          setStatus("invalid");
          setLicenseError({
            code: result.code || "LICENSE_VALIDATION_FAILED",
            message: result.reason || "Licença inválida",
          });
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
          <p className="text-muted-foreground text-sm">Verificando sistema...</p>
        </div>
      </div>
    );
  }

  // ─── Fresh install → show wizard ───
  if (status === "install") {
    return <InstallWizard onComplete={() => setStatus("valid")} />;
  }

  // ─── Config error (mirror misconfigured) ───
  if (status === "config_error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full bg-card border border-destructive/30 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Erro de Configuração</h1>
          <p className="text-muted-foreground text-sm">{licenseError.message}</p>
          <div className="bg-muted/50 rounded-xl p-3 text-xs text-muted-foreground font-mono">
            Código: {licenseError.code}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                localStorage.removeItem(SESSION_KEY);
                setStatus("install");
              }}
              className="flex-1 py-3 bg-muted text-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Reinstalar
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

  // ─── No license (post-install) → show activation form ───
  if (status === "no_license") {
    return <LicenseActivationForm onActivated={() => { localStorage.removeItem(SESSION_KEY); setStatus("checking"); }} />;
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
          <p className="text-muted-foreground text-sm">{licenseError.message}</p>
          {licenseError.code && (
            <div className="bg-muted/50 rounded-xl p-3 text-xs text-muted-foreground font-mono">
              Código: {licenseError.code}
            </div>
          )}
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
  return (
    <>
      {children}
      {status === "valid" && expiresAt && <LicenseCountdown expiresAt={expiresAt} />}
    </>
  );
}

/* ─── Activation Form ─── */
function LicenseActivationForm({ onActivated }: { onActivated: () => void }) {
  const [licenseKey, setLicenseKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleActivate = async () => {
    const key = licenseKey.trim();
    if (!key) { setError("Insira a chave de licença"); return; }

    setSaving(true);
    setError("");

    try {
      const url = MASTER_SUPABASE_URL;

      // Validate against master
      const domain = window.location.hostname;
      const response = await fetch(`${url}/functions/v1/license-validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ license_key: key, domain }),
      });
      const result = await response.json();

      if (!result.valid) {
        setError(result.reason || "Licença inválida. Verifique a chave e tente novamente.");
        setSaving(false);
        return;
      }

      // Save license key + master config atomically
      const { error: e1 } = await supabase
        .from("system_config")
        .upsert([
          { key: "license_key", value: key },
          { key: "license_master_url", value: url },
          { key: "masterProjectUrl", value: MASTER_PROJECT_URL },
          { key: "license_validated_at", value: new Date().toISOString() },
          { key: "license_expires_at", value: result.expires_at },
          { key: "license_status", value: "valid" },
        ], { onConflict: "key" });
      if (e1) throw e1;

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
              placeholder="Cole a chave aqui..."
              className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
              disabled={saving}
            />
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
      </div>
    </div>
  );
}
