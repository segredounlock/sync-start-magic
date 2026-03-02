import { useState, useRef, useEffect, useCallback } from "react";
import { ChatMessage } from "@/hooks/useChat";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Check, CheckCheck, Reply, Trash2, Star, ChevronDown, Copy, Pin, PinOff, X, Info, BadgeCheck, Pencil } from "lucide-react";
import { MessageInfoModal } from "./MessageInfoModal";

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  isGroup?: boolean;
  isCurrentUserAdmin?: boolean;
  onReply: () => void;
  onReact: (emoji: string) => void;
  onDelete: () => void;
  onEdit?: (newContent: string) => void;
  onPin?: () => void;
  onScrollToMessage?: (id: string) => void;
}

const QUICK_EMOJIS = ["👍", "❤️", "🤩", "🥳", "😮", "👏", "😊"];
const SWIPE_THRESHOLD = 60;

export function MessageBubble({ message, isOwn, isGroup, isCurrentUserAdmin, onReply, onReact, onDelete, onEdit, onPin, onScrollToMessage }: MessageBubbleProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLongPressMenu, setShowLongPressMenu] = useState(false);
  const [showMessageInfo, setShowMessageInfo] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content || "");
  const editInputRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);
  const touchStartPoint = useRef<{ x: number; y: number } | null>(null);
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

  // Close long press menu on outside click
  useEffect(() => {
    if (!showLongPressMenu) return;
    const handler = () => setShowLongPressMenu(false);
    // Delay to avoid immediate close
    const t = setTimeout(() => document.addEventListener("click", handler), 50);
    return () => { clearTimeout(t); document.removeEventListener("click", handler); };
  }, [showLongPressMenu]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (isOwn && info.offset.x < -SWIPE_THRESHOLD) onReply();
    else if (!isOwn && info.offset.x > SWIPE_THRESHOLD) onReply();
  };

  // Long press handlers
  const startLongPress = useCallback(() => {
    longPressTriggered.current = false;
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      setShowLongPressMenu(true);
      // Haptic feedback if available
      if (navigator.vibrate) navigator.vibrate(30);
    }, 500);
  }, []);

  const cancelLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  if (message.is_deleted) {
    const deletedByAdmin = message.deleted_by && message.deleted_by !== message.sender_id;
    return (
      <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-1`}>
        <div className="px-3 py-2 rounded-2xl bg-muted/30 border border-border/50 max-w-[75%]">
          <p className="text-xs text-muted-foreground italic">
            {deletedByAdmin ? "🛡️ Removido pelo Admin" : "🚫 Mensagem apagada"}
          </p>
        </div>
      </div>
    );
  }

  const dateTime = new Date(message.created_at);
  const time = dateTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const date = dateTime.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  const senderName = message.sender?.nome || "Usuário";
  const isAdmin = message.sender?.isAdmin === true;

  // Check if message can be edited (own within 10 min, or admin any time)
  const canEditOwn = isOwn && message.type === "text" && !message.is_deleted && onEdit &&
    (Date.now() - new Date(message.created_at).getTime()) < 10 * 60 * 1000;
  const canEditAdmin = isCurrentUserAdmin && !isOwn && message.type === "text" && !message.is_deleted && onEdit;
  const canEdit = canEditOwn || canEditAdmin;

  // Admin can delete any message
  const canDelete = isOwn || isCurrentUserAdmin;

  const isEdited = message.created_at !== message.updated_at && !message.is_deleted;
  const editedByAdmin = isEdited && message.edited_by && message.edited_by !== message.sender_id;

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
    setShowLongPressMenu(false);
  };

  const handleStartEdit = () => {
    setEditText(message.content || "");
    setIsEditing(true);
    setShowDropdown(false);
    setShowLongPressMenu(false);
    setTimeout(() => editInputRef.current?.focus(), 100);
  };

  const handleSaveEdit = () => {
    if (editText.trim() && editText.trim() !== message.content && onEdit) {
      onEdit(editText.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText(message.content || "");
  };

  const handleReplyClick = () => {
    if (message.reply_to && onScrollToMessage) {
      onScrollToMessage(message.reply_to.id);
    }
  };

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2 relative overflow-visible`}>
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
          {/* Sender name + verified badge */}
          <div className={`flex items-center gap-1 mb-0.5 ${isOwn ? "justify-end mr-1" : "ml-1"}`}>
            <span className={`text-[11px] font-bold uppercase tracking-wide ${isOwn ? "text-primary" : "text-primary"}`}>{senderName}</span>
            {isAdmin && (
              <motion.div
                animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                className="inline-flex"
              >
                <BadgeCheck className="h-3.5 w-3.5 text-success fill-success/30" />
              </motion.div>
            )}
          </div>

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

          <div
            className={`relative px-3 py-2 rounded-2xl select-none ${
              isOwn
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-muted/60 text-foreground border border-border/50 rounded-bl-md"
            }`}
            onPointerDown={(e) => {
              if (e.pointerType !== "touch") return;
              e.stopPropagation();
              touchStartPoint.current = { x: e.clientX, y: e.clientY };
              startLongPress();
            }}
            onPointerUp={(e) => {
              if (e.pointerType !== "touch") return;
              e.stopPropagation();
              const wasLongPress = longPressTriggered.current;
              cancelLongPress();
              touchStartPoint.current = null;
              if (isOwn && !wasLongPress) {
                setShowMessageInfo(true);
              }
            }}
            onPointerCancel={() => {
              cancelLongPress();
              touchStartPoint.current = null;
            }}
            onPointerMove={(e) => {
              if (e.pointerType !== "touch" || !touchStartPoint.current) return;
              const dx = Math.abs(e.clientX - touchStartPoint.current.x);
              const dy = Math.abs(e.clientY - touchStartPoint.current.y);
              if (dx > 12 || dy > 12) {
                cancelLongPress();
              }
            }}
            onContextMenu={(e) => { e.preventDefault(); setShowLongPressMenu(true); }}
          >
            {/* Dropdown trigger (desktop) */}
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className={`absolute top-1.5 right-1.5 p-0.5 rounded-md transition-colors hidden sm:block ${
                isOwn ? "hover:bg-primary-foreground/10 text-primary-foreground/70 hover:text-primary-foreground" : "hover:bg-muted text-muted-foreground/60 hover:text-muted-foreground"
              }`}
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>

            {/* Desktop dropdown menu */}
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
                  <button onClick={() => { setShowMessageInfo(true); setShowDropdown(false); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-foreground hover:bg-muted/60 transition-colors">
                    <Info className="h-4 w-4 text-muted-foreground" /> Dados
                  </button>
                  {canEdit && (
                    <button onClick={handleStartEdit} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-foreground hover:bg-muted/60 transition-colors">
                      <Pencil className="h-4 w-4 text-warning" /> Editar
                    </button>
                  )}
                  {canDelete && (
                    <button onClick={() => { onDelete(); setShowDropdown(false); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors">
                      <Trash2 className="h-4 w-4" /> Apagar
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Text content */}
            {message.type === "text" && (
              isEditing ? (
                <div className="flex flex-col gap-2 pr-4">
                  <textarea
                    ref={editInputRef}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSaveEdit(); } if (e.key === "Escape") handleCancelEdit(); }}
                    className={`text-sm rounded-xl px-3 py-2 resize-none outline-none min-h-[48px] transition-all ${
                      isOwn
                        ? "bg-background/20 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 focus:border-primary-foreground/50 focus:ring-1 focus:ring-primary-foreground/20"
                        : "bg-muted/60 border border-border text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                    }`}
                    rows={2}
                  />
                  <div className="flex gap-2 justify-end">
                    <button onClick={handleCancelEdit} className="text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-destructive/20 text-destructive hover:bg-destructive/30 border border-destructive/20 transition-colors">
                      Cancelar
                    </button>
                    <button onClick={handleSaveEdit} className="text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-success/20 text-success hover:bg-success/30 border border-success/20 transition-colors">
                      ✓ Salvar
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap break-words pr-4">{message.content}</p>
              )
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
              {isEdited && <span className={`text-[8px] italic ${isOwn ? "text-primary-foreground/40" : "text-muted-foreground/60"}`}>{editedByAdmin ? "editado pelo admin" : "editado"}</span>}
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

      {/* Mobile long-press bottom sheet */}
      <AnimatePresence>
        {showLongPressMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowLongPressMenu(false)}
            />
            {/* Bottom sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border rounded-t-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle bar */}
              <div className="flex justify-center pt-2 pb-1">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
              </div>

              {/* Quick emoji row */}
              <div className="flex items-center justify-center gap-2 px-4 py-3 border-b border-border/50">
                {QUICK_EMOJIS.map(e => (
                  <button
                    key={e}
                    onClick={() => { onReact(e); setShowLongPressMenu(false); }}
                    className="text-2xl hover:scale-125 active:scale-95 transition-transform p-1"
                  >
                    {e}
                  </button>
                ))}
              </div>

              {/* Action buttons */}
              <div className="py-1">
                <button
                  onClick={() => { onReply(); setShowLongPressMenu(false); }}
                  className="w-full flex items-center justify-between px-5 py-3.5 text-foreground active:bg-muted/60 transition-colors"
                >
                  <span className="text-[15px]">Responder</span>
                  <Reply className="h-5 w-5 text-muted-foreground" />
                </button>

                {message.type === "text" && message.content && (
                  <button
                    onClick={handleCopy}
                    className="w-full flex items-center justify-between px-5 py-3.5 text-foreground active:bg-muted/60 transition-colors"
                  >
                    <span className="text-[15px]">{copied ? "Copiado!" : "Copiar"}</span>
                    <Copy className="h-5 w-5 text-muted-foreground" />
                  </button>
                )}

                {onPin && (
                  <button
                    onClick={() => { onPin(); setShowLongPressMenu(false); }}
                    className="w-full flex items-center justify-between px-5 py-3.5 text-foreground active:bg-muted/60 transition-colors"
                  >
                    <span className="text-[15px]">{message.is_pinned ? "Desafixar" : "Fixar"}</span>
                    {message.is_pinned ? <PinOff className="h-5 w-5 text-warning" /> : <Pin className="h-5 w-5 text-warning" />}
                  </button>
                )}

                {canEdit && (
                  <button
                    onClick={handleStartEdit}
                    className="w-full flex items-center justify-between px-5 py-3.5 text-foreground active:bg-muted/60 transition-colors"
                  >
                    <span className="text-[15px]">Editar</span>
                    <Pencil className="h-5 w-5 text-warning" />
                  </button>
                )}

                {canDelete && (
                  <button
                    onClick={() => { onDelete(); setShowLongPressMenu(false); }}
                    className="w-full flex items-center justify-between px-5 py-3.5 text-destructive active:bg-destructive/10 transition-colors"
                  >
                    <span className="text-[15px]">Apagar</span>
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}

                <button
                  onClick={() => { setShowMessageInfo(true); setShowLongPressMenu(false); }}
                  className="w-full flex items-center justify-between px-5 py-3.5 text-foreground active:bg-muted/60 transition-colors"
                >
                  <span className="text-[15px]">Dados da mensagem</span>
                  <Info className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              {/* Cancel */}
              <div className="px-4 pb-6 pt-1">
                <button
                  onClick={() => setShowLongPressMenu(false)}
                  className="w-full py-3 rounded-xl bg-muted/60 text-muted-foreground text-[15px] font-medium active:bg-muted transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Message Info Modal */}
      <MessageInfoModal
        message={message}
        open={showMessageInfo}
        onClose={() => setShowMessageInfo(false)}
      />
    </div>
  );
}
