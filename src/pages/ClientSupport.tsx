import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { styledToast as toast } from "@/lib/toast";
import { formatDateTimeBR } from "@/lib/timezone";
import { validateTextInput, sanitizeText } from "@/lib/inputValidation";
import { TicketListSkeleton, ChatSkeleton } from "@/components/support/SupportSkeletons";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Plus, Send, ArrowLeft, CheckCircle2, Clock, XCircle,
  Loader2, Image, X, Activity, HeadphoneOff,
} from "lucide-react";

/* ═══ Types ═══ */
interface Ticket {
  id: string;
  subject: string | null;
  status: string;
  priority: string;
  department: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
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

/* ═══ Config ═══ */
const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  open: { label: "Aberto", color: "text-blue-400", dot: "bg-blue-400" },
  in_progress: { label: "Em Andamento", color: "text-warning", dot: "bg-warning" },
  resolved: { label: "Resolvido", color: "text-success", dot: "bg-success" },
  closed: { label: "Fechado", color: "text-destructive", dot: "bg-destructive" },
};

const DEPARTMENTS: Record<string, { label: string; icon: string }> = {
  support: { label: "Suporte", icon: "🎧" },
  admin: { label: "Administração", icon: "👑" },
  moderation: { label: "Moderação", icon: "🛡️" },
  recarga: { label: "Recarga", icon: "🔋" },
};

const IMG_REGEX = /\[img:(https?:\/\/[^\]]+)\]/g;

