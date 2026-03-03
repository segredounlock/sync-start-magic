import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share2, CheckCircle2, Smartphone, Calendar, Hash, DollarSign, Loader2, Image } from "lucide-react";
import { styledToast as toast } from "@/lib/toast";
import { formatDateTimeBR } from "@/lib/timezone";
import html2canvas from "html2canvas";

interface Recarga {
  id: string;
  telefone: string;
  operadora: string | null;
  valor: number;
  custo: number;
  custo_api: number;
  status: string;
  created_at: string;
  external_id?: string | null;
}

interface RecargaReceiptProps {
  recarga: Recarga;
  open: boolean;
  onClose: () => void;
  storeName?: string;
}

export function RecargaReceipt({ recarga, open, onClose, storeName }: RecargaReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);
  const r = recarga;

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const fmtDate = (d: string) => formatDateTimeBR(d);

  const captureReceipt = async (): Promise<Blob | null> => {
    if (!receiptRef.current) return null;
    try {
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
      });
      return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/png", 1));
    } catch {
      return null;
    }
  };

  const handleShare = async () => {
    setSharing(true);
    const text = `✅ Comprovante de Recarga\n\n📱 Telefone: ${r.telefone}\n📡 Operadora: ${r.operadora || "—"}\n💰 Valor: ${fmt(r.valor)}\n📅 Data: ${fmtDate(r.created_at)}\n🔖 ID: ${r.id.slice(0, 8)}...\n\n${storeName || "Recargas Brasil"}`;

    try {
      // Try text-only share FIRST to preserve user gesture on iOS
      if (navigator.share) {
        try {
          await navigator.share({ title: "Comprovante de Recarga", text });
          setSharing(false);
          return;
        } catch (e: any) {
          if (e?.name === "AbortError") { setSharing(false); return; }
          // If text share failed, fall through to clipboard
        }
      }

      // Fallback: copy text to clipboard
      await navigator.clipboard.writeText(text);
      toast.success("Comprovante copiado!");
    } catch {
      toast.error("Não foi possível compartilhar");
    } finally {
      setSharing(false);
    }
  };

  const handleShareImage = async () => {
    setSharing(true);
    const text = `✅ Comprovante de Recarga\n\n📱 Telefone: ${r.telefone}\n📡 Operadora: ${r.operadora || "—"}\n💰 Valor: ${fmt(r.valor)}\n📅 Data: ${fmtDate(r.created_at)}\n🔖 ID: ${r.id.slice(0, 8)}...\n\n${storeName || "Recargas Brasil"}`;

    try {
      const blob = await captureReceipt();
      if (!blob) { toast.error("Erro ao gerar imagem"); setSharing(false); return; }

      const file = new File([blob], `comprovante-${r.id.slice(0, 8)}.png`, { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: "Comprovante de Recarga", text, files: [file] });
      } else {
        // Download fallback
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `comprovante-${r.id.slice(0, 8)}.png`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Imagem salva!");
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        toast.error("Não foi possível compartilhar imagem");
      }
    } finally {
      setSharing(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-[60] backdrop-blur-sm" onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-[10%] sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[380px] z-[60] flex flex-col max-h-[85vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Receipt Card */}
            <div ref={receiptRef} className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Header gradient */}
              <div className="bg-gradient-to-br from-primary to-primary/80 px-6 pt-6 pb-8 text-center relative">
                <div className="absolute top-3 right-3">
                  <button onClick={onClose} className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                    <X className="h-4 w-4 text-primary-foreground" />
                  </button>
                </div>
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-bold text-primary-foreground">Comprovante de Recarga</h3>
                <p className="text-primary-foreground/70 text-xs mt-1">{storeName || "Recargas Brasil"}</p>
              </div>

              {/* Notch effect */}
              <div className="relative -mt-4">
                <div className="flex justify-between px-0">
                  <div className="w-8 h-8 bg-background rounded-full -ml-4" />
                  <div className="flex-1 border-b-2 border-dashed border-border self-center mx-2" />
                  <div className="w-8 h-8 bg-background rounded-full -mr-4" />
                </div>
              </div>

              {/* Details */}
              <div className="px-6 py-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                    <Smartphone className="h-4.5 w-4.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Telefone</p>
                    <p className="text-sm font-mono font-bold text-foreground">{r.telefone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                    <Smartphone className="h-4.5 w-4.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Operadora</p>
                    <p className="text-sm font-semibold text-foreground">{r.operadora || "—"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                    <DollarSign className="h-4.5 w-4.5 text-success" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Valor da Recarga</p>
                    <p className="text-lg font-mono font-bold text-success">{fmt(r.valor)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                    <Calendar className="h-4.5 w-4.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Data e Hora</p>
                    <p className="text-sm font-semibold text-foreground">{fmtDate(r.created_at)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                    <Hash className="h-4.5 w-4.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">ID do Pedido</p>
                    <p className="text-xs font-mono text-muted-foreground">{r.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                </div>

                {/* Status badge */}
                <div className="flex items-center justify-center pt-2">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-success/15 text-success text-xs font-bold border border-success/20">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Recarga Concluída
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 pb-5 pt-2 border-t border-border">
                <p className="text-center text-[10px] text-muted-foreground/60">
                  Comprovante gerado em {formatDateTimeBR(new Date())}
                </p>
              </div>
            </div>

            {/* Action buttons outside receipt card */}
            <div className="flex gap-2 mt-4 px-2">
              <button
                onClick={handleShareImage}
                disabled={sharing}
                className="py-3 px-4 rounded-xl bg-card border border-border text-foreground font-semibold text-sm hover:bg-muted/50 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-60"
                title="Compartilhar como imagem"
              >
                {sharing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Image className="h-4 w-4" />}
              </button>
              <button
                onClick={handleShare}
                disabled={sharing}
                className="flex-1 py-3 rounded-xl bg-card border border-border text-foreground font-semibold text-sm hover:bg-muted/50 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-60"
              >
                <Share2 className="h-4 w-4" /> Compartilhar
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all shadow-lg"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
