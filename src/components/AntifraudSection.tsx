import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { styledToast as toast } from "@/lib/toast";
import { formatFullDateTimeBR } from "@/lib/timezone";
import { confirm } from "@/lib/confirm";
import { logAudit } from "@/lib/auditLog";
import { InfoCard } from "@/components/InfoCard";
import { SkeletonRow } from "@/components/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, ShieldAlert, ShieldCheck, Search, Eye, EyeOff, Ban,
  Smartphone, Fingerprint, MapPin, Globe, Monitor, Cpu, Clock,
  ChevronDown, ChevronRight, ChevronLeft, X, RefreshCw, Loader2, AlertTriangle,
  User, CheckCircle2, XCircle, ToggleLeft, ToggleRight, Filter,
  FileText, Trash2,
} from "lucide-react";

interface FingerprintRecord {
  id: string;
  user_id: string;
  fingerprint_hash: string;
  ip_address: string | null;
  user_agent: string | null;
  platform: string | null;
  screen_resolution: string | null;
  timezone: string | null;
  language: string | null;
  hardware_concurrency: number | null;
  device_memory: number | null;
  touch_support: boolean | null;
  canvas_hash: string | null;
  webgl_renderer: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  raw_data: Record<string, any> | null;
  selfie_url: string | null;
  // joined from profiles
  user_nome?: string;
  user_email?: string;
  user_avatar?: string;
}

interface BannedDevice {
  id: string;
  fingerprint_hash: string | null;
  ip_address: string | null;
  user_agent_pattern: string | null;
  reason: string;
  active: boolean;
  banned_by: string;
  original_user_id: string | null;
  original_user_nome: string | null;
  original_user_email: string | null;
  created_at: string;
}

interface AuditEntry {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  details: any;
  created_at: string;
}

type TabKey = "fingerprints" | "banned" | "audit" | "attempts";

// Selfie modal state
function SelfieModal({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-3 -right-3 z-10 p-1.5 rounded-full bg-background border border-border shadow-lg">
          <X className="w-4 h-4" />
        </button>
        <img src={url} alt="Selfie de login" className="w-full rounded-xl shadow-2xl border border-border" />
      </div>
    </div>
  );
}

