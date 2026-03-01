import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";

type LoginPhase = "form" | "card-exit" | "logo-exit" | "done";

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

  // Redirect logged-in users (only when no animation is running)
  if (!loading && user && phase === "form") {
    const dest = role === "admin" ? "/principal" : "/painel";
    return <Navigate to={dest} replace />;
  }

  // When animation is done, navigate
  if (phase === "done") {
    return <Navigate to={destination} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Login realizado!");

        // Determine destination before animation
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", (await supabase.auth.getUser()).data.user?.id || "")
          .maybeSingle();
        
        setDestination(roleData?.role === "admin" ? "/principal" : "/painel");

        // Start exit animation sequence
        setPhase("card-exit");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { nome }, emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Conta criada com sucesso!");
        
        setDestination("/painel");
        setPhase("card-exit");
      }
    } catch (err: any) {
      toast.error(err.message || "Erro na autenticação");
      setSubmitting(false);
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
          {(phase === "form" || phase === "card-exit") && (
            <motion.div
              key="logo"
              className="text-center mb-8"
              initial={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{
                opacity: 0,
                scale: 0,
                rotate: 360,
                transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] },
              }}
            >
              <h1 className="font-display text-3xl font-bold shimmer-letters">
                Recargas <span className="brasil-word">Brasil</span>
              </h1>
              <p className="text-muted-foreground mt-2">Sistema de recargas para revendedores</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Card */}
        <AnimatePresence
          onExitComplete={() => {
            if (phase === "card-exit") {
              setPhase("logo-exit");
            }
          }}
        >
          {phase === "form" && (
            <motion.div
              key="card"
              initial={{ opacity: 1, scale: 1, y: 0 }}
              exit={{
                opacity: 0,
                scale: 0.3,
                y: 50,
                transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
              }}
              className="glass-modal rounded-xl p-6"
            >
              <div className="flex mb-6 rounded-lg overflow-hidden glass">
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                    isLogin ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
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
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50 glow-primary"
                >
                  {submitting ? "Aguarde..." : isLogin ? "Entrar" : "Criar conta"}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
