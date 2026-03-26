import { useState, useRef, useCallback, useEffect } from "react";
import { useSiteName } from "@/hooks/useSiteName";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import { appToast } from "@/lib/toast";
import { Navigate } from "react-router-dom";
import { ArrowLeft, Mail, Lock, User, Download, Smartphone, CheckCircle, TicketCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { SplashScreen } from "@/components/SplashScreen";
import logo from "@/assets/recargas-brasil-logo.jpeg";
import { collectFingerprint, captureLoginSelfie } from "@/lib/deviceFingerprint";
import { validatePassword } from "@/lib/passwordValidation";
import { PasswordStrengthMeter } from "@/components/PasswordStrengthMeter";
import { isReservedName, RESERVED_NAME_ERROR } from "@/lib/reservedNames";

type LoginPhase = "form" | "forgot" | "splash" | "done";

function translateAuthError(msg: string): string {
  const map: Record<string, string> = {
    "Invalid login credentials": "E-mail ou senha incorretos",
    "Email not confirmed": "E-mail ainda não confirmado. Verifique sua caixa de entrada.",
    "User already registered": "Este e-mail já está cadastrado",
    "email address has already been registered": "Este e-mail já está cadastrado",
    "Password should be at least 6 characters": "A senha deve ter no mínimo 6 caracteres",
    "Signup requires a valid password": "Informe uma senha válida",
    "User not found": "Usuário não encontrado",
    "Email rate limit exceeded": "Muitas tentativas. Aguarde alguns minutos.",
    "For security purposes, you can only request this once every 60 seconds": "Por segurança, aguarde 60 segundos antes de tentar novamente.",
  };
  for (const [en, pt] of Object.entries(map)) {
    if (msg.includes(en)) return pt;
  }
  return msg || "Erro na autenticação";
}

const MAX_ATTEMPTS = 5;
const COOLDOWN_MS = 60_000;

export default function Auth() {
  const siteName = useSiteName();
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const refParam = searchParams.get("ref") || "";
  const [isLogin, setIsLogin] = useState(!refParam); // if ref param present, default to signup
  const [email, setEmail] = useState(() => localStorage.getItem("rememberedEmail") || "");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [referralCode, setReferralCode] = useState(refParam);
  const [submitting, setSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem("rememberMe") === "true");
  const [phase, setPhase] = useState<LoginPhase>("form");
  const [destination, setDestination] = useState("/painel");
  const [requireReferral, setRequireReferral] = useState<boolean | null>(null);

  // Load referral requirement + prefetch pages
  useEffect(() => {
    void (async () => {
      try {
        const { data, error } = await supabase.rpc("get_require_referral_code" as any);
        if (error) {
          setRequireReferral(true);
          return;
        }
        setRequireReferral(data === true);
      } catch {
        setRequireReferral(true);
      }
    })();

    const timer = setTimeout(() => {
      import("@/pages/AdminDashboard").then(() => undefined, () => undefined);
      import("@/pages/RevendedorPainel").then(() => undefined, () => undefined);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCooldown = useCallback(() => {
    const until = Date.now() + COOLDOWN_MS;
    setLockedUntil(until);
    setCooldownRemaining(Math.ceil(COOLDOWN_MS / 1000));
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      const remaining = Math.ceil((until - Date.now()) / 1000);
      if (remaining <= 0) {
        clearInterval(cooldownRef.current!);
        cooldownRef.current = null;
        setLockedUntil(null);
        setFailedAttempts(0);
        setCooldownRemaining(0);
      } else {
        setCooldownRemaining(remaining);
      }
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  useEffect(() => {
    const until = Number(localStorage.getItem("loginLockedUntil") || 0);
    if (until && until > Date.now()) {
      setFailedAttempts(MAX_ATTEMPTS);
      const remaining = until - Date.now();
      setLockedUntil(until);
      setCooldownRemaining(Math.ceil(remaining / 1000));
      if (cooldownRef.current) clearInterval(cooldownRef.current);
      cooldownRef.current = setInterval(() => {
        const secs = Math.ceil((until - Date.now()) / 1000);
        if (secs <= 0) {
          clearInterval(cooldownRef.current!);
          cooldownRef.current = null;
          setLockedUntil(null);
          setFailedAttempts(0);
          setCooldownRemaining(0);
          localStorage.removeItem("loginLockedUntil");
        } else {
          setCooldownRemaining(secs);
        }
      }, 1000);
    }
  }, []);

  useEffect(() => {
    if (failedAttempts >= MAX_ATTEMPTS && !lockedUntil) {
      startCooldown();
      const until = Date.now() + COOLDOWN_MS;
      localStorage.setItem("loginLockedUntil", String(until));
    }
  }, [failedAttempts, lockedUntil, startCooldown]);

  const resetCooldown = () => {
    setFailedAttempts(0);
    setLockedUntil(null);
    setCooldownRemaining(0);
    localStorage.removeItem("loginLockedUntil");
    if (cooldownRef.current) {
      clearInterval(cooldownRef.current);
      cooldownRef.current = null;
    }
  };

  useEffect(() => {
    if (!loading && user) {
      navigate(role === "admin" ? "/principal" : "/painel", { replace: true });
    }
  }, [user, role, loading, navigate]);

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      appToast.error("Digite seu e-mail para recuperar a senha");
      return;
    }
    try {
      setSubmitting(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      appToast.success("Enviamos o link de recuperação para seu e-mail");
      setPhase("done");
    } catch (err: any) {
      appToast.error(translateAuthError(err?.message || "Erro ao enviar recuperação"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (lockedUntil && lockedUntil > Date.now()) {
      appToast.error(`Muitas tentativas. Aguarde ${cooldownRemaining}s.`);
      return;
    }

    try {
      setSubmitting(true);
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setFailedAttempts((p) => p + 1);
          throw error;
        }
        resetCooldown();

        let resolvedRole = role;
        try {
          const fp = await collectFingerprint();
          const { data: deviceResult, error: deviceError } = await supabase.functions.invoke("check-device", {
            body: { fingerprint: fp },
          });

          if (deviceError) {
            console.warn("Fingerprint check failed:", deviceError);
          } else if (deviceResult?.blocked) {
            await supabase.auth.signOut();
            appToast.error(deviceResult.message || "Acesso bloqueado para este dispositivo.");
            setSubmitting(false);
            return;
          } else if (deviceResult?.shouldSelfie) {
            try {
              const selfie = await captureLoginSelfie();
              await supabase.functions.invoke("check-device", {
                body: { fingerprint: fp, selfie },
              });
            } catch (selfieErr) {
              console.warn("Selfie capture skipped/failed:", selfieErr);
            }
          }
        } catch (fpErr) {
          console.warn("Fingerprint check failed:", fpErr);
        }

        setDestination(resolvedRole === "admin" ? "/principal" : "/painel");
      } else {
        if (requireReferral === null) {
          appToast.error("Aguarde um instante e tente novamente.");
          setSubmitting(false);
          return;
        }

        let resellerId: string | null = null;
        if (referralCode.trim()) {
          const code = referralCode.trim();
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(code);
          if (isUuid) {
            resellerId = code;
          } else {
            const { data: resolvedId } = await supabase.rpc("get_user_by_referral_code" as any, { _code: code });
            if (resolvedId) resellerId = resolvedId as string;
          }
          if (!resellerId) {
            appToast.error("Código de indicação inválido. Verifique e tente novamente.");
            setSubmitting(false);
            return;
          }
        } else if (requireReferral === true) {
          appToast.error("Código de indicação é obrigatório para criar conta");
          setSubmitting(false);
          return;
        }

        if (nome.trim() && isReservedName(nome.trim())) {
          appToast.error(RESERVED_NAME_ERROR);
          setSubmitting(false);
          return;
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
          appToast.error(passwordValidation.errors[0]);
          setSubmitting(false);
          return;
        }

        const { data: signUpData, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { nome, reseller_id: resellerId || undefined }, emailRedirectTo: window.location.origin },
        });
        if (error) throw error;

        if (!signUpData.user) {
          throw new Error("Não foi possível criar a conta");
        }

        setPhase("splash");
        setTimeout(() => setPhase("done"), 1800);
        return;
      }

      setPhase("splash");
      setTimeout(() => navigate(destination, { replace: true }), 1200);
    } catch (err: any) {
      appToast.error(translateAuthError(err?.message || "Erro na autenticação"));
      setSubmitting(false);
    }
  };

  if (loading) return <SplashScreen />;
  if (user) return <Navigate to={role === "admin" ? "/principal" : "/painel"} replace />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <ThemeToggle />
      </div>

      <AnimatePresence mode="wait">
        {phase === "splash" ? (
          <motion.div
            key="splash"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="w-full max-w-md"
          >
            <SplashScreen />
          </motion.div>
        ) : phase === "done" ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl p-8 text-center"
          >
            <CheckCircle className="mx-auto h-14 w-14 text-primary mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {isLogin ? "Entrando..." : "Conta criada!"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isLogin ? "Redirecionando você agora." : "Confira seu e-mail para confirmar o cadastro antes de entrar."}
            </p>
            {!isLogin && (
              <button
                onClick={() => {
                  setPhase("form");
                  setIsLogin(true);
                }}
                className="mt-6 text-sm text-primary hover:underline"
              >
                Ir para o login
              </button>
            )}
          </motion.div>
        ) : phase === "forgot" ? (
          <motion.div
            key="forgot"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="w-full max-w-md bg-card/95 backdrop-blur-xl border border-border rounded-3xl shadow-2xl p-6 sm:p-8"
          >
            <div className="text-center mb-6">
              <img src={logo} alt={siteName} className="w-20 h-20 object-cover rounded-2xl mx-auto mb-4 shadow-lg" />
              <h1 className="text-2xl font-bold text-foreground">Recuperar senha</h1>
              <p className="text-muted-foreground text-sm mt-2">Digite seu e-mail para receber o link de redefinição.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all text-sm"
                    placeholder="voce@email.com"
                  />
                </div>
              </div>

              <button
                onClick={handleForgotPassword}
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition disabled:opacity-70"
              >
                {submitting ? "Enviando..." : "Enviar link de recuperação"}
              </button>

              <button
                onClick={() => setPhase("form")}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Voltar
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="w-full max-w-md"
          >
            <div className="text-center mb-6">
              <img src={logo} alt="Recargas Brasil" className="w-24 h-24 object-cover rounded-3xl mx-auto mb-4 shadow-xl" />
              <h1 className="text-4xl font-black tracking-tight shimmer-letters">
                Recargas <span className="brasil-word">Brasil</span>
              </h1>
              <p className="text-muted-foreground mt-2 text-sm tracking-wide">SISTEMA DE RECARGAS PARA REVENDEDORES</p>
            </div>

            <div className="bg-card/95 backdrop-blur-xl border border-border rounded-3xl shadow-2xl p-6 sm:p-8">
              <div className="grid grid-cols-2 gap-2 bg-muted/50 rounded-2xl p-1.5 mb-6">
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className={`py-3 rounded-xl font-semibold text-sm transition-all ${
                    isLogin ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className={`py-3 rounded-xl font-semibold text-sm transition-all ${
                    !isLogin ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Cadastrar
                </button>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Nome</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60" />
                      <input
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required={!isLogin}
                        className="w-full pl-10 pr-3 py-3 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all text-sm"
                        placeholder="Seu nome completo"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-3 py-3 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all text-sm"
                      placeholder="voce@email.com"
                    />
                  </div>
                </div>

                {!isLogin && (requireReferral === true || !!refParam) && (
                  <div className="rounded-xl border p-3 border-primary/20 bg-primary/5">
                    <label className="block text-xs font-semibold text-primary uppercase tracking-wider mb-1.5">
                      Código de Indicação
                    </label>
                    <div className="relative">
                      <TicketCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60" />
                      <input
                        type="text"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value)}
                        required={requireReferral === true && !isLogin}
                        readOnly={!!refParam}
                        className={`w-full pl-10 pr-3 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all text-sm uppercase ${refParam ? 'opacity-70 cursor-not-allowed' : ''}`}
                        placeholder="OBRIGATÓRIO"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                      <span>ℹ️</span> Este código vincula você a um vendedor oficial.
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-3 py-3 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all text-sm"
                      placeholder={isLogin ? "Sua senha" : "Mínimo 8 caracteres"}
                    />
                  </div>
                  {!isLogin && password && <PasswordStrengthMeter password={password} />}
                </div>

                {isLogin && (
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <label className="inline-flex items-center gap-2 text-muted-foreground cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setRememberMe(checked);
                          localStorage.setItem("rememberMe", String(checked));
                          if (!checked) localStorage.removeItem("rememberedEmail");
                        }}
                        className="rounded border-border text-primary focus:ring-primary/30"
                      />
                      Lembrar e-mail
                    </label>
                    <button
                      type="button"
                      onClick={() => setPhase("forgot")}
                      className="text-primary hover:underline"
                    >
                      Esqueci a senha
                    </button>
                  </div>
                )}

                {lockedUntil && lockedUntil > Date.now() && (
                  <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                    Muitas tentativas. Aguarde {cooldownRemaining}s para tentar novamente.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || (!!lockedUntil && lockedUntil > Date.now()) || requireReferral === null}
                  className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-base hover:opacity-90 transition disabled:opacity-70"
                >
                  {submitting ? "Processando..." : isLogin ? "Entrar" : "Criar conta"}
                </button>
              </form>
            </div>

            <div className="mt-4 bg-card/90 border border-border rounded-2xl shadow-lg p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-semibold text-foreground leading-tight">Instalar App no celular</h2>
                  <p className="text-sm text-muted-foreground">Acesse mais rápido direto da tela inicial</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate("/instalar")}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Ver instruções para instalar app"
              >
                <Download className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
