import { useState } from "react";
import { ChatMessage } from "@/hooks/useChat";
import { motion } from "framer-motion";
import { Check, CheckCheck, Reply, Trash2, SmilePlus, Star } from "lucide-react";

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  isGroup?: boolean;
  onReply: () => void;
  onReact: (emoji: string) => void;
  onDelete: () => void;
}

const QUICK_EMOJIS = ["❤️", "😂", "👍", "😮", "😢", "🔥"];

export function MessageBubble({ message, isOwn, isGroup, onReply, onReact, onDelete }: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);
  const [showQuickEmoji, setShowQuickEmoji] = useState(false);

  if (message.is_deleted) {
    return (
      <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-1`}>
        <div className="px-3 py-2 rounded-2xl bg-muted/30 border border-border/50 max-w-[75%]">
          <p className="text-xs text-muted-foreground italic">🚫 Mensagem apagada</p>
        </div>
      </div>
    );
  }

  const dateTime = new Date(message.created_at);
  const time = dateTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const date = dateTime.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  const senderName = message.sender?.nome || "Usuário";
  const isAdmin = message.sender?.isAdmin === true;

  const reactions = message.reactions || [];
  const groupedReactions: Record<string, number> = {};
  reactions.forEach(r => { groupedReactions[r.emoji] = (groupedReactions[r.emoji] || 0) + 1; });

  return (
    <motion.div
      initial={{ opacity: 0, y: 5, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2 group relative`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setShowQuickEmoji(false); }}
      onTouchStart={() => setShowActions(true)}
    >
      {/* Avatar for messages from others */}
      {!isOwn && (
        <div className="flex-shrink-0 mr-2 mt-auto">
          {message.sender?.avatar_url ? (
            <img src={message.sender.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-border" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center text-primary font-bold text-[11px]">
              {(senderName[0] || "U").toUpperCase()}
            </div>
          )}
        </div>
      )}

      <div className={`max-w-[75%] ${isOwn ? "order-1" : ""}`}>
        {/* Sender name + admin badge */}
        {!isOwn && (
          <div className="flex items-center gap-1 ml-1 mb-0.5">
            <span className="text-[11px] font-semibold text-primary">{senderName}</span>
            {isAdmin && (
              <motion.div
                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                title="Administrador verificado"
              >
                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
              </motion.div>
            )}
          </div>
        )}

        {/* Reply preview */}
        {message.reply_to && (
          <div className={`mb-1 px-3 py-1.5 rounded-xl ${isOwn ? "bg-primary/5 border-l-2 border-primary/40" : "bg-muted/40 border-l-2 border-muted-foreground/30"}`}>
            <p className="text-[10px] font-semibold text-primary">{message.reply_to.sender?.nome || "Usuário"}</p>
            <p className="text-[10px] text-muted-foreground truncate">{message.reply_to.content || "🎤 Áudio"}</p>
          </div>
        )}

        <div className={`relative px-3 py-2 rounded-2xl ${
          isOwn
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted/60 text-foreground border border-border/50 rounded-bl-md"
        }`}>
          {/* Text content */}
          {message.type === "text" && (
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          )}

          {/* Audio content */}
          {message.type === "audio" && message.audio_url && (
            <audio controls className="max-w-[250px]" preload="metadata">
              <source src={message.audio_url} type="audio/webm" />
            </audio>
          )}

          {/* Image content */}
          {message.type === "image" && message.image_url && (
            <img src={message.image_url} alt="" className="max-w-[250px] rounded-xl" />
          )}

          {/* Date, Time & status */}
          <div className={`flex items-center gap-1.5 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}>
            <span className={`text-[9px] ${isOwn ? "text-primary-foreground/50" : "text-muted-foreground/70"}`}>{date}</span>
            <span className={`text-[9px] font-medium ${isOwn ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{time}</span>
            {isOwn && (
              message.is_read ? (
                <CheckCheck className="h-3 w-3 text-[hsl(200,80%,55%)]" />
              ) : message.is_delivered ? (
                <CheckCheck className="h-3 w-3 text-primary-foreground/50" />
              ) : (
                <Check className="h-3 w-3 text-primary-foreground/50" />
              )
            )}
          </div>
        </div>

        {/* Reactions */}
        {Object.keys(groupedReactions).length > 0 && (
          <div className={`flex gap-1 mt-0.5 flex-wrap ${isOwn ? "justify-end" : "justify-start"}`}>
            {Object.entries(groupedReactions).map(([emoji, count]) => (
              <button key={emoji} onClick={() => onReact(emoji)} className="text-xs bg-muted/60 border border-border/50 rounded-full px-1.5 py-0.5 hover:bg-muted transition-colors">
                {emoji} {count > 1 && <span className="text-[9px] text-muted-foreground">{count}</span>}
              </button>
            ))}
          </div>
        )}

        {/* Quick actions */}
        {showActions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`absolute top-0 ${isOwn ? "left-0 -translate-x-full" : "right-0 translate-x-full"} flex items-center gap-0.5 px-1 z-10`}
          >
            <button onClick={onReply} className="p-1.5 rounded-lg bg-card border border-border shadow-sm hover:bg-muted/50 transition-colors" title="Responder">
              <Reply className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            <button onClick={() => setShowQuickEmoji(!showQuickEmoji)} className="p-1.5 rounded-lg bg-card border border-border shadow-sm hover:bg-muted/50 transition-colors" title="Reagir">
              <SmilePlus className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            {isOwn && (
              <button onClick={onDelete} className="p-1.5 rounded-lg bg-card border border-border shadow-sm hover:bg-destructive/10 transition-colors" title="Apagar">
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </button>
            )}
          </motion.div>
        )}

        {/* Quick emoji picker */}
        {showQuickEmoji && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`absolute -top-8 ${isOwn ? "right-0" : "left-0"} flex gap-0.5 bg-card border border-border rounded-full px-2 py-1 shadow-lg z-20`}
          >
            {QUICK_EMOJIS.map(e => (
              <button key={e} onClick={() => { onReact(e); setShowQuickEmoji(false); }} className="text-sm hover:scale-125 transition-transform p-0.5">
                {e}
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
