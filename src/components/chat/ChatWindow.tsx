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
import { ArrowLeft, Send, Smile, Mic, X, Reply, Users, Pin, ChevronDown, Camera, Pencil, ImagePlus } from "lucide-react";
import { VerificationBadge, BadgeType } from "@/components/VerificationBadge";
import { toast } from "sonner";
import { MentionDropdown } from "./MentionDropdown";
import { AnimatePresence as MentionPresence } from "framer-motion";

function formatLastSeen(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `há ${diffMin}min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `há ${diffH}h`;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) + " " + date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

interface ChatWindowProps {
  conversationId: string;
  otherUser?: { id: string; nome: string | null; email: string | null; avatar_url: string | null; role?: string; verification_badge?: string | null };
  isGroup?: boolean;
  groupName?: string;
  groupIcon?: string | null;
  onBack?: () => void;
}

export function ChatWindow({ conversationId, otherUser, isGroup, groupName, groupIcon, onBack }: ChatWindowProps) {
  const { user, role } = useAuth();
  const isUserAdmin = role === "admin";
  const { isOnline, lastSeen } = useUserPresence(isGroup ? undefined : otherUser?.id);
  const { onlineUsers, onlineCount } = useGroupPresence();
  const { messages, loading, sendMessage, toggleReaction, deleteMessage, editMessage, pinMessage } = useChatMessages(conversationId);
  const { typingText, sendTyping, sendStopTyping } = useTypingIndicator(conversationId);
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
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
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagesAllowed, setImagesAllowed] = useState(true);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const stopTypingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear reply/edit state when switching conversations
  useEffect(() => {
    setReplyTo(null);
    setEditingMessage(null);
    setText("");
    setShowEmoji(false);
    setShowAudioRecorder(false);
  }, [conversationId]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("nome").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data?.nome) setMyNome(data.nome);
    });
  }, [user]);

  // Fetch group members (unique senders who have posted in this conversation)
  useEffect(() => {
    if (!isGroup) return;
    const fetchMembers = async () => {
      // Get unique sender IDs from messages
      const senderIds = [...new Set(messages.map(m => m.sender_id))];
      // Also add online users who may not have sent a message yet
      onlineUsers.forEach(uid => { if (!senderIds.includes(uid)) senderIds.push(uid); });
      if (senderIds.length === 0) return;
      
      const { data } = await supabase
        .from("profiles")
        .select("id, nome, avatar_url, verification_badge")
        .in("id", senderIds);
      
      if (data) {
        // Fetch roles
        const { data: roles } = await supabase
          .from("user_roles")
          .select("user_id, role")
          .in("user_id", senderIds);
        
        const roleMap = new Map<string, string>();
        roles?.forEach(r => { if (r.role === "admin") roleMap.set(r.user_id, r.role); });
        
        const sorted = data.map(p => ({ ...p, role: roleMap.get(p.id) }))
          .sort((a, b) => {
            // Admins first, then online, then alphabetical
            const aAdmin = a.role === "admin" ? 0 : 1;
            const bAdmin = b.role === "admin" ? 0 : 1;
            if (aAdmin !== bAdmin) return aAdmin - bAdmin;
            const aOnline = onlineUsers.includes(a.id) ? 0 : 1;
            const bOnline = onlineUsers.includes(b.id) ? 0 : 1;
            if (aOnline !== bOnline) return aOnline - bOnline;
            return (a.nome || "").localeCompare(b.nome || "");
          });
        setMembers(sorted);
      }
    };
    fetchMembers();
  }, [isGroup, messages.length, onlineUsers.length]);

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

  const scrollToBottom = useCallback(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages.length, scrollToBottom]);

  const name = isGroup ? (groupName || "Grupo") : (otherUser?.nome || otherUser?.email?.split("@")[0] || "Usuário");
  const initial = isGroup ? "" : (name[0] || "U").toUpperCase();

  const scrollToMessage = useCallback((msgId: string) => {
    const el = document.getElementById(`msg-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedMsgId(msgId);
      setTimeout(() => setHighlightedMsgId(null), 2000);
    }
  }, []);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    const currentText = text.trim();
    const currentReplyToId = replyTo?.id || undefined;
    setText("");
    setShowEmoji(false);
    sendStopTyping();

    try {
      if (editingMessage) {
        const msgId = editingMessage.id;
        const isAdminEdit = isUserAdmin && editingMessage.sender_id !== user?.id;
        setEditingMessage(null);
        await editMessage(msgId, currentText, isAdminEdit);
      } else {
        setReplyTo(null);
        await sendMessage(currentText, "text", undefined, undefined, currentReplyToId);
      }
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
      setText(currentText);
    } finally {
      setSending(false);
      inputRef.current?.focus();
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
    await sendMessage("", "audio", audioUrl, undefined, replyTo?.id);
    setReplyTo(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // Group messages by date
  const groupedMessages: { date: string; msgs: ChatMessage[] }[] = [];
  messages.forEach(msg => {
    const date = new Date(msg.created_at).toLocaleDateString("pt-BR", { day: "numeric", month: "long" }).toUpperCase();
    const last = groupedMessages[groupedMessages.length - 1];
    if (last && last.date === date) { last.msgs.push(msg); }
    else { groupedMessages.push({ date, msgs: [msg] }); }
  });

  return (
    <div className="flex flex-col h-full">
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
              <img src={currentGroupIcon} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-primary/20" referrerPolicy="no-referrer" />
            ) : currentGroupIcon && !currentGroupIcon.startsWith("http") ? (
              <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center">
                <span className="text-xl">{currentGroupIcon}</span>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
            )}
            {onlineCount > 0 && (
              <motion.div
                key={onlineCount}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-success border-2 border-card flex items-center justify-center"
              >
                <span className="text-[8px] font-bold text-white px-0.5">{onlineCount}</span>
              </motion.div>
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
          <img src={otherUser.avatar_url} alt="" referrerPolicy="no-referrer" className="w-10 h-10 rounded-full object-cover border-2 border-border" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
            {initial}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-1">
            {name}
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
                <span>{members.length} membros</span>
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
        {isGroup && (
          <motion.div animate={{ rotate: showMembers ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </motion.div>
        )}
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
            <div className="px-4 py-2 max-h-48 overflow-y-auto space-y-1">
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
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 space-y-1" style={{ backgroundImage: "radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.02) 0%, transparent 70%)" }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          groupedMessages.map(group => (
            <div key={group.date}>
              <div className="flex justify-center my-3">
                <span className="text-[10px] bg-muted/60 text-muted-foreground px-3 py-1 rounded-full font-medium">{group.date}</span>
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
                    onReply={() => { setReplyTo(msg); inputRef.current?.focus(); }}
                    onReact={(emoji) => toggleReaction(msg.id, emoji)}
                    onDelete={() => deleteMessage(msg.id, isUserAdmin && msg.sender_id !== user?.id)}
                    onEdit={() => handleStartEdit(msg)}
                    onPin={() => pinMessage(msg.id)}
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
              <div className="flex gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-[11px] text-muted-foreground italic">{typingText}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit preview - Telegram style */}
      <AnimatePresence>
        {editingMessage && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-4 border-t border-border bg-muted/30 overflow-hidden">
            <div className="flex items-center gap-2 py-2">
              <Pencil className="h-4 w-4 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0 border-l-2 border-primary pl-2">
                <span className="text-xs font-semibold text-primary">Editar mensagem</span>
                <p className="text-xs text-muted-foreground truncate">{editingMessage.content}</p>
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
          <AudioRecorder onSend={handleAudioSend} onCancel={() => setShowAudioRecorder(false)} />
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
      {!showAudioRecorder && (
        <div className="flex items-center gap-2 px-3 py-3 border-t border-border bg-card/80 backdrop-blur-sm">
          <button onClick={() => setShowEmoji(!showEmoji)} className={`p-2.5 rounded-xl transition-colors ${showEmoji ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted/50"}`}>
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
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={e => {
                const val = e.target.value;
                if (val.length > 700) return;
                setText(val);
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
              maxLength={700}
              placeholder="Mensagem..."
              className="w-full py-2.5 px-4 rounded-2xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all text-sm"
            />
            {text.length > 600 && (
              <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-medium ${text.length >= 700 ? "text-destructive" : "text-muted-foreground/60"}`}>
                {text.length}/700
              </span>
            )}
          </div>
          {text.trim() ? (
            <button onClick={handleSend} disabled={sending} className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:brightness-110 transition-all disabled:opacity-50">
              <Send className="h-5 w-5" />
            </button>
          ) : (
            <button onClick={() => setShowAudioRecorder(true)} className="p-2.5 rounded-xl text-muted-foreground hover:bg-muted/50 transition-colors">
              <Mic className="h-5 w-5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