/* ═══ Sub-components (stable, no remount) ═══ */
function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.open;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold ${cfg.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function TicketItem({ ticket, selected, onClick }: { ticket: Ticket; selected: boolean; onClick: () => void }) {
  const dept = DEPARTMENTS[ticket.department] || DEPARTMENTS.support;
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 border-b border-border/50 transition-colors hover:bg-muted/30 ${selected ? "bg-primary/10 border-l-2 border-l-primary" : ""}`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-foreground truncate flex-1">
          {ticket.subject || "Sem assunto"}
        </p>
        <StatusBadge status={ticket.status} />
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-[10px] text-muted-foreground">{dept.icon} {dept.label}</span>
        <span className="text-[10px] text-muted-foreground">• {formatDateTimeBR(ticket.created_at)}</span>
      </div>
    </button>
  );
}

function MessageBubble({ msg, isOwnMessage }: { msg: Message; isOwnMessage: boolean }) {
  const isSystem = msg.sender_role === "system";

  if (isSystem) {
    const statusMatch = msg.message.match(/\[status:(\w+)\]\s*(.*)/);
    const statusKey = statusMatch?.[1] || "";
    const displayText = statusMatch?.[2] || msg.message;
    const cfg = STATUS_CONFIG[statusKey] || { color: "text-muted-foreground", dot: "bg-muted-foreground" };
    return (
      <div className="flex justify-center my-2">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-medium border border-border/50 bg-muted/30 ${cfg.color}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
          <span>{displayText}</span>
          <span className="text-[10px] opacity-60">{formatDateTimeBR(msg.created_at)}</span>
        </div>
      </div>
    );
  }

  // Parse images from message
  const parts: (string | { type: "img"; url: string })[] = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;
  const regex = new RegExp(IMG_REGEX.source, "g");
  while ((match = regex.exec(msg.message)) !== null) {
    if (match.index > lastIdx) parts.push(msg.message.slice(lastIdx, match.index));
    parts.push({ type: "img", url: match[1] });
    lastIdx = match.index + match[0].length;
  }
  if (lastIdx < msg.message.length) parts.push(msg.message.slice(lastIdx));

  const roleLabel = msg.sender_role === "admin" ? "Admin" : msg.sender_role === "support" ? "Suporte" : msg.sender_role === "moderator" ? "Moderador" : null;

  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-2`}>
      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${isOwnMessage ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted/60 text-foreground rounded-bl-md"}`}>
        {roleLabel && !isOwnMessage && (
          <span className={`text-[9px] font-bold uppercase tracking-wider mb-1 block ${msg.sender_role === "admin" ? "text-destructive" : "text-primary"}`}>
            {roleLabel}
          </span>
        )}
        {parts.map((p, i) =>
          typeof p === "string" ? (
            <p key={i} className="text-xs whitespace-pre-wrap break-words">{p}</p>
          ) : (
            <img key={i} src={p.url} alt="Anexo" className="max-h-48 rounded-lg mt-1 cursor-pointer" onClick={() => window.open(p.url, "_blank")} />
          )
        )}
        {msg.image_url && <img src={msg.image_url} alt="Anexo" className="max-h-48 rounded-lg mt-1 cursor-pointer" onClick={() => window.open(msg.image_url!, "_blank")} />}
        <p className={`text-[10px] mt-1 ${isOwnMessage ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
          {formatDateTimeBR(msg.created_at)}
          {isOwnMessage && msg.is_read && " ✓✓"}
        </p>
      </div>
    </div>
  );
}

/* ═══ Main Component ═══ */
export default function ClientSupport() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [supportEnabled, setSupportEnabled] = useState(true);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  // New ticket
  const [showCreate, setShowCreate] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [creating, setCreating] = useState(false);

  // Message input
  const [msgText, setMsgText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const userId = user?.id;

  /* ─── Fetch tickets ─── */
  const fetchTickets = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await (supabase.from("support_tickets") as any)
      .select("id, subject, status, priority, department, created_at, updated_at, resolved_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setTickets(data || []);
    setLoading(false);
  }, [userId]);

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

    // Mark admin messages as read
    if (data && data.length > 0) {
      const unreadIds = data.filter((m: Message) => !m.is_read && m.sender_role !== "client").map((m: Message) => m.id);
      if (unreadIds.length > 0) {
        await (supabase.from("support_messages") as any)
          .update({ is_read: true })
          .in("id", unreadIds);
      }
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  useEffect(() => {
    const loadSupportEnabled = async () => {
      const { data } = await (supabase.from("system_config") as any)
        .select("value")
        .eq("key", "supportEnabled")
        .maybeSingle();
      setSupportEnabled(data?.value !== "false");
    };

    loadSupportEnabled();

    const ch = supabase
      .channel("client-support-enabled")
      .on("postgres_changes", { event: "*", schema: "public", table: "system_config", filter: "key=eq.supportEnabled" }, (payload: any) => {
        setSupportEnabled(payload.new?.value !== "false");
      })
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, []);

  /* ─── Realtime: tickets ─── */
  useEffect(() => {
    if (!userId) return;
    const ch = supabase
      .channel("client-tickets-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "support_tickets", filter: `user_id=eq.${userId}` }, () => {
        fetchTickets();
        if (selectedTicket) fetchMessages(selectedTicket.id);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [userId, fetchTickets, selectedTicket, fetchMessages]);

  /* ─── Realtime: messages ─── */
  useEffect(() => {
    if (!selectedTicket) return;
    const ch = supabase
      .channel(`client-ticket-${selectedTicket.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "support_messages", filter: `ticket_id=eq.${selectedTicket.id}` }, (payload: any) => {
        const newMsg = payload.new as Message;
        setMessages(prev => [...prev, newMsg]);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        // Auto-mark as read
        if (newMsg.sender_role !== "client") {
          (supabase.from("support_messages") as any).update({ is_read: true }).eq("id", newMsg.id).then(() => {});
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [selectedTicket]);

  /* ─── Select ticket ─── */
  const selectTicket = (t: Ticket) => {
    setSelectedTicket(t);
    setMobileView("chat");
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

      toast.success("Ticket criado com sucesso!");
      setNewSubject("");
      setShowCreate(false);
      fetchTickets();
      if (ticket) selectTicket(ticket);
    } catch (e: any) {
      toast.error(e.message || "Erro ao criar ticket");
    }
    setCreating(false);
  };

  /* ─── Send message ─── */
  const handleSend = async () => {
    if (!selectedTicket || !userId) return;
    const text = msgText.trim();
    const imgTag = imageUrl ? `[img:${imageUrl}]` : "";
    const finalMsg = (text + (imgTag ? "\n" + imgTag : "")).trim();
    if (!finalMsg) return;

    const v = validateTextInput(finalMsg, { max: 4096 });
    if (!v.valid) { toast.error(v.error!); return; }

    setSending(true);
    try {
      const { error } = await (supabase.from("support_messages") as any).insert({
        ticket_id: selectedTicket.id,
        sender_id: userId,
        sender_role: "client",
        message: sanitizeText(finalMsg),
        image_url: imageUrl,
        origin: "web",
      });
      if (error) throw error;

      // Notify admin via Telegram (fire-and-forget)
      const adminChatId = 1901426549;
      const plainText = sanitizeText(text).replace(/\[img:[^\]]+\]/g, "").trim();
      if (plainText || imageUrl) {
        supabase.functions.invoke("telegram-notify", {
          body: {
            chat_id: String(adminChatId),
            message: `📩 <b>Nova mensagem no Suporte</b>\n\n👤 ${selectedTicket.subject || "Ticket"}\n\n💬 <i>${plainText.slice(0, 300)}</i>${imageUrl ? "\n📷 <i>Com imagem</i>" : ""}`,
          },
        }).catch(() => {});
      }

      setMsgText("");
      setImageUrl(null);
    } catch (e: any) {
      toast.error(e.message || "Erro ao enviar");
    }
    setSending(false);
  };

  /* ─── Resolve ticket ─── */
  const handleResolve = async () => {
    if (!selectedTicket) return;
    await (supabase.from("support_tickets") as any)
      .update({ status: "closed", resolved_at: new Date().toISOString() })
      .eq("id", selectedTicket.id);
    // Insert system message
    await (supabase.from("support_messages") as any).insert({
      ticket_id: selectedTicket.id,
      sender_id: userId,
      sender_role: "system",
      message: "[status:closed] Ticket fechado pelo cliente.",
    });
    toast.success("Ticket fechado!");
    fetchTickets();
  };

  /* ─── Image upload ─── */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) {
      toast.error("Imagem inválida ou maior que 10MB");
      return;
    }
    setUploading(true);
    try {
      const fileName = `${userId}/${Date.now()}.${file.name.split(".").pop()}`;
      const { error } = await supabase.storage.from("chat-images").upload(fileName, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("chat-images").getPublicUrl(fileName);
      setImageUrl(publicUrl);
    } catch (err: any) {
      toast.error("Erro ao enviar imagem: " + err.message);
    }
    setUploading(false);
    if (e.target) e.target.value = "";
  };

  /* ─── Paste image ─── */
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          const dt = new DataTransfer();
          dt.items.add(file);
          if (fileRef.current) {
            fileRef.current.files = dt.files;
            fileRef.current.dispatchEvent(new Event("change", { bubbles: true }));
          }
        }
      }
    }
  };

  const activeTickets = tickets.filter(t => t.status === "open" || t.status === "in_progress");
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  /* ─── Ticket List JSX ─── */
  const ticketListContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <motion.div
            className="relative"
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Shield className="w-7 h-7 text-cyan-500 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]" />
            <motion.div
              className="absolute inset-0"
              animate={{ opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Shield className="w-7 h-7 text-cyan-400 blur-[2px]" />
            </motion.div>
          </motion.div>
          <div>
            <h2 className="text-base font-bold text-foreground">Central de Suporte</h2>
            <p className="text-[10px] text-muted-foreground">{activeTickets.length} ticket(s) ativo(s)</p>
          </div>
        </div>
        <button
          onClick={() => supportEnabled && setShowCreate(true)}
          disabled={!supportEnabled}
          className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:bg-muted disabled:text-muted-foreground disabled:hover:opacity-100 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" /> {supportEnabled ? "Novo Ticket" : "Suporte indisponível"}
        </button>
      </div>

      {/* Create dialog */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-border"
          >
            <div className="p-4 space-y-3">
              <p className="text-xs font-semibold text-foreground">📝 Novo Ticket</p>
              <input
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Descreva brevemente o assunto..."
                maxLength={200}
                className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreate}
                  disabled={creating || !newSubject.trim()}
                  className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Criar
                </button>
                <button
                  onClick={() => { setShowCreate(false); setNewSubject(""); }}
                  className="px-4 py-2 rounded-xl bg-muted text-muted-foreground text-xs font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <TicketListSkeleton />
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <Shield className="w-12 h-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">Nenhum ticket ainda</p>
            <p className="text-[10px] text-muted-foreground mt-1">Clique em "Novo Ticket" para abrir um chamado.</p>
          </div>
        ) : (
          tickets.map((t) => (
            <TicketItem key={t.id} ticket={t} selected={selectedTicket?.id === t.id} onClick={() => selectTicket(t)} />
          ))
        )}
      </div>
    </div>
  );

  /* ─── Chat JSX ─── */
  const chatContent = selectedTicket ? (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-3">
        <button onClick={() => { setMobileView("list"); setSelectedTicket(null); }} className="md:hidden p-1.5 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground truncate">{selectedTicket.subject || "Sem assunto"}</p>
          <div className="flex items-center gap-2">
            <StatusBadge status={selectedTicket.status} />
            <span className="text-[10px] text-muted-foreground">
              {DEPARTMENTS[selectedTicket.department]?.icon} {DEPARTMENTS[selectedTicket.department]?.label}
            </span>
          </div>
        </div>
        {(selectedTicket.status === "open" || selectedTicket.status === "in_progress" || selectedTicket.status === "resolved") && (
          <button
            onClick={handleResolve}
            className="px-3 py-1.5 rounded-lg bg-success/10 text-success text-[11px] font-bold hover:bg-success/20 transition-colors flex items-center gap-1"
          >
            <CheckCircle2 className="w-3 h-3" /> Resolvido
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {loadingMessages ? (
          <ChatSkeleton />
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Activity className="w-10 h-10 text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground">Envie sua primeira mensagem</p>
          </div>
        ) : (
          messages.map((m) => (
            <MessageBubble key={m.id} msg={m} isOwnMessage={m.sender_id === userId} />
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      {(selectedTicket.status === "open" || selectedTicket.status === "in_progress") && (
        <div className="p-3 border-t border-border bg-card/50">
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          {imageUrl && (
            <div className="mb-2 relative inline-block">
              <img src={imageUrl} alt="Anexo" className="max-h-20 rounded-lg" />
              <button onClick={() => setImageUrl(null)} className="absolute -top-1.5 -right-1.5 p-0.5 bg-destructive text-destructive-foreground rounded-full">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="p-2.5 rounded-xl bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />}
            </button>
            <input
              value={msgText}
              onChange={(e) => setMsgText(e.target.value)}
              onPaste={handlePaste}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Digite sua mensagem..."
              maxLength={4096}
              className="flex-1 px-4 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              onClick={handleSend}
              disabled={sending || (!msgText.trim() && !imageUrl)}
              className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <Shield className="w-16 h-16 text-muted-foreground/20 mb-4" />
      <p className="text-sm text-muted-foreground">Selecione um ticket para ver a conversa</p>
    </div>
  );

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-background rounded-2xl border border-border overflow-hidden">
      {!supportEnabled ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <HeadphoneOff className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <p className="text-base font-semibold text-foreground">Suporte temporariamente pausado</p>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">No momento não é possível abrir novos tickets nem continuar o atendimento pelo painel. Tente novamente mais tarde.</p>
        </div>
      ) : (
        <>
          {/* Desktop layout */}
          <div className="hidden md:flex w-full h-full">
            <div className="w-[320px] border-r border-border flex flex-col">{ticketListContent}</div>
            <div className="flex-1 flex flex-col">{chatContent}</div>
          </div>

          {/* Mobile layout */}
          <div className="md:hidden w-full h-full">
            <AnimatePresence mode="wait">
              {mobileView === "list" ? (
                <motion.div
                  key="list"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="h-full"
                >
                  {ticketListContent}
                </motion.div>
              ) : (
                <motion.div
                  key="chat"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="h-full"
                >
                  {chatContent}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}
