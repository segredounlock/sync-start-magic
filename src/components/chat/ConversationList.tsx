import { ChatConversation, GENERAL_CHAT_ID } from "@/hooks/useChat";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { VerificationBadge, BadgeType } from "@/components/VerificationBadge";

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
            <div className="w-12 h-12 rounded-full bg-muted" />
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

  const fmtTime = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    if (diffDays === 1) return "Ontem";
    if (diffDays < 7) return date.toLocaleDateString("pt-BR", { weekday: "short" });
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((conv, i) => {
        const isGroup = conv.type === 'group';
        const isGeneral = conv.id === GENERAL_CHAT_ID;
        const name = isGroup ? (conv.name || "Grupo") : (conv.other_user?.nome || conv.other_user?.email?.split("@")[0] || "Usuário");
        const initial = isGroup ? "G" : (name[0] || "U").toUpperCase();
        const isActive = activeId === conv.id;
        const isAdmin = conv.other_user?.role === 'admin';

        return (
          <motion.button
            key={conv.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => onSelect(conv.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left hover:bg-muted/50 ${isActive ? "bg-primary/10 border-r-2 border-primary" : ""}`}
          >
            {isGroup ? (
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${isGeneral ? "bg-primary/15 border-primary/30" : "bg-accent/15 border-accent/30"}`}>
                <Users className={`h-5 w-5 ${isGeneral ? "text-primary" : "text-accent"}`} />
              </div>
            ) : conv.other_user?.avatar_url ? (
              <img src={conv.other_user.avatar_url} alt="" referrerPolicy="no-referrer" className="w-12 h-12 rounded-full object-cover border-2 border-border" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                {initial}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 min-w-0">
                  <span className={`font-semibold text-sm truncate ${isGeneral ? "text-primary" : "text-foreground"}`}>
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
                <span className="text-xs text-muted-foreground truncate">{conv.last_message_text || "Nova conversa"}</span>
                {(conv.unread_count || 0) > 0 && (
                  <span className="ml-2 min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                    {conv.unread_count}
                  </span>
                )}
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
