import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useRef } from "react";
import {
  Smartphone, Zap, Shield, Users, TrendingUp, CreditCard,
  ArrowRight, Globe, Headphones, ChevronDown, Sparkles, Activity,
} from "lucide-react";

const features = [
  { icon: Zap, title: "Instantânea", desc: "Recarga processada em menos de 3 segundos. Sem filas, sem espera.", accent: "from-yellow-400 to-orange-500" },
  { icon: Shield, title: "Blindada", desc: "Criptografia ponta-a-ponta. Seu dinheiro e dados 100% seguros.", accent: "from-emerald-400 to-cyan-500" },
  { icon: TrendingUp, title: "Inteligente", desc: "Dashboard com métricas em tempo real. Tome decisões com dados.", accent: "from-violet-400 to-purple-500" },
  { icon: CreditCard, title: "Flexível", desc: "PIX, MercadoPago, VirtualPay — todos integrados.", accent: "from-pink-400 to-rose-500" },
  { icon: Users, title: "Escalável", desc: "Gerencie centenas de revendedores em uma única plataforma.", accent: "from-blue-400 to-indigo-500" },
  { icon: Globe, title: "Universal", desc: "Funciona em qualquer dispositivo. Desktop, tablet ou celular.", accent: "from-teal-400 to-green-500" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] overflow-x-hidden">
      {/* Animated Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse,hsl(var(--primary)/0.08),transparent_70%)]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse,hsl(var(--accent)/0.05),transparent_70%)]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-4 mt-4">
          <div className="max-w-6xl mx-auto glass rounded-2xl px-6 py-3 flex items-center justify-between">
            <h1 className="font-display text-lg font-bold shimmer-letters tracking-tight">
              Recargas <span className="brasil-word">Brasil</span>
            </h1>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => navigate("/login")}
                className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:scale-105 active:scale-95 transition-all duration-200"
              >
                Entrar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 z-10"
      >
        {/* Floating badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full glass text-xs font-semibold text-primary mb-8 tracking-wider uppercase"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Plataforma #1 de Recargas do Brasil
        </motion.div>

        {/* Main headline - dramatic typography */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-4xl"
        >
          <h2 className="font-display text-5xl sm:text-6xl lg:text-8xl font-bold text-foreground leading-[0.95] tracking-tight">
            Recargas
            <br />
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-primary via-emerald-400 to-primary bg-clip-text text-transparent">
                sem limites
              </span>
              <motion.div
                className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              />
            </span>
          </h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-base sm:text-lg text-muted-foreground max-w-lg mx-auto text-center mt-8 leading-relaxed"
        >
          Sistema completo para quem vende recargas.
          <br className="hidden sm:block" />
          Rápido, seguro e sem complicação.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center gap-4 mt-10"
        >
          <button
            onClick={() => navigate("/login")}
            className="group relative px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base overflow-hidden hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <span className="relative z-10 flex items-center gap-2">
              Começar Agora
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-emerald-400 to-primary bg-[length:200%_100%] animate-gradient-x opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <button
            onClick={() => navigate("/recarga")}
            className="px-8 py-4 rounded-2xl glass text-foreground font-semibold text-base hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2"
          >
            <Smartphone className="h-5 w-5" /> Fazer Recarga
          </button>
        </motion.div>

        {/* Stats row - floating */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-3xl"
        >
          {[
            { value: "99.9%", label: "Uptime", icon: Activity },
            { value: "<3s", label: "Velocidade", icon: Zap },
            { value: "24/7", label: "Online", icon: Globe },
            { value: "100%", label: "Digital", icon: Sparkles },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + i * 0.1 }}
              className="glass-card rounded-2xl p-4 text-center group hover:border-primary/30 transition-all duration-300"
            >
              <s.icon className="h-4 w-4 text-primary mx-auto mb-2 opacity-50 group-hover:opacity-100 transition-opacity" />
              <p className="text-2xl sm:text-3xl font-bold text-primary font-display">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <ChevronDown className="h-6 w-6 text-muted-foreground/50" />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Features Section - Bento Grid */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold text-primary uppercase tracking-[0.2em] mb-3 block">
            Funcionalidades
          </span>
          <h3 className="font-display text-3xl sm:text-5xl font-bold text-foreground">
            Feito para quem{" "}
            <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
              vende de verdade
            </span>
          </h3>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className={`group relative glass-card rounded-2xl p-6 overflow-hidden hover:scale-[1.02] transition-all duration-300 cursor-default ${
                i === 0 ? "sm:col-span-2 lg:col-span-1" : ""
              }`}
            >
              {/* Gradient accent on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${f.accent} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500`} />
              
              <div className="relative z-10">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.accent} flex items-center justify-center mb-4 shadow-lg`}>
                  <f.icon className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-display text-xl font-bold text-foreground mb-2">{f.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Social proof / marquee section */}
      <section className="relative z-10 pb-32">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-3xl p-8 sm:p-12 relative overflow-hidden"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(ellipse,hsl(var(--primary)/0.1),transparent_70%)]" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[radial-gradient(ellipse,hsl(var(--accent)/0.08),transparent_70%)]" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              {/* Left: Big number */}
              <div className="flex-shrink-0 text-center lg:text-left">
                <motion.p
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", damping: 10 }}
                  className="font-display text-7xl sm:text-8xl font-bold bg-gradient-to-b from-primary to-primary/50 bg-clip-text text-transparent"
                >
                  10k+
                </motion.p>
                <p className="text-sm text-muted-foreground mt-1">recargas processadas</p>
              </div>

              {/* Right: text + CTA */}
              <div className="flex-1 text-center lg:text-left">
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
                  Junte-se a quem já está lucrando
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Revendedores em todo o Brasil confiam na nossa plataforma para processar recargas todos os dias. Comece agora, sem taxas ocultas.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
                  <button
                    onClick={() => navigate("/login")}
                    className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2"
                  >
                    Criar Conta Grátis <ArrowRight className="h-4 w-4" />
                  </button>
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    Ativação imediata
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Headphones className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Suporte 24/7</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Recargas Brasil. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
