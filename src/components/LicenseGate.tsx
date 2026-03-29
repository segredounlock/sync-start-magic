import { useState, useEffect, useRef, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Shield, AlertTriangle, KeyRound, Loader2, CheckCircle2, Clock, Lock, Info } from "lucide-react";
import { InstallWizard } from "@/components/InstallWizard";
import { isMasterEnvironment, getSystemConfigValue } from "@/utils/licenseConfig";
import { evaluateLicense } from "@/utils/licenseDates";
import { extractLicenseFromKey } from "@/utils/licenseDates";
import type { LicenseStateResult } from "@/utils/licenseDates";
import { useAuth } from "@/hooks/useAuth";

const LOCAL_INSTALL_FLAG = "mirror_install_completed";

type GateStatus = "checking" | "valid" | "denied" | "master" | "install" | "activate";

export function LicenseGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<GateStatus>("checking");
  const [licenseState, setLicenseState] = useState<LicenseStateResult | null>(null);
  const recheckRef = useRef<ReturnType<typeof setInterval>>();
  const { user, role, authReady, roleLoaded } = useAuth();

  const validate = async (mounted: { current: boolean }) => {
    try {
      if (isMasterEnvironment()) {
        if (mounted.current) setStatus("master");
        return;
      }

      let installCompleted = false;
      let masterAdmin = false;

      const { data: installStatus, error: installStatusError } = await supabase.rpc("get_installation_status");

      if (!installStatusError && installStatus?.length) {
        installCompleted = installStatus[0].install_completed === true;
        masterAdmin = installStatus[0].has_master_admin === true;
      } else {
        const localInstallCompleted = localStorage.getItem(LOCAL_INSTALL_FLAG) === "true";
        const [installCompletedValue, masterAdminValue] = await Promise.all([
          getSystemConfigValue(supabase, "install_completed"),
          getSystemConfigValue(supabase, "masterAdminId"),
        ]);

        installCompleted = installCompletedValue === "true" || localInstallCompleted;
        masterAdmin = !!masterAdminValue;
      }

      // Not installed at all → show install wizard
      if (!installCompleted && !masterAdmin) {
        if (mounted.current) setStatus("install");
        return;
      }

      // Installed → check license
      const [licenseKey, licenseStatus, startDate, endDate, graceDays] = await Promise.all([
        getSystemConfigValue(supabase, "license_key"),
        getSystemConfigValue(supabase, "license_status"),
        getSystemConfigValue(supabase, "license_start_date"),
        getSystemConfigValue(supabase, "license_end_date"),
        getSystemConfigValue(supabase, "license_grace_days"),
      ]);

      const result = evaluateLicense({
        licenseKey,
        licenseStatus,
        licenseStartDate: startDate,
        licenseEndDate: endDate,
        licenseGraceDays: graceDays,
      });

      if (mounted.current) {
        setLicenseState(result);
        if (result.valid) {
          setStatus("valid");
        } else if (result.code === "LICENSE_MISSING") {
          // No license yet → show activation screen (requires admin login)
          setStatus("activate");
        } else {
          setStatus("denied");
        }
      }
    } catch {
      if (mounted.current) {
        setStatus("denied");
        setLicenseState({
          valid: false,
          code: "LICENSE_MALFORMED",
          message: "Erro ao verificar licença. Tente recarregar.",
        });
      }
    }
  };

  useEffect(() => {
    const mounted = { current: true };
    validate(mounted);
    recheckRef.current = setInterval(() => validate(mounted), 60 * 60 * 1000);
    return () => {
      mounted.current = false;
      if (recheckRef.current) clearInterval(recheckRef.current);
    };
  }, []);

  // ─── Loading ───
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

  // ─── Install wizard ───
  if (status === "install") {
    return <InstallWizard onComplete={() => {
      localStorage.setItem(LOCAL_INSTALL_FLAG, "true");
      const mounted = { current: true };
      validate(mounted);
    }} />;
  }

  // ─── License Activation (installed but no license) ───
  if (status === "activate") {
    return (
      <LicenseActivation
        user={user}
        role={role}
        authReady={authReady}
        roleLoaded={roleLoaded}
        onActivated={() => {
          const mounted = { current: true };
          validate(mounted);
        }}
      />
    );
  }

  // ─── Denied ───
  if (status === "denied" && licenseState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full bg-card border border-destructive/30 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Sistema Bloqueado</h1>
          <p className="text-muted-foreground text-sm">{licenseState.message}</p>

          <div className="bg-muted/50 rounded-xl p-3 text-xs text-muted-foreground font-mono">
            Código: {licenseState.code}
          </div>

          {(licenseState.startDate || licenseState.endDate) && (
            <div className="bg-muted/50 rounded-xl p-4 space-y-2 text-left">
              {licenseState.status && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium text-foreground">{licenseState.status}</span>
                </div>
              )}
              {licenseState.startDate && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Válida de:</span>
                  <span className="font-medium text-foreground">{licenseState.startDate}</span>
                </div>
              )}
              {licenseState.endDate && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Válida até:</span>
                  <span className="font-medium text-foreground">{licenseState.endDate}</span>
                </div>
              )}
              {licenseState.graceDays !== undefined && licenseState.graceDays > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Carência:</span>
                  <span className="font-medium text-foreground">{licenseState.graceDays} dias</span>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2">
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

  // ─── Valid or Master ───
  return (
    <>
      {children}
      {status === "valid" && licenseState?.endDate && (
        <LicenseCountdown endDate={licenseState.endDate} graceDays={licenseState.graceDays || 0} />
      )}
    </>
  );
}

