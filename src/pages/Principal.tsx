import { useAuth } from "@/hooks/useAuth";
import { invalidateSiteNameCache, useSiteName } from "@/hooks/useSiteName";
import { invalidateSiteLogoCache } from "@/hooks/useSiteLogo";
import { validatePassword } from "@/lib/passwordValidation";
import { PasswordStrengthMeter } from "@/components/PasswordStrengthMeter";
import { renderTelegramHtml } from "@/components/TextFormatToolbar";
import { PinProtection } from "@/components/PinProtection";
import AdminBankDashboard from "@/components/BankDashboard";
import { SkeletonRow, SkeletonCard, SkeletonPricingGrid } from "@/components/Skeleton";
import BackupSection from "@/components/BackupSection";
import { BroadcastForm } from "@/components/BroadcastForm";
import { BroadcastProgress } from "@/components/BroadcastProgress";
import { AnimatedIcon } from "@/components/AnimatedIcon";
import { FloatingMenuIcon, FloatingGridIcon } from "@/components/FloatingMenuIcon";
import { AnimatedCounter, AnimatedInt } from "@/components/AnimatedCounter";
import { Currency, IntVal, StatusBadge, getStatusLabel, getStatusClasses } from "@/components/ui";
import { PromoBanner } from "@/components/PromoBanner";
import { SaquesSection } from "@/components/SaquesSection";
import { RedesSection } from "@/components/RedesSection";
import { lazy, Suspense } from "react";
const AdminSupport = lazy(() => import("@/pages/AdminSupport"));
import { SupportAdminSelector } from "@/components/SupportAdminSelector";
const AntifraudSection = lazy(() => import("@/components/AntifraudSection"));
const AuditTab = lazy(() => import("@/components/AuditTab"));
const LicenseManagerLazy = lazy(() => import("@/components/LicenseManager"));
import { BannersManager } from "@/components/BannersManager";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "@/components/NotificationBell";
import RealtimeDashboard from "@/components/RealtimeDashboard";
import { MobileBottomNav, NavItem } from "@/components/MobileBottomNav";
import { PollManager } from "@/components/PollManager";
import { ChatRoomManager } from "@/components/ChatRoomManager";
import { VerificationBadge, BADGE_CONFIG, BadgeType } from "@/components/VerificationBadge";
import NetworkCommissionConfig from "@/components/NetworkCommissionConfig";
import { InfoCard } from "@/components/InfoCard";

import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import {
  LogOut, Users, DollarSign, Smartphone, BarChart3, Plus, Search,
  ToggleLeft, ToggleRight, History, Landmark, TrendingUp,
  Wallet, Menu, X, Shield, Eye, Phone, Mail, Calendar, ChevronRight,
  UserCheck, UserX, Hash, Activity, CreditCard, Settings, Save, Loader2,
  Globe, Bot, RefreshCw, Wifi, CheckCircle2, Trash2, AlertTriangle,
  ChevronDown, Link2, EyeOff, Tag, FileText, Copy, Zap, RotateCcw, Clock, HardDrive, Package,
  Upload, Database, Server, Send, Megaphone, MessageCircle,
  Trophy, Check, KeyRound, Banknote, Network, Image, Headphones, User,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllRows } from "@/lib/fetchAll";
import { getLocalDayStartUTC, getLocalMonthStartUTC, toLocalDateKey, getTodayLocalKey, formatDateFullBR, formatTimeBR, formatFullDateTimeBR, getRecargaTime, getRecargaTimeLabel } from "@/lib/timezone";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Dialog, DialogContent, DialogOverlay, DialogPortal } from "@radix-ui/react-dialog";
import { styledToast as toast } from "@/lib/toast";
import { unlockAudio, playCashRegisterSound } from "@/lib/sounds";
import { useNavigate } from "react-router-dom";

import type { Revendedor, RecargaHistorico, PricingRule } from "@/types";
import { useResilientFetch } from "@/hooks/useAsync";
import { useCrud } from "@/hooks/useCrud";
import { confirm } from "@/lib/confirm";
import { safeValor } from "@/lib/utils";
import { useDisabledValues } from "@/hooks/useDisabledValues";

type PrincipalView = "dashboard" | "lista" | "detalhe" | "config-api" | "pagamentos" | "depositos" | "bot" | "geral" | "relatorios" | "ferramentas" | "precificacao" | "broadcast" | "enquetes" | "batepapo" | "saques" | "redes" | "suporte" | "antifraude" | "auditoria" | "licencas";

type ReportPeriod = "hoje" | "7dias" | "mes" | "total";

function TestApiButton() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string; details?: string[] } | null>(null);

  const handleTest = async () => {
    setTesting(true);
    setResult(null);
    const details: string[] = [];
    let allOk = true;
    try {
      // Test catalog
      const { data: catData, error: catError } = await supabase.functions.invoke("recarga-express", {
        body: { action: "catalog" },
      });
      if (catError) throw new Error(catError.message);
      if (catData?.success && catData.data?.length > 0) {
        const ops = catData.data.map((c: any) => `${c.name} (${c.values?.length || 0} valores)`).join(", ");
        details.push(`✅ Catálogo: ${catData.data.length} operadora(s) — ${ops}`);
      } else {
        details.push("❌ Catálogo: Sem operadoras retornadas");
        allOk = false;
      }

      // Test balance
      const { data: balData, error: balError } = await supabase.functions.invoke("recarga-express", {
        body: { action: "balance" },
      });
      if (balError) {
        details.push("❌ Saldo API: Erro ao consultar");
        allOk = false;
      } else if (balData?.success) {
        const bal = balData.data?.balance ?? balData.data?.value ?? balData.data;
        details.push(`✅ Saldo na API: R$ ${typeof bal === "number" ? bal.toFixed(2) : JSON.stringify(bal)}`);
      } else {
        details.push(`⚠️ Saldo API: ${balData?.error || "Resposta inesperada"}`);
      }

      setResult({ ok: allOk, message: allOk ? "✅ API sincronizada com sucesso!" : "⚠️ Há problemas na sincronização", details });
    } catch (err: any) {
      setResult({ ok: false, message: `❌ Falha na conexão: ${err.message}`, details });
    }
    setTesting(false);
  };

  return (
    <div className="space-y-2">
      <button onClick={handleTest} disabled={testing}
        className="w-full py-2.5 rounded-lg border border-primary/30 text-primary font-semibold text-sm hover:bg-primary/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
        {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
        {testing ? "Testando..." : "Testar Sincronização"}
      </button>
      {result && (
        <div className={`rounded-lg p-3 text-sm space-y-1 ${result.ok ? "bg-success/10 text-success border border-success/20" : "bg-destructive/10 text-destructive border border-destructive/20"}`}>
          <p className="font-medium">{result.message}</p>
          {result.details?.map((d, i) => <p key={i} className="text-xs opacity-90">{d}</p>)}
        </div>
      )}
    </div>
  );
}

