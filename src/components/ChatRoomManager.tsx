import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { styledToast as toast } from "@/lib/toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Hash, Eye, Lock, MessageSquare, MoreVertical,
  Edit3, EyeOff, Trash2, X, Loader2, Shield, AlertTriangle,
  Save, Users, ImageOff, Image,
} from "lucide-react";

interface ChatRoom {
  id: string;
  name: string | null;
  type: string;
  category: string;
  description: string;
  icon: string;
  is_blocked: boolean;
  is_private: boolean;
  created_at: string;
  msg_count: number;
  member_count: number;
}

interface ChatRoomManagerProps {
  globalConfig: Record<string, string>;
  setGlobalConfig: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  saveGlobalConfig: () => Promise<void>;
}

export function ChatRoomManager({ globalConfig, setGlobalConfig, saveGlobalConfig }: ChatRoomManagerProps) {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editRoom, setEditRoom] = useState<ChatRoom | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [imagesConfig, setImagesConfig] = useState<Record<string, boolean>>({});

  const initialLoadDone = useRef(false);

  const fetchRooms = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("chat_conversations")
        .select("*")
        .eq("type", "group")
        .order("category", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) throw error;

      const roomsWithCounts: ChatRoom[] = [];
      for (const room of data || []) {
        const [{ count: msgCount }, { data: senders }] = await Promise.all([
          supabase
            .from("chat_messages")
            .select("id", { count: "exact", head: true })
            .eq("conversation_id", room.id),
          supabase
            .from("chat_messages")
            .select("sender_id")
            .eq("conversation_id", room.id),
        ]);

        const uniqueSenders = new Set((senders || []).map((s: any) => s.sender_id));

        roomsWithCounts.push({
          id: room.id,
          name: room.name,
          type: room.type,
          category: (room as any).category || "",
          description: (room as any).description || "",
          icon: (room as any).icon || "💬",
          is_blocked: (room as any).is_blocked || false,
          is_private: (room as any).is_private || false,
          created_at: room.created_at,
          msg_count: msgCount || 0,
          member_count: uniqueSenders.size,
        });
      }

      setRooms(roomsWithCounts);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar salas");
    } finally {
      if (!initialLoadDone.current) {
        setLoading(false);
        initialLoadDone.current = true;
      }
    }
  }, []);

  // Fetch image configs for rooms
  const fetchImageConfigs = useCallback(async () => {
    const { data } = await supabase
      .from("system_config")
      .select("key, value")
      .like("key", "room_images_%");
    if (data) {
      const cfg: Record<string, boolean> = {};
      data.forEach(d => {
        const roomId = d.key.replace("room_images_", "");
        cfg[roomId] = d.value !== "false";
      });
      setImagesConfig(cfg);
    }
  }, []);

  useEffect(() => { fetchRooms(); fetchImageConfigs(); }, [fetchRooms, fetchImageConfigs]);

  const totalRooms = rooms.length;
  const activeRooms = rooms.filter(r => !r.is_blocked).length;
  const blockedRooms = rooms.filter(r => r.is_blocked).length;
  const totalMessages = rooms.reduce((s, r) => s + r.msg_count, 0);

  // Group rooms by category
  const categories = Array.from(new Set(rooms.map(r => r.category || "GERAL"))).sort();
  const groupedRooms: Record<string, ChatRoom[]> = {};
  categories.forEach(cat => {
    groupedRooms[cat] = rooms.filter(r => (r.category || "GERAL") === cat);
  });

  const toggleBlock = async (room: ChatRoom) => {
    setActionLoading(room.id);
    try {
      const newBlocked = !room.is_blocked;
      const { error } = await supabase
        .from("chat_conversations")
        .update({ is_blocked: newBlocked } as any)
        .eq("id", room.id);
      if (error) throw error;
      toast.success(newBlocked ? "Sala bloqueada!" : "Sala desbloqueada!");
      // Insert system message
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const sysContent = newBlocked ? "🔒 Sala bloqueada por um administrador" : "🔓 Sala desbloqueada por um administrador";
        await supabase.from("chat_messages").insert({
          conversation_id: room.id,
          sender_id: user.id,
          content: sysContent,
          type: "system",
        } as any);
      }
      await fetchRooms();
    } catch (err: any) {
      toast.error(err.message || "Erro");
    }
    setActionLoading(null);
    setOpenMenu(null);
  };

  const togglePrivate = async (room: ChatRoom) => {
    setActionLoading(room.id);
    try {
      const { error } = await supabase
        .from("chat_conversations")
        .update({ is_private: !room.is_private } as any)
        .eq("id", room.id);
      if (error) throw error;
      toast.success(room.is_private ? "Sala pública!" : "Sala privada!");
      await fetchRooms();
    } catch (err: any) {
      toast.error(err.message || "Erro");
    }
    setActionLoading(null);
    setOpenMenu(null);
  };

  const clearMessages = async (room: ChatRoom) => {
    if (!confirm(`Tem certeza que deseja limpar todas as mensagens de "${room.name}"?`)) return;
    setActionLoading(room.id);
    try {
      const { error } = await supabase
        .from("chat_messages")
        .delete()
        .eq("conversation_id", room.id);
      if (error) throw error;
      await supabase.from("chat_conversations").update({
        last_message_text: null,
        last_message_at: new Date().toISOString(),
      }).eq("id", room.id);
      toast.success("Mensagens limpas!");
      await fetchRooms();
    } catch (err: any) {
      toast.error(err.message || "Erro");
    }
    setActionLoading(null);
    setOpenMenu(null);
  };

  const deleteRoom = async (room: ChatRoom) => {
    if (!confirm(`Tem certeza que deseja EXCLUIR a sala "${room.name}"? Esta ação é irreversível.`)) return;
    setActionLoading(room.id);
    try {
      // Delete messages first
      await supabase.from("chat_messages").delete().eq("conversation_id", room.id);
      const { error } = await supabase.from("chat_conversations").delete().eq("id", room.id);
      if (error) throw error;
      toast.success("Sala excluída!");
      await fetchRooms();
    } catch (err: any) {
      toast.error(err.message || "Erro");
    }
    setActionLoading(null);
    setOpenMenu(null);
  };

  const handleChatToggle = async () => {
    const newVal = globalConfig.chat_enabled === "true" ? "false" : "true";
    setGlobalConfig(prev => ({ ...prev, chat_enabled: newVal }));
    // Auto-save
    try {
      await supabase.from("system_config").upsert(
        { key: "chat_enabled", value: newVal, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );
      toast.success(newVal === "true" ? "Chat ativado!" : "Chat desativado!");
    } catch {
      toast.error("Erro ao salvar");
    }
  };

  const toggleRoomImages = async (roomId: string) => {
    const current = imagesConfig[roomId] !== false; // default true
    const newVal = !current;
    setImagesConfig(prev => ({ ...prev, [roomId]: newVal }));
    try {
      await supabase.from("system_config").upsert(
        { key: `room_images_${roomId}`, value: String(newVal), updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );
      toast.success(newVal ? "Envio de imagens ativado!" : "Envio de imagens desativado!");
    } catch {
      toast.error("Erro ao salvar");
      setImagesConfig(prev => ({ ...prev, [roomId]: current }));
    }
    setOpenMenu(null);
  };

  // New conv filter config
  const [newConvFilter, setNewConvFilter] = useState(globalConfig.chat_new_conv_filter || "admin_badge");

  useEffect(() => {
    // Load current filter value
    supabase.from("system_config").select("value").eq("key", "chat_new_conv_filter").single()
      .then(({ data }) => { if (data?.value) setNewConvFilter(data.value); });
  }, []);

  const handleNewConvFilterChange = async (val: string) => {
    setNewConvFilter(val);
    try {
      await supabase.from("system_config").upsert(
        { key: "chat_new_conv_filter", value: val, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );
      toast.success("Filtro atualizado!");
    } catch {
      toast.error("Erro ao salvar filtro");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header with toggle + new room */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Chat entre Usuários</span>
            <button onClick={handleChatToggle}
              className={`w-12 h-7 rounded-full transition-colors relative ${globalConfig.chat_enabled !== "false" ? "bg-primary" : "bg-muted"}`}>
              <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${globalConfig.chat_enabled !== "false" ? "left-6" : "left-1"}`} />
            </button>
          </div>
        </div>
        <button onClick={() => setShowCreateModal(true)}
          className="h-9 px-4 rounded-lg bg-destructive text-destructive-foreground flex items-center gap-2 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm font-semibold shadow-sm">
          <Plus className="h-4 w-4" /> Nova Sala
        </button>
      </div>

      {/* New conversation filter config */}
      <div className="glass-card rounded-xl p-4 space-y-2">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          Quem aparece em "Nova Conversa"
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { value: "admin_badge", label: "Admin + Selo" },
            { value: "admin_only", label: "Apenas Admins" },
            { value: "all", label: "Todos" },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => handleNewConvFilterChange(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                newConvFilter === opt.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted border border-border"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground">
          {newConvFilter === "admin_badge" && "Admins e usuários com selo de verificação aparecerão na lista."}
          {newConvFilter === "admin_only" && "Apenas administradores aparecerão na lista."}
          {newConvFilter === "all" && "Todos os usuários ativos aparecerão na lista."}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Hash, label: "Salas", value: totalRooms, color: "text-primary" },
          { icon: Eye, label: "Ativas", value: activeRooms, color: "text-success" },
          { icon: Lock, label: "Bloqueadas", value: blockedRooms, color: "text-destructive" },
          { icon: MessageSquare, label: "Mensagens", value: totalMessages, color: "text-muted-foreground" },
        ].map(stat => (
          <div key={stat.label} className="glass-card rounded-xl p-4 flex items-center gap-3">
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
            <div>
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Rooms by category */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Nenhuma sala criada</p>
          <p className="text-sm">Clique em "Nova Sala" para começar</p>
        </div>
      ) : (
        categories.map(cat => (
          <div key={cat} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-warning tracking-wider">📁 {cat.toUpperCase()}</span>
              <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground font-medium">{groupedRooms[cat].length}</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="space-y-2">
              {groupedRooms[cat].map(room => (
                <div key={room.id} className={`glass-card relative rounded-xl p-4 flex items-center gap-4 group hover:border-primary/30 transition-colors ${openMenu === room.id ? "z-40" : "z-0"}`}>
                  <div className="w-10 h-10 rounded-full bg-muted/60 flex items-center justify-center text-lg flex-shrink-0">
                    {room.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-foreground text-sm">{room.name || "Sem nome"}</h4>
                      {room.is_blocked && (
                        <span className="text-[10px] font-bold bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Lock className="h-3 w-3" /> Bloqueada
                        </span>
                      )}
                      {room.is_private && !room.is_blocked && (
                        <span className="text-[10px] font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Privada</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{room.description || "Sem descrição"}</p>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {room.member_count} membros</span>
                      <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {room.msg_count} mensagens</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => toggleBlock(room)} disabled={actionLoading === room.id}
                      className={`h-9 px-3 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                        room.is_blocked
                          ? "bg-destructive text-destructive-foreground hover:opacity-90"
                          : "border border-border text-foreground hover:bg-muted/50"
                      }`}>
                      <Lock className="h-3.5 w-3.5" />
                      {room.is_blocked ? "Desbloquear" : "Bloquear"}
                    </button>

                    {/* Menu */}
                    <div className="relative">
                      <button onClick={() => setOpenMenu(openMenu === room.id ? null : room.id)}
                        className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      <AnimatePresence>
                        {openMenu === room.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: -5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -5 }}
                            className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden"
                          >
                            <button onClick={() => { setEditRoom(room); setOpenMenu(null); }}
                              className="w-full px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 flex items-center gap-2 transition-colors">
                              <Edit3 className="h-4 w-4" /> Editar
                            </button>
                            <button onClick={() => togglePrivate(room)}
                              className="w-full px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 flex items-center gap-2 transition-colors">
                              {room.is_private ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                              {room.is_private ? "Tornar Pública" : "Tornar Privada"}
                            </button>
                            <button onClick={() => toggleRoomImages(room.id)}
                              className="w-full px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 flex items-center gap-2 transition-colors">
                              {imagesConfig[room.id] !== false ? <ImageOff className="h-4 w-4" /> : <Image className="h-4 w-4" />}
                              {imagesConfig[room.id] !== false ? "Bloquear Imagens" : "Permitir Imagens"}
                            </button>
                            <button onClick={() => clearMessages(room)}
                              className="w-full px-4 py-2.5 text-sm text-warning hover:bg-muted/50 flex items-center gap-2 transition-colors">
                              <AlertTriangle className="h-4 w-4" /> Limpar Mensagens
                            </button>
                            <button onClick={() => deleteRoom(room)}
                              className="w-full px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 flex items-center gap-2 transition-colors">
                              <Trash2 className="h-4 w-4" /> Excluir
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(showCreateModal || editRoom) && (
          <RoomFormModal
            room={editRoom}
            onClose={() => { setShowCreateModal(false); setEditRoom(null); }}
            onSaved={() => { setShowCreateModal(false); setEditRoom(null); fetchRooms(); }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function RoomFormModal({ room, onClose, onSaved }: { room: ChatRoom | null; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(room?.name || "");
  const [description, setDescription] = useState(room?.description || "");
  const [category, setCategory] = useState(room?.category || "GERAL");
  const [icon, setIcon] = useState(room?.icon || "💬");
  const [isPrivate, setIsPrivate] = useState(room?.is_private || false);
  const [saving, setSaving] = useState(false);

  const isEdit = !!room;

  const ICON_OPTIONS = ["💬", "🚀", "💡", "🔒", "🎮", "📢", "⭐", "🔥", "🎯", "👥", "📊", "🛡️"];

  const handleSave = async () => {
    if (!name.trim()) { toast.error("Nome é obrigatório"); return; }
    setSaving(true);
    try {
      if (isEdit) {
        const { error } = await supabase
          .from("chat_conversations")
          .update({
            name: name.trim(),
            description: description.trim(),
            category: category.trim().toUpperCase(),
            icon,
            is_private: isPrivate,
          } as any)
          .eq("id", room.id);
        if (error) throw error;
        toast.success("Sala atualizada!");
      } else {
        const { error } = await supabase
          .from("chat_conversations")
          .insert({
            name: name.trim(),
            type: "group",
            participant_1: "00000000-0000-0000-0000-000000000000",
            description: description.trim(),
            category: category.trim().toUpperCase(),
            icon,
            is_private: isPrivate,
          } as any);
        if (error) throw error;
        toast.success("Sala criada!");
      }
      onSaved();
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar");
    }
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="glass-card rounded-2xl w-full max-w-md p-6 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-foreground">{isEdit ? "Editar Sala" : "Nova Sala"}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/50"><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>

        {/* Icon picker */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Ícone</label>
          <div className="flex gap-2 flex-wrap">
            {ICON_OPTIONS.map(ic => (
              <button key={ic} onClick={() => setIcon(ic)}
                className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all ${icon === ic ? "bg-primary/20 border-2 border-primary scale-110" : "bg-muted/50 border border-border hover:bg-muted"}`}>
                {ic}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Nome da Sala</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-input bg-muted/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Ex: Dicas & Truques" />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Descrição</label>
          <input type="text" value={description} onChange={e => setDescription(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-input bg-muted/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Ex: Compartilhe suas melhores dicas" />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Categoria</label>
          <input type="text" value={category} onChange={e => setCategory(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-input bg-muted/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Ex: GERAL, DICAS, ESQUEMA" />
        </div>

        <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
          <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} className="rounded border-input" />
          Sala Privada (apenas convidados)
        </label>

        <button onClick={handleSave} disabled={saving}
          className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Salvando..." : isEdit ? "Salvar Alterações" : "Criar Sala"}
        </button>
      </motion.div>
    </motion.div>
  );
}
