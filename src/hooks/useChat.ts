import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const GENERAL_CHAT_ID = "00000000-0000-0000-0000-000000000001";

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
  sender?: { nome: string | null; avatar_url: string | null; isAdmin?: boolean };
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
        .order("last_message_at", { ascending: false });

      if (error) throw error;

      const directConvos = (data || []).filter((c: any) => c.type === 'direct');
      const otherIds = directConvos.map((c: any) =>
        c.participant_1 === user.id ? c.participant_2 : c.participant_1
      ).filter(Boolean);
      const uniqueIds = [...new Set(otherIds)];

      let profiles: any[] = [];
      let roleMap: Record<string, string> = {};
      if (uniqueIds.length > 0) {
        const [{ data: p }, { data: roles }] = await Promise.all([
          supabase.from("profiles").select("id, nome, email, avatar_url").in("id", uniqueIds),
          supabase.from("user_roles").select("user_id, role").in("user_id", uniqueIds),
        ]);
        profiles = p || [];
        (roles || []).forEach((r: any) => { roleMap[r.user_id] = r.role; });
      }

      const convos = (data || []).map((c: any) => {
        if (c.type === 'group') {
          return { ...c, other_user: undefined, unread_count: 0 };
        }
        const otherId = c.participant_1 === user.id ? c.participant_2 : c.participant_1;
        const profile = profiles.find((p: any) => p.id === otherId);
        const role = roleMap[otherId] || "usuario";
        return { ...c, other_user: profile ? { ...profile, role } : { id: otherId, nome: null, email: null, avatar_url: null, role }, unread_count: 0 };
      });

      // Fetch unread counts
      for (const conv of convos) {
        const { count } = await supabase
          .from("chat_messages")
          .select("id", { count: "exact", head: true })
          .eq("conversation_id", conv.id)
          .neq("sender_id", user.id)
          .eq("is_read", false);
        conv.unread_count = count || 0;
      }

      convos.sort((a: any, b: any) => {
        if (a.id === GENERAL_CHAT_ID) return -1;
        if (b.id === GENERAL_CHAT_ID) return 1;
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

export function useChatMessages(conversationId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const initialLoadDone = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevConversationId = useRef<string | null>(null);

  // Reset on conversation change - only show loading on first ever load
  useEffect(() => {
    if (prevConversationId.current !== conversationId) {
      prevConversationId.current = conversationId;
      initialLoadDone.current = false;
      // Don't clear messages immediately - let new ones replace them
      if (!conversationId) {
        setMessages([]);
        setLoading(false);
      }
    }
  }, [conversationId]);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) { setMessages([]); setLoading(false); return; }
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(200);

    if (error) { setLoading(false); return; }

    const msgIds = (data || []).map((m: any) => m.id);
    let reactions: any[] = [];
    if (msgIds.length > 0) {
      const { data: r } = await supabase
        .from("chat_reactions")
        .select("*")
        .in("message_id", msgIds);
      reactions = r || [];
    }

    const senderIds = [...new Set((data || []).map((m: any) => m.sender_id))];
    let senders: any[] = [];
    let adminIds = new Set<string>();
    if (senderIds.length > 0) {
      const { data: s } = await supabase
        .from("profiles")
        .select("id, nome, avatar_url")
        .in("id", senderIds);
      senders = s || [];

      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id")
        .in("user_id", senderIds)
        .eq("role", "admin");
      (roles || []).forEach((r: any) => adminIds.add(r.user_id));
    }

    const msgs = (data || []).map((m: any) => ({
      ...m,
      reactions: reactions.filter((r: any) => r.message_id === m.id),
      sender: {
        ...(senders.find((s: any) => s.id === m.sender_id) || { nome: null, avatar_url: null }),
        isAdmin: adminIds.has(m.sender_id),
      },
    }));

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

    // Mark unread messages as read + insert read receipts
    if (user) {
      const unreadIds = (data || [])
        .filter((m: any) => m.sender_id !== user.id && !m.is_read)
        .map((m: any) => m.id);
      if (unreadIds.length > 0) {
        await supabase
          .from("chat_messages")
          .update({ is_read: true, read_at: new Date().toISOString() })
          .in("id", unreadIds);

        // Insert read receipts for each message
        const readReceipts = unreadIds.map((msgId: string) => ({
          message_id: msgId,
          user_id: user.id,
          read_at: new Date().toISOString(),
        }));
        await supabase
          .from("chat_message_reads")
          .upsert(readReceipts, { onConflict: "message_id,user_id" });
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

    // Separate channel for reactions - poll on message changes only
    const reactionsChannel = supabase
      .channel(`chat-reactions-${conversationId}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "chat_reactions",
      }, (payload: any) => {
        // Only refetch if the reaction is for a message in this conversation
        const messageId = payload.new?.message_id || payload.old?.message_id;
        if (messageId) {
          // Check if message belongs to current conversation
          const belongsToConversation = messages.some(m => m.id === messageId);
          if (belongsToConversation) {
            debouncedFetch();
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(reactionsChannel);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [conversationId, debouncedFetch, messages]);

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

    let senderName = "Você";
    const { data: profile } = await supabase
      .from("profiles")
      .select("nome")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.nome) senderName = profile.nome;

    const msgPreview = type === "text" ? content : type === "audio" ? "🎤 Áudio" : "📷 Imagem";
    const previewText = `${senderName}: ${msgPreview}`;

    await supabase.from("chat_conversations").update({
      last_message_text: previewText.length > 100 ? previewText.slice(0, 100) + "…" : previewText,
      last_message_at: new Date().toISOString(),
    }).eq("id", conversationId);
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
