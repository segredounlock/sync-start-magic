import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useChatMessages, ChatMessage } from "@/hooks/useChat";
import { useUserPresence, useGroupPresence } from "@/hooks/usePresence";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import { supabase } from "@/integrations/supabase/client";
import { MessageBubble } from "./MessageBubble";
import { EmojiPicker } from "./EmojiPicker";
import { AudioRecorder } from "./AudioRecorder";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Smile, Mic, X, Reply, Users, Pin, ChevronDown, Camera, Pencil, ImagePlus, Lock, Unlock } from "lucide-react";
import { VerificationBadge, BadgeType } from "@/components/VerificationBadge";
import { styledToast as toast } from "@/lib/toast";
import { MentionDropdown } from "./MentionDropdown";
import { formatLastSeenBR, formatDateLongUpperBR } from "@/lib/timezone";
import { AnimatePresence as MentionPresence } from "framer-motion";

function formatLastSeen(dateStr: string): string {
  return formatLastSeenBR(dateStr);
}

interface ChatWindowProps {
  conversationId: string;
  otherUser?: { id: string; nome: string | null; email: string | null; avatar_url: string | null; role?: string; verification_badge?: string | null };
  isGroup?: boolean;
  isBlocked?: boolean;
  groupName?: string;
  groupIcon?: string | null;
  onBack?: () => void;
}

