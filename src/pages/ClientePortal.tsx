import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AnimatedPage, AnimatedCard } from "@/components/AnimatedPage";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone, Zap, Shield, LogIn, UserPlus, Loader2,
  ArrowRight, CheckCircle, Headphones, TrendingUp, CreditCard, Globe,
} from "lucide-react";
import { styledToast as toast } from "@/lib/toast";
import RevendedorPainel from "./RevendedorPainel";

interface ResellerInfo {
  id: string;
  nome: string | null;
  store_name: string | null;
  store_logo_url: string | null;
  store_primary_color: string | null;
  store_secondary_color: string | null;
  active: boolean;
}

const storeFeatures = [
  { icon: Smartphone, title: "Todas as Operadoras", desc: "Recargas para Vivo, Claro, Tim, Oi e muito mais." },
  { icon: Zap, title: "Recarga Instantânea", desc: "Crédito adicionado em segundos, sem complicação." },
  { icon: Shield, title: "100% Seguro", desc: "Seus dados protegidos com criptografia de ponta." },
  { icon: CreditCard, title: "Pagamento Fácil", desc: "PIX, cartão e outros métodos disponíveis." },
  { icon: TrendingUp, title: "Melhores Preços", desc: "Valores competitivos e promoções exclusivas." },
  { icon: Globe, title: "Acesse de Qualquer Lugar", desc: "Faça recargas pelo celular, tablet ou computador." },
];

const storeStats = [
  { value: "99.9%", label: "Uptime" },
  { value: "<3s", label: "Tempo de Recarga" },
  { value: "24/7", label: "Disponibilidade" },
  { value: "100%", label: "Digital" },
];

