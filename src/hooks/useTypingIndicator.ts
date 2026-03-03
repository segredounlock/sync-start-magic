import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type ActivityType = "typing" | "recording" | "emoji";

interface TypingUser {
  userId: string;
  nome: string;
  activity: ActivityType;
}

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  typing: "digitando",
  recording: "gravando áudio",
  emoji: "escolhendo emoji",
};

export function useTypingIndicator(conversationId: string | null) {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const typingTimeouts = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const lastSent = useRef(0);
  const channelRef = useRef<any>(null);
  const subscribedRef = useRef(false);

  useEffect(() => {
    if (!conversationId || !user) return;

    subscribedRef.current = false;
    const channel = supabase.channel(`typing-${conversationId}`);
    channelRef.current = channel;

    channel
      .on("broadcast", { event: "typing" }, (payload: any) => {
        const { userId, nome, activity } = payload.payload || {};
        if (!userId || userId === user.id) return;

        const existing = typingTimeouts.current.get(userId);
        if (existing) clearTimeout(existing);

        setTypingUsers(prev => {
          const filtered = prev.filter(u => u.userId !== userId);
          return [...filtered, { userId, nome, activity: activity || "typing" }];
        });

        const timeout = setTimeout(() => {
          setTypingUsers(prev => prev.filter(u => u.userId !== userId));
          typingTimeouts.current.delete(userId);
        }, 4000);

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
      .subscribe((status: string) => {
        if (status === "SUBSCRIBED") {
          subscribedRef.current = true;
        }
      });

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
      subscribedRef.current = false;
      typingTimeouts.current.forEach(t => clearTimeout(t));
      typingTimeouts.current.clear();
      setTypingUsers([]);
    };
  }, [conversationId, user]);

  const sendTyping = useCallback(
    (nome: string, activity: ActivityType = "typing") => {
      if (!channelRef.current || !user || !subscribedRef.current) return;
      const now = Date.now();
      if (now - lastSent.current < 2000) return;
      lastSent.current = now;
      channelRef.current.send({
        type: "broadcast",
        event: "typing",
        payload: { userId: user.id, nome, activity },
      });
    },
    [user]
  );

  const sendStopTyping = useCallback(() => {
    if (!channelRef.current || !user || !subscribedRef.current) return;
    lastSent.current = 0; // Reset throttle so next activity sends immediately
    channelRef.current.send({
      type: "broadcast",
      event: "stop_typing",
      payload: { userId: user.id },
    });
  }, [user]);

  // Build display text grouped by activity
  const typingText = (() => {
    if (typingUsers.length === 0) return null;

    // Group by activity
    const groups = new Map<ActivityType, string[]>();
    typingUsers.forEach(u => {
      const list = groups.get(u.activity) || [];
      list.push(u.nome);
      groups.set(u.activity, list);
    });

    const parts: string[] = [];
    groups.forEach((names, activity) => {
      const label = ACTIVITY_LABELS[activity] || "digitando";
      if (names.length === 1) {
        parts.push(`${names[0]} está ${label}...`);
      } else if (names.length === 2) {
        parts.push(`${names[0]} e ${names[1]} estão ${label}...`);
      } else {
        parts.push(`${names[0]} e mais ${names.length - 1} estão ${label}...`);
      }
    });

    return parts.join(" · ");
  })();

  // Icon hint for the primary activity
  const typingActivity: ActivityType | null = typingUsers.length > 0 ? typingUsers[typingUsers.length - 1].activity : null;

  return { typingUsers, typingText, typingActivity, sendTyping, sendStopTyping };
}
