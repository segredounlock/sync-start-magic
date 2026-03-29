import { useState, useEffect, useRef, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Shield, AlertTriangle, KeyRound, Loader2, CheckCircle2, Clock, Calendar } from "lucide-react";
import { InstallWizard } from "@/components/InstallWizard";
import { isMasterEnvironment, getSystemConfigValue } from "@/utils/licenseConfig";
import { evaluateLicense } from "@/utils/licenseDates";
import type { LicenseStateResult } from "@/utils/licenseDates";

type GateStatus = "checking" | "valid" | "denied" | "master" | "install";

export function LicenseGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<GateStatus>("checking");
  const [licenseState, setLicenseState] = useState<LicenseStateResult | null>(null);
  const recheckRef = useRef<ReturnType<typeof setInterval>>();

  const validate = async (mounted: { current: boolean }) => {
    try {
      // Master environment bypass
      if (isMasterEnvironment()) {
        if (mounted.current) setStatus("master");
        return;
      }

      // Check install state
      const [installCompleted, masterAdmin] = await Promise.all([
        getSystemConfigValue(supabase, "install_completed"),
        getSystemConfigValue(supabase, "masterAdminId"),
      ]);

      if (installCompleted !== "true" && !masterAdmin) {
        if (mounted.current) setStatus("install");
        return;
      }

      // Load license config
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
        } else {
          // If no license at all and install not completed, show wizard
          if (result.code === "LICENSE_MISSING" && installCompleted !== "true") {
            setStatus("install");
          } else {
            setStatus("denied");
          }
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
    // Recheck every hour
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
    return <InstallWizard onComplete={() => setStatus("valid")} />;
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

          {/* License info when available */}
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
              onClick={() => {
                localStorage.removeItem("license_session");
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

/* ─── License Countdown ─── */
function LicenseCountdown({ endDate, graceDays }: { endDate: string; graceDays: number }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const end = new Date(endDate);
      // Add grace days
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
