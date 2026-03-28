import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";


export const GENERAL_CHAT_ID = "00000000-0000-0000-0000-000000000001";
export const BUG_REPORT_CHAT_ID = "00000000-0000-0000-0000-000000000002";
export const UPDATES_CHAT_ID = "00000000-0000-0000-0000-000000000003";

export interface ChatConversation {
  id: string;
  participant_1: string;
  participant_2: string | null;
  type: string;
  name: string | null;
  icon: string | null;
  is_blocked?: boolean;
  last_message_text: string | null;
  last_message_at: string;
  created_at: string;
  other_user?: {
    id: string;
    nome: string | null;
    email: string | null;
    avatar_url: string | null;
    role?: string;
    verification_badge?: string | null;
  };
  unread_count?: number;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  type: string;
  audio_url: string | null;
  image_url: string | null;
  is_read: boolean;
  read_at: string | null;
  is_delivered: boolean;
  delivered_at: string | null;
  reply_to_id: string | null;
  is_deleted: boolean;
  is_pinned: boolean;
  pinned_at: string | null;
  pinned_by: string | null;
  deleted_by: string | null;
  edited_by: string | null;
  created_at: string;
  updated_at: string;
  reactions?: ChatReaction[];
  reply_to?: ChatMessage | null;
  sender?: { nome: string | null; avatar_url: string | null; isAdmin?: boolean; verification_badge?: string | null };
}

export interface ChatReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
}

