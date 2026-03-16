import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Currency } from "@/components/ui";
import { motion } from "framer-motion";
import { styledToast as toast } from "@/lib/toast";
import {
  Network, Users, DollarSign, TrendingUp, Search, Loader2, User,
  ChevronRight, Smartphone, Wallet,
} from "lucide-react";
import { VerificationBadge, BadgeType } from "@/components/VerificationBadge";

interface ResellerNetwork {
  id: string;
  nome: string;
  email: string;
  avatar_url: string | null;
  verification_badge: string | null;
  active: boolean;
  created_at: string;
  client_count: number;
  total_recargas: number;
  saldo_revenda: number;
  saldo_pessoal: number;
  total_volume: number;
}

export function RedesSection() {
  const [resellers, setResellers] = useState<ResellerNetwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchResellers = useCallback(async () => {
    setLoading(true);
    try {
      // Get all users with role 'revendedor' or 'admin'
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("role", ["revendedor", "admin"]);

      const resellerIds = [...new Set((roles || []).map(r => r.user_id))];
      if (resellerIds.length === 0) { setResellers([]); setLoading(false); return; }

      // Get profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, nome, email, avatar_url, verification_badge, active, created_at")
        .in("id", resellerIds);

      // Get client counts per reseller
      const { data: allProfiles } = await supabase
        .from("profiles")
        .select("id, reseller_id")
        .in("reseller_id", resellerIds);

      const clientCountMap = new Map<string, number>();
      (allProfiles || []).forEach(p => {
        if (p.reseller_id) {
          clientCountMap.set(p.reseller_id, (clientCountMap.get(p.reseller_id) || 0) + 1);
        }
      });

      // Get saldos
      const { data: saldos } = await supabase
        .from("saldos")
        .select("user_id, tipo, valor")
        .in("user_id", resellerIds);

      const saldoMap = new Map<string, { revenda: number; pessoal: number }>();
      (saldos || []).forEach(s => {
        const existing = saldoMap.get(s.user_id) || { revenda: 0, pessoal: 0 };
        if (s.tipo === "revenda") existing.revenda = Number(s.valor) || 0;
        if (s.tipo === "pessoal") existing.pessoal = Number(s.valor) || 0;
        saldoMap.set(s.user_id, existing);
      });

      // Get recargas count + volume per reseller's clients
      const clientIds = (allProfiles || []).map(p => p.id);
      let recargaCountMap = new Map<string, { count: number; volume: number }>();
      
      if (clientIds.length > 0) {
        // Get recargas for all clients of all resellers
        const { data: recargas } = await supabase
          .from("recargas")
          .select("user_id, valor, status")
          .eq("status", "completed")
          .in("user_id", [...resellerIds, ...clientIds]);
        
        // Map clients to resellers
        const clientResellerMap = new Map<string, string>();
        (allProfiles || []).forEach(p => {
          if (p.reseller_id) clientResellerMap.set(p.id, p.reseller_id);
        });

        (recargas || []).forEach(r => {
          const resellerId = clientResellerMap.get(r.user_id) || (resellerIds.includes(r.user_id) ? r.user_id : null);
          if (resellerId) {
            const existing = recargaCountMap.get(resellerId) || { count: 0, volume: 0 };
            existing.count++;
            existing.volume += Number(r.valor) || 0;
            recargaCountMap.set(resellerId, existing);
          }
        });
      }

      const enriched: ResellerNetwork[] = (profiles || []).map(p => {
        const bal = saldoMap.get(p.id) || { revenda: 0, pessoal: 0 };
        const rec = recargaCountMap.get(p.id) || { count: 0, volume: 0 };
        return {
          id: p.id,
          nome: p.nome || p.email?.split("@")[0] || "Usuário",
          email: p.email || "",
          avatar_url: p.avatar_url,
          verification_badge: p.verification_badge,
          active: p.active,
          created_at: p.created_at,
          client_count: clientCountMap.get(p.id) || 0,
          total_recargas: rec.count,
          saldo_revenda: bal.revenda,
          saldo_pessoal: bal.pessoal,
          total_volume: rec.volume,
        };
      });

      // Sort by client_count descending
      enriched.sort((a, b) => b.client_count - a.client_count);
      setResellers(enriched);
    } catch {
      toast.error("Erro ao carregar redes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchResellers(); }, [fetchResellers]);

  const filtered = resellers.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.nome.toLowerCase().includes(q) || r.email.toLowerCase().includes(q);
  });

  const totalClients = resellers.reduce((a, r) => a + r.client_count, 0);
  const totalVolume = resellers.reduce((a, r) => a + r.total_volume, 0);
  const totalSaldoRevenda = resellers.reduce((a, r) => a + r.saldo_revenda, 0);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Donos de Rede", value: resellers.length, color: "text-primary", icon: Network },
          { label: "Total Clientes", value: totalClients, color: "text-accent", icon: Users },
          { label: "Volume Total", value: totalVolume, isCurrency: true, color: "text-success", icon: TrendingUp },
          { label: "Saldo Revenda", value: totalSaldoRevenda, isCurrency: true, color: "text-warning", icon: Wallet },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{stat.label}</p>
            </div>
            <p className={`text-xl font-bold ${stat.color}`}>
              {stat.isCurrency ? <Currency value={stat.value as number} duration={600} /> : stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar revendedor..."
          className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center">
          <Network className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Nenhum dono de rede encontrado.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((reseller, i) => (
            <motion.div key={reseller.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="glass-card rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="shrink-0">
                  {reseller.avatar_url ? (
                    <img src={reseller.avatar_url} alt="" className="w-11 h-11 rounded-full object-cover" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-foreground truncate">{reseller.nome}</p>
                    {reseller.verification_badge && (
                      <VerificationBadge badge={reseller.verification_badge as BadgeType} size="sm" />
                    )}
                    {!reseller.active && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-destructive/10 text-destructive">Inativo</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{reseller.email}</p>
                </div>

                {/* Client count */}
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-primary">{reseller.client_count}</p>
                  <p className="text-[10px] text-muted-foreground">clientes</p>
                </div>
              </div>

              {/* Metrics grid */}
              <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-border">
                <div className="text-center">
                  <p className="text-[9px] uppercase text-muted-foreground font-semibold">Recargas</p>
                  <p className="text-sm font-bold text-foreground">{reseller.total_recargas}</p>
                </div>
                <div className="text-center">
                  <p className="text-[9px] uppercase text-muted-foreground font-semibold">Volume</p>
                  <p className="text-sm font-bold text-success"><Currency value={reseller.total_volume} duration={400} /></p>
                </div>
                <div className="text-center">
                  <p className="text-[9px] uppercase text-muted-foreground font-semibold">Saldo</p>
                  <p className="text-sm font-bold text-foreground"><Currency value={reseller.saldo_revenda} duration={400} /></p>
                </div>
                <div className="text-center">
                  <p className="text-[9px] uppercase text-muted-foreground font-semibold">Comissões</p>
                  <p className="text-sm font-bold text-accent"><Currency value={reseller.saldo_pessoal} duration={400} /></p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
