import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const PRESENCE_CHANNEL = "chat-presence-v2";
const HEARTBEAT_INTERVAL = 15000; // 15s

/**
 * Manages a single presence channel instance.
 * Tracker mounts/unmounts control tracking; watchers just read state.
 */
class PresenceManager {
  private channel: any = null;
  private listeners = new Set<() => void>();
  private trackedUserId: string | null = null;
  private subscribing = false;

  private getChannel() {
    if (!this.channel) {
      this.channel = supabase.channel(PRESENCE_CHANNEL);
      this.channel.on("presence", { event: "sync" }, () => {
        this.notifyListeners();
      });
    }
    return this.channel;
  }

  private ensureSubscribed() {
    const ch = this.getChannel();
    if (ch.state === "joined" || this.subscribing) return;
    this.subscribing = true;
    ch.subscribe((status: string) => {
      this.subscribing = false;
      if (status === "SUBSCRIBED") {
        if (this.trackedUserId) {
          ch.track({ user_id: this.trackedUserId, online_at: new Date().toISOString() }, { key: this.trackedUserId });
        }
        this.notifyListeners();
      }
    });
  }

  track(userId: string) {
    this.trackedUserId = userId;
    const ch = this.getChannel();
    this.ensureSubscribed();
    if (ch.state === "joined") {
      ch.track({ user_id: userId, online_at: new Date().toISOString() }, { key: userId });
    }
  }

  untrack() {
    this.trackedUserId = null;
    if (this.channel && this.channel.state === "joined") {
      this.channel.untrack();
    }
  }

  getOnlineUserIds(): string[] {
    if (!this.channel) return [];
    const state = this.channel.presenceState();
    const ids = new Set<string>();
    Object.values(state).forEach((entries: any) => {
      if (Array.isArray(entries)) {
        entries.forEach((e: any) => {
          if (e.user_id) ids.add(e.user_id);
        });
      }
    });
    return Array.from(ids);
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    this.ensureSubscribed();
    return () => {
      this.listeners.delete(listener);
      // If no more listeners and not tracking, clean up channel
      if (this.listeners.size === 0 && !this.trackedUserId) {
        this.destroy();
      }
    };
  }

  private notifyListeners() {
    this.listeners.forEach((fn) => fn());
  }

  destroy() {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
    this.subscribing = false;
  }
}

const presenceManager = new PresenceManager();

/**
 * Tracks the current user's presence globally (any page).
 * Mounted once in AppRoot's GlobalPresence component.
 */
export function usePresenceTracker() {
  const { user } = useAuth();
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!user) return;

    // Track immediately
    presenceManager.track(user.id);

    // Update last_seen_at on enter
    supabase
      .from("profiles")
      .update({ last_seen_at: new Date().toISOString() } as any)
      .eq("id", user.id)
      .then(() => {});

    // Heartbeat: re-track + update last_seen_at
    heartbeatRef.current = setInterval(() => {
      presenceManager.track(user.id);
      supabase
        .from("profiles")
        .update({ last_seen_at: new Date().toISOString() } as any)
        .eq("id", user.id)
        .then(() => {});
    }, HEARTBEAT_INTERVAL);

    // Re-track on visibility change (tab back)
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        presenceManager.track(user.id);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);

      // Untrack when leaving chat
      presenceManager.untrack();

      // Update last_seen_at on leave
      supabase
        .from("profiles")
        .update({ last_seen_at: new Date().toISOString() } as any)
        .eq("id", user.id)
        .then(() => {});
    };
  }, [user?.id]);
}

/**
 * Returns whether a specific user is currently online in the chat.
 */
export function useUserPresence(userId: string | undefined) {
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Fetch last_seen_at initially
    supabase
      .from("profiles_public")
      .select("last_seen_at")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.last_seen_at) setLastSeen(data.last_seen_at);
      });

    const check = () => {
      const ids = presenceManager.getOnlineUserIds();
      setIsOnline(ids.includes(userId));
    };

    // Check immediately
    check();

    // Subscribe to changes
    const unsub = presenceManager.subscribe(check);

    return unsub;
  }, [userId]);

  return { isOnline, lastSeen };
}

/**
 * Returns the list of online user IDs and count for group chats.
 */
export function useGroupPresence() {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const sync = () => {
      setOnlineUsers(presenceManager.getOnlineUserIds());
    };

    // Check immediately
    sync();

    // Subscribe to realtime sync events
    const unsub = presenceManager.subscribe(sync);

    // Fallback poll every 3s
    intervalRef.current = setInterval(sync, 3000);

    return () => {
      unsub();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { onlineUsers, onlineCount: onlineUsers.length };
}
