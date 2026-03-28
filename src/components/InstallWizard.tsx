import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Shield, KeyRound, User, Mail, Lock, Eye, EyeOff,
  Loader2, CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft,
  Server, Rocket, Clock
} from "lucide-react";
import { validatePassword } from "@/lib/passwordValidation";
import { PasswordStrengthMeter } from "@/components/PasswordStrengthMeter";

const MASTER_SERVER_URL = import.meta.env.VITE_SUPABASE_URL;

type Step = "welcome" | "admin" | "license" | "finishing" | "done";

interface InstallData {
  adminEmail: string;
  adminPassword: string;
  adminName: string;
  licenseKey: string;
  masterUrl: string;
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

export function InstallWizard({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<Step>("welcome");
  const [data, setData] = useState<InstallData>({
    adminEmail: "",
    adminPassword: "",
    adminName: "",
    licenseKey: "",
    masterUrl: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState<string[]>([]);

  const pwCheck = validatePassword(data.adminPassword);

  /* ─── Step handlers ─── */
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

    setError("");
    setStep("finishing");
    setLoading(true);

    const masterUrl = data.masterUrl.trim() || MASTER_SERVER_URL;
    const steps: string[] = [];

    try {
      // 1. Validate license FIRST
      steps.push("Validando licença no servidor principal...");
      setProgress([...steps]);

      const licResult = await callValidation(masterUrl, data.licenseKey.trim());
      if (!licResult.valid) {
        setError(licResult.reason || "Licença inválida");
        setStep("license");
        setLoading(false);
        return;
      }

      steps.push("✓ Licença válida!");
      setProgress([...steps]);

      // 2. Create admin user
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

      // 3. Save license to system_config
      steps.push("Salvando licença...");
      setProgress([...steps]);

      // Wait a moment for the trigger to create the profile/roles
      await new Promise(r => setTimeout(r, 2000));

      const { error: e1 } = await supabase
        .from("system_config")
        .upsert({ key: "license_key", value: data.licenseKey.trim() }, { onConflict: "key" });
      if (e1) throw e1;

      if (data.masterUrl.trim()) {
        await supabase
          .from("system_config")
          .upsert({ key: "license_master_url", value: masterUrl }, { onConflict: "key" });
      }

      steps.push("✓ Licença salva!");
      setProgress([...steps]);

      // 4. Create local crypto proof
      steps.push("Gerando prova criptográfica local...");
      setProgress([...steps]);

      const proof = await createLocalLicenseProof(licResult.expires_at, data.licenseKey.trim());
      localStorage.setItem("license_crypto_proof", proof);

      // Also save validated_at and expires_at in system_config for server-side tracking
      await supabase
        .from("system_config")
        .upsert({ key: "license_validated_at", value: new Date().toISOString() }, { onConflict: "key" });
      await supabase
        .from("system_config")
        .upsert({ key: "license_expires_at", value: licResult.expires_at }, { onConflict: "key" });

      steps.push("✓ Prova criptográfica gerada!");
      setProgress([...steps]);

      // 5. Mark installation complete
      steps.push("Finalizando instalação...");
      setProgress([...steps]);

      await supabase
        .from("system_config")
        .upsert({ key: "install_completed", value: "true" }, { onConflict: "key" });
      await supabase
        .from("system_config")
        .upsert({ key: "install_completed_at", value: new Date().toISOString() }, { onConflict: "key" });
      await supabase
        .from("system_config")
        .upsert({ key: "install_domain", value: window.location.hostname }, { onConflict: "key" });

      steps.push("✓ Instalação concluída!");
      setProgress([...steps]);

      // Cache license validation
      localStorage.setItem("license_validation_cache", JSON.stringify({
        valid: true,
        expires_at: licResult.expires_at,
        features: licResult.features,
        cached_at: Date.now(),
      }));

      setStep("done");
    } catch (err: any) {
      setError(err.message || "Erro durante a instalação");
      setStep("license");
    } finally {
      setLoading(false);
    }
  };

  /* ─── Renders ─── */
  const renderWelcome = () => (
    <div className="space-y-6 text-center">
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
        <Rocket className="w-10 h-10 text-primary" />
      </div>
      <h1 className="text-2xl font-bold text-foreground">Instalação do Sistema</h1>
      <p className="text-muted-foreground text-sm max-w-sm mx-auto">
        Bem-vindo! Este assistente irá configurar seu sistema em poucos passos.
        Você precisará de uma <strong>chave de licença válida</strong> fornecida pelo administrador do sistema principal.
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
          <span className="text-foreground">Ativar licença do sistema</span>
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
      <div className="text-center space-y-2">
        <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <User className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Criar Administrador</h2>
        <p className="text-muted-foreground text-xs">
          Este será o primeiro administrador do sistema.
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

  const renderLicense = () => (
    <div className="space-y-5">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <KeyRound className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Ativar Licença</h2>
        <p className="text-muted-foreground text-xs">
          Insira a chave de licença fornecida pelo administrador do sistema principal.
        </p>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5" /> Chave de Licença *
          </label>
          <input
            type="text"
            value={data.licenseKey}
            onChange={(e) => setData(p => ({ ...p, licenseKey: e.target.value }))}
            placeholder="Cole a chave aqui..."
            className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-xs"
            disabled={loading}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5" /> URL do Servidor Principal
            <span className="text-muted-foreground font-normal text-xs">(opcional)</span>
          </label>
          <input
            type="url"
            value={data.masterUrl}
            onChange={(e) => setData(p => ({ ...p, masterUrl: e.target.value }))}
            placeholder="https://..."
            className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            disabled={loading}
          />
          <p className="text-[11px] text-muted-foreground">
            Deixe em branco para usar o servidor padrão.
          </p>
        </div>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 space-y-1">
        <div className="flex items-center gap-2 text-xs font-medium text-amber-600 dark:text-amber-400">
          <Shield className="w-3.5 h-3.5" />
          Proteção ativa
        </div>
        <p className="text-[11px] text-muted-foreground">
          A licença será validada criptograficamente e vinculada a este domínio.
          O sistema inclui contagem regressiva interna impossível de burlar.
        </p>
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
          disabled={loading || !data.licenseKey.trim()}
          className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-1"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
          {loading ? "Instalando..." : "Instalar"}
        </button>
      </div>
    </div>
  );

  const renderFinishing = () => (
    <div className="space-y-6 text-center">
      <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
      <h2 className="text-lg font-bold text-foreground">Instalando Sistema...</h2>
      <div className="bg-muted/50 rounded-xl p-4 space-y-2 text-left max-h-48 overflow-y-auto">
        {progress.map((p, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            {p.startsWith("✓") ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            ) : (
              <Loader2 className="w-3.5 h-3.5 text-primary animate-spin shrink-0" />
            )}
            <span className={p.startsWith("✓") ? "text-muted-foreground" : "text-foreground"}>
              {p.replace("✓ ", "")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDone = () => (
    <div className="space-y-6 text-center">
      <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
      </div>
      <h1 className="text-2xl font-bold text-foreground">Instalação Concluída!</h1>
      <p className="text-muted-foreground text-sm">
        Seu sistema está pronto para uso. Faça login com a conta de administrador que você acabou de criar.
      </p>
      <div className="bg-muted/50 rounded-xl p-4 space-y-1 text-left">
        <p className="text-xs text-muted-foreground">E-mail: <strong className="text-foreground">{data.adminEmail}</strong></p>
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
        {/* Step indicator */}
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
                {i < 2 && <div className="w-8 h-0.5 bg-border" />}
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

/* ─── Export crypto verification utilities for LicenseGate ─── */
export { createLocalLicenseProof, verifyLocalLicenseProof };