export function ChatWindow({ conversationId, otherUser, isGroup, isBlocked: initialBlocked, groupName, groupIcon, onBack }: ChatWindowProps) {
  const { user, role } = useAuth();
  const isUserAdmin = role === "admin";
  const [myBadge, setMyBadge] = useState<string | null>(null);
  const [isBlocked, setIsBlocked] = useState(!!initialBlocked);
  const isUserModerator = isUserAdmin || !!myBadge; // badge holders have mod powers
  const { isOnline, lastSeen } = useUserPresence(isGroup ? undefined : otherUser?.id);
  const { onlineUsers, onlineCount } = useGroupPresence();
  const { messages, loading, loadingOlder, hasMore, sendMessage, toggleReaction, deleteMessage, editMessage, pinMessage, loadOlderMessages } = useChatMessages(conversationId);
  const { typingText, typingActivity, sendTyping, sendStopTyping } = useTypingIndicator(conversationId);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [sending, setSending] = useState(false);
  const [highlightedMsgId, setHighlightedMsgId] = useState<string | null>(null);
  const [showMembers, setShowMembers] = useState(false);
  const [members, setMembers] = useState<{ id: string; nome: string | null; avatar_url: string | null; role?: string }[]>([]);
  const [currentGroupIcon, setCurrentGroupIcon] = useState<string | null>(groupIcon || null);
  const [uploadingGroupIcon, setUploadingGroupIcon] = useState(false);
  const [myNome, setMyNome] = useState<string>("Usuário");
  const groupIconInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagesAllowed, setImagesAllowed] = useState(true);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const stopTypingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Per-conversation draft state (text, replyTo, editingMessage)
  const draftsRef = useRef<Record<string, { text: string; replyTo: ChatMessage | null; editingMessage: ChatMessage | null }>>({});
  const prevConversationId = useRef<string | null>(null);

  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);

  // Save draft when leaving a conversation, restore when entering
  useEffect(() => {
    // Save previous conversation draft
    if (prevConversationId.current && prevConversationId.current !== conversationId) {
      draftsRef.current[prevConversationId.current] = { text, replyTo, editingMessage };
    }
    // Restore draft for new conversation
    const draft = draftsRef.current[conversationId];
    if (draft) {
      setText(draft.text);
      setReplyTo(draft.replyTo);
      setEditingMessage(draft.editingMessage);
    } else {
      setText("");
      setReplyTo(null);
      setEditingMessage(null);
    }
    setShowEmoji(false);
    setShowAudioRecorder(false);
    prevConversationId.current = conversationId;
  }, [conversationId]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("nome, verification_badge").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data?.nome) setMyNome(data.nome);
      setMyBadge(data?.verification_badge ?? null);
    });
  }, [user]);

  // Auto-join group as member on open
  useEffect(() => {
    if (!isGroup || !user) return;
    (async () => {
      const { error } = await supabase.from("chat_members").upsert(
        { conversation_id: conversationId, user_id: user.id },
        { onConflict: "conversation_id,user_id" }
      );
      if (error) console.error("Auto-join error:", error);
    })();
  }, [isGroup, conversationId, user]);

  // Fetch group members from chat_members table
  const [memberCount, setMemberCount] = useState(0);

  const fetchGroupMembers = useCallback(async () => {
    if (!isGroup) return;
    // Get all member user_ids from chat_members
    const { data: memberRows } = await supabase
      .from("chat_members")
      .select("user_id")
      .eq("conversation_id", conversationId);

    if (!memberRows || memberRows.length === 0) {
      setMembers([]);
      setMemberCount(0);
      return;
    }

    const memberIds = memberRows.map(r => r.user_id);
    setMemberCount(memberIds.length);

    const [{ data }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("id, nome, avatar_url, verification_badge").in("id", memberIds),
      supabase.from("user_roles").select("user_id, role").in("user_id", memberIds),
    ]);

    if (!data) return;

    const roleMap = new Map<string, string>();
    roles?.forEach(r => { if (r.role === "admin") roleMap.set(r.user_id, r.role); });

    const sorted = data.map(p => ({ ...p, role: roleMap.get(p.id) }))
      .sort((a, b) => {
        const aAdmin = a.role === "admin" ? 0 : 1;
        const bAdmin = b.role === "admin" ? 0 : 1;
        if (aAdmin !== bAdmin) return aAdmin - bAdmin;
        const aOnline = onlineUsers.includes(a.id) ? 0 : 1;
        const bOnline = onlineUsers.includes(b.id) ? 0 : 1;
        if (aOnline !== bOnline) return aOnline - bOnline;
        return (a.nome || "").localeCompare(b.nome || "");
      });
    setMembers(sorted);
  }, [isGroup, conversationId, onlineUsers]);

  useEffect(() => {
    fetchGroupMembers();
  }, [fetchGroupMembers]);

  // Realtime: update member list when someone joins
  useEffect(() => {
    if (!isGroup) return;
    const channel = supabase
      .channel(`chat-members-${conversationId}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "chat_members",
        filter: `conversation_id=eq.${conversationId}`,
      }, () => {
        fetchGroupMembers();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isGroup, conversationId, fetchGroupMembers]);

  // Sync groupIcon prop
  useEffect(() => { setCurrentGroupIcon(groupIcon || null); }, [groupIcon]);

  // Check room image permission for groups (with realtime sync)
  useEffect(() => {
    if (!isGroup) { setImagesAllowed(true); return; }
    const configKey = `room_images_${conversationId}`;
    const fetchConfig = async () => {
      const { data } = await supabase.from("system_config").select("value").eq("key", configKey).maybeSingle();
      setImagesAllowed(data ? data.value !== "false" : true);
    };
    fetchConfig();

    const channel = supabase
      .channel(`room-images-${conversationId}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "system_config",
      }, (payload: any) => {
        const row = payload.new;
        if (row?.key === configKey) {
          setImagesAllowed(row.value !== "false");
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isGroup, conversationId]);

  const uploadImageFile = async (file: File) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) { toast.error("Use JPG, PNG, WebP ou GIF."); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Máximo 5MB."); return; }
    setUploadingImage(true);
    try {
      const ext = file.name?.split(".").pop() || (file.type === "image/png" ? "png" : "jpg");
      const path = `${user!.id}/${conversationId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("chat-images").upload(path, file);
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("chat-images").getPublicUrl(path);
      await sendMessage("", "image", undefined, urlData.publicUrl, replyTo?.id);
      setReplyTo(null);
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao enviar imagem: " + (err.message || ""));
    }
    setUploadingImage(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    await uploadImageFile(file);
  };

  // Ctrl+V paste image from clipboard
  useEffect(() => {
    if (!imagesAllowed) return;
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) uploadImageFile(file);
          return;
        }
      }
    };
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [imagesAllowed, conversationId, replyTo]);

  const handleGroupIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isUserAdmin) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) { toast.error("Use JPG, PNG, WebP ou GIF."); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("Máximo 2MB."); return; }
    e.target.value = "";
    setUploadingGroupIcon(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `groups/${conversationId}/icon.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = urlData.publicUrl + "?t=" + Date.now();
      await supabase.from("chat_conversations").update({ icon: publicUrl } as any).eq("id", conversationId);
      setCurrentGroupIcon(publicUrl);
      toast.success("Foto do grupo atualizada!");
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao atualizar foto: " + (err.message || ""));
    }
    setUploadingGroupIcon(false);
  };

  const prevMsgCountRef = useRef(0);
  const scrollToBottom = useCallback(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, []);

  // Only scroll to bottom on new messages (not when loading older ones)
  useEffect(() => {
    const prevCount = prevMsgCountRef.current;
    const newCount = messages.length;
    prevMsgCountRef.current = newCount;
    // Scroll to bottom on initial load or when new messages are appended (not prepended)
    if (prevCount === 0 || (newCount > prevCount && messages[newCount - 1]?.created_at > (messages[prevCount - 1]?.created_at || ''))) {
      scrollToBottom();
    }
  }, [messages.length, scrollToBottom, messages]);

  // Infinite scroll: detect scroll near top
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el || loadingOlder || !hasMore) return;
    if (el.scrollTop < 80) {
      const prevScrollHeight = el.scrollHeight;
      loadOlderMessages().then(() => {
        // Preserve scroll position after prepending older messages
        requestAnimationFrame(() => {
          if (scrollContainerRef.current) {
            const newScrollHeight = scrollContainerRef.current.scrollHeight;
            scrollContainerRef.current.scrollTop = newScrollHeight - prevScrollHeight;
          }
        });
      });
    }
  }, [loadingOlder, hasMore, loadOlderMessages]);

  const name = isGroup ? (groupName || "Grupo") : (otherUser?.nome || otherUser?.email?.split("@")[0] || "Usuário");
  const shouldShimmerName = otherUser?.role === "admin" || !!otherUser?.verification_badge;
  const initial = isGroup ? "" : (name[0] || "U").toUpperCase();

  const scrollToMessage = useCallback((msgId: string) => {
    const el = document.getElementById(`msg-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedMsgId(msgId);
      setTimeout(() => setHighlightedMsgId(null), 2000);
    }
  }, []);

  // Detect URLs/links in text
  const containsLink = (str: string) => /https?:\/\/|www\.|[a-zA-Z0-9-]+\.(com|net|org|br|io|me|co|app|dev|info|link|xyz|site|online|store|shop|ly|bit|goo|tinyurl)\b/i.test(str);

  const handleSend = async () => {
    if (!text.trim() || sending) return;

    // Block links for non-admin users
    if (!isUserAdmin && containsLink(text.trim())) {
      toast.error("Envio de links não é permitido.");
      return;
    }

    setSending(true);
    const currentText = text.trim();
    const currentReplyToId = replyTo?.id || undefined;
    setText("");
    setShowEmoji(false);
    // Clear draft for this conversation after sending
    delete draftsRef.current[conversationId];
    sendStopTyping();

    try {
      if (editingMessage) {
        const messageBeingEdited = editingMessage;
        const msgId = messageBeingEdited.id;
        const isAdminEdit = isUserModerator;
        setEditingMessage(null);
        await editMessage(msgId, currentText, isAdminEdit);
      } else {
        setReplyTo(null);
        await sendMessage(currentText, "text", undefined, undefined, currentReplyToId);
      }
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
      toast.error(err instanceof Error ? err.message : "Não foi possível enviar/editar a mensagem.");
      if (editingMessage) setEditingMessage(editingMessage);
      setText(currentText);
    } finally {
      setSending(false);
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
        inputRef.current.focus();
      }
    }
  };

  const handleStartEdit = (msg: ChatMessage) => {
    setEditingMessage(msg);
    setText(msg.content || "");
    setReplyTo(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleAudioSend = async (audioUrl: string) => {
    setShowAudioRecorder(false);
    sendStopTyping();
    await sendMessage("", "audio", audioUrl, undefined, replyTo?.id);
    setReplyTo(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // Group messages by date — memoized to avoid recalculation on every render
  const groupedMessages = useMemo(() => {
    const groups: { date: string; msgs: ChatMessage[] }[] = [];
    messages.forEach(msg => {
      const date = formatDateLongUpperBR(msg.created_at);
      const last = groups[groups.length - 1];
      if (last && last.date === date) { last.msgs.push(msg); }
      else { groups.push({ date, msgs: [msg] }); }
    });
    return groups;
  }, [messages]);

  return (
    <div className="flex flex-col h-full touch-manipulation overflow-hidden" style={{ touchAction: "pan-y" }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm cursor-pointer"
        onClick={() => isGroup && setShowMembers(!showMembers)}
      >
        {onBack && (
          <button onClick={(e) => { e.stopPropagation(); onBack(); }} className="p-2 rounded-xl hover:bg-muted/50 transition-colors -ml-2">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </button>
        )}
        {isGroup ? (
          <div className="relative group/avatar">
            {currentGroupIcon && currentGroupIcon.startsWith("http") ? (
              <img src={currentGroupIcon} alt="" className="w-11 h-11 rounded-full object-cover border-2 border-primary/20" referrerPolicy="no-referrer" />
            ) : currentGroupIcon && !currentGroupIcon.startsWith("http") ? (
              <div className="w-11 h-11 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center">
                <span className="text-xl">{currentGroupIcon}</span>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
            )}
            {isUserAdmin && (
              <label
                className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                {uploadingGroupIcon ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="h-4 w-4 text-white" />
                )}
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleGroupIconUpload} className="hidden" ref={groupIconInputRef} disabled={uploadingGroupIcon} />
              </label>
            )}
          </div>
        ) : otherUser?.avatar_url ? (
          <img src={otherUser.avatar_url} alt="" referrerPolicy="no-referrer" className="w-11 h-11 rounded-full object-cover border-2 border-border" />
        ) : (
          <div className="w-11 h-11 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
            {initial}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-1">
            <span className={shouldShimmerName ? "shimmer-letters" : ""}>{name}</span>
            {otherUser?.verification_badge ? (
              <VerificationBadge badge={otherUser.verification_badge as BadgeType} size="sm" />
            ) : otherUser?.role === 'admin' ? (
              <VerificationBadge badge="verificado" size="sm" />
            ) : null}
          </h3>
          <span className="text-[10px] text-muted-foreground">
            {isGroup ? (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                <motion.span
                  key={onlineCount}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-success font-medium"
                >
                  {onlineCount} online
                </motion.span>
                <span className="text-muted-foreground/60">·</span>
                <span>{memberCount} membros</span>
              </span>
            ) : isOnline ? (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-success font-medium">Online</span>
              </span>
            ) : lastSeen ? (
              `Visto por último ${formatLastSeen(lastSeen)}`
            ) : (
              "Offline"
            )}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {isUserAdmin && isGroup && (
            <button
              onClick={async (e) => {
                e.stopPropagation();
                const newBlocked = !isBlocked;
                setIsBlocked(newBlocked);
                const { error } = await supabase.from("chat_conversations").update({ is_blocked: newBlocked }).eq("id", conversationId);
                if (error) {
                  setIsBlocked(!newBlocked);
                  toast.error("Erro ao alterar status da sala.");
                } else {
                  toast.success(newBlocked ? "Sala fechada" : "Sala aberta");
                }
              }}
              className={`p-2 rounded-xl transition-colors ${isBlocked ? "bg-destructive/15 hover:bg-destructive/25 text-destructive" : "hover:bg-muted/50 text-muted-foreground"}`}
              title={isBlocked ? "Abrir sala" : "Fechar sala"}
            >
              {isBlocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
            </button>
          )}
          {isGroup && (
            <motion.div animate={{ rotate: showMembers ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </motion.div>
          )}
        </div>
      </div>

      {/* Members panel */}
      <AnimatePresence>
        {showMembers && isGroup && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="border-b border-border bg-muted/20 overflow-hidden"
          >
            <div className="px-4 py-2 max-h-48 overflow-y-auto scrollbar-hide space-y-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                Membros ({members.length})
              </p>
              {members.map(m => {
                const memberOnline = onlineUsers.includes(m.id);
                const memberInitial = (m.nome?.[0] || "U").toUpperCase();
                return (
                  <div key={m.id} className="flex items-center gap-2.5 py-1.5 rounded-lg">
                    <div className="relative flex-shrink-0">
                      {m.avatar_url ? (
                        <img src={m.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover border border-border" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center text-primary font-bold text-[10px]">
                          {memberInitial}
                        </div>
                      )}
                      <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card ${memberOnline ? "bg-success" : "bg-muted-foreground/40"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-foreground truncate flex items-center gap-1">
                        {m.nome || "Usuário"}
                        {m.id === user?.id && <span className="text-[9px] text-muted-foreground">(você)</span>}
                        {m.role === "admin" && <VerificationBadge badge="verificado" size="xs" animate={false} />}
                      </span>
                    </div>
                    <span className={`text-[9px] font-medium ${memberOnline ? "text-success" : "text-muted-foreground/50"}`}>
                      {memberOnline ? "online" : "offline"}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pinned message banner */}
      {(() => {
        const pinned = messages.filter(m => m.is_pinned && !m.is_deleted);
        if (pinned.length === 0) return null;
        const lastPinned = pinned[pinned.length - 1];
        return (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="px-4 py-2 border-b border-warning/30 bg-warning/5 flex items-center gap-2 cursor-pointer hover:bg-warning/10 transition-colors overflow-hidden"
            onClick={() => scrollToMessage(lastPinned.id)}
          >
            <Pin className="h-3.5 w-3.5 text-warning rotate-45 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold text-warning">Mensagem fixada</p>
              <p className="text-xs text-foreground/80 line-clamp-2">{lastPinned.content || (lastPinned.type === "audio" ? "🎤 Áudio" : "📷 Imagem")}</p>
            </div>
          </motion.div>
        );
      })()}

      {/* Messages area */}
      <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-2 space-y-0.5 scrollbar-hide" style={{ WebkitOverflowScrolling: "touch", overscrollBehavior: "contain", backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}>
        {/* Loading older messages indicator */}
        {loadingOlder && (
          <div className="flex items-center justify-center py-3">
            <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {!loading && !hasMore && messages.length > 0 && (
          <div className="flex items-center justify-center py-3">
            <span className="text-[10px] text-muted-foreground/50">Início da conversa</span>
          </div>
        )}
        {loading ? (
          <div className="flex-1 flex flex-col justify-end px-3 py-2 space-y-3">
            {/* Skeleton shimmer messages */}
            {[...Array(6)].map((_, i) => {
              const isRight = i % 3 === 0;
              const width = ["60%", "45%", "70%", "50%", "55%", "40%"][i];
              return (
                <div key={i} className={`flex ${isRight ? "justify-end" : "justify-start"}`}>
                  <div className="flex items-end gap-1.5" style={{ maxWidth: width }}>
                    {!isRight && <div className="w-7 h-7 rounded-full bg-muted/40 animate-pulse flex-shrink-0" />}
                    <div className={`rounded-2xl px-4 py-3 space-y-1.5 ${isRight ? "bg-primary/10" : "bg-muted/30"} animate-pulse`} style={{ width: "100%", minWidth: 80 }}>
                      <div className="h-3 rounded-full bg-muted/40" style={{ width: "100%" }} />
                      {i % 2 === 0 && <div className="h-3 rounded-full bg-muted/30" style={{ width: "60%" }} />}
                      <div className="h-2 rounded-full bg-muted/20 mt-1" style={{ width: 40 }} />
                    </div>
                    {isRight && <div className="w-7 h-7 rounded-full bg-muted/40 animate-pulse flex-shrink-0" />}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          groupedMessages.map(group => (
            <div key={group.date}>
              <div className="flex items-center gap-3 my-2 px-4">
                <div className="flex-1 h-px bg-border" style={{ backgroundColor: 'var(--tg-hint, hsl(var(--border)))' , opacity: 0.3 }} />
                <span className="text-[10px] text-muted-foreground font-medium" style={{ color: 'var(--tg-hint, hsl(var(--muted-foreground)))' }}>{group.date}</span>
                <div className="flex-1 h-px bg-border" style={{ backgroundColor: 'var(--tg-hint, hsl(var(--border)))', opacity: 0.3 }} />
              </div>
              {group.msgs.map(msg => (
                <div
                  key={msg.id}
                  id={`msg-${msg.id}`}
                  className={`transition-colors duration-700 rounded-xl ${highlightedMsgId === msg.id ? "bg-primary/10" : ""}`}
                >
                  <MessageBubble
                    message={msg}
                    isOwn={msg.sender_id === user?.id}
                    isGroup={isGroup}
                    isCurrentUserAdmin={isUserAdmin}
                    isCurrentUserModerator={isUserModerator}
                    onReply={() => { setReplyTo(msg); inputRef.current?.focus(); }}
                    onReact={(emoji) => toggleReaction(msg.id, emoji)}
                    onDelete={() => deleteMessage(msg.id, isUserModerator && msg.sender_id !== user?.id)}
                    onEdit={() => handleStartEdit(msg)}
                    onPin={isUserAdmin ? () => pinMessage(msg.id) : undefined}
                    onScrollToMessage={scrollToMessage}
                  />
                </div>
              ))}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Typing indicator */}
      <AnimatePresence>
        {typingText && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="px-4 overflow-hidden"
          >
            <div className="flex items-center gap-2 py-1.5">
              {typingActivity === "recording" ? (
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                  <Mic className="h-3.5 w-3.5 text-destructive/70" />
                </div>
              ) : typingActivity === "emoji" ? (
                <Smile className="h-3.5 w-3.5 text-warning animate-bounce" />
              ) : (
                <div className="flex gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              )}
              <span className="text-[11px] text-muted-foreground italic">{typingText}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit preview - Telegram style */}
      <AnimatePresence>
        {editingMessage && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-4 border-t border-border bg-muted/30 overflow-hidden">
            <div className="flex items-start gap-2 py-2">
              <Pencil className="h-4 w-4 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0 border-l-2 border-primary pl-2">
                <span className="text-xs font-semibold text-primary">Editar mensagem</span>
                <p className="text-xs text-muted-foreground whitespace-pre-wrap break-words max-h-20 overflow-y-auto pr-1">{editingMessage.content}</p>
              </div>
              <button onClick={() => { setEditingMessage(null); setText(""); }} className="p-1 rounded-lg hover:bg-muted/50">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reply preview */}
      <AnimatePresence>
        {replyTo && !editingMessage && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-4 border-t border-border bg-muted/30 overflow-hidden">
            <div className="flex items-center gap-2 py-2">
              <Reply className="h-4 w-4 text-primary flex-shrink-0" />
              <div
                className="flex-1 min-w-0 border-l-2 border-primary pl-2 cursor-pointer"
                onClick={() => replyTo && scrollToMessage(replyTo.id)}
              >
                <span className="text-xs font-semibold text-primary">
                  {replyTo.sender_id === user?.id ? "Você" : (replyTo.sender?.nome || "Usuário")}
                </span>
                <p className="text-xs text-muted-foreground truncate">{replyTo.is_deleted ? "Mensagem apagada" : replyTo.content || (replyTo.type === "audio" ? "🎤 Áudio" : "📷 Imagem")}</p>
              </div>
              <button onClick={() => setReplyTo(null)} className="p-1 rounded-lg hover:bg-muted/50">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audio recorder */}
      <AnimatePresence>
        {showAudioRecorder && (
          <AudioRecorder onSend={handleAudioSend} onCancel={() => { setShowAudioRecorder(false); sendStopTyping(); }} onTypingPing={() => sendTyping(myNome, "recording")} />
        )}
      </AnimatePresence>

      {/* Emoji picker */}
      <AnimatePresence>
        {showEmoji && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-border overflow-hidden">
            <EmojiPicker onSelect={(emoji) => { setText(prev => prev + emoji); setTimeout(() => inputRef.current?.focus(), 50); }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input bar */}
      {isBlocked && !isUserAdmin ? (
        <div className="flex items-center justify-center gap-2 px-4 py-4 border-t border-border bg-card/80 backdrop-blur-sm">
          <Lock className="h-4 w-4 text-muted-foreground/60" />
          <span className="text-sm text-muted-foreground/60">Esta sala está bloqueada</span>
        </div>
      ) : !showAudioRecorder ? (
        <div className="flex items-center gap-2 px-3 py-3 border-t border-border bg-card/80 backdrop-blur-sm">
          <button onClick={() => {
            const newVal = !showEmoji;
            setShowEmoji(newVal);
            if (newVal) { sendTyping(myNome, "emoji"); } else { sendStopTyping(); }
          }} className={`p-2.5 rounded-xl transition-colors ${showEmoji ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted/50"}`}>
            <Smile className="h-5 w-5" />
          </button>
          {imagesAllowed && (
            <label className={`p-2.5 rounded-xl transition-colors cursor-pointer ${uploadingImage ? "opacity-50 pointer-events-none" : "text-muted-foreground hover:bg-muted/50"}`}>
              {uploadingImage ? (
                <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <ImagePlus className="h-5 w-5" />
              )}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageUpload} className="hidden" ref={imageInputRef} disabled={uploadingImage} />
            </label>
          )}
          <div className="flex-1 relative">
            <MentionPresence>
              <MentionDropdown
                users={members}
                filter={mentionQuery || ""}
                visible={mentionQuery !== null}
                onSelect={(u) => {
                  const name = u.nome || "Usuário";
                  const cursorPos = inputRef.current?.selectionStart || text.length;
                  const beforeCursor = text.slice(0, cursorPos);
                  const atIndex = beforeCursor.lastIndexOf("@");
                  if (atIndex !== -1) {
                    const newText = text.slice(0, atIndex) + `@${name} ` + text.slice(cursorPos);
                    setText(newText);
                  }
                  setMentionQuery(null);
                  setTimeout(() => inputRef.current?.focus(), 50);
                }}
              />
            </MentionPresence>
            <textarea
              ref={inputRef}
              autoComplete="off"
              autoCorrect="off"
              value={text}
              rows={1}
              onChange={e => {
                const val = e.target.value;
                if (!isUserAdmin && val.length > 700) return;
                setText(val);
                // Auto-resize textarea
                const el = e.target;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 120) + "px";
                // Send typing indicator
                if (val.trim()) {
                  sendTyping(myNome);
                  if (stopTypingTimeout.current) clearTimeout(stopTypingTimeout.current);
                  stopTypingTimeout.current = setTimeout(() => sendStopTyping(), 3000);
                } else {
                  sendStopTyping();
                }
                // Detect @ mention
                const cursorPos = e.target.selectionStart || val.length;
                const beforeCursor = val.slice(0, cursorPos);
                const atIndex = beforeCursor.lastIndexOf("@");
                if (atIndex !== -1 && (atIndex === 0 || beforeCursor[atIndex - 1] === " ")) {
                  const query = beforeCursor.slice(atIndex + 1);
                  if (!query.includes(" ")) {
                    setMentionQuery(query);
                  } else {
                    setMentionQuery(null);
                  }
                } else {
                  setMentionQuery(null);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape" && mentionQuery !== null) {
                  setMentionQuery(null);
                  return;
                }
                handleKeyDown(e);
              }}
              maxLength={isUserAdmin ? undefined : 700}
              placeholder="Mensagem..."
              className="w-full py-2.5 px-4 rounded-2xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/40 transition-all text-sm resize-none scrollbar-hide"
              style={{ fontSize: "16px", maxHeight: "120px", overflowY: "auto" }}
            />
            {!isUserAdmin && text.length > 600 && (
              <span className={`absolute right-3 bottom-2 text-[9px] font-medium ${text.length >= 700 ? "text-destructive" : "text-muted-foreground/60"}`}>
                {text.length}/700
              </span>
            )}
          </div>
          {text.trim() ? (
            <button onClick={handleSend} disabled={sending} className="p-2.5 rounded-full bg-primary text-primary-foreground hover:brightness-110 transition-all disabled:opacity-50 shadow-sm">
              <Send className="h-5 w-5" />
            </button>
          ) : (
            <button onClick={() => { setShowAudioRecorder(true); sendTyping(myNome, "recording"); }} className="p-2.5 rounded-full text-muted-foreground hover:bg-muted/50 transition-colors">
              <Mic className="h-5 w-5" />
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
