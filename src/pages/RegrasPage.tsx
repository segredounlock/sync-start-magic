import { motion } from "framer-motion";
import { useSiteName } from "@/hooks/useSiteName";
import { useNavigate } from "react-router-dom";
import {
  ShieldAlert, Headphones, Clock, Users, Timer,
  ArrowLeft, AlertTriangle, Ban, CheckCircle2, FileText,
} from "lucide-react";

const rules = [
  {
    icon: ShieldAlert,
    title: "Política de Reembolso / MED",
    accent: "from-red-500 to-rose-600",
    items: [
      "Solicitações de reembolso (MED/contestação) junto ao banco resultam em bloqueio permanente da conta bancária vinculada e da conta na plataforma.",
      "Nenhum reembolso será concedido por esta via — sem exceções.",
      "A conta bancária será bloqueada pelo próprio gateway de pagamento, impedindo qualquer transação PIX futura na plataforma.",
    ],
  },
  {
    icon: Headphones,
    title: "Suporte Oficial",
    accent: "from-blue-500 to-indigo-600",
    items: [
      "Qualquer problema deve ser tratado exclusivamente pelo suporte da plataforma.",
      "Não acione seu banco para contestar pagamentos — entre em contato conosco primeiro.",
      "O suporte está disponível 24/7 para resolver qualquer situação.",
    ],
  },
  {
    icon: Clock,
    title: "Depósitos Expirados",
    accent: "from-amber-500 to-orange-600",
    items: [
      "O PIX gerado possui prazo de validade. Se não for pago dentro do prazo, expira automaticamente.",
      "Se você pagou após a expiração, entre em contato com o suporte informando o comprovante.",
      "Depósitos expirados não são creditados automaticamente — o suporte fará a verificação manual.",
    ],
  },
  {
    icon: Users,
    title: "Responsabilidade do Revendedor",
    accent: "from-emerald-500 to-green-600",
    items: [
      "O revendedor é o único responsável pelo atendimento ao cliente final.",
      "Antes de acionar o suporte, verifique o extrato no app da operadora (Minha Claro / Meu TIM).",
      "O suporte reserva-se o direito de não prosseguir caso o revendedor se recuse a fornecer os dados para conferência.",
    ],
  },
  {
    icon: Timer,
    title: "Prazo de Processamento",
    accent: "from-violet-500 to-purple-600",
    items: [
      "Recargas podem levar até 1 hora para serem processadas pela operadora.",
      "Reclamações antes desse prazo não serão atendidas.",
      "Pedidos podem levar até 24 horas para serem processados pelo sistema antes de serem considerados falhos.",
    ],
  },
];

export default function RegrasPage() {
  const navigate = useNavigate();
  const siteName = useSiteName();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* BG */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(ellipse,hsl(var(--primary)/0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--primary)/0.015)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--primary)/0.015)_1px,transparent_1px)] bg-[size:80px_80px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 mx-3 sm:mx-6 mt-3">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto glass rounded-2xl px-5 py-2.5 flex items-center justify-between"
        >
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
          <h1 className="font-display text-lg font-bold shimmer-letters tracking-tight">
            {siteName}
          </h1>
          </h1>
        </motion.div>
      </header>

      {/* Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-primary/20 mb-6">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-[11px] font-semibold text-primary uppercase tracking-[0.2em]">
              Termos obrigatórios
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground leading-tight">
            Regras e Termos de Uso
          </h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto text-sm sm:text-base">
            Ao utilizar a plataforma, você concorda com todas as regras abaixo. Leia atentamente.
          </p>
        </motion.div>

        {/* Alert banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-5 sm:p-6 mb-8 border-destructive/30 bg-destructive/5"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/15 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-foreground mb-1">
                ⚠️ Aviso Importante
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Solicitar reembolso (MED/contestação) junto ao seu banco resultará no{" "}
                <strong className="text-destructive">bloqueio permanente</strong> da sua conta
                bancária para PIX na plataforma e no bloqueio da sua conta de usuário.
                Sempre entre em contato com o suporte para resolver qualquer problema.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Rules */}
        <div className="space-y-5">
          {rules.map((rule, i) => (
            <motion.div
              key={rule.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="glass-card rounded-2xl p-6 sm:p-7 hover:border-primary/20 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${rule.accent} flex items-center justify-center shrink-0 shadow-lg`}>
                  <rule.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg font-bold text-foreground mb-3">
                    {rule.title}
                  </h3>
                  <ul className="space-y-2.5">
                    {rule.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-sm text-muted-foreground leading-relaxed">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-10 text-center"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-card text-xs text-muted-foreground">
            <Ban className="h-3.5 w-3.5 text-destructive" />
            O descumprimento das regras acima pode resultar em suspensão permanente da conta.
          </div>
          <p className="text-[11px] text-muted-foreground/60 mt-4">
            Última atualização: {new Date().toLocaleDateString("pt-BR")}
          </p>
        </motion.div>
      </main>
    </div>
  );
}