export default function ClientePortal() {
  const { slug } = useParams<{ slug: string }>();
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [resellerInfo, setResellerInfo] = useState<ResellerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  // Auth form
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!slug) {
      setError("Link inválido.");
      setLoading(false);
      return;
    }
    loadReseller();
  }, [slug]);

  const loadReseller = async () => {
    try {
      // Public-safe lookup via SECURITY DEFINER function
      const { data, error: storeError } = await supabase.rpc("get_public_store_by_slug" as any, { _slug: slug! });
      if (storeError) throw storeError;
      const profile = Array.isArray(data) ? data[0] : null;

      if (!profile) {
        setError("Loja não encontrada. Verifique o link.");
        setLoading(false);
        return;
      }

      if (!profile.active) {
        setError("Esta loja está temporariamente inativa.");
        setLoading(false);
        return;
      }

      // profiles_public + slug + active is sufficient validation for store pages

      setResellerInfo({ ...profile, id: profile.id! } as ResellerInfo);
    } catch {
      setError("Erro ao carregar dados da loja.");
    }
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Preencha todos os campos"); return; }
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Login realizado!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao fazer login");
    }
    setSubmitting(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !nome.trim()) { toast.error("Preencha todos os campos"); return; }
    if (password.length < 6) { toast.error("Senha deve ter no mínimo 6 caracteres"); return; }
    if (!resellerInfo) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("client-register", {
        body: { email, password, nome: nome.trim(), reseller_id: resellerInfo.id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const { error: loginErr } = await supabase.auth.signInWithPassword({ email, password });
      if (loginErr) throw loginErr;
      toast.success("Conta criada com sucesso!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar conta");
    }
    setSubmitting(false);
  };

  // Loading state
  if (loading || authLoading) {
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <AnimatedCard className="glass-modal rounded-xl p-8 max-w-md text-center">
          <h1 className="font-display text-2xl font-bold text-destructive mb-3">Acesso Negado</h1>
          <p className="text-muted-foreground">{error}</p>
        </AnimatedCard>
      </div>
    );
  }

  if (!resellerInfo) return null;

  // If user is logged in → show the panel
  if (user && role === "cliente") {
    return (
      <RevendedorPainel
        resellerId={resellerInfo.id}
        resellerBranding={{
          name: resellerInfo.store_name || resellerInfo.nome || "Recargas",
          logoUrl: resellerInfo.store_logo_url,
          primaryColor: resellerInfo.store_primary_color,
          secondaryColor: resellerInfo.store_secondary_color,
        }}
      />
    );
  }

  // If user is logged in but NOT as cliente
  if (user && role !== "cliente") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <AnimatedCard className="glass-modal rounded-xl p-8 max-w-md text-center">
          <h1 className="font-display text-xl font-bold text-foreground mb-3">Área do Cliente</h1>
          <p className="text-muted-foreground mb-4">
            Você está logado como {role === "admin" ? "administrador" : "revendedor"}. Esta área é exclusiva para clientes.
          </p>
          <a href={role === "admin" ? "/admin" : "/painel"} className="text-primary font-semibold hover:underline">
            Ir para seu painel →
          </a>
        </AnimatedCard>
      </div>
    );
  }

  // Branding
  const brandColor = resellerInfo.store_primary_color || undefined;
  const brandName = resellerInfo.store_name || "Recargas Brasil";
  const brandLogo = resellerInfo.store_logo_url || null;

  const btnStyle: React.CSSProperties = brandColor
    ? { backgroundColor: brandColor, color: "#fff" }
    : {};

  const accentColor = brandColor || "hsl(var(--primary))";

  const renderBrandName = () => {
    if (brandName.includes(" ")) {
      return (
        <>
          {brandName.split(" ").slice(0, -1).join(" ")}{" "}
          <span style={brandColor ? { color: brandColor } : undefined} className={!brandColor ? "text-primary glow-text" : undefined}>
            {brandName.split(" ").slice(-1)}
          </span>
        </>
      );
    }
    return (
      <span style={brandColor ? { color: brandColor } : undefined} className={!brandColor ? "text-primary glow-text" : undefined}>
        {brandName}
      </span>
    );
  };

  // ===== AUTH SCREEN =====
  if (showAuth) {
    return (
      <div className="min-h-screen relative">
        <header className="glass-header px-6 py-4 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <button onClick={() => setShowAuth(false)} className="flex items-center gap-2">
              {brandLogo && <img src={brandLogo} alt={brandName} className="h-8 rounded-lg object-contain" />}
              <h1 className="font-display text-xl font-bold text-foreground">{renderBrandName()}</h1>
            </button>
            <ThemeToggle />
          </div>
        </header>

        <AnimatedPage className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-8">
          <div className="w-full max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                {authMode === "login" ? "Bem-vindo de volta!" : "Crie sua conta"}
              </h2>
              <p className="text-muted-foreground text-sm">
                {authMode === "login" ? "Faça login para acessar suas recargas" : "Cadastre-se para começar a recarregar"}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-modal rounded-xl p-6"
            >
              <div className="flex mb-6 bg-muted/30 rounded-lg p-1">
                <button
                  onClick={() => setAuthMode("login")}
                  className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    authMode === "login"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <LogIn className="h-4 w-4" /> Entrar
                </button>
                <button
                  onClick={() => setAuthMode("register")}
                  className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    authMode === "register"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <UserPlus className="h-4 w-4" /> Cadastrar
                </button>
              </div>

              <form onSubmit={authMode === "login" ? handleLogin : handleRegister} className="space-y-4">
                {authMode === "register" && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Nome</label>
                    <input
                      type="text"
                      value={nome}
                      onChange={e => setNome(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 rounded-lg glass-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Seu nome completo"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-lg glass-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="seu@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Senha</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-3 py-2.5 rounded-lg glass-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={submitting}
                  className={`w-full py-3 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 ${!brandColor ? "bg-primary text-primary-foreground glow-primary" : ""}`}
                  style={btnStyle}
                >
                  {submitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : authMode === "login" ? (
                    <><LogIn className="h-5 w-5" /> Entrar</>
                  ) : (
                    <><UserPlus className="h-5 w-5" /> Criar Conta</>
                  )}
                </motion.button>
              </form>
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              onClick={() => setShowAuth(false)}
              className="w-full mt-4 text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Voltar para a página inicial
            </motion.button>
          </div>
        </AnimatedPage>
      </div>
    );
  }

  // ===== LANDING PAGE =====
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass-header px-6 py-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {brandLogo && <img src={brandLogo} alt={brandName} className="h-8 rounded-lg object-contain" />}
            <h1 className="font-display text-xl font-bold text-foreground">{renderBrandName()}</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => setShowAuth(true)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity ${!brandColor ? "bg-primary text-primary-foreground" : ""}`}
              style={btnStyle}
            >
              Entrar
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm font-medium mb-6" style={brandColor ? { color: brandColor } : undefined}>
            <Zap className="h-4 w-4" /> Recargas Rápidas e Seguras
          </div>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
            Recargas de Celular{" "}
            <span style={brandColor ? { color: brandColor } : undefined} className={!brandColor ? "text-primary glow-text" : ""}>
              Rápidas e Seguras
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Recarregue seu celular de forma rápida, segura e com os melhores preços. Todas as operadoras disponíveis.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setAuthMode("register"); setShowAuth(true); }}
              className={`px-8 py-3.5 rounded-xl font-semibold text-base hover:opacity-90 transition-opacity flex items-center gap-2 ${!brandColor ? "bg-primary text-primary-foreground glow-primary" : ""}`}
              style={btnStyle}
            >
              Começar Agora <ArrowRight className="h-5 w-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setAuthMode("login"); setShowAuth(true); }}
              className="px-8 py-3.5 rounded-xl glass text-foreground font-semibold text-base hover:border-primary/40 transition-colors flex items-center gap-2"
            >
              <LogIn className="h-5 w-5" /> Já tenho conta
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {storeStats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="glass-card rounded-xl p-5 text-center"
            >
              <p className="text-3xl font-bold">
                <span style={brandColor ? { color: brandColor } : undefined} className={!brandColor ? "text-primary glow-text" : undefined}>
                  {s.value}
                </span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h3 className="font-display text-3xl font-bold text-foreground mb-3">
            Tudo que você precisa
          </h3>
          <p className="text-muted-foreground">Recarregue com facilidade e segurança.</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {storeFeatures.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass-card rounded-xl p-6 group"
            >
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors ${!brandColor ? "bg-primary/10" : ""}`}
                style={brandColor ? { backgroundColor: `${brandColor}18` } : undefined}
              >
                <f.icon className={`h-6 w-6 ${!brandColor ? "text-primary" : ""}`} style={brandColor ? { color: brandColor } : undefined} />
              </div>
              <h4 className="font-display text-lg font-bold text-foreground mb-2">{f.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-2xl p-10 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 pointer-events-none" style={brandColor ? { background: `linear-gradient(135deg, ${brandColor}08, transparent)` } : { background: "linear-gradient(135deg, hsl(var(--primary) / 0.05), transparent)" }} />
          <div className="relative">
            <h3 className="font-display text-3xl font-bold text-foreground mb-4">
              Pronto para recarregar?
            </h3>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Crie sua conta gratuitamente e comece a fazer recargas agora mesmo.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setAuthMode("register"); setShowAuth(true); }}
                className={`px-8 py-3.5 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 ${!brandColor ? "bg-primary text-primary-foreground glow-primary" : ""}`}
                style={btnStyle}
              >
                Criar Conta <ArrowRight className="h-5 w-5" />
              </motion.button>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4 text-success" /> Grátis</span>
                <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4 text-success" /> Sem taxas ocultas</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="glass-header px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Headphones className={`h-5 w-5 ${!brandColor ? "text-primary" : ""}`} style={brandColor ? { color: brandColor } : undefined} />
            <span className="text-sm text-muted-foreground">Suporte disponível 24/7</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {brandName}. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
