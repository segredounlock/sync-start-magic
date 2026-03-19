import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { styledToast as toast } from "@/lib/toast";
import { Currency } from "@/components/ui/Currency";
import { SkeletonCard } from "@/components/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, Users, TrendingUp, BarChart3, Search, User, MoreVertical, Tag, ArrowUpCircle, UserPlus, DollarSign } from "lucide-react";
import { InfoCard } from "@/components/InfoCard";
import { ClientPricingModal } from "@/components/ClientPricingModal";

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
  role: string;
  saldo_revenda: number;
  saldo_pessoal: number;
  direct_network: number;
  indirect_network: number;
  direct_profit: number;
  indirect_profit: number;
}

interface MinhaRedeProps {
  userId: string;
  profileSlug?: string;
  referralCode?: string;
}

const roleBadge: Record<string, { label: string; color: string }> = {
  admin: { label: "Admin", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  revendedor: { label: "Vendedor", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  cliente: { label: "Cliente", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  usuario: { label: "Cliente", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
};

export function MinhaRede({ userId, profileSlug, referralCode }: MinhaRedeProps) {
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [members, setMembers] = useState<NetworkMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"active" | "inactive" | "all">("active");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [promotingId, setPromotingId] = useState<string | null>(null);
  const [pricingModal, setPricingModal] = useState<{ id: string; name: string } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const referralLink = referralCode
    ? `${window.location.origin}/registrar?ref=${referralCode}`
    : `${window.location.origin}/loja/${profileSlug || userId}`;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsResult, membersResult] = await Promise.all([
        supabase.rpc("get_network_stats" as any, { _user_id: userId }),
        supabase.rpc("get_network_members_v2" as any, { _user_id: userId, _filter: filter }),
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

  // Close menu on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    if (openMenuId) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openMenuId]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success("Link copiado!");
    } catch {
      toast.error("Erro ao copiar");
    }
  };

  const invokeToggleRole = async (memberId: string, action: "add" | "remove") => {
    setPromotingId(memberId);
    try {
      const res = await supabase.functions.invoke("admin-toggle-role", {
        body: { user_id: memberId, role: "revendedor", action },
      });
      // Parse error from response body (edge function returns { error: msg } with 400)
      if (res.error) {
        const bodyError = typeof res.data === "object" && res.data?.error;
        throw new Error(bodyError || res.error.message || "Erro desconhecido");
      }
      return true;
    } catch (err: any) {
      toast.error(err.message || "Erro ao alterar cargo");
      return false;
    } finally {
      setPromotingId(null);
    }
  };

  const promoteToReseller = async (member: NetworkMember) => {
    if (member.role === "revendedor" || member.role === "admin") {
      toast.error("Este membro já é vendedor/admin.");
      return;
    }
    const ok = await invokeToggleRole(member.id, "add");
    if (ok) {
      toast.success(`${member.nome || "Usuário"} promovido a Vendedor!`);
      setOpenMenuId(null);
      fetchData();
    }
  };

  const demoteToClient = async (member: NetworkMember) => {
    const ok = await invokeToggleRole(member.id, "remove");
    if (ok) {
      toast.success(`${member.nome || "Usuário"} rebaixado para Cliente.`);
      setOpenMenuId(null);
      fetchData();
    }
  };

  const filteredMembers = members.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (m.nome?.toLowerCase().includes(q)) || (m.email?.toLowerCase().includes(q));
  });

  const filterLabels: Record<string, string> = { active: "Ativos", inactive: "Inativos", all: "Todos" };

  const getInitial = (m: NetworkMember) => {
    const name = m.nome || m.email || "?";
    return name.charAt(0).toUpperCase();
  };

  const avatarColors = [
    "bg-blue-500", "bg-emerald-500", "bg-orange-500", "bg-pink-500",
    "bg-purple-500", "bg-red-500", "bg-teal-500", "bg-yellow-500",
  ];
  const getAvatarColor = (id: string) => {
    const idx = id.charCodeAt(0) % avatarColors.length;
    return avatarColors[idx];
  };

  if (loading && !stats) return <div className="space-y-4 p-4">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <InfoCard title="Como funciona a Rede" items={[
        { icon: UserPlus, label: "Indicação", description: "Compartilhe seu link e ganhe comissão sobre as vendas dos indicados." },
        { icon: DollarSign, label: "Comissão Direta", description: "Percentual do lucro de cada venda feita pelos seus indicados diretos." },
        { icon: TrendingUp, label: "Comissão Indireta", description: "Percentual do lucro das vendas feitas pelos indicados dos seus indicados." },
        { icon: Users, label: "Gestão", description: "Promova membros a vendedor ou gerencie preços individuais." },
      ]} />

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Minha Rede</h2>
          <p className="text-sm text-muted-foreground mt-1">Gerencie sua equipe e acompanhe seus ganhos por indicação.</p>
        </div>
        <button
          onClick={copyLink}
          className="shrink-0 w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
        >
          <Link2 className="h-4 w-4" />
          Copiar Link de Indicação
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-4 flex items-center gap-3 border-l-4 border-primary">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Total de Rede</p>
            <p className="text-xl font-bold text-foreground">{stats?.total_count || 0}</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-4 flex items-center gap-3 border-l-4 border-success">
          <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
            <TrendingUp className="h-6 w-6 text-success" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Lucro Direto</p>
            <p className="text-xl font-bold text-success"><Currency value={stats?.direct_profit || 0} /></p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-card rounded-xl p-4 flex items-center gap-3 border-l-4 border-accent">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
            <BarChart3 className="h-6 w-6 text-accent" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Lucro Indireto</p>
            <p className="text-xl font-bold text-accent"><Currency value={stats?.indirect_profit || 0} /></p>
          </div>
        </motion.div>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Buscar por nome ou email..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-background border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value as any)}
          className="shrink-0 px-4 py-2.5 rounded-lg bg-background border border-border text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer">
          {(["active", "inactive", "all"] as const).map((f) => (
            <option key={f} value={f}>{filterLabels[f]}</option>
          ))}
        </select>
      </div>

      {/* Members Table */}
      {filteredMembers.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">
            {members.length === 0
              ? "Use seu link de indicação para convidar pessoas e começar a lucrar com a rede."
              : "Nenhum resultado encontrado."}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border relative">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Membro</th>
                <th className="text-center px-3 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden sm:table-cell">Status</th>
                <th className="text-center px-3 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden md:table-cell">Rede (D / I)</th>
                <th className="text-right px-3 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Lucro (D / I)</th>
                <th className="text-center px-2 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider w-14">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member, i) => {
                const badge = roleBadge[member.role] || roleBadge.usuario;
                return (
                  <motion.tr
                    key={member.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                  >
                    {/* Member */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {member.avatar_url ? (
                          <img src={member.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className={`w-10 h-10 rounded-full ${getAvatarColor(member.id)} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                            {getInitial(member)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate text-sm">{member.nome || "Sem nome"}</p>
                          <p className="text-xs text-muted-foreground truncate">{member.email || ""}</p>
                        </div>
                        {/* Mobile-only badge */}
                        <span className={`sm:hidden ml-auto shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="text-center px-3 py-3 hidden sm:table-cell">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
                        {badge.label}
                      </span>
                    </td>

                    {/* Rede D/I */}
                    <td className="text-center px-3 py-3 font-medium text-foreground hidden md:table-cell">
                      <span className="font-bold">{member.direct_network}</span>
                      <span className="text-muted-foreground mx-1">/</span>
                      <span>{member.indirect_network}</span>
                    </td>

                    {/* Lucro D/I */}
                    <td className="text-right px-3 py-3">
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-xs text-success font-medium flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          <Currency value={member.direct_profit} />
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <BarChart3 className="h-3 w-3" />
                          <Currency value={member.indirect_profit} />
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="text-center px-2 py-3 relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === member.id ? null : member.id)}
                        className="p-1.5 rounded-md hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      <AnimatePresence>
                        {openMenuId === member.id && (
                          <motion.div
                            ref={menuRef}
                            initial={{ opacity: 0, scale: 0.95, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -4 }}
                            transition={{ duration: 0.12 }}
                            className="absolute right-2 top-full z-50 mt-1 w-52 bg-popover border border-border rounded-lg shadow-lg overflow-hidden"
                          >
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                setPricingModal({ id: member.id, name: member.nome || member.email || "Membro" });
                              }}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors text-left"
                            >
                              <Tag className="h-4 w-4 text-primary" />
                              Preços Exclusivos
                            </button>
                            {member.role !== "revendedor" && member.role !== "admin" && (
                              <button
                                disabled={promotingId === member.id}
                                onClick={() => promoteToReseller(member)}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors text-left disabled:opacity-50"
                              >
                                <ArrowUpCircle className="h-4 w-4 text-purple-500" />
                                {promotingId === member.id ? "Promovendo..." : "Promover p/ Vendedor"}
                              </button>
                            )}
                            {member.role === "revendedor" && (
                              <button
                                disabled={promotingId === member.id}
                                onClick={() => demoteToClient(member)}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-destructive hover:bg-muted/50 transition-colors text-left disabled:opacity-50"
                              >
                                <ArrowUpCircle className="h-4 w-4 rotate-180 text-destructive" />
                                {promotingId === member.id ? "Rebaixando..." : "Rebaixar p/ Cliente"}
                              </button>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {/* Client Pricing Modal */}
      <ClientPricingModal
        open={!!pricingModal}
        onClose={() => setPricingModal(null)}
        resellerId={userId}
        clientId={pricingModal?.id || ""}
        clientName={pricingModal?.name || ""}
      />
    </motion.div>
  );
}

export default MinhaRede;
