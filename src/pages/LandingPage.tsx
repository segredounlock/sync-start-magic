import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useSiteName } from "@/hooks/useSiteName";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useRef, useEffect, useState } from "react";
import {
  Smartphone, Zap, ArrowRight, Globe, Headphones, Sparkles, Activity,
  Star, MessageCircle, Instagram, Send,
} from "lucide-react";

/* ── Data ── */
const features = [
  { emoji: "⚡", title: "Instantânea", desc: "Recarga processada em menos de 3 segundos.", accent: "from-amber-400 to-orange-500" },
  { emoji: "🛡️", title: "Blindada", desc: "Criptografia ponta-a-ponta. 100% seguro.", accent: "from-emerald-400 to-teal-500" },
  { emoji: "📊", title: "Inteligente", desc: "Dashboard com métricas em tempo real.", accent: "from-violet-400 to-purple-500" },
  { emoji: "💳", title: "Flexível", desc: "PIX, MercadoPago e mais integrados.", accent: "from-pink-400 to-rose-500" },
  { emoji: "👥", title: "Escalável", desc: "Gerencie centenas de revendedores.", accent: "from-blue-400 to-indigo-500" },
  { emoji: "🌐", title: "Universal", desc: "Desktop, tablet ou celular.", accent: "from-teal-400 to-emerald-500" },
];

const operators = ["Vivo", "Claro", "Tim"];

