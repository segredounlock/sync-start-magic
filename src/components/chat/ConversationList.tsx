import { ChatConversation, GENERAL_CHAT_ID, UPDATES_CHAT_ID } from "@/hooks/useChat";
import { formatChatTimestamp } from "@/lib/timezone";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { VerificationBadge, BadgeType } from "@/components/VerificationBadge";
import { useGroupPresence } from "@/hooks/usePresence";

interface ConversationListProps {
  conversations: ChatConversation[];
  loading: boolean;
  activeId: string | null;
  onSelect: (id: string) => void;
}

export function ConversationList({ conversations, loading, activeId, onSelect }: ConversationListProps) {

  if (loading) {
    return (
      <div className="flex-1 p-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-14 h-14 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-3 bg-muted rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 text-center">
        <p className="text-sm text-muted-foreground">Nenhuma conversa ainda.<br />Inicie uma nova conversa!</p>
      </div>
    );
  }

  const fmtTime = (d: string) => formatChatTimestamp(d);

  const pinnedIds = new Set([UPDATES_CHAT_ID, GENERAL_CHAT_ID, '00000000-0000-0000-0000-000000000002']);
  const pinned = conversations.filter(c => pinnedIds.has(c.id));
  const regular = conversations.filter(c => !pinnedIds.has(c.id));

  const renderItem = (conv: ChatConversation) => {
    const isGroup = conv.type === 'group';
    const isGeneral = conv.id === GENERAL_CHAT_ID;
    const name = isGroup ? (conv.name || "Grupo") : (conv.other_user?.nome || conv.other_user?.email?.split("@")[0] || "Usuário");
    const initial = isGroup ? "G" : (name[0] || "U").toUpperCase();
    const isActive = activeId === conv.id;
    const isAdmin = conv.other_user?.role === 'admin';
    const hasSpecialNameEffect = isAdmin || !!conv.other_user?.verification_badge;

    return (
      <motion.button
        key={conv.id}
        layout
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={() => onSelect(conv.id)}
        className={`w-full flex items-center gap-3 px-4 py-3.5 transition-colors text-left hover:bg-muted/50 ${isActive ? "bg-primary/10 border-r-2 border-primary" : ""}`}
      >
        {isGroup ? (
          <div className="relative flex-shrink-0">
            {conv.icon && conv.icon.startsWith("http") ? (
              <img src={conv.icon} alt="" referrerPolicy="no-referrer" className="w-14 h-14 rounded-full object-cover border-2 border-primary/20" />
            ) : (
              <div className={`w-14 h-14 rounded-full flex items-center justify-center border ${isGeneral ? "bg-primary/15 border-primary/30" : "bg-accent/15 border-accent/30"}`}>
                {conv.icon && !conv.icon.startsWith("http") ? (
                  <span className="text-2xl">{conv.icon}</span>
                ) : (
                  <Users className={`h-6 w-6 ${isGeneral ? "text-primary" : "text-accent"}`} />
                )}
              </div>
            )}
            {(conv.unread_count || 0) > 0 && (
              <div className="absolute -top-0.5 -left-0.5 min-w-[20px] h-[20px] rounded-full bg-primary border-2 border-card flex items-center justify-center">
                <span className="text-[10px] font-bold text-primary-foreground px-0.5">{conv.unread_count}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="relative flex-shrink-0">
            {conv.other_user?.avatar_url ? (
              <img src={conv.other_user.avatar_url} alt="" referrerPolicy="no-referrer" className="w-14 h-14 rounded-full object-cover border-2 border-border" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center text-primary font-bold text-base">
                {initial}
              </div>
            )}
            {(conv.unread_count || 0) > 0 && (
              <div className="absolute -top-0.5 -left-0.5 min-w-[20px] h-[20px] rounded-full bg-primary border-2 border-card flex items-center justify-center">
                <span className="text-[10px] font-bold text-primary-foreground px-0.5">{conv.unread_count}</span>
              </div>
            )}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 min-w-0">
              <span className={`font-semibold text-sm truncate ${hasSpecialNameEffect ? "shimmer-letters" : isGeneral ? "text-primary" : "text-foreground"}`}>
                {name}
              </span>
              {conv.other_user?.verification_badge ? (
                <VerificationBadge badge={conv.other_user.verification_badge as BadgeType} size="sm" />
              ) : isAdmin ? (
                <VerificationBadge badge="verificado" size="sm" />
              ) : null}
            </span>
            <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-2">{fmtTime(conv.last_message_at)}</span>
          </div>
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-xs text-muted-foreground truncate">{(conv.last_message_text || "Nova conversa").replace(/<[^>]*>/g, '')}</span>
          </div>
        </div>
      </motion.button>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide" style={{ WebkitOverflowScrolling: "touch", overscrollBehavior: "contain" }}>
      {pinned.map(renderItem)}
      {pinned.length > 0 && regular.length > 0 && (
        <div className="px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Contatos</span>
            <div className="flex-1 h-px bg-border" />
          </div>
        </div>
      )}
      {regular.map(renderItem)}
    </div>
  );
}
