import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share2, CheckCircle2, Smartphone, Calendar, Hash, DollarSign, Loader2, Clock, XCircle } from "lucide-react";
import { styledToast as toast } from "@/lib/toast";
import { formatDateTimeBR } from "@/lib/timezone";
import html2canvas from "html2canvas";
import { supabase } from "@/integrations/supabase/client";
import { safeValor } from "@/lib/utils";

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
  userId?: string;
}

export function RecargaReceipt({ recarga, open, onClose, storeName, userId }: RecargaReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);
  const [cachedBlob, setCachedBlob] = useState<Blob | null>(null);
  const [imageReady, setImageReady] = useState(false);
  const [preparingImage, setPreparingImage] = useState(false);
  const telegramSentRef = useRef(false);
  const r = recarga;
  const isCompleted = r.status === "completed" || r.status === "concluida";
  const isFailed = r.status === "failed" || r.status === "erro" || r.status === "falha";

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const fmtDate = (d: string) => formatDateTimeBR(d);

  const statusLabel = isCompleted ? "Recarga Concluída" : isFailed ? "Recarga Falhou" : "Em Processamento";
  const statusEmoji = isCompleted ? "✅" : isFailed ? "❌" : "⏳";

  const buildText = useCallback(() => {
    return `${statusEmoji} ${statusLabel}\n\n📱 Telefone: ${r.telefone}\n📡 Operadora: ${(r.operadora || "—").toUpperCase()}\n💰 Valor: ${fmt(safeValor(r))}\n📅 Data: ${fmtDate(r.created_at)}\n🔖 ID: ${r.id.slice(0, 8)}...${storeName ? `\n\n${storeName}` : ""}`;
  }, [r, storeName, statusLabel, statusEmoji]);

  // Pre-generate the image when the modal opens so it's ready instantly on click
  useEffect(() => {
    if (!open) {
      setCachedBlob(null);
      setImageReady(false);
      setPreparingImage(false);
      telegramSentRef.current = false;
      return;
    }

    setPreparingImage(true);

    // Pequeno atraso para garantir render completo sem atrasar demais o pré-carregamento
    const timer = setTimeout(async () => {
      if (!receiptRef.current) {
        setPreparingImage(false);
        return;
      }
      try {
        // Get the computed background color for the receipt
        const computedBg = getComputedStyle(receiptRef.current).backgroundColor;

        const canvas = await html2canvas(receiptRef.current, {
          backgroundColor: computedBg || "#ffffff",
          scale: 3,
          useCORS: true,
          logging: false,
          onclone: (clonedDoc, clonedEl) => {
            // Hide the close button in the cloned version
            const closeBtn = clonedEl.querySelector("[data-hide-capture]");
            if (closeBtn) (closeBtn as HTMLElement).style.display = "none";

            // Resolve all CSS custom properties to computed values for html2canvas
            const resolveStyles = (el: Element) => {
              const computed = getComputedStyle(el);
              const htmlEl = el as HTMLElement;
              // Apply key visual properties that html2canvas struggles with
              htmlEl.style.color = computed.color;
              htmlEl.style.backgroundColor = computed.backgroundColor;
              htmlEl.style.borderColor = computed.borderColor;
              htmlEl.style.borderTopColor = computed.borderTopColor;
              htmlEl.style.borderBottomColor = computed.borderBottomColor;
              htmlEl.style.borderLeftColor = computed.borderLeftColor;
              htmlEl.style.borderRightColor = computed.borderRightColor;
              // Resolve gradient backgrounds
              const bgImage = computed.backgroundImage;
              if (bgImage && bgImage !== "none") {
                htmlEl.style.backgroundImage = bgImage;
              }
              el.querySelectorAll("*").forEach(resolveStyles);
            };
            resolveStyles(clonedEl);
          },
        });
        const dataUrl = canvas.toDataURL("image/png");
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        setCachedBlob(blob);
        setImageReady(true);
        // Telegram notification is now sent automatically on completion (RevendedorPainel)
      } catch (e) {
        console.warn("Pre-capture failed:", e);
        setImageReady(false);
      } finally {
        setPreparingImage(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [open]);
  const uploadAndNotifyTelegram = useCallback(async (blob: Blob) => {
    if (telegramSentRef.current || !userId) return;
    telegramSentRef.current = true;
    try {
      const filePath = `${r.id}.png`;
      const { error: uploadErr } = await supabase.storage
        .from("receipts")
        .upload(filePath, blob, { contentType: "image/png", upsert: true });
      if (uploadErr) {
        console.warn("Receipt upload failed:", uploadErr);
        return;
      }
      const { data: urlData } = supabase.storage.from("receipts").getPublicUrl(filePath);
      if (!urlData?.publicUrl) return;
      
      await supabase.functions.invoke("telegram-notify", {
        body: {
          type: "recarga_completed",
          user_id: userId,
          data: {
            telefone: r.telefone,
            operadora: r.operadora || null,
            valor: r.valor,
            recarga_id: r.id,
            created_at: r.created_at,
            image_url: urlData.publicUrl,
          },
        },
      });
    } catch (e) {
      console.warn("Telegram receipt notify failed:", e);
    }
  }, [r, userId]);

  const generateBlob = async (): Promise<Blob | null> => {
    if (cachedBlob) return cachedBlob;
    if (!receiptRef.current) return null;

    setPreparingImage(true);
    try {
      const computedBg = getComputedStyle(receiptRef.current).backgroundColor;
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: computedBg || "#ffffff",
        scale: 3,
        useCORS: true,
        logging: false,
        onclone: (_doc: Document, clonedEl: HTMLElement) => {
          const closeBtn = clonedEl.querySelector("[data-hide-capture]");
          if (closeBtn) (closeBtn as HTMLElement).style.display = "none";
          const resolveStyles = (el: Element) => {
            const computed = getComputedStyle(el);
            const htmlEl = el as HTMLElement;
            htmlEl.style.color = computed.color;
            htmlEl.style.backgroundColor = computed.backgroundColor;
            htmlEl.style.borderColor = computed.borderColor;
            htmlEl.style.borderTopColor = computed.borderTopColor;
            htmlEl.style.borderBottomColor = computed.borderBottomColor;
            htmlEl.style.borderLeftColor = computed.borderLeftColor;
            htmlEl.style.borderRightColor = computed.borderRightColor;
            const bgImage = computed.backgroundImage;
            if (bgImage && bgImage !== "none") htmlEl.style.backgroundImage = bgImage;
            el.querySelectorAll("*").forEach(resolveStyles);
          };
          resolveStyles(clonedEl);
        },
      });
      const dataUrl = canvas.toDataURL("image/png");
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      setCachedBlob(blob);
      setImageReady(true);
      return blob;
    } catch (e) {
      console.warn("Image generation failed:", e);
      return null;
    } finally {
      setPreparingImage(false);
    }
  };

  const handleShare = async () => {
    // Em alguns navegadores móveis, compartilhar arquivo só funciona com gesto direto.
    // Se ainda não estiver pronto, evitamos falha na primeira tentativa.
    if (!imageReady || !cachedBlob) {
      toast.info("Preparando imagem do comprovante...");
      return;
    }

    setSharing(true);
    const text = buildText();
    try {
      const file = new File([cachedBlob], `comprovante-${r.id.slice(0, 8)}.png`, { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: "Comprovante de Recarga", text, files: [file] });
        setSharing(false);
        return;
      }

      // Fallback: share text only
      if (navigator.share) {
        try {
          await navigator.share({ title: "Comprovante de Recarga", text });
          setSharing(false);
          return;
        } catch (e: any) {
          if (e?.name === "AbortError") { setSharing(false); return; }
        }
      }
      await navigator.clipboard.writeText(text);
      toast.success("Comprovante copiado!");
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        toast.error("Não foi possível compartilhar");
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
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col max-h-[85vh] w-full max-w-[380px]">
            {/* Receipt Card */}
            <div ref={receiptRef} className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden overflow-y-auto">
              {/* Header gradient */}
              <div className="bg-gradient-to-br from-primary to-primary/80 px-6 pt-6 pb-8 text-center relative">
                <div className="absolute top-3 right-3" data-hide-capture>
                  <button onClick={onClose} className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                    <X className="h-4 w-4 text-primary-foreground" />
                  </button>
                </div>
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-bold text-primary-foreground">Comprovante de Recarga</h3>
                {storeName && <p className="text-primary-foreground/70 text-xs mt-1">{storeName}</p>}
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
                    <p className="text-sm font-semibold text-foreground">{(r.operadora || "—").toUpperCase()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                    <DollarSign className="h-4.5 w-4.5 text-success" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Valor da Recarga</p>
                    <p className="text-lg font-mono font-bold text-success">{fmt(safeValor(r))}</p>
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
                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-success/15 text-success text-xs font-bold border border-success/20">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Recarga Concluída
                    </span>
                  ) : isFailed ? (
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-destructive/15 text-destructive text-xs font-bold border border-destructive/20">
                      <XCircle className="h-3.5 w-3.5" />
                      Recarga Falhou
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-yellow-500/15 text-yellow-500 text-xs font-bold border border-yellow-500/20">
                      <Clock className="h-3.5 w-3.5" />
                      Em Processamento
                    </span>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 pb-5 pt-2 border-t border-border">
                <p className="text-center text-[10px] text-muted-foreground/60">
                  Comprovante gerado em {formatDateTimeBR(new Date().toISOString())}
                </p>
              </div>
            </div>

            {/* Action buttons outside receipt card */}
            <div className="flex gap-3 mt-4 px-2">
              <button
                onClick={handleShare}
                disabled={sharing || preparingImage || !imageReady || !isCompleted}
                className="flex-1 py-3 rounded-xl bg-card border border-border text-foreground font-semibold text-sm hover:bg-muted/50 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-60"
              >
                {sharing || preparingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />} {sharing ? "Compartilhando..." : !isCompleted ? "Aguardando conclusão" : preparingImage || !imageReady ? "Preparando imagem..." : "Compartilhar"}
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all shadow-lg"
              >
                Fechar
              </button>
            </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