/* ── Floating Particles ── */
function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 18 + 10,
    delay: Math.random() * 8,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary/20"
          style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
          animate={{ y: [0, -50, 0], opacity: [0, 0.7, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ── Typed Text ── */
function TypedText({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setIndex((p) => (p + 1) % words.length), 3000);
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

/* ── Animated Counter (viewport triggered) ── */
function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const dur = 1200;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      setDisplay(Math.round(value * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [isInView, value]);

  return <span ref={ref}>{display.toLocaleString("pt-BR")}{suffix}</span>;
}

/* ── Phone Frame ── */
function PhoneFrame() {
  return (
    <div className="relative mx-auto w-[280px] sm:w-[300px]">
      {/* Glow behind phone */}
      <div className="absolute -inset-8 bg-[radial-gradient(ellipse,hsl(var(--primary)/0.2),transparent_70%)] blur-2xl pointer-events-none" />

      {/* Phone body */}
      <div className="relative rounded-[2.5rem] border-2 border-border/40 bg-background/80 backdrop-blur-xl p-3 shadow-2xl">
        {/* Notch */}
        <div className="mx-auto w-24 h-5 rounded-b-2xl bg-border/30 mb-3" />

        {/* Screen content */}
        <div className="space-y-3 px-1">
          {/* Balance card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 p-4"
          >
            <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Saldo disponível</p>
            <p className="text-2xl font-bold text-primary font-display mt-1">R$ 2.450,00</p>
          </motion.div>

          {/* Mini stats */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { v: "127", l: "Recargas", icon: Smartphone },
              { v: "<3s", l: "Velocidade", icon: Zap },
            ].map((s, i) => (
              <motion.div
                key={s.l}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 + i * 0.15 }}
                className="glass-card rounded-xl p-3 text-center"
              >
                <s.icon className="h-3.5 w-3.5 text-primary mx-auto mb-1 opacity-60" />
                <p className="text-lg font-bold text-foreground font-display">{s.v}</p>
                <p className="text-[8px] text-muted-foreground uppercase tracking-wider">{s.l}</p>
              </motion.div>
            ))}
          </div>

          {/* Recent */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="space-y-1.5"
          >
            {[
              { phone: "(11) 9****-1234", op: "Vivo", val: "R$ 20" },
              { phone: "(21) 9****-5678", op: "Claro", val: "R$ 15" },
              { phone: "(31) 9****-9012", op: "Tim", val: "R$ 30" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.4 + i * 0.1 }}
                className="flex items-center justify-between py-2 px-3 rounded-lg glass text-[10px]"
              >
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-foreground font-medium">{item.phone}</span>
                  <span className="text-muted-foreground">{item.op}</span>
                </div>
                <span className="font-bold text-primary">{item.val}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Home indicator */}
        <div className="mx-auto w-20 h-1 rounded-full bg-border/40 mt-4" />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   LANDING PAGE
   ══════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const siteName = useSiteName();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <div ref={containerRef} className="min-h-screen bg-background overflow-x-hidden">
      {/* ── Immersive BG ── */}
      <motion.div className="fixed inset-0 pointer-events-none z-0" style={{ y: bgY }}>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[radial-gradient(ellipse,hsl(var(--primary)/0.10),transparent_60%)]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(ellipse,hsl(var(--accent)/0.05),transparent_70%)]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse,hsl(var(--primary)/0.05),transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--primary)/0.015)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--primary)/0.015)_1px,transparent_1px)] bg-[size:80px_80px]" />
        <FloatingParticles />
      </motion.div>

      {/* ── Header ── */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-3 sm:mx-6 mt-3">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-6xl mx-auto glass rounded-2xl px-5 py-2.5 flex items-center justify-between"
          >
            <h1 className="font-display text-lg font-bold shimmer-letters tracking-tight">
              {siteName}
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

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-screen flex items-center z-10 pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left */}
          <div className="text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring", damping: 15 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-primary/20 mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[11px] font-semibold text-primary uppercase tracking-[0.2em]">
                Plataforma #1 de Recargas
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-[2.5rem] sm:text-[3.5rem] lg:text-[4.5rem] font-bold text-foreground leading-[0.95] tracking-tighter"
            >
              Recargas
              <br />
              <TypedText words={["sem limites", "instantâneas", "seguras", "inteligentes"]} />
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-base sm:text-lg text-muted-foreground max-w-md mt-6 leading-relaxed"
            >
              Sistema completo para quem vende recargas.
              <br className="hidden sm:block" />
              Rápido, seguro e sem complicação.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row items-start gap-4 mt-8"
            >
              <button
                onClick={() => navigate("/login")}
                className="group relative px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base overflow-hidden hover:scale-105 active:scale-95 transition-all duration-200 glow-primary rgb-border"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Começar Agora
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              <button
                onClick={() => navigate("/login")}
                className="px-8 py-4 rounded-2xl glass text-foreground font-semibold text-base hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 border border-border/50"
              >
                <Smartphone className="h-5 w-5 text-primary" /> Fazer Recarga
              </button>
            </motion.div>

            {/* Trust: operators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex items-center gap-3 mt-10"
            >
              <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">Operadoras:</span>
              {operators.map((op) => (
                <span key={op} className="text-xs font-semibold text-muted-foreground/80 px-2.5 py-1 rounded-lg glass-card">
                  {op}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right: Phone Frame */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex items-center justify-center"
          >
            <PhoneFrame />
          </motion.div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="relative z-10 py-12">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: 999, suffix: "%", label: "Uptime", icon: Activity, display: "99.9%" },
              { value: 3, suffix: "s", label: "Velocidade", icon: Zap, display: "<3s" },
              { value: 24, suffix: "/7", label: "Online", icon: Globe, display: "24/7" },
              { value: 10000, suffix: "+", label: "Recargas", icon: Sparkles, display: "10k+" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="glass-card rounded-2xl p-6 text-center group hover:border-primary/30 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-3xl sm:text-4xl font-bold text-primary font-display">{s.display}</p>
                <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-[0.2em]">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES GRID ═══ */}
      <section className="relative z-10 py-24">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="glass-card rounded-2xl p-7 group hover:border-primary/30 hover:shadow-[0_0_30px_-10px_hsl(var(--primary)/0.15)] hover:-translate-y-1 transition-all duration-300 text-center"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.accent} flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-2xl" role="img">{f.emoji}</span>
                </div>
                <h4 className="font-display text-xl font-bold text-foreground mb-2">{f.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="relative z-10 pb-32">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden"
          >
            {/* Mesh gradient bg */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-accent/10" />
            <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(ellipse,hsl(var(--primary)/0.12),transparent_70%)]" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-[radial-gradient(ellipse,hsl(var(--accent)/0.08),transparent_70%)]" />
            <div className="absolute inset-0 glass" />

            <div className="relative p-10 sm:p-16 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", damping: 10 }}
                className="mb-4"
              >
                <span className="font-display text-7xl sm:text-8xl font-bold bg-gradient-to-b from-primary to-primary/40 bg-clip-text text-transparent">
                  <AnimatedNumber value={10000} suffix="+" />
                </span>
              </motion.div>
              <p className="text-sm text-muted-foreground mb-10">recargas processadas</p>

              {/* Trust stars */}
              <div className="flex items-center justify-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                ))}
                <span className="text-sm text-muted-foreground ml-2">5.0 · Confiança máxima</span>
              </div>

              <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
                Pronto para começar?
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Junte-se à maior plataforma de recargas do Brasil. Comece a vender hoje mesmo.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => navigate("/login")}
                  className="px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 glow-primary rgb-border"
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

      {/* ═══ FOOTER ═══ */}
      <footer className="relative z-10 border-t border-border/20">
        {/* Gradient divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
            {/* Brand */}
            <div>
              <h4 className="font-display text-lg font-bold shimmer-letters tracking-tight mb-3">
                {siteName}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
                A plataforma mais rápida e segura para vender recargas de celular no Brasil.
              </p>
            </div>

            {/* Links */}
            <div>
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Plataforma</p>
              <ul className="space-y-2">
              {["Fazer Recarga", "Painel do Revendedor", "Suporte"].map((l) => (
                  <li key={l}>
                    <button
                      onClick={() => navigate("/login")}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      {l}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    onClick={() => navigate("/regras")}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    Regras de Uso
                  </button>
                </li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Redes</p>
              <div className="flex items-center gap-3">
                {[
                  { icon: Instagram, label: "Instagram" },
                  { icon: Send, label: "Telegram" },
                  { icon: MessageCircle, label: "WhatsApp" },
                ].map((s) => (
                  <button
                    key={s.label}
                    className="w-9 h-9 rounded-xl glass-card flex items-center justify-center hover:border-primary/30 hover:scale-110 transition-all"
                    aria-label={s.label}
                  >
                    <s.icon className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/20">
            <div className="flex items-center gap-2">
              <Headphones className="h-4 w-4 text-primary" />
              <span className="text-[11px] text-muted-foreground">Suporte 24/7</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              © {new Date().getFullYear()} {siteName}. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
