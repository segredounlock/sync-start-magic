import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSiteName } from "@/hooks/useSiteName";
import { supabase } from "@/integrations/supabase/client";
import { Construction, Bot, ArrowRight, Wrench, Clock } from "lucide-react";

function TelegramBotLink() {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    supabase.from("system_config").select("value").eq("key", "telegramBotUrl").maybeSingle()
      .then(({ data }) => { if (data?.value) setUrl(data.value); });
  }, []);
  if (!url) return null;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[hsl(199,89%,48%)] text-white font-bold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-[hsl(199,89%,48%)]/20">
      <Bot className="h-4 w-4" />
      Acessar nosso Bot no Telegram
      <ArrowRight className="h-4 w-4" />
    </a>
  );
}

export default function MaintenancePage() {
  const siteName = useSiteName();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-warning/5 blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 max-w-lg w-full text-center space-y-8"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="mx-auto w-24 h-24 rounded-3xl bg-gradient-to-br from-warning/20 to-primary/20 flex items-center justify-center shadow-2xl shadow-warning/10"
        >
          <Construction className="h-12 w-12 text-warning" />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-2">
            🚧 Estamos em Manutenção
          </h1>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <p className="text-muted-foreground text-base leading-relaxed">
            Nosso site está passando por uma atualização para melhorar sua experiência.
            Em breve estaremos de volta com melhorias e novas funcionalidades.
          </p>
          <p className="text-muted-foreground text-sm">
            Agradecemos sua compreensão e pedimos um pouco de paciência. 🙏
          </p>
        </motion.div>

        {/* Status indicators */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-6 py-4"
        >
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-warning animate-pulse" />
            <span className="text-xs text-muted-foreground">Site em atualização</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Volta em breve</span>
          </div>
        </motion.div>

        {/* Telegram Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="rounded-2xl border border-border bg-card/60 backdrop-blur-lg p-6 space-y-4 shadow-xl"
        >
          <div className="flex items-center justify-center gap-2">
            <Bot className="h-5 w-5 text-[hsl(199,89%,48%)]" />
            <span className="font-bold text-foreground">Bot do Telegram</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-success/15 text-success">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              ONLINE
            </span>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Enquanto finalizamos as atualizações do site, nosso bot no Telegram continua funcionando normalmente.
          </p>

          <TelegramBotLink />
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-xs text-muted-foreground/60"
        >
          © {new Date().getFullYear()} {siteName} · Todos os direitos reservados
        </motion.p>
      </motion.div>
    </div>
  );
}
