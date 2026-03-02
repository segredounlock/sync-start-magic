import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useChatMessages, ChatMessage } from "@/hooks/useChat";
import { useUserPresence } from "@/hooks/usePresence";
import { supabase } from "@/integrations/supabase/client";
import { MessageBubble } from "./MessageBubble";
import { EmojiPicker } from "./EmojiPicker";
import { AudioRecorder } from "./AudioRecorder";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Smile, Mic, X, Reply, Users, Pin } from "lucide-react";

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
  otherUser?: { id: string; nome: string | null; email: string | null; avatar_url: string | null };
  isGroup?: boolean;
  groupName?: string;
  onBack?: () => void;
}

export function ChatWindow({ conversationId, otherUser, isGroup, groupName, onBack }: ChatWindowProps) {
  const { user, role } = useAuth();
  const isUserAdmin = role === "admin";
  const { isOnline, lastSeen } = useUserPresence(isGroup ? undefined : otherUser?.id);
  const { messages, loading, sendMessage, toggleReaction, deleteMessage, editMessage, pinMessage } = useChatMessages(conversationId);
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [sending, setSending] = useState(false);
  const [highlightedMsgId, setHighlightedMsgId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    setText("");
    setReplyTo(null);
    setShowEmoji(false);
    try {
      await sendMessage(currentText, "text", undefined, undefined, replyTo?.id);
    } catch (err) {
      console.error(err);
      setText(currentText);
    }
    setSending(false);
    inputRef.current?.focus();
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
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm">
        {onBack && (
          <button onClick={onBack} className="p-2 rounded-xl hover:bg-muted/50 transition-colors -ml-2">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </button>
        )}
        {isGroup ? (
          <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
        ) : otherUser?.avatar_url ? (
          <img src={otherUser.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-border" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
            {initial}
          </div>
        )}
        <div>
          <h3 className="font-semibold text-sm text-foreground">{name}</h3>
          <span className="text-[10px] text-muted-foreground">
            {isGroup ? "Grupo público" : isOnline ? (
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
      </div>

      {/* Pinned message banner */}
      {(() => {
        const pinned = messages.filter(m => m.is_pinned && !m.is_deleted);
        if (pinned.length === 0) return null;
        const lastPinned = pinned[pinned.length - 1];
        return (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="px-4 py-2 border-b border-warning/30 bg-warning/5 flex items-center gap-2 cursor-pointer hover:bg-warning/10 transition-colors"
            onClick={() => scrollToMessage(lastPinned.id)}
          >
            <Pin className="h-3.5 w-3.5 text-warning rotate-45 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold text-warning">Mensagem fixada</p>
              <p className="text-xs text-foreground/80 truncate">{lastPinned.content || (lastPinned.type === "audio" ? "🎤 Áudio" : "📷 Imagem")}</p>
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
                    onEdit={(newContent) => editMessage(msg.id, newContent, isUserAdmin && msg.sender_id !== user?.id)}
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

      {/* Reply preview */}
      <AnimatePresence>
        {replyTo && (
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
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Mensagem..."
            className="flex-1 py-2.5 px-4 rounded-2xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all text-sm"
          />
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
