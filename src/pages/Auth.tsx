import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import { appToast } from "@/lib/toast";
import { Navigate } from "react-router-dom";
import { ArrowLeft, Mail, Lock, User, Download, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";
import { SplashScreen } from "@/components/SplashScreen";
import logo from "@/assets/recargas-brasil-logo.jpeg";

type LoginPhase = "form" | "forgot" | "splash" | "done";

function translateAuthError(msg: string): string {
  const map: Record<string, string> = {
    "Invalid login credentials": "E-mail ou senha incorretos",
    "Email not confirmed": "E-mail ainda não confirmado. Verifique sua caixa de entrada.",
    "User already registered": "Este e-mail já está cadastrado",
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
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState(() => localStorage.getItem("rememberedEmail") || "");
  const [password, setPassword] = useState(() => localStorage.getItem("rememberedPass") || "");
  const [nome, setNome] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem("rememberMe") === "true");
  const [phase, setPhase] = useState<LoginPhase>("form");
  const [destination, setDestination] = useState("/painel");

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

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;

  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  // Splash → done after 1.5s
  useEffect(() => {
    if (phase === "splash") {
      const timer = setTimeout(() => setPhase("done"), 1500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Redirect if already logged in (but not if we're mid-login)
  if (!loading && user && phase === "form" && !submitting) {
    const dest = role === "admin" ? "/principal" : "/painel";
    return <Navigate to={dest} replace />;
  }

  if (phase === "done") {
    return <Navigate to={destination} replace />;
  }

  if (phase === "splash") {
    return <SplashScreen />;
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setForgotSent(true);
      appToast.emailSent("E-mail de recuperação enviado!");
    } catch (err: any) {
      appToast.error(translateAuthError(err.message));
    } finally {
      setForgotSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin && isLocked) {
      appToast.blocked(`Muitas tentativas. Aguarde ${cooldownRemaining}s`);
      return;
    }
    setSubmitting(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          const newAttempts = failedAttempts + 1;
          setFailedAttempts(newAttempts);
          if (newAttempts >= MAX_ATTEMPTS) {
            startCooldown();
            appToast.blocked(`Bloqueado por 60 segundos após ${MAX_ATTEMPTS} tentativas`);
          }
          throw error;
        }
        setFailedAttempts(0);
        // Save or clear remembered credentials
        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
          localStorage.setItem("rememberedEmail", email);
          localStorage.setItem("rememberedPass", password);
        } else {
          localStorage.removeItem("rememberMe");
          localStorage.removeItem("rememberedEmail");
          localStorage.removeItem("rememberedPass");
        }
        const { data: { session: freshSession } } = await supabase.auth.getSession();
        const userId = freshSession?.user?.id || "";
        if (!userId) { appToast.error("Erro ao obter sessão"); setSubmitting(false); return; }
        // Retry role check to handle race condition with trigger
        const rolePriority = ["admin", "revendedor", "cliente", "usuario", "user"];
        let resolvedRole: string | null = null;

        for (let i = 0; i < 3; i++) {
          const { data, error } = await supabase
            .from("user_roles")
            .select("role, created_at")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

          if (error) throw error;

          if (data && data.length > 0) {
            const roles = data.map((r) => r.role);
            resolvedRole = rolePriority.find((r) => roles.includes(r)) || roles[0] || null;
            break;
          }

          if (i < 2) await new Promise((r) => setTimeout(r, 1000));
        }

        if (!resolvedRole) {
          await supabase.auth.signOut();
          appToast.authError("Sua conta ainda não possui um cargo atribuído. Aguarde a aprovação ou contate o administrador.");
          setSubmitting(false);
          return;
        }

        setDestination(resolvedRole === "admin" ? "/principal" : "/painel");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { nome }, emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        setDestination("/painel");
      }
      if (!isLogin) appToast.success("Conta criada com sucesso!");
      setPhase("splash");
    } catch (err: any) {
      const msg = translateAuthError(err.message);
      appToast.authError(msg);
      setSubmitting(false);
    }
  };

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-20 h-20 rounded-2xl overflow-hidden shadow-2xl border border-border/50 ring-1 ring-primary/20 mx-auto mb-4"
          >
            <img src={logo} alt="Recargas Brasil" className="w-full h-full object-cover" />
          </motion.div>
          <h1 className="font-display text-2xl font-bold shimmer-letters">
            Recargas <span className="brasil-word">Brasil</span>
          </h1>
          <p className="text-muted-foreground text-xs mt-2 tracking-wide uppercase">
            Sistema de recargas para revendedores
          </p>
        </div>

        {/* Form Card */}
        <AnimatePresence>
          {phase === "form" && (
            <motion.div
              key="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl border border-border bg-card p-6 relative shadow-lg"
            >
              {/* Tabs */}
              <div className="flex mb-6 rounded-xl overflow-hidden bg-muted/50 p-1">
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  disabled={submitting}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    isLogin
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  disabled={submitting}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    !isLogin
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Cadastrar
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Nome</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required={!isLogin}
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all text-sm"
                        placeholder="Seu nome completo"
                      />
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all text-sm"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all text-sm"
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                </div>

                {isLogin && (
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-border bg-muted/50 text-primary focus:ring-primary/30 accent-primary"
                      />
                      <span className="text-xs text-muted-foreground">Lembrar-me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => { setPhase("forgot"); setForgotEmail(email); setForgotSent(false); }}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                )}

                {isLocked && (
                  <div className="text-center py-2 px-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                    🔒 Bloqueado — tente novamente em {cooldownRemaining}s
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || isLocked}
                  className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-50 glow-primary"
                >
                  {submitting ? "Aguarde..." : isLogin ? "Entrar" : "Criar conta"}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Install App Button */}
        {phase === "form" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
            className="mt-4"
          >
            <Link
              to="/instalar"
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-lg hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <motion.div
                  animate={{ y: [0, -2, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                >
                  <Smartphone className="w-5 h-5 text-primary" />
                </motion.div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Instalar App no celular</p>
                <p className="text-[11px] text-muted-foreground">Acesse mais rápido direto da tela inicial</p>
              </div>
              <motion.div
                animate={{ x: [0, 3, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              >
                <Download className="w-4 h-4 text-muted-foreground" />
              </motion.div>
            </Link>
          </motion.div>
        )}

        {/* Forgot Password Panel */}
        <AnimatePresence>
          {phase === "forgot" && (
            <motion.div
              key="forgot"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-2xl border border-border bg-card p-6 shadow-lg"
            >
              <div className="text-center mb-5">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-bold text-foreground">Recuperar Senha</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {forgotSent
                    ? "Verifique seu e-mail para redefinir a senha"
                    : "Digite seu e-mail para receber o link de recuperação"}
                </p>
              </div>

              {!forgotSent ? (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all text-sm"
                      placeholder="seu@email.com"
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={forgotSubmitting}
                    className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-50 glow-primary"
                  >
                    {forgotSubmitting ? "Enviando..." : "Enviar link"}
                  </button>
                </form>
              ) : (
                <div className="text-center py-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 10 }}
                    className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center mx-auto mb-3"
                  >
                    <span className="text-2xl">✉️</span>
                  </motion.div>
                  <p className="text-sm text-muted-foreground">E-mail enviado com sucesso!</p>
                </div>
              )}

              <button
                onClick={() => { setPhase("form"); setForgotSent(false); }}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mt-4 mx-auto transition-colors font-medium"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Voltar ao login
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
