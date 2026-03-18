import { useRegisterSW } from "virtual:pwa-register/react";
import { RefreshCw } from "lucide-react";

export default function UpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      // Check for updates every 30 minutes
      if (registration) {
        setInterval(() => registration.update(), 30 * 60 * 1000);
      }
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9998] animate-in slide-in-from-bottom-4 fade-in duration-300">
      <button
        onClick={() => updateServiceWorker(true)}
        className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-primary-foreground shadow-2xl border border-primary/30 text-sm font-semibold backdrop-blur-xl hover:brightness-110 active:scale-95 transition-all"
      >
        <RefreshCw className="w-4 h-4" />
        Nova versão disponível — Atualizar
      </button>
    </div>
  );
}
