import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useConversations, GENERAL_CHAT_ID } from "@/hooks/useChat";
import { supabase } from "@/integrations/supabase/client";
import { ConversationList } from "./ConversationList";
import { ChatWindow } from "./ChatWindow";
import { NewChatModal } from "./NewChatModal";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, ArrowLeft, Plus } from "lucide-react";

interface ChatPageProps {
  onBack?: () => void;
  forceMobile?: boolean;
}

export function ChatPage({ onBack, forceMobile }: ChatPageProps) {
  const { user } = useAuth();
  const { conversations, loading, startConversation } = useConversations();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(GENERAL_CHAT_ID);
  const [showNewChat, setShowNewChat] = useState(false);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [isMobileView, setIsMobileView] = useState(forceMobile || window.innerWidth < 768);

  useEffect(() => {
    if (forceMobile) return;
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [forceMobile]);

  // Check if chat is enabled
  useEffect(() => {
    supabase.from("system_config").select("value").eq("key", "chat_enabled").maybeSingle()
      .then(({ data }) => { if (data) setChatEnabled(data.value === "true"); });
  }, []);

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const isGroupChat = activeConversation?.type === 'group';

  const handleStartChat = async (userId: string) => {
    try {
      const convId = await startConversation(userId);
      if (convId) setActiveConversationId(convId);
      setShowNewChat(false);
    } catch (err: any) {
      console.error(err);
    }
  };

  const { role } = useAuth();

  if (!chatEnabled && role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-muted/50 border border-border flex items-center justify-center mb-4">
          <MessageCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-2">Chat Desativado</h3>
        <p className="text-sm text-muted-foreground">O chat está temporariamente indisponível.</p>
      </div>
    );
  }

  // Mobile: show either list or chat
  if (isMobileView) {
    return (
      <div className="h-full flex flex-col">
        <AnimatePresence mode="wait">
          {activeConversationId ? (
            <motion.div key="chat" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="flex-1 flex flex-col min-h-0">
              <ChatWindow
                conversationId={activeConversationId}
                otherUser={activeConversation?.other_user}
                isGroup={isGroupChat}
                groupName={activeConversation?.name || undefined}
                groupIcon={activeConversation?.icon}
                onBack={() => setActiveConversationId(null)}
              />
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  {onBack && (
                    <button onClick={onBack} className="p-2 rounded-xl hover:bg-muted/50 transition-colors">
                      <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                    </button>
                  )}
                  <h2 className="text-lg font-bold text-foreground">Conversas</h2>
                </div>
                <button onClick={() => setShowNewChat(true)} className="p-2 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors">
                  <Plus className="h-5 w-5 text-primary" />
                </button>
              </div>
              <ConversationList
                conversations={conversations}
                loading={loading}
                activeId={activeConversationId}
                onSelect={setActiveConversationId}
              />
            </motion.div>
          )}
        </AnimatePresence>
        {showNewChat && <NewChatModal onClose={() => setShowNewChat(false)} onSelectUser={handleStartChat} />}
      </div>
    );
  }

  // Desktop: side-by-side
  return (
    <div className="h-full flex rounded-2xl border border-border overflow-hidden bg-card">
      {/* Left: Conversation list */}
      <div className="w-[340px] flex flex-col border-r border-border">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            {onBack && (
              <button onClick={onBack} className="p-2 rounded-xl hover:bg-muted/50 transition-colors">
                <ArrowLeft className="h-5 w-5 text-muted-foreground" />
              </button>
            )}
            <h2 className="text-lg font-bold text-foreground">Conversas</h2>
          </div>
          <button onClick={() => setShowNewChat(true)} className="p-2 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors">
            <Plus className="h-5 w-5 text-primary" />
          </button>
        </div>
        <ConversationList
          conversations={conversations}
          loading={loading}
          activeId={activeConversationId}
          onSelect={setActiveConversationId}
        />
      </div>

      {/* Right: Chat window */}
      <div className="flex-1 flex flex-col min-h-0">
        {activeConversationId ? (
          <ChatWindow
            conversationId={activeConversationId}
            otherUser={activeConversation?.other_user}
            isGroup={isGroupChat}
            groupName={activeConversation?.name || undefined}
            groupIcon={activeConversation?.icon}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
              <MessageCircle className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Selecione uma conversa</h3>
            <p className="text-sm text-muted-foreground">Escolha uma conversa ao lado ou inicie uma nova</p>
          </div>
        )}
      </div>

      {showNewChat && <NewChatModal onClose={() => setShowNewChat(false)} onSelectUser={handleStartChat} />}
    </div>
  );
}
