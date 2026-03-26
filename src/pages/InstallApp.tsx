import { useState, useEffect } from "react";
import { useSiteName } from "@/hooks/useSiteName";
import { motion } from "framer-motion";
import { Download, Smartphone, Share, Plus, Check, ArrowLeft, Apple, Monitor } from "lucide-react";
import { Link } from "react-router-dom";
import { useSiteLogo } from "@/hooks/useSiteLogo";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallApp() {
  const siteName = useSiteName();
  const logo = useSiteLogo();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    // Detect platform
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream);
    setIsAndroid(/Android/.test(ua));

    // Capture install prompt (Chrome/Edge/Samsung)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Listen for successful install
    window.addEventListener("appinstalled", () => setIsInstalled(true));

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setIsInstalled(true);
    } finally {
      setDeferredPrompt(null);
      setInstalling(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3 max-w-lg mx-auto">
          <Link to="/" className="p-2 -ml-2 rounded-xl hover:bg-muted/50 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-bold">Instalar App</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8 space-y-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden shadow-2xl border border-border/50 ring-1 ring-primary/20">
            <img src={logo} alt={siteName} className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{siteName}</h2>
            <p className="text-muted-foreground mt-1">
              Instale na tela inicial do seu celular
            </p>
          </div>
        </motion.div>

        {/* Already installed */}
        {isInstalled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-primary/10 border border-primary/30 rounded-2xl p-6 text-center space-y-3"
          >
            <div className="w-14 h-14 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
              <Check className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-primary">App já instalado!</h3>
            <p className="text-sm text-muted-foreground">
              O {siteName} já está na sua tela inicial. Abra pelo ícone do app.
            </p>
          </motion.div>
        )}

        {/* Install button (Android/Chrome) */}
        {!isInstalled && deferredPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <button
              onClick={handleInstall}
              disabled={installing}
              className="w-full py-4 px-6 bg-primary text-primary-foreground rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-primary/25 hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <Download className="w-6 h-6" />
              {installing ? "Instalando..." : "Instalar App"}
            </button>
            <p className="text-xs text-center text-muted-foreground">
              Toque para adicionar à tela inicial do seu celular
            </p>
          </motion.div>
        )}

        {/* Benefits */}
        {!isInstalled && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-3"
          >
            {[
              { icon: Smartphone, label: "Tela cheia", desc: "Sem barra do navegador" },
              { icon: Download, label: "Acesso rápido", desc: "Direto da tela inicial" },
              { icon: Monitor, label: "Funciona offline", desc: "Cache inteligente" },
              { icon: Check, label: "Notificações", desc: "Alertas em tempo real" },
            ].map((item, i) => (
              <div key={i} className="bg-card border border-border/50 rounded-xl p-4 space-y-2">
                <item.icon className="w-5 h-5 text-primary" />
                <p className="font-semibold text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* iOS Instructions */}
        {!isInstalled && isIOS && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border/50 rounded-2xl p-6 space-y-5"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Apple className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold">Instalar no iPhone</h3>
                <p className="text-xs text-muted-foreground">Siga os passos abaixo</p>
              </div>
            </div>

            <div className="space-y-5">
              <Step number={1} icon={<Share className="w-4 h-4" />}>
                <span>Na barra inferior do Safari, toque no botão:</span>
                <span className="inline-flex items-center justify-center w-10 h-10 bg-[#007AFF] rounded-xl mx-1 align-middle shadow-md">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                  </svg>
                </span>
                <span className="text-xs text-muted-foreground block mt-1">(ícone de compartilhar do Safari)</span>
              </Step>
              <Step number={2} icon={<Plus className="w-4 h-4" />}>
                <span>Role o menu para baixo e toque em:</span>
                <span className="flex items-center gap-2 mt-2 bg-muted/60 border border-border/50 rounded-xl px-3 py-2.5 text-foreground text-sm font-medium">
                  <span className="inline-flex items-center justify-center w-7 h-7 bg-muted rounded-lg shrink-0">
                    <Plus className="w-4 h-4" />
                  </span>
                  Adicionar à Tela de Início
                </span>
              </Step>
              <Step number={3} icon={<Check className="w-4 h-4" />}>
                <span>No canto superior direito, toque em:</span>
                <span className="inline-flex items-center justify-center mt-2 bg-[#007AFF] text-white text-sm font-semibold rounded-lg px-4 py-1.5 shadow-sm">
                  Adicionar
                </span>
              </Step>
            </div>

            <div className="bg-warning/10 border border-warning/20 rounded-xl p-3">
              <p className="text-xs text-warning-foreground/80">
                ⚠️ Use o <strong>Safari</strong> para instalar no iPhone. Outros navegadores não suportam esta função no iOS.
              </p>
            </div>
          </motion.div>
        )}

        {/* Android Instructions (when no prompt available) */}
        {!isInstalled && isAndroid && !deferredPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border/50 rounded-2xl p-6 space-y-5"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold">Instalar no Android</h3>
                <p className="text-xs text-muted-foreground">Siga os passos abaixo</p>
              </div>
            </div>

            <div className="space-y-4">
              <Step number={1} icon={<span className="text-xs">⋮</span>}>
                Toque no menu <strong>três pontos</strong> (⋮) no canto superior do Chrome
              </Step>
              <Step number={2} icon={<Download className="w-4 h-4" />}>
                Toque em <strong>"Instalar app"</strong> ou <strong>"Adicionar à tela inicial"</strong>
              </Step>
              <Step number={3} icon={<Check className="w-4 h-4" />}>
                Confirme tocando em <strong>"Instalar"</strong>
              </Step>
            </div>
          </motion.div>
        )}

        {/* Desktop fallback */}
        {!isInstalled && !isIOS && !isAndroid && !deferredPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border/50 rounded-2xl p-6 text-center space-y-3"
          >
            <Monitor className="w-8 h-8 mx-auto text-muted-foreground" />
            <h3 className="font-bold">Acesse pelo celular</h3>
            <p className="text-sm text-muted-foreground">
              Para instalar o app, abra este site no navegador do seu celular (Chrome no Android ou Safari no iPhone).
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function Step({ number, icon, children }: { number: number; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0 text-xs font-bold">
        {number}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed pt-0.5">{children}</p>
    </div>
  );
}
