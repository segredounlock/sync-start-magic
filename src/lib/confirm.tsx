import { createRoot } from "react-dom/client";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, HelpCircle } from "lucide-react";

interface ConfirmOptions {
  /** Title text (default: "Confirmar") */
  title?: string;
  /** Mark as destructive action (red styling) */
  destructive?: boolean;
  /** Confirm button text (default: "Confirmar") */
  confirmText?: string;
  /** Cancel button text (default: "Cancelar") */
  cancelText?: string;
}

/**
 * Modal de confirmação global imperativo.
 * Substitui window.confirm() com estilização consistente.
 *
 * @example
 * const ok = await confirm("Excluir esta operadora?", { destructive: true });
 * if (ok) { ... }
 */
export function confirm(message: string, options: ConfirmOptions = {}): Promise<boolean> {
  const {
    title = "Confirmar",
    destructive = false,
    confirmText = destructive ? "Excluir" : "Confirmar",
    cancelText = "Cancelar",
  } = options;

  return new Promise((resolve) => {
    const container = document.createElement("div");
    container.id = "confirm-modal-root";
    document.body.appendChild(container);

    const root = createRoot(container);

    const cleanup = (result: boolean) => {
      resolve(result);
      root.unmount();
      container.remove();
    };

    const Icon = destructive ? Trash2 : HelpCircle;
    const iconColor = destructive ? "text-destructive" : "text-primary";
    const btnClass = destructive
      ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
      : "bg-primary text-primary-foreground hover:bg-primary/90";

    root.render(
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          onClick={() => cleanup(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className={`p-3 rounded-full bg-muted ${iconColor}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{message}</p>
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={() => cleanup(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-muted text-muted-foreground font-medium text-sm hover:bg-muted/80 transition-all"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => cleanup(true)}
                  className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all ${btnClass}`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  });
}
