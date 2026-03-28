import { motion, useInView } from "framer-motion";
import { useSiteName } from "@/hooks/useSiteName";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useRef, useEffect, useState } from "react";
import {
  ArrowRight, Headphones, Star, MessageCircle, Instagram, Send,
} from "lucide-react";

/* ── Animated Counter ── */
function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const dur = 1400;
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
        className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
      >
        {words[index]}
      </motion.span>
    </span>
  );
}

/* ── Data ── */
const stats = [
  { value: "99.9%", label: "Disponibilidade" },
  { value: "<3s", label: "Tempo médio" },
  { value: "24/7", label: "Suporte ativo" },
  { value: "10k+", label: "Recargas/mês" },
];

const features = [
  {
    num: "01",
    title: "Velocidade real",
    desc: "Recarga processada em menos de 3 segundos. Sem espera, sem travamento.",
  },
  {
    num: "02",
    title: "Segurança total",
    desc: "Criptografia ponta-a-ponta com anti-fraude inteligente e bloqueio de dispositivos.",
  },
  {
    num: "03",
    title: "Dashboard completo",
    desc: "Métricas em tempo real, ranking de vendas, relatórios e controle total do negócio.",
  },
  {
    num: "04",
    title: "Rede de revendedores",
    desc: "Gerencie centenas de sub-revendedores com precificação individual e comissões.",
  },
  {
    num: "05",
    title: "PIX instantâneo",
    desc: "Depósito via PIX com confirmação automática. Sem intermediários.",
  },
  {
    num: "06",
    title: "Multiplataforma",
    desc: "Funciona em qualquer dispositivo. Desktop, tablet ou celular — responsivo nativo.",
  },
];

const operators = ["Vivo", "Claro", "Tim", "Oi"];

/* ══════════════════════════════════════════════════════════
   LANDING PAGE
   ══════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const siteName = useSiteName();
  const navigate = useNavigate();

  const fadeUp = {
    initial: { opacity: 0, y: 30 } as const,
    whileInView: { opacity: 1, y: 0 } as const,
    viewport: { once: true, margin: "-80px" as const },
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ── Subtle grid bg ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--primary)/0.02)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--primary)/0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse,hsl(var(--primary)/0.06),transparent_70%)]" />
      </div>

      {/* ── Header ── */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="text-lg font-bold tracking-tight text-foreground">
            {siteName}
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

      {/* ═══ HERO ═══ */}
      <section className="relative z-10 pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[11px] font-medium text-primary tracking-wide">
                Plataforma #1 de Recargas
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] tracking-tight"
            >
              Recargas{" "}
              <TypedText words={["sem limites", "instantâneas", "seguras", "inteligentes"]} />
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-lg text-muted-foreground mt-6 max-w-lg leading-relaxed"
            >
              Sistema profissional para quem vende recargas.
              Rápido, seguro e sem complicação.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row items-start gap-3 mt-10"
            >
              <button
                onClick={() => navigate("/login")}
                className="group px-7 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all flex items-center gap-2"
              >
                Começar Agora
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => navigate("/login")}
                className="px-7 py-3.5 rounded-lg border border-border text-foreground font-medium text-sm hover:bg-muted/50 transition-all"
              >
                Fazer Recarga
              </button>
            </motion.div>

            {/* Operators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex items-center gap-3 mt-12"
            >
              <span className="text-[11px] text-muted-foreground/60 uppercase tracking-wider">Operadoras</span>
              <div className="w-px h-4 bg-border" />
              {operators.map((op) => (
                <span key={op} className="text-xs font-medium text-muted-foreground">
                  {op}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ STATS BAR ═══ */}
      <section className="relative z-10 border-y border-border/30 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1.5 uppercase tracking-wider">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="relative z-10 py-24 sm:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div {...fadeUp} className="mb-16">
            <span className="text-xs font-semibold text-primary uppercase tracking-[0.2em] mb-3 block">
              Funcionalidades
            </span>
            <h3 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight max-w-md">
              Tudo que você precisa para vender mais.
            </h3>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border/30 rounded-2xl overflow-hidden border border-border/30">
            {features.map((f, i) => (
              <motion.div
                key={f.num}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="bg-background p-8 group hover:bg-muted/30 transition-colors duration-300"
              >
                <span className="text-xs font-mono text-primary/50 mb-4 block">{f.num}</span>
                <h4 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {f.title}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SOCIAL PROOF ═══ */}
      <section className="relative z-10 py-20 border-y border-border/30 bg-muted/20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div {...fadeUp}>
            <div className="flex items-center justify-center gap-0.5 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-primary fill-primary" />
              ))}
            </div>
            <p className="text-sm text-muted-foreground mb-8">Avaliação 5.0 · Confiança máxima</p>

            <p className="text-5xl sm:text-6xl font-bold text-foreground tracking-tight mb-2">
              <AnimatedNumber value={10000} suffix="+" />
            </p>
            <p className="text-sm text-muted-foreground">recargas processadas com sucesso</p>
          </motion.div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="relative z-10 py-24 sm:py-32">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div {...fadeUp}>
            <h3 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Pronto para começar?
            </h3>
            <p className="text-muted-foreground mb-10 max-w-md mx-auto">
              Crie sua conta gratuitamente e comece a vender recargas em minutos.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate("/login")}
                className="group px-8 py-4 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all flex items-center gap-2"
              >
                Criar Conta Grátis
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <span className="text-xs text-muted-foreground flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Sem taxas ocultas · Ativação imediata
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="relative z-10 border-t border-border/30">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
            <div>
              <h4 className="text-base font-bold text-foreground mb-3">{siteName}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
                A plataforma mais rápida e segura para vender recargas de celular no Brasil.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Plataforma</p>
              <ul className="space-y-2">
                {["Fazer Recarga", "Painel do Revendedor", "Suporte"].map((l) => (
                  <li key={l}>
                    <button
                      onClick={() => navigate("/login")}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {l}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    onClick={() => navigate("/regras")}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Regras de Uso
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Redes</p>
              <div className="flex items-center gap-2">
                {[
                  { icon: Instagram, label: "Instagram" },
                  { icon: Send, label: "Telegram" },
                  { icon: MessageCircle, label: "WhatsApp" },
                ].map((s) => (
                  <button
                    key={s.label}
                    className="w-9 h-9 rounded-lg border border-border/50 flex items-center justify-center hover:border-primary/40 hover:text-primary transition-all"
                    aria-label={s.label}
                  >
                    <s.icon className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          </div>

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
