import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Lock, ArrowLeft, CheckCircle } from "lucide-react";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    // Check if this is a recovery session from email link
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    if (password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      toast.success("Senha alterada com sucesso!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      toast.error(err.message || "Erro ao alterar senha");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isRecovery) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="absolute top-4 right-4"><ThemeToggle /></div>
        <div className="text-center space-y-4">
          <Lock className="h-12 w-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">Link de recuperação inválido ou expirado.</p>
          <button onClick={() => navigate("/login")} className="text-primary underline text-sm">
            Voltar ao login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-4 right-4"><ThemeToggle /></div>

      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-display text-3xl font-bold shimmer-letters">
            Recargas <span className="brasil-word">Brasil</span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-modal rounded-xl p-6"
        >
          {success ? (
            <div className="text-center py-6 space-y-3">
              <CheckCircle className="h-12 w-12 text-primary mx-auto" />
              <p className="font-bold text-foreground">Senha alterada!</p>
              <p className="text-sm text-muted-foreground">Redirecionando para o login...</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <Lock className="h-8 w-8 text-primary mx-auto mb-2" />
                <h2 className="text-lg font-bold text-foreground">Nova Senha</h2>
                <p className="text-sm text-muted-foreground">Digite sua nova senha abaixo</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Nova senha</label>
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
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Confirmar senha</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-3 py-2.5 rounded-lg glass-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Repita a senha"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50 glow-primary"
                >
                  {submitting ? "Aguarde..." : "Alterar Senha"}
                </button>
              </form>
            </>
          )}

          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mt-4 mx-auto transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao login
          </button>
        </motion.div>
      </div>
    </div>
  );
}
