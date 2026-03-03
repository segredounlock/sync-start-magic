import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";


export const GENERAL_CHAT_ID = "00000000-0000-0000-0000-000000000001";
export const BUG_REPORT_CHAT_ID = "00000000-0000-0000-0000-000000000002";

export interface ChatConversation {
  id: string;
  participant_1: string;
  participant_2: string | null;
  type: string;
  name: string | null;
  icon: string | null;
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
  const [loading, setLoading] = useState(true);
  const initialLoadDone = useRef(false);

  const fetchConversations = useCallback(async () => {
    if (!user) { setLoading(false); return; }
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

      // Parallel: fetch profiles, roles, AND all unread counts at once
      const convoIds = allConvos.map(c => c.id);

      const [profiles, roleData, unreadCounts] = await Promise.all([
        uniqueIds.length > 0
          ? supabase.from("profiles").select("id, nome, email, avatar_url, verification_badge").in("id", uniqueIds).then(r => r.data || [])
          : Promise.resolve([]),
        uniqueIds.length > 0
          ? supabase.from("user_roles").select("user_id, role").in("user_id", uniqueIds).then(r => r.data || [])
          : Promise.resolve([]),
        // Batch unread counts: one query per conversation in parallel
        Promise.all(convoIds.map(async (cid) => {
          const { count } = await supabase
            .from("chat_messages")
            .select("id", { count: "exact", head: true })
            .eq("conversation_id", cid)
            .neq("sender_id", user.id)
            .eq("is_read", false);
          return { id: cid, count: count || 0 };
        })),
      ]);

      const roleMap: Record<string, string> = {};
      (roleData as any[]).forEach((r: any) => { roleMap[r.user_id] = r.role; });

      const unreadMap: Record<string, number> = {};
      unreadCounts.forEach(u => { unreadMap[u.id] = u.count; });

      const convos = allConvos.map((c: any) => {
        if (c.type === 'group') {
          return { ...c, other_user: undefined, unread_count: unreadMap[c.id] || 0 };
        }
        const otherId = c.participant_1 === user.id ? c.participant_2 : c.participant_1;
        const profile = (profiles as any[]).find((p: any) => p.id === otherId);
        const role = roleMap[otherId] || "usuario";
        return {
          ...c,
          other_user: profile
            ? { ...profile, role, verification_badge: profile.verification_badge }
            : { id: otherId, nome: null, email: null, avatar_url: null, role, verification_badge: null },
          unread_count: unreadMap[c.id] || 0,
        };
      });

      const pinnedOrder: Record<string, number> = { [GENERAL_CHAT_ID]: 0, [BUG_REPORT_CHAT_ID]: 1 };
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

  return { conversations, loading, fetchConversations, startConversation };
}

// Cache for sender profiles to avoid re-fetching on every realtime update
const senderCache = new Map<string, { nome: string | null; avatar_url: string | null; verification_badge: string | null }>();
const adminCache = new Set<string>();
let cacheTimestamp = 0;
const CACHE_TTL = 60_000; // 1 minute

function isCacheValid() {
  return Date.now() - cacheTimestamp < CACHE_TTL;
}

export function useChatMessages(conversationId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const initialLoadDone = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeConversationRef = useRef<string | null>(null);
  const cachedNome = useRef<string | null>(null);

  // Reset on conversation change
  useEffect(() => {
    activeConversationRef.current = conversationId;
    initialLoadDone.current = false;
    setMessages([]);
    setLoading(true);
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
    supabase.from("profiles").select("nome").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data?.nome) cachedNome.current = data.nome;
    });
  }, [user]);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) { setMessages([]); setLoading(false); return; }
    if (activeConversationRef.current !== conversationId) return;

    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(200);

    if (activeConversationRef.current !== conversationId) return;
    if (error) { setLoading(false); return; }

    const rawMsgs = data || [];
    const msgIds = rawMsgs.map((m: any) => m.id);
    const senderIds = [...new Set(rawMsgs.map((m: any) => m.sender_id))];

    // Check which senders we need to fetch (not in cache or cache expired)
    const needsFetch = !isCacheValid() || senderIds.some(id => !senderCache.has(id));

    // Parallel: reactions + sender profiles + roles (only if needed)
    const [reactions, senders, roles] = await Promise.all([
      msgIds.length > 0
        ? supabase.from("chat_reactions").select("*").in("message_id", msgIds).then(r => r.data || [])
        : Promise.resolve([]),
      needsFetch && senderIds.length > 0
        ? supabase.from("profiles").select("id, nome, avatar_url, verification_badge").in("id", senderIds).then(r => r.data || [])
        : Promise.resolve(null),
      needsFetch && senderIds.length > 0
        ? supabase.from("user_roles").select("user_id").in("user_id", senderIds).eq("role", "admin").then(r => r.data || [])
        : Promise.resolve(null),
    ]);

    // Update cache if we fetched new data
    if (senders) {
      (senders as any[]).forEach((s: any) => {
        senderCache.set(s.id, { nome: s.nome, avatar_url: s.avatar_url, verification_badge: s.verification_badge });
      });
      cacheTimestamp = Date.now();
    }
    if (roles) {
      (roles as any[]).forEach((r: any) => adminCache.add(r.user_id));
    }

    if (activeConversationRef.current !== conversationId) return;

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

    setMessages(msgs);
    if (!initialLoadDone.current) {
      setLoading(false);
      initialLoadDone.current = true;
    }

    // Mark unread messages as read + insert read receipts (non-blocking)
    if (user) {
      const unreadIds = rawMsgs
        .filter((m: any) => m.sender_id !== user.id && !m.is_read)
        .map((m: any) => m.id);
      if (unreadIds.length > 0) {
        // Fire and forget - don't await
        supabase
          .from("chat_messages")
          .update({ is_read: true, read_at: new Date().toISOString() })
          .in("id", unreadIds)
          .then(() => {
            const readReceipts = unreadIds.map((msgId: string) => ({
              message_id: msgId,
              user_id: user.id,
              read_at: new Date().toISOString(),
            }));
            supabase
              .from("chat_message_reads")
              .upsert(readReceipts, { onConflict: "message_id,user_id" })
              .then(() => {});
          });
      }
    }
  }, [conversationId, user]);

  const debouncedFetch = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchMessages(), 300);
  }, [fetchMessages]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  // Realtime messages - STRICT filter by conversation_id
  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`chat-msgs-${conversationId}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "chat_messages",
        filter: `conversation_id=eq.${conversationId}`,
      }, () => { debouncedFetch(); })
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
  }, [conversationId, debouncedFetch]);

  const sendMessage = useCallback(async (content: string, type = "text", audioUrl?: string, imageUrl?: string, replyToId?: string) => {
    if (!conversationId || !user) return;
    const { error } = await supabase.from("chat_messages").insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: type === "text" ? content : null,
      type,
      audio_url: audioUrl || null,
      image_url: imageUrl || null,
      reply_to_id: replyToId || null,
      is_delivered: true,
      delivered_at: new Date().toISOString(),
    });
    if (error) throw error;

    // Use cached name instead of querying every time
    const senderName = cachedNome.current || "Você";
    const msgPreview = type === "text" ? content : type === "audio" ? "🎤 Áudio" : "📷 Imagem";
    const previewText = `${senderName}: ${msgPreview}`;

    // Non-blocking conversation update
    supabase.from("chat_conversations").update({
      last_message_text: previewText.length > 100 ? previewText.slice(0, 100) + "…" : previewText,
      last_message_at: new Date().toISOString(),
    }).eq("id", conversationId).then(() => {});
  }, [conversationId, user]);

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
    if (isAdmin) {
      await supabase.from("chat_messages").update({ is_deleted: true, content: null, deleted_by: user.id }).eq("id", messageId);
    } else {
      await supabase.from("chat_messages").update({ is_deleted: true, content: null, deleted_by: user.id }).eq("id", messageId).eq("sender_id", user.id);
    }
  }, [user]);

  const editMessage = useCallback(async (messageId: string, newContent: string, isAdmin = false) => {
    if (!user || !newContent.trim()) return;
    const msg = messages.find(m => m.id === messageId);
    if (!msg) return;

    const trimmed = newContent.trim();
    const now = new Date().toISOString();

    // Optimistic local update
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content: trimmed, updated_at: now, edited_by: user.id } : m));

    const updateData = { content: trimmed, updated_at: now, edited_by: user.id };

    if (isAdmin) {
      const { error } = await supabase.from("chat_messages").update(updateData).eq("id", messageId);
      if (error) {
        console.error("Admin edit error:", error);
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content: msg.content, updated_at: msg.updated_at, edited_by: msg.edited_by } : m));
      }
    } else {
      if (msg.sender_id !== user.id) return;
      const diff = Date.now() - new Date(msg.created_at).getTime();
      if (diff > 10 * 60 * 1000) return;
      const { error } = await supabase.from("chat_messages").update(updateData).eq("id", messageId).eq("sender_id", user.id);
      if (error) {
        console.error("Edit error:", error);
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content: msg.content, updated_at: msg.updated_at, edited_by: msg.edited_by } : m));
      }
    }
  }, [user, messages]);

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

  return { messages, loading, sendMessage, toggleReaction, deleteMessage, editMessage, pinMessage, fetchMessages };
}
