import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/hooks/useChat";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Check, CheckCheck, Reply, Trash2, SmilePlus, Star, ChevronDown, Copy, Pin, PinOff } from "lucide-react";

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  isGroup?: boolean;
  onReply: () => void;
  onReact: (emoji: string) => void;
  onDelete: () => void;
  onPin?: () => void;
  onScrollToMessage?: (id: string) => void;
}

const QUICK_EMOJIS = ["❤️", "😂", "👍", "😮", "😢", "🔥"];
const SWIPE_THRESHOLD = 60;

export function MessageBubble({ message, isOwn, isGroup, onReply, onReact, onDelete, onPin, onScrollToMessage }: MessageBubbleProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showQuickEmoji, setShowQuickEmoji] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const replyIconOpacity = useTransform(x, isOwn ? [-SWIPE_THRESHOLD, -20] : [20, SWIPE_THRESHOLD], [1, 0]);
  const replyIconScale = useTransform(x, isOwn ? [-SWIPE_THRESHOLD, -10] : [10, SWIPE_THRESHOLD], [1, 0.3]);

  useEffect(() => {
    if (!showDropdown) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showDropdown]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = SWIPE_THRESHOLD;
    if (isOwn && info.offset.x < -threshold) {
      onReply();
    } else if (!isOwn && info.offset.x > threshold) {
      onReply();
    }
  };

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

  const handleCopy = () => {
    if (message.content) {
      navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
    setShowDropdown(false);
  };

  const handleReplyClick = () => {
    if (message.reply_to && onScrollToMessage) {
      onScrollToMessage(message.reply_to.id);
    }
  };

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2 relative overflow-hidden`}>
      {/* Swipe reply indicator */}
      <motion.div
        className={`absolute top-1/2 -translate-y-1/2 ${isOwn ? "left-3" : "right-3"} flex items-center justify-center`}
        style={{ opacity: replyIconOpacity, scale: replyIconScale }}
      >
        <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
          <Reply className="h-4 w-4 text-primary" />
        </div>
      </motion.div>

      <motion.div
        className={`flex ${isOwn ? "justify-end" : "justify-start"} w-full group`}
        style={{ x }}
        drag="x"
        dragConstraints={{ left: isOwn ? -80 : 0, right: isOwn ? 0 : 80 }}
        dragElastic={0.3}
        dragSnapToOrigin
        onDragEnd={handleDragEnd}
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

        <div className={`max-w-[70%] ${isOwn ? "order-1" : ""}`}>
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

          {/* Pinned indicator */}
          {message.is_pinned && (
            <div className={`flex items-center gap-1 mb-0.5 ${isOwn ? "justify-end mr-1" : "ml-1"}`}>
              <Pin className="h-2.5 w-2.5 text-warning rotate-45" />
              <span className="text-[9px] text-warning font-medium">Fixada</span>
            </div>
          )}

          {/* Reply preview - clickable to scroll */}
          {message.reply_to && (
            <div
              onClick={handleReplyClick}
              className={`mb-1 px-3 py-1.5 rounded-xl cursor-pointer transition-colors hover:brightness-110 ${isOwn ? "bg-primary/5 border-l-2 border-primary/40" : "bg-muted/40 border-l-2 border-muted-foreground/30 hover:bg-muted/60"}`}
            >
              <p className="text-[10px] font-semibold text-primary">{message.reply_to.sender?.nome || "Usuário"}</p>
              <p className="text-[10px] text-muted-foreground truncate">{message.reply_to.content || "🎤 Áudio"}</p>
            </div>
          )}

          <div className={`relative px-3 py-2 rounded-2xl ${
            isOwn
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-muted/60 text-foreground border border-border/50 rounded-bl-md"
          }`}>
            {/* Dropdown trigger */}
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className={`absolute top-1.5 right-1.5 p-0.5 rounded-md transition-colors ${
                isOwn ? "hover:bg-primary-foreground/10 text-primary-foreground/40 hover:text-primary-foreground/70" : "hover:bg-muted text-muted-foreground/40 hover:text-muted-foreground/70"
              }`}
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>

            {/* Dropdown menu */}
            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  ref={dropdownRef}
                  initial={{ opacity: 0, scale: 0.9, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute z-30 ${isOwn ? "right-0" : "left-0"} top-full mt-1 bg-popover border border-border rounded-xl shadow-xl min-w-[150px] overflow-hidden`}
                >
                  <button onClick={() => { onReply(); setShowDropdown(false); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-foreground hover:bg-muted/60 transition-colors">
                    <Reply className="h-4 w-4 text-primary" /> Responder
                  </button>
                  {message.type === "text" && message.content && (
                    <button onClick={handleCopy} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-foreground hover:bg-muted/60 transition-colors">
                      <Copy className="h-4 w-4 text-muted-foreground" /> {copied ? "Copiado!" : "Copiar"}
                    </button>
                  )}
                  {onPin && (
                    <button onClick={() => { onPin(); setShowDropdown(false); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-foreground hover:bg-muted/60 transition-colors">
                      {message.is_pinned ? <><PinOff className="h-4 w-4 text-warning" /> Desafixar</> : <><Pin className="h-4 w-4 text-warning" /> Fixar</>}
                    </button>
                  )}
                  <button onClick={() => { setShowQuickEmoji(true); setShowDropdown(false); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-foreground hover:bg-muted/60 transition-colors">
                    <SmilePlus className="h-4 w-4 text-muted-foreground" /> Reagir
                  </button>
                  {isOwn && (
                    <button onClick={() => { onDelete(); setShowDropdown(false); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors">
                      <Trash2 className="h-4 w-4" /> Apagar
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Text content */}
            {message.type === "text" && (
              <p className="text-sm whitespace-pre-wrap break-words pr-4">{message.content}</p>
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

          {/* Quick emoji picker */}
          <AnimatePresence>
            {showQuickEmoji && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className={`absolute -top-8 ${isOwn ? "right-0" : "left-10"} flex gap-0.5 bg-card border border-border rounded-full px-2 py-1 shadow-lg z-20`}
              >
                {QUICK_EMOJIS.map(e => (
                  <button key={e} onClick={() => { onReact(e); setShowQuickEmoji(false); }} className="text-sm hover:scale-125 transition-transform p-0.5">
                    {e}
                  </button>
                ))}
                <button onClick={() => setShowQuickEmoji(false)} className="text-xs text-muted-foreground ml-1 hover:text-foreground">✕</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Avatar for own messages */}
        {isOwn && (
          <div className="flex-shrink-0 ml-2 mt-auto">
            {message.sender?.avatar_url ? (
              <img src={message.sender.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-primary/30" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center text-primary font-bold text-[11px]">
                {(senderName[0] || "U").toUpperCase()}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
