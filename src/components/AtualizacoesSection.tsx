import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Share2, ExternalLink, Loader2 } from "lucide-react";
import { renderTelegramHtml } from "@/components/TextFormatToolbar";
import { supabase } from "@/integrations/supabase/client";
import { formatDateLongUpperBR, isTodayBR, toLocalDateKey } from "@/lib/timezone";
import { styledToast as toast } from "@/lib/toast";

interface NotifButton {
  text?: string;
  label?: string;
  url: string;
}

interface Notif {
  id: string;
  title: string;
  message: string;
  buttons: NotifButton[] | null;
  image_url: string | null;
  created_at: string;
  status: string;
}

function dateLabel(d: string): string {
  try {
    if (isTodayBR(d)) return "HOJE";
    const inputKey = toLocalDateKey(d);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = toLocalDateKey(yesterday.toISOString());
    if (inputKey === yKey) return "ONTEM";
    return formatDateLongUpperBR(d);
  } catch {
    return "";
  }
}

function isNew(d: string): boolean {
  try {
    const diff = Date.now() - new Date(d).getTime();
    return diff < 2 * 24 * 60 * 60 * 1000; // 2 days
  } catch {
    return false;
  }
}

export function AtualizacoesSection() {
  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("notifications")
        .select("id, title, message, buttons, image_url, created_at, status")
        .in("status", ["sent", "completed"])
        .order("created_at", { ascending: false })
        .limit(20);
      setItems((data as Notif[] | null) || []);
      setLoading(false);
    })();
  }, []);

  const handleShare = async (item: Notif) => {
    const text = `${item.title}\n\n${item.message}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: item.title, text });
      } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Copiado para a área de transferência!");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="h-6 w-6 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Carregando novidades...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Calendar className="h-10 w-10 opacity-30 mb-3" />
        <p className="text-sm font-medium">Nenhuma atualização ainda</p>
        <p className="text-xs mt-1 opacity-70">Novidades e avisos aparecerão aqui</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">Novidades</h2>
        <p className="text-xs text-muted-foreground">Acompanhe as melhorias e avisos importantes.</p>
      </div>

      {items.map((item, i) => {
        const buttons: NotifButton[] = Array.isArray(item.buttons) ? item.buttons : [];
        const isRecent = isNew(item.created_at);

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`relative rounded-2xl border bg-card p-5 space-y-3 ${
              isRecent ? "border-primary/40 shadow-[0_0_16px_hsl(var(--primary)/0.08)]" : "border-border"
            }`}
          >
            {/* New badge */}
            {isRecent && (
              <span className="absolute -top-2.5 -left-1 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg shadow-sm">
                Novo
              </span>
            )}

            {/* Date */}
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded-md font-medium">
                <Calendar className="h-3 w-3" />
                {dateLabel(item.created_at)}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-foreground leading-snug">{item.title}</h3>

            {/* Image */}
            {item.image_url && (
              <img src={item.image_url} alt="" className="w-full rounded-xl object-cover max-h-48" />
            )}

            {/* Message */}
            <div
              className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed [&_b]:font-bold [&_i]:italic [&_s]:line-through [&_code]:bg-muted/50 [&_code]:px-1 [&_code]:rounded [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-3 [&_blockquote]:italic"
              dangerouslySetInnerHTML={{ __html: renderTelegramHtml(item.message) }}
            />

            {/* Buttons */}
            {buttons.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {buttons.map((btn, bi) => (
                  <a
                    key={bi}
                    href={btn.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
                  >
                    {btn.label || btn.text} <ExternalLink className="h-3 w-3" />
                  </a>
                ))}
              </div>
            )}

            {/* Share */}
            <div className="flex justify-end pt-1">
              <button
                onClick={() => handleShare(item)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Share2 className="h-3.5 w-3.5" />
                Compartilhar
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