function TestConsultaButton({ url, apiKey }: { url: string; apiKey: string }) {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const handleTest = async () => {
    if (!url || !apiKey) {
      setResult({ ok: false, message: "❌ URL e API Key são obrigatórios" });
      return;
    }
    setTesting(true);
    setResult(null);
    try {
      // Route through edge function to avoid CORS
      const { data, error } = await supabase.functions.invoke("recarga-express", {
        body: { action: "check-phone", phoneNumber: "11999999999" },
      });
      if (error) throw new Error(error.message);
      if (data?.success && data.data) {
        const op = data.data.carrier?.name || data.data.operator || "detectada";
        setResult({ ok: true, message: `✅ API de consulta OK! Operadora: "${op}"` });
      } else if (data?.success === false) {
        // API responded but phone not found - still means connection works
        setResult({ ok: true, message: `✅ Conexão com API OK! (telefone teste não encontrado, mas API respondeu)` });
      } else {
        setResult({ ok: false, message: `❌ Erro: ${data?.error || data?.message || "Resposta inválida"}` });
      }
    } catch (err: any) {
      setResult({ ok: false, message: `❌ Falha: ${err.message}` });
    }
    setTesting(false);
  };

  return (
    <div className="space-y-2">
      <button onClick={handleTest} disabled={testing}
        className="w-full py-2.5 rounded-lg border border-primary/30 text-primary font-semibold text-sm hover:bg-primary/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
        {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
        {testing ? "Testando..." : "Testar Consulta"}
      </button>
      {result && (
        <div className={`rounded-lg p-3 text-sm ${result.ok ? "bg-success/10 text-success border border-success/20" : "bg-destructive/10 text-destructive border border-destructive/20"}`}>
          <p className="font-medium">{result.message}</p>
        </div>
      )}
    </div>
  );
}

const LISTEN_TO_TYPES: ("deposit" | "recarga" | "new_user")[] = ["deposit", "recarga", "new_user"];

export default function Principal() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const siteName = useSiteName();
  const { isDisabled: isValueDisabled, toggle: toggleDisabledValue } = useDisabledValues();

  // Notifications handled by NotificationBell component
  const [revendedores, setRevendedores] = useState<Revendedor[]>([]);
  const memoizedRevendedores = useMemo(() => revendedores.map(r => ({ id: r.id, nome: r.nome, email: r.email })), [revendedores]);
  const { loading, runFetch } = useResilientFetch();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"todos" | "admin" | "revendedor" | "cliente" | "usuario" | "sem_role">("todos");
  const [menuOpen, setMenuOpen] = useState(false);
  const [myAvatarUrl, setMyAvatarUrl] = useState<string | null>(null);
  const [view, setView] = useState<PrincipalView>("dashboard");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSaldoModal, setShowSaldoModal] = useState<Revendedor | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState<Revendedor | null>(null);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showAdminSubMenu, setShowAdminSubMenu] = useState(false);
  const [changingRole, setChangingRole] = useState(false);
  const [showBadgeDropdown, setShowBadgeDropdown] = useState(false);

  // Broadcast state - restore from localStorage if a broadcast was running
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [broadcastProgressId, setBroadcastProgressId] = useState<string | null>(() => {
    try { return localStorage.getItem('broadcast_progress_id'); } catch { return null; }
  });
  const [broadcastTitle, setBroadcastTitle] = useState(() => {
    try { return localStorage.getItem('broadcast_title') || ''; } catch { return ''; }
  });
  const [broadcastUserCount, setBroadcastUserCount] = useState(0);
  const [broadcastBlockedCount, setBroadcastBlockedCount] = useState(0);
  const [broadcastHistory, setBroadcastHistory] = useState<any[]>([]);
  const [interruptedBroadcasts, setInterruptedBroadcasts] = useState<any[]>([]);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  const [selectedRev, setSelectedRev] = useState<Revendedor | null>(null);
  const [revRecargas, setRevRecargas] = useState<RecargaHistorico[]>([]);
  const [revTransactions, setRevTransactions] = useState<{ id: string; amount: number; created_at: string; status: string; type: string; payment_id?: string | null; metadata?: any }[]>([]);
  const [expandedDepositId, setExpandedDepositId] = useState<string | null>(null);
  const [revLoading, setRevLoading] = useState(false);
  const [revGatewayConfig, setRevGatewayConfig] = useState<Record<string, string>>({});
  const [revGatewayLoading, setRevGatewayLoading] = useState(false);
  const [revPricingRules, setRevPricingRules] = useState<{ operadora_id: string; valor_recarga: number; regra_valor: number }[]>([]);
  const [revDetailPricingRules, setRevDetailPricingRules] = useState<PricingRule[]>([]);
  const [revDetailPricingOp, setRevDetailPricingOp] = useState<string>("");
  const [revDetailPricingOpen, setRevDetailPricingOpen] = useState(false);
  const [revRecSearch, setRevRecSearch] = useState("");
  const [reportSearch, setReportSearch] = useState("");

  // All recargas for counting
  const [allRecargas, setAllRecargas] = useState<RecargaHistorico[]>([]);
  const [allUsers, setAllUsers] = useState<{ id: string; active: boolean; created_at: string }[]>([]);
  const [meuSaldo, setMeuSaldo] = useState(0);
  const [globalTxDeposited, setGlobalTxDeposited] = useState(0);
  const [globalTxCount, setGlobalTxCount] = useState(0);
  const [showLucroModal, setShowLucroModal] = useState(false);

  // Report state
  const [reportData, setReportData] = useState<{ user_id: string; nome: string | null; email: string | null; totalRecargas: number; totalValor: number; totalVendas: number; totalCusto: number; lucro: number }[]>([]);
  const [reportLoading, setReportLoading] = useState(false);
  const reportLoaded = useRef(false);
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>("mes");
  const [reportPage, setReportPage] = useState(0);
  const REPORT_PER_PAGE = 15;

  // All recargas list state (Todas as Recargas section)
  const [allRecargasList, setAllRecargasList] = useState<any[]>([]);
  const [allRecargasLoading, setAllRecargasLoading] = useState(false);
  const allRecargasLoaded = useRef(false);
  const [allRecargasStatusFilter, setAllRecargasStatusFilter] = useState<"all" | "completed" | "pending" | "falha">("all");
  const [allRecargasSearch, setAllRecargasSearch] = useState("");
  const [allRecargasPage, setAllRecargasPage] = useState(0);
  const ALL_RECARGAS_PER_PAGE = 20;
  const [refundingId, setRefundingId] = useState<string | null>(null);

  const handleRefundRecarga = useCallback(async (recarga: any) => {
    const custoToRefund = Number(recarga.custo) || 0;
    if (custoToRefund <= 0) { toast.error("Sem valor cobrado para estornar"); return; }
    const ok = await confirm(
      `Devolver ${fmt(custoToRefund)} para o saldo do usuário ${recarga.user_nome || ""}?\n\nTelefone: ${recarga.telefone}\nOperadora: ${(recarga.operadora || "").toUpperCase()}\nValor Recarga: ${fmt(Number(recarga.valor))}`,
      { title: "Estornar recarga?", confirmText: "Estornar" },
    );
    if (!ok) return;
    setRefundingId(recarga.id);
    try {
      // 1. Credit balance back
      const { error: rpcErr } = await supabase.rpc("increment_saldo", {
        p_user_id: recarga.user_id,
        p_tipo: "revenda",
        p_amount: custoToRefund,
      });
      if (rpcErr) throw rpcErr;
      // 2. Mark recarga as refunded (status = 'estornada')
      const { error: upErr } = await supabase.from("recargas").update({ status: "estornada" }).eq("id", recarga.id);
      if (upErr) throw upErr;
      // 3. Audit log
      await supabase.from("audit_logs").insert({
        admin_id: user?.id || "",
        action: "refund_recarga",
        target_type: "recarga",
        target_id: recarga.id,
        details: {
          user_id: recarga.user_id,
          user_nome: recarga.user_nome,
          valor_recarga: recarga.valor,
          custo_estornado: custoToRefund,
          custo_api: recarga.custo_api,
          operadora: recarga.operadora,
          telefone: recarga.telefone,
        },
      });
      toast.success(`Estorno de ${fmt(custoToRefund)} realizado com sucesso!`);
      // Refresh list
      setAllRecargasList(prev => prev.map(r => r.id === recarga.id ? { ...r, status: "estornada" } : r));
    } catch (err: any) {
      console.error("Refund error:", err);
      toast.error("Erro ao estornar: " + (err.message || ""));
    } finally {
      setRefundingId(null);
    }
  }, [user?.id]);

  // Config API states
  const [apiConfig, setApiConfig] = useState<Record<string, string>>({});
  const [configLoading, setConfigLoading] = useState(false);
  const configLoaded = useRef(false);
  const [configSaving, setConfigSaving] = useState(false);

  // Global config states (Pagamentos, Depósitos, Bot, Geral)
  const [globalConfig, setGlobalConfig] = useState<Record<string, string>>({});
  const [globalConfigLoading, setGlobalConfigLoading] = useState(true);
  const globalConfigLoaded = useRef(false);
  const [globalConfigSaving, setGlobalConfigSaving] = useState(false);
  const [showMaintenanceDialog, setShowMaintenanceDialog] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [configSection, setConfigSection] = useState<"geral" | "rede" | "jogos" | "notificacoes" | "banners">("geral");
  const MASTER_ADMIN_ID = globalConfig.masterAdminId || "f5501acc-79f3-460f-bc3e-493280ea84f0";
  const isMasterAdmin = user?.id === MASTER_ADMIN_ID;
  const isTargetMaster = (targetId: string) => targetId === MASTER_ADMIN_ID && !isMasterAdmin;

  // Bot status
  const [botStatus, setBotStatus] = useState<{
    connected: boolean; loading: boolean; botName: string | null; botUsername: string | null;
    botId: string | null; error: string | null; webhookUrl: string | null; webhookError: string | null;
    webhookErrorAt: number | null; pendingUpdates: number | null; lastSyncAt: number | null;
  }>({
    connected: false,
    loading: false,
    botName: null,
    botUsername: null,
    botId: null,
    error: null,
    webhookUrl: null,
    webhookError: null,
    webhookErrorAt: null,
    pendingUpdates: null,
    lastSyncAt: null,
  });
  const botRefreshInFlightRef = useRef(false);
  const botIdentityChecksRef = useRef(0);
  const botPendingUpdatesRef = useRef<number | null>(null);
  const [botPollIntervalMs, setBotPollIntervalMs] = useState(5000);
  const [tokenSectionOpen, setTokenSectionOpen] = useState(false);
  const [validatingToken, setValidatingToken] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showMpKeyProd, setShowMpKeyProd] = useState(false);
  const [showMpKeyTest, setShowMpKeyTest] = useState(false);
  const [showVpSecret, setShowVpSecret] = useState(false);
  const [showPpToken, setShowPpToken] = useState(false);
  const [pixGoTab, setPixGoTab] = useState<"credenciais" | "config">("credenciais");
  const [pixGoTesting, setPixGoTesting] = useState(false);
  const [pixGoStatus, setPixGoStatus] = useState<"idle" | "ok" | "error">("idle");
  const [providerBalance, setProviderBalance] = useState<{ value: number | null; loading: boolean; error: boolean }>({ value: null, loading: false, error: false });
  const [lowBalancePage, setLowBalancePage] = useState(1);

  // Pricing rules state
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [pricingOps, setPricingOps] = useState<{ id: string; nome: string; valores: number[]; ativo: boolean }[]>([]);
  const [pricingSelectedOp, setPricingSelectedOp] = useState<string>("");
  const [pricingSaving, setPricingSaving] = useState<Record<string, boolean>>({});
  const [pricingLoading, setPricingLoading] = useState(false);
  const pricingLoaded = useRef(false);
  const [pricingTab, setPricingTab] = useState<"global" | "revendedor">("global");

  // Reseller pricing state
  const [resellerPricingRules, setResellerPricingRules] = useState<PricingRule[]>([]);
  const [resellerPricingSelectedUser, setResellerPricingSelectedUser] = useState<string>("");
  const [resellerPricingSelectedOp, setResellerPricingSelectedOp] = useState<string>("");
  const [resellerPricingSaving, setResellerPricingSaving] = useState<Record<string, boolean>>({});

  const configKeys = ["apiBaseURL", "apiKey", "margemLucro", "alertaSaldoBaixo", "consultaOperadoraURL", "consultaOperadoraKey"];

  const fetchApiConfig = useCallback(async () => {
    if (!configLoaded.current) setConfigLoading(true);
    try {
      const { data, error } = await supabase.from("system_config").select("key, value").in("key", configKeys);
      if (error) throw error;
      const map: Record<string, string> = {};
      (data || []).forEach(d => { map[d.key] = d.value || ""; });
      setApiConfig(map);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar configurações");
    }
    configLoaded.current = true;
    setConfigLoading(false);
  }, []);

  const fetchGlobalConfig = useCallback(async () => {
    if (!globalConfigLoaded.current) setGlobalConfigLoading(true);
    try {
      // Load system_config (global settings)
      const { data, error } = await supabase.from("system_config").select("key, value");
      if (error) throw error;
      const map: Record<string, string> = {};
      (data || []).forEach(d => { map[d.key] = d.value || ""; });

      // telegramBotToken já vem do system_config acima, não precisa ler do profiles

      setGlobalConfig(map);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar configurações");
    }
    globalConfigLoaded.current = true;
    setGlobalConfigLoading(false);
  }, [user?.id]);

  const saveGlobalConfig = async () => {
    setGlobalConfigSaving(true);
    try {
      for (const [key, value] of Object.entries(globalConfig)) {
        await supabase.from("system_config").upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
      }
      // Invalidate branding caches so all components refresh immediately
      invalidateSiteNameCache();
      invalidateSiteLogoCache();
      window.dispatchEvent(new Event("site-branding-updated"));
      toast.success("Configurações salvas com sucesso!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar");
    }
    setGlobalConfigSaving(false);
  };

  const saveApiConfig = async () => {
    setConfigSaving(true);
    try {
      for (const key of configKeys) {
        const value = apiConfig[key] || "";
        await supabase.from("system_config").upsert({ key, value }, { onConflict: "key" });
      }
      toast.success("Configurações salvas com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar configurações");
    }
    setConfigSaving(false);
  };

  const pricingSynced = useRef(false);

  const fetchPricingData = useCallback(async () => {
    const t0 = performance.now();
    if (!pricingLoaded.current) setPricingLoading(true);
    try {
      // 1. Fetch catalog from API to sync operadoras (only once per session)
      if (pricingSynced.current) {
        console.log("[Principal] fetchPricingData: skipping API sync (already synced)");
      }
      const { data: catData, error: catError } = pricingSynced.current
        ? { data: null, error: null }
        : await supabase.functions.invoke("recarga-express", { body: { action: "catalog" } });

      if (!catError && catData?.success && catData.data?.length > 0) {
        // Sync each carrier from API into operadoras table + update costs in pricing_rules
        for (const carrier of catData.data) {
          const nome = carrier.name || carrier.carrierId;
          const values = carrier.values || [];
          const valores = values.map((v: any) => v.value || v.cost).filter((v: number) => v > 0);
          // Upsert operadora by nome
          const { data: existing } = await supabase.from("operadoras").select("id").eq("nome", nome).maybeSingle();
          let opId: string;
          if (existing) {
            await supabase.from("operadoras").update({ valores, ativo: true }).eq("id", existing.id);
            opId = existing.id;
          } else {
            const { data: inserted } = await supabase.from("operadoras").insert({ nome, valores, ativo: true }).select("id").single();
            opId = inserted?.id || "";
          }
          // Sync API costs into pricing_rules (always update custo from API)
          if (opId) {
            const apiValores = new Set<number>();
            for (const v of values) {
              const faceValue = v.value || v.cost;
              const apiCost = v.cost || 0;
              if (faceValue > 0 && apiCost > 0) {
                apiValores.add(Number(faceValue));
                const { data: existingRule } = await supabase.from("pricing_rules")
                  .select("id, custo, regra_valor")
                  .eq("operadora_id", opId)
                  .eq("valor_recarga", faceValue)
                  .maybeSingle();
                if (existingRule) {
                  // Always update custo from API to keep prices in sync
                  if (Number(existingRule.custo) !== Number(apiCost)) {
                    await supabase.from("pricing_rules").update({ custo: apiCost }).eq("id", existingRule.id);
                    console.log(`[Sync] Custo atualizado: ${nome} R$${faceValue} → custo API R$${apiCost}`);
                  }
                } else {
                  // Create rule with API cost
                  await supabase.from("pricing_rules").insert({
                    operadora_id: opId,
                    valor_recarga: faceValue,
                    custo: apiCost,
                    tipo_regra: "fixo",
                    regra_valor: 0,
                  });
                }
              }
            }

            // Orphan pricing_rules: keep them so admin customizations are preserved
            // When the value returns to the API, the existing rule (with custom pricing) will be reused
            const { data: existingRules } = await supabase.from("pricing_rules")
              .select("id, valor_recarga")
              .eq("operadora_id", opId);
            if (existingRules) {
              for (const rule of existingRules) {
                if (!apiValores.has(Number(rule.valor_recarga))) {
                  console.log(`[Sync] Regra órfã preservada: ${nome} R$${rule.valor_recarga}`);
                }
              }
            }

            // Sync disabled_recharge_values: auto-disable removed values, re-enable returned values
            const { data: prevOp } = await supabase.from("operadoras").select("valores").eq("id", opId).maybeSingle();
            const prevValores = new Set<number>((prevOp?.valores as number[] || []).map(Number));
            // Values that were local but removed from API → auto-disable
            for (const pv of prevValores) {
              if (!apiValores.has(pv)) {
                const { data: alreadyDisabled } = await (supabase.from("disabled_recharge_values" as any) as any)
                  .select("id")
                  .eq("operadora_id", opId)
                  .eq("valor", pv)
                  .maybeSingle();
                if (!alreadyDisabled) {
                  await (supabase.from("disabled_recharge_values" as any) as any)
                    .insert({ operadora_id: opId, valor: pv, disabled_by: user?.id || "" });
                  console.log(`[Sync] Valor auto-desativado: ${nome} R$${pv} (removido da API)`);
                }
              }
            }
            // Values that returned to API → re-enable (remove from disabled)
            for (const av of apiValores) {
              await (supabase.from("disabled_recharge_values" as any) as any)
                .delete()
                .eq("operadora_id", opId)
                .eq("valor", av);
            }
          }
        }
        // Deactivate local operadoras that are NOT in the API catalog
        const apiNames = catData.data.map((c: any) => (c.name || c.carrierId)?.toLowerCase?.());
        const { data: allLocalOps } = await supabase.from("operadoras").select("id, nome").eq("ativo", true);
        if (allLocalOps) {
          for (const localOp of allLocalOps) {
            if (!apiNames.includes(localOp.nome?.toLowerCase?.())) {
              await supabase.from("operadoras").update({ ativo: false, updated_at: new Date().toISOString() }).eq("id", localOp.id);
              console.log(`[Sync] Operadora "${localOp.nome}" desativada (ausente no catálogo da API)`);
            }
          }
        }

        toast.success(`${catData.data.length} operadora(s) sincronizadas da API!`);
      }

      // 2. Now fetch from DB (synced)
      const [{ data: ops }, { data: rules }] = await Promise.all([
        supabase.from("operadoras").select("*").eq("ativo", true).order("nome"),
        supabase.from("pricing_rules").select("*"),
      ]);
      setPricingOps((ops || []).map((o: any) => ({ ...o, valores: Array.isArray(o.valores) ? o.valores.map((v: any) => Number(v)) : [] })));
      setPricingRules((rules || []).map((r: any) => ({ ...r, valor_recarga: Number(r.valor_recarga), custo: Number(r.custo), regra_valor: Number(r.regra_valor), tipo_regra: r.tipo_regra as "fixo" | "margem" })));
      pricingSynced.current = true;
    } catch (err) { console.error(err); toast.error("Erro ao carregar precificação"); }
    pricingLoaded.current = true;
    setPricingLoading(false);
    console.log(`[Principal] fetchPricingData completed in ${(performance.now() - t0).toFixed(0)}ms`);
  }, []);

  const savePricingRule = async (rule: PricingRule) => {
    const key = `${rule.operadora_id}-${rule.valor_recarga}`;
    setPricingSaving(prev => ({ ...prev, [key]: true }));
    try {
      const { error } = await supabase.from("pricing_rules").upsert({
        operadora_id: rule.operadora_id,
        valor_recarga: rule.valor_recarga,
        custo: rule.custo,
        tipo_regra: rule.tipo_regra,
        regra_valor: rule.regra_valor,
        updated_at: new Date().toISOString(),
      }, { onConflict: "operadora_id,valor_recarga" });
      if (error) throw error;
      toast.success(`Regra para R$ ${rule.valor_recarga.toFixed(2)} salva!`);
      fetchPricingData();
    } catch (err: any) { toast.error(err.message || "Erro ao salvar regra"); }
    setPricingSaving(prev => ({ ...prev, [key]: false }));
  };

  const { remove: removePricingRule } = useCrud("pricing_rules", { onRefresh: fetchPricingData, messages: { deleted: "Regra removida" } });
  const resetPricingRule = async (operadora_id: string, valor_recarga: number) => {
    const existing = pricingRules.find(r => r.operadora_id === operadora_id && Number(r.valor_recarga) === Number(valor_recarga));
    if (!existing?.id) return;
    await removePricingRule(existing.id);
  };

  const fetchResellerPricingRules = useCallback(async (userId: string) => {
    try {
      const { data } = await (supabase.from("reseller_base_pricing_rules" as any) as any).select("*").eq("user_id", userId);
      const mapped = (data || []).map((r: any) => ({ ...r, valor_recarga: Number(r.valor_recarga), custo: Number(r.custo), regra_valor: Number(r.regra_valor), tipo_regra: r.tipo_regra as "fixo" | "margem" }));
      setResellerPricingRules(mapped);
      setRevDetailPricingRules(mapped);
    } catch (err) { console.error(err); }
  }, []);

  const saveResellerPricingRule = async (userId: string, rule: PricingRule) => {
    const key = `r-${rule.operadora_id}-${rule.valor_recarga}`;
    setResellerPricingSaving(prev => ({ ...prev, [key]: true }));
    try {
      const { error } = await (supabase.from("reseller_base_pricing_rules" as any) as any).upsert({
        user_id: userId,
        operadora_id: rule.operadora_id,
        valor_recarga: rule.valor_recarga,
        custo: rule.custo,
        tipo_regra: rule.tipo_regra,
        regra_valor: rule.regra_valor,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,operadora_id,valor_recarga" });
      if (error) throw error;
      toast.success(`Preço base para R$ ${rule.valor_recarga.toFixed(2)} salvo!`);
      fetchResellerPricingRules(userId);
    } catch (err: any) { toast.error(err.message || "Erro ao salvar"); }
    setResellerPricingSaving(prev => ({ ...prev, [key]: false }));
  };

  const resetResellerPricingRule = async (userId: string, operadora_id: string, valor_recarga: number) => {
    const existing = resellerPricingRules.find(r => r.operadora_id === operadora_id && Number(r.valor_recarga) === Number(valor_recarga))
      || revDetailPricingRules.find(r => r.operadora_id === operadora_id && Number(r.valor_recarga) === Number(valor_recarga));
    if (!existing?.id) return;
    try {
      await (supabase.from("reseller_base_pricing_rules" as any) as any).delete().eq("id", existing.id);
      const filter = (rules: PricingRule[]) => rules.filter(r => r.id !== existing.id);
      setResellerPricingRules(prev => filter(prev));
      setRevDetailPricingRules(prev => filter(prev));
      toast.success("Preço base removido (usará preço global)");
    } catch (err: any) { toast.error(err.message || "Erro"); }
  };

  const fetchTelegramJson = useCallback(async (url: string, timeoutMs = 5000) => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
      const resp = await fetch(url, { signal: controller.signal });
      return await resp.json();
    } finally {
      window.clearTimeout(timeoutId);
    }
  }, []);

  const refreshBotStatus = useCallback(async (token?: string, options?: { silent?: boolean }) => {
    const tkn = token || globalConfig.telegramBotToken;
    if (!tkn) return;
    if (options?.silent && botRefreshInFlightRef.current) return;

    botRefreshInFlightRef.current = true;
    if (!options?.silent) setBotStatus(prev => ({ ...prev, loading: true }));

    try {
      const shouldRefreshIdentity = !options?.silent || !botStatus.botId || botIdentityChecksRef.current >= 6;

      const [whData, meData] = await Promise.all([
        fetchTelegramJson(`https://api.telegram.org/bot${tkn}/getWebhookInfo`, 5000),
        shouldRefreshIdentity
          ? fetchTelegramJson(`https://api.telegram.org/bot${tkn}/getMe`, 5000)
          : Promise.resolve(null),
      ]);

      if (meData && !meData.ok) {
        setBotStatus({
          connected: false,
          loading: false,
          botName: null,
          botUsername: null,
          botId: null,
          error: meData.description,
          webhookUrl: null,
          webhookError: null,
          webhookErrorAt: null,
          pendingUpdates: null,
          lastSyncAt: Date.now(),
        });
        return;
      }

      if (meData?.ok) botIdentityChecksRef.current = 0;
      else botIdentityChecksRef.current += 1;

      if (!whData?.ok) {
        throw new Error(whData?.description || "Falha ao consultar webhook");
      }

      const webhookErrorAt = whData.result?.last_error_date
        ? Number(whData.result.last_error_date) * 1000
        : null;

      setBotStatus(prev => ({
        connected: true,
        loading: false,
        botName: meData?.result?.first_name || prev.botName,
        botUsername: meData?.result?.username || prev.botUsername,
        botId: meData?.result?.id ? String(meData.result.id) : prev.botId,
        error: null,
        webhookUrl: whData.result?.url || null,
        webhookError: whData.result?.last_error_message || null,
        webhookErrorAt,
        pendingUpdates: whData.result?.pending_update_count ?? null,
        lastSyncAt: Date.now(),
      }));
    } catch (err: any) {
      if (!options?.silent) {
        setBotStatus({
          connected: false,
          loading: false,
          botName: null,
          botUsername: null,
          botId: null,
          error: err?.message || "Erro de conexão",
          webhookUrl: null,
          webhookError: null,
          webhookErrorAt: null,
          pendingUpdates: null,
          lastSyncAt: Date.now(),
        });
      } else {
        setBotStatus(prev => ({ ...prev, loading: false, lastSyncAt: Date.now() }));
      }
    } finally {
      botRefreshInFlightRef.current = false;
    }
  }, [botStatus.botId, fetchTelegramJson, globalConfig.telegramBotToken]);

  const analyticsLoaded = useRef(false);

  const dataFetchInFlightRef = useRef(false);

  // Light load: profiles, roles, saldos only
  const fetchData = useCallback(async () => {
    if (dataFetchInFlightRef.current) return;
    dataFetchInFlightRef.current = true;
    const t0 = performance.now();
    try {
      await runFetch(async () => {
        const [roles, profiles, saldos] = await Promise.all([
          fetchAllRows("user_roles", { select: "user_id, role" }),
          fetchAllRows("profiles", { select: "id, nome, email, active, created_at, telegram_username, whatsapp_number, avatar_url, verification_badge" }),
          fetchAllRows("saldos", { select: "user_id, valor", filters: (q: any) => q.eq("tipo", "revenda") }),
        ]);

        setAllUsers((profiles || []).map(p => ({ id: p.id, active: p.active, created_at: p.created_at })));

        const roleMap: Record<string, string> = {};
        const hasRevendedorRole: Record<string, boolean> = {};
        (roles || []).forEach(r => {
          const current = roleMap[r.user_id];
          if (!current || r.role === "admin") roleMap[r.user_id] = r.role;
          if (r.role === "revendedor") hasRevendedorRole[r.user_id] = true;
        });

        const saldoMap: Record<string, number> = {};
        saldos?.forEach(s => { saldoMap[s.user_id] = Number(s.valor); });

        const list: Revendedor[] = (profiles || []).map(p => {
          const raw = String(roleMap[p.id] || "").toLowerCase();
          const resolvedRole: Revendedor["role"] =
            raw === "user" ? "usuario" :
            (["admin", "revendedor", "cliente", "usuario"].includes(raw) ? raw as Revendedor["role"] : "sem_role");
          return {
            id: p.id, nome: p.nome, email: p.email, active: p.active, created_at: p.created_at,
            saldo: saldoMap[p.id] ?? 0, telefone: p.whatsapp_number || null,
            telegram_username: p.telegram_username, whatsapp_number: p.whatsapp_number,
            isRevendedor: !!hasRevendedorRole[p.id],
            role: resolvedRole,
            avatar_url: p.avatar_url || null,
            verification_badge: (p as any).verification_badge || null,
          };
        });

        setRevendedores(list);

        // Fetch meuSaldo (admin's own balance)
        if (user?.id) {
          const { data: mySaldo } = await supabase.from("saldos").select("valor").eq("user_id", user.id).eq("tipo", "revenda").maybeSingle();
          setMeuSaldo(Number(mySaldo?.valor || 0));
        }

        console.log(`[Principal] fetchData completed in ${(performance.now() - t0).toFixed(0)}ms, ${list.length} users`);
      });
    } finally {
      dataFetchInFlightRef.current = false;
    }
  }, [runFetch, user?.id]);

  // Heavy load: recargas + transactions (deferred)
  const fetchAnalytics = useCallback(async () => {
    if (analyticsLoaded.current) return;
    analyticsLoaded.current = true;
    const t0 = performance.now();
    try {
      const [recData, txRows] = await Promise.all([
        fetchAllRows("recargas", { select: "id, telefone, operadora, valor, custo, custo_api, status, created_at, completed_at, user_id", orderBy: { column: "created_at", ascending: false } }),
        fetchAllRows("transactions", {
          select: "amount, status, type",
          filters: (q: any) => q.eq("status", "completed").eq("type", "deposit"),
        }),
      ]);
      setAllRecargas((recData || []).map(r => ({ ...r, valor: Number(r.valor), custo: Number(r.custo), custo_api: Number(r.custo_api || 0) })));
      const deposited = (txRows || []).reduce((s: number, t: any) => s + Number(t.amount), 0);
      setGlobalTxDeposited(deposited);
      setGlobalTxCount((txRows || []).length);
      console.log(`[Principal] fetchAnalytics completed in ${(performance.now() - t0).toFixed(0)}ms, ${recData?.length || 0} recargas`);
    } catch (err) {
      console.error("fetchAnalytics error:", err);
      analyticsLoaded.current = false;
    }
  }, []);

  const fetchRevDetail = useCallback(async (rev: Revendedor) => {
    setRevLoading(true);
    try {
      const [{ data: recData }, { data: transData }, { data: rpRules }, { data: baseRules }] = await Promise.all([
        supabase.from("recargas").select("*").eq("user_id", rev.id).order("created_at", { ascending: false }).limit(100),
        supabase.from("transactions").select("id, amount, created_at, status, type, payment_id, metadata").eq("user_id", rev.id).order("created_at", { ascending: false }).limit(100),
        supabase.from("reseller_pricing_rules").select("*").eq("user_id", rev.id),
        (supabase.from("reseller_base_pricing_rules" as any) as any).select("*").eq("user_id", rev.id),
      ]);
      setRevRecargas((recData || []).map(r => ({ ...r, valor: Number(r.valor), custo: Number(r.custo) })));
      setRevTransactions((transData || []).map(t => ({ ...t, amount: Number(t.amount) })));
      setRevPricingRules((rpRules || []).map(r => ({ operadora_id: r.operadora_id, valor_recarga: Number(r.valor_recarga), regra_valor: Number(r.regra_valor) })));
      setRevDetailPricingRules(((baseRules || []) as any[]).map((r: any) => ({ ...r, valor_recarga: Number(r.valor_recarga), custo: Number(r.custo), regra_valor: Number(r.regra_valor), tipo_regra: r.tipo_regra as "fixo" | "margem" })));
    } catch (err) { console.error(err); }
    setRevLoading(false);
  }, []);

  const fetchRevGateway = useCallback(async (userId: string) => {
    setRevGatewayLoading(true);
    try {
      const { data } = await supabase.from("reseller_config").select("key, value").eq("user_id", userId);
      const map: Record<string, string> = {};
      (data || []).forEach(d => { map[d.key] = d.value || ""; });
      setRevGatewayConfig(map);
    } catch (err) { console.error(err); }
    setRevGatewayLoading(false);
  }, []);

  // Load current user's avatar
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const { data, error } = await supabase.from("profiles").select("avatar_url").eq("id", user.id).maybeSingle();
        if (!error && data?.avatar_url) setMyAvatarUrl(data.avatar_url);
      } catch (e) { console.error("Failed to load avatar:", e); }
    })();
  }, [user?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);
  // Load analytics after profiles are ready (deferred)
  useEffect(() => { if (revendedores.length > 0) fetchAnalytics(); }, [revendedores.length, fetchAnalytics]);

  // Realtime: atualiza usuários automaticamente (throttled to prevent flickering)
  useEffect(() => {
    let dataTimer: ReturnType<typeof setTimeout> | null = null;
    let analyticsTimer: ReturnType<typeof setTimeout> | null = null;
    let lastDataFetch = 0;
    let lastAnalyticsFetch = 0;
    const THROTTLE_DATA = 30000; // 30s minimum between data refreshes
    const THROTTLE_ANALYTICS = 30000; // 30s minimum between analytics refreshes

    const throttledFetchData = () => {
      if (dataFetchInFlightRef.current) return;
      const now = Date.now();
      const elapsed = now - lastDataFetch;
      if (dataTimer) clearTimeout(dataTimer);
      const delay = Math.max(THROTTLE_DATA - elapsed, 5000);
      dataTimer = setTimeout(() => { lastDataFetch = Date.now(); fetchData(); }, delay);
    };
    const throttledFetchAnalytics = () => {
      const now = Date.now();
      const elapsed = now - lastAnalyticsFetch;
      if (analyticsTimer) clearTimeout(analyticsTimer);
      const delay = Math.max(THROTTLE_ANALYTICS - elapsed, 5000);
      analyticsTimer = setTimeout(() => { lastAnalyticsFetch = Date.now(); analyticsLoaded.current = false; fetchAnalytics(); }, delay);
    };
    const channel = supabase.channel('principal-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, throttledFetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'saldos' }, throttledFetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_roles' }, throttledFetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'recargas' }, throttledFetchAnalytics)
      .subscribe();
    return () => {
      if (dataTimer) clearTimeout(dataTimer);
      if (analyticsTimer) clearTimeout(analyticsTimer);
      supabase.removeChannel(channel);
    };
  }, [fetchData, fetchAnalytics]);

  // Sincroniza selectedRev com a lista atualizada
  useEffect(() => {
    if (selectedRev) {
      const updated = revendedores.find(r => r.id === selectedRev.id);
      if (updated) setSelectedRev(updated);
    }
  }, [revendedores]);

  // Fetch provider (API) balance
  const fetchProviderBalance = useCallback(async () => {
    // Ensure we have a valid session before calling edge function
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session?.access_token) {
      setProviderBalance({ value: null, loading: false, error: true });
      return;
    }
    setProviderBalance(prev => ({ ...prev, loading: true, error: false }));
    try {
      const { data, error } = await supabase.functions.invoke("recarga-express", {
        body: { action: "balance" },
      });
      if (error) throw error;
      if (data?.success) {
        const bal = data.data?.balance ?? data.data?.value ?? data.data;
        setProviderBalance({ value: typeof bal === "number" ? bal : null, loading: false, error: false });
      } else {
        setProviderBalance({ value: null, loading: false, error: true });
      }
    } catch {
      setProviderBalance({ value: null, loading: false, error: true });
    }
  }, []);

  useEffect(() => {
    if (user) fetchProviderBalance();
  }, [user, fetchProviderBalance]);

  const openRevDetail = (rev: Revendedor) => {
    setSelectedRev(rev);
    setView("detalhe");
    fetchRevDetail(rev);
    fetchRevGateway(rev.id);
    setMenuOpen(false);
    setRevRecSearch("");
  };

  const revAnalytics = useMemo(() => {
    if (!selectedRev) return null;
    const completedRecs = revRecargas.filter(r => r.status === "completed");
    const totalVendas = revRecargas.reduce((s, r) => s + r.valor, 0);
    const totalCusto = revRecargas.reduce((s, r) => s + r.custo, 0);
    const totalDeposited = revTransactions.filter(t => t.status === "completed" && t.type === "deposit").reduce((s, t) => s + t.amount, 0);
    const totalRec = revRecargas.length;
    const successRec = completedRecs.length;
    const pendingRec = revRecargas.filter(r => r.status === "pending").length;

    // Lucro do revendedor: diferença entre o que ele cobra dos clientes (regra_valor) e o que ele paga ao sistema (valor)
    // Para cada recarga concluída, buscar a regra correspondente
    let lucroRevenda = 0;
    for (const rec of completedRecs) {
      // Find matching reseller pricing rule by valor_recarga
      const rule = revPricingRules.find(rp => Number(rp.valor_recarga) === Number(rec.valor));
      if (rule) {
        // regra_valor = preço que o revendedor cobra do cliente final
        // rec.valor = preço que o revendedor paga ao sistema
        lucroRevenda += (rule.regra_valor - rec.valor);
      }
    }

    return { totalVendas, totalCusto, lucro: totalVendas - totalCusto, lucroRevenda, totalDeposited, totalRec, successRec, pendingRec };
  }, [selectedRev, revRecargas, revTransactions, revPricingRules]);

  const toggleActive = async (rev: Revendedor) => {
    const { error } = await supabase.from("profiles").update({ active: !rev.active }).eq("id", rev.id);
    if (error) { toast.error("Erro ao atualizar status"); return; }
    toast.success(rev.active ? "Revendedor desativado" : "Revendedor ativado");
    fetchData();
    if (selectedRev?.id === rev.id) {
      setSelectedRev({ ...rev, active: !rev.active });
    }
  };

  const toggleRevendedorRole = async (rev: Revendedor) => {
    try {
      const action = rev.isRevendedor ? "remove" : "add";
      const res = await supabase.functions.invoke("admin-toggle-role", {
        body: { user_id: rev.id, role: "revendedor", action },
      });
      if (res.error || res.data?.error) throw new Error(res.data?.error || res.error?.message);
      toast.success(rev.isRevendedor ? "Função revendedor removida!" : "Função revendedor ativada!");
      fetchData();
      if (selectedRev?.id === rev.id) {
        setSelectedRev({ ...rev, isRevendedor: !rev.isRevendedor });
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao alterar função");
    }
  };

  const resetRevGateway = async (userId: string) => {
    const ok = await confirm("Resetar gateway do revendedor? Ele usará a gateway global.", { destructive: true, confirmText: "Resetar" });
    if (!ok) return;
    try {
      await (supabase.from("reseller_config" as any) as any).delete().eq("user_id", userId);
      toast.success("Gateway do revendedor resetada!");
      setRevGatewayConfig({});
    } catch (err: any) {
      toast.error(err.message || "Erro ao resetar");
    }
  };

  const [listPage, setListPage] = useState(1);
  const LIST_PAGE_SIZE = 15;

  const filtered = revendedores.filter(r => {
    const matchSearch = (r.nome || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.email || "").toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "todos" || r.role === roleFilter;
    return matchSearch && matchRole;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / LIST_PAGE_SIZE));
  const paginatedList = filtered.slice((listPage - 1) * LIST_PAGE_SIZE, listPage * LIST_PAGE_SIZE);

  // Reset page when search/filter changes
  useEffect(() => { setListPage(1); }, [search, roleFilter]);

  const totalUsers = allUsers.length;
  const activeCount = allUsers.filter(u => u.active).length;
  const inactiveCount = allUsers.filter(u => !u.active).length;
  const totalSaldo = revendedores.reduce((s, r) => s + r.saldo, 0);

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const fmtDate = (d: string) => new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(d));

  const userLabel = user?.email?.split("@")[0] || "Admin";
  const userInitial = (userLabel[0] || "A").toUpperCase();

  const recargasCountByUser = useMemo(() => {
    const map: Record<string, number> = {};
    allRecargas.forEach((r: any) => {
      const uid = r.user_id;
      if (uid) map[uid] = (map[uid] || 0) + 1;
    });
    return map;
  }, [allRecargas]);

  const reportPeriodStart = useMemo(() => {
    const now = new Date();
    if (reportPeriod === "hoje") return getLocalDayStartUTC(now);
    if (reportPeriod === "7dias") { const d = new Date(now); d.setDate(d.getDate() - 7); d.setHours(0, 0, 0, 0); return d.toISOString(); }
    if (reportPeriod === "mes") return getLocalMonthStartUTC(now);
    return new Date(2020, 0, 1).toISOString();
  }, [reportPeriod]);

  const fetchReport = useCallback(async () => {
    setReportLoading(true);
    try {
      // Fetch recargas in batches to avoid 1000 row limit
      let allRecData: any[] = [];
      let page = 0;
      const pageSize = 1000;
      while (true) {
        const { data: batch } = await supabase.from("recargas").select("*")
          .gte("created_at", reportPeriodStart).in("status", ["completed", "concluida"])
          .range(page * pageSize, (page + 1) * pageSize - 1);
        if (!batch || batch.length === 0) break;
        allRecData = allRecData.concat(batch);
        if (batch.length < pageSize) break;
        page++;
      }
      const recData = allRecData;

      const [{ data: profiles }, { data: allResellerPricing }, { data: globalPricing }, { data: opsData }] = await Promise.all([
        supabase.from("profiles").select("id, nome, email"),
        (supabase.from("reseller_base_pricing_rules" as any) as any).select("*"),
        supabase.from("pricing_rules").select("*"),
        supabase.from("operadoras").select("id, nome"),
      ]);

      const profileMap: Record<string, { nome: string | null; email: string | null }> = {};
      (profiles || []).forEach((p: any) => { profileMap[p.id] = { nome: p.nome, email: p.email }; });

      const opNameToId: Record<string, string> = {};
      (opsData || []).forEach((o: any) => { opNameToId[o.nome] = o.id; });

      const globalPriceMap: Record<string, { preco: number; custo: number }> = {};
      (globalPricing || []).forEach((r: any) => {
        const preco = r.tipo_regra === "fixo" ? (Number(r.regra_valor) > 0 ? Number(r.regra_valor) : Number(r.custo)) : Number(r.valor_recarga) * (1 + Number(r.regra_valor) / 100);
        globalPriceMap[`${r.operadora_id}-${r.valor_recarga}`] = { preco, custo: Number(r.custo) };
      });

      const resellerPriceMap: Record<string, Record<string, { preco: number; custo: number }>> = {};
      (allResellerPricing || []).forEach((r: any) => {
        if (!resellerPriceMap[r.user_id]) resellerPriceMap[r.user_id] = {};
        const preco = r.tipo_regra === "fixo" ? (Number(r.regra_valor) > 0 ? Number(r.regra_valor) : Number(r.custo)) : Number(r.valor_recarga) * (1 + Number(r.regra_valor) / 100);
        resellerPriceMap[r.user_id][`${r.operadora_id}-${r.valor_recarga}`] = { preco, custo: Number(r.custo) };
      });

      const userMap: Record<string, { totalRecargas: number; totalValor: number; totalVendas: number; totalCusto: number }> = {};
      (recData || []).forEach((r: any) => {
        if (!userMap[r.user_id]) userMap[r.user_id] = { totalRecargas: 0, totalValor: 0, totalVendas: 0, totalCusto: 0 };
        userMap[r.user_id].totalRecargas++;
        userMap[r.user_id].totalValor += Number(r.valor);

        const opId = r.operadora ? opNameToId[r.operadora] : null;
        const key = opId ? `${opId}-${r.valor}` : null;

        let preco = Number(r.valor);
        let custo = Number(r.custo);
        if (key) {
          const resellerPrice = resellerPriceMap[r.user_id]?.[key];
          const globalPrice = globalPriceMap[key];
          if (resellerPrice) { preco = resellerPrice.preco; custo = resellerPrice.custo; }
          else if (globalPrice) { preco = globalPrice.preco; custo = globalPrice.custo; }
        }

        userMap[r.user_id].totalVendas += preco;
        userMap[r.user_id].totalCusto += custo;
      });

      const report = Object.entries(userMap).map(([uid, data]) => ({
        user_id: uid,
        nome: profileMap[uid]?.nome || null,
        email: profileMap[uid]?.email || null,
        ...data,
        lucro: data.totalVendas - data.totalCusto,
      })).sort((a, b) => b.lucro - a.lucro);

      setReportData(report);
    } catch (err) { console.error(err); }
    reportLoaded.current = true;
    setReportLoading(false);
  }, [reportPeriodStart]);

  useEffect(() => { if (view === "relatorios") { fetchReport(); fetchAllRecargasList(); } }, [view, fetchReport]);

  const fetchAllRecargasList = useCallback(async () => {
    setAllRecargasLoading(true);
    try {
      let allData: any[] = [];
      let page = 0;
      const pageSize = 1000;
      while (true) {
        let query = supabase.from("recargas").select("*")
          .gte("created_at", reportPeriodStart)
          .order("created_at", { ascending: false })
          .range(page * pageSize, (page + 1) * pageSize - 1);
        const { data: batch } = await query;
        if (!batch || batch.length === 0) break;
        allData = allData.concat(batch);
        if (batch.length < pageSize) break;
        page++;
      }
      // Fetch user names
      const userIds = [...new Set(allData.map(r => r.user_id))];
      const profileMap: Record<string, { nome: string | null; email: string | null }> = {};
      for (let i = 0; i < userIds.length; i += 50) {
        const batch = userIds.slice(i, i + 50);
        const { data: profiles } = await supabase.from("profiles").select("id, nome, email").in("id", batch);
        (profiles || []).forEach((p: any) => { profileMap[p.id] = { nome: p.nome, email: p.email }; });
      }
      setAllRecargasList(allData.map(r => ({ ...r, user_nome: profileMap[r.user_id]?.nome || null, user_email: profileMap[r.user_id]?.email || null })));
    } catch (err) { console.error(err); }
    allRecargasLoaded.current = true;
    setAllRecargasLoading(false);
  }, [reportPeriodStart]);
  // Auto-refresh bot status when entering bot tab and token exists
  useEffect(() => {
    if (["dashboard", "configuracoes", "bot", "gateway", "store", "geral", "pagamentos", "depositos"].includes(view)) fetchGlobalConfig();
  }, [view, fetchGlobalConfig]);

  useEffect(() => {
    botPendingUpdatesRef.current = botStatus.pendingUpdates;
  }, [botStatus.pendingUpdates]);

  useEffect(() => {
    if (view !== "bot" || !globalConfig.telegramBotToken) return;

    let cancelled = false;
    let timerId: number | null = null;

    const runRealtimeSync = async () => {
      if (cancelled) return;

      const isHidden = typeof document !== "undefined" && document.visibilityState === "hidden";
      const hasBacklog = (botPendingUpdatesRef.current ?? 0) > 0;
      const nextInterval = isHidden ? 15000 : hasBacklog ? 2500 : 5000;
      setBotPollIntervalMs(nextInterval);

      await refreshBotStatus(undefined, { silent: true });

      if (!cancelled) {
        timerId = window.setTimeout(runRealtimeSync, nextInterval);
      }
    };

    runRealtimeSync();

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshBotStatus(undefined, { silent: true });
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      if (timerId) window.clearTimeout(timerId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [view, globalConfig.telegramBotToken, refreshBotStatus]);

  const webhookErrorIsActive =
    !!botStatus.webhookError &&
    (((botStatus.pendingUpdates ?? 0) > 0) ||
      !botStatus.webhookErrorAt ||
      (Date.now() - botStatus.webhookErrorAt) < 120000);

  // Dashboard computed metrics
  const dashboardMetrics = useMemo(() => {
    const todayLocal = getTodayLocalKey();
    const todayRecs = allRecargas.filter(r => {
      return toLocalDateKey(r.created_at) === todayLocal;
    });
    const completedToday = todayRecs.filter(r => r.status === "completed" || r.status === "concluida");
    const cobradoHoje = completedToday.reduce((s, r) => s + r.custo, 0);
    const custoApiHoje = completedToday.reduce((s, r) => s + (r.custo_api || 0), 0);
    const lucroHoje = cobradoHoje - custoApiHoje;
    const receitaHoje = cobradoHoje;

    const now = new Date();
    const mesStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const mesRecs = allRecargas.filter(r => r.created_at >= mesStart && (r.status === "completed" || r.status === "concluida"));
    const cobradoMes = mesRecs.reduce((s, r) => s + r.custo, 0);
    const custoApiMes = mesRecs.reduce((s, r) => s + (r.custo_api || 0), 0);
    const lucroMes = cobradoMes - custoApiMes;
    const receitaMes = cobradoMes;

    // Top resellers by volume today (all users who made recargas)
    const revVolumeMap: Record<string, { nome: string; count: number; total: number }> = {};
    completedToday.forEach(r => {
      const rev = revendedores.find(rv => rv.id === r.user_id);
      if (!rev) return;
      if (!revVolumeMap[r.user_id]) revVolumeMap[r.user_id] = { nome: rev.nome || rev.email || "Sem nome", count: 0, total: 0 };
      revVolumeMap[r.user_id].count++;
      revVolumeMap[r.user_id].total += r.valor;
    });
    const allTopResellers = Object.entries(revVolumeMap)
      .map(([id, d]) => ({ id, ...d }))
      .sort((a, b) => b.total - a.total);
    const topResellers = allTopResellers.slice(0, 10);
    const totalActiveToday = allTopResellers.length;

    // Recent 8 recharges
    const recentRecs = allRecargas.slice(0, 8);

    // Resellers with low balance (<50)
    const lowBalanceRevs = revendedores.filter(r => r.saldo > 0 && r.saldo < 50 && r.active);

    // Total global (all time)
    const allCompleted = allRecargas.filter(r => r.status === "completed" || r.status === "concluida");
    const cobradoTotal = allCompleted.reduce((s, r) => s + r.custo, 0);
    const custoApiTotal = allCompleted.reduce((s, r) => s + (r.custo_api || 0), 0);
    const lucroTotal = cobradoTotal - custoApiTotal;
    const receitaTotal = cobradoTotal;
    const custoTotal = custoApiTotal;

    return {
      recargasHoje: todayRecs.length,
      completedHoje: completedToday.length,
      receitaHoje,
      lucroHoje,
      receitaMes,
      lucroMes,
      mesRecs: mesRecs.length,
      topResellers,
      totalActiveToday,
      recentRecs,
      lowBalanceRevs,
      receitaTotal,
      custoTotal,
      lucroTotal,
      totalRecargas: allCompleted.length,
    };
  }, [allRecargas, revendedores]);

  const viewTitle = () => {
    switch (view) {
      case "dashboard": return "Dashboard";
      case "config-api": return "Configurações API";
      case "pagamentos": return "Gateway Principal";
      case "depositos": return "Depósitos";
      case "bot": return "Bot Telegram";
      case "geral": return "Configurações Gerais";
      case "relatorios": return "Relatórios";
      case "detalhe": return selectedRev ? (selectedRev.nome || selectedRev.email || "Revendedor") : "Revendedor";
      default: return "Revendedores";
    }
  };

  const gatewayLabel = (module: string) => {
    const map: Record<string, string> = {
      mercadopago: "Mercado Pago 💳", pushinpay: "PushinPay ⚡", woovi: "Woovi (OpenPix) 🟢",
      efipay: "Efi Pay 🏦", virtualpay: "VirtualPay 💎", misticpay: "MisticPay ✨", pixgo: "PixGo 🟣",
    };
    return map[module] || module || "Não configurada";
  };

  // Broadcast functions
  const fetchBroadcastHistory = useCallback(async () => {
    const { data } = await (supabase.from('notifications' as any) as any)
      .select('id, title, message, image_url, buttons, sent_count, created_at')
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) {
      const ids = data.map((n: any) => n.id);
      const { data: progresses } = await (supabase.from('broadcast_progress' as any) as any)
        .select('notification_id, status, sent_count, failed_count, total_users')
        .in('notification_id', ids)
        .order('created_at', { ascending: false });
      const progressMap: Record<string, any> = {};
      progresses?.forEach((p: any) => { if (!progressMap[p.notification_id]) progressMap[p.notification_id] = p; });
      setBroadcastHistory(data.map((n: any) => {
        const prog = progressMap[n.id];
        const isFailed = prog?.status === 'completed' && (prog?.sent_count || 0) === 0 && (prog?.failed_count || 0) > 0;
        return { ...n, status: prog?.status || 'pending', broadcast_failed: isFailed, bp_failed_count: prog?.failed_count || 0, bp_total_users: prog?.total_users || 0 };
      }));
    }

    // Fetch interrupted broadcasts
    const { data: interrupted } = await (supabase.from('broadcast_progress' as any) as any)
      .select('*, notification:notifications(title)')
      .in('status', ['cancelled', 'failed'])
      .order('created_at', { ascending: false });
    if (interrupted) {
      const incomplete = interrupted.filter((b: any) => (b.sent_count + b.failed_count) < b.total_users);
      setInterruptedBroadcasts(incomplete);
    }
  }, []);

  const fetchBroadcastUserCount = useCallback(async () => {
    const [activeRes, blockedRes] = await Promise.all([
      (supabase.from('telegram_users' as any) as any)
        .select('*', { count: 'exact', head: true })
        .eq('is_blocked', false)
        .eq('is_registered', true),
      (supabase.from('telegram_users' as any) as any)
        .select('*', { count: 'exact', head: true })
        .eq('is_blocked', true),
    ]);
    setBroadcastUserCount(activeRes.count || 0);
    setBroadcastBlockedCount(blockedRes.count || 0);
  }, []);

  useEffect(() => { if (view === "broadcast") { fetchBroadcastHistory(); fetchBroadcastUserCount(); } }, [view, fetchBroadcastHistory, fetchBroadcastUserCount]);

  // Persist broadcast progress to localStorage so it survives page navigation
  useEffect(() => {
    try {
      if (broadcastProgressId) {
        localStorage.setItem('broadcast_progress_id', broadcastProgressId);
        localStorage.setItem('broadcast_title', broadcastTitle);
      } else {
        localStorage.removeItem('broadcast_progress_id');
        localStorage.removeItem('broadcast_title');
      }
    } catch {}
  }, [broadcastProgressId, broadcastTitle]);

  // Pending withdrawals count for badge
  const [pendingSaquesCount, setPendingSaquesCount] = useState(0);
  const [pendingSupportCount, setPendingSupportCount] = useState(0);
  useEffect(() => {
    (async () => {
      const { count } = await supabase.from("transactions").select("*", { count: "exact", head: true }).eq("type", "saque").eq("status", "pending");
      setPendingSaquesCount(count || 0);
    })();
  }, [view]);

  const menuItems: { key: string; icon: any; label: string; color: string; link?: string; badge?: number }[] = [
    { key: "dashboard", icon: BarChart3, label: "Dashboard", color: "text-primary" },
    { key: "lista", icon: Users, label: "Usuários", color: "text-accent" },
    { key: "saques", icon: Banknote, label: "Saques", color: "text-success", badge: pendingSaquesCount },
    { key: "redes", icon: Network, label: "Redes", color: "text-[hsl(280,70%,60%)]" },
    { key: "relatorios", icon: FileText, label: "Relatórios", color: "text-warning" },
    { key: "precificacao", icon: Tag, label: "Precificação", color: "text-warning" },
    { key: "config-api", icon: Settings, label: "API Recarga", color: "text-[hsl(280,70%,60%)]" },
    { key: "pagamentos", icon: CreditCard, label: "Gateway Principal", color: "text-destructive" },
    { key: "depositos", icon: Landmark, label: "Depósitos", color: "text-success" },
    { key: "bot", icon: Bot, label: "Bot Telegram", color: "text-[hsl(200,80%,55%)]" },
    { key: "broadcast", icon: Megaphone, label: "Broadcast", color: "text-warning" },
    { key: "enquetes", icon: BarChart3, label: "Enquetes", color: "text-accent" },
    { key: "batepapo", icon: Send, label: "Bate-Papo", color: "text-destructive" },
    { key: "suporte", icon: Headphones, label: "Suporte", color: "text-[hsl(30,90%,55%)]", badge: pendingSupportCount },
    { key: "backup", icon: HardDrive, label: "Backup", color: "text-[hsl(40,80%,55%)]" },
    { key: "antifraude", icon: Shield, label: "Antifraude", color: "text-destructive" },
    { key: "auditoria", icon: FileText, label: "Auditoria", color: "text-primary" },
    { key: "licencas", icon: KeyRound, label: "Licenças", color: "text-primary" },
    { key: "geral", icon: Globe, label: "Configurações", color: "text-muted-foreground" },
  ];

  return (
    <PinProtection configKey="adminPin">
    <div className="min-h-screen md:flex">
      {/* Mobile Menu Bottom Sheet */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-[60] md:hidden" onClick={() => setMenuOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-[61] md:hidden bg-background border-t border-border rounded-t-2xl max-h-[70vh] overflow-y-auto">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mt-3 mb-2" />

            {/* User Info */}
            <div className="mx-4 mb-3 p-3 rounded-xl bg-muted/50">
              <div className="flex items-center gap-3">
                {myAvatarUrl ? (
                  <img src={myAvatarUrl} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                    {(user?.email?.[0] || "A").toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{user?.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">Admin Master</p>
                </div>
              </div>
            </div>

            <div className="px-3 pb-2 grid grid-cols-3 gap-1.5">
              {menuItems.map((item, index) => {
                const isActive = view === item.key;
                return (
                  <button key={item.key}
                    onClick={() => {
                      if (item.link) { navigate(item.link); } else {
                        setView(item.key as any);
                        if (item.key === "config-api") fetchApiConfig();
                        else if (item.key === "precificacao") { fetchPricingData(); fetchGlobalConfig(); }
                        else if (!["dashboard", "lista", "relatorios"].includes(item.key)) fetchGlobalConfig();
                      }
                      setMenuOpen(false);
                    }}
                    className={`flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-lg text-[11px] font-medium transition-all group ${
                      isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/40"
                    }`}>
                    <div className="relative">
                      <FloatingGridIcon icon={item.icon} color={item.color} isActive={isActive} index={index} size="h-5 w-5" />
                      {!!item.badge && item.badge > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 px-0.5 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">{item.badge}</span>
                      )}
                    </div>
                    <span className="text-center leading-tight">{item.label}</span>
                  </button>
                );
              })}
              <button onClick={() => { navigate("/admin"); setMenuOpen(false); }}
                className="flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-lg text-[11px] font-medium text-muted-foreground hover:bg-muted/40 transition-all">
                <BarChart3 className="h-5 w-5 text-primary" />
                <span className="text-center leading-tight">Painel Admin</span>
              </button>
              <button onClick={() => { navigate("/painel"); setMenuOpen(false); }}
                className="flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-lg text-[11px] font-medium text-muted-foreground hover:bg-muted/40 transition-all">
                <Landmark className="h-5 w-5 text-success" />
                <span className="text-center leading-tight">Painel Cliente</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:block md:sticky top-0 left-0 h-screen w-[260px] z-30 border-r border-border bg-card">
        <div className="h-full flex flex-col">
          <div className="px-5 py-5 border-b border-border">
            <h1 className="font-display text-xl font-bold shimmer-letters truncate">
              {siteName}
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-primary font-semibold mt-1.5">Principal</p>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {menuItems.map((item, index) => {
              const isActive = view === item.key;
              return (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <button
                    onClick={() => {
                      if (item.link) { navigate(item.link); } else {
                        setView(item.key as any);
                        if (item.key === "config-api") fetchApiConfig();
                        else if (item.key === "precificacao") { fetchPricingData(); fetchGlobalConfig(); }
                        else if (!["dashboard", "lista", "relatorios"].includes(item.key)) fetchGlobalConfig();
                      }
                      setMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-all group ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`}
                  >
                    <div className="relative">
                      <FloatingMenuIcon icon={item.icon} color={item.color} isActive={isActive} index={index} />
                      {!!item.badge && item.badge > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">{item.badge}</span>
                      )}
                    </div>
                    <motion.span whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                      {item.label}
                    </motion.span>
                    {!!item.badge && item.badge > 0 && !isActive && (
                      <span className="ml-auto min-w-[20px] h-5 px-1.5 rounded-full bg-destructive text-destructive-foreground text-[11px] font-bold flex items-center justify-center">{item.badge}</span>
                    )}
                    {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
                  </button>
                </motion.div>
              );
            })}
          </nav>

          <div className="p-3 border-t border-border">
            <button onClick={() => navigate("/chat")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-all group shadow-[0_0_12px_hsl(var(--primary)/0.08)]">
              <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                <MessageCircle className="h-5 w-5 text-primary" />
              </motion.div>
              <span>Bate-papo</span>
              <ChevronRight className="h-4 w-4 ml-auto opacity-50 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
          <div className="p-3 pt-0 space-y-1">
            <button onClick={() => navigate("/admin")} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors">
              <BarChart3 className="h-4 w-4 text-primary" /> <span>Painel Admin</span>
            </button>
            <button onClick={() => navigate("/painel")} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors">
              <Landmark className="h-4 w-4 text-primary" /> <span>Painel Cliente</span>
            </button>
          </div>

          <div className="p-4 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
              <ThemeToggle />
            </div>
            <button onClick={signOut}
              className="w-full py-2.5 rounded-xl border border-destructive/35 text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors flex items-center justify-center gap-2">
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <header className="glass-header px-4 md:px-6 py-3 sticky top-0 z-20 flex items-center gap-3">
          
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-lg font-bold text-foreground leading-tight">
              {menuItems.find(m => m.key === view)?.label || viewTitle()}
            </h2>
            <p className="text-xs text-muted-foreground leading-tight mt-0.5">
              {view === "dashboard" && "Visão geral do sistema e métricas de desempenho."}
              {view === "lista" && "Gerencie todos os revendedores e clientes."}
              {view === "relatorios" && "Relatórios detalhados de vendas e lucro."}
              {view === "config-api" && "Configure a API de recargas."}
              {view === "pagamentos" && "Configure a gateway de pagamento principal do sistema."}
              {view === "depositos" && "Configure limites e taxas de depósitos."}
              {view === "bot" && "Configure o bot do Telegram."}
              {view === "geral" && "Configurações gerais do sistema."}
              {view === "broadcast" && "Envie mensagens em massa para usuários do Telegram."}
              {view === "enquetes" && "Crie enquetes e acompanhe a votação em tempo real."}
              {view === "batepapo" && "Crie, edite e gerencie as salas de bate-papo."}
              {view === "saques" && "Gerencie solicitações de saque de toda a rede."}
              {view === "redes" && "Visão consolidada de todos os donos de rede."}
              {view === "backup" && "Exportar e restaurar backup do sistema."}
              {view === "suporte" && "Gerencie tickets de suporte recebidos via Telegram."}
              {view === "antifraude" && "Monitore dispositivos, gerencie banimentos e logs de segurança."}
              {view === "detalhe" && "Detalhes e métricas do revendedor."}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            {view === "lista" && (
              <button onClick={() => setShowCreateModal(true)}
                className="h-9 px-4 rounded-lg bg-primary text-primary-foreground flex items-center gap-2 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm font-semibold shadow-sm">
                <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Novo Revendedor</span>
              </button>
            )}
            {(view === "pagamentos" || view === "depositos" || view === "bot" || view === "geral") && (
              <button onClick={saveGlobalConfig} disabled={globalConfigSaving}
                className="h-9 px-4 rounded-lg bg-primary text-primary-foreground flex items-center gap-1.5 hover:opacity-90 transition-opacity text-sm font-medium disabled:opacity-50">
                {globalConfigSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {globalConfigSaving ? "Salvando..." : "Salvar"}
              </button>
            )}
            <NotificationBell
              listenTo={LISTEN_TO_TYPES}
              revendedores={memoizedRevendedores}
            />
          </div>
        </header>

        <main className="max-w-6xl mx-auto p-4 md:p-6 pb-24 md:pb-6 space-y-6">

          {/* ===== DASHBOARD ===== */}
          {view === "dashboard" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Info Card - Dashboard */}
              <InfoCard title="Painel de Controle" items={[
                { icon: TrendingUp, iconColor: "text-success", label: "Lucro", description: "diferença entre o valor cobrado dos clientes e o custo da API de recargas." },
                { icon: Activity, iconColor: "text-primary", label: "Métricas", description: "recargas realizadas, taxa de sucesso, ticket médio e volume total." },
                { icon: Clock, iconColor: "text-warning", label: "Tempo Real", description: "os dados são atualizados automaticamente conforme novas recargas são processadas." },
              ]} />

              {/* Bank-style Dashboard */}
              {(() => {
                const allCompleted = allRecargas.filter(r => r.status === "completed" || r.status === "concluida");
                const totalCobrado = allCompleted.reduce((s, r) => s + r.custo, 0);
                const totalCustoApi = allCompleted.reduce((s, r) => s + (r.custo_api || 0), 0);
                const lucro = totalCobrado - totalCustoApi;
                const totalRec = allRecargas.length;
                const successRec = allCompleted.length;
                const pendingRec = allRecargas.filter(r => r.status === "pending").length;
                const ticketMedio = successRec > 0 ? totalCobrado / successRec : 0;

                return (
                  <AdminBankDashboard
                    lucro={lucro}
                    totalDeposited={globalTxDeposited}
                    saldoCarteiras={totalSaldo}
                    ticketMedio={ticketMedio}
                    totalRec={totalRec}
                    successRec={successRec}
                    pendingRec={pendingRec}
                    meuSaldo={meuSaldo}
                    loading={loading}
                    onAddSaldo={() => setShowCreateModal(true)}
                    onNavigate={(key) => {
                      if (key === "historico") setView("relatorios");
                      else if (key === "usuarios") setView("lista");
                      else if (key === "depositos") setView("depositos");
                    }}
                    onShowLucroModal={() => setShowLucroModal(true)}
                    lucroPct={totalCobrado > 0 ? (lucro / totalCobrado) * 100 : 0}
                    txCount={globalTxCount}
                    totalCobrado={totalCobrado}
                  />
                );
              })()}

              {/* Saldo Provedor (API) */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="kpi-card border border-[hsl(280,70%,60%)]/20 hover:shadow-lg hover:shadow-[hsl(280,70%,60%)]/5 hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 rounded-2xl bg-[hsl(280,70%,60%)]/10 flex items-center justify-center shrink-0">
                    <Server className="h-5 w-5 text-[hsl(280,70%,60%)]" />
                  </div>
                  <button onClick={fetchProviderBalance} disabled={providerBalance.loading}
                    className="p-1.5 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50">
                    <RefreshCw className={`h-3.5 w-3.5 ${providerBalance.loading ? "animate-spin" : ""}`} />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Saldo Provedor</p>
                {providerBalance.loading ? (
                  <div className="mt-1"><SkeletonCard /></div>
                ) : providerBalance.error ? (
                  <p className="text-xl md:text-2xl font-bold text-destructive mt-0.5">Erro</p>
                ) : providerBalance.value !== null ? (
                  <p className="text-xl md:text-2xl font-bold mt-0.5 text-[hsl(280,70%,60%)]">
                    <AnimatedCounter value={providerBalance.value} prefix={"R$\u00A0"} />
                  </p>
                ) : (
                  <p className="text-xl md:text-2xl font-bold text-muted-foreground mt-0.5">—</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {providerBalance.error ? "Falha ao consultar API" : "API Recarga Express"}
                </p>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Recent Activity */}
                <div className="glass-card rounded-xl p-4 md:p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                      <History className="h-4 w-4 text-muted-foreground" /> Atividade Recente
                    </h3>
                    <button onClick={() => setView("relatorios")} className="text-xs text-primary font-medium hover:underline">Ver tudo</button>
                  </div>
                  {dashboardMetrics.recentRecs.length === 0 ? (
                    <p className="text-center py-6 text-muted-foreground text-sm">Nenhuma recarga recente</p>
                  ) : (
                    <div className="space-y-2">
                      {dashboardMetrics.recentRecs.map(r => {
                        const rev = revendedores.find(rv => rv.id === r.user_id);
                        const statusOk = r.status === "completed" || r.status === "concluida";
                        return (
                          <div key={r.id} className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0">
                            <StatusBadge status={r.status} type="recarga" className="shrink-0 text-[10px]" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground truncate">
                                {rev?.nome || rev?.email?.split("@")[0] || "—"} • <span className={r.operadora?.toLowerCase().includes("tim") ? "text-blue-400" : r.operadora?.toLowerCase().includes("vivo") ? "text-purple-400" : r.operadora?.toLowerCase().includes("claro") ? "text-red-400" : "text-foreground"}>{(r.operadora || "—").toUpperCase()}</span>
                              </p>
                              <p className="text-xs text-muted-foreground">{r.telefone} • {getRecargaTimeLabel(r)} {fmtDate(getRecargaTime(r))}</p>
                            </div>
                            <span className="text-sm font-bold font-mono text-foreground shrink-0"><AnimatedCounter value={safeValor(r)} prefix="R$&nbsp;" duration={600} /></span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Top Resellers Today */}
                <div className="glass-card rounded-xl p-4 md:p-5">
                  <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-success" /> Top Revendedores Hoje
                    {dashboardMetrics.totalActiveToday > 0 && (
                      <span className="text-xs font-medium text-muted-foreground ml-auto">{dashboardMetrics.totalActiveToday} usuário{dashboardMetrics.totalActiveToday !== 1 ? "s" : ""} ativo{dashboardMetrics.totalActiveToday !== 1 ? "s" : ""}</span>
                    )}
                  </h3>
                  {dashboardMetrics.topResellers.length === 0 ? (
                    <p className="text-center py-6 text-muted-foreground text-sm">Sem atividade hoje</p>
                  ) : (
                    <div className="space-y-1">
                      {dashboardMetrics.topResellers.map((r, i) => {
                        const rev = revendedores.find(rv => rv.id === r.id);
                        const isFirst = i === 0;
                        const isSecond = i === 1;
                        const isThird = i === 2;
                        const rankColors = isFirst
                          ? "bg-warning/15 border-warning/30 text-warning"
                          : isSecond
                          ? "bg-muted/60 border-border text-muted-foreground"
                          : isThird
                          ? "bg-orange-500/10 border-orange-500/20 text-orange-400"
                          : "bg-muted/30 border-border/30 text-muted-foreground";
                        const badgeColors = isFirst
                          ? "bg-warning/25 text-warning shadow-warning/20 shadow-sm"
                          : isSecond
                          ? "bg-muted text-muted-foreground"
                          : isThird
                          ? "bg-orange-500/15 text-orange-400"
                          : "bg-muted/60 text-muted-foreground";

                        return (
                          <motion.div
                            key={r.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={`flex items-center gap-3 py-2.5 px-3 rounded-lg border cursor-pointer hover:scale-[1.01] transition-all duration-200 ${rankColors}`}
                            onClick={() => { if (rev) openRevDetail(rev); }}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${badgeColors}`}>
                              {isFirst ? <Trophy className="h-4 w-4" /> : i + 1}
                            </div>

                            {rev?.avatar_url ? (
                              <img src={rev.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-border" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className={`text-sm font-semibold truncate ${isFirst ? "text-warning" : "text-foreground"}`}>{r.nome}</p>
                                {rev?.verification_badge && (
                                  <VerificationBadge badge={rev.verification_badge as any} size="sm" />
                                )}
                              </div>
                              <p className="text-[10px] text-muted-foreground">{r.count} recarga{r.count !== 1 ? "s" : ""}</p>
                            </div>

                            <span className={`text-sm font-bold font-mono shrink-0 ${isFirst ? "text-success" : "text-success/80"}`}>
                              <AnimatedCounter value={r.total} prefix="R$&nbsp;" duration={600} />
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Alerts Row */}
              {dashboardMetrics.lowBalanceRevs.length > 0 && (() => {
                const PAGE_SIZE_LOW = 10;
                const totalPages = Math.ceil(dashboardMetrics.lowBalanceRevs.length / PAGE_SIZE_LOW);
                const paginated = dashboardMetrics.lowBalanceRevs.slice(
                  (lowBalancePage - 1) * PAGE_SIZE_LOW,
                  lowBalancePage * PAGE_SIZE_LOW
                );
                return (
                <div className="glass-card rounded-xl p-4 md:p-5 border-warning/30">
                  <h3 className="text-sm font-semibold text-warning mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" /> Saldo Baixo ({dashboardMetrics.lowBalanceRevs.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {paginated.map(r => (
                      <div key={r.id} className="flex items-center justify-between gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3 cursor-pointer hover:bg-warning/10 hover:border-warning/50 transition-all duration-200"
                        onClick={() => setShowSaldoModal(r)}>
                        <div className="flex items-center gap-2 min-w-0">
                          <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0" />
                          <p className="text-sm font-medium text-foreground truncate">{r.nome || r.email?.split("@")[0] || "—"}</p>
                        </div>
                        <span className="text-sm font-bold font-mono text-warning shrink-0"><AnimatedCounter value={r.saldo} prefix="R$&nbsp;" duration={600} /></span>
                      </div>
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-3">
                      <button onClick={() => setLowBalancePage(p => Math.max(1, p - 1))} disabled={lowBalancePage === 1}
                        className="px-3 py-1 text-xs rounded-md bg-muted/50 text-foreground hover:bg-muted disabled:opacity-40 transition-colors">
                        ← Anterior
                      </button>
                      <span className="text-xs text-muted-foreground">{lowBalancePage} / {totalPages}</span>
                      <button onClick={() => setLowBalancePage(p => Math.min(totalPages, p + 1))} disabled={lowBalancePage === totalPages}
                        className="px-3 py-1 text-xs rounded-md bg-muted/50 text-foreground hover:bg-muted disabled:opacity-40 transition-colors">
                        Próximo →
                      </button>
                    </div>
                  )}
                </div>
                );
              })()}

              {/* System Status */}
              <div className="glass-card rounded-xl p-4 md:p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" /> Status do Sistema
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="flex items-center gap-3 rounded-lg bg-muted/30 p-3">
                    <Database className="h-4 w-4 text-success shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-foreground">Banco de Dados</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse inline-block" /> Conectado</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-muted/30 p-3">
                    <Shield className="h-4 w-4 text-success shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-foreground">Autenticação</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse inline-block" /> Ativo</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-muted/30 p-3">
                    <Users className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-foreground">Revendedores</p>
                      <p className="text-[10px] text-muted-foreground">{activeCount} ativos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-muted/30 p-3">
                    <Smartphone className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-foreground">Recargas Total</p>
                      <p className="text-[10px] text-muted-foreground">{allRecargas.length} registros</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Realtime Dashboard */}
              {user && (
                <RealtimeDashboard fmt={fmt} />
              )}
            </motion.div>
          )}

          {/* ===== LISTA ===== */}
           {view === "lista" && (
            <>
              {/* Info Card - Lista */}
              <InfoCard title="Gestão de Usuários" items={[
                { icon: Users, iconColor: "text-primary", label: "Usuários", description: "todos os revendedores e clientes cadastrados no sistema." },
                { icon: UserCheck, iconColor: "text-success", label: "Ativar/Desativar", description: "controle de acesso individual. Usuários inativos não conseguem operar." },
                { icon: Shield, iconColor: "text-warning", label: "Cargos", description: "defina permissões: admin (acesso total), revendedor (vende) ou cliente (compra)." },
              ]} />

               <div className="grid grid-cols-4 gap-2">
                {[
                  { icon: Users, label: "Total", value: String(totalUsers), color: "text-primary", bgColor: "bg-primary/10" },
                  { icon: UserCheck, label: "Ativos", value: String(activeCount), color: "text-success", bgColor: "bg-success/10" },
                  { icon: UserX, label: "Inativos", value: String(inactiveCount), color: "text-destructive", bgColor: "bg-destructive/10" },
                  { icon: Wallet, label: "Saldo", value: fmt(totalSaldo), color: "text-primary", bgColor: "bg-primary/10", highlight: true },
                ].map((c, i) => (
                  <motion.div
                    key={c.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, type: "spring", stiffness: 350, damping: 28 }}
                    className={`glass-card rounded-xl p-2.5 flex flex-col items-center text-center ${c.highlight ? "border-primary/25 ring-1 ring-primary/10" : ""}`}
                  >
                    <div className={`w-9 h-9 rounded-xl ${c.bgColor} flex items-center justify-center shrink-0 mb-1.5`}>
                      <c.icon className={`h-4.5 w-4.5 ${c.color}`} />
                    </div>
                    <p className="text-[8px] text-muted-foreground uppercase tracking-widest font-bold leading-none">{c.label}</p>
                    <p className={`text-sm font-extrabold tracking-tight leading-tight mt-1 tabular-nums ${c.highlight ? "text-primary" : "text-foreground"}`}>{c.value}</p>
                  </motion.div>
                ))}
              </div>

              {/* Search + Filters */}
              <div className="space-y-3">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar por nome ou e-mail..."
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 placeholder:text-muted-foreground/60 transition-all shadow-sm"
                  />
                </div>

                {/* Role Filter */}
                <div className="flex items-center gap-2 flex-wrap">
                  {([
                    { key: "todos", label: "Todos", count: revendedores.length },
                    { key: "admin", label: "Admin", count: revendedores.filter(r => r.role === "admin").length },
                    { key: "revendedor", label: "Revendedor", count: revendedores.filter(r => r.role === "revendedor").length },
                    { key: "usuario", label: "Usuário", count: revendedores.filter(r => r.role === "usuario").length },
                    { key: "sem_role", label: "Sem função", count: revendedores.filter(r => r.role === "sem_role").length },
                  ] as const).filter(f => ["todos", "admin", "revendedor", "usuario"].includes(f.key) || f.count > 0).map(f => (
                    <button
                      key={f.key}
                      onClick={() => setRoleFilter(f.key)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                        roleFilter === f.key
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 border-primary/50 scale-105"
                          : "bg-card/60 text-muted-foreground hover:bg-muted/80 border-border/40 hover:border-border"
                      }`}
                    >
                      {f.label} <span className="opacity-70 ml-0.5">({f.count})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile: User Cards */}
              <div className="md:hidden space-y-2">
                {loading ? (
                  <div className="space-y-2">{[1,2,3].map(i => <SkeletonRow key={i} />)}</div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">Nenhum revendedor encontrado</p>
                    <button onClick={() => setShowCreateModal(true)} className="mt-3 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
                      <Plus className="h-4 w-4 inline mr-1" /> Criar revendedor
                    </button>
                  </div>
                ) : (() => {
                  const todayStr = new Date().toISOString().slice(0, 10);
                  return paginatedList.map(r => {
                    const initial = ((r.nome || r.email || "R")[0]).toUpperCase();
                    const userRecs = allRecargas.filter(rc => rc.user_id === r.id);
                    const recCount = userRecs.length;
                    const recHoje = userRecs.filter(rc => rc.created_at?.slice(0, 10) === todayStr).length;
                    const completedRecs = userRecs.filter(rc => rc.status === "completed" || rc.status === "concluida");
                    const totalVendido = completedRecs.reduce((s, rc) => s + (Number(rc.custo) || 0), 0);
                    const totalCustoApi = completedRecs.reduce((s, rc) => s + (Number(rc.custo_api) || 0), 0);
                    const lucro = totalVendido - totalCustoApi;
                    return (
                      <motion.div key={r.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        className="glass-card rounded-xl p-4 active:scale-[0.98] transition-transform" onClick={() => openRevDetail(r)}>
                        {/* Header: Avatar + Name + Role Badge */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="relative shrink-0">
                            {r.avatar_url ? (
                              <img src={r.avatar_url} alt="" referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).onerror = null; (e.target as HTMLImageElement).style.display = 'none'; }} className={`w-10 h-10 rounded-full object-cover ring-2 ${r.active ? "ring-success/40" : "ring-destructive/40"}`} />
                            ) : (
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${r.active ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                                {initial}
                              </div>
                            )}
                            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${r.active ? "bg-success" : "bg-destructive"}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-foreground text-[14px] truncate">{r.nome || "Sem nome"}</p>
                              <VerificationBadge badge={r.verification_badge as BadgeType} size="xs" />
                            </div>
                            <p className="text-[11px] text-muted-foreground truncate mt-0.5">{r.email || "—"}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                            r.role === "admin" ? "bg-[hsl(280,70%,60%)]/15 text-[hsl(280,70%,60%)]" :
                            r.role === "revendedor" ? "bg-primary/15 text-primary" :
                            r.role === "usuario" ? "bg-[hsl(200,70%,50%)]/15 text-[hsl(200,70%,50%)]" :
                            r.role === "cliente" ? "bg-accent/15 text-accent" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {r.role === "sem_role" ? "—" : r.role === "usuario" ? "USUÁRIO" : r.role?.toUpperCase()}
                          </span>
                        </div>
                        {/* Metrics Grid */}
                        <div className="grid grid-cols-4 gap-3 py-3 border-t border-b border-border/30">
                          {[
                            { label: "SALDO", value: fmt(r.saldo), color: "text-foreground" },
                            { label: "VENDAS", value: fmt(totalVendido), color: "text-success" },
                            { label: "RECARGAS", value: String(recCount), color: "text-foreground" },
                            { label: "LUCRO", value: fmt(lucro), color: lucro > 0 ? "text-success" : lucro < 0 ? "text-destructive" : "text-muted-foreground" },
                          ].map(m => (
                            <div key={m.label} className="text-center">
                              <p className="text-[8px] text-muted-foreground uppercase tracking-widest font-bold mb-1">{m.label}</p>
                              <p className={`text-[13px] font-bold font-mono tabular-nums ${m.color}`}>{m.value}</p>
                            </div>
                          ))}
                        </div>
                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-3" onClick={e => e.stopPropagation()}>
                          <button onClick={() => setShowSaldoModal(r)} className="flex-1 py-2 rounded-lg text-[12px] font-bold bg-primary/15 text-primary hover:bg-primary/25 transition-colors">Saldo</button>
                          <button onClick={() => openRevDetail(r)} className="flex-1 py-2 rounded-lg text-[12px] font-bold bg-muted/50 text-muted-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1.5">
                            <Eye className="h-3.5 w-3.5" /> Detalhes
                          </button>
                        </div>
                      </motion.div>
                    );
                  });
                })()}
              </div>

              {/* Desktop: Table */}
              <div className="hidden md:block glass-card rounded-2xl overflow-hidden border border-border/20">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-border/30 bg-muted/20">
                      <th className="text-left px-4 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Usuário</th>
                      <th className="text-center px-2 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tipo</th>
                      <th className="text-right px-2 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Saldo</th>
                      <th className="text-center px-2 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Rec.</th>
                      <th className="hidden lg:table-cell text-center px-2 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Hoje</th>
                      <th className="hidden lg:table-cell text-right px-2 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Vendido</th>
                      <th className="hidden lg:table-cell text-right px-2 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Lucro</th>
                      <th className="hidden lg:table-cell text-center px-2 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                      <th className="text-center px-2 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/15">
                    {loading ? (
                      <tr><td colSpan={9} className="py-4"><div className="space-y-2">{[1,2,3].map(i => <SkeletonRow key={i} />)}</div></td></tr>
                    ) : filtered.length === 0 ? (
                      <tr><td colSpan={9} className="text-center py-10">
                        <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-muted-foreground text-sm">Nenhum usuário encontrado</p>
                        <button onClick={() => setShowCreateModal(true)} className="mt-3 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 shadow-sm shadow-primary/20">
                          <Plus className="h-4 w-4 inline mr-1" /> Criar revendedor
                        </button>
                      </td></tr>
                    ) : (() => {
                      const todayStr = new Date().toISOString().slice(0, 10);
                      return paginatedList.map((r, idx) => {
                        const initial = ((r.nome || r.email || "R")[0]).toUpperCase();
                        const userRecs = allRecargas.filter(rc => rc.user_id === r.id);
                        const recCount = userRecs.length;
                        const recHoje = userRecs.filter(rc => rc.created_at?.slice(0, 10) === todayStr).length;
                        const completedRecs = userRecs.filter(rc => rc.status === "completed" || rc.status === "concluida");
                        const totalVendido = completedRecs.reduce((s, rc) => s + (Number(rc.custo) || 0), 0);
                        const totalCustoApiDesk = completedRecs.reduce((s, rc) => s + (Number(rc.custo_api) || 0), 0);
                        const lucroDesk = totalVendido - totalCustoApiDesk;
                        const saldoBaixo = r.saldo > 0 && r.saldo < 50;
                        return (
                          <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02, duration: 0.2 }} className="hover:bg-primary/[0.04] transition-colors cursor-pointer group" onClick={() => openRevDetail(r)}>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2.5">
                                {r.avatar_url ? (
                                  <img src={r.avatar_url} alt="" referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).onerror = null; (e.target as HTMLImageElement).style.display = 'none'; }} className={`w-8 h-8 rounded-lg object-cover shrink-0 ring-1.5 ${r.active ? "ring-success/30" : "ring-destructive/30"}`} />
                                ) : (
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${r.active ? "bg-gradient-to-br from-success/20 to-success/5 text-success" : "bg-gradient-to-br from-destructive/20 to-destructive/5 text-destructive"}`}>
                                    {initial}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="font-semibold text-foreground leading-none text-[13px] flex items-center gap-1 group-hover:text-primary transition-colors">{r.nome || "Sem nome"} <VerificationBadge badge={r.verification_badge as BadgeType} size="xs" /></p>
                                  <p className="text-[11px] text-muted-foreground/60 truncate max-w-[160px] mt-0.5 leading-none">{r.email || "—"}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-2 py-2.5 text-center">
                              <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                r.role === "admin" ? "bg-[hsl(280,70%,60%)]/15 text-[hsl(280,70%,60%)]" :
                                r.role === "revendedor" ? "bg-primary/15 text-primary" :
                                r.role === "usuario" ? "bg-[hsl(200,70%,50%)]/15 text-[hsl(200,70%,50%)]" :
                                r.role === "cliente" ? "bg-accent/15 text-accent" :
                                "bg-muted text-muted-foreground"
                              }`}>
                                {r.role === "sem_role" ? "—" : r.role === "usuario" ? "Usuário" : r.role}
                              </span>
                            </td>
                            <td className="px-2 py-2.5 text-right">
                              <span className={`font-mono font-bold tabular-nums text-[13px] ${saldoBaixo ? "text-warning" : "text-foreground"}`}><AnimatedCounter value={r.saldo} prefix="R$&nbsp;" duration={600} /></span>
                              {saldoBaixo && <p className="text-[9px] text-warning mt-0.5 font-medium leading-none">Baixo</p>}
                            </td>
                            <td className="px-2 py-2.5 text-center">
                              <span className="font-mono font-semibold text-muted-foreground tabular-nums">{recCount}</span>
                            </td>
                            <td className="hidden lg:table-cell px-2 py-2.5 text-center">
                              {recHoje > 0 ? (
                                <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded text-[10px] font-bold bg-primary/15 text-primary">
                                  {recHoje}
                                </span>
                              ) : (
                                <span className="text-muted-foreground/30 text-[11px]">0</span>
                              )}
                            </td>
                            <td className="hidden lg:table-cell px-2 py-2.5 text-right">
                              <span className="font-mono font-bold text-success tabular-nums"><AnimatedCounter value={totalVendido} prefix="R$&nbsp;" duration={600} /></span>
                            </td>
                            <td className="hidden lg:table-cell px-2 py-2.5 text-right">
                              <span className={`font-mono font-bold tabular-nums ${lucroDesk > 0 ? "text-success" : lucroDesk < 0 ? "text-destructive" : "text-muted-foreground/40"}`}><AnimatedCounter value={lucroDesk} prefix="R$&nbsp;" duration={600} /></span>
                            </td>
                            <td className="hidden lg:table-cell px-2 py-2.5 text-center">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${r.active ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${r.active ? "bg-success" : "bg-destructive"}`} />
                                {r.active ? "Ativo" : "Off"}
                              </span>
                            </td>
                            <td className="px-2 py-2.5" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center justify-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => setShowSaldoModal(r)} className="px-2 py-1 rounded text-[11px] font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors" title="Saldo">
                                  <DollarSign className="h-3 w-3 inline" />
                                </button>
                                <button onClick={() => toggleRevendedorRole(r)}
                                  title={r.isRevendedor ? "Remover revendedor" : "Ativar revendedor"}
                                  className={`p-1 rounded transition-colors ${r.isRevendedor ? "bg-success/15 text-success hover:bg-success/25" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}
                                >
                                  {r.isRevendedor ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                                </button>
                                <button onClick={() => toggleActive(r)} className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground" title={r.active ? "Desativar" : "Ativar"}>
                                  {r.active ? <ToggleRight className="h-3.5 w-3.5 text-success" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                                </button>
                                <button onClick={() => openRevDetail(r)} className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground group-hover:text-primary" title="Detalhes">
                                  <Eye className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between glass-card rounded-2xl px-5 py-3.5 shadow-md border border-border/30">
                  <p className="text-xs text-muted-foreground/80 font-medium">
                    Mostrando <span className="text-foreground font-semibold">{(listPage - 1) * LIST_PAGE_SIZE + 1}–{Math.min(listPage * LIST_PAGE_SIZE, filtered.length)}</span> de <span className="text-foreground font-semibold">{filtered.length}</span>
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setListPage(p => Math.max(1, p - 1))}
                      disabled={listPage <= 1}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-card text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-border/40"
                    >
                      ← Anterior
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPages || Math.abs(p - listPage) <= 1)
                      .reduce<(number | string)[]>((acc, p, idx, arr) => {
                        if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((p, i) =>
                        typeof p === "string" ? (
                          <span key={`dot-${i}`} className="px-1 text-xs text-muted-foreground/50">…</span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => setListPage(p)}
                            className={`min-w-[34px] h-9 rounded-xl text-xs font-bold transition-all ${
                              listPage === p
                                ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-105"
                                : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground border border-border/40"
                            }`}
                          >
                            {p}
                          </button>
                        )
                      )}
                    <button
                      onClick={() => setListPage(p => Math.min(totalPages, p + 1))}
                      disabled={listPage >= totalPages}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-card text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-border/40"
                    >
                      Próximo →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ===== DETALHE REVENDEDOR ===== */}
           {view === "detalhe" && selectedRev && (
            <>
              {/* Info Card - Detalhe */}
              <InfoCard title="Detalhes do Revendedor" items={[
                { icon: User, iconColor: "text-primary", label: "Perfil", description: "dados cadastrais, badge de verificação e status de atividade." },
                { icon: Wallet, iconColor: "text-success", label: "Saldos", description: "saldo de revenda (para recargas) e saldo pessoal (comissões recebidas)." },
                { icon: Activity, iconColor: "text-warning", label: "Desempenho", description: "total de recargas, volume vendido e histórico completo de operações." },
              ]} />

              {/* Profile Card */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-4 sm:p-6">
                <div className="flex items-start gap-4">
                  {selectedRev.avatar_url ? (
                    <img src={selectedRev.avatar_url} alt="" referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).onerror = null; (e.target as HTMLImageElement).style.display = 'none'; }} className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover shrink-0 ring-2 ${selectedRev.active ? "ring-success/30" : "ring-destructive/30"}`} />
                  ) : (
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center font-bold text-xl sm:text-2xl shrink-0 ${selectedRev.active ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                      {((selectedRev.nome || selectedRev.email || "R")[0]).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                     <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display text-lg sm:text-2xl font-bold text-foreground truncate">{selectedRev.nome || "Sem nome"}</h3>
                      <VerificationBadge badge={selectedRev.verification_badge as BadgeType} size="md" />
                      <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap ${selectedRev.active ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                        {selectedRev.active ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                    <div className="mt-2 sm:mt-3 space-y-1.5 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-2">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground truncate">
                        <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" /> <span className="truncate">{selectedRev.email || "—"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" /> {selectedRev.telefone || "Não informado"}
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" /> Desde {formatDateFullBR(selectedRev.created_at)}
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <Hash className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" /> ID: {selectedRev.id.slice(0, 8)}...
                      </div>
                      {selectedRev.telegram_username && (
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" /> @{selectedRev.telegram_username}
                        </div>
                      )}
                      {selectedRev.whatsapp_number && (
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" /> {selectedRev.whatsapp_number}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
                    {/* Ações compactas em linha */}
                    <div className="flex flex-wrap gap-1.5">
                      <button onClick={() => setShowSaldoModal(selectedRev)} className="px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5" /> Saldo
                      </button>
                      <button onClick={() => toggleRevendedorRole(selectedRev)}
                        disabled={isTargetMaster(selectedRev.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${isTargetMaster(selectedRev.id) ? "opacity-40 cursor-not-allowed bg-muted/50 text-muted-foreground" : selectedRev.isRevendedor ? "bg-success/10 text-success hover:bg-success/20" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}
                      >
                        {selectedRev.isRevendedor ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                        {selectedRev.isRevendedor ? "Revenda" : "Revenda"}
                      </button>
                      {/* Cargo dropdown */}
                      <div className="relative">
                        <button
                          onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                          disabled={isTargetMaster(selectedRev.id) || changingRole}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                            isTargetMaster(selectedRev.id) ? "opacity-40 cursor-not-allowed bg-muted/50 text-muted-foreground" :
                            selectedRev.role === "admin" ? "bg-primary/10 text-primary hover:bg-primary/20" :
                            selectedRev.role === "suporte" ? "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20" :
                            "bg-muted/50 text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {changingRole ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Shield className="h-3.5 w-3.5" />}
                          {selectedRev.role === "admin" ? "Admin" : selectedRev.role === "suporte" ? "Suporte" : "Usuário"}
                          <ChevronDown className={`h-3 w-3 transition-transform ${showRoleDropdown ? "rotate-180" : ""}`} />
                        </button>
                        <AnimatePresence>
                          {showRoleDropdown && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => { setShowRoleDropdown(false); setShowAdminSubMenu(false); }} />
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute left-0 top-full mt-1 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden min-w-[180px]"
                              >
                                {/* Admin option with sub-menu */}
                                <div className="relative">
                                  <button
                                    disabled={selectedRev.role === "admin"}
                                    onClick={() => setShowAdminSubMenu(!showAdminSubMenu)}
                                    className={`w-full px-3 py-2 text-left text-xs font-medium flex items-center gap-2 transition-colors ${
                                      selectedRev.role === "admin" ? "bg-primary/10 text-primary" : "hover:bg-muted/50 text-foreground"
                                    }`}
                                  >
                                    <Shield className="h-3 w-3 text-primary" />
                                    Admin
                                    {selectedRev.role === "admin" && <Check className="h-3 w-3 ml-auto text-primary" />}
                                    {selectedRev.role !== "admin" && <ChevronRight className="h-3 w-3 ml-auto text-muted-foreground" />}
                                  </button>
                                  <AnimatePresence>
                                    {showAdminSubMenu && selectedRev.role !== "admin" && (
                                      <motion.div
                                        initial={{ opacity: 0, x: -5 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -5 }}
                                        className="border-t border-border bg-muted/30"
                                      >
                                        <button
                                          onClick={async () => {
                                            setShowRoleDropdown(false); setShowAdminSubMenu(false); setChangingRole(true);
                                            try {
                                              if (selectedRev.role && selectedRev.role !== "sem_role") {
                                                const { data: d1 } = await supabase.functions.invoke("admin-toggle-role", { body: { user_id: selectedRev.id, role: selectedRev.role, action: "remove" } });
                                                if (d1?.error) throw new Error(d1.error);
                                              }
                                              const { data: d2 } = await supabase.functions.invoke("admin-toggle-role", { body: { user_id: selectedRev.id, role: "admin" } });
                                              if (d2?.error) throw new Error(d2.error);
                                              // Set as master admin
                                              await supabase.from("system_config").upsert({ key: "masterAdminId", value: selectedRev.id }, { onConflict: "key" });
                                              setSelectedRev({ ...selectedRev, role: "admin" });
                                              setRevendedores(prev => prev.map(r => r.id === selectedRev.id ? { ...r, role: "admin" } : r));
                                              toast.success("Cargo alterado para Admin Master (acesso total)");
                                            } catch (err: any) { toast.error(err.message || "Erro ao alterar cargo"); } finally { setChangingRole(false); }
                                          }}
                                          className="w-full px-4 py-2 text-left text-xs font-medium flex items-center gap-2 hover:bg-primary/10 text-foreground"
                                        >
                                          <Trophy className="h-3 w-3 text-amber-500" />
                                          <div>
                                            <div className="font-semibold">Admin Master</div>
                                            <div className="text-[10px] text-muted-foreground">Acesso total + Principal</div>
                                          </div>
                                        </button>
                                        <button
                                          onClick={async () => {
                                            setShowRoleDropdown(false); setShowAdminSubMenu(false); setChangingRole(true);
                                            try {
                                              if (selectedRev.role && selectedRev.role !== "sem_role") {
                                                const { data: d1 } = await supabase.functions.invoke("admin-toggle-role", { body: { user_id: selectedRev.id, role: selectedRev.role, action: "remove" } });
                                                if (d1?.error) throw new Error(d1.error);
                                              }
                                              const { data: d2 } = await supabase.functions.invoke("admin-toggle-role", { body: { user_id: selectedRev.id, role: "admin" } });
                                              if (d2?.error) throw new Error(d2.error);
                                              setSelectedRev({ ...selectedRev, role: "admin" });
                                              setRevendedores(prev => prev.map(r => r.id === selectedRev.id ? { ...r, role: "admin" } : r));
                                              toast.success("Cargo alterado para Admin");
                                            } catch (err: any) { toast.error(err.message || "Erro ao alterar cargo"); } finally { setChangingRole(false); }
                                          }}
                                          className="w-full px-4 py-2 text-left text-xs font-medium flex items-center gap-2 hover:bg-muted/50 text-foreground"
                                        >
                                          <Shield className="h-3 w-3 text-primary" />
                                          <div>
                                            <div className="font-semibold">Apenas Admin</div>
                                            <div className="text-[10px] text-muted-foreground">Sem acesso ao Principal</div>
                                          </div>
                                        </button>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>

                                {/* Suporte */}
                                <button
                                  disabled={selectedRev.role === "suporte"}
                                  onClick={async () => {
                                    setShowRoleDropdown(false); setShowAdminSubMenu(false); setChangingRole(true);
                                    try {
                                      if (selectedRev.role && selectedRev.role !== "sem_role") {
                                        const { data: d1 } = await supabase.functions.invoke("admin-toggle-role", { body: { user_id: selectedRev.id, role: selectedRev.role, action: "remove" } });
                                        if (d1?.error) throw new Error(d1.error);
                                      }
                                      const { data: d2 } = await supabase.functions.invoke("admin-toggle-role", { body: { user_id: selectedRev.id, role: "suporte" } });
                                      if (d2?.error) throw new Error(d2.error);
                                      setSelectedRev({ ...selectedRev, role: "suporte" });
                                      setRevendedores(prev => prev.map(r => r.id === selectedRev.id ? { ...r, role: "suporte" } : r));
                                      toast.success("Cargo alterado para Suporte");
                                    } catch (err: any) { toast.error(err.message || "Erro ao alterar cargo"); } finally { setChangingRole(false); }
                                  }}
                                  className={`w-full px-3 py-2 text-left text-xs font-medium flex items-center gap-2 transition-colors ${
                                    selectedRev.role === "suporte" ? "bg-blue-500/10 text-blue-500" : "hover:bg-muted/50 text-foreground"
                                  }`}
                                >
                                  <Shield className="h-3 w-3 text-blue-500" />
                                  Suporte
                                  {selectedRev.role === "suporte" && <Check className="h-3 w-3 ml-auto text-blue-500" />}
                                </button>

                                {/* Usuário */}
                                <button
                                  disabled={selectedRev.role === "usuario" || !selectedRev.role || selectedRev.role === "sem_role"}
                                  onClick={async () => {
                                    setShowRoleDropdown(false); setShowAdminSubMenu(false); setChangingRole(true);
                                    try {
                                      if (selectedRev.role && selectedRev.role !== "sem_role") {
                                        const { data: d1 } = await supabase.functions.invoke("admin-toggle-role", { body: { user_id: selectedRev.id, role: selectedRev.role, action: "remove" } });
                                        if (d1?.error) throw new Error(d1.error);
                                      }
                                      setSelectedRev({ ...selectedRev, role: "usuario" });
                                      setRevendedores(prev => prev.map(r => r.id === selectedRev.id ? { ...r, role: "usuario" } : r));
                                      toast.success("Cargo alterado para Usuário");
                                    } catch (err: any) { toast.error(err.message || "Erro ao alterar cargo"); } finally { setChangingRole(false); }
                                  }}
                                  className={`w-full px-3 py-2 text-left text-xs font-medium flex items-center gap-2 transition-colors ${
                                    (selectedRev.role === "usuario" || !selectedRev.role || selectedRev.role === "sem_role") ? "bg-primary/10 text-primary" : "hover:bg-muted/50 text-foreground"
                                  }`}
                                >
                                  <Shield className="h-3 w-3 text-muted-foreground" />
                                  Usuário
                                  {(selectedRev.role === "usuario" || !selectedRev.role || selectedRev.role === "sem_role") && <Check className="h-3 w-3 ml-auto text-primary" />}
                                </button>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                      <button onClick={() => toggleActive(selectedRev)}
                        disabled={isTargetMaster(selectedRev.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${isTargetMaster(selectedRev.id) ? "opacity-40 cursor-not-allowed" : selectedRev.active ? "bg-destructive/10 text-destructive hover:bg-destructive/20" : "bg-success/10 text-success hover:bg-success/20"}`}
                      >
                        {selectedRev.active ? <><UserX className="h-3.5 w-3.5" /> Desativar</> : <><UserCheck className="h-3.5 w-3.5" /> Ativar</>}
                      </button>
                      {!isTargetMaster(selectedRev.id) && (
                        <button
                          onClick={async () => {
                            const ok = await confirm(`Tem certeza que deseja DELETAR permanentemente o usuário "${selectedRev.nome || selectedRev.email}"? Esta ação não pode ser desfeita.`, { destructive: true, confirmText: "Deletar" });
                            if (!ok) return;
                            try {
                              const { data, error } = await supabase.functions.invoke("admin-delete-user", { body: { user_id: selectedRev.id } });
                              if (error) throw error;
                              if (data?.error) throw new Error(data.error);
                              toast.success("Usuário deletado com sucesso!");
                              setView("lista");
                              setSelectedRev(null);
                              fetchData();
                            } catch (err: any) {
                              toast.error(err.message || "Erro ao deletar usuário");
                            }
                          }}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors bg-destructive/10 text-destructive hover:bg-destructive/20 flex items-center gap-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Deletar
                        </button>
                      )}
                      <button onClick={() => setShowPasswordModal(selectedRev)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors bg-warning/10 text-warning hover:bg-warning/20 flex items-center gap-1"
                      >
                        <KeyRound className="h-3.5 w-3.5" /> Senha
                      </button>
                    </div>
                    {isTargetMaster(selectedRev.id) && (
                      <div className="px-2.5 py-1.5 rounded-lg bg-warning/10 border border-warning/20 text-warning text-[10px] font-medium flex items-center gap-1.5">
                        <Shield className="h-3 w-3" /> Admin principal — protegido
                      </div>
                    )}
                </div>

                {/* Badge de Verificação — click to reveal + slide */}
                <div className="mt-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                  <button onClick={() => setShowBadgeDropdown(!showBadgeDropdown)} className="flex items-center gap-2 w-full">
                    <span className="text-xs text-muted-foreground font-medium">Selo de Verificação</span>
                    {(() => {
                      const bk = selectedRev.verification_badge as BadgeType | null;
                      if (bk && BADGE_CONFIG[bk]) {
                        const Ic = BADGE_CONFIG[bk].icon;
                        return <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-medium flex items-center gap-1"><Ic className={`h-3 w-3 ${BADGE_CONFIG[bk].color} ${BADGE_CONFIG[bk].fill}`} />{BADGE_CONFIG[bk].label}</span>;
                      }
                      return <span className="text-[10px] text-muted-foreground">Nenhum</span>;
                    })()}
                    <ChevronRight className={`h-3.5 w-3.5 ml-auto text-muted-foreground transition-transform duration-300 ${showBadgeDropdown ? "rotate-90" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {showBadgeDropdown && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-3">
                          <motion.button
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 }}
                            onClick={async () => {
                              await supabase.from("profiles").update({ verification_badge: null }).eq("id", selectedRev.id);
                              setSelectedRev({ ...selectedRev, verification_badge: null });
                              setRevendedores(prev => prev.map(r => r.id === selectedRev.id ? { ...r, verification_badge: null } : r));
                              toast.success("Selo removido");
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${!selectedRev.verification_badge ? "bg-primary/20 text-primary ring-1 ring-primary/40" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}
                          >
                            Nenhum
                          </motion.button>
                          {Object.entries(BADGE_CONFIG).map(([key, cfg], i) => {
                            const Icon = cfg.icon;
                            return (
                              <motion.button
                                key={key}
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: (i + 1) * 0.06 + 0.05 }}
                                onClick={async () => {
                                  await supabase.from("profiles").update({ verification_badge: key }).eq("id", selectedRev.id);
                                  setSelectedRev({ ...selectedRev, verification_badge: key });
                                  setRevendedores(prev => prev.map(r => r.id === selectedRev.id ? { ...r, verification_badge: key } : r));
                                  toast.success(`Selo "${cfg.label}" atribuído!`);
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${selectedRev.verification_badge === key ? "bg-primary/20 text-primary ring-1 ring-primary/40" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}
                              >
                                {key === "estrela" ? <VerificationBadge badge="estrela" size="sm" /> : <Icon className={`h-3.5 w-3.5 ${cfg.color} ${cfg.fill}`} />}
                                {cfg.label}
                              </motion.button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Rev KPIs */}
              {revLoading ? (
                <div className="space-y-3 py-4">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
              ) : revAnalytics && (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { label: "Saldo Disponível", value: fmt(selectedRev.saldo), color: "text-success" },
                      { label: "Cobrado pelo Sistema", value: fmt(revAnalytics.totalVendas), color: "text-primary" },
                      { label: "Recargas", value: `${revAnalytics.totalRec} (${revAnalytics.successRec} ✓)`, color: "text-foreground" },
                      { label: "Total de Depósitos", value: fmt(revAnalytics.totalDeposited), color: "text-warning" },
                      { label: "Custo da Operadora (API)", value: fmt(revAnalytics.totalCusto), color: "text-muted-foreground" },
                      { label: "Seu Lucro (Cobrado - Custo API)", value: fmt(revAnalytics.lucro), color: revAnalytics.lucro > 0 ? "text-success" : "text-destructive" },
                      { label: "Lucro do Revendedor (Preço Final - Cobrado)", value: fmt(revAnalytics.lucroRevenda), color: revAnalytics.lucroRevenda > 0 ? "text-accent" : "text-muted-foreground" },
                    ].map((c, i) => (
                      <motion.div key={c.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card rounded-xl p-4">
                        <p className="text-xs text-muted-foreground mb-1">{c.label}</p>
                        <p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Gateway do Revendedor */}
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" /> Gateway de Pagamento
                      </h4>
                      {Object.keys(revGatewayConfig).length > 0 && (
                        <button onClick={() => resetRevGateway(selectedRev.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors flex items-center gap-1">
                          <Trash2 className="h-3 w-3" /> Resetar
                        </button>
                      )}
                    </div>
                    {revGatewayLoading ? (
                      <div className="space-y-2">{[1,2].map(i => <SkeletonRow key={i} />)}</div>
                    ) : Object.keys(revGatewayConfig).length === 0 ? (
                      <div className="rounded-lg bg-muted/50 p-4 text-center">
                        <p className="text-sm text-muted-foreground">Nenhuma gateway individual configurada.</p>
                        <p className="text-xs text-muted-foreground mt-1">Este revendedor usa a <strong className="text-foreground">gateway global</strong>.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 rounded-lg bg-primary/5 border border-primary/20 p-3">
                          <span className="text-lg">{revGatewayConfig.paymentModule === "mercadopago" ? "💳" : revGatewayConfig.paymentModule === "pushinpay" ? "⚡" : revGatewayConfig.paymentModule === "efipay" ? "🏦" : revGatewayConfig.paymentModule === "virtualpay" ? "💎" : "🔧"}</span>
                          <div>
                            <p className="text-sm font-medium text-foreground">{gatewayLabel(revGatewayConfig.paymentModule)}</p>
                            <p className="text-xs text-muted-foreground">Gateway individual</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {Object.entries(revGatewayConfig).filter(([k]) => k !== "paymentModule").map(([key, value]) => (
                            <div key={key} className="rounded-lg border border-border p-3">
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{key}</p>
                              <p className="text-sm font-mono text-foreground truncate">{value ? `${value.slice(0, 12)}${"•".repeat(Math.max(0, value.length - 12))}` : "—"}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>

                  {/* Preços Personalizados */}
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card rounded-xl overflow-hidden">
                    <button
                      onClick={() => { setRevDetailPricingOpen(!revDetailPricingOpen); if (!revDetailPricingOpen && pricingOps.length === 0) fetchPricingData(); }}
                      className="w-full p-5 flex items-center justify-between hover:bg-muted/30 transition-colors"
                    >
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <Tag className="h-4 w-4 text-warning" /> Preços Personalizados
                        {revDetailPricingRules.length > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-warning/15 text-warning">{revDetailPricingRules.length} regra(s)</span>
                        )}
                      </h4>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${revDetailPricingOpen ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {revDetailPricingOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="px-5 pb-5 space-y-4">
                            {pricingOps.length === 0 ? (
                              <p className="text-sm text-muted-foreground text-center py-4">Carregando operadoras...</p>
                            ) : (
                              <>
                                <div className="flex gap-2 flex-wrap">
                                  {pricingOps.map(op => (
                                    <button key={op.id} onClick={() => setRevDetailPricingOp(op.id)}
                                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                        (revDetailPricingOp || pricingOps[0]?.id) === op.id
                                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                          : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted/70"
                                      }`}>
                                      <Package className="h-3.5 w-3.5" />{op.nome}
                                    </button>
                                  ))}
                                </div>
                                {(() => {
                                  const activeOpId = revDetailPricingOp || pricingOps[0]?.id;
                                  const activeOp = pricingOps.find(o => o.id === activeOpId);
                                  if (!activeOp) return null;
                                  return (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                      {activeOp.valores.sort((a: number, b: number) => a - b).map((valor: number) => {
                                        const normalizedValor = Number(valor);
                                        const rule = revDetailPricingRules.find(r => r.operadora_id === activeOpId && Number(r.valor_recarga) === normalizedValor);
                                        const globalRule = pricingRules.find(r => r.operadora_id === activeOpId && Number(r.valor_recarga) === normalizedValor);
                                        const localTipo = rule?.tipo_regra || globalRule?.tipo_regra || "fixo";
                                        const localValor = rule?.regra_valor ?? globalRule?.regra_valor ?? 0;
                                        const localCusto = rule?.custo ?? globalRule?.custo ?? 0;
                                        const globalPreco = globalRule ? (globalRule.tipo_regra === "fixo" ? globalRule.regra_valor : valor * (1 + globalRule.regra_valor / 100)) : 0;
                                        const apiCost = globalRule?.custo ?? 0;
                                        const hasCustom = !!rule;

                                        return (
                                          <PricingCard
                                            key={valor}
                                            valor={valor}
                                            savedTipo={localTipo}
                                            savedValor={localValor}
                                            savedCusto={localCusto}
                                            label={globalPreco > 0 ? `Global: ${fmtCurrency(globalPreco)}` : "—"}
                                            highlight={hasCustom}
                                            onSave={(data) => {
                                              if (!selectedRev) return;
                                              saveResellerPricingRule(selectedRev.id, { operadora_id: activeOpId, valor_recarga: valor, custo: data.custo, tipo_regra: data.tipo_regra, regra_valor: data.regra_valor });
                                            }}
                                            onReset={() => {
                                              if (!selectedRev) return;
                                              resetResellerPricingRule(selectedRev.id, activeOpId, valor);
                                            }}
                                          />
                                        );
                                      })}
                                    </div>
                                  );
                                })()}
                              </>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Últimas Recargas */}
                  <div className="glass-card rounded-xl p-5">
                    <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <History className="h-4 w-4 text-muted-foreground" /> Últimas Recargas
                    </h4>
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input type="text" value={revRecSearch} onChange={e => setRevRecSearch(e.target.value)} placeholder="Buscar por telefone, operadora..." className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-muted/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground" />
                    </div>
                    {(() => {
                      const q = revRecSearch.toLowerCase();
                      const filteredRecs = revRecargas.filter(r =>
                        !q || r.telefone.includes(q) || (r.operadora || "").toLowerCase().includes(q) || r.status.toLowerCase().includes(q)
                      );
                      return filteredRecs.length === 0 ? (
                      <p className="text-center py-6 text-muted-foreground text-sm">Nenhuma recarga encontrada</p>
                    ) : (
                      <>
                        {/* Mobile cards */}
                        <div className="md:hidden space-y-2">
                          {filteredRecs.slice(0, 25).map(r => {
                            // Status via plugin
                            return (
                              <div key={r.id} className="rounded-lg border border-border p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <p className="text-sm font-semibold text-foreground">{(r.operadora || "—").toUpperCase()}</p>
                                    <p className="text-xs text-muted-foreground font-mono">{r.telefone}</p>
                                  </div>
                                  <StatusBadge status={r.status} type="recarga" className="text-xs" />
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                  <span className="text-[10px] text-muted-foreground">{getRecargaTimeLabel(r)} {fmtDate(getRecargaTime(r))}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold font-mono text-sm text-foreground"><AnimatedCounter value={safeValor(r)} prefix="R$&nbsp;" duration={600} /></span>
                                    <button onClick={() => { navigator.clipboard.writeText(`${fmtDate(getRecargaTime(r))} | ${r.telefone} | ${r.operadora || "—"} | ${fmt(safeValor(r))} | ${r.status}`); toast.success("Copiado!"); }} className="p-1 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"><Copy className="h-3 w-3" /></button>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                                  <span>Custo: <span className="font-mono font-medium text-foreground">{fmt(r.custo ?? 0)}</span></span>
                                  <span>API: <span className="font-mono font-medium text-foreground">{fmt(r.custo_api ?? 0)}</span></span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {/* Desktop table */}
                        <div className="hidden md:block overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                               <tr className="border-b border-border">
                                <th className="text-left px-3 py-2 font-medium text-muted-foreground">Data</th>
                                <th className="text-left px-3 py-2 font-medium text-muted-foreground">Telefone</th>
                                <th className="text-left px-3 py-2 font-medium text-muted-foreground">Operadora</th>
                                <th className="text-right px-3 py-2 font-medium text-muted-foreground">Valor</th>
                                <th className="text-right px-3 py-2 font-medium text-muted-foreground">Custo</th>
                                <th className="text-right px-3 py-2 font-medium text-muted-foreground">Custo API</th>
                                <th className="text-center px-3 py-2 font-medium text-muted-foreground">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredRecs.slice(0, 25).map(r => (
                                <tr key={r.id} className="border-b border-border last:border-0">
                                  <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{fmtDate(getRecargaTime(r))}</td>
                                  <td className="px-3 py-2 font-mono text-foreground">{r.telefone}</td>
                                  <td className="px-3 py-2 text-foreground">{(r.operadora || "—").toUpperCase()}</td>
                                  <td className="px-3 py-2 text-right font-mono font-medium text-foreground"><Currency value={safeValor(r)} duration={600} /></td>
                                  <td className="px-3 py-2 text-right font-mono text-muted-foreground">{fmt(r.custo ?? 0)}</td>
                                  <td className="px-3 py-2 text-right font-mono text-muted-foreground">{fmt(r.custo_api ?? 0)}</td>
                                  <td className="px-3 py-2 text-center">
                                    <StatusBadge status={r.status} type="recarga" className="text-xs" />
                                  </td>
                                  <td className="px-1 py-2">
                                    <button onClick={() => { navigator.clipboard.writeText(`${fmtDate(getRecargaTime(r))} | ${r.telefone} | ${r.operadora || "—"} | ${fmt(safeValor(r))} | ${r.status}`); toast.success("Copiado!"); }} className="p-1 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"><Copy className="h-3 w-3" /></button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    );
                    })()}
                  </div>

                  {/* Últimos Depósitos */}
                  {revTransactions.length > 0 && (
                    <div className="glass-card rounded-xl p-5">
                      <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" /> Últimos Depósitos
                      </h4>
                      {/* Mobile cards */}
                      <div className="md:hidden space-y-2">
                        {revTransactions.slice(0, 20).map((t, i) => {
                          const isDeposit = t.type === "deposit" || t.type === "deposito";
                          const meta = t.metadata as any;
                          const payerName = meta?.payer_name || null;
                          const payerDoc = meta?.payer_document || null;
                          const isExpanded = expandedDepositId === t.id;
                          return (
                            <div key={t.id || i} className="rounded-lg border border-border overflow-hidden cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setExpandedDepositId(isExpanded ? null : t.id)}>
                              <div className="p-3">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="text-sm font-semibold text-foreground capitalize">{isDeposit ? "Depósito" : t.type}</p>
                                  <StatusBadge status={t.status} type="deposit" className="text-xs" />
                                </div>
                                {payerName && (
                                  <p className="text-[11px] text-muted-foreground truncate">👤 {payerName}{payerDoc ? ` · ${payerDoc}` : ""}</p>
                                )}
                                {t.payment_id && (
                                  <p className="text-[10px] text-muted-foreground/70 font-mono truncate mt-0.5">ID: {t.payment_id.slice(0, 16)}...</p>
                                )}
                                <div className="flex items-center justify-between pt-2 border-t border-border/50 mt-2">
                                  <span className="text-[10px] text-muted-foreground">{fmtDate(t.created_at)}</span>
                                  <div className="flex items-center gap-2">
                                    <span className={`font-bold font-mono text-sm ${isDeposit ? "text-success" : "text-foreground"}`}><AnimatedCounter value={t.amount} prefix="R$&nbsp;" duration={600} /></span>
                                    <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(`${fmtDate(t.created_at)} | ${isDeposit ? "Depósito" : t.type} | ${fmt(t.amount)} | ${getStatusLabel(t.status, "deposit")}`); toast.success("Copiado!"); }} className="p-1 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"><Copy className="h-3 w-3" /></button>
                                  </div>
                                </div>
                              </div>
                              {/* Expanded details */}
                              {isExpanded && meta && (
                                <div className="px-3 pb-3 pt-1 border-t border-border bg-muted/30 space-y-1.5 text-[11px]">
                                  {t.payment_id && (
                                    <div className="flex justify-between"><span className="text-muted-foreground">ID Pagamento:</span><span className="font-mono text-foreground break-all text-right max-w-[60%]">{t.payment_id}</span></div>
                                  )}
                                  {payerName && (
                                    <div className="flex justify-between"><span className="text-muted-foreground">Pagador:</span><span className="text-foreground font-medium">{payerName}</span></div>
                                  )}
                                  {payerDoc && (
                                    <div className="flex justify-between"><span className="text-muted-foreground">CPF:</span><span className="font-mono text-foreground">{payerDoc}</span></div>
                                  )}
                                  {meta.gateway && (
                                    <div className="flex justify-between"><span className="text-muted-foreground">Gateway:</span><span className="text-foreground capitalize">{meta.gateway}</span></div>
                                  )}
                                  {meta.fee_applied != null && (
                                    <div className="flex justify-between"><span className="text-muted-foreground">Taxa:</span><span className="text-foreground">R$ {Number(meta.fee_applied).toFixed(2)}{meta.fee_type ? ` (${meta.fee_type})` : ""}</span></div>
                                  )}
                                  {meta.credited_amount != null && (
                                    <div className="flex justify-between"><span className="text-muted-foreground">Creditado:</span><span className="text-success font-bold">R$ {Number(meta.credited_amount).toFixed(2)}</span></div>
                                  )}
                                  {meta.saldo_tipo && (
                                    <div className="flex justify-between"><span className="text-muted-foreground">Tipo Saldo:</span><span className="text-foreground capitalize">{meta.saldo_tipo}</span></div>
                                  )}
                                  {meta.confirmed_at && (
                                    <div className="flex justify-between"><span className="text-muted-foreground">Confirmado em:</span><span className="text-foreground">{fmtDate(meta.confirmed_at)}</span></div>
                                  )}
                                  {meta.end_to_end_id && (
                                    <div className="flex justify-between"><span className="text-muted-foreground">E2E ID:</span><span className="font-mono text-foreground text-right max-w-[60%] break-all">{meta.end_to_end_id}</span></div>
                                  )}
                                  <button onClick={(e) => {
                                    e.stopPropagation();
                                    const info = [
                                      `ID: ${t.payment_id || t.id}`,
                                      `Pagador: ${payerName || "—"}`,
                                      `CPF: ${payerDoc || "—"}`,
                                      `Valor: R$ ${Number(t.amount).toFixed(2)}`,
                                      `Creditado: R$ ${meta.credited_amount ? Number(meta.credited_amount).toFixed(2) : "—"}`,
                                      `Gateway: ${meta.gateway || "—"}`,
                                      `Status: ${t.status}`,
                                      `Data: ${fmtDate(t.created_at)}`,
                                    ].join("\n");
                                    navigator.clipboard.writeText(info);
                                    toast.success("Dados completos copiados!");
                                  }} className="w-full mt-1 py-1.5 rounded-md bg-primary/10 text-primary text-[11px] font-medium hover:bg-primary/20 transition-colors flex items-center justify-center gap-1">
                                    <Copy className="h-3 w-3" /> Copiar tudo
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {/* Desktop table */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left px-3 py-2 font-medium text-muted-foreground">Data</th>
                              <th className="text-left px-3 py-2 font-medium text-muted-foreground">Tipo</th>
                              <th className="text-left px-3 py-2 font-medium text-muted-foreground">Pagador</th>
                              <th className="text-left px-3 py-2 font-medium text-muted-foreground">ID Pagamento</th>
                              <th className="text-right px-3 py-2 font-medium text-muted-foreground">Valor</th>
                              <th className="text-center px-3 py-2 font-medium text-muted-foreground">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {revTransactions.slice(0, 20).map((t, i) => {
                              const meta = t.metadata as any;
                              const payerName = meta?.payer_name || "—";
                              const payerDoc = meta?.payer_document || "";
                              return (
                                <tr key={t.id || i} className="border-b border-border last:border-0 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setExpandedDepositId(expandedDepositId === t.id ? null : t.id)}>
                                  <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{fmtDate(t.created_at)}</td>
                                  <td className="px-3 py-2 text-foreground capitalize">{(t.type === "deposit" || t.type === "deposito") ? "Depósito" : t.type === "withdrawal" ? "Saque" : t.type}</td>
                                  <td className="px-3 py-2 text-foreground text-xs">
                                    <div>{payerName}</div>
                                    {payerDoc && <div className="text-[10px] text-muted-foreground font-mono">{payerDoc}</div>}
                                  </td>
                                  <td className="px-3 py-2 text-[10px] font-mono text-muted-foreground">{t.payment_id ? t.payment_id.slice(0, 16) + "..." : "—"}</td>
                                  <td className="px-3 py-2 text-right font-mono font-medium text-foreground"><Currency value={t.amount} duration={600} /></td>
                                  <td className="px-3 py-2 text-center">
                                    <StatusBadge status={t.status} type="deposit" className="text-xs" />
                                  </td>
                                  <td className="px-1 py-2">
                                    <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(`${fmtDate(t.created_at)} | Depósito | ${fmt(t.amount)} | ${payerName} | ${t.payment_id || ""}`); toast.success("Copiado!"); }} className="p-1 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"><Copy className="h-3 w-3" /></button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* ===== CONFIG API ===== */}
           {view === "config-api" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Info Card - API */}
              <InfoCard title="Configuração da API" items={[
                { icon: Smartphone, iconColor: "text-primary", label: "Provedor de Recarga", description: "URL e chave da API que processa as recargas de celular." },
                { icon: TrendingUp, iconColor: "text-success", label: "Margem de Lucro", description: "percentual adicionado sobre o custo base para definir o preço de venda." },
                { icon: Search, iconColor: "text-warning", label: "Consulta de Operadora", description: "identifica automaticamente a operadora pelo número do telefone." },
              ]} />

              {/* Header */}
              <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[hsl(280,70%,60%)]/15 flex items-center justify-center">
                    <Settings className="h-5 w-5 text-[hsl(280,70%,60%)]" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold text-foreground">API Recarga</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Provedor de recarga e consulta de operadora</p>
                  </div>
                </div>
              </div>
              {configLoading ? (
                <div className="space-y-3 py-4">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
              ) : (
                <>
                  <div className="glass-card rounded-2xl p-6 space-y-4">
                    <h4 className="font-semibold text-foreground text-lg flex items-center gap-2">
                      <Smartphone className="h-5 w-5 text-primary" /> Provedor de Recarga
                    </h4>
                    <div>
                      <label className="block text-sm font-bold text-foreground mb-1">API URL (Recarga Express)</label>
                      <input type="url" value={apiConfig.apiBaseURL || ""} onChange={e => setApiConfig(prev => ({ ...prev, apiBaseURL: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-md border border-input bg-muted/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="https://express.poeki.dev/api/v1" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-foreground mb-1">API Key</label>
                      <div className="relative">
                        <input type={showApiKey ? "text" : "password"} value={apiConfig.apiKey || ""} onChange={e => setApiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                          className="w-full px-3 py-2.5 pr-10 rounded-md border border-input bg-muted/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="re_xxxxxxxxxxxxxxxx" />
                        <button type="button" onClick={() => setShowApiKey(!showApiKey)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground">
                          {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-foreground mb-1">Margem de Lucro (%)</label>
                        <input type="number" value={apiConfig.margemLucro || ""} onChange={e => setApiConfig(prev => ({ ...prev, margemLucro: e.target.value }))}
                          className="w-full px-3 py-2.5 rounded-md border border-input bg-muted/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="30" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-foreground mb-1">Alerta de Saldo Baixo (R$)</label>
                        <input type="number" value={apiConfig.alertaSaldoBaixo || ""} onChange={e => setApiConfig(prev => ({ ...prev, alertaSaldoBaixo: e.target.value }))}
                          className="w-full px-3 py-2.5 rounded-md border border-input bg-muted/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="100" />
                        <span className="text-xs text-muted-foreground mt-1 block">0 para desativar.</span>
                      </div>
                    </div>
                    </div>

                    {/* Botão Testar Sincronização */}
                    <TestApiButton />
                  <div className="glass-card rounded-xl p-6 space-y-4">
                    <h4 className="font-semibold text-foreground text-lg flex items-center gap-2">
                      <Search className="h-5 w-5 text-primary" /> Consulta de Operadora
                    </h4>
                    <div>
                      <label className="block text-sm font-bold text-foreground mb-1">URL de Consulta</label>
                      <input type="url" value={apiConfig.consultaOperadoraURL || ""} onChange={e => setApiConfig(prev => ({ ...prev, consultaOperadoraURL: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-md border border-input bg-muted/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="https://poeki.dev/api/gateway/v1/operadora/query" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-foreground mb-1">API Key de Consulta</label>
                      <div className="relative">
                        <input type={showApiKey ? "text" : "password"} value={apiConfig.consultaOperadoraKey || ""} onChange={e => setApiConfig(prev => ({ ...prev, consultaOperadoraKey: e.target.value }))}
                          className="w-full px-3 py-2.5 pr-10 rounded-md border border-input bg-muted/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="pk_xxxxxxxxxxxxxxxx" />
                        <button type="button" onClick={() => setShowApiKey(!showApiKey)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground">
                          {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <TestConsultaButton url={apiConfig.consultaOperadoraURL || ""} apiKey={apiConfig.consultaOperadoraKey || ""} />
                  </div>

                  <div className="flex justify-end">
                    <button onClick={saveApiConfig} disabled={configSaving}
                      className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50">
                      {configSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      {configSaving ? "Salvando..." : "Salvar Configurações"}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* ===== PAGAMENTOS (GATEWAY GLOBAL) ===== */}
          {view === "pagamentos" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {globalConfigLoading ? (
                <div className="space-y-3 py-4">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
              ) : (
                <>
                  <InfoCard title="Gateway de Pagamento" items={[
                    { icon: CreditCard, iconColor: "text-primary", label: "Gateway Principal", description: "provedor que gera os QR Codes PIX para depósitos no sistema." },
                    { icon: Shield, iconColor: "text-warning", label: "Credenciais", description: "tokens de acesso do provedor selecionado. Mantenha em sigilo." },
                    { icon: KeyRound, iconColor: "text-success", label: "Webhook", description: "URL que recebe confirmações automáticas de pagamento." },
                  ]} />
                  <div className="glass-card rounded-2xl p-6 md:p-8 space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-display text-xl font-bold text-foreground">Gateway Principal</h4>
                        <p className="text-sm text-muted-foreground">Selecione o provedor de pagamento PIX do sistema</p>
                      </div>
                    </div>
                    <div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {[
                          { value: "mercadopago", label: "Mercado Pago", icon: "💳", desc: "Pagamentos via Mercado Pago" },
                          { value: "pushinpay", label: "PushinPay", icon: "⚡", desc: "Pagamentos PIX instantâneo" },
                          { value: "woovi", label: "Woovi (OpenPix)", icon: "🟢", desc: "PIX via OpenPix" },
                          { value: "efipay", label: "Efi Pay", icon: "🏦", desc: "Pagamentos via Efi" },
                          { value: "virtualpay", label: "VirtualPay", icon: "💎", desc: "Gateway VirtualPay" },
                          { value: "misticpay", label: "MisticPay", icon: "🔮", desc: "Gateway MisticPay" },
                          { value: "pixgo", label: "PixGo", icon: "🟣", desc: "PIX via PixGo/Depix" },
                        ].map(gw => (
                          <button
                            key={gw.value}
                            type="button"
                            onClick={() => setGlobalConfig(prev => ({ ...prev, paymentModule: gw.value }))}
                            className={`relative rounded-xl border-2 p-4 text-left transition-all ${
                              (globalConfig.paymentModule || "virtualpay") === gw.value
                                ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10'
                                : 'border-border bg-muted/30 hover:border-muted-foreground/30 hover:bg-muted/50'
                            }`}
                          >
                            <span className="text-2xl block mb-2">{gw.icon}</span>
                            <p className={`text-sm font-semibold ${(globalConfig.paymentModule || "virtualpay") === gw.value ? 'text-primary' : 'text-foreground'}`}>{gw.label}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{gw.desc}</p>
                            {(globalConfig.paymentModule || "virtualpay") === gw.value && (
                              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Mercado Pago */}
                  {globalConfig.paymentModule === "mercadopago" && (
                    <div className="glass-card rounded-xl p-6 space-y-4">
                      <h4 className="font-semibold text-primary text-lg">Configuração Mercado Pago</h4>
                      <div>
                        <label className="block text-sm font-bold text-foreground mb-1">Access Token</label>
                        <div className="relative">
                          <input type={showMpKeyProd ? "text" : "password"} value={globalConfig.mercadoPagoKeyProd || ""} onChange={e => setGlobalConfig(prev => ({ ...prev, mercadoPagoKeyProd: e.target.value }))}
                            className="w-full px-3 py-2.5 pr-10 rounded-md border border-input bg-muted/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="APP_USR-xxxx" />
                          <button type="button" onClick={() => setShowMpKeyProd(!showMpKeyProd)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground">
                            {showMpKeyProd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                        <input type="checkbox" checked={globalConfig.mercadoPagoModo === "test"} onChange={e => setGlobalConfig(prev => ({ ...prev, mercadoPagoModo: e.target.checked ? "test" : "prod" }))}
                          className="rounded border-input" />
                        Modo Sandbox (Testes)
                      </label>
                      {globalConfig.mercadoPagoModo === "test" && (
                        <div>
                          <label className="block text-sm font-bold text-foreground mb-1">Access Token de Teste</label>
                          <div className="relative">
                            <input type={showMpKeyTest ? "text" : "password"} value={globalConfig.mercadoPagoKeyTest || ""} onChange={e => setGlobalConfig(prev => ({ ...prev, mercadoPagoKeyTest: e.target.value }))}
                              className="w-full px-3 py-2.5 pr-10 rounded-md border border-input bg-muted/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="TEST-xxxx" />
                            <button type="button" onClick={() => setShowMpKeyTest(!showMpKeyTest)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground">
                              {showMpKeyTest ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* PushinPay */}
                  {globalConfig.paymentModule === "pushinpay" && (
                    <div className="glass-card rounded-xl p-6 space-y-4">
                      <h4 className="font-semibold text-primary text-lg">Configuração PushinPay</h4>
                      <div>
                        <label className="block text-sm font-bold text-foreground mb-1">Token</label>
                        <div className="relative">
                          <input type={showPpToken ? "text" : "password"} value={globalConfig.pushinPayToken || ""} onChange={e => setGlobalConfig(prev => ({ ...prev, pushinPayToken: e.target.value }))}
                            className="w-full px-3 py-2.5 pr-10 rounded-md border border-input bg-muted/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="61654|v8bWGW6Cq..." />
                          <button type="button" onClick={() => setShowPpToken(!showPpToken)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground">
                            {showPpToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Woovi */}
                  {globalConfig.paymentModule === "woovi" && (
                    <div className="glass-card rounded-xl p-6 space-y-4">
                      <h4 className="font-semibold text-primary text-lg">Configuração Woovi (OpenPix)</h4>
                      <div>
                        <label className="block text-sm font-bold text-foreground mb-1">App ID</label>
                        <input type="text" value={globalConfig.wooviAppId || ""} onChange={e => setGlobalConfig(prev => ({ ...prev, wooviAppId: e.target.value }))}
                          className="w-full px-3 py-2.5 rounded-md border border-input bg-muted/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Seu App ID" />
                      </div>
                    </div>
                  )}

                  {/* Efi Pay */}
                  {globalConfig.paymentModule === "efipay" && (
                    <div className="glass-card rounded-xl p-6 space-y-4">
                      <h4 className="font-semibold text-primary text-lg">🏦 Configuração Efi Pay</h4>
                      <div>
                        <label className="block text-sm font-bold text-foreground mb-1">Client ID</label>
                        <input type="text" value={globalConfig.efiPayClientId || ""} onChange={e => setGlobalConfig(prev => ({ ...prev, efiPayClientId: e.target.value }))}
                          className="w-full px-3 py-2.5 rounded-md border border-input bg-muted/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Client_Id_xxxx" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-foreground mb-1">Client Secret</label>
                        <div className="relative">
                          <input type={showVpSecret ? "text" : "password"} value={globalConfig.efiPayClientSecret || ""} onChange={e => setGlobalConfig(prev => ({ ...prev, efiPayClientSecret: e.target.value }))}
                            className="w-full px-3 py-2.5 pr-10 rounded-md border border-input bg-muted/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Client_Secret_xxxx" />
                          <button type="button" onClick={() => setShowVpSecret(!showVpSecret)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground">
                            {showVpSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                        <input type="checkbox" checked={globalConfig.efiPaySandbox === "true"} onChange={e => setGlobalConfig(prev => ({ ...prev, efiPaySandbox: e.target.checked ? "true" : "false" }))}
                          className="rounded border-input" />
                        Modo Sandbox (Testes)
                      </label>

                      {/* Upload Certificado .p12 */}
                      <div className="glass-card rounded-lg p-4 space-y-3 border border-primary/20">
                        <h5 className="font-bold text-foreground text-sm flex items-center gap-2">
                          <Shield className="h-4 w-4 text-primary" /> Certificado mTLS (.p12)
                        </h5>
                        <p className="text-xs text-muted-foreground">
                          Necessário para produção. Em sandbox, a autenticação funciona sem certificado.
                        </p>
                        {globalConfig.efiPayCertBase64 ? (
                          <div className="flex items-center gap-2 text-sm text-success">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="font-medium">Certificado configurado.</span>
                            <button onClick={() => setGlobalConfig(prev => ({ ...prev, efiPayCertBase64: "" }))}
                              className="ml-auto text-xs text-destructive hover:underline">Remover</button>
                          </div>
                        ) : (
                          <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md border border-dashed border-primary/40 hover:bg-primary/5 transition-colors">
                            <Upload className="h-4 w-4 text-primary" />
                            <span className="text-sm text-foreground">Selecionar arquivo .p12</span>
                            <input type="file" accept=".p12,.pem,.pfx" className="hidden" onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              try {
                                const reader = new FileReader();
                                reader.onload = () => {
                                  const base64 = (reader.result as string).split(",")[1] || reader.result as string;
                                  setGlobalConfig(prev => ({ ...prev, efiPayCertBase64: base64 }));
                                  toast.success("Certificado carregado! Clique em Salvar para confirmar.");
                                };
                                reader.readAsDataURL(file);
                              } catch {
                                toast.error("Erro ao ler certificado");
                              }
                            }} />
                          </label>
                        )}
                      </div>

                      {/* Automação PIX */}
                      <div className="glass-card rounded-lg p-4 space-y-3">
                        <h5 className="font-bold text-foreground text-sm">Automação PIX</h5>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Chave PIX (EVP)</label>
                          <input type="text" value={globalConfig.efiPayPixKey || ""} onChange={e => setGlobalConfig(prev => ({ ...prev, efiPayPixKey: e.target.value }))}
                            className="w-full px-3 py-2.5 rounded-md border border-input bg-muted/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Chave EVP ou sua chave PIX" />
                        </div>
                        <EfiSetupButton config={globalConfig} onKeyCreated={(key) => setGlobalConfig(prev => ({ ...prev, efiPayPixKey: key }))} />
                      </div>
                    </div>
                  )}

                  {/* VirtualPay */}
                  {globalConfig.paymentModule === "virtualpay" && (
                    <div className="glass-card rounded-xl p-6 space-y-4">
                      <h4 className="font-semibold text-primary text-lg">Configuração VirtualPay</h4>
                      <div>
                        <label className="block text-sm font-bold text-foreground mb-1">Client ID</label>
                        <input type="text" value={globalConfig.virtualPayClientId || ""} onChange={e => setGlobalConfig(prev => ({ ...prev, virtualPayClientId: e.target.value }))}
                          className="w-full px-3 py-2.5 rounded-md border border-input bg-muted/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Seu Client ID" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-foreground mb-1">Client Secret</label>
                        <div className="relative">
                          <input type={showVpSecret ? "text" : "password"} value={globalConfig.virtualPayClientSecret || ""} onChange={e => setGlobalConfig(prev => ({ ...prev, virtualPayClientSecret: e.target.value }))}
                            className="w-full px-3 py-2.5 pr-10 rounded-md border border-input bg-muted/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Seu Client Secret" />
                          <button type="button" onClick={() => setShowVpSecret(!showVpSecret)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground">
                            {showVpSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* MisticPay */}
                  {globalConfig.paymentModule === "misticpay" && (
                    <div className="glass-card rounded-xl p-6 space-y-4">
                      <h4 className="font-semibold text-primary text-lg">Configuração MisticPay</h4>
                      <div>
                        <label className="block text-sm font-bold text-foreground mb-1">Client ID</label>
                        <div className="relative">
                          <input type={showVpSecret ? "text" : "password"} value={globalConfig.misticPayClientId || ""} onChange={e => setGlobalConfig(prev => ({ ...prev, misticPayClientId: e.target.value }))}
                            className="w-full px-3 py-2.5 pr-10 rounded-md border border-input bg-muted/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Seu Client ID" />
                          <button type="button" onClick={() => setShowVpSecret(!showVpSecret)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground">
                            {showVpSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-foreground mb-1">Client Secret</label>
                        <div className="relative">
                          <input type={showVpSecret ? "text" : "password"} value={globalConfig.misticPayClientSecret || ""} onChange={e => setGlobalConfig(prev => ({ ...prev, misticPayClientSecret: e.target.value }))}
                            className="w-full px-3 py-2.5 pr-10 rounded-md border border-input bg-muted/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Seu Client Secret" />
                          <button type="button" onClick={() => setShowVpSecret(!showVpSecret)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground">
                            {showVpSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PixGo */}
                  {globalConfig.paymentModule === "pixgo" && (
                    <div className="glass-card rounded-xl p-6 space-y-4">
                      <div>
                        <h4 className="font-semibold text-foreground text-lg">Configurar PixGo (Depix)</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">Gateway de pagamento PIX via PixGo/Depix API com confirmação automática via webhook</p>
                      </div>

                      {/* Tabs */}
                      <div className="flex rounded-lg overflow-hidden glass">
                        <button onClick={() => setPixGoTab("credenciais")}
                          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${pixGoTab === "credenciais" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                          Credenciais
                        </button>
                        <button onClick={() => setPixGoTab("config")}
                          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${pixGoTab === "config" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                          Configurações
                        </button>
                      </div>

                      {pixGoTab === "credenciais" && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-bold text-foreground mb-1">API Key</label>
                            <div className="relative">
                              <input type={showVpSecret ? "text" : "password"} value={globalConfig.pixGoApiKey || ""} onChange={e => setGlobalConfig(prev => ({ ...prev, pixGoApiKey: e.target.value }))}
                                className="w-full px-3 py-2.5 pr-10 rounded-md border border-input bg-muted/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring font-mono" placeholder="pk_xxxxxxxxxxxx" />
                              <button type="button" onClick={() => setShowVpSecret(!showVpSecret)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground">
                                {showVpSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>

                          <button onClick={async () => {
                            setPixGoTesting(true);
                            setPixGoStatus("idle");
                            try {
                              const resp = await fetch("https://pixgo.org/api/v1/payment/create", {
                                method: "POST",
                                headers: { "Content-Type": "application/json", "X-API-Key": globalConfig.pixGoApiKey || "" },
                                body: JSON.stringify({ amount: 0.01, description: "test-connection" }),
                              });
                              if (resp.status === 401 || resp.status === 403) {
                                setPixGoStatus("error");
                                toast.error("API Key inválida!");
                              } else {
                                setPixGoStatus("ok");
                                toast.success("Conexão com PixGo OK!");
                              }
                            } catch {
                              setPixGoStatus("error");
                              toast.error("Erro ao conectar com PixGo");
                            }
                            setPixGoTesting(false);
                          }} disabled={pixGoTesting || !globalConfig.pixGoApiKey}
                            className="w-full py-2.5 rounded-lg border border-border bg-muted/50 text-foreground text-sm font-medium flex items-center justify-center gap-2 hover:bg-muted transition-colors disabled:opacity-50">
                            <RefreshCw className={`h-4 w-4 ${pixGoTesting ? "animate-spin" : ""}`} />
                            {pixGoTesting ? "Testando..." : "Sincronizar / Testar Conexão"}
                          </button>

                          {pixGoStatus === "ok" && (
                            <div className="flex items-center gap-2 text-success text-sm">
                              <CheckCircle2 className="h-4 w-4" /> Conexão verificada com sucesso!
                            </div>
                          )}
                          {pixGoStatus === "error" && (
                            <div className="flex items-center gap-2 text-destructive text-sm">
                              <AlertTriangle className="h-4 w-4" /> Falha na conexão — verifique a API Key
                            </div>
                          )}
                        </div>
                      )}

                      {pixGoTab === "config" && (
                        <div className="space-y-4">
                          {/* Webhook URL */}
                          <div className="glass-card rounded-lg p-4 space-y-2">
                            <div className="flex items-center gap-2">
                              <Link2 className="h-4 w-4 text-primary" />
                              <h5 className="font-bold text-foreground text-sm">Webhook PIX Automático</h5>
                            </div>
                            <p className="text-xs text-muted-foreground">Configure esta URL no painel do PixGo (Depix) para confirmação automática de pagamentos.</p>
                            <div className="flex items-center gap-2">
                              <input type="text" readOnly value={`https://xtkqyjruyuydlbvwduuy.supabase.co/functions/v1/pix-webhook?gateway=pixgo`}
                                className="flex-1 px-3 py-2 rounded-md border border-input bg-muted/50 text-foreground text-xs font-mono focus:outline-none" />
                              <button onClick={() => { navigator.clipboard.writeText(`https://xtkqyjruyuydlbvwduuy.supabase.co/functions/v1/pix-webhook?gateway=pixgo`); toast.success("URL copiada!"); }}
                                className="p-2 rounded-md border border-border hover:bg-muted transition-colors text-muted-foreground shrink-0">
                                <Copy className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {/* Limites */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-bold text-foreground mb-1">Depósito Mínimo (R$)</label>
                              <input type="number" value={globalConfig.pixGoDepositoMinimo || globalConfig.depositoMinimo || ""} onChange={e => setGlobalConfig(prev => ({ ...prev, pixGoDepositoMinimo: e.target.value }))}
                                className="w-full px-3 py-2.5 rounded-md border border-input bg-muted/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="10" />
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-foreground mb-1">Depósito Máximo (R$)</label>
                              <input type="number" value={globalConfig.pixGoDepositoMaximo || globalConfig.depositoMaximo || ""} onChange={e => setGlobalConfig(prev => ({ ...prev, pixGoDepositoMaximo: e.target.value }))}
                                className="w-full px-3 py-2.5 rounded-md border border-input bg-muted/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="3000" />
                            </div>
                          </div>

                          {/* Taxas */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-bold text-foreground mb-1">Taxa Percentual (%)</label>
                              <input type="number" step="0.1" value={globalConfig.pixGoTaxaPercentual || ""} onChange={e => setGlobalConfig(prev => ({ ...prev, pixGoTaxaPercentual: e.target.value }))}
                                className="w-full px-3 py-2.5 rounded-md border border-input bg-muted/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="0" />
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-foreground mb-1">Taxa Fixa (R$)</label>
                              <input type="number" step="0.01" value={globalConfig.pixGoTaxaFixa || ""} onChange={e => setGlobalConfig(prev => ({ ...prev, pixGoTaxaFixa: e.target.value }))}
                                className="w-full px-3 py-2.5 rounded-md border border-input bg-muted/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="0" />
                            </div>
                          </div>

                          {/* Sandbox */}
                          <div className="glass-card rounded-lg p-4 flex items-center justify-between">
                            <div>
                              <p className="font-bold text-foreground text-sm">Modo Sandbox</p>
                              <p className="text-xs text-muted-foreground">Use ambiente de testes (sem transações reais)</p>
                            </div>
                            <button onClick={() => setGlobalConfig(prev => ({ ...prev, pixGoSandbox: prev.pixGoSandbox === "true" ? "false" : "true" }))}
                              className="relative w-11 h-6 rounded-full transition-colors"
                              style={{ backgroundColor: globalConfig.pixGoSandbox === "true" ? "hsl(var(--primary))" : "hsl(var(--muted))" }}>
                              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${globalConfig.pixGoSandbox === "true" ? "translate-x-5" : ""}`} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* ===== DEPÓSITOS ===== */}
           {view === "depositos" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {globalConfigLoading ? (
                <div className="space-y-3 py-4">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
              ) : (
                <>
                   {/* Info Card - Depósitos */}
                   <InfoCard title="Regras de Depósito" items={[
                     { icon: Landmark, iconColor: "text-success", label: "Limites", description: "valores mínimo e máximo aceitos por depósito PIX." },
                     { icon: Shield, iconColor: "text-warning", label: "Anti-spam", description: "limita quantos QR Codes pendentes um usuário pode ter simultaneamente." },
                     { icon: DollarSign, iconColor: "text-primary", label: "Taxas", description: "valor fixo ou percentual descontado do depósito antes de creditar ao cliente." },
                   ]} />

                   {/* Header */}
                   <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-success/15 flex items-center justify-center">
                        <Landmark className="h-5 w-5 text-success" />
                      </div>
                      <div>
                        <h2 className="font-display text-xl font-bold text-foreground">Depósitos</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">Limites, regras e taxas de depósito PIX</p>
                      </div>
                    </div>
                   </div>

                  <div className="glass-card rounded-2xl p-6 space-y-4">
                    <h4 className="font-semibold text-foreground text-lg">Limites e Regras</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-foreground mb-1">Depósito Mínimo (R$)</label>
                        <input type="number" value={globalConfig.depositoMinimo || ""} onChange={e => setGlobalConfig(prev => ({ ...prev, depositoMinimo: e.target.value }))}
                          className="w-full px-3 py-2.5 rounded-md border border-input bg-muted/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="20" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-foreground mb-1">Depósito Máximo (R$)</label>
                        <input type="number" value={globalConfig.depositoMaximo || ""} onChange={e => setGlobalConfig(prev => ({ ...prev, depositoMaximo: e.target.value }))}
                          className="w-full px-3 py-2.5 rounded-md border border-input bg-muted/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="1000" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-foreground mb-1">Máximo de PIX Pendentes</label>
                      <input type="number" value={globalConfig.maxPixPendentes || ""} onChange={e => setGlobalConfig(prev => ({ ...prev, maxPixPendentes: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-md border border-input bg-muted/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="2" />
                      <span className="text-xs text-muted-foreground mt-1 block">Impede spam de QR Codes por usuário.</span>
                    </div>
                  </div>

                  <div className="glass-card rounded-xl p-6 space-y-4">
                    <h4 className="font-semibold text-foreground text-lg flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" /> Taxas ao Cliente
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1.5">Tipo de Taxa</label>
                        <select value={globalConfig.taxaTipo || "fixo"} onChange={e => setGlobalConfig(prev => ({ ...prev, taxaTipo: e.target.value }))}
                          className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer"
                          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2388888b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}>
                          <option value="fixo">Valor Fixo (R$)</option>
                          <option value="percentual">Percentual (%)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1.5">Valor da Taxa</label>
                        <div className="relative">
                          <input type="text" value={globalConfig.taxaValor || ""} onChange={e => setGlobalConfig(prev => ({ ...prev, taxaValor: e.target.value }))}
                            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring font-mono" placeholder={globalConfig.taxaTipo === "percentual" ? "5" : "0,45"} />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                            {globalConfig.taxaTipo === "percentual" ? "%" : "R$"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0" />
                      Esta taxa é descontada do valor creditado ao cliente.
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* ===== BOT TELEGRAM ===== */}
           {view === "bot" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

              {/* Info Card - Bot */}
              <InfoCard title="Bot do Telegram" items={[
                { icon: Bot, iconColor: "text-primary", label: "Token", description: "chave de acesso obtida no @BotFather para conectar seu bot." },
                { icon: Wifi, iconColor: "text-success", label: "Webhook", description: "URL que recebe atualizações do Telegram em tempo real." },
                { icon: Send, iconColor: "text-warning", label: "Mensagens", description: "o bot processa recargas, cadastros e broadcasts automaticamente." },
              ]} />

              {/* ── Compact Header ── */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-bold text-foreground">Telegram Bot</h2>
                    <p className="text-[11px] text-muted-foreground">
                      {botStatus.connected ? `@${botStatus.botUsername || "—"}` : "Não conectado"}
                    </p>
                  </div>
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                  botStatus.connected
                    ? "bg-success/10 text-success border border-success/20"
                    : botStatus.error
                    ? "bg-destructive/10 text-destructive border border-destructive/20"
                    : "bg-muted text-muted-foreground border border-border"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${botStatus.connected ? "bg-success" : botStatus.error ? "bg-destructive" : "bg-muted-foreground"}`} />
                  {botStatus.connected ? "Online" : botStatus.error ? "Erro" : "Pendente"}
                </div>
              </div>

              {botStatus.error && !botStatus.connected && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/5 border border-destructive/15 text-destructive text-xs">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{botStatus.error}</span>
                </div>
              )}

              {globalConfigLoading ? (
                <div className="space-y-3 py-4">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
              ) : (
                <>
                  {/* ── Info & Webhook ── */}
                  {botStatus.connected && (
                    <div className="rounded-xl border border-border bg-card divide-y divide-border">
                      {/* Bot info rows */}
                      <div className="grid grid-cols-3 divide-x divide-border">
                        {[
                          { label: "Nome", value: botStatus.botName || "—" },
                          { label: "ID", value: botStatus.botId || "—" },
                          { label: "Pendentes", value: String(botStatus.pendingUpdates ?? 0), warn: (botStatus.pendingUpdates ?? 0) > 0 },
                        ].map(s => (
                          <div key={s.label} className="px-3 py-3 text-center">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-0.5">{s.label}</p>
                            <p className={`text-xs font-bold truncate ${(s as any).warn ? "text-warning" : "text-foreground"}`}>{s.value}</p>
                          </div>
                        ))}
                      </div>

                      {/* Webhook row */}
                      <div className="px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Wifi className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-foreground">Webhook</p>
                            {botStatus.webhookUrl && (
                              <p className="text-[10px] text-muted-foreground font-mono truncate">{botStatus.webhookUrl}</p>
                            )}
                            {botStatus.lastSyncAt && (
                              <p className="text-[10px] text-muted-foreground">Sync: {formatTimeBR(new Date(botStatus.lastSyncAt))}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button onClick={() => {
                            if (!globalConfig.telegramBotToken) { toast.error("Configure o token primeiro"); return; }
                            refreshBotStatus();
                          }} disabled={botStatus.loading} className="h-7 w-7 rounded-lg border border-input bg-background flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50" title="Atualizar">
                            <RefreshCw className={`h-3 w-3 text-muted-foreground ${botStatus.loading ? "animate-spin" : ""}`} />
                          </button>
                          <button onClick={async () => {
                            if (!globalConfig.telegramBotToken) return;
                            try {
                              toast.info("Resetando webhook...");
                              await fetch(`https://api.telegram.org/bot${globalConfig.telegramBotToken}/deleteWebhook?drop_pending_updates=true`);
                              await new Promise(r => setTimeout(r, 1000));
                              const resp = await supabase.functions.invoke("telegram-setup", {
                                body: { token: globalConfig.telegramBotToken },
                              });
                              if (resp.error) throw resp.error;
                              if (!resp.data?.success) throw new Error(resp.data?.error || "Falha");
                              await refreshBotStatus(globalConfig.telegramBotToken, { silent: true });
                              toast.success("Webhook resetado!");
                            } catch { toast.error("Erro ao resetar webhook"); }
                          }} className="h-7 px-2 rounded-lg border border-warning/30 text-warning text-[10px] font-semibold hover:bg-warning/10 transition-colors flex items-center gap-1" title="Resetar">
                            <RotateCcw className="h-2.5 w-2.5" /> Reset
                          </button>
                        </div>
                      </div>

                      {/* Webhook error */}
                      {botStatus.webhookError && (
                        <div className={`flex items-center gap-2 px-4 py-2.5 text-[11px] ${webhookErrorIsActive ? "bg-warning/5 text-warning" : "bg-muted/30 text-muted-foreground"}`}>
                          <AlertTriangle className="h-3 w-3 shrink-0" />
                          <span className="truncate">{botStatus.webhookError}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Token ── */}
                  <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <button onClick={() => setTokenSectionOpen(!tokenSectionOpen)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <Link2 className="h-4 w-4 text-warning" />
                        <span className="text-sm font-medium text-foreground">Token do Bot</span>
                      </div>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${tokenSectionOpen ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {tokenSectionOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
                          <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                            <p className="text-[11px] text-muted-foreground">Alterar o token desconectará o bot atual.</p>
                            <div className="flex items-center gap-2">
                              <div className="relative flex-1">
                                <input type={showApiKey ? "text" : "password"} value={globalConfig.telegramBotToken || ""} onChange={e => setGlobalConfig(prev => ({ ...prev, telegramBotToken: e.target.value }))}
                                  className="w-full px-3 py-2 pr-9 rounded-lg border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring font-mono" placeholder="123456789:ABC-DEF..." />
                                <button type="button" onClick={() => setShowApiKey(!showApiKey)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                  {showApiKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                </button>
                              </div>
                              <button onClick={async () => {
                                const token = globalConfig.telegramBotToken;
                                if (!token) { toast.error("Insira o token"); return; }
                                setValidatingToken(true);
                                try {
                                  const resp = await fetch(`https://api.telegram.org/bot${token}/getMe`);
                                  const data = await resp.json();
                                  if (!data.ok) {
                                    toast.error("Token inválido: " + (data.description || "Erro desconhecido"));
                                    setValidatingToken(false);
                                    return;
                                  }
                                  const { error: cfgError } = await supabase.from("system_config").upsert(
                                    { key: "telegramBotToken", value: token, updated_at: new Date().toISOString() },
                                    { onConflict: "key" }
                                  );
                                  if (cfgError) throw cfgError;
                                  toast.info("Configurando webhook...");
                                  const setupResp = await supabase.functions.invoke("telegram-setup", {
                                    body: { token },
                                  });
                                  if (setupResp.error) {
                                    console.error("Webhook setup error:", setupResp.error);
                                    toast.warning("Token salvo, mas falha ao configurar webhook.");
                                  } else if (!setupResp.data?.success) {
                                    toast.warning(`Token salvo, mas webhook falhou: ${setupResp.data?.error || "Erro"}`);
                                  } else {
                                    toast.success(`Bot configurado! ${data.result.first_name} (@${data.result.username})`);
                                  }
                                  setBotStatus({
                                    connected: true, loading: false,
                                    botName: data.result.first_name, botUsername: data.result.username,
                                    botId: String(data.result.id), error: null,
                                    webhookUrl: setupResp.data?.webhook || null,
                                    webhookError: null, webhookErrorAt: null, pendingUpdates: null, lastSyncAt: Date.now(),
                                  });
                                  await fetchGlobalConfig();
                                } catch (err: any) {
                                  toast.error(err.message || "Erro de conexão");
                                }
                                setValidatingToken(false);
                              }} disabled={validatingToken} className="px-3.5 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-xs hover:opacity-90 disabled:opacity-50 transition-colors whitespace-nowrap">
                                {validatingToken ? "..." : "Conectar"}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* ── Links ── */}
                  <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 border-b border-border flex items-center gap-2.5">
                      <Globe className="h-4 w-4 text-accent" />
                      <span className="text-sm font-medium text-foreground">Links do Telegram</span>
                    </div>
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-muted-foreground mb-1">URL do Grupo</label>
                        <input type="url" value={globalConfig.telegramGroupUrl || ""} onChange={e => setGlobalConfig(prev => ({ ...prev, telegramGroupUrl: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring" placeholder="https://t.me/seugrupo" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-muted-foreground mb-1">URL de Suporte</label>
                        <input type="url" value={globalConfig.supportUrl || ""} onChange={e => setGlobalConfig(prev => ({ ...prev, supportUrl: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring" placeholder="https://t.me/seusuporte" />
                      </div>
                    </div>
                  </div>

                  {/* ── Menu do Bot ── */}
                  <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Menu className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">Menu do Bot</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {[
                          { key: "bot_btn_saldo", defaultOn: true },
                          { key: "bot_btn_recarga", defaultOn: true },
                          { key: "bot_btn_historico", defaultOn: true },
                          { key: "bot_btn_deposito", defaultOn: true },
                          { key: "bot_btn_conta", defaultOn: true },
                          { key: "bot_btn_webapp", defaultOn: true },
                          { key: "bot_btn_migration", defaultOn: false },
                          { key: "bot_btn_ajuda", defaultOn: true },
                        ].filter(b => globalConfig[b.key] !== undefined ? globalConfig[b.key] === "true" : b.defaultOn).length} de 8 ativos
                      </span>
                    </div>
                    <div className="p-3 space-y-1">
                      {[
                        { key: "bot_btn_saldo", label: "Ver Saldo", emoji: "💰", defaultOn: true },
                        { key: "bot_btn_recarga", label: "Fazer Recarga", emoji: "📱", defaultOn: true },
                        { key: "bot_btn_historico", label: "Histórico", emoji: "📋", defaultOn: true },
                        { key: "bot_btn_deposito", label: "Depositar PIX", emoji: "💳", defaultOn: true },
                        { key: "bot_btn_conta", label: "Minha Conta", emoji: "👤", defaultOn: true },
                        { key: "bot_btn_webapp", label: "Web App", emoji: "🌐", defaultOn: true },
                        { key: "bot_btn_migration", label: "Saldo Antigo", emoji: "🔄", defaultOn: false },
                        { key: "bot_btn_ajuda", label: "Ajuda", emoji: "❓", defaultOn: true },
                      ].map(btn => {
                        const isOn = globalConfig[btn.key] !== undefined ? globalConfig[btn.key] === "true" : btn.defaultOn;
                        return (
                          <button
                            key={btn.key}
                            onClick={() => setGlobalConfig(prev => ({ ...prev, [btn.key]: isOn ? "false" : "true" }))}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                              isOn ? "hover:bg-primary/5" : "opacity-50 hover:opacity-70"
                            }`}
                          >
                            <span className="text-base w-6 text-center">{btn.emoji}</span>
                            <span className={`flex-1 text-sm ${isOn ? "text-foreground font-medium" : "text-muted-foreground line-through"}`}>{btn.label}</span>
                            <div className={`w-8 h-[18px] rounded-full relative transition-colors ${isOn ? "bg-primary" : "bg-muted"}`}>
                              <div className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white shadow-sm transition-transform ${isOn ? "left-[16px]" : "left-[2px]"}`} />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {/* Web App URL */}
                    <div className="px-4 pb-4 pt-1 border-t border-border">
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1 mt-3">URL do Web App</label>
                      <input type="url" value={globalConfig.webAppUrl || ""} onChange={e => setGlobalConfig(prev => ({ ...prev, webAppUrl: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring" placeholder="ex: https://meudominio.com/miniapp" />
                      <p className="text-[10px] text-muted-foreground mt-1">Deixe vazio para usar o padrão.</p>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* ===== GERAL ===== */}
          {view === "geral" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Header */}
              <div className="glass-card rounded-2xl p-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">Configurações</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Gerencie todas as configurações do sistema</p>
                </div>
              </div>

              {/* Section Navigation */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                {([
                  { key: "geral" as const, label: "Sistema", icon: Globe, emoji: "⚙️" },
                  { key: "rede" as const, label: "Rede", icon: TrendingUp, emoji: "🔗" },
                  { key: "jogos" as const, label: "Jogos", icon: Trophy, emoji: "🎰" },
                  { key: "notificacoes" as const, label: "Alertas", icon: Megaphone, emoji: "🔔" },
                  { key: "banners" as const, label: "Banners", icon: Image, emoji: "🖼️" },
                ] as const).map(s => (
                  <button
                    key={s.key}
                    onClick={() => setConfigSection(s.key)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      configSection === s.key
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground border border-border/40"
                    }`}
                  >
                    <span className="text-sm">{s.emoji}</span>
                    {s.label}
                  </button>
                ))}
              </div>

              {globalConfigLoading ? (
                <div className="space-y-3 py-4">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
              ) : (
                <>
                {/* ═══════ SETOR: SISTEMA ═══════ */}
                {configSection === "geral" && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    {/* Info Card - Sistema */}
                    <InfoCard title="Configurações do Sistema" items={[
                      { icon: Globe, iconColor: "text-primary", label: "Nome do Site", description: "título exibido no navegador e em compartilhamentos." },
                      { icon: AlertTriangle, iconColor: "text-warning", label: "Modo Manutenção", description: "bloqueia acesso público ao site, apenas admins podem entrar." },
                      { icon: Zap, iconColor: "text-accent-foreground", label: "Temas Sazonais", description: "ativa efeitos visuais especiais para datas comemorativas." },
                    ]} />

                    {/* Nome do Site + Logo */}
                    <div className="glass-card rounded-xl p-5 space-y-4">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <Globe className="h-4 w-4 text-primary" /> Configurações Gerais
                      </h4>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Nome do Site</label>
                        <input type="text" value={globalConfig.siteTitle || ""} onChange={e => setGlobalConfig(prev => ({ ...prev, siteTitle: e.target.value }))}
                          className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Nome da sua empresa" />
                      </div>

                      {/* Logo do Site */}
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Logo do Site</label>
                        <p className="text-xs text-muted-foreground mb-2">Aparece na splash screen, login, instalação e mini app. Recomendado: 256×256px.</p>
                        <div className="flex items-center gap-4">
                          {globalConfig.siteLogo && (
                            <img src={globalConfig.siteLogo} alt="Logo atual" className="w-16 h-16 rounded-xl object-cover border border-border shadow-sm" />
                          )}
                          <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border text-sm font-medium text-foreground hover:bg-muted/80 transition-colors">
                            <Upload className="h-4 w-4" />
                            {logoUploading ? "Enviando…" : "Trocar Logo"}
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              className="hidden"
                              disabled={logoUploading}
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                if (file.size > 2 * 1024 * 1024) { toast.error("Imagem deve ter no máximo 2MB"); return; }
                                setLogoUploading(true);
                                try {
                                  const ext = file.name.split('.').pop() || 'png';
                                  const path = `site/logo.${ext}`;
                                  const { error: upErr } = await supabase.storage.from("store-logos").upload(path, file, { upsert: true, contentType: file.type });
                                  if (upErr) throw upErr;
                                  const { data: urlData } = supabase.storage.from("store-logos").getPublicUrl(path);
                                  const publicUrl = urlData.publicUrl + '?v=' + Date.now();
                                  setGlobalConfig(prev => ({ ...prev, siteLogo: publicUrl }));
                                  // Save immediately
                                  await supabase.from("system_config").upsert({ key: "siteLogo", value: publicUrl, updated_at: new Date().toISOString() }, { onConflict: "key" });
                                  // Clear cache
                                  try { localStorage.removeItem("cached_site_logo"); } catch {}
                                  toast.success("Logo atualizada com sucesso!");
                                } catch (err: any) {
                                  toast.error(err.message || "Erro ao enviar logo");
                                } finally {
                                  setLogoUploading(false);
                                  e.target.value = "";
                                }
                              }}
                            />
                          </label>
                          {globalConfig.siteLogo && (
                            <button
                              onClick={async () => {
                                setGlobalConfig(prev => ({ ...prev, siteLogo: "" }));
                                await supabase.from("system_config").upsert({ key: "siteLogo", value: "", updated_at: new Date().toISOString() }, { onConflict: "key" });
                                try { localStorage.removeItem("cached_site_logo"); } catch {}
                                toast.success("Logo removida — voltou ao padrão.");
                              }}
                              className="text-xs text-destructive hover:underline"
                            >
                              Remover
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">URL do Site</label>
                        <input type="text" value={globalConfig.siteUrl || ""} onChange={e => setGlobalConfig(prev => ({ ...prev, siteUrl: e.target.value }))}
                          className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="https://seudominio.com" />
                        <p className="text-xs text-muted-foreground mt-1">Domínio principal usado em links do bot, emails e OG tags</p>
                      </div>
                    </div>

                    {/* Modo Manutenção */}
                    <div className="glass-card rounded-xl p-5 space-y-4">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-warning" /> Modo Manutenção
                      </h4>
                      <div className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                        globalConfig.maintenanceMode === 'true' ? 'border-warning bg-warning/10' : 'border-border bg-muted/30'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                            globalConfig.maintenanceMode === "true" ? "bg-warning/20" : "bg-muted"
                          }`}>
                            <AlertTriangle className="h-5 w-5 text-warning" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">Status do Site</p>
                            <p className="text-[11px] text-muted-foreground">
                              {globalConfig.maintenanceMode === "true"
                                ? "🔴 O site está INACESSÍVEL para os usuários"
                                : "🟢 O site está funcionando normalmente"}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowMaintenanceDialog(true)}
                          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                            globalConfig.maintenanceMode === "true"
                              ? "bg-success text-success-foreground hover:opacity-90"
                              : "bg-warning text-warning-foreground hover:opacity-90"
                          }`}
                        >
                          {globalConfig.maintenanceMode === "true" ? "Desativar" : "Ativar Manutenção"}
                        </button>
                      </div>
                    </div>

                    {/* Verificação de E-mail */}
                    <div className="glass-card rounded-xl p-5 space-y-4">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary" /> Verificação de E-mail
                      </h4>
                      <div className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                        globalConfig.emailVerificationEnabled === 'true' ? 'border-primary bg-primary/10' : 'border-border bg-muted/30'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                            globalConfig.emailVerificationEnabled === "true" ? "bg-primary/20" : "bg-muted"
                          }`}>
                            <Mail className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">Confirmar E-mail no Cadastro</p>
                            <p className="text-[11px] text-muted-foreground">
                              {globalConfig.emailVerificationEnabled === "true"
                                ? "🔵 Novos usuários precisam confirmar o e-mail antes de acessar"
                                : "🟢 Novos usuários entram direto sem verificação de e-mail"}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            const newVal = globalConfig.emailVerificationEnabled !== "true";
                            try {
                              const { data, error } = await supabase.functions.invoke("admin-toggle-email-verify", {
                                body: { enabled: newVal },
                              });
                              if (error) throw error;
                              setGlobalConfig(prev => ({ ...prev, emailVerificationEnabled: newVal ? "true" : "false" }));
                              toast.success(newVal ? "Verificação de e-mail ativada" : "Verificação de e-mail desativada");
                            } catch (err: any) {
                              toast.error(err.message || "Erro ao alterar configuração");
                            }
                          }}
                          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                            globalConfig.emailVerificationEnabled === "true"
                              ? "bg-muted text-foreground hover:opacity-90"
                              : "bg-primary text-primary-foreground hover:opacity-90"
                          }`}
                        >
                          {globalConfig.emailVerificationEnabled === "true" ? "Desativar" : "Ativar"}
                        </button>
                      </div>
                    </div>

                    {/* Temas Sazonais */}
                    <div className="glass-card rounded-xl p-5 space-y-4">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" /> Temas Sazonais
                      </h4>
                      <p className="text-xs text-muted-foreground">Ative um tema especial para datas comemorativas. Os efeitos aparecem em todo o site.</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          { key: "none", label: "Nenhum", emoji: "⚪" },
                          { key: "ano_novo", label: "Ano Novo", emoji: "🎆" },
                          { key: "carnaval", label: "Carnaval", emoji: "🎭" },
                          { key: "pascoa", label: "Páscoa", emoji: "🐰" },
                          { key: "dia_maes", label: "Dia das Mães", emoji: "💐" },
                          { key: "dia_namorados", label: "Dia dos Namorados", emoji: "💕" },
                          { key: "festa_junina", label: "Festa Junina", emoji: "🎪" },
                          { key: "dia_pais", label: "Dia dos Pais", emoji: "👔" },
                          { key: "dia_criancas", label: "Dia das Crianças", emoji: "🎈" },
                          { key: "black_friday", label: "Black Friday", emoji: "🏷️" },
                          { key: "natal", label: "Natal", emoji: "🎄" },
                        ].map(t => (
                          <button
                            key={t.key}
                            onClick={async () => {
                              setGlobalConfig(prev => ({ ...prev, seasonalTheme: t.key }));
                              await supabase.from("system_config").upsert({ key: "seasonalTheme", value: t.key }, { onConflict: "key" });
                              toast.success(t.key === "none" ? "Tema sazonal desativado" : `Tema ${t.label} ativado! ${t.emoji}`);
                            }}
                            className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left ${
                              (globalConfig.seasonalTheme || "none") === t.key
                                ? "border-primary bg-primary/10 shadow-sm"
                                : "border-border bg-muted/30 hover:border-muted-foreground/30"
                            }`}
                          >
                            <span className="text-xl">{t.emoji}</span>
                            <span className={`text-xs font-medium ${
                              (globalConfig.seasonalTheme || "none") === t.key ? "text-primary" : "text-foreground"
                            }`}>{t.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Segurança PIN */}
                    <div className="glass-card rounded-xl p-5 space-y-4">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <KeyRound className="h-4 w-4 text-primary" /> Segurança — PIN de Acesso
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Configure o tempo de sessão do PIN. Após esse período, o PIN será solicitado novamente ao acessar áreas protegidas.
                      </p>

                      {/* Timeout selector */}
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Tempo de Sessão do PIN</label>
                        <select
                          value={globalConfig.pinTimeoutSeconds || "300"}
                          onChange={async (e) => {
                            const val = e.target.value;
                            setGlobalConfig(prev => ({ ...prev, pinTimeoutSeconds: val }));
                            await supabase.from("system_config").upsert(
                              { key: "pinTimeoutSeconds", value: val, updated_at: new Date().toISOString() },
                              { onConflict: "key" }
                            );
                            toast.success(`Tempo de sessão alterado para ${val === "0" ? "ilimitado" : val === "60" ? "1 minuto" : val === "120" ? "2 minutos" : val === "300" ? "5 minutos" : val === "600" ? "10 minutos" : val === "900" ? "15 minutos" : val === "1800" ? "30 minutos" : "1 hora"}`);
                          }}
                          className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="60">1 minuto</option>
                          <option value="120">2 minutos</option>
                          <option value="300">5 minutos (padrão)</option>
                          <option value="600">10 minutos</option>
                          <option value="900">15 minutos</option>
                          <option value="1800">30 minutos</option>
                          <option value="3600">1 hora</option>
                          <option value="0">Ilimitado (não expira)</option>
                        </select>
                        <p className="text-xs text-muted-foreground mt-1">Após esse tempo, o sistema pedirá o PIN novamente</p>
                      </div>

                      {/* Reset PIN button */}
                      <div className="flex items-center justify-between p-4 rounded-xl border-2 border-border bg-muted/30">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-destructive/10">
                            <RotateCcw className="h-5 w-5 text-destructive" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">Redefinir PIN</p>
                            <p className="text-[11px] text-muted-foreground">Remove o PIN atual — será necessário criar um novo</p>
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            if (!confirm("Tem certeza que deseja remover o PIN? Você precisará criar um novo.")) return;
                            await supabase.from("system_config").delete().eq("key", "adminPin");
                            toast.success("PIN removido. Um novo será solicitado no próximo acesso.");
                          }}
                          className="px-4 py-2 rounded-xl text-sm font-bold bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all"
                        >
                          Redefinir
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ═══════ SETOR: REDE ═══════ */}
                {configSection === "rede" && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    {/* Info Card - Rede */}
                    <InfoCard title="Configurações da Rede" items={[
                      { icon: Tag, iconColor: "text-primary", label: "Ferramentas de Venda", description: "controla visibilidade de 'Meus Preços' e 'Minha Rede' para os revendedores." },
                      { icon: TrendingUp, iconColor: "text-success", label: "Comissões", description: "defina quanto do lucro vai para o vendedor (direta) e para quem o indicou (indireta)." },
                    ]} />

                    {/* Ferramentas de Venda */}
                    <div className="glass-card rounded-xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            (globalConfig.salesToolsEnabled ?? "true") === "true" ? "bg-success/15" : "bg-muted/50"
                          }`}>
                            <Tag className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">Ferramentas de Venda</h4>
                            <p className="text-xs text-muted-foreground">Menu "Meus Preços" e "Minha Rede" no painel dos revendedores</p>
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            const newVal = (globalConfig.salesToolsEnabled ?? "true") === "true" ? "false" : "true";
                            setGlobalConfig(prev => ({ ...prev, salesToolsEnabled: newVal }));
                            await supabase.from("system_config").upsert({ key: "salesToolsEnabled", value: newVal }, { onConflict: "key" });
                            toast.success(newVal === "true" ? "✅ Ferramentas de Venda ativadas!" : "❌ Ferramentas de Venda desativadas!");
                          }}
                          className="transition-colors"
                        >
                          {(globalConfig.salesToolsEnabled ?? "true") === "true"
                            ? <ToggleRight className="h-7 w-7 text-success" />
                            : <ToggleLeft className="h-7 w-7 text-muted-foreground" />
                          }
                        </button>
                      </div>
                    </div>

                    {/* Exigir Código de Indicação */}
                    <div className="glass-card rounded-xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            (globalConfig.requireReferralCode ?? "true") === "true" ? "bg-warning/15" : "bg-success/15"
                          }`}>
                            <Link2 className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">Exigir Código de Indicação</h4>
                            <p className="text-xs text-muted-foreground">
                              {(globalConfig.requireReferralCode ?? "true") === "true"
                                ? "Cadastro só com link de indicação válido"
                                : "Cadastro aberto — qualquer pessoa pode criar conta"}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            const newVal = (globalConfig.requireReferralCode ?? "true") === "true" ? "false" : "true";
                            setGlobalConfig(prev => ({ ...prev, requireReferralCode: newVal }));
                            await supabase.from("system_config").upsert({ key: "requireReferralCode", value: newVal }, { onConflict: "key" });
                            toast.success(newVal === "true" ? "🔒 Código de indicação obrigatório!" : "🔓 Cadastro aberto para todos!");
                          }}
                          className="transition-colors"
                        >
                          {(globalConfig.requireReferralCode ?? "true") === "true"
                            ? <ToggleRight className="h-7 w-7 text-warning" />
                            : <ToggleLeft className="h-7 w-7 text-success" />
                          }
                        </button>
                      </div>
                    </div>


                    <NetworkCommissionConfig />
                  </motion.div>
                )}

                {/* ═══════ SETOR: JOGOS ═══════ */}
                {configSection === "jogos" && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    {/* Info Card - Jogos */}
                    <InfoCard title="Configurações de Jogos" items={[
                      { icon: Trophy, iconColor: "text-warning", label: "Raspadinha Diária", description: "cada usuário pode raspar 1 cartão por dia, com chance de ganhar saldo." },
                      { icon: DollarSign, iconColor: "text-success", label: "Faixas de Prêmio", description: "3 faixas (Comum, Rara, Épica) com probabilidades e valores configuráveis." },
                    ]} />

                    {/* Raspadinha Config */}
                    <div className="glass-card rounded-xl p-5 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                          <Trophy className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">Raspadinha Diária</h4>
                          <p className="text-xs text-muted-foreground">Configure probabilidade e valores dos prêmios</p>
                        </div>
                        <div className="ml-auto">
                          <button
                            onClick={async () => {
                              const newVal = (globalConfig.scratchEnabled ?? "true") === "true" ? "false" : "true";
                              setGlobalConfig(prev => ({ ...prev, scratchEnabled: newVal }));
                              await supabase.from("system_config").upsert({ key: "scratchEnabled", value: newVal }, { onConflict: "key" });
                              toast.success(newVal === "true" ? "🎰 Raspadinha ativada!" : "❌ Raspadinha desativada!");
                            }}
                            className="transition-colors"
                          >
                            {(globalConfig.scratchEnabled ?? "true") === "true"
                              ? <ToggleRight className="h-7 w-7 text-success" />
                              : <ToggleLeft className="h-7 w-7 text-muted-foreground" />
                            }
                          </button>
                        </div>
                      </div>

                      {[
                        { tier: 1, label: "Faixa 1 — Comum", color: "text-success", defChance: "20", defMin: "0.10", defMax: "1.00" },
                        { tier: 2, label: "Faixa 2 — Rara", color: "text-primary", defChance: "5", defMin: "1.00", defMax: "10.00" },
                        { tier: 3, label: "Faixa 3 — Épica", color: "text-accent-foreground", defChance: "1", defMin: "10.00", defMax: "100.00" },
                      ].map(({ tier, label, color, defChance, defMin, defMax }) => (
                        <div key={tier} className="space-y-2">
                          <p className={`text-xs font-bold ${color}`}>{label}</p>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="block text-[11px] text-muted-foreground mb-0.5">Chance (%)</label>
                              <input
                                type="number" min="0" max="100" step="0.1"
                                value={globalConfig[`scratchTier${tier}Chance`] ?? defChance}
                                onChange={e => setGlobalConfig(prev => ({ ...prev, [`scratchTier${tier}Chance`]: e.target.value }))}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-muted-foreground mb-0.5">Mín (R$)</label>
                              <input
                                type="number" min="0.01" step="0.01"
                                value={globalConfig[`scratchTier${tier}Min`] ?? defMin}
                                onChange={e => setGlobalConfig(prev => ({ ...prev, [`scratchTier${tier}Min`]: e.target.value }))}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-muted-foreground mb-0.5">Máx (R$)</label>
                              <input
                                type="number" min="0.01" step="0.01"
                                value={globalConfig[`scratchTier${tier}Max`] ?? defMax}
                                onChange={e => setGlobalConfig(prev => ({ ...prev, [`scratchTier${tier}Max`]: e.target.value }))}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      <p className="text-[11px] text-muted-foreground">
                        Chance total ≈ soma das faixas (~24.8% padrão). Faixas são avaliadas da mais rara para a mais comum.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* ═══════ SETOR: NOTIFICAÇÕES ═══════ */}
                {configSection === "notificacoes" && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    {/* Info Card - Notificações */}
                    <InfoCard title="Sistema de Alertas" items={[
                      { icon: Megaphone, iconColor: "text-primary", label: "Toasts Visuais", description: "alertas pop-up que aparecem na tela ao receber depósitos, recargas e cadastros." },
                      { icon: Users, iconColor: "text-success", label: "Por Cargo", description: "configure separadamente quais alertas cada tipo de usuário recebe." },
                    ]} />

                    <div className="glass-card rounded-xl p-5 space-y-5">
                      <div>
                        <h4 className="font-semibold text-foreground flex items-center gap-2">
                          <Megaphone className="h-4 w-4 text-primary" /> Notificações
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">Configure quais alertas visuais cada cargo recebe. Sons funcionam para todos.</p>
                      </div>

                      {/* Admin Master */}
                      <div className="space-y-2">
                        <p className="text-sm font-bold text-foreground flex items-center gap-1.5">👑 Administrador Master</p>
                        <div className="space-y-1.5 pl-1">
                          {[
                            { key: "notif_admin_deposit", label: "💰 Depósitos confirmados", defaultVal: "true" },
                            { key: "notif_admin_recarga", label: "📱 Recargas processadas", defaultVal: "true" },
                            { key: "notif_admin_new_user", label: "🆕 Novos cadastros", defaultVal: "true" },
                          ].map(item => {
                            const isOn = (globalConfig[item.key] ?? item.defaultVal) === "true";
                            return (
                              <div key={item.key} className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-muted/20">
                                <span className="text-sm text-foreground">{item.label}</span>
                                <button
                                  onClick={() => setGlobalConfig(prev => ({ ...prev, [item.key]: isOn ? "false" : "true" }))}
                                  className="transition-colors"
                                >
                                  {isOn
                                    ? <ToggleRight className="h-6 w-6 text-success" />
                                    : <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                                  }
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Revendedor */}
                      <div className="space-y-2">
                        <p className="text-sm font-bold text-foreground flex items-center gap-1.5">🏪 Revendedor</p>
                        <div className="space-y-1.5 pl-1">
                          {[
                            { key: "notif_revendedor_deposit", label: "💰 Depósitos confirmados", defaultVal: "false" },
                            { key: "notif_revendedor_recarga", label: "📱 Recargas processadas", defaultVal: "false" },
                          ].map(item => {
                            const isOn = (globalConfig[item.key] ?? item.defaultVal) === "true";
                            return (
                              <div key={item.key} className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-muted/20">
                                <span className="text-sm text-foreground">{item.label}</span>
                                <button
                                  onClick={() => setGlobalConfig(prev => ({ ...prev, [item.key]: isOn ? "false" : "true" }))}
                                  className="transition-colors"
                                >
                                  {isOn
                                    ? <ToggleRight className="h-6 w-6 text-success" />
                                    : <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                                  }
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <p className="text-[11px] text-muted-foreground italic">ℹ️ Sons funcionam para todos os cargos. Os toggles controlam apenas toasts e alertas visuais.</p>

                      <button
                        onClick={() => { unlockAudio(); playCashRegisterSound(); }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/60 text-foreground font-medium text-sm transition-all active:scale-95"
                      >
                        🔊 Testar Som de Depósito
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ═══════ SETOR: BANNERS ═══════ */}
                {configSection === "banners" && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <BannersManager botUsername={botStatus.botUsername} />
                  </motion.div>
                )}

                {/* Maintenance Confirmation Dialog */}
                <Dialog open={showMaintenanceDialog} onOpenChange={setShowMaintenanceDialog}>
                  <DialogPortal>
                    <DialogOverlay className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                    <DialogContent className="fixed left-[50%] top-[50%] z-[70] w-full max-w-md translate-x-[-50%] translate-y-[-50%] border border-border bg-card rounded-2xl shadow-2xl p-0 overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
                      {/* Header */}
                      <div className={`p-6 pb-4 ${globalConfig.maintenanceMode === "true" ? "bg-success/10" : "bg-warning/10"}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            globalConfig.maintenanceMode === "true" ? "bg-success/20" : "bg-warning/20"
                          }`}>
                            {globalConfig.maintenanceMode === "true" 
                              ? <CheckCircle2 className="h-6 w-6 text-success" />
                              : <AlertTriangle className="h-6 w-6 text-warning" />
                            }
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-foreground">
                              {globalConfig.maintenanceMode === "true" ? "Desativar Manutenção" : "Ativar Manutenção"}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {globalConfig.maintenanceMode === "true" ? "Restaurar acesso público" : "Restringir acesso ao site"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-6 space-y-4">
                        {globalConfig.maintenanceMode === "true" ? (
                          <div className="flex items-start gap-3 p-4 rounded-xl bg-success/5 border border-success/20">
                            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
                            <p className="text-sm text-foreground leading-relaxed">
                              O site voltará a funcionar normalmente e todos os usuários terão acesso novamente.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/5 border border-warning/20">
                              <AlertTriangle className="h-5 w-5 text-warning mt-0.5 shrink-0" />
                              <p className="text-sm text-foreground leading-relaxed">
                                O site ficará <span className="font-bold text-warning">totalmente inacessível</span> ao público enquanto a manutenção estiver ativa.
                              </p>
                            </div>
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border">
                              <Bot className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                O bot do Telegram continuará funcionando normalmente durante a manutenção.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="p-6 pt-2 flex items-center justify-end gap-3">
                        <button
                          onClick={() => setShowMaintenanceDialog(false)}
                          className="px-5 py-2.5 rounded-xl text-sm font-medium text-muted-foreground bg-muted/50 hover:bg-muted transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={async () => {
                            const newVal = globalConfig.maintenanceMode === "true" ? "false" : "true";
                            setGlobalConfig(prev => ({ ...prev, maintenanceMode: newVal }));
                            await supabase.from("system_config").upsert({ key: "maintenanceMode", value: newVal }, { onConflict: "key" });
                            toast.success(newVal === "true" ? "🚧 Modo manutenção ATIVADO!" : "✅ Modo manutenção DESATIVADO!");
                            setShowMaintenanceDialog(false);
                          }}
                          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            globalConfig.maintenanceMode === "true"
                              ? "bg-success text-success-foreground hover:opacity-90"
                              : "bg-warning text-warning-foreground hover:opacity-90"
                          }`}
                        >
                          {globalConfig.maintenanceMode === "true" ? "✅ Sim, Desativar" : "🚧 Sim, Ativar Manutenção"}
                        </button>
                      </div>
                    </DialogContent>
                  </DialogPortal>
                </Dialog>
                </>
              )}
            </motion.div>
          )}

          {/* ===== RELATÓRIOS ===== */}
          {view === "relatorios" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              {/* Info Card - Relatórios */}
              <InfoCard title="Relatórios de Lucro" items={[
                { icon: FileText, iconColor: "text-warning", label: "Lucro por Revendedor", description: "mostra o preço cobrado vs custo real da API, com lucro líquido por venda." },
                { icon: TrendingUp, iconColor: "text-success", label: "Períodos", description: "filtre por Hoje, 7 dias, 30 dias ou período personalizado." },
                { icon: DollarSign, iconColor: "text-primary", label: "Exportação", description: "baixe os dados em formato CSV para análise em planilhas." },
              ]} />

              {/* Header compact */}
              <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-warning/15 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-warning" />
                  </div>
                  <div>
                    <h2 className="font-display text-base font-bold text-foreground">Relatório de Lucro</h2>
                    <p className="text-[11px] text-muted-foreground">Lucro por revendedor · preço vs custo</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex rounded-xl overflow-hidden bg-muted/40 border border-border/40 p-0.5 gap-0.5">
                    {([
                      { key: "hoje" as ReportPeriod, label: "Hoje" },
                      { key: "7dias" as ReportPeriod, label: "7d" },
                      { key: "mes" as ReportPeriod, label: "Mês" },
                      { key: "total" as ReportPeriod, label: "Total" },
                    ]).map(p => (
                      <button key={p.key} onClick={() => setReportPeriod(p.key)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${reportPeriod === p.key ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <button onClick={fetchReport} disabled={reportLoading} className="p-2 rounded-xl border border-border/60 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all active:scale-95">
                    <RefreshCw className={`h-3.5 w-3.5 ${reportLoading ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>

              {/* Summary cards — compact */}
              {reportData.length > 0 && (() => {
                const totalVendas = reportData.reduce((s, r) => s + r.totalVendas, 0);
                const totalLucro = reportData.reduce((s, r) => s + r.lucro, 0);
                const totalRecarga = reportData.reduce((s, r) => s + r.totalValor, 0);
                const totalCusto = reportData.reduce((s, r) => s + r.totalCusto, 0);
                const kpis = [
                  { label: "Revendedores", value: String(reportData.length), icon: Users, color: "text-primary", bgColor: "bg-primary/15" },
                  { label: "Créditos Entregues", value: fmt(totalRecarga), icon: Smartphone, color: "text-foreground", bgColor: "bg-muted" },
                  { label: "Custo API", value: fmt(totalCusto), icon: Wallet, color: "text-warning", bgColor: "bg-warning/15" },
                  { label: "Vendas", value: fmt(totalVendas), icon: TrendingUp, color: "text-success", bgColor: "bg-success/15" },
                  { label: "Lucro", value: fmt(totalLucro), icon: DollarSign, color: totalLucro >= 0 ? "text-success" : "text-destructive", bgColor: totalLucro >= 0 ? "bg-success/15" : "bg-destructive/15" },
                ];
                return (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {kpis.map((card, i) => (
                      <motion.div key={card.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04, type: "spring", stiffness: 300, damping: 25 }}
                        className="glass-card rounded-xl p-3 relative overflow-hidden group hover:border-primary/20 transition-colors">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <div className={`w-6 h-6 rounded-md ${card.bgColor} flex items-center justify-center`}>
                            <card.icon className={`h-3 w-3 ${card.color}`} />
                          </div>
                          <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium leading-none">{card.label}</span>
                        </div>
                        <p className={`text-sm font-bold tabular-nums font-mono ${card.label === "Lucro" ? card.color : "text-foreground"}`}>{card.value}</p>
                      </motion.div>
                    ))}
                  </div>
                );
              })()}

              {/* Ranking Leaderboard — compact */}
              {reportData.length > 0 && (() => {
                const top15 = reportData.slice(0, 15);
                const maxLucro = Math.max(...top15.map(r => Math.abs(r.lucro)), 1);
                const medals = ["🥇", "🥈", "🥉"];
                return (
                  <div className="glass-card rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Trophy className="h-4 w-4 text-warning" />
                      <h3 className="text-xs font-semibold text-foreground">Ranking de Lucro</h3>
                      <span className="text-[10px] text-muted-foreground ml-auto">Top {top15.length}</span>
                    </div>
                    <div className="space-y-1">
                      {top15.map((r, i) => {
                        const margem = r.totalVendas > 0 ? ((r.lucro / r.totalVendas) * 100) : 0;
                        const pct = (Math.abs(r.lucro) / maxLucro) * 100;
                        const isTop3 = i < 3;
                        return (
                          <motion.div key={r.user_id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                            className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-all hover:bg-muted/40 ${isTop3 ? "border border-primary/15 bg-primary/[0.03]" : ""}`}>
                            {/* Position */}
                            <div className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${isTop3 ? "bg-primary/15 text-primary" : "bg-muted/60 text-muted-foreground"}`}>
                              {isTop3 ? <span className="text-sm">{medals[i]}</span> : <span className="text-[10px]">#{i + 1}</span>}
                            </div>
                            {/* Name + bar */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-0.5">
                                <p className={`text-[13px] truncate ${isTop3 ? "font-bold text-foreground" : "font-medium text-foreground"}`}>{r.nome || "Sem nome"}</p>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="hidden sm:inline text-right">
                                    <span className="text-[9px] text-muted-foreground block leading-tight">Vendas</span>
                                    <span className="font-mono font-semibold text-[11px] tabular-nums text-foreground">{fmt(r.totalVendas)}</span>
                                  </span>
                                  <span className="text-right">
                                    <span className={`text-[9px] block leading-tight ${r.lucro > 0 ? "text-success/70" : r.lucro < 0 ? "text-destructive/70" : "text-muted-foreground"}`}>Lucro</span>
                                    <span className={`text-[13px] font-bold font-mono tabular-nums ${r.lucro > 0 ? "text-success" : r.lucro < 0 ? "text-destructive" : "text-muted-foreground"}`}>{fmt(r.lucro)}</span>
                                  </span>
                                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md ${margem > 15 ? "bg-success/15 text-success" : margem > 0 ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"}`}>
                                    {margem.toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                              <div className="h-1 rounded-full bg-muted/60 overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5, delay: i * 0.04 }}
                                  className={`h-full rounded-full ${r.lucro > 0 ? "bg-primary" : "bg-destructive"}`} />
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Table — premium compact */}
              {reportLoading ? (
                <div className="space-y-1.5">{[1,2,3].map(i => <SkeletonRow key={i} />)}</div>
              ) : reportData.length === 0 ? (
                <div className="glass-card rounded-xl p-8 text-center">
                  <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhuma recarga no período.</p>
                </div>
              ) : (
                <div className="glass-card rounded-xl overflow-hidden">
                  {/* Search */}
                  <div className="px-3 py-2.5 border-b border-border/50">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <input type="text" value={reportSearch} onChange={e => { setReportSearch(e.target.value); setReportPage(0); }} placeholder="Buscar revendedor..." className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-input bg-muted/50 text-foreground text-[13px] focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground" />
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border/60 bg-muted/20">
                          <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Revendedor</th>
                          <th className="text-center px-2 py-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Qtd</th>
                          <th className="hidden md:table-cell text-right px-2 py-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Recarga</th>
                          <th className="hidden lg:table-cell text-right px-2 py-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Custo API</th>
                          <th className="text-right px-2 py-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Vendas</th>
                          <th className="text-right px-2 py-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Lucro</th>
                          <th className="hidden md:table-cell text-right px-3 py-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Margem</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const filtered = reportData.filter(r => {
                            if (!reportSearch) return true;
                            const q = reportSearch.toLowerCase();
                            return (r.nome || "").toLowerCase().includes(q) || (r.email || "").toLowerCase().includes(q);
                          });
                          const totalPages = Math.ceil(filtered.length / REPORT_PER_PAGE);
                          const paged = filtered.slice(reportPage * REPORT_PER_PAGE, (reportPage + 1) * REPORT_PER_PAGE);
                          return paged.map((r, i) => {
                            const margem = r.totalVendas > 0 ? ((r.lucro / r.totalVendas) * 100) : 0;
                            return (
                              <motion.tr key={r.user_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                                className="border-b border-border/30 hover:bg-primary/[0.04] transition-colors">
                                <td className="px-3 py-2">
                                  <p className="font-medium text-[13px] text-foreground truncate max-w-[140px] md:max-w-none">{r.nome || "Sem nome"}</p>
                                  <p className="text-[11px] text-muted-foreground truncate max-w-[140px] md:max-w-none">{r.email}</p>
                                </td>
                                <td className="px-2 py-2 text-center font-mono text-[13px] tabular-nums text-foreground">{r.totalRecargas}</td>
                                <td className="hidden md:table-cell px-2 py-2 text-right font-mono text-[13px] tabular-nums text-muted-foreground">{fmt(r.totalValor)}</td>
                                <td className="hidden lg:table-cell px-2 py-2 text-right font-mono text-[13px] tabular-nums text-muted-foreground">{fmt(r.totalCusto)}</td>
                                <td className="px-2 py-2 text-right font-mono text-[13px] tabular-nums text-foreground">{fmt(r.totalVendas)}</td>
                                <td className={`px-2 py-2 text-right font-mono text-[13px] tabular-nums font-bold ${r.lucro > 0 ? "text-success" : r.lucro < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                                  {fmt(r.lucro)}
                                </td>
                                <td className={`hidden md:table-cell px-3 py-2 text-right font-mono text-[12px] tabular-nums ${margem > 0 ? "text-success" : margem < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                                  {margem.toFixed(1)}%
                                </td>
                              </motion.tr>
                            );
                          });
                        })()}
                      </tbody>
                      <tfoot>
                        {(() => {
                          const tRec = reportData.reduce((s, r) => s + r.totalRecargas, 0);
                          const tVal = reportData.reduce((s, r) => s + r.totalValor, 0);
                          const tCusto = reportData.reduce((s, r) => s + r.totalCusto, 0);
                          const tVendas = reportData.reduce((s, r) => s + r.totalVendas, 0);
                          const tLucro = reportData.reduce((s, r) => s + r.lucro, 0);
                          const tMargem = tVendas > 0 ? ((tLucro / tVendas) * 100) : 0;
                          return (
                            <tr className="bg-primary/[0.06] border-t border-primary/20 font-bold">
                              <td className="px-3 py-2.5 text-[13px] text-foreground">Total</td>
                              <td className="px-2 py-2.5 text-center font-mono text-[13px] tabular-nums text-foreground">{tRec}</td>
                              <td className="hidden md:table-cell px-2 py-2.5 text-right font-mono text-[13px] tabular-nums text-muted-foreground">{fmt(tVal)}</td>
                              <td className="hidden lg:table-cell px-2 py-2.5 text-right font-mono text-[13px] tabular-nums text-muted-foreground">{fmt(tCusto)}</td>
                              <td className="px-2 py-2.5 text-right font-mono text-[13px] tabular-nums text-foreground">{fmt(tVendas)}</td>
                              <td className={`px-2 py-2.5 text-right font-mono text-[13px] tabular-nums font-bold ${tLucro > 0 ? "text-success" : tLucro < 0 ? "text-destructive" : "text-muted-foreground"}`}>{fmt(tLucro)}</td>
                              <td className={`hidden md:table-cell px-3 py-2.5 text-right font-mono text-[12px] tabular-nums ${tMargem > 0 ? "text-success" : tMargem < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                                {tMargem !== 0 ? `${tMargem.toFixed(1)}%` : "—"}
                              </td>
                            </tr>
                          );
                        })()}
                      </tfoot>
                    </table>
                  </div>
                  {/* Pagination */}
                  {(() => {
                    const filtered = reportData.filter(r => {
                      if (!reportSearch) return true;
                      const q = reportSearch.toLowerCase();
                      return (r.nome || "").toLowerCase().includes(q) || (r.email || "").toLowerCase().includes(q);
                    });
                    const totalPages = Math.ceil(filtered.length / REPORT_PER_PAGE);
                    if (totalPages <= 1) return null;
                    return (
                      <div className="flex items-center justify-between px-3 py-2.5 border-t border-border/50">
                        <span className="text-[11px] text-muted-foreground tabular-nums">
                          {reportPage * REPORT_PER_PAGE + 1}–{Math.min((reportPage + 1) * REPORT_PER_PAGE, filtered.length)} de {filtered.length}
                        </span>
                        <div className="flex items-center gap-1">
                          <button disabled={reportPage === 0} onClick={() => setReportPage(p => p - 1)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-medium border border-border hover:bg-muted/50 disabled:opacity-30 transition-colors">
                            Anterior
                          </button>
                          <span className="text-[11px] text-muted-foreground px-1.5 tabular-nums">{reportPage + 1}/{totalPages}</span>
                          <button disabled={reportPage >= totalPages - 1} onClick={() => setReportPage(p => p + 1)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-medium border border-border hover:bg-muted/50 disabled:opacity-30 transition-colors">
                            Próximo
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* ===== TODAS AS RECARGAS ===== */}
              <div className="glass-card rounded-xl overflow-hidden">
                <div className="p-3 border-b border-border/50">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-bold text-foreground">Todas as Recargas</h3>
                      <span className="text-[10px] text-muted-foreground">({allRecargasList.length})</span>
                    </div>
                    <button onClick={fetchAllRecargasList} disabled={allRecargasLoading} className="p-1.5 rounded-lg border border-border/60 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all active:scale-95">
                      <RefreshCw className={`h-3 w-3 ${allRecargasLoading ? "animate-spin" : ""}`} />
                    </button>
                  </div>
                  {/* Status filter */}
                  <div className="flex items-center gap-1.5 mb-2">
                    {([
                      { key: "all" as const, label: "Todas" },
                      { key: "completed" as const, label: "Concluídas" },
                      { key: "pending" as const, label: "Pendentes" },
                      { key: "falha" as const, label: "Falhas" },
                    ]).map(f => (
                      <button key={f.key} onClick={() => { setAllRecargasStatusFilter(f.key); setAllRecargasPage(0); }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${allRecargasStatusFilter === f.key ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground bg-muted/40"}`}>
                        {f.label}
                      </button>
                    ))}
                  </div>
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input type="text" value={allRecargasSearch} onChange={e => { setAllRecargasSearch(e.target.value); setAllRecargasPage(0); }}
                      placeholder="Buscar telefone, operadora, usuário..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-input bg-muted/50 text-foreground text-[13px] focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground" />
                  </div>
                </div>

                {allRecargasLoading && !allRecargasLoaded.current ? (
                  <div className="p-3 space-y-1.5">{[1,2,3,4].map(i => <SkeletonRow key={i} />)}</div>
                ) : (() => {
                  const statusMatch = (s: string) => {
                    if (allRecargasStatusFilter === "all") return true;
                    if (allRecargasStatusFilter === "completed") return s === "completed" || s === "concluida";
                    if (allRecargasStatusFilter === "pending") return s === "pending";
                    if (allRecargasStatusFilter === "falha") return s === "falha";
                    return true;
                  };
                  const filtered = allRecargasList.filter(r => {
                    if (!statusMatch(r.status)) return false;
                    if (allRecargasSearch) {
                      const q = allRecargasSearch.toLowerCase();
                      return (r.telefone || "").includes(q) || (r.operadora || "").toLowerCase().includes(q) || (r.user_nome || "").toLowerCase().includes(q) || (r.user_email || "").toLowerCase().includes(q);
                    }
                    return true;
                  });
                  const totalPages = Math.ceil(filtered.length / ALL_RECARGAS_PER_PAGE);
                  const paged = filtered.slice(allRecargasPage * ALL_RECARGAS_PER_PAGE, (allRecargasPage + 1) * ALL_RECARGAS_PER_PAGE);

                  if (filtered.length === 0) {
                    return (
                      <div className="p-8 text-center">
                        <Smartphone className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Sem recargas para os filtros selecionados.</p>
                      </div>
                    );
                  }

                  const statusBadge = (s: string) => {
                    if (s === "completed" || s === "concluida") return <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-success/15 text-success">Concluída</span>;
                    if (s === "pending") return <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-warning/15 text-warning">Pendente</span>;
                    if (s === "falha") return <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-destructive/15 text-destructive">Falha</span>;
                    if (s === "estornada") return <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-accent/15 text-accent">Estornada</span>;
                    return <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">{s}</span>;
                  };

                  return (
                    <>
                      {/* Mobile cards */}
                      <div className="md:hidden divide-y divide-border/30">
                        {paged.map((r, i) => (
                          <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                            className="px-3 py-2.5 hover:bg-primary/[0.04] transition-colors">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[13px] font-medium text-foreground truncate max-w-[55%]">{r.user_nome || "Usuário"}</span>
                              {statusBadge(r.status)}
                            </div>
                            <div className="flex items-center justify-between text-[12px]">
                              <span className="text-muted-foreground">{(r.operadora || "—").toUpperCase()} · {r.telefone?.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")}</span>
                              <span className="font-bold font-mono tabular-nums text-foreground">{fmt(Number(r.valor))}</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] mt-1">
                              <span className="text-muted-foreground">Cobrado: <span className="font-mono font-semibold text-foreground">{fmt(Number(r.custo || 0))}</span></span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] mt-0.5">
                              <span className="text-muted-foreground">API: <span className="font-mono font-semibold text-warning">{fmt(Number(r.custo_api || 0))}</span></span>
                            </div>
                            <div className="flex items-center justify-between mt-1.5">
                              <p className="text-[10px] text-muted-foreground">{getRecargaTimeLabel(r)} {fmtDate(getRecargaTime(r))}</p>
                              {(r.status === "completed" || r.status === "concluida") && (
                                <button
                                  onClick={() => handleRefundRecarga(r)}
                                  disabled={refundingId === r.id}
                                  className="flex items-center gap-1 text-[10px] font-semibold text-warning hover:text-warning/80 bg-warning/10 hover:bg-warning/20 px-2 py-0.5 rounded-md transition-all active:scale-95 disabled:opacity-50"
                                >
                                  {refundingId === r.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" />}
                                  Estornar
                                </button>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Desktop table */}
                      <div className="hidden md:block overflow-x-auto">
                         <table className="w-full">
                          <thead>
                            <tr className="border-b border-border/60 bg-muted/20">
                              <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Data</th>
                              <th className="text-left px-2 py-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Usuário</th>
                              <th className="text-left px-2 py-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Telefone</th>
                              <th className="text-left px-2 py-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Operadora</th>
                              <th className="text-right px-2 py-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Valor</th>
                              <th className="text-right px-2 py-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Cobrado</th>
                              <th className="text-right px-2 py-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Custo API</th>
                              <th className="text-center px-2 py-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Status</th>
                              <th className="text-center px-3 py-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Ação</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paged.map((r, i) => (
                              <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                                className="border-b border-border/30 hover:bg-primary/[0.04] transition-colors">
                                <td className="px-3 py-2 text-[12px] text-muted-foreground whitespace-nowrap">{fmtDate(r.created_at)}</td>
                                <td className="px-2 py-2">
                                  <p className="text-[13px] font-medium text-foreground truncate max-w-[160px]">{r.user_nome || "Usuário"}</p>
                                </td>
                                <td className="px-2 py-2 font-mono text-[12px] text-muted-foreground">{r.telefone}</td>
                                <td className="px-2 py-2 text-[13px] text-foreground">{(r.operadora || "—").toUpperCase()}</td>
                                <td className="px-2 py-2 text-right font-mono font-bold text-[13px] tabular-nums text-foreground">{fmt(Number(r.valor))}</td>
                                <td className="px-2 py-2 text-right font-mono font-semibold text-[12px] tabular-nums text-foreground">{fmt(Number(r.custo || 0))}</td>
                                <td className="px-2 py-2 text-right font-mono font-semibold text-[12px] tabular-nums text-warning">{fmt(Number(r.custo_api || 0))}</td>
                                <td className="px-2 py-2 text-center">{statusBadge(r.status)}</td>
                                <td className="px-3 py-2 text-center">
                                  {(r.status === "completed" || r.status === "concluida") ? (
                                    <button
                                      onClick={() => handleRefundRecarga(r)}
                                      disabled={refundingId === r.id}
                                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-warning hover:text-warning/80 bg-warning/10 hover:bg-warning/20 px-2 py-1 rounded-md transition-all active:scale-95 disabled:opacity-50"
                                    >
                                      {refundingId === r.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" />}
                                      Estornar
                                    </button>
                                  ) : r.status === "estornada" ? (
                                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">Estornada</span>
                                  ) : <span className="text-[10px] text-muted-foreground">—</span>}
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between px-3 py-2.5 border-t border-border/50">
                          <span className="text-[11px] text-muted-foreground tabular-nums">
                            {allRecargasPage * ALL_RECARGAS_PER_PAGE + 1}–{Math.min((allRecargasPage + 1) * ALL_RECARGAS_PER_PAGE, filtered.length)} de {filtered.length}
                          </span>
                          <div className="flex items-center gap-1">
                            <button disabled={allRecargasPage === 0} onClick={() => setAllRecargasPage(p => p - 1)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-medium border border-border hover:bg-muted/50 disabled:opacity-30 transition-colors">Anterior</button>
                            <span className="text-[11px] text-muted-foreground px-1.5 tabular-nums">{allRecargasPage + 1}/{totalPages}</span>
                            <button disabled={allRecargasPage >= totalPages - 1} onClick={() => setAllRecargasPage(p => p + 1)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-medium border border-border hover:bg-muted/50 disabled:opacity-30 transition-colors">Próximo</button>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </motion.div>
          )}

          {/* ===== PRECIFICAÇÃO ===== */}
          {view === "precificacao" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              {/* Info Card - Precificação */}
              <InfoCard title="Precificação" items={[
                { icon: Tag, iconColor: "text-warning", label: "Preço Global", description: "regras padrão de margem aplicadas a todos os revendedores." },
                { icon: Users, iconColor: "text-primary", label: "Preço Personalizado", description: "regras específicas por revendedor que sobrepõem o preço global." },
                { icon: Shield, iconColor: "text-destructive", label: "Piso de Segurança", description: "impede que qualquer venda seja feita abaixo do custo base da API." },
              ]} />

              {/* Header */}
              <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-warning/15 flex items-center justify-center">
                    <Tag className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold text-foreground">Precificação</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Regras de preço globais e por revendedor</p>
                  </div>
                </div>
                <button onClick={fetchPricingData} className="p-2.5 rounded-xl border border-border/60 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all active:scale-95">
                  <RefreshCw className={`h-4 w-4 ${pricingLoading ? "animate-spin" : ""}`} />
                </button>
              </div>

              {/* Margem Padrão Global */}
              <div className="glass-card rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
                      <Zap className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Margem Padrão Global</p>
                      <p className="text-xs text-muted-foreground">Aplica automaticamente para todos os usuários sem regra individual</p>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      const newVal = globalConfig.defaultMarginEnabled === "true" ? "false" : "true";
                      const ts = new Date().toISOString();
                      setGlobalConfig(prev => ({ ...prev, defaultMarginEnabled: newVal, ...(newVal === "true" && !prev.defaultMarginType ? { defaultMarginType: "fixo" } : {}), ...(newVal === "true" && !prev.defaultMarginValue ? { defaultMarginValue: "0.50" } : {}) }));
                      await supabase.from("system_config").upsert({ key: "defaultMarginEnabled", value: newVal, updated_at: ts }, { onConflict: "key" });
                      if (newVal === "true") {
                        await supabase.from("system_config").upsert({ key: "defaultMarginType", value: globalConfig.defaultMarginType || "fixo", updated_at: ts }, { onConflict: "key" });
                        await supabase.from("system_config").upsert({ key: "defaultMarginValue", value: globalConfig.defaultMarginValue || "0.50", updated_at: ts }, { onConflict: "key" });
                      }
                      toast.success(newVal === "true" ? "Margem padrão ativada (R$ 0.50)!" : "Margem padrão desativada!");
                    }}
                    className="transition-transform active:scale-90"
                  >
                    {globalConfig.defaultMarginEnabled === "true"
                      ? <ToggleRight className="h-8 w-8 text-primary" />
                      : <ToggleLeft className="h-8 w-8 text-muted-foreground" />}
                  </button>
                </div>

                {globalConfig.defaultMarginEnabled === "true" && (
                  <div className="flex items-center gap-3 pt-2 border-t border-border/40">
                    <select
                      value={globalConfig.defaultMarginType || "fixo"}
                      onChange={async (e) => {
                        setGlobalConfig(prev => ({ ...prev, defaultMarginType: e.target.value }));
                        await supabase.from("system_config").upsert({ key: "defaultMarginType", value: e.target.value, updated_at: new Date().toISOString() }, { onConflict: "key" });
                      }}
                      className="px-3 py-2 rounded-xl bg-muted/50 border border-border/60 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="fixo">Fixo (R$)</option>
                      <option value="margem">Margem (%)</option>
                    </select>
                    <div className="flex-1 relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={globalConfig.defaultMarginValue || ""}
                        onChange={(e) => setGlobalConfig(prev => ({ ...prev, defaultMarginValue: e.target.value }))}
                        onBlur={async (e) => {
                          const val = e.target.value || "0";
                          await supabase.from("system_config").upsert({ key: "defaultMarginValue", value: val, updated_at: new Date().toISOString() }, { onConflict: "key" });
                        }}
                        placeholder={(globalConfig.defaultMarginType || "fixo") === "fixo" ? "0.50" : "5"}
                        className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border/60 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <button
                      onClick={async () => {
                        const val = globalConfig.defaultMarginValue || "0";
                        await supabase.from("system_config").upsert({ key: "defaultMarginValue", value: val, updated_at: new Date().toISOString() }, { onConflict: "key" });
                        await supabase.from("system_config").upsert({ key: "defaultMarginType", value: globalConfig.defaultMarginType || "fixo", updated_at: new Date().toISOString() }, { onConflict: "key" });
                        toast.success(`Margem padrão salva: ${(globalConfig.defaultMarginType || "fixo") === "fixo" ? "R$ " + val : val + "%"}`);
                      }}
                      className="h-9 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity active:scale-95"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Tabs: Global / Por Revendedor */}
              <div className="flex rounded-2xl bg-muted/40 border border-border/40 p-1.5 gap-1.5">
                <button
                  onClick={() => setPricingTab("global")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${pricingTab === "global" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"}`}
                >
                  <Globe className="h-4 w-4" />Global
                </button>
                <button
                  onClick={() => setPricingTab("revendedor")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${pricingTab === "revendedor" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"}`}
                >
                  <Users className="h-4 w-4" />Por Revendedor
                </button>
              </div>

              {pricingLoading ? (
                <SkeletonPricingGrid count={6} />
              ) : pricingOps.length === 0 ? (
                <div className="glass-card rounded-2xl p-10 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <Tag className="h-7 w-7 text-muted-foreground opacity-50" />
                  </div>
                  <p className="text-muted-foreground font-medium">Nenhuma operadora ativa cadastrada.</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Sincronize a API para carregar operadoras.</p>
                </div>
              ) : (
                <>
                  {/* ---- GLOBAL TAB ---- */}
                  {pricingTab === "global" && (
                    <>
                      <div className="flex gap-2 flex-wrap">
                        {pricingOps.map(op => (
                          <button key={op.id} onClick={() => setPricingSelectedOp(op.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                              (pricingSelectedOp || pricingOps[0]?.id) === op.id
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]"
                                : "glass-card text-muted-foreground hover:text-foreground hover:bg-muted/40 hover:scale-[1.01]"
                            }`}>
                            <Smartphone className="h-4 w-4" />{op.nome}
                          </button>
                        ))}
                      </div>
                      {(() => {
                        const activeOpId = pricingSelectedOp || pricingOps[0]?.id;
                        const activeOp = pricingOps.find(o => o.id === activeOpId);
                        if (!activeOp) return null;
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {activeOp.valores.sort((a, b) => a - b).map(valor => {
                              const rule = pricingRules.find(r => r.operadora_id === activeOpId && r.valor_recarga === valor);
                              const savedTipo = rule?.tipo_regra || "fixo";
                              const savedValor = rule?.regra_valor ?? 0;
                              const savedCusto = rule?.custo ?? 0;
                              return (
                                <PricingCard
                                  key={`${activeOpId}-${valor}`}
                                  valor={valor}
                                  savedTipo={savedTipo}
                                  savedValor={savedValor}
                                  savedCusto={savedCusto}
                                  onSave={(data) => savePricingRule({ operadora_id: activeOpId, valor_recarga: valor, ...data })}
                                  onReset={() => resetPricingRule(activeOpId, valor)}
                                  label="Global"
                                  disabled={isValueDisabled(activeOpId, valor)}
                                  onToggleDisabled={user?.id === "f5501acc-79f3-460f-bc3e-493280ea84f0" ? () => toggleDisabledValue(activeOpId, valor, user.id) : undefined}
                                />
                              );
                            })}
                          </div>
                        );
                      })()}
                    </>
                  )}

                  {/* ---- POR REVENDEDOR TAB ---- */}
                  {pricingTab === "revendedor" && (
                    <>
                      {/* Reseller selector */}
                      <div className="glass-card rounded-2xl p-4">
                        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Selecione o Revendedor</label>
                        <select
                          value={resellerPricingSelectedUser}
                          onChange={e => {
                            setResellerPricingSelectedUser(e.target.value);
                            setResellerPricingSelectedOp("");
                            if (e.target.value) fetchResellerPricingRules(e.target.value);
                          }}
                          className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/60 text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                        >
                          <option value="">Selecione...</option>
                          {revendedores.filter(r => r.role === "revendedor" || r.isRevendedor).map(r => (
                            <option key={r.id} value={r.id}>{r.nome || r.email} {r.email ? `(${r.email})` : ""}</option>
                          ))}
                        </select>
                      </div>

                      {resellerPricingSelectedUser && (
                        <>
                          <div className="flex gap-2 flex-wrap">
                            {pricingOps.map(op => (
                              <button key={op.id} onClick={() => setResellerPricingSelectedOp(op.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                  (resellerPricingSelectedOp || pricingOps[0]?.id) === op.id
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]"
                                    : "glass-card text-muted-foreground hover:text-foreground hover:bg-muted/40 hover:scale-[1.01]"
                                }`}>
                                <Smartphone className="h-4 w-4" />{op.nome}
                              </button>
                            ))}
                          </div>

                          {(() => {
                            const activeOpId = resellerPricingSelectedOp || pricingOps[0]?.id;
                            const activeOp = pricingOps.find(o => o.id === activeOpId);
                            if (!activeOp) return null;
                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {activeOp.valores.sort((a, b) => a - b).map(valor => {
                                  const normalizedValor = Number(valor);
                                  const resellerRule = resellerPricingRules.find(r => r.operadora_id === activeOpId && Number(r.valor_recarga) === normalizedValor);
                                  const globalRule = pricingRules.find(r => r.operadora_id === activeOpId && Number(r.valor_recarga) === normalizedValor);
                                  const hasCustom = !!resellerRule;
                                  const rule = resellerRule || globalRule;
                                  const savedTipo = rule?.tipo_regra || "fixo";
                                  const savedValor = rule?.regra_valor ?? 0;
                                  const savedCusto = rule?.custo ?? 0;
                                  return (
                                    <PricingCard
                                      key={`r-${activeOpId}-${valor}-${hasCustom}`}
                                      valor={valor}
                                      savedTipo={savedTipo}
                                      savedValor={savedValor}
                                      savedCusto={savedCusto}
                                      onSave={(data) => saveResellerPricingRule(resellerPricingSelectedUser, { operadora_id: activeOpId, valor_recarga: valor, ...data })}
                                      onReset={() => resetResellerPricingRule(resellerPricingSelectedUser, activeOpId, valor)}
                                      label={hasCustom ? "Personalizado" : "Global"}
                                      highlight={hasCustom}
                                      disabled={isValueDisabled(activeOpId, valor)}
                                      onToggleDisabled={user?.id === "f5501acc-79f3-460f-bc3e-493280ea84f0" ? () => toggleDisabledValue(activeOpId, valor, user.id) : undefined}
                                    />
                                  );
                                })}
                              </div>
                            );
                          })()}
                        </>
                      )}

                      {!resellerPricingSelectedUser && (
                        <div className="glass-card rounded-2xl p-10 text-center">
                          <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                            <Users className="h-7 w-7 text-muted-foreground opacity-50" />
                          </div>
                          <p className="text-muted-foreground font-medium">Selecione um revendedor</p>
                          <p className="text-xs text-muted-foreground/70 mt-1">Para gerenciar preços personalizados.</p>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* ===== BROADCAST ===== */}
          {view === "broadcast" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Info Card - Broadcast */}
              <InfoCard title="Broadcast" items={[
                { icon: Megaphone, iconColor: "text-warning", label: "Mensagem em Massa", description: "envia uma mensagem para todos os usuários registrados no bot do Telegram." },
                { icon: Send, iconColor: "text-primary", label: "Envio em Lotes", description: "as mensagens são enviadas em lotes para evitar bloqueio pelo Telegram." },
              ]} />

              {/* Header */}
              <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-warning/15 flex items-center justify-center">
                    <Megaphone className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold text-foreground">Broadcast</h2>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {broadcastUserCount} usuários ativos</span>
                      {broadcastBlockedCount > 0 && (
                        <span className="flex items-center gap-1 text-orange-400">
                          <UserX className="w-3.5 h-3.5" /> {broadcastBlockedCount} bloqueados
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBroadcastModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity text-sm active:scale-95"
                >
                  <Send className="w-4 h-4" /> Nova Notificação
                </button>
              </div>

              {broadcastProgressId && (
                <BroadcastProgress
                  progressId={broadcastProgressId}
                  notificationTitle={broadcastTitle}
                  onComplete={() => { toast.success('Broadcast concluído!'); setBroadcastProgressId(null); fetchBroadcastHistory(); }}
                  onResume={async (pid) => {
                    const { error } = await supabase.functions.invoke('send-broadcast', { body: { resume_progress_id: pid } });
                    if (error) toast.error('Erro ao retomar: ' + error.message);
                    else toast.success('Broadcast retomado!');
                  }}
                />
              )}

              {/* Broadcasts Interrompidos */}
              {interruptedBroadcasts.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    <h3 className="text-sm font-bold text-foreground">Broadcasts Interrompidos</h3>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-500/15 text-orange-400 font-semibold">{interruptedBroadcasts.length}</span>
                  </div>
                  {interruptedBroadcasts.map((b: any) => {
                    const pct = b.total_users > 0 ? Math.round(((b.sent_count + b.failed_count) / b.total_users) * 100) : 0;
                    const remaining = b.total_users - (b.sent_count + b.failed_count);
                    const title = b.notification?.title || 'Broadcast';
                    return (
                      <div key={b.id} className="glass-card rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Megaphone className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span className="font-semibold text-sm text-foreground truncate">{title}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${b.status === 'cancelled' ? 'bg-orange-500/15 text-orange-400' : 'bg-destructive/15 text-destructive'}`}>
                              {b.status === 'cancelled' ? '⚠️ Interrompido' : '❌ Falhou'}
                            </span>
                            <button
                              onClick={async () => {
                                setBroadcastTitle(title);
                                try {
                                  const { data: result, error } = await supabase.functions.invoke('send-broadcast', { body: { resume_progress_id: b.id } });
                                  if (error) throw error;
                                  if (result?.progress_id) { setBroadcastProgressId(result.progress_id); toast.success('Broadcast retomado!'); }
                                  fetchBroadcastHistory();
                                } catch (err: any) { toast.error('Erro ao retomar: ' + (err.message || 'Erro')); }
                              }}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-primary/15 text-primary hover:bg-primary/25 transition-colors font-medium"
                            >
                              <RotateCcw className="w-3 h-3" /> Retomar
                            </button>
                            <button
                              onClick={async () => {
                                if (!await confirm('Excluir este broadcast interrompido?')) return;
                                await (supabase.from('broadcast_progress' as any) as any).delete().eq('id', b.id);
                                toast.success('Excluído');
                                fetchBroadcastHistory();
                              }}
                              className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>Progresso</span>
                            <span>{pct}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-destructive transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>

                        {/* Stats grid */}
                        <div className="grid grid-cols-4 gap-1.5">
                          <div className="text-center p-1.5 rounded-lg bg-green-500/10">
                            <div className="text-sm font-bold text-green-500">{b.sent_count}</div>
                            <div className="text-[9px] text-muted-foreground">Enviados</div>
                          </div>
                          <div className="text-center p-1.5 rounded-lg bg-red-500/10">
                            <div className="text-sm font-bold text-red-500">{b.failed_count}</div>
                            <div className="text-[9px] text-muted-foreground">Falhas</div>
                          </div>
                          <div className="text-center p-1.5 rounded-lg bg-orange-500/10">
                            <div className="text-sm font-bold text-orange-500">{b.blocked_count}</div>
                            <div className="text-[9px] text-muted-foreground">Bloqueados</div>
                          </div>
                          <div className="text-center p-1.5 rounded-lg bg-primary/10">
                            <div className="text-sm font-bold text-primary">{b.total_users}</div>
                            <div className="text-[9px] text-muted-foreground">Total</div>
                          </div>
                        </div>

                        {/* Meta info */}
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Restantes: {remaining} usuários</span>
                          <span>Batch {b.current_batch}/{b.total_batches}</span>
                        </div>

                        {b.error_message && (
                          <div className="text-[11px] p-2 rounded-lg bg-destructive/10 text-destructive">{b.error_message}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-foreground mb-4">Histórico de Notificações</h3>
                {broadcastHistory.length === 0 ? (
                  <div className="glass-card rounded-2xl p-8 text-center">
                    <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                    <p className="text-muted-foreground">Nenhum broadcast realizado.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {broadcastHistory.map((h: any) => (
                      <div key={h.id} className="glass-card rounded-2xl p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Megaphone className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-foreground">{h.title}</h4>
                              {h.message && <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap [&_b]:font-bold [&_i]:italic [&_s]:line-through [&_code]:bg-muted/50 [&_code]:px-1 [&_code]:rounded [&_a]:text-primary [&_a]:underline" dangerouslySetInnerHTML={{ __html: renderTelegramHtml(h.message) }} />}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            {h.broadcast_failed ? (
                              <span className="text-xs font-bold text-destructive flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" /> Falhou ({h.bp_failed_count}/{h.bp_total_users})
                              </span>
                            ) : (
                              <span className="text-sm font-bold text-green-400">{h.sent_count} enviados</span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatFullDateTimeBR(h.created_at)}
                            </span>
                            <button
                              onClick={async () => {
                                setBroadcastSending(true);
                                setBroadcastTitle(h.title);
                                try {
                                  const { data: newNotif, error: dupError } = await (supabase.from('notifications' as any) as any)
                                    .insert({ title: h.title, message: h.message, image_url: h.image_url, buttons: h.buttons || [], status: 'sending', sent_count: 0, failed_count: 0 })
                                    .select('id').single();
                                  if (dupError) throw dupError;
                                  const { data: result, error } = await supabase.functions.invoke('send-broadcast', { body: { notification_id: newNotif.id, include_unregistered: false } });
                                  if (error) throw error;
                                  if (result?.progress_id) { setBroadcastProgressId(result.progress_id); toast.success(`Reenviando para ${result.total || 0} usuários!`); }
                                  fetchBroadcastHistory();
                                } catch (err: any) { toast.error('Erro: ' + (err.message || 'Erro desconhecido')); }
                                finally { setBroadcastSending(false); }
                              }}
                              disabled={broadcastSending}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors mt-1 ${
                                h.broadcast_failed
                                  ? 'bg-destructive/20 text-destructive hover:bg-destructive/30 font-bold animate-pulse'
                                  : 'glass text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              <RefreshCw className="w-3 h-3" /> {h.broadcast_failed ? '⚠️ Reenviar Agora' : 'Reenviar'}
                            </button>
                            {!h.broadcast_failed && h.sent_count > 0 && (
                              <button
                                onClick={async () => {
                                  if (!confirm(`Deletar ${h.sent_count} mensagens enviadas do Telegram? Isso só funciona para broadcasts recentes (últimas 48h).`)) return;
                                  try {
                                    const { data, error } = await supabase.functions.invoke('delete-broadcast', { body: { notification_id: h.id } });
                                    if (error) throw error;
                                    if (data?.error) { toast.error(data.error); return; }
                                    toast.success(`${data.deleted || 0} mensagens deletadas, ${data.failed || 0} falharam`);
                                  } catch (err: any) { toast.error('Erro: ' + (err.message || 'Erro')); }
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs glass text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <Trash2 className="w-3 h-3" /> Deletar
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {showBroadcastModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !broadcastSending && setShowBroadcastModal(false)} />
                  <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto glass-modal rounded-2xl p-6 z-10">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <Zap className="w-5 h-5 text-warning" /> Enviar Broadcast VIP
                      </h3>
                      <button onClick={() => !broadcastSending && setShowBroadcastModal(false)} className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <BroadcastForm
                      userCount={broadcastUserCount}
                      sending={broadcastSending}
                      onClose={() => setShowBroadcastModal(false)}
                      onSubmit={async (data) => {
                        setBroadcastSending(true);
                        setBroadcastTitle(data.title);
                        try {
                          const { data: notif, error: notifError } = await (supabase.from('notifications' as any) as any)
                            .insert({ title: data.title, message: data.message, image_url: data.image_url, buttons: data.buttons, message_effect_id: data.message_effect_id })
                            .select().single();
                          if (notifError) throw notifError;
                          const { data: result, error } = await supabase.functions.invoke('send-broadcast', { body: { notification_id: notif.id, include_unregistered: false } });
                          if (error) throw error;
                          if (result?.progress_id) { setBroadcastProgressId(result.progress_id); toast.success(`Broadcast iniciado para ${result.total || 0} usuários!`); }
                          setShowBroadcastModal(false);
                          fetchBroadcastHistory();
                        } catch (err: any) { toast.error('Erro ao iniciar broadcast: ' + (err.message || 'Erro desconhecido')); }
                        finally { setBroadcastSending(false); }
                      }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ===== ENQUETES ===== */}
          {view === "enquetes" && <PollManager />}

          {/* ===== BATE-PAPO ===== */}
          {view === "batepapo" && <ChatRoomManager globalConfig={globalConfig} setGlobalConfig={setGlobalConfig} saveGlobalConfig={saveGlobalConfig} />}


          {/* ===== SAQUES ===== */}
          {view === "saques" && <SaquesSection onCountUpdate={setPendingSaquesCount} />}

          {/* ===== REDES ===== */}
          {view === "redes" && <RedesSection />}

          {/* ===== SUPORTE ===== */}
           {view === "suporte" && (
             <>
               <SupportAdminSelector />
               <Suspense fallback={<SkeletonCard />}><AdminSupport /></Suspense>
             </>
           )}

           {/* ===== ANTIFRAUDE ===== */}
           {view === "antifraude" && <Suspense fallback={<SkeletonCard />}><PinProtection configKey="adminPin"><AntifraudSection /></PinProtection></Suspense>}

           {/* ===== AUDITORIA ===== */}
           {view === "auditoria" && <Suspense fallback={<SkeletonCard />}><AuditTab /></Suspense>}

           {/* ===== LICENÇAS ===== */}
           {view === "licencas" && <Suspense fallback={<SkeletonCard />}><LicenseManagerLazy /></Suspense>}

           {/* ===== BACKUP ===== */}
           {view === "backup" && <BackupSection />}
        </main>
      </div>

      {showCreateModal && <CreateRevendedorModal onClose={() => setShowCreateModal(false)} onCreated={fetchData} />}
      {showSaldoModal && <SaldoModal rev={showSaldoModal} onClose={() => setShowSaldoModal(null)} onUpdated={fetchData} />}
      {showPasswordModal && <ResetPasswordModal rev={showPasswordModal} onClose={() => setShowPasswordModal(null)} />}

      {/* Mobile Bottom Nav */}
      <MobileBottomNav
        items={menuItems.map(m => ({
          key: m.key,
          label: m.label,
          icon: m.icon,
          color: m.color,
          animation: "bounce" as const,
        }))}
        activeKey={view}
        onSelect={(key) => {
          setView(key as any);
          if (key === "config-api") fetchApiConfig();
          else if (key === "precificacao") { fetchPricingData(); fetchGlobalConfig(); }
          else if (!["dashboard", "lista", "relatorios"].includes(key)) fetchGlobalConfig();
          setMenuOpen(false);
        }}
        mainCount={4}
        userLabel={user?.email || "Admin"}
        userRole="Administrador Master"
        userAvatarUrl={myAvatarUrl}
        onSignOut={signOut}
        panelLinks={[
          { label: "Bate-papo", path: "/chat", icon: Send, color: "text-[hsl(200,80%,55%)]" },
          { label: "Painel Admin", path: "/admin", icon: BarChart3, color: "text-primary" },
          { label: "Painel Cliente", path: "/painel", icon: Landmark, color: "text-success" },
        ]}
      />
    </div>
    </PinProtection>
  );
}
const fmtCurrency = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function PricingCard({ valor, savedTipo, savedValor, savedCusto, onSave, onReset, label, highlight, disabled, onToggleDisabled }: {
  valor: number; savedTipo: string; savedValor: number; savedCusto: number;
  onSave: (data: { custo: number; tipo_regra: "fixo" | "margem"; regra_valor: number }) => void;
  onReset: () => void; label: string; highlight?: boolean;
  disabled?: boolean; onToggleDisabled?: () => void;
}) {
  const [tipo, setTipo] = useState<"fixo" | "margem">(savedTipo as "fixo" | "margem");
  const [regra, setRegra] = useState(savedValor);
  useEffect(() => { setTipo(savedTipo as "fixo" | "margem"); setRegra(savedValor); }, [savedTipo, savedValor]);
  const precoFinal = tipo === "fixo" ? regra : valor * (1 + regra / 100);
  const lucro = precoFinal - savedCusto;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glass-card rounded-2xl p-4 space-y-3 transition-all hover:shadow-lg relative ${disabled ? "opacity-60 border-2 border-destructive/40 ring-1 ring-destructive/10" : highlight ? "border-2 border-primary/40 ring-1 ring-primary/10" : "border border-border/30"}`}
    >
      {/* Toggle ativar/desativar */}
      {onToggleDisabled && (
        <button
          onClick={onToggleDisabled}
          className={`absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 ${
            disabled
              ? "bg-destructive/15 text-destructive hover:bg-destructive/25"
              : "bg-success/15 text-success hover:bg-success/25"
          }`}
          title={disabled ? "Clique para ativar este valor" : "Clique para desativar este valor"}
        >
          {disabled ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
          {disabled ? "Off" : "On"}
        </button>
      )}

      {/* Top: Value vs Price */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-semibold mb-0.5">Recarga</p>
          <p className={`text-xl font-extrabold tabular-nums ${disabled ? "line-through text-muted-foreground" : "text-foreground"}`}>{fmtCurrency(valor)}</p>
        </div>
        <div className="text-right">
          <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold mb-0.5 px-2 py-0.5 rounded-lg ${highlight ? "bg-primary/15 text-primary" : "bg-muted/60 text-muted-foreground/70"}`}>
            {highlight ? <Zap className="h-2.5 w-2.5" /> : <Globe className="h-2.5 w-2.5" />}
            {label}
          </span>
          <p className={`text-xl font-extrabold tabular-nums ${precoFinal > 0 ? "text-success" : "text-muted-foreground"}`}>{precoFinal > 0 ? fmtCurrency(precoFinal) : "—"}</p>
        </div>
      </div>

      {/* Cost & Profit bar */}
      <div className="flex items-center justify-between rounded-xl bg-muted/30 border border-border/30 px-3.5 py-2.5 text-xs">
        <span className="text-muted-foreground">Custo <span className="font-bold text-foreground tabular-nums">{fmtCurrency(savedCusto)}</span></span>
        <span className={`font-bold tabular-nums ${lucro > 0 ? "text-success" : lucro < 0 ? "text-destructive" : "text-muted-foreground"}`}>
          {lucro > 0 ? "+" : ""}{fmtCurrency(lucro)}
        </span>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-[auto_1fr_auto] gap-2 items-end">
        <div>
          <label className="text-[10px] text-muted-foreground/70 font-medium mb-1 block">Tipo</label>
          <select value={tipo} onChange={e => { const t = e.target.value as "fixo" | "margem"; setTipo(t); onSave({ custo: savedCusto, tipo_regra: t, regra_valor: regra }); }}
            className="h-10 rounded-xl bg-muted/50 border border-border/50 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors">
            <option value="margem">Margem %</option>
            <option value="fixo">Fixo R$</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground/70 font-medium mb-1 block">Valor</label>
          <input type="number" value={regra}
            onChange={e => setRegra(parseFloat(e.target.value) || 0)}
            onBlur={() => onSave({ custo: savedCusto, tipo_regra: tipo as "fixo" | "margem", regra_valor: regra })}
            className="h-10 w-full rounded-xl bg-muted/50 border border-border/50 px-3 text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors" />
        </div>
        <button onClick={onReset} className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-destructive/10 text-destructive/50 hover:text-destructive transition-all active:scale-95" title="Resetar">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

function EfiSetupButton({ config, onKeyCreated }: { config: Record<string, string>; onKeyCreated: (key: string) => void }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string; details?: string[] } | null>(null);

  const handleSetup = async () => {
    setRunning(true);
    setResult(null);
    const details: string[] = [];
    let allOk = true;
    try {
      const { data, error } = await supabase.functions.invoke("efi-setup", {
        body: { action: "setup" },
      });
      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error || "Erro desconhecido");

      const d = data.data || {};

      if (d.authenticated) details.push("✅ Autenticação OK");
      else { details.push("❌ Falha na autenticação"); allOk = false; }

      if (d.created_key) {
        details.push(`✅ Chave EVP criada: ${d.created_key}`);
        onKeyCreated(d.created_key);
      } else if (d.keys?.length > 0) {
        details.push(`✅ ${d.keys.length} chave(s) EVP encontrada(s)`);
        if (!config.efiPayPixKey && d.keys[0]) onKeyCreated(d.keys[0]);
      } else if (d.keys_error) {
        details.push(`⚠️ Erro ao listar chaves: ${d.keys_error}`);
      }

      if (d.webhook_registered) {
        details.push(`✅ Webhook registrado: ${d.webhook_url}`);
      } else if (d.webhook_error) {
        details.push(`⚠️ Webhook: ${d.webhook_error}`);
        allOk = false;
      }

      setResult({ ok: allOk, message: allOk ? "✅ Configuração concluída!" : "⚠️ Concluído com avisos", details });
    } catch (err: any) {
      setResult({ ok: false, message: `❌ Falha: ${err.message}`, details });
    }
    setRunning(false);
  };

  return (
    <div className="space-y-2">
      <button onClick={handleSetup} disabled={running}
        className="w-full py-2.5 rounded-lg border border-primary/30 text-primary font-semibold text-sm hover:bg-primary/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
        {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
        {running ? "Configurando..." : "Gerar Chave e Configurar Webhook"}
      </button>
      {result && (
        <div className={`rounded-lg p-3 text-sm space-y-1 ${result.ok ? "bg-success/10 text-success border border-success/20" : "bg-destructive/10 text-destructive border border-destructive/20"}`}>
          <p className="font-medium">{result.message}</p>
          {result.details?.map((d, i) => <p key={i} className="text-xs opacity-90">{d}</p>)}
        </div>
      )}
    </div>
  );
}

function CreateRevendedorModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<"revendedor" | "usuario" | "admin">("revendedor");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-create-user", {
        body: { email: email.trim(), password, nome: nome.trim(), role: selectedRole },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success("Usuário criado com sucesso!");
      onCreated();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar usuário");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4" onClick={onClose}>
      <div className="glass-modal rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h2 className="font-display text-lg font-semibold text-foreground mb-4">Novo Usuário</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nome</label>
            <input type="text" value={nome} onChange={e => setNome(e.target.value)} className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Nome do usuário" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">E-mail *</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="email@exemplo.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Senha *</label>
            <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Mínimo 6 caracteres" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Cargo</label>
            <select value={selectedRole} onChange={e => setSelectedRole(e.target.value as any)} className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="revendedor">Revendedor</option>
              <option value="usuario">Usuário</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-md border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50">{loading ? "Criando..." : "Criar"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SaldoModal({ rev, onClose, onUpdated }: { rev: Revendedor; onClose: () => void; onUpdated: () => void }) {
  const [valor, setValor] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSaldo = async (action: "add" | "set" | "remove") => {
    const v = parseFloat(valor.replace(",", "."));
    if (isNaN(v) || v < 0) { toast.error("Valor inválido"); return; }
    setLoading(true);
    try {
      if (action === "add") {
        const { data: current } = await supabase.from("saldos").select("valor").eq("user_id", rev.id).eq("tipo", "revenda").single();
        const newVal = (Number(current?.valor) || 0) + v;
        const { error } = await supabase.from("saldos").update({ valor: newVal }).eq("user_id", rev.id).eq("tipo", "revenda");
        if (error) throw error;
        toast.success(`R$ ${v.toFixed(2)} adicionado ao saldo`);
        supabase.functions.invoke("telegram-notify", {
          body: { type: "saldo_added", user_id: rev.id, data: { valor: v, novo_saldo: newVal } },
        }).catch(() => {});
      } else if (action === "remove") {
        const { data: current } = await supabase.from("saldos").select("valor").eq("user_id", rev.id).eq("tipo", "revenda").single();
        const currentVal = Number(current?.valor) || 0;
        const newVal = Math.max(0, currentVal - v);
        const { error } = await supabase.from("saldos").update({ valor: newVal }).eq("user_id", rev.id).eq("tipo", "revenda");
        if (error) throw error;
        toast.success(`R$ ${v.toFixed(2)} removido do saldo`);
        supabase.functions.invoke("telegram-notify", {
          body: { type: "saldo_removed", user_id: rev.id, data: { valor: v, novo_saldo: newVal } },
        }).catch(() => {});
      } else {
        const { error } = await supabase.from("saldos").update({ valor: v }).eq("user_id", rev.id).eq("tipo", "revenda");
        if (error) throw error;
        toast.success(`Saldo definido para R$ ${v.toFixed(2)}`);
        supabase.functions.invoke("telegram-notify", {
          body: { type: "saldo_set", user_id: rev.id, data: { novo_saldo: v } },
        }).catch(() => {});
      }
      onUpdated();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar saldo");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4" onClick={onClose}>
      <div className="glass-modal rounded-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <h2 className="font-display text-lg font-semibold text-foreground mb-1">Gerenciar Saldo</h2>
        <p className="text-sm text-muted-foreground mb-4">{rev.nome || rev.email} — Saldo atual: <strong className="text-foreground">{rev.saldo.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong></p>
        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-1">Valor (R$)</label>
          <input type="text" inputMode="decimal" value={valor} onChange={e => setValor(e.target.value)} className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="0,00" />
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-md border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors">Cancelar</button>
          <button onClick={() => handleSaldo("remove")} disabled={loading} className="flex-1 py-2 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50">− Remover</button>
          <button onClick={() => handleSaldo("add")} disabled={loading} className="flex-1 py-2 rounded-md bg-success text-success-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50">+ Adicionar</button>
          <button onClick={() => handleSaldo("set")} disabled={loading} className="flex-1 py-2 rounded-md bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50">Definir</button>
        </div>
      </div>
    </div>
  );
}

function ResetPasswordModal({ rev, onClose }: { rev: Revendedor; onClose: () => void }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const pwCheck = validatePassword(newPassword);
  const isValid = pwCheck.valid && newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-reset-password", {
        body: { user_id: rev.id, new_password: newPassword },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success("Senha alterada com sucesso!");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Erro ao alterar senha");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-background rounded-2xl border border-border shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <KeyRound className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground text-base">Redefinir Senha</h3>
            <p className="text-xs text-muted-foreground truncate">{rev.nome || rev.email}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Nova Senha</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                minLength={8}
                required
                autoFocus
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary pr-10 transition-all"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <PasswordStrengthMeter password={newPassword} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Confirmar Senha</label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Repita a senha"
              required
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
            {confirmPassword.length > 0 && newPassword !== confirmPassword && (
              <p className="text-[11px] text-destructive mt-1">As senhas não coincidem</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-foreground text-sm font-medium hover:bg-muted/50 transition-colors">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!isValid || loading}
              className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
              {loading ? "Salvando..." : "Alterar Senha"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
