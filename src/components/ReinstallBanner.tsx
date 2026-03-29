import { useState, useEffect } from "react";
import { RefreshCw, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CURRENT_APP_VERSION = "2.0.1"; // bump this when name/icon changes
const DISMISS_KEY = "reinstall-banner-dismissed";

/**
 * Shows a banner inside standalone (installed) PWA when
 * the app version has changed (e.g. name/icon update).
 * Guides the user to reinstall for the latest branding.
 */
export default function ReinstallBanner() {
  const [show, setShow] = useState(false);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true;

    if (!isStandalone) return;

    // Android auto-updates via WebAPK — only iOS needs this
    if (!isIOS) return;

    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed === CURRENT_APP_VERSION) return;

    setShow(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, CURRENT_APP_VERSION);
    setShow(false);
  };

  const handleReinstall = () => {
    if (isIOS) {
      // iOS: Can't programmatically uninstall. Open in Safari for re-add.
      // Opening the current URL in Safari so user can re-add to home screen
      window.location.href = window.location.origin + "/instalar";
    } else {
      // Android: Navigate to install page
      window.location.href = "/instalar";
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[9999] safe-top"
        >
          <div className="bg-primary text-primary-foreground px-4 py-3 shadow-lg">
            <div className="max-w-lg mx-auto flex items-start gap-3">
              <RefreshCw className="w-5 h-5 mt-0.5 shrink-0 animate-spin" style={{ animationDuration: "3s" }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">Atualização disponível!</p>
                <p className="text-xs opacity-90 mt-0.5">
                  O nome/ícone do app mudou. Remova o atalho atual da tela inicial e adicione novamente pelo Safari.
                </p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleReinstall}
                    className="text-xs font-bold bg-primary-foreground text-primary rounded-lg px-3 py-1.5 active:scale-95 transition-transform"
                  >
                    {isIOS ? "Ver instruções" : "Reinstalar"}
                  </button>
                  <button
                    onClick={dismiss}
                    className="text-xs opacity-70 hover:opacity-100 px-2 py-1.5"
                  >
                    Depois
                  </button>
                </div>
              </div>
              <button onClick={dismiss} className="p-1 opacity-60 hover:opacity-100">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
