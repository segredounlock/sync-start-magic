import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { styledToast as toast } from "@/lib/toast";
import { formatDateTimeBR } from "@/lib/timezone";
import { validateTextInput, sanitizeText } from "@/lib/inputValidation";
import { SupportTemplates } from "@/components/support/SupportTemplates";
import { TicketListSkeleton, ChatSkeleton } from "@/components/support/SupportSkeletons";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Send, ArrowLeft, Loader2, Image, X, Search, Filter,
  ChevronRight, PanelRightClose, PanelRightOpen, Clock, Activity,
  CheckCircle2, XCircle, CornerDownRight, BadgeCheck, User as UserIcon,
  MoreVertical, Settings2, Zap, Flag,
} from "lucide-react";

/* ═══ Types ═══ */
interface Ticket {
  id: string;
  user_id: string | null;
  subject: string | null;
  status: string;
  priority: string;
  department: string;
  assigned_to: string | null;
  telegram_first_name: string | null;
  telegram_username: string | null;
  telegram_chat_id: string | null;
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

interface SenderProfile {
  id: string;
  nome: string | null;
  avatar_url: string | null;
  verification_badge: string | null;
}

/* ═══ Config ═══ */
const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  open: { label: "Aberto", color: "text-blue-400", dot: "bg-blue-400" },
  in_progress: { label: "Em Andamento", color: "text-warning", dot: "bg-warning" },
  resolved: { label: "Resolvido", color: "text-success", dot: "bg-success" },
  closed: { label: "Fechado", color: "text-destructive", dot: "bg-destructive" },
};

const DEPARTMENTS: Record<string, { label: string; icon: string; color: string }> = {
  support: { label: "Suporte", icon: "🎧", color: "text-emerald-400" },
  admin: { label: "Administração", icon: "👑", color: "text-destructive" },
  moderation: { label: "Moderação", icon: "🛡️", color: "text-blue-400" },
  recarga: { label: "Recarga", icon: "🔋", color: "text-amber-400" },
};

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  admin: { label: "Admin", color: "text-destructive", bg: "bg-destructive/20" },
  moderator: { label: "Moderador", color: "text-blue-400", bg: "bg-blue-500/20" },
  support: { label: "Suporte", color: "text-emerald-400", bg: "bg-emerald-500/20" },
};

const IMG_REGEX = /\[img:(https?:\/\/[^\]]+)\]/g;

const statusPriority: Record<string, number> = { open: 0, in_progress: 1, resolved: 2, closed: 3 };

/* ═══ Sub-components ═══ */
function DotBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.open;
  return <span className={`h-2 w-2 rounded-full ${cfg.dot} shrink-0`} />;
}