export function useConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(false);
  const initialLoadDone = useRef(false);
  const activeConvoRef = useRef<string | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    if (!initialLoadDone.current) setLoading(true);
    try {
      const { data, error } = await supabase
        .from("chat_conversations")
        .select("*")
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id},type.eq.group`)
        .order("last_message_at", { ascending: false });

      if (error) throw error;

      // Deduplicate direct conversations (keep the one with most recent message)
      const seen = new Map<string, any>();
      for (const c of (data || [])) {
        if (c.type === 'direct') {
          const otherId = c.participant_1 === user.id ? c.participant_2 : c.participant_1;
          const key = `direct-${otherId}`;
          const existing = seen.get(key);
          if (!existing || new Date(c.last_message_at || 0) > new Date(existing.last_message_at || 0)) {
            seen.set(key, c);
          }
        } else {
          seen.set(c.id, c);
        }
      }
      const allConvos = Array.from(seen.values());
      const directConvos = allConvos.filter((c: any) => c.type === 'direct');
      const otherIds = directConvos.map((c: any) =>
        c.participant_1 === user.id ? c.participant_2 : c.participant_1
      ).filter(Boolean);
      const uniqueIds = [...new Set(otherIds)];

      // Parallel: fetch profiles, roles, AND batch unread counts (single RPC call)
      const convoIds = allConvos.map(c => c.id);

      const [profiles, roleData, unreadData] = await Promise.all([
        uniqueIds.length > 0
          ? supabase.from("profiles_public").select("id, nome, avatar_url, verification_badge").in("id", uniqueIds).then(r => (r.data || []).filter(p => p.id != null) as { id: string; nome: string | null; avatar_url: string | null; verification_badge: string | null }[])
          : Promise.resolve([]),
        uniqueIds.length > 0
          ? supabase.from("user_roles").select("user_id, role").in("user_id", uniqueIds).then(r => r.data || [])
          : Promise.resolve([]),
        convoIds.length > 0
          ? supabase.rpc("get_unread_counts", { _user_id: user.id, _conversation_ids: convoIds }).then(r => r.data || [])
          : Promise.resolve([]),
      ]);

      const roleMap: Record<string, string> = {};
      (roleData as any[]).forEach((r: any) => { roleMap[r.user_id] = r.role; });

      const unreadMap: Record<string, number> = {};
      (unreadData as any[]).forEach((u: any) => { unreadMap[u.conversation_id] = Number(u.unread_count) || 0; });
      // Force zero for the conversation the user is currently viewing
      if (activeConvoRef.current) {
        unreadMap[activeConvoRef.current] = 0;
      }

      const convos = allConvos.map((c: any) => {
        if (c.type === 'group') {
          return { ...c, other_user: undefined, unread_count: unreadMap[c.id] || 0 };
        }
        const otherId = c.participant_1 === user.id ? c.participant_2 : c.participant_1;
        const profile = (profiles as any[]).find((p: any) => p.id === otherId);
        const role = roleMap[otherId] || "usuario";
        if (!profile) {
          console.warn(`[CHAT] Profile not found for user ${otherId} in conversation ${c.id}`);
        }
        return {
          ...c,
          other_user: profile
            ? { ...profile, role, verification_badge: profile.verification_badge }
            : { id: otherId, nome: null, email: null, avatar_url: null, role, verification_badge: null },
          unread_count: unreadMap[c.id] || 0,
        };
      });

      const pinnedOrder: Record<string, number> = { [UPDATES_CHAT_ID]: 0, [GENERAL_CHAT_ID]: 1, [BUG_REPORT_CHAT_ID]: 2 };
      convos.sort((a: any, b: any) => {
        const aPin = pinnedOrder[a.id] ?? 999;
        const bPin = pinnedOrder[b.id] ?? 999;
        if (aPin !== bPin) return aPin - bPin;
        return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime();
      });

      setConversations(convos);
    } finally {
      if (!initialLoadDone.current) {
        setLoading(false);
        initialLoadDone.current = true;
      }
    }
  }, [user]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  // Realtime - only listen to conversation changes, not all messages
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("chat-conversations-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_conversations" }, () => {
        fetchConversations();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchConversations]);

  const startConversation = useCallback(async (otherUserId: string) => {
    if (!user) return null;
    const ids = [user.id, otherUserId].sort();
    const { data: existing } = await supabase
      .from("chat_conversations")
      .select("*")
      .or(`and(participant_1.eq.${ids[0]},participant_2.eq.${ids[1]}),and(participant_1.eq.${ids[1]},participant_2.eq.${ids[0]})`)
      .maybeSingle();

    if (existing) return existing.id;

    const { data, error } = await supabase
      .from("chat_conversations")
      .insert({ participant_1: ids[0], participant_2: ids[1], type: 'direct' })
      .select()
      .single();

    if (error) throw error;
    await fetchConversations();
    return data.id;
  }, [user, fetchConversations]);

  const clearUnread = useCallback((conversationId: string | null) => {
    activeConvoRef.current = conversationId;
    if (conversationId) {
      setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, unread_count: 0 } : c));
    }
  }, []);

  return { conversations, loading, fetchConversations, startConversation, clearUnread };
}

// Cache for sender profiles to avoid re-fetching on every realtime update
const senderCache = new Map<string, { nome: string | null; avatar_url: string | null; verification_badge: string | null }>();
const adminCache = new Set<string>();
let cacheTimestamp = 0;
const CACHE_TTL = 60_000; // 1 minute

function isCacheValid() {
  return Date.now() - cacheTimestamp < CACHE_TTL;
}

const PAGE_SIZE = 25;

export function useChatMessages(conversationId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const initialLoadDone = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeConversationRef = useRef<string | null>(null);
  const cachedNome = useRef<string | null>(null);

  // Auto-join public groups if not a member
  useEffect(() => {
    if (!conversationId || !user) return;
    (async () => {
      // Check if this is a public group and user is not yet a member
      const { data: conv } = await supabase
        .from("chat_conversations")
        .select("type, is_private")
        .eq("id", conversationId)
        .maybeSingle();
      if (conv?.type === "group" && !conv?.is_private) {
        const { data: membership } = await supabase
          .from("chat_members")
          .select("id")
          .eq("conversation_id", conversationId)
          .eq("user_id", user.id)
          .maybeSingle();
        if (!membership) {
          await supabase.from("chat_members").insert({
            conversation_id: conversationId,
            user_id: user.id,
          });
        }
      }
    })();
  }, [conversationId, user]);

  // Reset on conversation change
  useEffect(() => {
    activeConversationRef.current = conversationId;
    initialLoadDone.current = false;
    setMessages([]);
    setLoading(true);
    setHasMore(true);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    if (!conversationId) {
      setLoading(false);
    }
  }, [conversationId]);

  // Cache user's own name for sendMessage
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("nome, avatar_url, verification_badge").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data?.nome) cachedNome.current = data.nome;
      if (data) {
        senderCache.set(user.id, {
          nome: data.nome,
          avatar_url: data.avatar_url,
          verification_badge: data.verification_badge,
        });
      }
    });
  }, [user]);

  // Enrich raw messages with sender info and reactions
  const enrichMessages = useCallback(async (rawMsgs: any[]): Promise<ChatMessage[]> => {
    if (rawMsgs.length === 0) return [];

    const msgIds = rawMsgs.map((m: any) => m.id);
    const senderIds = [...new Set(rawMsgs.map((m: any) => m.sender_id))];
    const needsFetch = !isCacheValid() || senderIds.some(id => !senderCache.has(id));

    const [reactions, senders, roles] = await Promise.all([
      msgIds.length > 0
        ? supabase.from("chat_reactions").select("*").in("message_id", msgIds).then(r => r.data || [])
        : Promise.resolve([]),
      needsFetch && senderIds.length > 0
        ? supabase.from("profiles_public").select("id, nome, avatar_url, verification_badge").in("id", senderIds).then(r => (r.data || []).filter(p => p.id != null) as { id: string; nome: string | null; avatar_url: string | null; verification_badge: string | null }[])
        : Promise.resolve(null),
      needsFetch && senderIds.length > 0
        ? supabase.from("user_roles").select("user_id").in("user_id", senderIds).eq("role", "admin").then(r => r.data || [])
        : Promise.resolve(null),
    ]);

    if (senders) {
      (senders as any[]).forEach((s: any) => {
        senderCache.set(s.id, { nome: s.nome, avatar_url: s.avatar_url, verification_badge: s.verification_badge });
      });
      cacheTimestamp = Date.now();
    }
    if (roles) {
      (roles as any[]).forEach((r: any) => adminCache.add(r.user_id));
    }

    const msgs = rawMsgs.map((m: any) => {
      const cached = senderCache.get(m.sender_id);
      return {
        ...m,
        reactions: (reactions as any[]).filter((r: any) => r.message_id === m.id),
        sender: {
          nome: cached?.nome || null,
          avatar_url: cached?.avatar_url || null,
          verification_badge: cached?.verification_badge || null,
          isAdmin: adminCache.has(m.sender_id),
        },
      };
    });

    for (const msg of msgs) {
      if (msg.reply_to_id) {
        msg.reply_to = msgs.find((m: any) => m.id === msg.reply_to_id) || null;
      }
    }

    return msgs;
  }, []);

  const fetchMessages = useCallback(async (retryCount = 0) => {
    if (!conversationId) { setMessages([]); setLoading(false); return; }
    if (activeConversationRef.current !== conversationId) return;

    try {
      // Timeout: abort if takes longer than 8 seconds
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false })
        .limit(PAGE_SIZE)
        .abortSignal(controller.signal);

      clearTimeout(timeout);

      if (activeConversationRef.current !== conversationId) return;

      if (error) {
        console.error("Erro ao carregar mensagens:", error);
        // Retry up to 2 times with exponential backoff
        if (retryCount < 2) {
          setTimeout(() => fetchMessages(retryCount + 1), 1000 * (retryCount + 1));
          return;
        }
        setLoading(false);
        return;
      }

      const rawMsgs = (data || []).reverse();
      setHasMore(rawMsgs.length >= PAGE_SIZE);

      const msgs = await enrichMessages(rawMsgs);
      if (activeConversationRef.current !== conversationId) return;

      setMessages(msgs);
    } catch (err: any) {
      console.error("Erro inesperado ao carregar mensagens:", err);
      // Retry on abort/network errors
      if (retryCount < 2) {
        setTimeout(() => fetchMessages(retryCount + 1), 1500 * (retryCount + 1));
        return;
      }
      // Even on failure, stop loading to prevent infinite spinner
      setMessages([]);
    } finally {
      if (activeConversationRef.current === conversationId) {
        if (!initialLoadDone.current) {
          setLoading(false);
          initialLoadDone.current = true;
        }
      }
    }

    // Mark unread messages as read (non-blocking, separate try/catch)
    try {
      if (user) {
        // Find messages not yet read by this user (using chat_message_reads for per-user tracking)
        const { data: allMsgs } = await supabase
          .from("chat_messages")
          .select("id")
          .eq("conversation_id", conversationId)
          .neq("sender_id", user.id)
          .eq("is_deleted", false)
          .limit(200);

        if (allMsgs && allMsgs.length > 0) {
          const allIds = allMsgs.map((m: any) => m.id);
          const { data: alreadyRead } = await supabase
            .from("chat_message_reads")
            .select("message_id")
            .eq("user_id", user.id)
            .in("message_id", allIds);

          const readSet = new Set((alreadyRead || []).map((r: any) => r.message_id));
          const unreadIds = allIds.filter(id => !readSet.has(id));

          if (unreadIds.length > 0) {
            // Update global is_read for direct chats (backward compat)
            await supabase
              .from("chat_messages")
              .update({ is_read: true, read_at: new Date().toISOString() })
              .in("id", unreadIds);

            // Insert per-user read receipts
            const readReceipts = unreadIds.map((msgId: string) => ({
              message_id: msgId,
              user_id: user.id,
              read_at: new Date().toISOString(),
            }));
            await supabase
              .from("chat_message_reads")
              .upsert(readReceipts, { onConflict: "message_id,user_id" });

            // Touch conversation to trigger realtime refetch of unread counts
            await supabase
              .from("chat_conversations")
              .update({ updated_at: new Date().toISOString() })
              .eq("id", conversationId);
          }
        }
      }
    } catch (readErr) {
      console.warn("Erro ao marcar como lido:", readErr);
    }
  }, [conversationId, user, enrichMessages]);

  // Load older messages (called on scroll to top)
  const loadOlderMessages = useCallback(async () => {
    if (!conversationId || !hasMore || loadingOlder) return;
    const oldestMsg = messages[0];
    if (!oldestMsg) return;

    setLoadingOlder(true);
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .lt("created_at", oldestMsg.created_at)
        .order("created_at", { ascending: false })
        .limit(PAGE_SIZE);

      if (error) return;

      const rawMsgs = (data || []).reverse();
      if (rawMsgs.length < PAGE_SIZE) setHasMore(false);
      if (rawMsgs.length === 0) return;

      const enriched = await enrichMessages(rawMsgs);
      if (activeConversationRef.current !== conversationId) return;

      // Resolve reply_to for old messages that reference each other or existing messages
      const allMsgs = [...enriched, ...messages];
      for (const msg of enriched) {
        if (msg.reply_to_id && !msg.reply_to) {
          msg.reply_to = allMsgs.find(m => m.id === msg.reply_to_id) || null;
        }
      }

      setMessages(prev => [...enriched, ...prev]);
    } finally {
      setLoadingOlder(false);
    }
  }, [conversationId, hasMore, loadingOlder, messages, enrichMessages]);

  const debouncedFetch = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchMessages(), 300);
  }, [fetchMessages]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  // Realtime messages - handle INSERTs locally, only full-fetch for UPDATE/DELETE
  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`chat-msgs-${conversationId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "chat_messages",
        filter: `conversation_id=eq.${conversationId}`,
      }, async (payload: any) => {
        const newMsg = payload.new;
        if (!newMsg) return;
        // Skip if it's our own message (already handled optimistically)
        if (newMsg.sender_id === user?.id) {
          // Replace the optimistic message with the real one
          setMessages(prev => {
            const hasOptimistic = prev.some(m => m.id.startsWith("optimistic-") && m.sender_id === newMsg.sender_id);
            if (hasOptimistic) {
              // Remove first optimistic message and append real one
              const filtered = prev.filter((m, i) => {
                if (m.id.startsWith("optimistic-") && m.sender_id === newMsg.sender_id) {
                  // Only remove the first match
                  const firstOptIdx = prev.findIndex(x => x.id.startsWith("optimistic-") && x.sender_id === newMsg.sender_id);
                  return i !== firstOptIdx;
                }
                return true;
              });
              const cached = senderCache.get(newMsg.sender_id);
              return [...filtered, {
                ...newMsg,
                reactions: [],
                reply_to: newMsg.reply_to_id ? filtered.find((m: any) => m.id === newMsg.reply_to_id) || null : null,
                sender: {
                  nome: cached?.nome || null,
                  avatar_url: cached?.avatar_url || null,
                  verification_badge: cached?.verification_badge || null,
                  isAdmin: adminCache.has(newMsg.sender_id),
                },
              }];
            }
            return prev;
          });
          return;
        }
        // For other users' messages, append locally with cached sender info
        let cached = senderCache.get(newMsg.sender_id);
        if (!cached) {
          const { data } = await supabase.from("profiles_public").select("id, nome, avatar_url, verification_badge").eq("id", newMsg.sender_id).maybeSingle();
          if (data && data.id) {
            cached = { nome: data.nome, avatar_url: data.avatar_url, verification_badge: data.verification_badge };
            senderCache.set(data.id, cached);
            cacheTimestamp = Date.now();
          }
        }
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, {
            ...newMsg,
            reactions: [],
            reply_to: newMsg.reply_to_id ? prev.find((m: any) => m.id === newMsg.reply_to_id) || null : null,
            sender: {
              nome: cached?.nome || null,
              avatar_url: cached?.avatar_url || null,
              verification_badge: cached?.verification_badge || null,
              isAdmin: adminCache.has(newMsg.sender_id),
            },
          }];
        });
        // Mark as read non-blocking
        if (user) {
          supabase.from("chat_messages")
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq("id", newMsg.id).then(() => {});
        }
      })
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "chat_messages",
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload: any) => {
        const updated = payload.new;
        if (!updated) return;
        setMessages(prev => prev.map(m => m.id === updated.id ? { ...m, ...updated } : m));
      })
      .on("postgres_changes", {
        event: "DELETE", schema: "public", table: "chat_messages",
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload: any) => {
        const deleted = payload.old;
        if (!deleted) return;
        setMessages(prev => prev.filter(m => m.id !== deleted.id));
      })
      .subscribe();

    // Separate channel for reactions
    const reactionsChannel = supabase
      .channel(`chat-reactions-${conversationId}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "chat_reactions",
      }, (payload: any) => {
        const messageId = payload.new?.message_id || payload.old?.message_id;
        if (messageId) {
          debouncedFetch();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(reactionsChannel);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [conversationId, user, debouncedFetch]);

  const sendMessage = useCallback(async (content: string, type = "text", audioUrl?: string, imageUrl?: string, replyToId?: string) => {
    if (!conversationId || !user) return;

    // Optimistic: insert message into local state immediately
    const optimisticId = `optimistic-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    const senderName = cachedNome.current || "Você";
    const optimisticMsg: ChatMessage = {
      id: optimisticId,
      conversation_id: conversationId,
      sender_id: user.id,
      content: type === "text" ? content : null,
      type,
      audio_url: audioUrl || null,
      image_url: imageUrl || null,
      is_read: false,
      read_at: null,
      is_delivered: false,
      delivered_at: null,
      reply_to_id: replyToId || null,
      is_deleted: false,
      is_pinned: false,
      pinned_at: null,
      pinned_by: null,
      deleted_by: null,
      edited_by: null,
      created_at: now,
      updated_at: now,
      reactions: [],
      reply_to: replyToId ? messages.find(m => m.id === replyToId) || null : null,
      sender: {
        nome: senderName,
        avatar_url: senderCache.get(user.id)?.avatar_url || null,
        verification_badge: senderCache.get(user.id)?.verification_badge || null,
        isAdmin: adminCache.has(user.id),
      },
    };

    setMessages(prev => [...prev, optimisticMsg]);

    try {
      const { error } = await supabase.from("chat_messages").insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: type === "text" ? content : null,
        type,
        audio_url: audioUrl || null,
        image_url: imageUrl || null,
        reply_to_id: replyToId || null,
        is_delivered: true,
        delivered_at: now,
      });
      if (error) {
        // Remove optimistic message on failure
        setMessages(prev => prev.filter(m => m.id !== optimisticId));
        throw error;
      }
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== optimisticId));
      throw err;
    }

    const msgPreview = type === "text" ? content.replace(/<[^>]*>/g, '') : type === "audio" ? "🎤 Áudio" : "📷 Imagem";
    const previewText = `${senderName}: ${msgPreview}`;

    // Non-blocking conversation update
    supabase.from("chat_conversations").update({
      last_message_text: previewText.length > 100 ? previewText.slice(0, 100) + "…" : previewText,
      last_message_at: now,
      updated_at: now,
    }).eq("id", conversationId).then(({ error }) => {
      if (error) console.error("[CHAT] Failed to update conversation preview:", error.message);
    });
  }, [conversationId, user, messages]);

  const toggleReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!user) return;
    const existing = messages.find(m => m.id === messageId)?.reactions?.find(
      r => r.user_id === user.id && r.emoji === emoji
    );
    if (existing) {
      await supabase.from("chat_reactions").delete().eq("id", existing.id);
    } else {
      await supabase.from("chat_reactions").insert({ message_id: messageId, user_id: user.id, emoji });
    }
  }, [user, messages]);

  const deleteMessage = useCallback(async (messageId: string, isAdmin = false) => {
    if (!user) return;
    const msg = messages.find(m => m.id === messageId);
    if (isAdmin) {
      await supabase.from("chat_messages").update({ is_deleted: true, deleted_by: user.id }).eq("id", messageId);
    } else {
      await supabase.from("chat_messages").update({ is_deleted: true, deleted_by: user.id }).eq("id", messageId).eq("sender_id", user.id);
    }

    // Update conversation preview if this was the last message
    if (msg?.conversation_id) {
      const { data: lastMsg } = await supabase
        .from("chat_messages")
        .select("content, is_deleted")
        .eq("conversation_id", msg.conversation_id)
        .eq("is_deleted", false)
        .neq("id", messageId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const newPreview = lastMsg?.content?.replace(/<[^>]*>/g, '').slice(0, 100) || "Mensagem apagada";
      await supabase
        .from("chat_conversations")
        .update({ last_message_text: newPreview, updated_at: new Date().toISOString() })
        .eq("id", msg.conversation_id);
    }
  }, [user, messages]);

  const editMessage = useCallback(async (messageId: string, newContent: string, isAdmin = false) => {
    if (!user || !newContent.trim()) throw new Error("Mensagem inválida para edição.");
    const msg = messages.find(m => m.id === messageId);
    if (!msg) throw new Error("Mensagem não encontrada.");

    const trimmed = newContent.trim();
    const now = new Date().toISOString();

    // Validate BEFORE optimistic update to prevent silent reverts
    if (!isAdmin) {
      if (msg.sender_id !== user.id) throw new Error("Você não pode editar essa mensagem.");
      const diff = Date.now() - new Date(msg.created_at).getTime();
      if (diff > 10 * 60 * 1000) {
        console.warn("Edição bloqueada: mensagem com mais de 10 minutos");
        throw new Error("Edição permitida apenas nos primeiros 10 minutos.");
      }
    }

    // Optimistic local update (only after validation passes)
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content: trimmed, updated_at: now, edited_by: user.id } : m));

    const updateData = { content: trimmed, updated_at: now, edited_by: user.id };
    let editError = false;

    if (isAdmin) {
      const { error } = await supabase.from("chat_messages").update(updateData).eq("id", messageId);
      if (error) {
        console.error("Admin edit error:", error);
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content: msg.content, updated_at: msg.updated_at, edited_by: msg.edited_by } : m));
        editError = true;
        throw new Error("Não foi possível editar a mensagem.");
      }
    } else {
      const { error } = await supabase.from("chat_messages").update(updateData).eq("id", messageId).eq("sender_id", user.id);
      if (error) {
        console.error("Edit error:", error);
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content: msg.content, updated_at: msg.updated_at, edited_by: msg.edited_by } : m));
        editError = true;
        throw new Error("Não foi possível editar a mensagem.");
      }
    }

    // Recompute/persist latest conversation preview via backend function
    if (!editError && conversationId) {
      const { error: syncErr } = await supabase.rpc("sync_chat_conversation_preview" as any, {
        _conversation_id: conversationId,
      });

      if (syncErr) {
        console.error("Conversation preview sync error:", syncErr);
      }
    }
  }, [user, messages, conversationId]);

  const pinMessage = useCallback(async (messageId: string) => {
    if (!user || !conversationId) return;
    const msg = messages.find(m => m.id === messageId);
    if (!msg) return;
    const newPinned = !msg.is_pinned;
    await supabase.from("chat_messages").update({
      is_pinned: newPinned,
      pinned_at: newPinned ? new Date().toISOString() : null,
      pinned_by: newPinned ? user.id : null,
    }).eq("id", messageId);
  }, [user, conversationId, messages]);

  return { messages, loading, loadingOlder, hasMore, sendMessage, toggleReaction, deleteMessage, editMessage, pinMessage, fetchMessages, loadOlderMessages };
}
