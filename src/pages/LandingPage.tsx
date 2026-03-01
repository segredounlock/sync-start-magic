import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useRef, useEffect, useState } from "react";
import {
  Smartphone, Zap, Shield, Users, TrendingUp, CreditCard,
  ArrowRight, Globe, Headphones, Sparkles, Activity,
} from "lucide-react";

const features = [
  { icon: Zap, title: "Instantânea", desc: "Recarga processada em menos de 3 segundos.", accent: "from-yellow-400 to-orange-500" },
  { icon: Shield, title: "Blindada", desc: "Criptografia ponta-a-ponta. 100% seguro.", accent: "from-emerald-400 to-cyan-500" },
  { icon: TrendingUp, title: "Inteligente", desc: "Dashboard com métricas em tempo real.", accent: "from-violet-400 to-purple-500" },
  { icon: CreditCard, title: "Flexível", desc: "PIX, MercadoPago e mais integrados.", accent: "from-pink-400 to-rose-500" },
  { icon: Users, title: "Escalável", desc: "Gerencie centenas de revendedores.", accent: "from-blue-400 to-indigo-500" },
  { icon: Globe, title: "Universal", desc: "Desktop, tablet ou celular.", accent: "from-teal-400 to-green-500" },
];

// Floating particle component
function FloatingParticles() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 15 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary/20"
          style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
          animate={{
            y: [0, -40, 0],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Typed text effect
function TypedText({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <span className="inline-block min-w-[200px] sm:min-w-[280px]">
      <motion.span
        key={words[index]}
        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-primary via-emerald-400 to-primary bg-clip-text text-transparent"
      >
        {words[index]}
      </motion.span>
    </span>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <div ref={containerRef} className="min-h-screen bg-[hsl(var(--background))] overflow-x-hidden">
      {/* Immersive fullscreen background */}
      <motion.div className="fixed inset-0 pointer-events-none z-0" style={{ y: bgY }}>
        {/* Central glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-[radial-gradient(ellipse,hsl(var(--primary)/0.12),transparent_60%)]" />
        {/* Corner accents */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(ellipse,hsl(var(--accent)/0.06),transparent_70%)]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(ellipse,hsl(var(--primary)/0.06),transparent_70%)]" />
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--primary)/0.02)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--primary)/0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />
        <FloatingParticles />
      </motion.div>

      {/* Floating Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-3 sm:mx-6 mt-3">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-6xl mx-auto glass rounded-2xl px-5 py-2.5 flex items-center justify-between"
          >
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
          </motion.div>
        </div>
      </header>

      {/* ===== HERO: Fullscreen Immersive ===== */}
      <section className="relative min-h-screen flex items-center justify-center z-10">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Pulsing ring */}
          <motion.div
            className="w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] rounded-full border border-primary/10"
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            className="w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] rounded-full border border-primary/5"
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="relative text-center px-6 max-w-5xl mx-auto">
          {/* Floating label */}
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.5em" }}
            animate={{ opacity: 1, letterSpacing: "0.25em" }}
            transition={{ delay: 0.3, duration: 1.2, ease: "easeOut" }}
            className="text-[10px] sm:text-xs font-bold text-primary/60 uppercase tracking-[0.25em] mb-10"
          >
            ✦ Plataforma #1 de Recargas ✦
          </motion.p>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[3rem] sm:text-[4.5rem] lg:text-[6.5rem] font-bold text-foreground leading-[0.9] tracking-tighter"
          >
            Recargas
            <br />
            <TypedText words={["sem limites", "instantâneas", "seguras", "inteligentes"]} />
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto mt-8 leading-relaxed"
          >
            Sistema completo para quem vende recargas.
            <br className="hidden sm:block" />
            Rápido, seguro e sem complicação.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
          >
            <button
              onClick={() => navigate("/login")}
              className="group relative px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base overflow-hidden hover:scale-105 active:scale-95 transition-all duration-200 glow-primary"
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

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-20"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="w-6 h-10 rounded-full border-2 border-muted-foreground/20 mx-auto flex justify-center pt-2"
            >
              <motion.div
                animate={{ opacity: [1, 0], y: [0, 12] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                className="w-1.5 h-1.5 rounded-full bg-primary"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== Stats: Horizontal Strip ===== */}
      <section className="relative z-10 py-10">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-1"
          >
            <div className="grid grid-cols-2 md:grid-cols-4">
              {[
                { value: "99.9%", label: "Uptime", icon: Activity },
                { value: "<3s", label: "Velocidade", icon: Zap },
                { value: "24/7", label: "Online", icon: Globe },
                { value: "100%", label: "Digital", icon: Sparkles },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 text-center group"
                >
                  <s.icon className="h-5 w-5 text-primary mx-auto mb-3 opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                  <p className="text-3xl sm:text-4xl font-bold text-primary font-display">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground mt-1.5 uppercase tracking-[0.2em]">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== Features: Cinematic Scroll ===== */}
      <section className="relative z-10 py-24">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-20"
          >
            <span className="text-xs font-semibold text-primary uppercase tracking-[0.25em] mb-4 block">
              Funcionalidades
            </span>
            <h3 className="font-display text-3xl sm:text-5xl font-bold text-foreground leading-tight">
              Tudo que você precisa.
              <br />
              <span className="text-muted-foreground">Nada que você não precisa.</span>
            </h3>
          </motion.div>

          <div className="space-y-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: i % 2 === 0 ? -60 : 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="glass-card rounded-2xl p-6 sm:p-8 flex items-center gap-6 group hover:scale-[1.01] transition-all duration-300"
              >
                <div className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${f.accent} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <f.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-display text-xl font-bold text-foreground">{f.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 hidden sm:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA Section ===== */}
      <section className="relative z-10 pb-32">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden"
          >
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-accent/10" />
            <div className="absolute inset-0 glass" />

            <div className="relative p-10 sm:p-16 text-center">
              <motion.p
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", damping: 10 }}
                className="font-display text-7xl sm:text-8xl font-bold bg-gradient-to-b from-primary to-primary/40 bg-clip-text text-transparent mb-4"
              >
                10k+
              </motion.p>
              <p className="text-sm text-muted-foreground mb-8">recargas processadas</p>

              <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
                Pronto para começar?
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Junte-se à maior plataforma de recargas do Brasil. Comece a vender hoje mesmo.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => navigate("/login")}
                  className="px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 glow-primary"
                >
                  Criar Conta Grátis <ArrowRight className="h-5 w-5" />
                </button>
                <span className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Sem taxas ocultas · Ativação imediata
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/30 px-6 py-8">
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
