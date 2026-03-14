import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { styledToast as toast } from "@/lib/toast";
import { Currency } from "@/components/ui/Currency";
import { SkeletonCard } from "@/components/Skeleton";
import { motion } from "framer-motion";
import { Link2, Users, TrendingUp, BarChart3, Search, Filter, Copy, User } from "lucide-react";
import { formatDateTimeBR } from "@/lib/timezone";

interface NetworkStats {
  direct_count: number;
  indirect_count: number;
  total_count: number;
  direct_profit: number;
  indirect_profit: number;
  total_profit: number;
}

interface NetworkMember {
  id: string;
  nome: string | null;
  email: string | null;
  avatar_url: string | null;
  active: boolean;
  created_at: string;
  total_recargas: number;
}

interface MinhaRedeProps {
  userId: string;
  profileSlug?: string;
  referralCode?: string;
}

export function MinhaRede({ userId, profileSlug, referralCode }: MinhaRedeProps) {
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [members, setMembers] = useState<NetworkMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"active" | "inactive" | "all">("active");
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const referralLink = profileSlug
    ? `${window.location.origin}/loja/${profileSlug}`
    : `${window.location.origin}/recarga?ref=${referralCode || userId}`;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsResult, membersResult] = await Promise.all([
        supabase.rpc("get_network_stats" as any, { _user_id: userId }),
        supabase.rpc("get_network_members" as any, { _user_id: userId, _filter: filter }),
      ]);

      if (statsResult.data) setStats(statsResult.data as any);
      if (membersResult.data) setMembers((membersResult.data as any) || []);
    } catch (err: any) {
      toast.error(err.message || "Erro ao carregar rede");
    } finally {
      setLoading(false);
    }
  }, [userId, filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success("Link copiado!");
    } catch {
      toast.error("Erro ao copiar");
    }
  };

  const filteredMembers = members.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (m.nome?.toLowerCase().includes(q)) || (m.email?.toLowerCase().includes(q));
  });

  const filterLabels: Record<string, string> = { active: "Ativos", inactive: "Inativos", all: "Todos" };

  if (loading && !stats) return <div className="space-y-4 p-4">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Minha Rede</h2>
        <p className="text-sm text-muted-foreground mt-1">Gerencie sua equipe e acompanhe seus ganhos por indicação.</p>
      </div>

      {/* Copy Referral Link */}
      <button
        onClick={copyLink}
        className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
      >
        <Link2 className="h-5 w-5" />
        Copiar Link de Indicação
      </button>

      {/* Stats Cards */}
      <div className="space-y-3">
        {/* Total de Rede */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-4 flex items-center gap-4 border-l-4 border-primary"
        >
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users className="h-7 w-7 text-primary" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Total de Rede</p>
            <p className="text-2xl font-bold text-foreground">{stats?.total_count || 0}</p>
          </div>
        </motion.div>

        {/* Lucro Direto */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-4 flex items-center gap-4 border-l-4 border-success"
        >
          <div className="w-14 h-14 rounded-xl bg-success/10 flex items-center justify-center">
            <TrendingUp className="h-7 w-7 text-success" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Lucro Direto</p>
            <p className="text-2xl font-bold text-success">
              <Currency value={stats?.direct_profit || 0} />
            </p>
          </div>
        </motion.div>

        {/* Lucro Indireto */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-xl p-4 flex items-center gap-4 border-l-4 border-accent"
        >
          <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center">
            <BarChart3 className="h-7 w-7 text-accent" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Lucro Indireto</p>
            <p className="text-2xl font-bold text-accent">
              <Currency value={stats?.indirect_profit || 0} />
            </p>
          </div>
        </motion.div>
      </div>

      {/* Members Section */}
      <div className="glass-card rounded-xl p-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-background border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        {/* Filter */}
        <div className="relative">
          <button
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-border text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
          >
            <Filter className="h-4 w-4 text-muted-foreground" />
            {filterLabels[filter]}
          </button>
          {showFilterMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowFilterMenu(false)} />
              <div className="absolute top-full mt-1 left-0 z-50 bg-popover border border-border rounded-lg shadow-xl py-1 min-w-[140px]">
                {(["active", "inactive", "all"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => { setFilter(f); setShowFilterMenu(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-muted/50 transition-colors flex items-center gap-2 ${
                      filter === f ? "text-primary font-semibold" : "text-foreground"
                    }`}
                  >
                    {filter === f && <span>✔</span>}
                    {filterLabels[f]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Members List */}
        {filteredMembers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            {members.length === 0 ? "Nenhum membro na rede ainda. Compartilhe seu link!" : "Nenhum resultado encontrado."}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredMembers.map((member, i) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
              >
                {member.avatar_url ? (
                  <img src={member.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{member.nome || member.email || "Sem nome"}</p>
                  <p className="text-xs text-muted-foreground">
                    {member.total_recargas} recargas · {formatDateTimeBR(member.created_at)}
                  </p>
                </div>
                <div className={`w-2.5 h-2.5 rounded-full ${member.active ? "bg-success" : "bg-muted-foreground/30"}`} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default MinhaRede;
