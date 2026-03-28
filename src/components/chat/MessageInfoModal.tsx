import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage } from "@/hooks/useChat";
import { formatDateFullBR, formatTimeBR } from "@/lib/timezone";

interface MessageInfoModalProps {
  message: ChatMessage;
  open: boolean;
  onClose: () => void;
}

interface ReadReceipt {
  user_id: string;
  read_at: string;
  profile?: {
    nome: string | null;
    avatar_url: string | null;
  };
}

export function MessageInfoModal({ message, open, onClose }: MessageInfoModalProps) {
  const [reads, setReads] = useState<ReadReceipt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    setLoading(true);

    const fetchReads = async () => {
      // Fetch read receipts for this message
      const { data: readData } = await supabase
        .from("chat_message_reads")
        .select("user_id, read_at")
        .eq("message_id", message.id)
        .neq("user_id", message.sender_id)
        .order("read_at", { ascending: false });

      if (!readData || readData.length === 0) {
        setReads([]);
        setLoading(false);
        return;
      }

      // Fetch profiles
      const userIds = readData.map(r => r.user_id);
      const { data: profiles } = await supabase
        .from("profiles_public")
        .select("id, nome, avatar_url, verification_badge")
        .in("id", userIds);

      const receipts: ReadReceipt[] = readData.map(r => ({
        ...r,
        profile: (profiles || []).find(p => p.id === r.user_id) || { nome: null, avatar_url: null },
      }));

      setReads(receipts);
      setLoading(false);
    };

    fetchReads();
  }, [open, message.id, message.sender_id]);

  const formatDate = (dateStr: string) => {
    return formatDateFullBR(dateStr) + " às " + formatTimeBR(dateStr);
  };

  const formatRelative = (dateStr: string) => {
    const now = new Date();
    const d = new Date(dateStr);
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return "agora";
    if (diffMin < 60) return `há ${diffMin} min`;
    if (diffHours < 24) return `há ${diffHours}h`;
    if (diffDays === 1) return "há 1 dia";
    return `há ${diffDays} dias`;
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[70]"
            onClick={onClose}
          />
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-[15%] sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[400px] z-[70] bg-card border border-border rounded-2xl shadow-2xl max-h-[70vh] flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-destructive/15 flex items-center justify-center">
                  <Clock className="h-3.5 w-3.5 text-destructive" />
                </div>
                <h3 className="font-semibold text-sm text-foreground">Dados da mensagem</h3>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
                <X className="h-4 w-4 text-destructive" />
              </button>
            </div>

            {/* Message preview */}
            <div className="px-4 py-3 border-b border-border/50">
              <div className="bg-muted/40 rounded-xl px-3 py-2.5 border border-border/50">
                <div className="flex items-center gap-1.5 mb-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">{formatDate(message.created_at)}</span>
                </div>
                <p className="text-sm text-foreground">
                  {message.type === "text" ? message.content : message.type === "audio" ? "🎤 Áudio" : "📷 Imagem"}
                </p>
              </div>
            </div>

            {/* Viewed by */}
            <div className="flex-1 overflow-y-auto">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/30">
                <Eye className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary">
                  Visualizado por {loading ? "..." : reads.length}
                </span>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : reads.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-xs text-muted-foreground">Ninguém visualizou ainda</p>
                </div>
              ) : (
                <div className="py-1">
                  {reads.map(r => (
                    <div key={r.user_id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors">
                      {r.profile?.avatar_url ? (
                        <img src={r.profile.avatar_url} alt="" referrerPolicy="no-referrer" className="w-9 h-9 rounded-full object-cover border-2 border-border" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                          {(r.profile?.nome?.[0] || "U").toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{r.profile?.nome || "Usuário"}</p>
                        <p className="text-[10px] text-muted-foreground">{formatRelative(r.read_at)}</p>
                      </div>
                      <Eye className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
