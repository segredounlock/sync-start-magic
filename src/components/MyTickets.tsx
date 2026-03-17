import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatFullDateTimeBR } from "@/lib/timezone";
import {
  MessageCircle, CheckCircle2, Clock, XCircle, RefreshCw, Loader2,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { renderTelegramHtml } from "./TextFormatToolbar";
import { motion, AnimatePresence } from "framer-motion";

interface Ticket {
  id: string;
  message: string;
  image_url: string | null;
  status: string;
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
}

const STATUS_MAP: Record<string, { label: string; icon: any; color: string }> = {
  open: { label: "Aberto", icon: Clock, color: "text-warning" },
  answered: { label: "Respondido", icon: CheckCircle2, color: "text-success" },
  closed: { label: "Fechado", icon: XCircle, color: "text-muted-foreground" },
};

export function MyTickets({ userId }: { userId: string }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "open" | "answered" | "closed">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    let q = (supabase.from("support_tickets") as any)
      .select("id, message, image_url, status, admin_reply, replied_at, created_at")
      .order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter);
    const { data } = await q.limit(50);
    setTickets(data || []);
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetch(); }, [fetch]);

  useEffect(() => {
    const ch = supabase
      .channel("my-tickets-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "support_tickets" }, () => fetch())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [fetch]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-primary" /> Meus Tickets
        </h3>
        <button onClick={fetch} className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
          <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {(["all", "open", "answered", "closed"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {f === "all" ? "Todos" : f === "open" ? "Abertos" : f === "answered" ? "Respondidos" : "Fechados"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-xs">Nenhum ticket encontrado.</p>
          <p className="text-[10px] mt-1">Envie uma mensagem pelo bot do Telegram para abrir um ticket.</p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-2.5">
            {tickets.map((t) => {
              const st = STATUS_MAP[t.status] || STATUS_MAP.open;
              const StIcon = st.icon;
              const isOpen = expandedId === t.id;
              return (
                <motion.div key={t.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  className="bg-card border border-border rounded-xl overflow-hidden">
                  <button type="button" onClick={() => setExpandedId(isOpen ? null : t.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground truncate">{t.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{formatFullDateTimeBR(t.created_at)}</p>
                    </div>
                    <span className={`flex items-center gap-1 text-[10px] font-medium whitespace-nowrap ${st.color}`}>
                      <StIcon className="w-3 h-3" /> {st.label}
                    </span>
                    {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden">
                        <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3">
                          {/* Full message */}
                          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                            {t.image_url && (
                              <a href={t.image_url} target="_blank" rel="noopener noreferrer">
                                <img src={t.image_url} alt="Anexo" className="max-h-40 rounded-lg object-cover" />
                              </a>
                            )}
                            <p className="text-xs text-foreground whitespace-pre-wrap">{t.message}</p>
                          </div>

                          {/* Admin reply */}
                          {t.admin_reply && (
                            <div className="bg-primary/10 rounded-lg p-3 border-l-2 border-primary">
                              <p className="text-[10px] text-muted-foreground mb-1">Resposta do Suporte</p>
                              <p className="text-xs text-foreground whitespace-pre-wrap"
                                dangerouslySetInnerHTML={{ __html: renderTelegramHtml(t.admin_reply) }} />
                              {t.replied_at && (
                                <p className="text-[10px] text-muted-foreground mt-1.5">{formatFullDateTimeBR(t.replied_at)}</p>
                              )}
                            </div>
                          )}

                          {t.status === "open" && !t.admin_reply && (
                            <p className="text-[10px] text-muted-foreground italic">⏳ Aguardando resposta do suporte...</p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
