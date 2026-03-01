import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Smartphone, Zap, Shield, Users, TrendingUp, CreditCard,
  ArrowRight, CheckCircle, Globe, Headphones,
} from "lucide-react";

const features = [
  { icon: Smartphone, title: "Recargas Instantâneas", desc: "Processe recargas em segundos para todas as operadoras do Brasil." },
  { icon: Shield, title: "Seguro & Confiável", desc: "Plataforma protegida com criptografia e monitoramento 24h." },
  { icon: TrendingUp, title: "Painel Completo", desc: "Acompanhe vendas, lucros e métricas em tempo real." },
  { icon: CreditCard, title: "Múltiplos Pagamentos", desc: "PIX, MercadoPago, VirtualPay e PushinPay integrados." },
  { icon: Users, title: "Gestão de Revendedores", desc: "Cadastre e gerencie sua rede de revendedores com facilidade." },
  { icon: Globe, title: "Acesso em Qualquer Lugar", desc: "Sistema 100% web, acesse de qualquer dispositivo." },
];

const stats = [
  { value: "99.9%", label: "Uptime" },
  { value: "<3s", label: "Tempo de Recarga" },
  { value: "24/7", label: "Disponibilidade" },
  { value: "100%", label: "Digital" },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass-header px-6 py-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="font-display text-xl font-bold text-foreground">
            Recargas <span className="text-primary glow-text">Brasil</span>
          </h1>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-primary font-medium mb-6">
            <Zap className="h-4 w-4" /> Plataforma #1 de Recargas
          </div>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
            Recargas de Celular{" "}
            <span className="text-primary glow-text">Rápidas e Seguras</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Sistema completo para revendedores de recargas. Gerencie saldos, processe recargas instantâneas e acompanhe seus resultados em tempo real.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity glow-primary flex items-center gap-2"
            >
              Começar Agora <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate("/recarga")}
              className="px-8 py-3.5 rounded-xl glass text-foreground font-semibold text-base hover:border-primary/40 transition-colors flex items-center gap-2"
            >
              <Smartphone className="h-5 w-5" /> Fazer Recarga
            </button>
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
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="glass-card rounded-xl p-5 text-center"
            >
              <p className="text-3xl font-bold text-primary glow-text">{s.value}</p>
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
          <p className="text-muted-foreground">Uma plataforma completa para o seu negócio de recargas.</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass-card rounded-xl p-6 group"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <f.icon className="h-6 w-6 text-primary" />
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
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          <div className="relative">
            <h3 className="font-display text-3xl font-bold text-foreground mb-4">
              Pronto para começar?
            </h3>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Junte-se à maior plataforma de recargas do Brasil. Comece a vender hoje mesmo.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate("/login")}
                className="px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity glow-primary flex items-center gap-2"
              >
                Criar Conta <ArrowRight className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4 text-success" /> Grátis para começar</span>
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
            <Headphones className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">Suporte disponível 24/7</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Recargas Brasil. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