export function AntifraudSection() {
  const { user } = useAuth();
  const [tab, setTab] = useState<TabKey>("fingerprints");
  const [loading, setLoading] = useState(false);

  // Fingerprints state
  const [fingerprints, setFingerprints] = useState<FingerprintRecord[]>([]);
  const [fpSearch, setFpSearch] = useState("");
  const [fpPage, setFpPage] = useState(1);
  const FP_PER_PAGE = 20;
  const [expandedFp, setExpandedFp] = useState<string | null>(null);
  const [selfieModalUrl, setSelfieModalUrl] = useState<string | null>(null);

  // Banned devices state
  const [bannedDevices, setBannedDevices] = useState<BannedDevice[]>([]);
  const [bdSearch, setBdSearch] = useState("");
  const [showInactive, setShowInactive] = useState(false);

  // Audit state
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [auditFilter, setAuditFilter] = useState("");

  // Login attempts state
  const [loginAttempts, setLoginAttempts] = useState<any[]>([]);
  const [attemptSearch, setAttemptSearch] = useState("");

  // Stats
  const [stats, setStats] = useState({ totalFingerprints: 0, uniqueUsers: 0, bannedActive: 0, suspiciousIps: 0, failedAttempts: 0 });

  // ── Fetch fingerprints ──
  const fetchFingerprints = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("login_fingerprints")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;

      // Fetch profile info for each unique user
      const userIds = [...new Set((data || []).map((f: any) => f.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, nome, email, avatar_url")
        .in("id", userIds);

      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));
      const enriched = (data || []).map((f: any) => ({
        ...f,
        user_nome: profileMap.get(f.user_id)?.nome || "Desconhecido",
        user_email: profileMap.get(f.user_id)?.email || "",
        user_avatar: profileMap.get(f.user_id)?.avatar_url || "",
      }));

      setFingerprints(enriched);

      // Calculate stats
      const uniqueUsersSet = new Set(enriched.map((f: any) => f.user_id));
      const ipCounts = new Map<string, Set<string>>();
      enriched.forEach((f: any) => {
        if (f.ip_address) {
          if (!ipCounts.has(f.ip_address)) ipCounts.set(f.ip_address, new Set());
          ipCounts.get(f.ip_address)!.add(f.user_id);
        }
      });
      const suspiciousIps = [...ipCounts.entries()].filter(([, users]) => users.size > 2).length;

      setStats(prev => ({
        ...prev,
        totalFingerprints: enriched.length,
        uniqueUsers: uniqueUsersSet.size,
        suspiciousIps,
      }));
    } catch (err: any) {
      toast.error("Erro ao carregar dados coletados: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch banned devices ──
  const fetchBanned = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("banned_devices")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setBannedDevices(data || []);
      setStats(prev => ({ ...prev, bannedActive: (data || []).filter((d: any) => d.active).length }));
    } catch (err: any) {
      toast.error("Erro ao carregar dispositivos banidos: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch audit logs (fraud-related) ──
  const fetchAudit = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .in("target_type", ["device", "fingerprint", "ban", "antifraud"])
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      setAuditLogs(data || []);
    } catch (err: any) {
      toast.error("Erro ao carregar logs: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch login attempts ──
  const fetchAttempts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("login_attempts" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(300);
      if (error) throw error;
      const attempts = (data || []) as any[];
      setLoginAttempts(attempts);
      setStats(prev => ({ ...prev, failedAttempts: attempts.filter((a: any) => !a.success).length }));
    } catch (err: any) {
      toast.error("Erro ao carregar tentativas: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "fingerprints") fetchFingerprints();
    else if (tab === "banned") fetchBanned();
    else if (tab === "audit") fetchAudit();
    else if (tab === "attempts") fetchAttempts();
  }, [tab, fetchFingerprints, fetchBanned, fetchAudit, fetchAttempts]);

  // ── Ban device from fingerprint ──
  const banDevice = async (fp: FingerprintRecord) => {
    const ok = await confirm(`Tem certeza que deseja banir o dispositivo de ${fp.user_nome || fp.user_email}? O usuário não poderá mais acessar o sistema com este dispositivo.`);
    if (!ok) return;

    try {
      const { error } = await supabase.from("banned_devices").insert({
        fingerprint_hash: fp.fingerprint_hash,
        ip_address: fp.ip_address,
        user_agent_pattern: fp.user_agent,
        banned_by: user!.id,
        original_user_id: fp.user_id,
        original_user_nome: fp.user_nome || null,
        original_user_email: fp.user_email || null,
        reason: "Bloqueado via painel antifraude",
      });
      if (error) throw error;

      await logAudit("ban_device", "device", fp.fingerprint_hash, {
        user_id: fp.user_id, user_nome: fp.user_nome, ip: fp.ip_address,
      });

      toast.success("Dispositivo banido com sucesso");
      fetchBanned();
    } catch (err: any) {
      toast.error("Erro ao banir: " + err.message);
    }
  };

  // ── Toggle ban active/inactive ──
  const toggleBan = async (ban: BannedDevice) => {
    try {
      const { error } = await supabase
        .from("banned_devices")
        .update({ active: !ban.active })
        .eq("id", ban.id);
      if (error) throw error;

      await logAudit(ban.active ? "unban_device" : "reban_device", "device", ban.id, {
        fingerprint: ban.fingerprint_hash, user: ban.original_user_nome,
      });

      toast.success(ban.active ? "Ban desativado" : "Ban reativado");
      fetchBanned();
    } catch (err: any) {
      toast.error("Erro: " + err.message);
    }
  };

  // ── Delete ban ──
  const deleteBan = async (ban: BannedDevice) => {
    const ok = await confirm(`Excluir permanentemente o ban de ${ban.original_user_nome || ban.fingerprint_hash}?`);
    if (!ok) return;

    try {
      const { error } = await supabase.from("banned_devices").delete().eq("id", ban.id);
      if (error) throw error;

      await logAudit("delete_ban", "device", ban.id, {
        fingerprint: ban.fingerprint_hash, user: ban.original_user_nome,
      });

      toast.success("Ban excluído");
      fetchBanned();
    } catch (err: any) {
      toast.error("Erro: " + err.message);
    }
  };

  // ── Filtered data ──
  const filteredFingerprints = useMemo(() => {
    if (!fpSearch.trim()) return fingerprints;
    const q = fpSearch.toLowerCase();
    return fingerprints.filter(f =>
      (f.user_nome?.toLowerCase().includes(q)) ||
      (f.user_email?.toLowerCase().includes(q)) ||
      (f.ip_address?.toLowerCase().includes(q)) ||
      (f.fingerprint_hash?.toLowerCase().includes(q)) ||
      (f.platform?.toLowerCase().includes(q))
    );
  }, [fingerprints, fpSearch]);

  // Reset page when search changes
  useEffect(() => { setFpPage(1); }, [fpSearch]);

  const fpTotalPages = Math.max(1, Math.ceil(filteredFingerprints.length / FP_PER_PAGE));
  const paginatedFingerprints = useMemo(() => {
    const start = (fpPage - 1) * FP_PER_PAGE;
    return filteredFingerprints.slice(start, start + FP_PER_PAGE);
  }, [filteredFingerprints, fpPage]);

  const filteredBanned = useMemo(() => {
    let list = bannedDevices;
    if (!showInactive) list = list.filter(b => b.active);
    if (bdSearch.trim()) {
      const q = bdSearch.toLowerCase();
      list = list.filter(b =>
        (b.original_user_nome?.toLowerCase().includes(q)) ||
        (b.original_user_email?.toLowerCase().includes(q)) ||
        (b.fingerprint_hash?.toLowerCase().includes(q)) ||
        (b.ip_address?.toLowerCase().includes(q)) ||
        (b.reason?.toLowerCase().includes(q))
      );
    }
    return list;
  }, [bannedDevices, bdSearch, showInactive]);

  const filteredAudit = useMemo(() => {
    if (!auditFilter.trim()) return auditLogs;
    const q = auditFilter.toLowerCase();
    return auditLogs.filter(a =>
      a.action?.toLowerCase().includes(q) ||
      a.target_type?.toLowerCase().includes(q) ||
      JSON.stringify(a.details)?.toLowerCase().includes(q)
    );
  }, [auditLogs, auditFilter]);

  const tabs: { key: TabKey; label: string; icon: any; count?: number }[] = [
    { key: "fingerprints", label: "Dados Coletados", icon: Fingerprint, count: stats.totalFingerprints },
    { key: "banned", label: "Banidos", icon: Ban, count: stats.bannedActive },
    { key: "attempts", label: "Tentativas", icon: Clock, count: stats.failedAttempts },
    { key: "audit", label: "Logs", icon: FileText, count: auditLogs.length },
  ];

  // Check if a fingerprint is already banned
  const isBanned = useCallback((hash: string) => {
    return bannedDevices.some(b => b.fingerprint_hash === hash && b.active);
  }, [bannedDevices]);

  // Load banned on mount for cross-reference
  useEffect(() => { fetchBanned(); }, [fetchBanned]);

  return (
    <>
    {selfieModalUrl && <SelfieModal url={selfieModalUrl} onClose={() => setSelfieModalUrl(null)} />}
    <div className="space-y-6">
      {/* Header */}
      <InfoCard
        title="Sistema Antifraude"
        items={[
          { icon: Fingerprint, label: "Dados Coletados", description: "Visualize dados coletados de dispositivos de todos os usuários." },
          { icon: Ban, label: "Banimentos", description: "Bloqueie dispositivos fraudulentos e gerencie a lista de banidos." },
          { icon: FileText, label: "Logs", description: "Acompanhe todas as ações de segurança executadas." },
        ]}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Fingerprint} label="Dados Coletados" value={stats.totalFingerprints} color="text-primary" />
        <StatCard icon={User} label="Usuários Únicos" value={stats.uniqueUsers} color="text-accent" />
        <StatCard icon={Ban} label="Bans Ativos" value={stats.bannedActive} color="text-destructive" />
        <StatCard icon={AlertTriangle} label="IPs Suspeitos" value={stats.suspiciousIps} color="text-warning" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 rounded-xl p-1">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
              tab === t.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.label}</span>
            {t.count !== undefined && t.count > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                tab === t.key ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              }`}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {/* ===== FINGERPRINTS TAB ===== */}
          {tab === "fingerprints" && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar por nome, email, IP ou hash..."
                    value={fpSearch}
                    onChange={e => setFpSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
                  />
                </div>
                <button
                  onClick={fetchFingerprints}
                  disabled={loading}
                  className="p-2.5 rounded-xl bg-muted/50 border border-border hover:bg-muted transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </button>
              </div>

              {loading && fingerprints.length === 0 ? (
                <div className="space-y-3">{[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}</div>
              ) : filteredFingerprints.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Fingerprint className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhum dado coletado encontrado</p>
                </div>
              ) : (
                <>
                <div className="space-y-2">
                  {paginatedFingerprints.map(fp => {
                    const banned = isBanned(fp.fingerprint_hash);
                    const expanded = expandedFp === fp.id;
                    return (
                      <div
                        key={fp.id}
                        className={`rounded-xl border transition-all ${
                          banned ? "border-destructive/30 bg-destructive/5" : "border-border bg-card"
                        }`}
                      >
                        {/* Summary row */}
                        <button
                          onClick={() => setExpandedFp(expanded ? null : fp.id)}
                          className="w-full flex items-center gap-3 p-3 text-left"
                        >
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                            {fp.user_avatar ? (
                              <img src={fp.user_avatar} className="w-8 h-8 rounded-full object-cover" alt="" />
                            ) : (
                              <User className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium truncate">{fp.user_nome || "Sem nome"}</span>
                              {banned && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-destructive/20 text-destructive font-medium">
                                  BANIDO
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{fp.ip_address || "IP desconhecido"}</span>
                              <span>•</span>
                              <span>{fp.platform || "Plataforma desconhecida"}</span>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground text-right shrink-0">
                            {formatFullDateTimeBR(fp.created_at)}
                          </div>
                          {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
                        </button>

                        {/* Expanded details */}
                        <AnimatePresence>
                          {expanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-3 pb-3 pt-1 border-t border-border/50">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                                  <DetailItem icon={User} label="Email" value={fp.user_email || "—"} />
                                  <DetailItem icon={Globe} label="IP" value={fp.ip_address || "—"} />
                                  <DetailItem icon={Monitor} label="Plataforma" value={fp.platform || "—"} />
                                  <DetailItem icon={Monitor} label="Resolução" value={fp.screen_resolution || "—"} />
                                  <DetailItem icon={Clock} label="Fuso" value={fp.timezone || "—"} />
                                  <DetailItem icon={Globe} label="Idioma" value={fp.language || "—"} />
                                  <DetailItem icon={Cpu} label="Núcleos" value={fp.hardware_concurrency?.toString() || "—"} />
                                  <DetailItem icon={Cpu} label="Memória" value={fp.device_memory ? `${fp.device_memory} GB` : "—"} />
                                  <DetailItem icon={Smartphone} label="Touch" value={fp.touch_support ? "Sim" : "Não"} />
                                  <DetailItem icon={Fingerprint} label="Hash" value={fp.fingerprint_hash?.slice(0, 16) + "..."} />
                                  <DetailItem icon={Monitor} label="Canvas" value={fp.canvas_hash?.slice(0, 16) + "..." || "—"} />
                                  <DetailItem icon={Monitor} label="WebGL" value={fp.webgl_renderer?.slice(0, 30) || "—"} />
                                  {/* Localização enriquecida */}
                                  {(() => {
                                    const rd = fp.raw_data || {};
                                    const hasGps = fp.latitude != null && fp.longitude != null;
                                    const hasIp = rd.ip_city || rd.ip_region || rd.ip_country;
                                    const geoSource = rd.geo_source;
                                    
                                    if (!hasGps && !hasIp) return null;
                                    
                                    const locationParts: string[] = [];
                                    if (rd.ip_city) locationParts.push(rd.ip_city);
                                    if (rd.ip_region) locationParts.push(rd.ip_region);
                                    if (rd.ip_country) locationParts.push(rd.ip_country);
                                    const locationLabel = locationParts.length > 0 ? locationParts.join(", ") : null;
                                    
                                    return (
                                      <div className="col-span-full mt-2 p-3 rounded-xl bg-muted/40 space-y-2">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                          <MapPin className="h-4 w-4 text-primary" />
                                          Localização
                                          {geoSource && (
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                                              geoSource === "gps" ? "bg-green-500/15 text-green-600" : "bg-yellow-500/15 text-yellow-600"
                                            }`}>
                                              {geoSource === "gps" ? "📡 GPS" : "🌐 IP"}
                                            </span>
                                          )}
                                        </div>
                                        {locationLabel && (
                                          <p className="text-sm text-foreground">{locationLabel}</p>
                                        )}
                                        {hasGps && (
                                          <p className="text-xs text-muted-foreground">
                                            Coordenadas: {fp.latitude!.toFixed(5)}, {fp.longitude!.toFixed(5)}
                                            {rd.gps_accuracy_meters && ` (±${Math.round(rd.gps_accuracy_meters)}m)`}
                                          </p>
                                        )}
                                        {rd.ip_isp && (
                                          <p className="text-xs text-muted-foreground">Provedor: {rd.ip_isp}</p>
                                        )}
                                        {hasGps && (
                                          <a
                                            href={`https://www.google.com/maps?q=${fp.latitude},${fp.longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                                          >
                                            <MapPin className="h-3 w-3" /> Ver no Google Maps
                                          </a>
                                        )}
                                      </div>
                                    );
                                  })()}
                                </div>

                                {/* Selfie de login */}
                                {fp.selfie_url && (
                                  <div className="mt-3 p-3 rounded-xl bg-muted/40 space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                      <User className="h-4 w-4 text-primary" />
                                      Selfie de Login
                                    </div>
                                    <button
                                      onClick={() => setSelfieModalUrl(fp.selfie_url)}
                                      className="block rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-colors"
                                    >
                                      <img
                                        src={fp.selfie_url}
                                        alt="Selfie de login"
                                        className="w-24 h-24 object-cover"
                                      />
                                    </button>
                                    <p className="text-[10px] text-muted-foreground">Clique para ampliar</p>
                                  </div>
                                )}

                                {/* Advanced raw_data details */}
                                <AdvancedDataSection rawData={fp.raw_data} />

                                {/* User Agent full */}
                                {fp.user_agent && (
                                  <div className="mt-3 p-2 rounded-lg bg-muted/50 text-xs text-muted-foreground break-all">
                                    <span className="font-medium text-foreground">User Agent:</span> {fp.user_agent}
                                  </div>
                                )}

                                {/* Actions */}
                                <div className="mt-3 flex gap-2">
                                  {!banned ? (
                                    <button
                                      onClick={() => banDevice(fp)}
                                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20 transition-colors"
                                    >
                                      <Ban className="w-3.5 h-3.5" />
                                      Banir Dispositivo
                                    </button>
                                  ) : (
                                    <span className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-destructive/10 text-destructive text-xs font-medium">
                                      <ShieldAlert className="w-3.5 h-3.5" />
                                      Dispositivo já banido
                                    </span>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {fpTotalPages > 1 && (
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-muted-foreground">
                      {(fpPage - 1) * FP_PER_PAGE + 1}–{Math.min(fpPage * FP_PER_PAGE, filteredFingerprints.length)} de {filteredFingerprints.length}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setFpPage(p => Math.max(1, p - 1))}
                        disabled={fpPage <= 1}
                        className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-medium px-2">{fpPage}/{fpTotalPages}</span>
                      <button
                        onClick={() => setFpPage(p => Math.min(fpTotalPages, p + 1))}
                        disabled={fpPage >= fpTotalPages}
                        className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
                </>
              )}
            </div>
          )}

          {/* ===== BANNED DEVICES TAB ===== */}
          {tab === "banned" && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar por nome, email, hash ou motivo..."
                    value={bdSearch}
                    onChange={e => setBdSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => setShowInactive(!showInactive)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${
                    showInactive ? "bg-muted border-border text-foreground" : "bg-muted/30 border-border/50 text-muted-foreground"
                  }`}
                >
                  {showInactive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  Inativos
                </button>
                <button
                  onClick={fetchBanned}
                  disabled={loading}
                  className="p-2.5 rounded-xl bg-muted/50 border border-border hover:bg-muted transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </button>
              </div>

              {loading && bannedDevices.length === 0 ? (
                <div className="space-y-3">{[...Array(3)].map((_, i) => <SkeletonRow key={i} />)}</div>
              ) : filteredBanned.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhum dispositivo banido</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredBanned.map(ban => (
                    <div
                      key={ban.id}
                      className={`rounded-xl border p-4 ${
                        ban.active ? "border-destructive/30 bg-destructive/5" : "border-border/50 bg-card opacity-60"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          ban.active ? "bg-destructive/20" : "bg-muted"
                        }`}>
                          {ban.active ? <ShieldAlert className="w-5 h-5 text-destructive" /> : <ShieldCheck className="w-5 h-5 text-muted-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium">{ban.original_user_nome || "Dispositivo desconhecido"}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                              ban.active ? "bg-destructive/20 text-destructive" : "bg-muted text-muted-foreground"
                            }`}>
                              {ban.active ? "ATIVO" : "INATIVO"}
                            </span>
                          </div>
                          {ban.original_user_email && (
                            <p className="text-xs text-muted-foreground">{ban.original_user_email}</p>
                          )}
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                            {ban.fingerprint_hash && <span>Hash: {ban.fingerprint_hash.slice(0, 12)}...</span>}
                            {ban.ip_address && <span>IP: {ban.ip_address}</span>}
                          </div>
                          <p className="text-xs mt-1 text-muted-foreground italic">Motivo: {ban.reason}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{formatFullDateTimeBR(ban.created_at)}</p>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            onClick={() => toggleBan(ban)}
                            className={`p-2 rounded-lg transition-colors ${
                              ban.active
                                ? "bg-success/10 text-success hover:bg-success/20"
                                : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                            }`}
                            title={ban.active ? "Desativar ban" : "Reativar ban"}
                          >
                            {ban.active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => deleteBan(ban)}
                            className="p-2 rounded-lg bg-muted/50 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                            title="Excluir ban"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== LOGIN ATTEMPTS TAB ===== */}
          {tab === "attempts" && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Filtrar por email ou IP..."
                    value={attemptSearch}
                    onChange={e => setAttemptSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
                  />
                </div>
                <button
                  onClick={fetchAttempts}
                  disabled={loading}
                  className="p-2.5 rounded-xl bg-muted/50 border border-border hover:bg-muted transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </button>
              </div>

              {loading && loginAttempts.length === 0 ? (
                <div className="space-y-3">{[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}</div>
              ) : loginAttempts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhuma tentativa de login registrada</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {loginAttempts
                    .filter((a: any) => {
                      if (!attemptSearch.trim()) return true;
                      const q = attemptSearch.toLowerCase();
                      return a.email?.toLowerCase().includes(q) || a.ip_address?.toLowerCase().includes(q);
                    })
                    .map((attempt: any) => (
                      <div
                        key={attempt.id}
                        className={`rounded-xl border p-3 flex items-center gap-3 ${
                          attempt.success ? "border-border bg-card" : "border-destructive/30 bg-destructive/5"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          attempt.success ? "bg-success/10" : "bg-destructive/10"
                        }`}>
                          {attempt.success ? (
                            <CheckCircle2 className="w-4 h-4 text-success" />
                          ) : (
                            <XCircle className="w-4 h-4 text-destructive" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{attempt.email}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>IP: {attempt.ip_address || "—"}</span>
                            <span>•</span>
                            <span>{attempt.success ? "Sucesso" : "Falha"}</span>
                          </div>
                        </div>
                        <div className="text-[10px] text-muted-foreground text-right shrink-0">
                          {formatFullDateTimeBR(attempt.created_at)}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* ===== AUDIT LOG TAB ===== */}
          {tab === "audit" && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Filtrar logs..."
                    value={auditFilter}
                    onChange={e => setAuditFilter(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
                  />
                </div>
                <button
                  onClick={fetchAudit}
                  disabled={loading}
                  className="p-2.5 rounded-xl bg-muted/50 border border-border hover:bg-muted transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </button>
              </div>

              {loading && auditLogs.length === 0 ? (
                <div className="space-y-3">{[...Array(3)].map((_, i) => <SkeletonRow key={i} />)}</div>
              ) : filteredAudit.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhum log antifraude encontrado</p>
                  <p className="text-xs mt-1">Logs serão registrados quando ações de segurança forem executadas</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAudit.map(log => (
                    <div key={log.id} className="rounded-xl border border-border bg-card p-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          log.action.includes("ban") ? "bg-destructive/10" : "bg-primary/10"
                        }`}>
                          {log.action.includes("ban") ? (
                            <Ban className="w-4 h-4 text-destructive" />
                          ) : (
                            <Shield className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{formatActionLabel(log.action)}</p>
                          <p className="text-xs text-muted-foreground">
                            {log.details?.user_nome || log.details?.user || log.target_id || "—"} • {formatFullDateTimeBR(log.created_at)}
                          </p>
                        </div>
                      </div>
                      {log.details && Object.keys(log.details).length > 0 && (
                        <div className="mt-2 p-2 rounded-lg bg-muted/50 text-xs text-muted-foreground break-all">
                          {JSON.stringify(log.details, null, 2)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
    </>
  );
}

// ── Helper Components ──

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 text-center">
      <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} />
      <p className="text-xl font-bold">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-1.5">
      <Icon className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
      <div>
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="text-xs font-medium break-all">{value}</p>
      </div>
    </div>
  );
}

// ── Raw data category definitions ──
const RAW_DATA_CATEGORIES: { title: string; emoji: string; keys: { key: string; label: string; icon: any; format?: (v: any) => string }[] }[] = [
  {
    title: "Conexão", emoji: "🌐",
    keys: [
      { key: "connectionType", label: "Tipo", icon: Globe },
      { key: "connectionDownlink", label: "Download", icon: Globe, format: v => `${v} Mbps` },
      { key: "connectionRtt", label: "Latência", icon: Globe, format: v => `${v} ms` },
      { key: "connectionSaveData", label: "Economia", icon: Globe, format: v => v ? "Sim" : "Não" },
    ],
  },
  {
    title: "Tela / Janela", emoji: "🖥️",
    keys: [
      { key: "screenOrientation", label: "Orientação", icon: Smartphone },
      { key: "windowSize", label: "Janela", icon: Monitor },
      { key: "availScreen", label: "Tela Disponível", icon: Monitor },
      { key: "outerSize", label: "Outer Size", icon: Monitor },
      { key: "screenIsExtended", label: "Tela Estendida", icon: Monitor, format: v => v ? "Sim" : "Não" },
    ],
  },
  {
    title: "Hardware", emoji: "🔧",
    keys: [
      { key: "batteryLevel", label: "Bateria", icon: Smartphone, format: v => `${Math.round(v * 100)}%` },
      { key: "batteryCharging", label: "Carregando", icon: Smartphone, format: v => v ? "⚡ Sim" : "Não" },
      { key: "audioInputDevices", label: "Microfones", icon: Cpu },
      { key: "videoInputDevices", label: "Câmeras", icon: Cpu },
      { key: "audioOutputDevices", label: "Saídas Áudio", icon: Cpu },
      { key: "storageQuota", label: "Storage Quota", icon: Cpu, format: v => `${Math.round(v / 1024 / 1024)} MB` },
      { key: "storageUsage", label: "Storage Usado", icon: Cpu, format: v => `${Math.round(v / 1024 / 1024)} MB` },
      { key: "jsHeapSizeLimit", label: "JS Heap", icon: Cpu, format: v => `${Math.round(v / 1024 / 1024)} MB` },
      { key: "usedJSHeapSize", label: "Heap Usado", icon: Cpu, format: v => `${Math.round(v / 1024 / 1024)} MB` },
      { key: "deviceMemory", label: "Memória", icon: Cpu, format: v => `${v} GB` },
      { key: "hardwareConcurrency", label: "Núcleos", icon: Cpu },
    ],
  },
  {
    title: "Fingerprints Avançados", emoji: "🧬",
    keys: [
      { key: "audioHash", label: "Áudio FP", icon: Fingerprint },
      { key: "fontHash", label: "Fontes FP", icon: Fingerprint },
      { key: "mathHash", label: "Math FP", icon: Fingerprint },
      { key: "intlHash", label: "Intl FP", icon: Fingerprint },
      { key: "voicesHash", label: "Voices FP", icon: Fingerprint },
      { key: "webglExtensionsHash", label: "WebGL Ext", icon: Fingerprint },
      { key: "webglParams", label: "WebGL Params", icon: Monitor },
      { key: "webglVendor", label: "WebGL Vendor", icon: Monitor },
    ],
  },
  {
    title: "Privacidade / Bot", emoji: "🛡️",
    keys: [
      { key: "adBlockerDetected", label: "AdBlocker", icon: ShieldAlert, format: v => v ? "⚠️ Detectado" : "Não" },
      { key: "webdriver", label: "WebDriver", icon: AlertTriangle, format: v => v ? "⚠️ Bot!" : "Não" },
      { key: "doNotTrack", label: "Do Not Track", icon: Shield },
      { key: "cookieEnabled", label: "Cookies", icon: Shield, format: v => v ? "Sim" : "Não" },
      { key: "pdfViewerEnabled", label: "PDF Viewer", icon: Shield, format: v => v ? "Sim" : "Não" },
    ],
  },
  {
    title: "Localização (IP)", emoji: "📍",
    keys: [
      { key: "geo_source", label: "Fonte", icon: MapPin, format: (v: any) => v === "gps" ? "📡 GPS" : v === "ip" ? "🌐 IP" : String(v) },
      { key: "ip_city", label: "Cidade", icon: MapPin },
      { key: "ip_region", label: "Estado", icon: MapPin },
      { key: "ip_country", label: "País", icon: Globe },
      { key: "ip_isp", label: "Provedor", icon: Globe },
      { key: "ip_lat", label: "Lat (IP)", icon: MapPin },
      { key: "ip_lon", label: "Lon (IP)", icon: MapPin },
      { key: "gps_lat", label: "Lat (GPS)", icon: MapPin },
      { key: "gps_lon", label: "Lon (GPS)", icon: MapPin },
      { key: "gps_accuracy_meters", label: "Precisão GPS", icon: MapPin, format: (v: any) => `±${Math.round(v)}m` },
      { key: "ip_address_resolved", label: "IP Resolvido", icon: Shield },
    ],
  },
  {
    title: "Navegador / Sistema", emoji: "📱",
    keys: [
      { key: "languages", label: "Idiomas", icon: Globe },
      { key: "uaBrands", label: "UA Brands", icon: Monitor },
      { key: "uaMobile", label: "UA Mobile", icon: Smartphone, format: v => v ? "Sim" : "Não" },
      { key: "uaPlatform", label: "UA Platform", icon: Monitor },
      { key: "timezoneOffset", label: "TZ Offset", icon: Clock, format: v => `${v} min` },
      { key: "maxTouchPoints", label: "Touch Points", icon: Smartphone },
    ],
  },
];

function AdvancedDataSection({ rawData }: { rawData: Record<string, any> | null }) {
  const [showJson, setShowJson] = useState(false);

  if (!rawData || Object.keys(rawData).length === 0) return null;

  const renderedKeys = new Set<string>();

  return (
    <div className="mt-3 space-y-3">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">📡 Dados Avançados</p>

      {RAW_DATA_CATEGORIES.map(cat => {
        const items = cat.keys.filter(k => rawData[k.key] != null && rawData[k.key] !== "");
        if (items.length === 0) return null;
        items.forEach(k => renderedKeys.add(k.key));
        return (
          <div key={cat.title}>
            <p className="text-[10px] font-medium text-muted-foreground mb-1">{cat.emoji} {cat.title}</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              {items.map(k => (
                <DetailItem
                  key={k.key}
                  icon={k.icon}
                  label={k.label}
                  value={k.format ? k.format(rawData[k.key]) : String(rawData[k.key])}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Remaining uncategorized keys */}
      {(() => {
        const remaining = Object.keys(rawData).filter(k => !renderedKeys.has(k) && rawData[k] != null && rawData[k] !== "");
        if (remaining.length === 0) return null;
        return (
          <div>
            <p className="text-[10px] font-medium text-muted-foreground mb-1">📎 Outros</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              {remaining.map(k => (
                <DetailItem key={k} icon={FileText} label={k} value={String(rawData[k])} />
              ))}
            </div>
          </div>
        );
      })()}

      {/* JSON viewer toggle */}
      <button
        onClick={() => setShowJson(!showJson)}
        className="flex items-center gap-1.5 text-[10px] font-medium text-primary hover:underline"
      >
        <FileText className="w-3 h-3" />
        {showJson ? "Ocultar JSON completo" : "Ver JSON completo"}
      </button>
      {showJson && (
        <pre className="p-3 rounded-lg bg-muted/50 border border-border text-[10px] text-muted-foreground overflow-auto max-h-64 whitespace-pre-wrap break-all">
          {JSON.stringify(rawData, null, 2)}
        </pre>
      )}
    </div>
  );
}

function formatActionLabel(action: string): string {
  const labels: Record<string, string> = {
    ban_device: "Dispositivo banido",
    unban_device: "Ban desativado",
    reban_device: "Ban reativado",
    delete_ban: "Ban excluído",
    new_device_detected: "🆕 Novo dispositivo detectado",
    rate_limited_login: "⚠️ Login bloqueado por rate limit",
    banned_device_login_blocked: "🚫 Login bloqueado (dispositivo banido)",
  };
  return labels[action] || action;
}

export default AntifraudSection;
