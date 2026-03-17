import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { styledToast as toast } from "@/lib/toast";
import { formatFullDateTimeBR } from "@/lib/timezone";
import { Send, MessageCircle, CheckCircle2, Clock, XCircle, RefreshCw, Loader2, Sparkles, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { TextFormatToolbar, renderTelegramHtml } from "./TextFormatToolbar";
import { motion, AnimatePresence } from "framer-motion";

interface SupportTicket {
  id: string;
  telegram_chat_id: string;
  telegram_username: string | null;
  telegram_first_name: string | null;
  user_id: string | null;
  message: string;
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

const MESSAGE_EFFECTS = [
  { id: "none", label: "Sem efeito", emoji: "❌" },
  { id: "5046509860389126442", label: "Confete", emoji: "🎉" },
  { id: "5159385139981059251", label: "Corações", emoji: "❤️" },
  { id: "5107584321108051014", label: "Joinha", emoji: "👍" },
  { id: "5104841245755180586", label: "Fogo", emoji: "🔥" },
];

const QUICK_REPLIES = [
  { label: "Recebido", emoji: "✅", text: "✅ Sua mensagem foi recebida! Estamos analisando e retornaremos em breve." },
  { label: "Resolvido", emoji: "🎉", text: "🎉 Seu problema foi resolvido! Se precisar de mais ajuda, não hesite em nos contatar." },
  { label: "Verificando", emoji: "🔍", text: "🔍 Estamos verificando sua solicitação. Por favor, aguarde um momento." },
  { label: "Saldo ajustado", emoji: "💰", text: "💰 Seu saldo foi ajustado conforme solicitado. Verifique no app." },
  { label: "Recarga OK", emoji: "📱", text: "📱 A recarga foi processada com sucesso! Confira o saldo do número." },
  { label: "Tente novamente", emoji: "🔄", text: "🔄 Por favor, tente realizar a operação novamente. Se o problema persistir, nos avise." },
];

interface Props {
  onCountUpdate?: (count: number) => void;
}

export function SupportSection({ onCountUpdate }: Props) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [replyEffect, setReplyEffect] = useState<Record<string, string>>({});
  const [sending, setSending] = useState<string | null>(null);
  const [filter, setFilter] = useState<"open" | "answered" | "closed" | "all">("open");
  const [expandedReply, setExpandedReply] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    let query = (supabase.from("support_tickets") as any).select("*").order("created_at", { ascending: false });
    if (filter !== "all") query = query.eq("status", filter);
    const { data, error } = await query.limit(100);
    if (error) {
      console.error("Error fetching tickets:", error);
    } else {
      setTickets(data || []);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel("support-tickets-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "support_tickets" }, () => { fetchTickets(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchTickets]);

  // Open count for badge
  useEffect(() => {
    (async () => {
      const { count } = await (supabase.from("support_tickets") as any).select("id", { count: "exact", head: true }).eq("status", "open");
      onCountUpdate?.(count || 0);
    })();
  }, [tickets]);

  const handleReply = async (ticket: SupportTicket) => {
    const text = (replyText[ticket.id] || "").trim();
    if (!text) return;

    const effectId = replyEffect[ticket.id] || "none";
    setSending(ticket.id);
    try {
      const { error: fnError } = await supabase.functions.invoke("telegram-notify", {
        body: {
          chat_id: Number(ticket.telegram_chat_id),
          message: `💬 <b>Resposta do Suporte</b>\n\n${text}`,
          message_effect_id: effectId !== "none" ? effectId : undefined,
        },
      });
      if (fnError) throw fnError;

      const { error: dbError } = await (supabase.from("support_tickets") as any)
        .update({ status: "answered", admin_reply: text, replied_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq("id", ticket.id);
      if (dbError) throw dbError;

      toast.success("Resposta enviada com sucesso!");
      setReplyText((prev) => ({ ...prev, [ticket.id]: "" }));
      setReplyEffect((prev) => ({ ...prev, [ticket.id]: "none" }));
      setExpandedReply(null);
      fetchTickets();
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar resposta");
    }
    setSending(null);
  };

  const handleClose = async (ticketId: string) => {
    const { error } = await (supabase.from("support_tickets") as any)
      .update({ status: "closed", updated_at: new Date().toISOString() })
      .eq("id", ticketId);
    if (error) toast.error("Erro ao fechar ticket");
    else { toast.success("Ticket fechado"); fetchTickets(); }
  };

  const toggleExpand = (ticketId: string) => {
    setExpandedReply((prev) => prev === ticketId ? null : ticketId);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {(["open", "answered", "closed", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {f === "open" ? "Abertos" : f === "answered" ? "Respondidos" : f === "closed" ? "Fechados" : "Todos"}
          </button>
        ))}
        <button onClick={fetchTickets} className="ml-auto p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Nenhum ticket {filter !== "all" ? STATUS_MAP[filter]?.label.toLowerCase() : ""} encontrado.</p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {tickets.map((ticket) => {
              const st = STATUS_MAP[ticket.status] || STATUS_MAP.open;
              const StIcon = st.icon;
              const isExpanded = expandedReply === ticket.id;
              const currentEffect = replyEffect[ticket.id] || "none";
              return (
                <motion.div
                  key={ticket.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="bg-card border border-border rounded-xl p-4 space-y-3"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-foreground">
                          {ticket.telegram_first_name || ticket.telegram_username || "Usuário"}
                        </span>
                        {ticket.telegram_username && (
                          <span className="text-xs text-muted-foreground">@{ticket.telegram_username}</span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {formatFullDateTimeBR(ticket.created_at)}
                      </p>
                    </div>
                    <span className={`flex items-center gap-1 text-xs font-medium ${st.color}`}>
                      <StIcon className="w-3.5 h-3.5" />
                      {st.label}
                    </span>
                  </div>

                  {/* Message */}
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm text-foreground whitespace-pre-wrap">{ticket.message}</p>
                  </div>

                  {/* Admin reply */}
                  {ticket.admin_reply && (
                    <div className="bg-primary/10 rounded-lg p-3 border-l-2 border-primary">
                      <p className="text-[10px] text-muted-foreground mb-1">Resposta do Admin</p>
                      <p className="text-sm text-foreground whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: renderTelegramHtml(ticket.admin_reply) }} />
                      {ticket.replied_at && (
                        <p className="text-[10px] text-muted-foreground mt-1">{formatFullDateTimeBR(ticket.replied_at)}</p>
                      )}
                    </div>
                  )}

                  {/* Reply area (for open/answered tickets) */}
                  {ticket.status !== "closed" && (
                    <div className="space-y-2">
                      {/* Quick replies */}
                      <div className="flex flex-wrap gap-1.5">
                        {QUICK_REPLIES.map((qr) => (
                          <button
                            key={qr.label}
                            type="button"
                            onClick={() => setReplyText((prev) => ({ ...prev, [ticket.id]: qr.text }))}
                            className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-[10px] text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors"
                          >
                            <span>{qr.emoji}</span> {qr.label}
                          </button>
                        ))}
                      </div>

                      {/* Text input with formatting */}
                      <TextFormatToolbar
                        value={replyText[ticket.id] || ""}
                        onChange={(val) => setReplyText((prev) => ({ ...prev, [ticket.id]: val }))}
                        placeholder="Digite a resposta..."
                        rows={2}
                        className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-y"
                      />

                      {/* Expandable options */}
                      <button
                        type="button"
                        onClick={() => toggleExpand(ticket.id)}
                        className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Sparkles className="w-3 h-3" />
                        Efeitos & opções
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            {/* Message Effects */}
                            <div className="space-y-1.5 pb-2">
                              <label className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                                <Zap className="w-3 h-3" /> Efeito Visual
                              </label>
                              <div className="flex flex-wrap gap-1.5">
                                {MESSAGE_EFFECTS.map((effect) => (
                                  <button
                                    key={effect.id}
                                    type="button"
                                    onClick={() => setReplyEffect((prev) => ({ ...prev, [ticket.id]: effect.id }))}
                                    className={`flex items-center gap-1 px-2 py-1 rounded-md border text-[10px] transition-all ${
                                      currentEffect === effect.id
                                        ? "border-primary ring-1 ring-primary/30 bg-primary/10 text-primary"
                                        : "border-border/50 bg-muted text-muted-foreground hover:border-border"
                                    }`}
                                  >
                                    <span>{effect.emoji}</span> {effect.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Preview */}
                            {(replyText[ticket.id] || "").trim() && (
                              <div className="space-y-1 pt-1">
                                <label className="text-[10px] font-medium text-muted-foreground">Prévia:</label>
                                <div className="p-3 rounded-lg bg-[#1a2332] border border-border/30">
                                  <p className="text-[10px] font-bold text-white">💬 Resposta do Suporte</p>
                                  <p className="text-[10px] text-gray-300 mt-1 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: renderTelegramHtml(replyText[ticket.id] || "") }} />
                                  {currentEffect !== "none" && (
                                    <p className="text-[8px] text-primary/60 mt-1">
                                      ✨ Efeito: {MESSAGE_EFFECTS.find((e) => e.id === currentEffect)?.label}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Send + Close buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReply(ticket)}
                          disabled={sending === ticket.id || !(replyText[ticket.id] || "").trim()}
                          className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-1.5"
                        >
                          {sending === ticket.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                          Enviar Resposta
                        </button>
                        {ticket.status === "answered" && (
                          <button
                            onClick={() => handleClose(ticket.id)}
                            className="px-3 py-2 rounded-lg bg-muted text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors text-xs font-medium"
                          >
                            Fechar
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}
    </motion.div>
  );
}
