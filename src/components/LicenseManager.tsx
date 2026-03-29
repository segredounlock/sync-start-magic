import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { styledToast as toast } from "@/lib/toast";
import { confirm } from "@/lib/confirm";
import {
  KeyRound, Plus, Copy, ToggleLeft, ToggleRight, Trash2, RefreshCw,
  Shield, Clock, Globe, CheckCircle2, XCircle, Loader2, Eye, EyeOff,
  FileText, AlertTriangle, Activity, Search, Filter,
} from "lucide-react";
import { formatFullDateTimeBR } from "@/lib/timezone";

interface License {
  id: string;
  license_key: string;
  mirror_name: string;
  mirror_domain: string | null;
  expires_at: string;
  is_active: boolean;
  max_users: number;
  features: string[];
  last_heartbeat_at: string | null;
  created_at: string;
}

interface LicenseLog {
  id: string;
  event_type: string;
  license_id: string | null;
  mirror_name: string | null;
  domain: string | null;
  ip_address: string | null;
  result: string;
  reason: string | null;
  details: any;
  created_at: string;
}

const MASTER_DOMAINS = ["recargasbrasill.com"];

function isMasterDomain(): boolean {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname.toLowerCase();
  return MASTER_DOMAINS.some(d => hostname === d || hostname.endsWith(`.${d}`));
}

const resultColors: Record<string, string> = {
  success: "text-emerald-500 bg-emerald-500/10",
  rejected: "text-red-500 bg-red-500/10",
  expired: "text-yellow-600 bg-yellow-500/10",
  revoked: "text-red-500 bg-red-500/10",
  domain_mismatch: "text-orange-500 bg-orange-500/10",
  not_found: "text-red-400 bg-red-400/10",
  error: "text-destructive bg-destructive/10",
};

const resultLabels: Record<string, string> = {
  success: "✓ Válida",
  rejected: "✗ Rejeitada",
  expired: "⏰ Expirada",
  revoked: "🚫 Revogada",
  domain_mismatch: "🌐 Domínio errado",
  not_found: "❌ Não encontrada",
  error: "⚠ Erro",
};

/* ═══════════════════════════════════════════════
   License Logs Viewer
   ═══════════════════════════════════════════════ */
