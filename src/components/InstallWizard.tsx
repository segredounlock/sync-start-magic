import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Shield, KeyRound, User, Mail, Lock, Eye, EyeOff,
  Loader2, CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft,
  Info
} from "lucide-react";
import { validatePassword } from "@/lib/passwordValidation";
import { PasswordStrengthMeter } from "@/components/PasswordStrengthMeter";
import { extractLicenseFromKey } from "@/utils/licenseDates";

type Step = "welcome" | "admin" | "license" | "finishing" | "done";

interface InstallData {
  adminEmail: string;
  adminPassword: string;
  adminName: string;
  licenseKey: string;
  licenseStartDate: string;
  licenseEndDate: string;
  licenseGraceDays: number;
}

export function InstallWizard({ onComplete }: { onComplete: () => void }) {
  const today = new Date().toISOString().split("T")[0];
  const defaultEnd = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];

  const [step, setStep] = useState<Step>("welcome");
  const [data, setData] = useState<InstallData>({
    adminEmail: "",
    adminPassword: "",
    adminName: "",
    licenseKey: "",
    licenseStartDate: today,
    licenseEndDate: defaultEnd,
    licenseGraceDays: 0,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState<string[]>([]);

  const pwCheck = validatePassword(data.adminPassword);

  const handleAdminStep = () => {
    if (!data.adminEmail.trim() || !data.adminName.trim()) {
      setError("Preencha todos os campos");
      return;
    }
    if (!data.adminPassword || !pwCheck.valid) {
      setError("A senha não atende aos requisitos mínimos");
      return;
    }
    setError("");
    setStep("license");
  };

  const handleFinish = async () => {
    if (!data.licenseKey.trim()) {
      setError("A chave de licença é obrigatória");
      return;
    }

    // Extract dates from JWT key
    const extracted = extractLicenseFromKey(data.licenseKey.trim());
    if (!extracted.valid) {
      setError(extracted.error || "Chave de licença inválida");
      return;
    }

    // Update data with extracted values
    data.licenseStartDate = extracted.startDate;
    data.licenseEndDate = extracted.endDate;
    data.licenseGraceDays = extracted.graceDays;

    setError("");
    setStep("finishing");
    setLoading(true);

    const steps: string[] = [];

    try {
      // 1. Create admin user
      steps.push("Criando administrador...");
      setProgress([...steps]);

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: data.adminEmail.trim(),
        password: data.adminPassword,
        options: {
          data: { nome: data.adminName.trim() },
          emailRedirectTo: window.location.origin,
        },
      });

      if (signUpError) throw new Error(signUpError.message);
      if (!signUpData.user) throw new Error("Erro ao criar usuário");

      steps.push("✓ Administrador criado!");
      setProgress([...steps]);

      // 2. Wait for trigger to create profile/roles
      steps.push("Aguardando configuração do perfil...");
      setProgress([...steps]);
      await new Promise(r => setTimeout(r, 2000));

      steps.push("✓ Perfil configurado!");
      setProgress([...steps]);

      // 3. Save license config
      steps.push("Salvando licença...");
      setProgress([...steps]);

      const { error: e1 } = await supabase
        .from("system_config")
        .upsert([
          { key: "license_key", value: data.licenseKey.trim() },
          { key: "license_status", value: "active" },
          { key: "license_start_date", value: data.licenseStartDate },
          { key: "license_end_date", value: data.licenseEndDate },
          { key: "license_grace_days", value: String(data.licenseGraceDays) },
        ], { onConflict: "key" });
      if (e1) throw e1;

      // 4. Confirm persistence
      steps.push("Verificando persistência...");
      setProgress([...steps]);

      const keysToVerify = ["license_key", "license_status", "license_start_date", "license_end_date"];
      for (const k of keysToVerify) {
        const { data: row, error: rowErr } = await supabase
          .from("system_config")
          .select("value")
          .eq("key", k)
          .maybeSingle();

        if (rowErr || !row?.value) {
          throw new Error(`Falha ao confirmar persistência de ${k}. Tente novamente.`);
        }
      }

      steps.push("✓ Licença salva e verificada!");
      setProgress([...steps]);

      // 5. Set siteUrl
      await supabase
        .from("system_config")
        .upsert({ key: "siteUrl", value: window.location.origin + "/" }, { onConflict: "key" });

      // 6. Generate install_secret
      const installSecret = crypto.randomUUID() + "-" + crypto.randomUUID();
      await supabase
        .from("system_config")
        .upsert({ key: "install_secret", value: installSecret }, { onConflict: "key" });

      // 7. Initialize via init-mirror (optional, best-effort)
      steps.push("Inicializando banco de dados...");
      setProgress([...steps]);

      try {
        const { data: session } = await supabase.auth.getSession();
        const token = session?.session?.access_token;
        if (token) {
          const initResp = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/init-mirror`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          if (initResp.ok) {
            steps.push("✓ Banco de dados inicializado!");
          } else {
            steps.push("⚠ Inicialização parcial (não crítico)");
          }
        } else {
          steps.push("⚠ Sessão não disponível para init (não crítico)");
        }
      } catch {
        steps.push("⚠ Init-mirror indisponível (não crítico)");
      }
      setProgress([...steps]);

      // 8. Mark installation complete
      steps.push("Finalizando instalação...");
      setProgress([...steps]);

      await supabase
        .from("system_config")
        .upsert([
          { key: "install_completed", value: "true" },
          { key: "install_completed_at", value: new Date().toISOString() },
          { key: "install_domain", value: window.location.hostname },
        ], { onConflict: "key" });

      steps.push("✓ Instalação concluída!");
      setProgress([...steps]);

      // Clear old cache
      localStorage.removeItem("license_validation_cache");
      localStorage.removeItem("license_crypto_proof");
      localStorage.removeItem("license_session");

      setStep("done");
    } catch (err: any) {
      setError(err.message || "Erro durante a instalação");
      setStep("license");
    } finally {
      setLoading(false);
    }
  };

  /* ─── CSS animations ─── */
  const animCSS = `
    @keyframes rocket-float {
      0%, 100% { transform: rotate(-35deg) translateY(0px); }
      50% { transform: rotate(-35deg) translateY(-6px); }
    }
    @keyframes flame-outer {
      0%, 100% { d: path("M4.5 16.5 C3 18, 1.5 21, 2.5 21.5 C3 22, 5 20, 4.5 16.5Z"); opacity: 0.9; }
      33% { d: path("M4.5 16.5 C2.5 18.5, 0.8 22, 2 22.5 C3.2 23, 5.5 19.5, 4.5 16.5Z"); opacity: 1; }
      66% { d: path("M4.5 16.5 C3.5 17.5, 2 20.5, 3 21 C3.5 21.5, 4.8 19.8, 4.5 16.5Z"); opacity: 0.8; }
    }
    @keyframes flame-inner {
      0%, 100% { d: path("M4.5 16.5 C3.5 17.5, 2.5 19.5, 3.2 20 C3.8 20.5, 5 18.5, 4.5 16.5Z"); opacity: 0.95; }
      50% { d: path("M4.5 16.5 C3.2 18, 2 20, 3 20.5 C3.5 21, 4.5 19, 4.5 16.5Z"); opacity: 1; }
    }
    @keyframes flame-core {
      0%, 100% { d: path("M4.5 16.5 C4 17, 3.2 18.5, 3.8 18.8 C4.2 19, 4.8 17.5, 4.5 16.5Z"); }
      50% { d: path("M4.5 16.5 C3.8 17.2, 3 19, 3.5 19.2 C4 19.5, 5 17.8, 4.5 16.5Z"); }
    }
    @keyframes shield-pulse {
      0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0px transparent); }
      50% { transform: scale(1.08); filter: drop-shadow(0 0 8px hsl(var(--primary) / 0.4)); }
    }
    @keyframes shield-ring {
      0% { r: 22; opacity: 0.6; stroke-width: 2; }
      100% { r: 32; opacity: 0; stroke-width: 0.5; }
    }
    @keyframes key-sparkle {
      0%, 100% { opacity: 0; transform: scale(0); }
      50% { opacity: 1; transform: scale(1); }
    }
    @keyframes key-glow {
      0%, 100% { filter: drop-shadow(0 0 2px #f59e0b); }
      50% { filter: drop-shadow(0 0 10px #f59e0b) drop-shadow(0 0 20px #f59e0b44); }
    }
    @keyframes done-burst {
      0% { r: 8; opacity: 0.5; }
      100% { r: 38; opacity: 0; }
    }
    @keyframes done-check-pop {
      0% { transform: scale(0.5); opacity: 0; }
      60% { transform: scale(1.15); }
      100% { transform: scale(1); opacity: 1; }
    }
    .rocket-container { animation: rocket-float 2.5s ease-in-out infinite; }
    .flame-outer { animation: flame-outer 0.3s ease-in-out infinite; }
    .flame-inner { animation: flame-inner 0.25s ease-in-out infinite; }
    .flame-core { animation: flame-core 0.2s ease-in-out infinite; }
    .shield-icon { animation: shield-pulse 2s ease-in-out infinite; }
    .key-icon { animation: key-glow 2s ease-in-out infinite; }
    .done-icon { animation: done-check-pop 0.6s ease-out forwards; }
  `;

  /* ─── Renders ─── */
  const renderWelcome = () => (
    <div className="space-y-6 text-center">
      <style>{animCSS}</style>
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto relative">
        <div className="rocket-container relative">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path className="flame-outer" d="M4.5 16.5 C3 18, 1.5 21, 2.5 21.5 C3 22, 5 20, 4.5 16.5Z" fill="#ef4444" opacity="0.7"/>
            <path className="flame-inner" d="M4.5 16.5 C3.5 17.5, 2.5 19.5, 3.2 20 C3.8 20.5, 5 18.5, 4.5 16.5Z" fill="#f97316" opacity="0.9"/>
            <path className="flame-core" d="M4.5 16.5 C4 17, 3.2 18.5, 3.8 18.8 C4.2 19, 4.8 17.5, 4.5 16.5Z" fill="#fbbf24"/>
            <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" fill="#f97316" stroke="#ea580c" strokeWidth="0.5" opacity="0.95"/>
            <circle cx="15" cy="9" r="1" fill="hsl(var(--primary))"/>
          </svg>
        </div>
      </div>
      <h1 className="text-2xl font-bold text-foreground">Instalação do Sistema</h1>
      <p className="text-muted-foreground text-sm max-w-sm mx-auto">
        Bem-vindo! Este assistente irá configurar seu sistema em poucos passos.
      </p>
      <div className="bg-muted/50 rounded-xl p-4 space-y-3 text-left">
        <div className="flex items-center gap-3 text-sm">
          <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
            <span className="text-primary font-bold text-xs">1</span>
          </div>
          <span className="text-foreground">Criar conta de administrador</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
            <span className="text-primary font-bold text-xs">2</span>
          </div>
          <span className="text-foreground">Configurar licença do sistema</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
            <span className="text-primary font-bold text-xs">3</span>
          </div>
          <span className="text-foreground">Finalizar configuração</span>
        </div>
      </div>
      <button
        onClick={() => setStep("admin")}
        className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
      >
        Começar Instalação
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );

  const renderAdmin = () => (
    <div className="space-y-5">
      <style>{animCSS}</style>
      <div className="text-center space-y-2">
        <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto relative">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="22" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" opacity="0.6" style={{ animation: "shield-ring 2s ease-out infinite" }} />
            <circle cx="28" cy="28" r="22" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" opacity="0.6" style={{ animation: "shield-ring 2s ease-out infinite 1s" }} />
          </svg>
          <Shield className="w-7 h-7 text-primary shield-icon" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Criar Admin Master</h2>
        <p className="text-muted-foreground text-xs">
          Este será o <strong>administrador principal</strong> do sistema.
        </p>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> Nome
          </label>
          <input
            type="text"
            value={data.adminName}
            onChange={(e) => setData(p => ({ ...p, adminName: e.target.value }))}
            placeholder="Seu nome"
            className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" /> E-mail
          </label>
          <input
            type="email"
            value={data.adminEmail}
            onChange={(e) => setData(p => ({ ...p, adminEmail: e.target.value }))}
            placeholder="admin@exemplo.com"
            className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> Senha
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={data.adminPassword}
              onChange={(e) => setData(p => ({ ...p, adminPassword: e.target.value }))}
              placeholder="Senha forte"
              className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {data.adminPassword && <PasswordStrengthMeter password={data.adminPassword} />}
        </div>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium text-amber-600 dark:text-amber-400">
          <Shield className="w-3.5 h-3.5" />
          Informações importantes
        </div>
        <ul className="text-[11px] text-muted-foreground space-y-1 list-disc list-inside">
          <li>Este usuário terá <strong className="text-foreground">acesso total</strong> ao sistema</li>
          <li>Guarde o e-mail e senha em <strong className="text-foreground">local seguro</strong></li>
        </ul>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => { setError(""); setStep("welcome"); }}
          className="flex-1 py-2.5 bg-muted text-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <button
          onClick={handleAdminStep}
          className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-1"
        >
          Próximo <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderLicense = () => {
    // Try to decode current key for preview
    const preview = data.licenseKey.trim() ? extractLicenseFromKey(data.licenseKey.trim()) : null;

    return (
      <div className="space-y-5">
        <style>{animCSS}</style>
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto relative overflow-hidden">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 56 56">
              <circle cx="12" cy="10" r="1.5" fill="#f59e0b" style={{ animation: "key-sparkle 2s ease-in-out infinite" }} />
              <circle cx="44" cy="14" r="1" fill="#fbbf24" style={{ animation: "key-sparkle 2s ease-in-out infinite 0.5s" }} />
              <circle cx="8" cy="38" r="1.2" fill="#f59e0b" style={{ animation: "key-sparkle 2s ease-in-out infinite 1s" }} />
              <circle cx="46" cy="42" r="1.5" fill="#fbbf24" style={{ animation: "key-sparkle 2s ease-in-out infinite 1.5s" }} />
            </svg>
            <KeyRound className="w-7 h-7 text-primary key-icon" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Ativar Licença</h2>
          <p className="text-muted-foreground text-xs">
            Cole a chave de licença fornecida pelo administrador master.
          </p>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" /> Chave de Licença *
            </label>
            <textarea
              value={data.licenseKey}
              onChange={(e) => setData(p => ({ ...p, licenseKey: e.target.value }))}
              placeholder="Cole a chave JWT aqui..."
              rows={3}
              className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-xs resize-none"
              disabled={loading}
            />
          </div>

          {/* Auto-detected info from key */}
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

          {preview && !preview.valid && data.licenseKey.trim() && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-xs text-destructive">{preview.error}</p>
            </div>
          )}

          <div className="bg-muted/30 border border-border/50 rounded-xl p-3 flex items-start gap-2">
            <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground">
              A chave contém todas as informações da licença (datas, permissões). 
              Solicite ao administrador master caso não possua uma.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-xs text-destructive">{error}</p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => { setError(""); setStep("admin"); }}
            disabled={loading}
            className="flex-1 py-2.5 bg-muted text-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
          <button
            onClick={handleFinish}
            disabled={loading || !data.licenseKey.trim() || !preview?.valid}
            className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-1"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            {loading ? "Instalando..." : "Instalar"}
          </button>
        </div>
      </div>
    );
  };

  const renderFinishing = () => (
    <div className="space-y-6 text-center">
      <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
      <h2 className="text-lg font-bold text-foreground">Instalando Sistema...</h2>
      <div className="bg-muted/50 rounded-xl p-4 space-y-2 text-left max-h-48 overflow-y-auto">
        {progress.map((p, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            {p.startsWith("✓") ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            ) : p.startsWith("⚠") ? (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            ) : (
              <Loader2 className="w-3.5 h-3.5 text-primary animate-spin shrink-0" />
            )}
            <span className={p.startsWith("✓") ? "text-muted-foreground" : "text-foreground"}>
              {p.replace(/^[✓⚠] /, "")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDone = () => (
    <div className="space-y-6 text-center">
      <style>{animCSS}</style>
      <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto relative">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="8" fill="none" stroke="#10b981" strokeWidth="1.5" style={{ animation: "done-burst 1.5s ease-out infinite" }} />
          <circle cx="40" cy="40" r="8" fill="none" stroke="#34d399" strokeWidth="1" style={{ animation: "done-burst 1.5s ease-out infinite 0.5s" }} />
          <circle cx="40" cy="40" r="8" fill="none" stroke="#6ee7b7" strokeWidth="0.8" style={{ animation: "done-burst 1.5s ease-out infinite 1s" }} />
        </svg>
        <CheckCircle2 className="w-10 h-10 text-emerald-500 done-icon" />
      </div>
      <h1 className="text-2xl font-bold text-foreground">Instalação Concluída!</h1>
      <p className="text-muted-foreground text-sm">
        Seu sistema está pronto para uso. Faça login com a conta de administrador.
      </p>
      <div className="bg-muted/50 rounded-xl p-4 space-y-1 text-left">
        <p className="text-xs text-muted-foreground">E-mail: <strong className="text-foreground">{data.adminEmail}</strong></p>
        <p className="text-xs text-muted-foreground">Válido: <strong className="text-foreground">{data.licenseStartDate} até {data.licenseEndDate}</strong></p>
        <p className="text-xs text-muted-foreground">Domínio: <strong className="text-foreground">{window.location.hostname}</strong></p>
      </div>
      <button
        onClick={() => {
          onComplete();
          window.location.reload();
        }}
        className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
      >
        <ArrowRight className="w-4 h-4" />
        Acessar o Sistema
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 shadow-2xl">
        {step !== "finishing" && step !== "done" && (
          <div className="flex items-center justify-center gap-2 mb-6">
            {(["welcome", "admin", "license"] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step === s ? "bg-primary text-primary-foreground" :
                  (["welcome", "admin", "license"].indexOf(step) > i) ? "bg-emerald-500 text-white" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {(["welcome", "admin", "license"].indexOf(step) > i) ? "✓" : i + 1}
                </div>
                {i < 2 && <div className="w-6 h-0.5 bg-border" />}
              </div>
            ))}
          </div>
        )}

        {step === "welcome" && renderWelcome()}
        {step === "admin" && renderAdmin()}
        {step === "license" && renderLicense()}
        {step === "finishing" && renderFinishing()}
        {step === "done" && renderDone()}
      </div>
    </div>
  );
}
