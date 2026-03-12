import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Search, Filter, Calendar, User, RefreshCw, ChevronDown, Shield } from "lucide-react";
import { formatDateTimeBR } from "@/lib/timezone";

interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  details: any;
  created_at: string;
  admin_nome?: string;
  admin_email?: string;
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  block_room: { label: "Bloquear Sala", color: "bg-red-500/20 text-red-400" },
  unblock_room: { label: "Desbloquear Sala", color: "bg-green-500/20 text-green-400" },
  set_privacy: { label: "Alterar Privacidade", color: "bg-blue-500/20 text-blue-400" },
  set_saldo: { label: "Definir Saldo", color: "bg-yellow-500/20 text-yellow-400" },
  add_saldo: { label: "Adicionar Saldo", color: "bg-green-500/20 text-green-400" },
  remove_saldo: { label: "Remover Saldo", color: "bg-red-500/20 text-red-400" },
  set_badge: { label: "Atribuir Badge", color: "bg-purple-500/20 text-purple-400" },
  remove_badge: { label: "Remover Badge", color: "bg-orange-500/20 text-orange-400" },
  remove_role: { label: "Remover Cargo", color: "bg-red-500/20 text-red-400" },
  add_role: { label: "Adicionar Cargo", color: "bg-green-500/20 text-green-400" },
  create_user: { label: "Criar Usuário", color: "bg-blue-500/20 text-blue-400" },
  delete_user: { label: "Deletar Usuário", color: "bg-red-500/20 text-red-400" },
  toggle_role: { label: "Alterar Cargo", color: "bg-yellow-500/20 text-yellow-400" },
};

const TARGET_LABELS: Record<string, string> = {
  chat_room: "Sala de Chat",
  user: "Usuário",
  saldo: "Saldo",
  profile: "Perfil",
  role: "Cargo",
};

const PER_PAGE = 20;

export default function AuditTab() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [adminFilter, setAdminFilter] = useState("");
  const [admins, setAdmins] = useState<{ id: string; nome: string | null; email: string | null }[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const fetchLogs = useCallback(async (resetPage = true) => {
    setLoading(true);
    const currentPage = resetPage ? 1 : page;
    if (resetPage) setPage(1);

    try {
      let query = (supabase.from("audit_logs") as any)
        .select("*")
        .order("created_at", { ascending: false })
        .range((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE - 1);

      if (actionFilter) query = query.eq("action", actionFilter);
      if (adminFilter) query = query.eq("admin_id", adminFilter);
      if (dateFrom) query = query.gte("created_at", new Date(dateFrom).toISOString());
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        query = query.lte("created_at", endDate.toISOString());
      }
      if (search) query = query.or(`target_id.ilike.%${search}%,action.ilike.%${search}%`);

      const { data, error } = await query;
      if (error) throw error;

      const rows = (data || []) as AuditLog[];

      // Fetch admin names
      const adminIds = [...new Set(rows.map((r: AuditLog) => r.admin_id))];
      if (adminIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, nome, email")
          .in("id", adminIds);
        const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));
        rows.forEach((r: AuditLog) => {
          const p = profileMap.get(r.admin_id);
          if (p) {
            r.admin_nome = p.nome;
            r.admin_email = p.email;
          }
        });
      }

      setLogs(rows);
      setHasMore(rows.length >= PER_PAGE);
    } catch (err) {
      console.error("Erro ao buscar logs:", err);
    } finally {
      setLoading(false);
    }
  }, [actionFilter, adminFilter, dateFrom, dateTo, search, page]);

  const fetchAdmins = useCallback(async () => {
    const { data } = await (supabase.from("user_roles") as any)
      .select("user_id")
      .eq("role", "admin");
    if (data && data.length > 0) {
      const ids = data.map((d: any) => d.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, nome, email")
        .in("id", ids);
      setAdmins((profiles || []) as any);
    }
  }, []);

  useEffect(() => { fetchLogs(true); }, [actionFilter, adminFilter, dateFrom, dateTo]);
  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  const handleSearch = () => fetchLogs(true);
  const loadMore = () => {
    setPage(p => p + 1);
  };

  useEffect(() => {
    if (page > 1) fetchLogs(false);
  }, [page]);

  const actionLabel = (action: string) => ACTION_LABELS[action] || { label: action, color: "bg-muted text-muted-foreground" };
  const targetLabel = (t: string) => TARGET_LABELS[t] || t;

  const uniqueActions = [...new Set(logs.map(l => l.action))];
  const allActions = Object.keys(ACTION_LABELS);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Log de Auditoria</h2>
        </div>
        <button onClick={() => fetchLogs(true)} className="p-2 rounded-lg bg-card border border-border hover:bg-muted transition-colors" title="Atualizar">
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Search + Filter Toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por ação ou ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-3 py-2.5 rounded-xl border text-sm font-medium flex items-center gap-1.5 transition-colors ${showFilters ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:bg-muted"}`}
        >
          <Filter className="w-4 h-4" />
          Filtros
          <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-card border border-border">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1"><Filter className="w-3 h-3" /> Ação</label>
            <select
              value={actionFilter}
              onChange={e => setActionFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm"
            >
              <option value="">Todas</option>
              {allActions.map(a => (
                <option key={a} value={a}>{ACTION_LABELS[a]?.label || a}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1"><User className="w-3 h-3" /> Administrador</label>
            <select
              value={adminFilter}
              onChange={e => setAdminFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm"
            >
              <option value="">Todos</option>
              {admins.map(a => (
                <option key={a.id} value={a.id}>{a.nome || a.email || a.id.slice(0, 8)}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1"><Calendar className="w-3 h-3" /> De</label>
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1"><Calendar className="w-3 h-3" /> Até</label>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Logs List */}
      {loading && logs.length === 0 ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-card border border-border animate-pulse" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhum registro de auditoria encontrado.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map(log => {
            const al = actionLabel(log.action);
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${al.color}`}>
                        {al.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {targetLabel(log.target_type)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      <span className="font-medium text-foreground">{log.admin_nome || log.admin_email || log.admin_id.slice(0, 8)}</span>
                      {log.target_id && (
                        <span className="ml-1">→ <span className="font-mono text-[10px] bg-muted px-1 py-0.5 rounded">{log.target_id.slice(0, 12)}...</span></span>
                      )}
                    </div>
                    {log.details && Object.keys(log.details).length > 0 && (
                      <div className="mt-1.5 text-[11px] text-muted-foreground bg-muted/50 rounded-lg px-2 py-1 font-mono break-all">
                        {Object.entries(log.details).map(([k, v]) => (
                          <div key={k}><span className="text-primary/70">{k}:</span> {String(v)}</div>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {formatDateTimeBR(log.created_at)}
                  </span>
                </div>
              </motion.div>
            );
          })}

          {hasMore && (
            <button
              onClick={loadMore}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-card border border-border text-sm text-muted-foreground hover:bg-muted transition-colors"
            >
              {loading ? "Carregando..." : "Carregar mais"}
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