function AdminTicketItem({ ticket, selected, onClick, unread }: { ticket: Ticket; selected: boolean; onClick: () => void; unread: number }) {
  const dept = DEPARTMENTS[ticket.department] || DEPARTMENTS.support;
  const name = ticket.telegram_first_name || ticket.telegram_username || "Usuário";
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 border-b border-border/50 transition-colors hover:bg-muted/30 ${selected ? "bg-primary/10 border-l-2 border-l-primary" : ""}`}
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-foreground shrink-0">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-semibold text-foreground truncate">{name}</p>
            <DotBadge status={ticket.status} />
            {unread > 0 && (
              <span className="ml-auto px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[9px] font-bold min-w-[18px] text-center">
                {unread}
              </span>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground truncate">{ticket.subject || "Sem assunto"}</p>
          <p className="text-[9px] text-muted-foreground mt-0.5">{dept.icon} {dept.label} • {formatDateTimeBR(ticket.created_at)}</p>
        </div>
      </div>
    </button>
  );
}

function AdminMessageBubble({ msg, profile, isAdmin }: { msg: Message; profile?: SenderProfile; isAdmin: boolean }) {
  const isSystem = msg.sender_role === "system";

  if (isSystem) {
    const statusMatch = msg.message.match(/\[status:(\w+)\]\s*(.*)/);
    const fwdMatch = msg.message.match(/📋\s*(.*)/);
    const displayText = statusMatch?.[2] || fwdMatch?.[1] || msg.message;
    const statusKey = statusMatch?.[1] || "";
    const cfg = STATUS_CONFIG[statusKey] || { color: "text-muted-foreground", dot: "bg-muted-foreground" };
    return (
      <div className="flex justify-center my-2">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-medium border border-border/50 bg-muted/30 ${cfg.color}`}>
          {statusKey && <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />}
          <span>{displayText}</span>
          <span className="text-[10px] opacity-60">{formatDateTimeBR(msg.created_at)}</span>
        </div>
      </div>
    );
  }

  const isStaff = isAdmin;
  const roleCfg = ROLE_CONFIG[msg.sender_role];
  const senderName = profile?.nome || "Usuário";

  // Parse images
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

  return (
    <div className={`flex ${isStaff ? "justify-end" : "justify-start"} mb-2`}>
      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isStaff ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted/60 text-foreground rounded-bl-md"}`}>
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[11px] font-semibold">{senderName}</span>
          {roleCfg && (
            <>
              <BadgeCheck className="w-3 h-3" />
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${isStaff ? "bg-primary-foreground/20" : roleCfg.bg} font-medium`}>
                {roleCfg.label}
              </span>
            </>
          )}
        </div>
        {parts.map((p, i) =>
          typeof p === "string" ? (
            <p key={i} className="text-xs whitespace-pre-wrap break-words">{p}</p>
          ) : (
            <img key={i} src={p.url} alt="Anexo" className="max-h-48 rounded-lg mt-1 cursor-pointer" onClick={() => window.open(p.url, "_blank")} />
          )
        )}
        {msg.image_url && <img src={msg.image_url} alt="Anexo" className="max-h-48 rounded-lg mt-1 cursor-pointer" onClick={() => window.open(msg.image_url!, "_blank")} />}
        <p className={`text-[10px] mt-1 ${isStaff ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
          {formatDateTimeBR(msg.created_at)}
          {msg.is_read && " ✓✓"}
        </p>
      </div>
    </div>
  );
}

/* ═══ Main Component ═══ */
export default function AdminSupport() {
  const { user, role } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat" | "info">("list");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");

  // Info panel
  const [showInfoPanel, setShowInfoPanel] = useState(true);

  // Unread counts
  const [unreadMap, setUnreadMap] = useState<Record<string, number>>({});

  // Profiles
  const [senderProfiles, setSenderProfiles] = useState<Record<string, SenderProfile>>({});

  // Message input
  const [msgText, setMsgText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const userId = user?.id;

  /* ─── Stats ─── */
  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === "open").length;
    const inProgress = tickets.filter(t => t.status === "in_progress").length;
    const resolved = tickets.filter(t => t.status === "resolved" || t.status === "closed").length;
    return { total, open, inProgress, resolved };
  }, [tickets]);

  /* ─── Fetch tickets ─── */
  const fetchTickets = useCallback(async () => {
    setLoading(true);
    const { data } = await (supabase.from("support_tickets") as any)
      .select("id, user_id, subject, status, priority, department, assigned_to, telegram_first_name, telegram_username, telegram_chat_id, created_at, updated_at, resolved_at")
      .order("created_at", { ascending: false });

    const sortedTickets = (data || []).sort((a: Ticket, b: Ticket) =>
      (statusPriority[a.status] ?? 99) - (statusPriority[b.status] ?? 99)
    );
    setTickets(sortedTickets);
    setLoading(false);
  }, []);

  /* ─── Fetch messages ─── */
  const fetchMessages = useCallback(async (ticketId: string) => {
    setLoadingMessages(true);
    const { data } = await (supabase.from("support_messages") as any)
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });

    const msgs = data || [];
    setMessages(msgs);
    setLoadingMessages(false);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

    // Fetch sender profiles
    const senderIds = [...new Set(msgs.map((m: Message) => m.sender_id))];
    if (senderIds.length > 0) {
      const { data: profiles } = await supabase.from("profiles")
        .select("id, nome, avatar_url, verification_badge")
        .in("id", senderIds as string[]);
      const map: Record<string, SenderProfile> = {};
      (profiles || []).forEach((p: any) => { map[p.id] = p; });
      setSenderProfiles(map);
    }

    // Mark client messages as read
    const unreadIds = msgs.filter((m: Message) => !m.is_read && m.sender_role === "client").map((m: Message) => m.id);
    if (unreadIds.length > 0) {
      await (supabase.from("support_messages") as any)
        .update({ is_read: true })
        .in("id", unreadIds);
    }
  }, []);

  /* ─── Fetch unread counts ─── */
  const fetchUnreadCounts = useCallback(async () => {
    const { data } = await (supabase.from("support_messages") as any)
      .select("ticket_id")
      .eq("is_read", false)
      .eq("sender_role", "client");
    const map: Record<string, number> = {};
    (data || []).forEach((m: any) => { map[m.ticket_id] = (map[m.ticket_id] || 0) + 1; });
    setUnreadMap(map);
  }, []);

  useEffect(() => { fetchTickets(); fetchUnreadCounts(); }, [fetchTickets, fetchUnreadCounts]);

  /* ─── Deep linking ─── */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ticketId = params.get("ticket");
    if (ticketId && tickets.length > 0) {
      const t = tickets.find(tk => tk.id === ticketId);
      if (t) selectTicket(t);
    }
  }, [tickets]);

  /* ─── Realtime ─── */
  useEffect(() => {
    const ch = supabase
      .channel("admin-support-tickets")
      .on("postgres_changes", { event: "*", schema: "public", table: "support_tickets" }, () => fetchTickets())
      .subscribe();
    const ch2 = supabase
      .channel("admin-support-messages-unread")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "support_messages" }, () => fetchUnreadCounts())
      .subscribe();
    return () => { supabase.removeChannel(ch); supabase.removeChannel(ch2); };
  }, [fetchTickets, fetchUnreadCounts]);

  useEffect(() => {
    if (!selectedTicket) return;
    const ch = supabase
      .channel(`admin-ticket-${selectedTicket.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "support_messages", filter: `ticket_id=eq.${selectedTicket.id}` }, (payload: any) => {
        const newMsg = payload.new as Message;
        setMessages(prev => [...prev, newMsg]);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        // Fetch profile if needed
        if (!senderProfiles[newMsg.sender_id]) {
          supabase.from("profiles").select("id, nome, avatar_url, verification_badge").eq("id", newMsg.sender_id).single().then(({ data }) => {
            if (data) setSenderProfiles(prev => ({ ...prev, [data.id]: data as SenderProfile }));
          });
        }
        // Mark as read if client message
        if (newMsg.sender_role === "client") {
          (supabase.from("support_messages") as any).update({ is_read: true }).eq("id", newMsg.id).then(() => {});
          fetchUnreadCounts();
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [selectedTicket, senderProfiles, fetchUnreadCounts]);

  /* ─── Filtered tickets ─── */
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (deptFilter !== "all" && t.department !== deptFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const name = (t.telegram_first_name || t.telegram_username || "").toLowerCase();
        const subj = (t.subject || "").toLowerCase();
        if (!name.includes(q) && !subj.includes(q)) return false;
      }
      return true;
    });
  }, [tickets, statusFilter, deptFilter, searchQuery]);

  /* ─── Select ticket ─── */
  const selectTicket = (t: Ticket) => {
    setSelectedTicket(t);
    setMobileView("chat");
    fetchMessages(t.id);
  };

  /* ─── Update status ─── */
  const updatingStatusRef = useRef(false);
  const updateStatus = async (newStatus: string, silent = false) => {
    if (!selectedTicket || !userId) return;
    // Prevent duplicate calls & no-op if same status
    if (updatingStatusRef.current || selectedTicket.status === newStatus) return;
    updatingStatusRef.current = true;

    const statusLabel = STATUS_CONFIG[newStatus]?.label || newStatus;
    try {
      await (supabase.from("support_tickets") as any)
        .update({
          status: newStatus,
          ...(newStatus === "resolved" || newStatus === "closed" ? { resolved_at: new Date().toISOString() } : {}),
        })
        .eq("id", selectedTicket.id);

      if (!silent) {
        await (supabase.from("support_messages") as any).insert({
          ticket_id: selectedTicket.id,
          sender_id: userId,
          sender_role: "system",
          message: `[status:${newStatus}] Ticket alterado para ${statusLabel}`,
          origin: "web",
        });
      }

      // Notify user via Telegram
      if (selectedTicket.telegram_chat_id && !selectedTicket.telegram_chat_id.startsWith("web-")) {
        const statusEmoji: Record<string, string> = {
          in_progress: "⏳",
          resolved: "✅",
          closed: "🔒",
          open: "🔄",
        };
        const emoji = statusEmoji[newStatus] || "ℹ️";
        let tgMessage = `${emoji} <b>Suporte - Status Atualizado</b>\n\nSeu ticket foi alterado para: <b>${statusLabel}</b>`;
        if (newStatus === "closed") {
          tgMessage += `\n\n🔒 Este atendimento foi encerrado.\nPara abrir um novo chamado, use /suporte.`;
        } else if (newStatus === "resolved") {
          tgMessage += `\n\n✅ Problema resolvido! Caso precise de mais ajuda, responda aqui.`;
        }
        supabase.functions.invoke("telegram-notify", {
          body: {
            chat_id: selectedTicket.telegram_chat_id,
            message: tgMessage,
            ...(newStatus === "closed" ? { close_support_session: true } : {}),
          },
        }).catch(() => {});
      }

      setSelectedTicket(prev => prev ? { ...prev, status: newStatus } : null);
      fetchTickets();
      if (!silent) toast.success(`Status alterado para ${statusLabel}`);
    } finally {
      updatingStatusRef.current = false;
    }
  };

  /* ─── Forward to department ─── */
  const forwardToDepartment = async (dept: string) => {
    if (!selectedTicket || !userId) return;
    await (supabase.from("support_tickets") as any)
      .update({ department: dept })
      .eq("id", selectedTicket.id);
    const deptInfo = DEPARTMENTS[dept] || { icon: "📋", label: dept };
    await (supabase.from("support_messages") as any).insert({
      ticket_id: selectedTicket.id,
      sender_id: userId,
      sender_role: "system",
      message: `📋 Este ticket foi encaminhado para o setor: ${deptInfo.icon} ${deptInfo.label}.`,
    });
    setSelectedTicket(prev => prev ? { ...prev, department: dept } : null);
    fetchTickets();
    toast.success(`Encaminhado para ${deptInfo.label}`);
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
      await (supabase.from("support_messages") as any).insert({
        ticket_id: selectedTicket.id,
        sender_id: userId,
        sender_role: role === "admin" ? "admin" : "support",
        message: sanitizeText(finalMsg),
        image_url: imageUrl,
        origin: "web",
      });

      // Auto-progress from open to in_progress (silent — no extra system message or Telegram notification)
      if (selectedTicket.status === "open") {
        updateStatus("in_progress", true);
      }

      // Forward to Telegram if user has telegram_chat_id
      const telegramChatId = (selectedTicket as any).telegram_chat_id;
      if (telegramChatId && !telegramChatId.startsWith("web-")) {
        const plainText = sanitizeText(text).replace(/\[img:[^\]]+\]/g, "").trim();
        const telegramMsg = `💬 <b>Resposta do Suporte</b>\n\n${plainText}\n\n<i>💡 Você pode responder diretamente aqui.</i>`;
        supabase.functions.invoke("telegram-notify", {
          body: {
            chat_id: telegramChatId,
            message: telegramMsg,
            image_url: imageUrl || undefined,
            reopen_support_session: true,
            session_data: {
              telegram_username: selectedTicket.telegram_username || "",
              telegram_first_name: selectedTicket.telegram_first_name || "",
              user_id: selectedTicket.user_id || null,
            },
          },
        }).catch((e: any) => console.error("Telegram forward failed:", e));
      }

      setMsgText("");
      setImageUrl(null);
    } catch (e: any) {
      toast.error(e.message || "Erro ao enviar");
    }
    setSending(false);
  };

  /* ─── Image upload ─── */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) {
      toast.error("Imagem inválida ou maior que 10MB"); return;
    }
    setUploading(true);
    try {
      const fileName = `support/${Date.now()}.${file.name.split(".").pop()}`;
      const { error } = await supabase.storage.from("chat-images").upload(fileName, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("chat-images").getPublicUrl(fileName);
      setImageUrl(publicUrl);
    } catch (err: any) { toast.error("Erro: " + err.message); }
    setUploading(false);
    if (e.target) e.target.value = "";
  };

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  /* ─── Stats bar ─── */
  const statsBar = (
    <div className="grid grid-cols-4 gap-2 p-3 border-b border-border">
      {[
        { label: "Total", value: stats.total, color: "text-foreground" },
        { label: "Abertos", value: stats.open, color: "text-blue-400" },
        { label: "Andando", value: stats.inProgress, color: "text-warning" },
        { label: "Resolvidos", value: stats.resolved, color: "text-success" },
      ].map((s) => (
        <div key={s.label} className="text-center p-2 rounded-lg bg-muted/30">
          <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
        </div>
      ))}
    </div>
  );

  /* ─── Ticket List ─── */
  const ticketList = (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border space-y-2">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-500" />
          <h2 className="text-sm font-bold text-foreground flex-1">Central de Suporte</h2>
        </div>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-muted border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {[{ k: "all", l: "Todos" }, { k: "open", l: "Abertos" }, { k: "in_progress", l: "Andando" }, { k: "closed", l: "Fechados" }].map(f => (
            <button key={f.k} onClick={() => setStatusFilter(f.k)}
              className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-colors ${statusFilter === f.k ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {f.l}
            </button>
          ))}
        </div>
        <div className="flex gap-1 flex-wrap">
          {[{ k: "all", l: "Todos Setores" }, ...Object.entries(DEPARTMENTS).map(([k, v]) => ({ k, l: `${v.icon} ${v.label}` }))].map(f => (
            <button key={f.k} onClick={() => setDeptFilter(f.k)}
              className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-colors ${deptFilter === f.k ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {f.l}
            </button>
          ))}
        </div>
      </div>

      {statsBar}

      <div className="flex-1 overflow-y-auto">
        {loading ? <TicketListSkeleton /> : filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Shield className="w-10 h-10 text-muted-foreground/20 mb-2" />
            <p className="text-xs text-muted-foreground">Nenhum ticket encontrado</p>
          </div>
        ) : (
          filteredTickets.map((t) => (
            <AdminTicketItem key={t.id} ticket={t} selected={selectedTicket?.id === t.id} onClick={() => selectTicket(t)} unread={unreadMap[t.id] || 0} />
          ))
        )}
      </div>
    </div>
  );

  /* ─── Chat ─── */
  const chatContent = selectedTicket ? (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border flex items-center gap-3">
        <button onClick={() => { setMobileView("list"); setSelectedTicket(null); }} className="md:hidden p-1.5 rounded-lg hover:bg-muted">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground truncate">{selectedTicket.telegram_first_name || selectedTicket.telegram_username || "Usuário"}</p>
          <p className="text-[10px] text-muted-foreground truncate">{selectedTicket.subject || "Sem assunto"}</p>
        </div>
        <button onClick={() => { setShowInfoPanel(!showInfoPanel); if (isMobile) setMobileView("info"); }}
          className="p-2 rounded-lg hover:bg-muted transition-colors">
          {showInfoPanel ? <PanelRightClose className="w-4 h-4 text-muted-foreground" /> : <PanelRightOpen className="w-4 h-4 text-muted-foreground" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loadingMessages ? <ChatSkeleton /> : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Activity className="w-10 h-10 text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground">Nenhuma mensagem</p>
          </div>
        ) : (
          messages.map((m) => (
            <AdminMessageBubble key={m.id} msg={m} profile={senderProfiles[m.sender_id]} isAdmin={m.sender_role !== "client"} />
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border bg-card/50 space-y-2">
        <SupportTemplates onSelectTemplate={(t) => setMsgText(t)} compact />
        <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        {imageUrl && (
          <div className="relative inline-block">
            <img src={imageUrl} alt="Anexo" className="max-h-16 rounded-lg" />
            <button onClick={() => setImageUrl(null)} className="absolute -top-1.5 -right-1.5 p-0.5 bg-destructive text-destructive-foreground rounded-full">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={() => fileRef.current?.click()} disabled={uploading} className="p-2.5 rounded-xl bg-muted text-muted-foreground hover:text-foreground disabled:opacity-50">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />}
          </button>
          <input
            value={msgText}
            onChange={(e) => setMsgText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Responder..."
            maxLength={4096}
            className="flex-1 px-4 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button onClick={handleSend} disabled={sending || (!msgText.trim() && !imageUrl)}
            className="p-2.5 rounded-xl bg-primary text-primary-foreground disabled:opacity-50">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-full">
      <Shield className="w-16 h-16 text-muted-foreground/20 mb-4" />
      <p className="text-sm text-muted-foreground">Selecione um ticket</p>
    </div>
  );

  /* ─── Info Panel ─── */
  const infoPanel = selectedTicket ? (
    <div className="h-full overflow-y-auto p-4 space-y-4 border-l border-border">
      <div className="flex items-center gap-2 md:hidden">
        <button onClick={() => setMobileView("chat")} className="p-1.5 rounded-lg hover:bg-muted">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <p className="text-sm font-bold text-foreground">Detalhes</p>
      </div>

      {/* User info */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-full bg-muted mx-auto flex items-center justify-center">
          <UserIcon className="w-7 h-7 text-muted-foreground" />
        </div>
        <p className="text-sm font-bold text-foreground">{selectedTicket.telegram_first_name || "Usuário"}</p>
        {selectedTicket.telegram_username && (
          <p className="text-[10px] text-muted-foreground">@{selectedTicket.telegram_username}</p>
        )}
      </div>

      {/* Status */}
      <div className="space-y-2">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Status</p>
        <select
          value={selectedTicket.status}
          onChange={(e) => updateStatus(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Department */}
      <div className="space-y-2">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Departamento</p>
        <select
          value={selectedTicket.department}
          onChange={(e) => forwardToDepartment(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {Object.entries(DEPARTMENTS).map(([k, v]) => (
            <option key={k} value={k}>{v.icon} {v.label}</option>
          ))}
        </select>
      </div>

      {/* Metadata */}
      <div className="space-y-1.5 text-[10px] text-muted-foreground">
        <p>📅 Criado: {formatDateTimeBR(selectedTicket.created_at)}</p>
        <p>🔄 Atualizado: {formatDateTimeBR(selectedTicket.updated_at)}</p>
        {selectedTicket.resolved_at && <p>✅ Resolvido: {formatDateTimeBR(selectedTicket.resolved_at)}</p>}
        <p>⚡ Prioridade: {selectedTicket.priority}</p>
      </div>

      {/* Quick actions */}
      <div className="space-y-2">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Ações Rápidas</p>
        <div className="grid grid-cols-2 gap-1.5">
          <button onClick={() => updateStatus("in_progress")} className="px-2 py-2 rounded-lg bg-warning/10 text-warning text-[10px] font-bold hover:bg-warning/20">
            <Clock className="w-3 h-3 mx-auto mb-0.5" /> Em Andamento
          </button>
          <button onClick={() => updateStatus("resolved")} className="px-2 py-2 rounded-lg bg-success/10 text-success text-[10px] font-bold hover:bg-success/20">
            <CheckCircle2 className="w-3 h-3 mx-auto mb-0.5" /> Resolvido
          </button>
          <button onClick={() => updateStatus("closed")} className="px-2 py-2 rounded-lg bg-destructive/10 text-destructive text-[10px] font-bold hover:bg-destructive/20">
            <XCircle className="w-3 h-3 mx-auto mb-0.5" /> Fechar
          </button>
          <button onClick={() => updateStatus("open")} className="px-2 py-2 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-bold hover:bg-blue-500/20">
            <CornerDownRight className="w-3 h-3 mx-auto mb-0.5" /> Reabrir
          </button>
        </div>
      </div>

      {/* Templates */}
      <SupportTemplates onSelectTemplate={(t) => setMsgText(t)} />
    </div>
  ) : null;

  return (
    <div className="h-[calc(100vh-4rem)] bg-background rounded-2xl border border-border overflow-hidden">
      {/* Desktop */}
      <div className="hidden md:grid h-full" style={{ gridTemplateColumns: showInfoPanel && selectedTicket ? "300px 1fr 280px" : "300px 1fr" }}>
        <div className="border-r border-border flex flex-col overflow-hidden">{ticketList}</div>
        <div className="flex flex-col overflow-hidden">{chatContent}</div>
        <AnimatePresence>
          {showInfoPanel && selectedTicket && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {infoPanel}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile */}
      <div className="md:hidden h-full">
        <AnimatePresence mode="wait">
          {mobileView === "list" && (
            <motion.div key="list" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }} className="h-full">
              {ticketList}
            </motion.div>
          )}
          {mobileView === "chat" && (
            <motion.div key="chat" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }} className="h-full">
              {chatContent}
            </motion.div>
          )}
          {mobileView === "info" && (
            <motion.div key="info" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }} className="h-full">
              {infoPanel}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
