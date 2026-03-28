import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { X, Search } from "lucide-react";
import { VerificationBadge, BadgeType } from "@/components/VerificationBadge";

interface NewChatModalProps {
  onClose: () => void;
  onSelectUser: (userId: string) => void;
}

interface UserItem {
  id: string;
  nome: string | null;
  email?: string | null;
  avatar_url: string | null;
  role?: string;
  verification_badge?: string | null;
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  revendedor: "Revendedor",
  cliente: "Cliente",
  user: "Usuário",
  usuario: "Usuário",
};

const ROLE_STYLES: Record<string, string> = {
  admin: "bg-primary/15 text-primary",
  revendedor: "bg-warning/15 text-warning",
  cliente: "bg-success/15 text-success",
  user: "bg-accent/20 text-accent-foreground",
  usuario: "bg-accent/20 text-accent-foreground",
};

export function NewChatModal({ onClose, onSelectUser }: NewChatModalProps) {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;
      setLoading(true);
      setFetchError(false);

      try {
      // 1. Load filter config
      const { data: filterData } = await supabase.rpc("get_chat_new_conv_filter" as any);
      const filter: string = (filterData as string) || "admin_badge";

      // 2. Build user list based on filter
      const userMap = new Map<string, UserItem>();

      if (filter === "all") {
        // Fetch all active profiles except self
        let query = supabase
          .from("profiles_public")
          .select("id, nome, avatar_url, verification_badge")
          .eq("active", true)
          .neq("id", user.id);
        if (search.trim()) {
          query = query.ilike("nome", `%${search}%`);
        }
        const { data } = await query.limit(50);
        // Get roles for these users
        const ids = (data || []).map(u => u.id).filter((id): id is string => !!id);
        const { data: roles } = ids.length > 0
          ? await supabase.from("user_roles").select("user_id, role").in("user_id", ids)
          : { data: [] };
        const roleMap = new Map((roles || []).map(r => [r.user_id, r.role]));
        (data || []).forEach(u => {
          if (!u.id) return;
          userMap.set(u.id, { ...u, id: u.id, role: roleMap.get(u.id) || "usuario", verification_badge: (u as any).verification_badge || null } as any);
        });
      } else {
        // Fetch admins
        const { data: adminRoles } = await supabase
          .from("user_roles")
          .select("user_id, role")
          .eq("role", "admin")
          .neq("user_id", user.id);
        const adminIds = (adminRoles || []).map(r => r.user_id);

        if (adminIds.length > 0) {
          let query = supabase.from("profiles_public").select("id, nome, avatar_url, verification_badge").in("id", adminIds).eq("active", true);
          if (search.trim()) {
            query = query.ilike("nome", `%${search}%`);
          }
          const { data } = await query.limit(50);
          (data || []).filter(u => u.id != null).forEach(u => {
            userMap.set(u.id!, { ...u, id: u.id!, role: "admin", verification_badge: u.verification_badge || null });
          });
        }

        // If admin_badge, also fetch users with verification badges
        if (filter === "admin_badge") {
          let badgeQuery = supabase
            .from("profiles_public")
            .select("id, nome, avatar_url, verification_badge")
            .eq("active", true)
            .neq("id", user.id)
            .not("verification_badge", "is", null)
            .neq("verification_badge", "");
          if (search.trim()) {
            badgeQuery = badgeQuery.ilike("nome", `%${search}%`);
          }
          const { data: badgeUsers } = await badgeQuery.limit(50);

          // Get roles for badge users
          const validBadgeUsers = (badgeUsers || []).filter(u => u.id != null) as { id: string; nome: string | null; avatar_url: string | null; verification_badge: string | null }[];
          const badgeIds = validBadgeUsers.filter(u => !userMap.has(u.id)).map(u => u.id);
          const { data: badgeRoles } = badgeIds.length > 0
            ? await supabase.from("user_roles").select("user_id, role").in("user_id", badgeIds)
            : { data: [] };
          const roleMap = new Map((badgeRoles || []).map(r => [r.user_id, r.role]));

          validBadgeUsers.forEach(u => {
            if (!userMap.has(u.id)) {
              userMap.set(u.id, { ...u, role: roleMap.get(u.id) || "usuario", verification_badge: u.verification_badge || null });
            }
          });
        }
      }

      setUsers(Array.from(userMap.values()));
      } catch (err) {
        console.error("Erro ao buscar usuários:", err);
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [user, search, fetchError]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-bold text-foreground">Nova Conversa</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted/50 transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar usuário..."
              className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all text-sm"
              autoFocus
            />
          </div>
        </div>

        {/* User list */}
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {loading ? (
            <div className="space-y-3 px-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-muted" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : fetchError ? (
            <div className="flex flex-col items-center py-8 gap-3">
              <p className="text-sm text-destructive">Erro ao carregar usuários</p>
              <button
                onClick={() => { setFetchError(false); setLoading(true); }}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
                style={{ touchAction: "manipulation" }}
              >
                Tentar novamente
              </button>
            </div>
          ) : users.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">Nenhum usuário encontrado</p>
          ) : (
            users.map(u => {
              const name = u.nome || u.email?.split("@")[0] || "Usuário";
              const initial = (name[0] || "U").toUpperCase();
              const isAdmin = u.role === "admin";
              const hasSpecialNameEffect = isAdmin || !!u.verification_badge;
              const roleKey = u.role || "usuario";
              const roleLabel = ROLE_LABELS[roleKey] || "Usuário";
              const roleStyle = ROLE_STYLES[roleKey] || ROLE_STYLES.usuario;
              return (
                <button
                  key={u.id}
                  onClick={() => onSelectUser(u.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/50 transition-colors text-left"
                >
                  {u.avatar_url ? (
                    <img src={u.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover border border-border" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                      {initial}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className={`text-sm font-semibold truncate ${hasSpecialNameEffect ? "shimmer-letters" : "text-foreground"}`}>{name}</p>
                      {u.verification_badge ? (
                        <VerificationBadge badge={u.verification_badge as BadgeType} size="sm" />
                      ) : isAdmin ? (
                        <VerificationBadge badge="verificado" size="sm" />
                      ) : null}
                    </div>
                    <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase ${roleStyle}`}>
                      {roleLabel}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
}