function LicenseLogsViewer() {
  const [logs, setLogs] = useState<LicenseLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterResult, setFilterResult] = useState<string>("all");
  const [searchDomain, setSearchDomain] = useState("");
  const [stats, setStats] = useState({ total: 0, success: 0, failed: 0, today: 0 });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    let query = (supabase as any)
      .from("license_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (filterResult !== "all") {
      query = query.eq("result", filterResult);
    }
    if (searchDomain.trim()) {
      query = query.ilike("domain", `%${searchDomain.trim()}%`);
    }

    const { data, error } = await query;
    if (!error && data) setLogs(data as LicenseLog[]);
    setLoading(false);
  }, [filterResult, searchDomain]);

  const fetchStats = useCallback(async () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [allRes, successRes, failedRes, todayRes] = await Promise.all([
      (supabase as any).from("license_logs").select("id", { count: "exact", head: true }),
      (supabase as any).from("license_logs").select("id", { count: "exact", head: true }).eq("result", "success"),
      (supabase as any).from("license_logs").select("id", { count: "exact", head: true }).neq("result", "success"),
      (supabase as any).from("license_logs").select("id", { count: "exact", head: true }).gte("created_at", todayStart.toISOString()),
    ]);

    setStats({
      total: allRes.count || 0,
      success: successRes.count || 0,
      failed: failedRes.count || 0,
      today: todayRes.count || 0,
    });
  }, []);

  useEffect(() => { fetchLogs(); fetchStats(); }, [fetchLogs, fetchStats]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("license-logs-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "license_logs" }, () => {
        fetchLogs();
        fetchStats();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchLogs, fetchStats]);

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: "Total", value: stats.total, icon: Activity, color: "text-primary" },
          { label: "Sucesso", value: stats.success, icon: CheckCircle2, color: "text-emerald-500" },
          { label: "Falhas", value: stats.failed, icon: XCircle, color: "text-destructive" },
          { label: "Hoje", value: stats.today, icon: Clock, color: "text-yellow-500" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center">
            <s.icon className={`w-4 h-4 mx-auto mb-1 ${s.color}`} />
            <p className="text-lg font-bold text-foreground">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={searchDomain}
            onChange={e => setSearchDomain(e.target.value)}
            placeholder="Buscar por domínio..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <select
            value={filterResult}
            onChange={e => setFilterResult(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground"
          >
            <option value="all">Todos</option>
            <option value="success">Sucesso</option>
            <option value="rejected">Rejeitada</option>
            <option value="expired">Expirada</option>
            <option value="revoked">Revogada</option>
            <option value="domain_mismatch">Domínio errado</option>
            <option value="not_found">Não encontrada</option>
            <option value="error">Erro</option>
          </select>
          <button onClick={() => { fetchLogs(); fetchStats(); }} className="p-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Logs */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : logs.length === 0 ? (
        <p className="text-center py-8 text-sm text-muted-foreground">Nenhum log encontrado</p>
      ) : (
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {logs.map(log => (
            <div key={log.id} className="bg-card border border-border rounded-xl p-3 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${resultColors[log.result] || "text-muted-foreground bg-muted"}`}>
                    {resultLabels[log.result] || log.result}
                  </span>
                  {log.mirror_name && (
                    <span className="text-xs text-foreground font-medium">{log.mirror_name}</span>
                  )}
                  {log.domain && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Globe className="w-3 h-3" />{log.domain}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {formatFullDateTimeBR(log.created_at)}
                </span>
              </div>
              {log.reason && (
                <p className="text-[11px] text-muted-foreground">{log.reason}</p>
              )}
              {log.ip_address && log.ip_address !== "unknown" && (
                <p className="text-[10px] text-muted-foreground/70">IP: {log.ip_address}</p>
              )}
              {log.details && (
                <details className="text-[10px]">
                  <summary className="text-muted-foreground cursor-pointer hover:text-foreground">Detalhes</summary>
                  <pre className="mt-1 p-2 bg-muted/50 rounded-lg overflow-x-auto text-muted-foreground">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Integrity Check Panel
   ═══════════════════════════════════════════════ */
function IntegrityCheckPanel({
  integrityResults, integrityLoading, heartbeatResults, heartbeatLoading,
  runIntegrityCheck, runHeartbeatCheck, licenses,
}: {
  integrityResults: any[] | null;
  integrityLoading: boolean;
  heartbeatResults: any | null;
  heartbeatLoading: boolean;
  runIntegrityCheck: (id?: string) => void;
  runHeartbeatCheck: () => void;
  licenses: License[];
}) {
  const overallColors: Record<string, string> = {
    HEALTHY: "text-emerald-500 bg-emerald-500/10",
    WARNING: "text-yellow-500 bg-yellow-500/10",
    SUSPICIOUS: "text-orange-500 bg-orange-500/10",
    COMPROMISED: "text-destructive bg-destructive/10",
  };

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => runHeartbeatCheck()}
          disabled={heartbeatLoading}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {heartbeatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
          Verificar Heartbeats
        </button>
        <button
          onClick={() => runIntegrityCheck()}
          disabled={integrityLoading}
          className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground rounded-xl text-sm font-semibold hover:bg-muted disabled:opacity-50 transition-colors"
        >
          {integrityLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Verificar Integridade
        </button>
      </div>

      {/* Heartbeat Results */}
      {heartbeatResults && (
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" /> Resultado dos Heartbeats
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="bg-muted/30 rounded-xl p-3">
              <div className="text-lg font-bold text-foreground">{heartbeatResults.checked}</div>
              <div className="text-[10px] text-muted-foreground">Verificadas</div>
            </div>
            <div className="bg-emerald-500/10 rounded-xl p-3">
              <div className="text-lg font-bold text-emerald-500">{heartbeatResults.healthy}</div>
              <div className="text-[10px] text-emerald-600">Saudáveis</div>
            </div>
            <div className="bg-yellow-500/10 rounded-xl p-3">
              <div className="text-lg font-bold text-yellow-500">{heartbeatResults.stale_warning}</div>
              <div className="text-[10px] text-yellow-600">Alertas</div>
            </div>
            <div className="bg-destructive/10 rounded-xl p-3">
              <div className="text-lg font-bold text-destructive">{heartbeatResults.auto_suspended}</div>
              <div className="text-[10px] text-destructive">Suspensas</div>
            </div>
          </div>
          {heartbeatResults.details?.length > 0 && (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {heartbeatResults.details.map((d: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-xs bg-muted/20 rounded-lg px-3 py-2">
                  <span className="font-medium text-foreground">{d.mirror || "—"}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    d.status === "healthy" ? "bg-emerald-500/10 text-emerald-600" :
                    d.status === "auto_suspended" ? "bg-destructive/10 text-destructive" :
                    "bg-yellow-500/10 text-yellow-600"
                  }`}>
                    {d.status === "healthy" ? "✓ Saudável" :
                     d.status === "auto_suspended" ? "⛔ Suspensa" :
                     d.status === "stale_warning" ? "⚠ Alerta" :
                     d.status === "no_heartbeat" ? "❌ Sem heartbeat" :
                     d.status === "expired" ? "⏰ Expirada" : d.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Integrity Results */}
      {integrityResults && (
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" /> Resultado da Integridade
          </h4>
          {integrityResults.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nenhum espelho com domínio Supabase configurado para verificar.</p>
          ) : (
            <div className="space-y-2">
              {integrityResults.map((r: any, i: number) => (
                <div key={i} className="bg-muted/20 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-foreground">{r.mirror || "—"}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${overallColors[r.overall] || "text-muted-foreground bg-muted"}`}>
                      {r.overall}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">Servidor:</span>
                      <span className={r.license_check_server === "active" ? "text-emerald-500" : "text-destructive"}>
                        {r.license_check_server}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">Dados:</span>
                      <span className={r.anon_data_leak === "protected" ? "text-emerald-500" : r.anon_data_leak === "LEAK_DETECTED" ? "text-destructive font-bold" : "text-muted-foreground"}>
                        {r.anon_data_leak === "protected" ? "🔒 Protegido" : r.anon_data_leak === "LEAK_DETECTED" ? "🚨 VAZAMENTO" : r.anon_data_leak}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">Heartbeat:</span>
                      <span className="text-foreground">{r.heartbeat_age}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Per-license check buttons */}
      {licenses.filter(l => l.is_active && l.mirror_domain).length > 0 && (
        <div className="bg-muted/30 rounded-2xl p-4 space-y-2">
          <h4 className="text-xs font-semibold text-foreground">Verificar espelho individual</h4>
          <div className="flex flex-wrap gap-2">
            {licenses.filter(l => l.is_active && l.mirror_domain).map(l => (
              <button
                key={l.id}
                onClick={() => runIntegrityCheck(l.id)}
                disabled={integrityLoading}
                className="text-xs px-3 py-1.5 bg-card border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
              >
                {l.mirror_name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-muted/30 rounded-2xl p-4 space-y-2">
        <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" /> Como funciona
        </h4>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li><b>Heartbeat</b> — verifica se espelhos estão ativos. Suspende automaticamente após 48h sem contato.</li>
          <li><b>Integridade</b> — testa remotamente se o espelho valida licenças, se dados estão protegidos por RLS, e a idade do último heartbeat.</li>
          <li>Verificação de heartbeat roda automaticamente a cada 6 horas via cron.</li>
          <li>Espelhos precisam ter <b>mirror_domain</b> como URL Supabase para verificação remota.</li>
        </ul>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   License Manager Content
   ═══════════════════════════════════════════════ */
function LicenseManagerContent() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"licenses" | "logs" | "integrity">("licenses");
  const [integrityResults, setIntegrityResults] = useState<any[] | null>(null);
  const [integrityLoading, setIntegrityLoading] = useState(false);
  const [heartbeatLoading, setHeartbeatLoading] = useState(false);
  const [heartbeatResults, setHeartbeatResults] = useState<any | null>(null);

  const runHeartbeatCheck = async () => {
    setHeartbeatLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("license-heartbeat-check");
      if (error) throw error;
      setHeartbeatResults(data);
      toast.success(`Verificado: ${data?.checked || 0} licenças`);
      fetchLicenses();
    } catch (err: any) {
      toast.error(err.message || "Erro ao verificar heartbeats");
    } finally {
      setHeartbeatLoading(false);
    }
  };

  const runIntegrityCheck = async (licenseId?: string) => {
    setIntegrityLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("license-integrity-check", {
        body: licenseId ? { license_id: licenseId } : {},
      });
      if (error) throw error;
      setIntegrityResults(data?.results || []);
      toast.success(`Integridade verificada: ${data?.checked || 0} espelhos`);
    } catch (err: any) {
      toast.error(err.message || "Erro ao verificar integridade");
    } finally {
      setIntegrityLoading(false);
    }
  };

  // Form state
  const [formName, setFormName] = useState("");
  const [formDomain, setFormDomain] = useState("");
  const [formExpDays, setFormExpDays] = useState(30);

  const fetchLicenses = useCallback(async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("licenses")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setLicenses(data as License[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchLicenses(); }, [fetchLicenses]);

  const handleCreate = async () => {
    if (!formName.trim()) { toast.error("Nome do espelho é obrigatório"); return; }
    if (!formDomain.trim()) { toast.error("Domínio é obrigatório — a licença só funciona para este domínio"); return; }
    setCreating(true);
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + formExpDays);

      const { data, error } = await supabase.functions.invoke("license-generate", {
        body: {
          mirror_name: formName.trim(),
          mirror_domain: formDomain.trim(),
          expires_at: expiresAt.toISOString(),
          max_users: 999999,
          features: ["all"],
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success("Licença criada com sucesso!");
      setShowForm(false);
      setFormName("");
      setFormDomain("");
      setFormExpDays(30);
      fetchLicenses();
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar licença");
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    const action = currentActive ? "revogar" : "reativar";
    const ok = await confirm(`Deseja ${action} esta licença?`, { title: action === "revogar" ? "Revogar Licença" : "Reativar Licença", destructive: action === "revogar" });
    if (!ok) return;

    const { error } = await (supabase as any)
      .from("licenses")
      .update({ is_active: !currentActive })
      .eq("id", id);

    if (error) { toast.error("Erro ao atualizar"); return; }
    toast.success(`Licença ${action === "revogar" ? "revogada" : "reativada"}`);
    fetchLicenses();
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm("Excluir permanentemente esta licença?", { title: "Excluir Licença", destructive: true });
    if (!ok) return;

    const { error } = await (supabase as any).from("licenses").delete().eq("id", id);
    if (error) { toast.error("Erro ao excluir"); return; }
    toast.success("Licença excluída");
    fetchLicenses();
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("Chave copiada!");
  };

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const getHeartbeatStatus = (heartbeat: string | null) => {
    if (!heartbeat) return { label: "Nunca conectou", color: "text-muted-foreground" };
    const diff = Date.now() - new Date(heartbeat).getTime();
    const hours = diff / (1000 * 60 * 60);
    if (hours < 12) return { label: "Online", color: "text-emerald-500" };
    if (hours < 48) return { label: "Offline recente", color: "text-yellow-500" };
    return { label: "Offline", color: "text-destructive" };
  };

  const isExpired = (exp: string) => new Date(exp) < new Date();

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1">
        <button
          onClick={() => setActiveTab("licenses")}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "licenses" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Shield className="w-4 h-4" /> Licenças
        </button>
        <button
          onClick={() => setActiveTab("integrity")}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "integrity" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Activity className="w-4 h-4" /> Integridade
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "logs" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="w-4 h-4" /> Logs
        </button>
      </div>

      {activeTab === "logs" ? (
        <LicenseLogsViewer />
      ) : activeTab === "integrity" ? (
        <IntegrityCheckPanel
          integrityResults={integrityResults}
          integrityLoading={integrityLoading}
          heartbeatResults={heartbeatResults}
          heartbeatLoading={heartbeatLoading}
          runIntegrityCheck={runIntegrityCheck}
          runHeartbeatCheck={runHeartbeatCheck}
          licenses={licenses}
        />
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Licenças de Espelhos</h2>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                {licenses.filter(l => l.is_active && !isExpired(l.expires_at)).length} ativas
              </span>
            </div>
            <div className="flex gap-2">
              <button onClick={fetchLicenses} className="p-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                <RefreshCw className="w-4 h-4 text-muted-foreground" />
              </button>
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" /> Nova Licença
              </button>
            </div>
          </div>

          {/* Create Form */}
          {showForm && (
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Gerar Nova Licença</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Nome do Espelho *</label>
                  <input
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground"
                    placeholder="Ex: Cliente João"
                  />
                </div>
                <div>
                  <label className="text-xs text-foreground font-medium mb-1 block">Domínio <span className="text-destructive">*</span></label>
                  <input
                    required
                    value={formDomain}
                    onChange={e => setFormDomain(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground"
                    placeholder="Ex: app.cliente.com"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Validade (dias)</label>
                  <input
                    type="number"
                    value={formExpDays}
                    onChange={e => setFormExpDays(Number(e.target.value))}
                    min={1}
                    max={3650}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                  Gerar Licença
                </button>
              </div>
            </div>
          )}

          {/* Licenses List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : licenses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              Nenhuma licença criada ainda
            </div>
          ) : (
            <div className="space-y-3">
              {licenses.map(lic => {
                const heartbeat = getHeartbeatStatus(lic.last_heartbeat_at);
                const expired = isExpired(lic.expires_at);
                const keyVisible = visibleKeys.has(lic.id);

                return (
                  <div
                    key={lic.id}
                    className={`bg-card border rounded-2xl p-4 space-y-3 ${
                      !lic.is_active ? "border-destructive/30 opacity-70" :
                      expired ? "border-yellow-500/30" :
                      "border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{lic.mirror_name}</span>
                          {!lic.is_active && (
                            <span className="text-[10px] bg-destructive/10 text-destructive px-2 py-0.5 rounded-full font-semibold">REVOGADA</span>
                          )}
                          {lic.is_active && expired && (
                            <span className="text-[10px] bg-yellow-500/10 text-yellow-600 px-2 py-0.5 rounded-full font-semibold">EXPIRADA</span>
                          )}
                          {lic.is_active && !expired && (
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full font-semibold">ATIVA</span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          {lic.mirror_domain && (
                            <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{lic.mirror_domain}</span>
                          )}
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Exp: {new Date(lic.expires_at).toLocaleDateString("pt-BR")}</span>
                          <span className={`flex items-center gap-1 ${heartbeat.color}`}>
                            {heartbeat.label === "Online" ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {heartbeat.label}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggle(lic.id, lic.is_active)}
                          className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                          title={lic.is_active ? "Revogar" : "Reativar"}
                        >
                          {lic.is_active ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}
                        </button>
                        <button
                          onClick={() => handleDelete(lic.id)}
                          className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-muted/30 rounded-xl px-3 py-2">
                      <KeyRound className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <code className="text-xs text-muted-foreground flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono">
                        {keyVisible ? lic.license_key : `${lic.license_key.slice(0, 20)}...${lic.license_key.slice(-10)}`}
                      </code>
                      <button onClick={() => toggleKeyVisibility(lic.id)} className="p-1 hover:bg-muted rounded transition-colors">
                        {keyVisible ? <EyeOff className="w-3.5 h-3.5 text-muted-foreground" /> : <Eye className="w-3.5 h-3.5 text-muted-foreground" />}
                      </button>
                      <button onClick={() => copyKey(lic.license_key)} className="p-1 hover:bg-muted rounded transition-colors">
                        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </div>

                    {lic.last_heartbeat_at && (
                      <p className="text-[10px] text-muted-foreground">
                        Último heartbeat: {formatFullDateTimeBR(lic.last_heartbeat_at)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Instructions */}
          <div className="bg-muted/30 rounded-2xl p-4 space-y-2">
            <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-primary" /> Como funciona
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>Gere uma licença e envie a <b>chave</b> ao operador do espelho</li>
              <li>No espelho, o admin salva a chave em <b>Configurações → Licença</b></li>
              <li>O espelho valida a cada 6h contra seu servidor — sem licença válida, fica bloqueado</li>
              <li>Você pode <b>revogar instantaneamente</b> qualquer licença a qualquer momento</li>
              <li>O domínio é <b>obrigatório</b> — a chave só funciona para o domínio vinculado</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

export default function LicenseManager() {
  if (!isMasterDomain()) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
        <Shield className="w-12 h-12 text-muted-foreground/50" />
        <h2 className="text-lg font-bold text-foreground">Recurso Indisponível</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          O gerenciamento de licenças está disponível apenas no servidor principal.
        </p>
      </div>
    );
  }
  return <LicenseManagerContent />;
}
