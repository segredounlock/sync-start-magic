import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const PRESENCE_CHANNEL = "chat-presence";
const HEARTBEAT_INTERVAL = 30000; // 30s

// Singleton channel reference so tracker + watchers share the same channel
let sharedChannel: any = null;
let sharedChannelRefCount = 0;

function getSharedChannel() {
  if (!sharedChannel) {
    sharedChannel = supabase.channel(PRESENCE_CHANNEL, {
      config: { presence: { key: "global" } },
    });
  }
  sharedChannelRefCount++;
  return sharedChannel;
}

function releaseSharedChannel() {
  sharedChannelRefCount--;
  if (sharedChannelRefCount <= 0) {
    if (sharedChannel) {
      supabase.removeChannel(sharedChannel);
      sharedChannel = null;
    }
    sharedChannelRefCount = 0;
  }
}

/**
 * Tracks the current user's presence on the chat page.
 * Updates last_seen_at on the profiles table when leaving.
 */
export function usePresenceTracker() {
  const { user } = useAuth();
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!user) return;

    const channel = getSharedChannel();
    channelRef.current = channel;

    // Update last_seen_at immediately on entering chat
    supabase
      .from("profiles")
      .update({ last_seen_at: new Date().toISOString() } as any)
      .eq("id", user.id)
      .then(() => {});

    // Only subscribe if not already subscribed
    if (channel.state !== "joined" && channel.state !== "joining") {
      channel
        .on("presence", { event: "sync" }, () => {})
        .subscribe(async (status: string) => {
          if (status === "SUBSCRIBED") {
            await channel.track({ user_id: user.id, online_at: new Date().toISOString() });
          }
        });
    } else {
      // Already subscribed, just track
      channel.track({ user_id: user.id, online_at: new Date().toISOString() });
    }

    // Heartbeat: update last_seen_at periodically
    heartbeatRef.current = setInterval(() => {
      supabase
        .from("profiles")
        .update({ last_seen_at: new Date().toISOString() } as any)
        .eq("id", user.id)
        .then(() => {});
    }, HEARTBEAT_INTERVAL);

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);

      // Update last_seen_at when leaving
      supabase
        .from("profiles")
        .update({ last_seen_at: new Date().toISOString() } as any)
        .eq("id", user.id)
        .then(() => {});

      if (channelRef.current) {
        channelRef.current.untrack();
      }
      releaseSharedChannel();
      channelRef.current = null;
    };
  }, [user]);
}

/**
 * Returns whether a specific user is currently online in the chat.
 */
export function useUserPresence(userId: string | undefined) {
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!userId) return;

    // Fetch last_seen_at initially
    supabase
      .from("profiles")
      .select("last_seen_at")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.last_seen_at) setLastSeen(data.last_seen_at);
      });

    const channel = getSharedChannel();
    channelRef.current = channel;

    const checkPresence = () => {
      const state = channel.presenceState();
      const online = Object.values(state).some((entries: any) =>
        Array.isArray(entries) && entries.some((e: any) => e.user_id === userId)
      );
      setIsOnline(online);
    };

    // If already joined, check immediately
    if (channel.state === "joined") {
      checkPresence();
    }

    // Listen for sync events
    channel.on("presence", { event: "sync" }, checkPresence);

    // If not subscribed yet, subscribe
    if (channel.state !== "joined" && channel.state !== "joining") {
      channel.subscribe();
    }

    return () => {
      releaseSharedChannel();
      channelRef.current = null;
    };
  }, [userId]);

  return { isOnline, lastSeen };
}
