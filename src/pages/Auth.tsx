import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";
import { Shield, ArrowLeft, Mail, Lock, User } from "lucide-react";

type LoginPhase = "form" | "success" | "card-exit" | "logo-exit" | "done" | "forgot";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState<LoginPhase>("form");
  const [destination, setDestination] = useState("/painel");
  const animatingRef = useRef(false);

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

  if (!loading && user && phase === "form" && !animatingRef.current) {
    const dest = role === "admin" ? "/principal" : "/painel";
    return <Navigate to={dest} replace />;
  }

  if (phase === "done") {
    return <Navigate to={destination} replace />;
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
      toast.success("E-mail de recuperação enviado!");
    } catch (err: any) {
      toast.error(translateAuthError(err.message));
    } finally {
      setForgotSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin && isLocked) {
      toast.error(`Muitas tentativas. Aguarde ${cooldownRemaining}s`);
      return;
    }
    setSubmitting(true);
    animatingRef.current = true;
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          const newAttempts = failedAttempts + 1;
          setFailedAttempts(newAttempts);
          if (newAttempts >= MAX_ATTEMPTS) {
            startCooldown();
            toast.error(`Bloqueado por 60 segundos após ${MAX_ATTEMPTS} tentativas`);
          }
          throw error;
        }
        setFailedAttempts(0);
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", (await supabase.auth.getUser()).data.user?.id || "")
          .maybeSingle();
        if (!roleData) {
          await supabase.auth.signOut();
          toast.error("Sua conta ainda não foi aprovada. Contate o administrador.");
          setSubmitting(false);
          animatingRef.current = false;
          return;
        }
        setDestination(roleData.role === "admin" ? "/principal" : "/painel");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { nome }, emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        setDestination("/painel");
      }
      toast.success(isLogin ? "Login realizado!" : "Conta criada com sucesso!");
      setPhase("success");
      setTimeout(() => setPhase("card-exit"), 800);
    } catch (err: any) {
      const msg = translateAuthError(err.message);
      toast.error(msg);
      setSubmitting(false);
      animatingRef.current = false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
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
        <AnimatePresence
          onExitComplete={() => {
            if (phase === "logo-exit") setPhase("done");
          }}
        >
          {(phase as string) !== "logo-exit" && (phase as string) !== "done" && (
            <motion.div
              key="logo"
              className="text-center mb-10"
              initial={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0, rotate: 720, transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] } }}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4"
              >
                <Shield className="h-7 w-7 text-primary" />
              </motion.div>
              <h1 className="font-display text-2xl font-bold shimmer-letters">
                Recargas <span className="brasil-word">Brasil</span>
              </h1>
              <p className="text-muted-foreground text-xs mt-2 tracking-wide uppercase">
                Sistema de recargas para revendedores
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Card */}
        <AnimatePresence
          onExitComplete={() => {
            if (phase === "card-exit") setTimeout(() => setPhase("logo-exit"), 200);
          }}
        >
          {(phase === "form" || phase === "success") && (
            <motion.div
              key="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.2, y: 80, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl border border-border bg-card p-6 relative shadow-lg"
            >
              {/* Success overlay */}
              <AnimatePresence>
                {phase === "success" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 rounded-2xl bg-card/95 backdrop-blur-sm flex flex-col items-center justify-center z-10"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 10, stiffness: 200 }}
                      className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center mb-4"
                    >
                      <motion.svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <motion.path d="M5 13l4 4L19 7" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.2 }} />
                      </motion.svg>
                    </motion.div>
                    <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-lg font-bold text-foreground">
                      Bem-vindo!
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>

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
                  <button
                    type="button"
                    onClick={() => { setPhase("forgot"); setForgotEmail(email); setForgotSent(false); }}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Esqueci minha senha
                  </button>
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
