import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNotificationSound } from "@/hooks/useNotificationSound";
import { styledToast as toast } from "@/lib/toast";
import { SupportChatWidget } from "./SupportChatWidget";
import { motion, AnimatePresence } from "framer-motion";
import { Headphones, HeadphoneOff } from "lucide-react";
import { useLocation } from "react-router-dom";

export function FloatingSupportButton() {
  const { user, role } = useAuth();
  const location = useLocation();
  const { playSound } = useNotificationSound();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [showOfflineTooltip, setShowOfflineTooltip] = useState(false);
  const isOpenRef = useRef(false);
  const unreadCountRef = useRef(0);

  isOpenRef.current = isOpen;
  unreadCountRef.current = unreadCount;

  // Check if support is enabled (realtime)
  useEffect(() => {
    const check = async () => {
      const { data } = await (supabase.from("system_config") as any)
        .select("value")
        .eq("key", "supportEnabled")
        .maybeSingle();
      setEnabled(data?.value !== "false");
    };
    check();

    // Listen for changes to supportEnabled
    const ch = supabase
      .channel("support-enabled-toggle")
      .on("postgres_changes", { event: "*", schema: "public", table: "system_config", filter: "key=eq.supportEnabled" }, (payload: any) => {
        const val = payload.new?.value;
        setEnabled(val !== "false");
      })
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, []);

  // Hide on certain routes
  const hiddenRoutes = ["/chat", "/admin/support"];
  const shouldHide = hiddenRoutes.some(r => location.pathname.startsWith(r));

  // Listen for new messages (notifications)
  useEffect(() => {
    if (!user?.id) return;
    const isAdmin = role === "admin";
    const trackRole = isAdmin ? "client" : "admin";

    const ch = supabase
      .channel("support-unread-notifications")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "support_messages" }, (payload: any) => {
        const msg = payload.new;
        if (msg.sender_role === trackRole && msg.sender_id !== user.id) {
          if (!isOpenRef.current) {
            setUnreadCount(prev => prev + 1);
            setHasNewMessage(true);
            setTimeout(() => setHasNewMessage(false), 3000);
            playSound("message");

            const preview = msg.message?.includes("[img:") ? "📷 Imagem" : (msg.message?.slice(0, 80) || "Nova mensagem");
            toast.info("💬 Nova mensagem do suporte", {
              description: preview + (msg.message?.length > 80 ? "..." : ""),
              action: { label: "Abrir", onClick: () => setIsOpen(true) },
            });
          }
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [user?.id, role, playSound]);

  const handleUnreadChange = useCallback((count: number) => {
    setUnreadCount(count);
  }, []);

  if (!user || shouldHide || role === "admin") return null;

  // When disabled, show offline button with tooltip
  if (!enabled) {
    return (
      <div className="fixed bottom-24 md:bottom-4 right-4 z-[60]">
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={() => {
            setShowOfflineTooltip(prev => !prev);
            if (!showOfflineTooltip) setTimeout(() => setShowOfflineTooltip(false), 4000);
          }}
          whileTap={{ scale: 0.9 }}
          className="relative w-12 h-12 md:w-14 md:h-14 rounded-full bg-muted text-muted-foreground shadow-lg flex items-center justify-center border border-border"
        >
          <HeadphoneOff className="w-5 h-5 md:w-6 md:h-6" />
          {/* Blinking red offline dot */}
          <span className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-destructive border-2 border-muted animate-pulse" />
        </motion.button>

        <AnimatePresence>
          {showOfflineTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.9 }}
              className="absolute bottom-full right-0 mb-2 w-52 p-3 rounded-xl bg-card border border-border shadow-xl z-[61]"
            >
              <p className="text-xs font-semibold text-foreground">🔴 Suporte Offline</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">O atendimento está offline no momento. Tente novamente mais tarde.</p>
              <div className="absolute bottom-[-6px] right-5 w-3 h-3 bg-card border-b border-r border-border rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-24 md:bottom-4 right-4 z-50">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-destructive to-destructive/80 text-destructive-foreground shadow-xl flex items-center justify-center"
        >
          <Headphones className="w-5 h-5 md:w-6 md:h-6" />
          {/* Blinking green online dot */}
          <span className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-background animate-pulse" />

          {/* Pulse ring */}
          <AnimatePresence>
            {hasNewMessage && (
              <motion.span
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: 1.5, repeat: 2, ease: "easeOut" }}
                className="absolute inset-0 rounded-full bg-destructive pointer-events-none"
              />
            )}
          </AnimatePresence>

          {/* Badge */}
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1 rounded-full bg-white text-destructive text-[11px] font-bold flex items-center justify-center"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Widget */}
      <AnimatePresence>
        {isOpen && (
          <SupportChatWidget
            onClose={() => setIsOpen(false)}
            onUnreadChange={handleUnreadChange}
          />
        )}
      </AnimatePresence>
    </>
  );
}
