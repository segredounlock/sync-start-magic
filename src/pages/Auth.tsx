import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";

type LoginPhase = "form" | "success" | "card-exit" | "logo-exit" | "done" | "forgot";

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

  // Rate limiting state
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

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  // Redirect logged-in users ONLY when no animation is running
  if (!loading && user && phase === "form" && !animatingRef.current) {
    const dest = role === "admin" ? "/principal" : "/painel";
    return <Navigate to={dest} replace />;
  }

  // When animation is done, navigate
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
      toast.error(err.message || "Erro ao enviar e-mail");
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
        // Reset on success
        setFailedAttempts(0);

        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", (await supabase.auth.getUser()).data.user?.id || "")
          .maybeSingle();

        setDestination(roleData?.role === "admin" ? "/principal" : "/painel");
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

      setTimeout(() => {
        setPhase("card-exit");
      }, 800);

    } catch (err: any) {
      toast.error(err.message || "Erro na autenticação");
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
      {/* Theme toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* Logo / Title */}
        <AnimatePresence
          onExitComplete={() => {
            if (phase === "logo-exit") {
              setPhase("done");
            }
          }}
        >
          {(phase as string) !== "logo-exit" && (phase as string) !== "done" && (
            <motion.div
              key="logo"
              className="text-center mb-8"
              initial={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{
                opacity: 0,
                scale: 0,
                rotate: 720,
                transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] },
              }}
            >
            <h1 className="font-display text-3xl font-bold shimmer-letters">
                Recargas <span className="brasil-word">Brasil</span>
              </h1>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Card */}
        <AnimatePresence
          onExitComplete={() => {
            if (phase === "card-exit") {
              // After card disappears, start logo exit
              setTimeout(() => setPhase("logo-exit"), 200);
            }
          }}
        >
          {(phase === "form" || phase === "success") && (
            <motion.div
              key="card"
              initial={{ opacity: 1, scale: 1, y: 0 }}
              exit={{
                opacity: 0,
                scale: 0.2,
                y: 80,
                transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
              }}
              className="glass-modal rounded-xl p-6 relative"
            >
              <p className="text-muted-foreground text-center text-sm mb-4 -mt-1">Sistema de recargas para revendedores</p>
              {/* Success overlay */}
              <AnimatePresence>
                {phase === "success" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 rounded-xl bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center z-10"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 10, stiffness: 200 }}
                      className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4"
                    >
                      <motion.svg
                        className="h-8 w-8 text-primary"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <motion.path
                          d="M5 13l4 4L19 7"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.4, delay: 0.2 }}
                        />
                      </motion.svg>
                    </motion.div>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-lg font-bold text-foreground"
                    >
                      Bem-vindo!
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex mb-6 rounded-lg overflow-hidden glass">
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  disabled={submitting}
                  className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                    isLogin ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  disabled={submitting}
                  className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                    !isLogin ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Cadastrar
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Nome</label>
                    <input
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required={!isLogin}
                      className="w-full px-3 py-2.5 rounded-lg glass-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Seu nome completo"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-lg glass-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="seu@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Senha</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-3 py-2.5 rounded-lg glass-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                {isLogin && (
                  <button
                    type="button"
                    onClick={() => { setPhase("forgot"); setForgotEmail(email); setForgotSent(false); }}
                    className="text-xs text-primary hover:underline"
                  >
                    Esqueci minha senha
                  </button>
                )}

                {isLocked && (
                  <div className="text-center py-2 px-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">
                    🔒 Bloqueado — tente novamente em {cooldownRemaining}s
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || isLocked}
                  className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50 glow-primary"
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
              className="glass-modal rounded-xl p-6"
            >
              <div className="text-center mb-4">
                <h2 className="text-lg font-bold text-foreground">Recuperar Senha</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {forgotSent
                    ? "Verifique seu e-mail para redefinir a senha"
                    : "Digite seu e-mail para receber o link de recuperação"}
                </p>
              </div>

              {!forgotSent ? (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-lg glass-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="seu@email.com"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={forgotSubmitting}
                    className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50 glow-primary"
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
                    className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3"
                  >
                    <span className="text-2xl">✉️</span>
                  </motion.div>
                  <p className="text-sm text-muted-foreground">E-mail enviado com sucesso!</p>
                </div>
              )}

              <button
                onClick={() => { setPhase("form"); setForgotSent(false); }}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mt-4 mx-auto transition-colors"
              >
                ← Voltar ao login
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
