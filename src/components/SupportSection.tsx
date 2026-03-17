import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { styledToast as toast } from "@/lib/toast";
import { formatFullDateTimeBR } from "@/lib/timezone";
import {
  Send, MessageCircle, CheckCircle2, Clock, XCircle, RefreshCw, Loader2,
  Sparkles, ChevronDown, ChevronUp, Zap, Image, Link, Plus, Trash2, Upload, X,
  User,
} from "lucide-react";
import { TextFormatToolbar, renderTelegramHtml } from "./TextFormatToolbar";
import { motion, AnimatePresence } from "framer-motion";

interface SupportTicket {
  id: string;
  telegram_chat_id: string;
  telegram_username: string | null;
  telegram_first_name: string | null;
  user_id: string | null;
  message: string;
  image_url: string | null;
  status: string;
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
}

interface InlineButton { text: string; url: string; }

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

interface ReplyState {
  text: string;
  effectId: string;
  imageUrl: string | null;
  buttons: InlineButton[];
  enableImage: boolean;
  enableButtons: boolean;
}

const defaultReply: ReplyState = { text: "", effectId: "none", imageUrl: null, buttons: [], enableImage: false, enableButtons: false };

/* ── Date grouping helper ── */
function getDateGroup(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const weekAgo = new Date(today.getTime() - 7 * 86400000);

  if (date >= today) return "Hoje";
  if (date >= yesterday) return "Ontem";
  if (date >= weekAgo) return "Esta semana";
  return "Anteriores";
}

function groupTicketsByDate(tickets: SupportTicket[]): { label: string; tickets: SupportTicket[] }[] {
  const groups: Record<string, SupportTicket[]> = {};
  const order = ["Hoje", "Ontem", "Esta semana", "Anteriores"];
  for (const t of tickets) {
    const g = getDateGroup(t.created_at);
    if (!groups[g]) groups[g] = [];
    groups[g].push(t);
  }
  return order.filter((l) => groups[l]?.length).map((l) => ({ label: l, tickets: groups[l] }));
}

