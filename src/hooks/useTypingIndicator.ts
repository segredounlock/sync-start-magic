import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface TypingUser {
  userId: string;
  nome: string;
}

export function useTypingIndicator(conversationId: string | null) {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const typingTimeouts = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const lastSent = useRef(0);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!conversationId || !user) return;

    const channel = supabase.channel(`typing-${conversationId}`);
    channelRef.current = channel;

    channel
      .on("broadcast", { event: "typing" }, (payload: any) => {
        const { userId, nome } = payload.payload || {};
        if (!userId || userId === user.id) return;

        // Clear existing timeout for this user
        const existing = typingTimeouts.current.get(userId);
        if (existing) clearTimeout(existing);

        // Add or update typing user
        setTypingUsers(prev => {
          const filtered = prev.filter(u => u.userId !== userId);
          return [...filtered, { userId, nome }];
        });

        // Remove after 3 seconds of no typing
        const timeout = setTimeout(() => {
          setTypingUsers(prev => prev.filter(u => u.userId !== userId));
          typingTimeouts.current.delete(userId);
        }, 3000);

        typingTimeouts.current.set(userId, timeout);
      })
      .on("broadcast", { event: "stop_typing" }, (payload: any) => {
        const { userId } = payload.payload || {};
        if (!userId || userId === user.id) return;
        setTypingUsers(prev => prev.filter(u => u.userId !== userId));
        const existing = typingTimeouts.current.get(userId);
        if (existing) {
          clearTimeout(existing);
          typingTimeouts.current.delete(userId);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
      typingTimeouts.current.forEach(t => clearTimeout(t));
      typingTimeouts.current.clear();
      setTypingUsers([]);
    };
  }, [conversationId, user]);

  const sendTyping = useCallback(
    (nome: string) => {
      if (!channelRef.current || !user) return;
      const now = Date.now();
      // Throttle: send at most once per 2 seconds
      if (now - lastSent.current < 2000) return;
      lastSent.current = now;
      channelRef.current.send({
        type: "broadcast",
        event: "typing",
        payload: { userId: user.id, nome },
      });
    },
    [user]
  );

  const sendStopTyping = useCallback(() => {
    if (!channelRef.current || !user) return;
    channelRef.current.send({
      type: "broadcast",
      event: "stop_typing",
      payload: { userId: user.id },
    });
  }, [user]);

  const typingText = typingUsers.length === 0
    ? null
    : typingUsers.length === 1
      ? `${typingUsers[0].nome} está digitando...`
      : typingUsers.length === 2
        ? `${typingUsers[0].nome} e ${typingUsers[1].nome} estão digitando...`
        : `${typingUsers[0].nome} e mais ${typingUsers.length - 1} estão digitando...`;

  return { typingUsers, typingText, sendTyping, sendStopTyping };
}
