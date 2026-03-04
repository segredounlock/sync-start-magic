import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { ChatMessage } from "@/hooks/useChat";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { Check, CheckCheck, Reply, Trash2, Star, ChevronDown, Copy, Pin, PinOff, X, Info, Pencil, Play, Pause } from "lucide-react";
import { VerificationBadge, BadgeType } from "@/components/VerificationBadge";
import { MessageInfoModal } from "./MessageInfoModal";
import { UserRecargasModal } from "./UserRecargasModal";
import { formatTimeBR, formatDateShortBR } from "@/lib/timezone";

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  isGroup?: boolean;
  isCurrentUserAdmin?: boolean;
  isCurrentUserModerator?: boolean;
  onReply: () => void;
  onReact: (emoji: string) => void;
  onDelete: () => void;
  onEdit?: () => void;
  onPin?: () => void;
  onScrollToMessage?: (id: string) => void;
}

const QUICK_EMOJIS = ["👍", "❤️", "🤩", "🥳", "😮", "👏", "😊"];
const SWIPE_THRESHOLD = 50;
const SWIPE_LOCK_ANGLE = 30; // degrees - lock horizontal after this angle

function CustomAudioPlayer({ src, isOwn, senderAvatar, senderName }: { src: string; isOwn: boolean; senderAvatar?: string | null; senderName?: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [waveform] = useState(() => {
    const bars: number[] = [];
    let seed = 0;
    for (let i = 0; i < src.length && i < 20; i++) seed += src.charCodeAt(i);
    for (let i = 0; i < 28; i++) {
      seed = (seed * 16807 + 7) % 2147483647;
      bars.push(0.25 + (seed % 100) / 133);
    }
    return bars;
  });
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    let maxTimeReached = 0;

    const updateDuration = () => {
      const rawDuration = audio.duration;
      const seekableDuration = audio.seekable && audio.seekable.length > 0
        ? audio.seekable.end(audio.seekable.length - 1)
        : 0;
      const resolvedDuration = (rawDuration && isFinite(rawDuration) && rawDuration > 0)
        ? rawDuration
        : seekableDuration > 0 ? seekableDuration : 0;

      if (resolvedDuration && isFinite(resolvedDuration) && resolvedDuration > 0) {
        setDuration(resolvedDuration);
      }
    };
    const onTime = () => {
      setCurrentTime(audio.currentTime);
      if (audio.currentTime > maxTimeReached) {
        maxTimeReached = audio.currentTime;
      }
      updateDuration();
    };
    const onEnd = () => {
      if (!duration && maxTimeReached > 0) {
        setDuration(maxTimeReached);
      }
      setPlaying(false);
      setCurrentTime(0);
    };

    const forceDuration = () => {
      if (audio.duration && isFinite(audio.duration) && audio.duration > 0) return;
      audio.currentTime = 1e10;
      const onSeeked = () => {
        audio.removeEventListener("seeked", onSeeked);
        if (audio.duration && isFinite(audio.duration) && audio.duration > 0) {
          setDuration(audio.duration);
        } else if (audio.currentTime > 0) {
          setDuration(audio.currentTime);
        }
        audio.currentTime = 0;
      };
      audio.addEventListener("seeked", onSeeked);
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", () => { updateDuration(); forceDuration(); });
    audio.addEventListener("durationchange", updateDuration);
    audio.addEventListener("canplay", updateDuration);
    audio.addEventListener("ended", onEnd);
    updateDuration();

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("durationchange", updateDuration);
      audio.removeEventListener("canplay", updateDuration);
      audio.removeEventListener("ended", onEnd);
    };
  }, []);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play(); setPlaying(true); }
  };

  const seek = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const bar = progressRef.current;
    const audio = audioRef.current;
    if (!bar || !audio || !duration) return;
    const rect = bar.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    audio.currentTime = pct * duration;
    setCurrentTime(audio.currentTime);
  };

  const fmt = (s: number) => {
    if (!s || !isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const initial = (senderName?.[0] || "U").toUpperCase();

  return (
    <div
      className={`flex items-center gap-3 min-w-[220px] max-w-[280px] py-1`}
      onPointerDownCapture={(e) => e.stopPropagation()}
    >
      <audio ref={audioRef} src={src} preload="metadata" />
      
      {/* Avatar with play overlay */}
      <button onClick={toggle} className="relative flex-shrink-0 group/play">
        {senderAvatar ? (
          <img src={senderAvatar} alt="" referrerPolicy="no-referrer" className="w-11 h-11 rounded-full object-cover border-2 border-white/20" />
        ) : (
          <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm border-2 ${isOwn ? "bg-white/15 border-white/20 text-white" : "bg-primary/15 border-primary/20 text-primary"}`}>
            {initial}
          </div>
        )}
        {/* Play/Pause overlay */}
        <div className={`absolute inset-0 rounded-full flex items-center justify-center transition-all ${playing ? "bg-black/30" : "bg-black/20 group-hover/play:bg-black/40"}`}>
          {playing ? <Pause className="h-4 w-4 text-white drop-shadow" /> : <Play className="h-4 w-4 text-white ml-0.5 drop-shadow" />}
        </div>
      </button>

      {/* Waveform + time */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div
          ref={progressRef}
          className="flex items-center gap-[2px] h-[30px] cursor-pointer relative"
          onClick={seek}
          onTouchStart={seek}
        >
          {waveform.map((h, i) => {
            const barPct = ((i + 0.5) / waveform.length) * 100;
            const isPlayed = barPct <= pct;
            const isActive = playing && isPlayed && Math.abs(barPct - pct) < (100 / waveform.length);
            return (
              <motion.div
                key={i}
                className={`flex-1 rounded-full transition-colors duration-150 ${
                  isPlayed
                    ? isOwn ? "bg-white/90" : "bg-primary"
                    : isOwn ? "bg-white/25" : "bg-muted-foreground/25"
                }`}
                style={{ height: `${h * 100}%`, minHeight: 3 }}
                animate={isActive ? { scaleY: [1, 1.4, 1] } : { scaleY: 1 }}
                transition={isActive ? { duration: 0.3, repeat: Infinity } : { duration: 0.15 }}
              />
            );
          })}
        </div>
        <span className={`text-[10px] tabular-nums ${isOwn ? "text-white/50" : "text-muted-foreground/70"}`}>
          {fmt(currentTime)} / {fmt(duration)} 
        </span>
      </div>
    </div>
  );
}

export function MessageBubble({ message, isOwn, isGroup, isCurrentUserAdmin, isCurrentUserModerator, onReply, onReact, onDelete, onEdit, onPin, onScrollToMessage }: MessageBubbleProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLongPressMenu, setShowLongPressMenu] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dropdownPos, setDropdownPos] = useState<{ x: number; y: number; openUp?: boolean }>({ x: 0, y: 0 });
  const dropdownBtnRef = useRef<HTMLButtonElement>(null);
  const [showMessageInfo, setShowMessageInfo] = useState(false);
  const [showUserRecargas, setShowUserRecargas] = useState(false);
  const [showImageLightbox, setShowImageLightbox] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);
  const swipeStartRef = useRef<{ x: number; y: number; locked: boolean; direction: 'none' | 'h' | 'v' } | null>(null);
  const x = useMotionValue(0);
  const replyIconOpacity = useTransform(x, isOwn ? [-SWIPE_THRESHOLD, -10] : [10, SWIPE_THRESHOLD], [1, 0]);
  const replyIconScale = useTransform(x, isOwn ? [-SWIPE_THRESHOLD, -5] : [5, SWIPE_THRESHOLD], [1, 0.2]);

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
    const t = setTimeout(() => document.addEventListener("click", handler), 50);
    return () => { clearTimeout(t); document.removeEventListener("click", handler); };
  }, [showLongPressMenu]);

  // Close context menu on outside click
  useEffect(() => {
    if (!showContextMenu) return;
    const handler = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setShowContextMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showContextMenu]);

  // Long press handlers
  const startLongPress = useCallback(() => {
    longPressTriggered.current = false;
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      setShowLongPressMenu(true);
      if (navigator.vibrate) navigator.vibrate(30);
    }, 500);
  }, []);

  const cancelLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleSwipeReply = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(20);
    onReply();
    animate(x, 0, { type: "spring", stiffness: 500, damping: 30 });
  }, [onReply, x]);

  // Custom touch-based swipe for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    swipeStartRef.current = { x: touch.clientX, y: touch.clientY, locked: false, direction: 'none' };
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const start = swipeStartRef.current;
    if (!start) return;
    const touch = e.touches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;

    if (start.direction === 'none') {
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      if (absDx < 8 && absDy < 8) return;
      if (absDy > absDx) {
        start.direction = 'v';
        return;
      }
      start.direction = 'h';
    }

    if (start.direction !== 'h') return;
    cancelLongPress();

    const maxSwipe = 80;
    let clampedDx: number;
    if (isOwn) {
      clampedDx = Math.max(-maxSwipe, Math.min(0, dx));
    } else {
      clampedDx = Math.min(maxSwipe, Math.max(0, dx));
    }

    x.set(clampedDx);

    if (!start.locked && Math.abs(clampedDx) >= SWIPE_THRESHOLD) {
      start.locked = true;
      if (navigator.vibrate) navigator.vibrate(10);
    }
  }, [isOwn, x, cancelLongPress]);

  const handleTouchEnd = useCallback(() => {
    const start = swipeStartRef.current;
    const currentX = x.get();
    swipeStartRef.current = null;

    if (start?.direction === 'h' && Math.abs(currentX) >= SWIPE_THRESHOLD) {
      handleSwipeReply();
    } else {
      animate(x, 0, { type: "spring", stiffness: 500, damping: 30 });
    }
  }, [x, handleSwipeReply]);

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
  const time = formatTimeBR(dateTime);
  const date = formatDateShortBR(dateTime);
  const senderName = message.sender?.nome || "Usuário";
  const isAdmin = message.sender?.isAdmin === true;

  const isMod = isCurrentUserAdmin || isCurrentUserModerator;
  // Check if message can be edited (own within 10 min, or moderator any time for any message)
  const isTextEditable = message.type === "text" && !message.is_deleted && !!onEdit;
  const canEditOwn = isOwn && isTextEditable &&
    (isMod || (Date.now() - new Date(message.created_at).getTime()) < 10 * 60 * 1000);
  const canEditAdmin = isMod && !isOwn && isTextEditable;
  const canEdit = canEditOwn || canEditAdmin;

  // Moderators can delete any message
  const canDelete = isOwn || isMod;

  const isEdited = !!message.edited_by && !message.is_deleted;
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
    setShowContextMenu(false);
  };

  const handleStartEdit = () => {
    setShowDropdown(false);
    setShowLongPressMenu(false);
    setShowContextMenu(false);
    if (onEdit) onEdit();
  };

  const handleReplyClick = () => {
    if (message.reply_to && onScrollToMessage) {
      onScrollToMessage(message.reply_to.id);
    }
  };

  const renderFormattedText = (text: string, keyPrefix: string = "f"): (string | JSX.Element)[] => {
    const boldRegex = /\*\*(.+?)\*\*/g;
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let key = 0;
    while ((match = boldRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      parts.push(
        <strong key={`${keyPrefix}-${key++}`} className="font-bold">{match[1]}</strong>
      );
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    return parts.length > 0 ? parts : [text];
  };

  const renderContentWithMentions = (content: string) => {
    const mentionRegex = /@([\w\sÀ-ÿ]+?)(?=\s|$|[.,!?;:])/g;
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let key = 0;
    while ((match = mentionRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        const textBefore = content.slice(lastIndex, match.index);
        parts.push(...renderFormattedText(textBefore, `t${key}`));
      }
      parts.push(
        <span key={key++} className="text-primary font-semibold">@{match[1]}</span>
      );
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < content.length) {
      const remaining = content.slice(lastIndex);
      parts.push(...renderFormattedText(remaining, `r${key}`));
    }
    return parts.length > 0 ? parts : renderFormattedText(content);
  };

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-1 relative`}>
      {/* Swipe reply indicator */}
      <motion.div
        className={`absolute top-1/2 -translate-y-1/2 ${isOwn ? "left-2" : "right-2"} flex items-center justify-center pointer-events-none z-10`}
        style={{ opacity: replyIconOpacity, scale: replyIconScale }}
      >
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shadow-sm">
          <Reply className="h-4 w-4 text-primary" />
        </div>
      </motion.div>

      <motion.div
        className={`flex items-end ${isOwn ? "flex-row-reverse" : "flex-row"} max-w-[85%] group min-w-0`}
        style={{ x }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >

        <div className={`min-w-0 overflow-hidden max-w-full`}>
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
              className={`mb-1 px-3 py-1.5 rounded-xl cursor-pointer transition-colors hover:brightness-110 overflow-hidden min-w-0 w-full ${isOwn ? "bg-primary/5 border-l-2 border-primary/40" : "bg-muted/40 border-l-2 border-muted-foreground/30 hover:bg-muted/60"}`}
            >
              <p className="text-[10px] font-semibold text-primary truncate">{message.reply_to.sender?.nome || "Usuário"}</p>
              {message.reply_to.type === "image" && message.reply_to.image_url && (
                <img src={message.reply_to.image_url} alt="Imagem" className="w-8 h-8 rounded object-cover mt-0.5" />
              )}
              <p className="text-[10px] text-muted-foreground line-clamp-2">
                {message.reply_to.content || (message.reply_to.type === "audio" ? "🎤 Áudio" : "📷 Imagem")}
              </p>
            </div>
          )}

          <div
            className={`group relative px-3 py-2 select-none overflow-hidden ${
              isOwn
                ? "bg-[hsl(152,45%,18%)] text-white rounded-2xl rounded-tr-md shadow-sm"
                : "bg-card text-foreground border border-border/40 rounded-2xl rounded-tl-md shadow-sm"
            }`}
            onPointerDown={(e) => {
              if (e.pointerType !== "touch") return;
              e.stopPropagation();
              startLongPress();
            }}
            onPointerUp={(e) => {
              if (e.pointerType !== "touch") return;
              e.stopPropagation();
              const wasLongPress = longPressTriggered.current;
              cancelLongPress();
              const target = e.target as HTMLElement;
              const isInteractive = target.tagName === "IMG" || target.closest("audio") || target.closest("button");
              if (isOwn && !wasLongPress && !isInteractive) {
                setShowMessageInfo(true);
              }
            }}
            onPointerCancel={() => { cancelLongPress(); }}
            onPointerMove={() => {}}
            onContextMenu={(e) => {
              e.preventDefault();
              const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
              if (isTouchDevice && window.innerWidth < 640) {
                setShowLongPressMenu(true);
              } else {
                const menuHeight = 220;
                const menuWidth = 170;
                const spaceBelow = window.innerHeight - e.clientY;
                const openUp = spaceBelow < menuHeight && e.clientY > menuHeight;
                const y = openUp
                  ? Math.max(10, e.clientY - menuHeight)
                  : Math.max(60, Math.min(e.clientY, window.innerHeight - menuHeight));
                const x = Math.min(e.clientX, window.innerWidth - menuWidth);
                setContextMenuPos({ x, y });
                setShowContextMenu(true);
              }
            }}
          >
            {/* Avatar + Name inside bubble */}
            <div className={`flex items-center gap-2 mb-1`}>
              <div
                className={`flex-shrink-0 ${isCurrentUserAdmin && !isOwn ? "cursor-pointer" : ""}`}
                onPointerDown={(e) => { if (isCurrentUserAdmin && !isOwn) e.stopPropagation(); }}
                onClick={(e) => { e.stopPropagation(); if (isCurrentUserAdmin && !isOwn && message.sender_id) setShowUserRecargas(true); }}
              >
                {message.sender?.avatar_url ? (
                  <img src={message.sender.avatar_url} alt="" referrerPolicy="no-referrer" className="w-8 h-8 rounded-full object-cover border border-white/20" />
                ) : (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border ${isOwn ? "bg-white/15 border-white/20 text-white" : "bg-primary/15 border-primary/20 text-primary"}`}>
                    {(senderName[0] || "U").toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 min-w-0">
                <span
                  className={`text-[11px] font-bold uppercase tracking-wide truncate ${(isAdmin || !!message.sender?.verification_badge) ? "shimmer-letters" : isOwn ? "text-white/80" : "text-primary"} ${isCurrentUserAdmin && !isOwn ? "cursor-pointer hover:underline" : ""}`}
                  onPointerDown={(e) => { if (isCurrentUserAdmin && !isOwn) e.stopPropagation(); }}
                  onClick={(e) => { e.stopPropagation(); if (isCurrentUserAdmin && !isOwn && message.sender_id) setShowUserRecargas(true); }}
                >{senderName}</span>
                {message.sender?.verification_badge ? (
                  <VerificationBadge badge={message.sender.verification_badge as BadgeType} size="sm" />
                ) : isAdmin ? (
                  <VerificationBadge badge="verificado" size="sm" />
                ) : null}
              </div>
            </div>
            {/* Dropdown trigger (desktop) */}
            <button
              ref={dropdownBtnRef}
              onPointerDownCapture={(e) => { e.stopPropagation(); }}
              onPointerDown={(e) => { e.stopPropagation(); }}
              onPointerUp={(e) => { e.stopPropagation(); }}
              onMouseDown={(e) => { e.stopPropagation(); }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (!showDropdown && dropdownBtnRef.current) {
                  const rect = dropdownBtnRef.current.getBoundingClientRect();
                  const menuH = 220;
                  const spaceBelow = window.innerHeight - rect.bottom;
                  const openUp = spaceBelow < menuH && rect.top > menuH;
                  setDropdownPos({
                    x: isOwn ? rect.right : rect.left,
                    y: openUp ? rect.top - 4 : rect.bottom + 4,
                    openUp,
                  });
                }
                setShowDropdown(!showDropdown);
              }}
              className={`absolute top-1.5 right-1.5 z-10 p-1 rounded-md transition-colors hidden sm:block ${
                showDropdown ? "!block" : ""
              } ${
                isOwn ? "hover:bg-white/10 text-white/60 hover:text-white" : "hover:bg-muted text-muted-foreground/60 hover:text-muted-foreground"
              }`}
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>

            {/* Desktop dropdown menu - rendered via portal to avoid overflow clipping */}
            {showDropdown && createPortal(
              <AnimatePresence>
                <motion.div
                  ref={dropdownRef}
                  initial={{ opacity: 0, scale: 0.9, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -5 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: "fixed",
                    ...(dropdownPos.openUp ? { bottom: window.innerHeight - dropdownPos.y } : { top: dropdownPos.y }),
                    ...(isOwn ? { right: window.innerWidth - dropdownPos.x } : { left: dropdownPos.x }),
                    zIndex: 9999,
                  }}
                  className="bg-popover border border-border rounded-xl shadow-xl min-w-[150px] overflow-hidden"
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
                  {isOwn && (
                  <button onClick={() => { setShowMessageInfo(true); setShowDropdown(false); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-foreground hover:bg-muted/60 transition-colors">
                    <Info className="h-4 w-4 text-muted-foreground" /> Dados
                  </button>
                  )}
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
              </AnimatePresence>,
              document.body
            )}

            {/* Desktop right-click context menu */}
            <AnimatePresence>
              {showContextMenu && (
                <motion.div
                  ref={contextMenuRef}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.12 }}
                  className="fixed z-[70] bg-popover border border-border rounded-xl shadow-2xl min-w-[160px] overflow-hidden"
                  style={{ top: contextMenuPos.y, left: contextMenuPos.x }}
                >
                  <button onClick={() => { onReply(); setShowContextMenu(false); }} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-foreground hover:bg-muted/60 transition-colors">
                    <Reply className="h-4 w-4 text-primary" /> Responder
                  </button>
                  {message.type === "text" && message.content && (
                    <button onClick={handleCopy} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-foreground hover:bg-muted/60 transition-colors">
                      <Copy className="h-4 w-4 text-muted-foreground" /> {copied ? "Copiado!" : "Copiar"}
                    </button>
                  )}
                  {onPin && (
                    <button onClick={() => { onPin(); setShowContextMenu(false); }} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-foreground hover:bg-muted/60 transition-colors">
                      {message.is_pinned ? <><PinOff className="h-4 w-4 text-warning" /> Desafixar</> : <><Pin className="h-4 w-4 text-warning" /> Fixar</>}
                    </button>
                  )}
                  {/* Quick emojis */}
                  <div className="flex items-center justify-center gap-1 px-3 py-2 border-t border-border/50">
                    {QUICK_EMOJIS.slice(0, 5).map(e => (
                      <button key={e} onClick={() => { onReact(e); setShowContextMenu(false); }} className="text-lg hover:scale-125 active:scale-95 transition-transform p-0.5">
                        {e}
                      </button>
                    ))}
                  </div>
                  {canEdit && (
                    <button onClick={handleStartEdit} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-foreground hover:bg-muted/60 transition-colors border-t border-border/50">
                      <Pencil className="h-4 w-4 text-warning" /> Editar
                    </button>
                  )}
                  {canDelete && (
                    <button onClick={() => { onDelete(); setShowContextMenu(false); }} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors">
                      <Trash2 className="h-4 w-4" /> Apagar
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {message.type === "text" && (
              <p className="text-sm whitespace-pre-wrap break-all pr-4" style={{ wordBreak: "break-word", overflowWrap: "anywhere", maxWidth: "100%" }}>
                {renderContentWithMentions(message.content || "")}
              </p>
            )}

            {/* Audio content */}
            {message.type === "audio" && message.audio_url && (
              <CustomAudioPlayer src={message.audio_url} isOwn={isOwn} senderAvatar={message.sender?.avatar_url} senderName={senderName} />
            )}

            {/* Image content */}
            {message.type === "image" && message.image_url && (
              <div
                onPointerDownCapture={(e) => e.stopPropagation()}
                onTouchStartCapture={(e) => e.stopPropagation()}
                onTouchEndCapture={(e) => e.stopPropagation()}
                onClickCapture={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setShowImageLightbox(true);
                }}
                className="cursor-pointer"
              >
                <img
                  src={message.image_url}
                  alt=""
                  className="max-w-[250px] max-h-[300px] rounded-xl hover:brightness-90 transition-all object-cover pointer-events-none"
                  loading="lazy"
                />
              </div>
            )}

            {/* Date, Time & status */}
             <div className={`flex items-center gap-1.5 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}>
              <span className={`text-[9px] ${isOwn ? "text-white/50" : "text-muted-foreground/70"}`}>{date}</span>
              {isEdited && <span className={`text-[8px] italic ${isOwn ? "text-white/40" : "text-muted-foreground/60"}`}>{editedByAdmin ? "editado pelo admin" : "editado"}</span>}
              <span className={`text-[9px] font-medium ${isOwn ? "text-white/60" : "text-muted-foreground"}`}>{time}</span>
              {isOwn && (
                message.is_read ? (
                  <CheckCheck className="h-3 w-3 text-[hsl(200,80%,65%)]" />
                ) : message.is_delivered ? (
                  <CheckCheck className="h-3 w-3 text-white/50" />
                ) : (
                  <Check className="h-3 w-3 text-white/50" />
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
              className="fixed inset-0 bg-black/50 z-[60]"
              onClick={() => setShowLongPressMenu(false)}
            />
            {/* Bottom sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[61] bg-card border-t border-border rounded-t-2xl shadow-2xl"
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

                {isOwn && (
                <button
                  onClick={() => { setShowMessageInfo(true); setShowLongPressMenu(false); }}
                  className="w-full flex items-center justify-between px-5 py-3.5 text-foreground active:bg-muted/60 transition-colors"
                >
                  <span className="text-[15px]">Dados da mensagem</span>
                  <Info className="h-5 w-5 text-muted-foreground" />
                </button>
                )}
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

      {/* User Recargas Modal (admin only) */}
      {showUserRecargas && (
        <UserRecargasModal
          userId={message.sender_id}
          userName={senderName}
          avatarUrl={message.sender?.avatar_url}
          onClose={() => setShowUserRecargas(false)}
        />
      )}

      {/* Image Lightbox - rendered unconditionally via portal for reliable touch */}
      {showImageLightbox && message.image_url && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ touchAction: "none" }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            onClick={() => setShowImageLightbox(false)}
            onTouchEnd={(e) => { e.preventDefault(); setShowImageLightbox(false); }}
          />
          {/* Content */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden max-w-[92vw] max-h-[88vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/30">
              <span className="text-xs font-medium text-muted-foreground">
                {message.sender?.nome || "Imagem"}
              </span>
              <button
                onClick={() => setShowImageLightbox(false)}
                className="p-2 rounded-lg hover:bg-muted transition-colors active:bg-muted"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            {/* Image */}
            <div className="flex items-center justify-center p-3 overflow-auto">
              <img
                src={message.image_url}
                alt=""
                className="max-w-full max-h-[78vh] object-contain rounded-xl"
              />
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  );
}