export function SupportSection({ onCountUpdate }: Props) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [replies, setReplies] = useState<Record<string, ReplyState>>({});
  const [sending, setSending] = useState<string | null>(null);
  const [filter, setFilter] = useState<"open" | "closed" | "all">("open");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedEffects, setExpandedEffects] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [counts, setCounts] = useState({ open: 0, closed: 0, all: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeTicketRef = useRef<string | null>(null);

  const getReply = (id: string) => replies[id] || defaultReply;
  const updateReply = (id: string, patch: Partial<ReplyState>) => {
    setReplies((prev) => ({ ...prev, [id]: { ...getReply(id), ...patch } }));
  };

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    let query = (supabase.from("support_tickets") as any).select("*").order("created_at", { ascending: false });
    if (filter === "open") query = query.in("status", ["open", "answered"]);
    else if (filter === "closed") query = query.eq("status", "closed");
    const { data, error } = await query.limit(100);
    if (error) console.error("Error fetching tickets:", error);
    else setTickets(data || []);
    setLoading(false);
  }, [filter]);

  const fetchCounts = useCallback(async () => {
    const [openRes, closedRes, allRes] = await Promise.all([
      (supabase.from("support_tickets") as any).select("id", { count: "exact", head: true }).in("status", ["open", "answered"]),
      (supabase.from("support_tickets") as any).select("id", { count: "exact", head: true }).eq("status", "closed"),
      (supabase.from("support_tickets") as any).select("id", { count: "exact", head: true }),
    ]);
    setCounts({ open: openRes.count || 0, closed: closedRes.count || 0, all: allRes.count || 0 });
    onCountUpdate?.(openRes.count || 0);
  }, [onCountUpdate]);

  useEffect(() => { fetchTickets(); fetchCounts(); }, [fetchTickets, fetchCounts]);

  useEffect(() => {
    const channel = supabase
      .channel("support-tickets-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "support_tickets" }, () => { fetchTickets(); fetchCounts(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchTickets, fetchCounts]);

  const grouped = useMemo(() => groupTicketsByDate(tickets), [tickets]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const ticketId = activeTicketRef.current;
    if (!file || !ticketId) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      toast.error("Imagem inválida ou maior que 5MB");
      return;
    }
    setUploadingImage(ticketId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");
      const fileName = `${user.id}/${Date.now()}.${file.name.split(".").pop()}`;
      const { error: uploadError } = await supabase.storage.from("broadcast-images").upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("broadcast-images").getPublicUrl(fileName);
      updateReply(ticketId, { imageUrl: publicUrl });
    } catch (err: any) {
      toast.error("Erro ao enviar imagem: " + err.message);
    }
    setUploadingImage(null);
    if (e.target) e.target.value = "";
  };

  const handleReply = async (ticket: SupportTicket) => {
    const r = getReply(ticket.id);
    const text = r.text.trim();
    if (!text) return;

    setSending(ticket.id);
    try {
      const validButtons = r.enableButtons ? r.buttons.filter((b) => b.text.trim() && b.url.trim()) : [];
      const { error: fnError } = await supabase.functions.invoke("telegram-notify", {
        body: {
          chat_id: Number(ticket.telegram_chat_id),
          message: `💬 <b>Resposta do Suporte</b>\n\n${text}\n\n<i>💡 Você pode responder diretamente aqui.</i>`,
          message_effect_id: r.effectId !== "none" ? r.effectId : undefined,
          image_url: r.enableImage ? r.imageUrl : undefined,
          buttons: validButtons.length > 0 ? validButtons : undefined,
          reopen_support_session: true,
          session_data: {
            telegram_username: ticket.telegram_username || "",
            telegram_first_name: ticket.telegram_first_name || "",
            user_id: ticket.user_id || null,
          },
        },
      });
      if (fnError) throw fnError;

      const { error: dbError } = await (supabase.from("support_tickets") as any)
        .update({ status: "answered", admin_reply: text, replied_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq("id", ticket.id);
      if (dbError) throw dbError;

      toast.success("Resposta enviada com sucesso!");
      setReplies((prev) => ({ ...prev, [ticket.id]: defaultReply }));
      setExpandedId(null);
      setExpandedEffects(null);
      fetchTickets();
      fetchCounts();
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
    else { toast.success("Ticket fechado"); fetchTickets(); fetchCounts(); }
  };

  const filters: { key: typeof filter; label: string; count: number }[] = [
    { key: "open", label: "Abertos", count: counts.open },
    { key: "closed", label: "Fechados", count: counts.closed },
    { key: "all", label: "Todos", count: counts.all },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

      {/* Filters with counters */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {filters.map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {f.label}
            <span className={`min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold ${filter === f.key ? "bg-primary-foreground/20 text-primary-foreground" : "bg-background/50 text-muted-foreground"}`}>
              {f.count}
            </span>
          </button>
        ))}
        <button onClick={() => { fetchTickets(); fetchCounts(); }} className="ml-auto p-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
          <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-xs">Nenhum ticket encontrado.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map((group) => (
            <div key={group.label} className="space-y-2">
              {/* Date group label */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{group.label}</span>
                <div className="flex-1 h-px bg-border/50" />
                <span className="text-[10px] text-muted-foreground">{group.tickets.length}</span>
              </div>

              {/* Tickets */}
              <AnimatePresence mode="popLayout">
                <div className="space-y-1.5">
                  {group.tickets.map((ticket) => {
                    const st = STATUS_MAP[ticket.status] || STATUS_MAP.open;
                    const StIcon = st.icon;
                    const isOpen = expandedId === ticket.id;
                    const r = getReply(ticket.id);
                    const isEffectsOpen = expandedEffects === ticket.id;
                    const userName = ticket.telegram_first_name || ticket.telegram_username || "Usuário";
                    const timeStr = formatFullDateTimeBR(ticket.created_at).split(",").pop()?.trim() || formatFullDateTimeBR(ticket.created_at);

                    return (
                      <motion.div key={ticket.id} layout initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                        className="bg-card border border-border rounded-xl overflow-hidden">

                        {/* Compact header row */}
                        <button type="button" onClick={() => setExpandedId(isOpen ? null : ticket.id)}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-muted/30 transition-colors">
                          {/* Avatar circle */}
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-foreground truncate">{userName}</span>
                              {ticket.telegram_username && (
                                <span className="text-[10px] text-muted-foreground">@{ticket.telegram_username}</span>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground truncate mt-0.5">{ticket.message}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-[10px] text-muted-foreground">{timeStr}</span>
                            <span className={`flex items-center gap-0.5 text-[10px] font-medium ${st.color}`}>
                              <StIcon className="w-3 h-3" />
                            </span>
                            {isOpen ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
                          </div>
                        </button>

                        {/* Expanded conversation view */}
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden">
                              <div className="px-3 pb-3 space-y-2 border-t border-border/50 pt-2">

                                {/* Chat-style messages */}
                                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                  {/* User message bubble */}
                                  <div className="flex gap-2 items-end">
                                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                      <User className="w-3 h-3 text-muted-foreground" />
                                    </div>
                                    <div className="max-w-[80%] bg-muted rounded-2xl rounded-bl-md px-3 py-2 space-y-1.5">
                                      {ticket.image_url && (
                                        <a href={ticket.image_url} target="_blank" rel="noopener noreferrer">
                                          <img src={ticket.image_url} alt="Anexo" className="max-h-32 rounded-lg object-cover hover:opacity-90 transition-opacity" />
                                        </a>
                                      )}
                                      <p className="text-xs text-foreground whitespace-pre-wrap">{ticket.message}</p>
                                      <p className="text-[9px] text-muted-foreground">{formatFullDateTimeBR(ticket.created_at)}</p>
                                    </div>
                                  </div>

                                  {/* Admin reply bubble */}
                                  {ticket.admin_reply && (
                                    <div className="flex gap-2 items-end justify-end">
                                      <div className="max-w-[80%] bg-primary/15 border border-primary/20 rounded-2xl rounded-br-md px-3 py-2 space-y-1">
                                        <p className="text-[9px] font-medium text-primary">Resposta do Admin</p>
                                        <p className="text-xs text-foreground whitespace-pre-wrap"
                                          dangerouslySetInnerHTML={{ __html: renderTelegramHtml(ticket.admin_reply) }} />
                                        {ticket.replied_at && (
                                          <p className="text-[9px] text-muted-foreground">{formatFullDateTimeBR(ticket.replied_at)}</p>
                                        )}
                                      </div>
                                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                        <MessageCircle className="w-3 h-3 text-primary" />
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Reply area — only for non-closed tickets */}
                                {ticket.status !== "closed" && (
                                  <div className="space-y-2 pt-1 border-t border-border/30">
                                    {/* Quick replies */}
                                    <div className="flex flex-wrap gap-1">
                                      {QUICK_REPLIES.map((qr) => (
                                        <button key={qr.label} type="button"
                                          onClick={() => updateReply(ticket.id, { text: qr.text })}
                                          className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-muted text-[9px] text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors">
                                          <span>{qr.emoji}</span> {qr.label}
                                        </button>
                                      ))}
                                    </div>

                                    {/* Text input */}
                                    <TextFormatToolbar
                                      value={r.text}
                                      onChange={(val) => updateReply(ticket.id, { text: val })}
                                      placeholder="Digite a resposta..."
                                      rows={2}
                                      className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-y"
                                    />

                                    {/* Feature toggles */}
                                    <div className="flex flex-wrap gap-1.5">
                                      <button type="button" onClick={() => updateReply(ticket.id, { enableImage: !r.enableImage })}
                                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] transition-colors ${r.enableImage ? "bg-primary/20 text-primary border border-primary/30" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                                        <Image className="w-3 h-3" /> Imagem
                                      </button>
                                      <button type="button" onClick={() => {
                                        const newVal = !r.enableButtons;
                                        updateReply(ticket.id, { enableButtons: newVal, buttons: newVal && r.buttons.length === 0 ? [{ text: "", url: "" }] : r.buttons });
                                      }}
                                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] transition-colors ${r.enableButtons ? "bg-primary/20 text-primary border border-primary/30" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                                        <Link className="w-3 h-3" /> Botões
                                      </button>
                                      <button type="button" onClick={() => setExpandedEffects(isEffectsOpen ? null : ticket.id)}
                                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] bg-muted text-muted-foreground hover:text-foreground transition-colors">
                                        <Sparkles className="w-3 h-3" /> Efeitos
                                        {isEffectsOpen ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
                                      </button>
                                    </div>

                                    {/* Image upload */}
                                    {r.enableImage && (
                                      <div className="p-2 rounded-lg bg-muted/50 border border-border/50">
                                        {r.imageUrl ? (
                                          <div className="relative inline-block">
                                            <img src={r.imageUrl} alt="Preview" className="max-h-20 rounded-lg" />
                                            <button type="button" onClick={() => updateReply(ticket.id, { imageUrl: null })}
                                              className="absolute -top-1.5 -right-1.5 p-0.5 bg-destructive text-destructive-foreground rounded-full">
                                              <X className="w-3 h-3" />
                                            </button>
                                          </div>
                                        ) : (
                                          <button type="button" disabled={uploadingImage === ticket.id}
                                            onClick={() => { activeTicketRef.current = ticket.id; fileInputRef.current?.click(); }}
                                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted text-[10px] text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50">
                                            {uploadingImage === ticket.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                                            {uploadingImage === ticket.id ? "Enviando..." : "Escolher Imagem"}
                                          </button>
                                        )}
                                      </div>
                                    )}

                                    {/* Inline buttons */}
                                    {r.enableButtons && (
                                      <div className="space-y-1.5 p-2 rounded-lg bg-muted/50 border border-border/50">
                                        {r.buttons.map((btn, idx) => (
                                          <div key={idx} className="flex gap-1.5 items-start">
                                            <div className="flex-1 space-y-1">
                                              <input value={btn.text} placeholder="Texto do botão"
                                                onChange={(e) => { const nb = [...r.buttons]; nb[idx] = { ...nb[idx], text: e.target.value }; updateReply(ticket.id, { buttons: nb }); }}
                                                className="w-full px-2 py-1 rounded-lg bg-muted border border-border text-foreground text-[10px] placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                                              <input value={btn.url} placeholder="https://exemplo.com" type="url"
                                                onChange={(e) => { const nb = [...r.buttons]; nb[idx] = { ...nb[idx], url: e.target.value }; updateReply(ticket.id, { buttons: nb }); }}
                                                className="w-full px-2 py-1 rounded-lg bg-muted border border-border text-foreground text-[10px] placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                                            </div>
                                            <button type="button" onClick={() => updateReply(ticket.id, { buttons: r.buttons.filter((_, i) => i !== idx) })}
                                              className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          </div>
                                        ))}
                                        {r.buttons.length < 3 && (
                                          <button type="button" onClick={() => updateReply(ticket.id, { buttons: [...r.buttons, { text: "", url: "" }] })}
                                            className="w-full flex items-center justify-center gap-1 py-1 rounded-lg bg-muted text-[9px] text-muted-foreground hover:text-foreground transition-colors">
                                            <Plus className="w-2.5 h-2.5" /> Adicionar Botão
                                          </button>
                                        )}
                                      </div>
                                    )}

                                    {/* Effects panel */}
                                    <AnimatePresence>
                                      {isEffectsOpen && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                          <div className="flex flex-wrap gap-1 py-1">
                                            {MESSAGE_EFFECTS.map((effect) => (
                                              <button key={effect.id} type="button"
                                                onClick={() => updateReply(ticket.id, { effectId: effect.id })}
                                                className={`flex items-center gap-0.5 px-2 py-1 rounded-md border text-[9px] transition-all ${
                                                  r.effectId === effect.id
                                                    ? "border-primary ring-1 ring-primary/30 bg-primary/10 text-primary"
                                                    : "border-border/50 bg-muted text-muted-foreground hover:border-border"
                                                }`}>
                                                <span>{effect.emoji}</span> {effect.label}
                                              </button>
                                            ))}
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>

                                    {/* Send + Close */}
                                    <div className="flex gap-1.5">
                                      <button onClick={() => handleReply(ticket)}
                                        disabled={sending === ticket.id || !r.text.trim()}
                                        className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-[11px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-1.5">
                                        {sending === ticket.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                                        Enviar Resposta
                                      </button>
                                      {ticket.status === "answered" && (
                                        <button onClick={() => handleClose(ticket.id)}
                                          className="px-3 py-2 rounded-lg bg-muted text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors text-[11px] font-medium">
                                          Fechar
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Closed ticket indicator */}
                                {ticket.status === "closed" && (
                                  <p className="text-[10px] text-muted-foreground text-center py-1 italic">🔒 Ticket fechado</p>
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
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
