import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { styledToast as toast } from "@/lib/toast";
import { formatDateTimeBR } from "@/lib/timezone";
import { validateTextInput, sanitizeText } from "@/lib/inputValidation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Send, ArrowLeft, Plus, Loader2, Image, X,
  Clock, CheckCircle2, XCircle, Activity,
} from "lucide-react";

/* ═══ Types ═══ */
interface Ticket {
  id: string;
  subject: string | null;
  status: string;
  department: string;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_role: string;
  message: string;
  image_url: string | null;
  is_read: boolean;
  created_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  open: { label: "Aberto", color: "text-blue-400", dot: "bg-blue-400" },
  in_progress: { label: "Em Andamento", color: "text-warning", dot: "bg-warning" },
  resolved: { label: "Resolvido", color: "text-success", dot: "bg-success" },
  closed: { label: "Fechado", color: "text-destructive", dot: "bg-destructive" },
};

const IMG_REGEX = /\[img:(https?:\/\/[^\]]+)\]/g;

interface Props {
  onClose: () => void;
  onUnreadChange?: (count: number) => void;
}

export function SupportChatWidget({ onClose, onUnreadChange }: Props) {
  const { user, role } = useAuth();
  const isAdmin = role === "admin";
  const userId = user?.id;

  const [view, setView] = useState<"list" | "chat" | "create">("list");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Create
  const [newSubject, setNewSubject] = useState("");
  const [creating, setCreating] = useState(false);

  // Message input
  const [msgText, setMsgText] = useState("");
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const sendingRef = useRef(false);

  /* ─── Fetch tickets ─── */
  const fetchTickets = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    let q = (supabase.from("support_tickets") as any)
      .select("id, subject, status, department, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (!isAdmin) q = q.eq("user_id", userId);

    const { data } = await q;

    // Sort: active first, then by date
    const activeStatuses = ["open", "in_progress"];
    const sorted = (data || []).sort((a: Ticket, b: Ticket) => {
      const aActive = activeStatuses.includes(a.status) ? 0 : 1;
      const bActive = activeStatuses.includes(b.status) ? 0 : 1;
      if (aActive !== bActive) return aActive - bActive;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    setTickets(sorted);
    setLoading(false);
  }, [userId, isAdmin]);

  /* ─── Fetch messages ─── */
  const fetchMessages = useCallback(async (ticketId: string) => {
    setLoadingMessages(true);
    const { data } = await (supabase.from("support_messages") as any)
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });
    setMessages(data || []);
    setLoadingMessages(false);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

    // Mark as read
    const trackRole = isAdmin ? "client" : "admin";
    const unreadIds = (data || []).filter((m: Message) => !m.is_read && m.sender_role === trackRole).map((m: Message) => m.id);
    if (unreadIds.length > 0) {
      await (supabase.from("support_messages") as any).update({ is_read: true }).in("id", unreadIds);
    }
  }, [isAdmin]);

  /* ─── Fetch unread ─── */
  const fetchUnread = useCallback(async () => {
    if (!userId) return;
    const trackRole = isAdmin ? "client" : "admin";
    let q = (supabase.from("support_messages") as any)
      .select("id", { count: "exact", head: true })
      .eq("is_read", false)
      .eq("sender_role", trackRole);

    if (!isAdmin) {
      // Only count for user's own tickets
      const { data: userTicketIds } = await (supabase.from("support_tickets") as any)
        .select("id")
        .eq("user_id", userId);
      if (userTicketIds && userTicketIds.length > 0) {
        q = q.in("ticket_id", userTicketIds.map((t: any) => t.id));
      } else {
        onUnreadChange?.(0);
        return;
      }
    }

    const { count } = await q;
    onUnreadChange?.(count || 0);
  }, [userId, isAdmin, onUnreadChange]);

  useEffect(() => { fetchTickets(); fetchUnread(); }, [fetchTickets, fetchUnread]);

  /* ─── Realtime ─── */
  useEffect(() => {
    if (!userId) return;
    const ch = supabase
      .channel("widget-unread-updates")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "support_messages" }, () => fetchUnread())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [userId, fetchUnread]);

  useEffect(() => {
    if (!selectedTicket) return;
    const ch = supabase
      .channel(`ticket-${selectedTicket.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "support_messages", filter: `ticket_id=eq.${selectedTicket.id}` }, (payload: any) => {
        const newMsg = payload.new as Message;
        setMessages(prev => [...prev, newMsg]);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        // Auto-mark as read
        const trackRole = isAdmin ? "client" : "admin";
        if (newMsg.sender_role === trackRole) {
          (supabase.from("support_messages") as any).update({ is_read: true }).eq("id", newMsg.id).then(() => {});
          fetchUnread();
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [selectedTicket, isAdmin, fetchUnread]);

  /* ─── Select ticket ─── */
  const selectTicket = (t: Ticket) => {
    setSelectedTicket(t);
    setView("chat");
    fetchMessages(t.id);
  };

  /* ─── Create ticket ─── */
  const handleCreate = async () => {
    const v = validateTextInput(newSubject, { min: 3, max: 200, label: "Assunto" });
    if (!v.valid) { toast.error(v.error!); return; }
    if (!userId) return;
    setCreating(true);
    try {
      const { data: profile } = await supabase.from("profiles").select("telegram_id, telegram_username, nome").eq("id", userId).single();
      const telegramChatId = profile?.telegram_id ? String(profile.telegram_id) : `web-${userId}`;
      const { data: ticket, error } = await (supabase.from("support_tickets") as any)
        .insert({
          user_id: userId,
          subject: sanitizeText(newSubject),
          telegram_chat_id: telegramChatId,
          telegram_username: profile?.telegram_username || null,
          telegram_first_name: profile?.nome || null,
          message: sanitizeText(newSubject),
          status: "open",
          priority: "medium",
          department: "support",
        })
        .select()
        .single();
      if (error) throw error;
      toast.success("Ticket criado!");
      setNewSubject("");
      fetchTickets();
      if (ticket) selectTicket(ticket);
    } catch (e: any) { toast.error(e.message || "Erro"); }
    setCreating(false);
  };

  /* ─── Send message ─── */
  const handleSend = async () => {
    if (!selectedTicket || !userId) return;
    const text = msgText.trim();
    if (!text || sendingRef.current) return;
    sendingRef.current = true;
    setSending(true);
    setMsgText("");
    try {
      await (supabase.from("support_messages") as any).insert({
        ticket_id: selectedTicket.id,
        sender_id: userId,
        sender_role: isAdmin ? "admin" : "client",
        message: sanitizeText(text),
        origin: "web",
      });

      // Forward to Telegram
      if (isAdmin) {
        const { data: ticket } = await (supabase.from("support_tickets") as any)
          .select("telegram_chat_id, telegram_username, telegram_first_name, user_id")
          .eq("id", selectedTicket.id)
          .single();
        if (ticket?.telegram_chat_id && !ticket.telegram_chat_id.startsWith("web-")) {
          supabase.functions.invoke("telegram-notify", {
            body: {
              chat_id: ticket.telegram_chat_id,
              message: `💬 <b>Resposta do Suporte</b>\n\n${sanitizeText(text)}\n\n<i>💡 Você pode responder diretamente aqui.</i>`,
              reopen_support_session: true,
              session_data: {
                telegram_username: ticket.telegram_username || "",
                telegram_first_name: ticket.telegram_first_name || "",
                user_id: ticket.user_id || null,
              },
            },
          }).catch(() => {});
        }
      } else {
        const { getSupportAdminTelegramId } = await import("@/hooks/useSupportAdminId");
        const adminChatId = await getSupportAdminTelegramId();
        supabase.functions.invoke("telegram-notify", {
          body: {
            chat_id: adminChatId,
            message: `📩 <b>Nova mensagem no Suporte</b>\n\n👤 ${selectedTicket.subject || "Ticket"}\n\n💬 <i>${text.slice(0, 300)}</i>`,
          },
        }).catch(() => {});
      }
    } catch (e: any) { toast.error(e.message || "Erro"); }
    sendingRef.current = false;
    setSending(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="fixed bottom-20 md:bottom-16 right-4 w-[340px] h-[min(450px,calc(100vh-12rem))] bg-card/95 backdrop-blur-xl rounded-2xl border border-border shadow-2xl flex flex-col overflow-hidden z-50"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-gradient-to-r from-destructive/10 to-transparent flex items-center gap-3">
        {view !== "list" && (
          <button onClick={() => { setView("list"); setSelectedTicket(null); }} className="p-1 rounded-lg hover:bg-muted">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
        <Shield className="w-5 h-5 text-destructive" />
        <p className="text-sm font-bold text-foreground flex-1">
          {view === "create" ? "Novo Ticket" : view === "chat" ? (selectedTicket?.subject || "Chat") : "Suporte"}
        </p>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          {/* ─── LIST ─── */}
          {view === "list" && (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col overflow-hidden">
              <div className="p-3">
                {!isAdmin && (
                  <button onClick={() => setView("create")}
                    className="w-full py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" /> Novo Ticket
                  </button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
                ) : tickets.length === 0 ? (
                  <div className="text-center py-8 px-6">
                    <Shield className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-[11px] text-muted-foreground">Nenhum ticket</p>
                  </div>
                ) : tickets.map(t => {
                  const cfg = STATUS_CONFIG[t.status] || STATUS_CONFIG.open;
                  return (
                    <button key={t.id} onClick={() => selectTicket(t)}
                      className="w-full text-left px-4 py-3 border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${cfg.dot} shrink-0`} />
                        <p className="text-xs font-semibold text-foreground truncate flex-1">{t.subject || "Sem assunto"}</p>
                        <span className={`text-[9px] font-medium ${cfg.color}`}>{cfg.label}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5 pl-4">{formatDateTimeBR(t.created_at)}</p>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ─── CREATE ─── */}
          {view === "create" && (
            <motion.div key="create" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 space-y-3">
              <p className="text-xs font-semibold text-foreground">📝 Descreva seu problema</p>
              <input
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Assunto..."
                maxLength={200}
                className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button onClick={handleCreate} disabled={creating || !newSubject.trim()}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1.5">
                {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Enviar
              </button>
            </motion.div>
          )}

          {/* ─── CHAT ─── */}
          {view === "chat" && selectedTicket && (
            <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {loadingMessages ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-[11px] text-muted-foreground">Envie sua mensagem</p>
                  </div>
                ) : messages.map(m => {
                  const isOwn = m.sender_id === userId;
                  if (m.sender_role === "system") {
                    return (
                      <div key={m.id} className="text-center">
                        <span className="text-[10px] text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full">{m.message}</span>
                      </div>
                    );
                  }
                  return (
                    <div key={m.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs ${isOwn ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted/60 text-foreground rounded-bl-md"}`}>
                        <p className="whitespace-pre-wrap break-words">{m.message.replace(IMG_REGEX, "")}</p>
                        {m.image_url && <img src={m.image_url} alt="" className="max-h-32 rounded-lg mt-1" />}
                        <p className={`text-[9px] mt-0.5 ${isOwn ? "text-primary-foreground/50" : "text-muted-foreground"}`}>
                          {formatDateTimeBR(m.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>
              {(selectedTicket.status === "open" || selectedTicket.status === "in_progress") && (
                <div className="p-3 border-t border-border flex gap-2">
                  <input
                    value={msgText}
                    onChange={(e) => setMsgText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="Mensagem..."
                    maxLength={4096}
                    className="flex-1 px-3 py-2 rounded-xl bg-muted border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button onClick={handleSend} disabled={sending || !msgText.trim()}
                    className="p-2 rounded-xl bg-primary text-primary-foreground disabled:opacity-50">
                    {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