/* ─── License Activation Screen ─── */
function LicenseActivation({
  user,
  role,
  authReady,
  roleLoaded,
  onActivated,
}: {
  user: any;
  role: string | null;
  authReady: boolean;
  roleLoaded: boolean;
  onActivated: () => void;
}) {
  const [licenseKey, setLicenseKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const preview = licenseKey.trim() ? extractLicenseFromKey(licenseKey.trim()) : null;

  // Not logged in → redirect to login
  if (authReady && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Licença Necessária</h1>
          <p className="text-muted-foreground text-sm">
            Faça login como administrador para ativar a licença do sistema.
          </p>
          <button
            onClick={() => { window.location.href = "/login"; }}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  // Waiting for auth/role
  if (!authReady || !roleLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-primary mx-auto animate-spin" />
          <p className="text-muted-foreground text-sm">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Logged in but not admin
  if (role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Acesso Restrito</h1>
          <p className="text-muted-foreground text-sm">
            Apenas o administrador pode ativar a licença. Entre em contato com o admin do sistema.
          </p>
        </div>
      </div>
    );
  }

  const handleActivate = async () => {
    if (!licenseKey.trim()) {
      setError("Cole a chave de licença");
      return;
    }

    const extracted = extractLicenseFromKey(licenseKey.trim());
    if (!extracted.valid) {
      setError(extracted.error || "Chave inválida");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("Sessão expirada. Faça login novamente.");

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/init-mirror`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            license_key: licenseKey.trim(),
            license_status: "active",
            license_start_date: extracted.startDate,
            license_end_date: extracted.endDate,
            license_grace_days: extracted.graceDays,
            siteUrl: window.location.origin + "/",
          }),
        }
      );

      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error || "Falha ao salvar licença");

      localStorage.removeItem("license_validation_cache");
      localStorage.removeItem("license_crypto_proof");
      localStorage.removeItem("license_session");

      setSuccess(true);
      setTimeout(() => onActivated(), 1500);
    } catch (err: any) {
      setError(err.message || "Erro ao ativar licença");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Licença Ativada!</h1>
          <p className="text-muted-foreground text-sm">O sistema será desbloqueado em instantes...</p>
          <Loader2 className="w-6 h-6 text-primary mx-auto animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <KeyRound className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Ativar Licença</h1>
          <p className="text-muted-foreground text-sm">
            Cole a chave JWT fornecida pelo administrador master para desbloquear o sistema.
          </p>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5" /> Chave de Licença
          </label>
          <textarea
            value={licenseKey}
            onChange={(e) => setLicenseKey(e.target.value)}
            placeholder="Cole a chave JWT aqui..."
            rows={3}
            className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-xs resize-none"
            disabled={loading}
          />

          {preview?.valid && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Licença reconhecida
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                <div>
                  <span className="text-foreground font-medium">Início:</span>{" "}
                  {new Date(preview.startDate + "T00:00:00").toLocaleDateString("pt-BR")}
                </div>
                <div>
                  <span className="text-foreground font-medium">Expiração:</span>{" "}
                  {new Date(preview.endDate + "T00:00:00").toLocaleDateString("pt-BR")}
                </div>
                {preview.mirrorName && (
                  <div className="col-span-2">
                    <span className="text-foreground font-medium">Mirror:</span> {preview.mirrorName}
                  </div>
                )}
                {preview.graceDays > 0 && (
                  <div className="col-span-2">
                    <span className="text-foreground font-medium">Carência:</span> {preview.graceDays} dias
                  </div>
                )}
              </div>
            </div>
          )}

          {preview && !preview.valid && licenseKey.trim() && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-xs text-destructive">{preview.error}</p>
            </div>
          )}

          <div className="bg-muted/30 border border-border/50 rounded-xl p-3 flex items-start gap-2">
            <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground">
              A chave contém todas as informações (datas, permissões). 
              O sistema ficará bloqueado até a ativação.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-xs text-destructive">{error}</p>
          </div>
        )}

        <button
          onClick={handleActivate}
          disabled={loading || !licenseKey.trim() || !preview?.valid}
          className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
          {loading ? "Ativando..." : "Ativar Licença"}
        </button>
      </div>
    </div>
  );
}

/* ─── License Countdown ─── */
function LicenseCountdown({ endDate, graceDays }: { endDate: string; graceDays: number }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const end = new Date(endDate);
      end.setDate(end.getDate() + graceDays);
      end.setHours(23, 59, 59, 999);
      const diff = end.getTime() - now;
      if (diff <= 0) { setTimeLeft("Expirada"); return; }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${days}d ${hours}h ${mins}m`);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [endDate, graceDays]);

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-card/95 backdrop-blur border border-border rounded-xl px-3 py-2 shadow-lg flex items-center gap-2 text-xs">
      <Clock className="w-3.5 h-3.5 text-primary" />
      <span className="text-muted-foreground">Licença:</span>
      <span className="font-mono font-bold text-foreground">{timeLeft}</span>
    </div>
  );
}
