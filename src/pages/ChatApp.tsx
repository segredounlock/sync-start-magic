import { useAuth } from "@/hooks/useAuth";
import { useConversations, GENERAL_CHAT_ID } from "@/hooks/useChat";
import { supabase } from "@/integrations/supabase/client";
import { usePresenceTracker } from "@/hooks/usePresence";
import { ConversationList } from "@/components/chat/ConversationList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { NewChatModal } from "@/components/chat/NewChatModal";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, ArrowLeft, Plus, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ChatApp() {
  const navigate = useNavigate();
  const { user } = useAuth();
  usePresenceTracker();
  const { conversations, loading, startConversation } = useConversations();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [showNewChat, setShowNewChat] = useState(false);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Block pinch-zoom inside chat
  useEffect(() => {
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    };
    document.addEventListener("touchmove", preventZoom, { passive: false });
    return () => document.removeEventListener("touchmove", preventZoom);
  }, []);

  useEffect(() => {
    supabase.rpc("get_chat_enabled" as any)
      .then(({ data }) => { setChatEnabled(data === true); });
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-muted/50 border border-border flex items-center justify-center mb-4">
          <MessageCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-2">Chat Desativado</h3>
        <p className="text-sm text-muted-foreground">O chat está temporariamente indisponível.</p>
        <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
          Voltar
        </button>
      </div>
    );
  }

  // Mobile: full screen chat experience
  if (isMobileView) {
    return (
      <div className="h-[100dvh] bg-background flex flex-col overflow-hidden" style={{ touchAction: "pan-y", userSelect: "none", WebkitUserSelect: "none" }}>
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
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-muted/50 transition-colors">
                    <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                  </button>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                      <MessageCircle className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-foreground">Bate-papo</h2>
                      <p className="text-[10px] text-muted-foreground">{conversations.length} conversas</p>
                    </div>
                  </div>
                </div>
                <button onClick={() => setShowNewChat(true)} className="p-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors">
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

  // Desktop: full screen side-by-side
  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden" style={{ touchAction: "pan-y", userSelect: "none", WebkitUserSelect: "none" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-muted/50 transition-colors">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Bate-papo</h1>
              <p className="text-[10px] text-muted-foreground">{conversations.length} conversas</p>
            </div>
          </div>
        </div>
        <button onClick={() => setShowNewChat(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors text-primary text-sm font-medium">
          <Plus className="h-4 w-4" />
          Nova conversa
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Conversation list */}
        <div className="w-[360px] flex flex-col border-r border-border bg-card/50">
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
      </div>

      {showNewChat && <NewChatModal onClose={() => setShowNewChat(false)} onSelectUser={handleStartChat} />}
    </div>
  );
}
