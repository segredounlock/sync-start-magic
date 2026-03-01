import { useAuth } from "@/hooks/useAuth";
import { PinProtection } from "@/components/PinProtection";
import { SkeletonRow, SkeletonCard } from "@/components/Skeleton";
import BackupSection from "@/components/BackupSection";
import { BroadcastForm } from "@/components/BroadcastForm";
import { BroadcastProgress } from "@/components/BroadcastProgress";
import { AnimatedIcon } from "@/components/AnimatedIcon";
import { AnimatedCounter, AnimatedInt } from "@/components/AnimatedCounter";
import { PromoBanner } from "@/components/PromoBanner";
import { BannersManager } from "@/components/BannersManager";
import { ThemeToggle } from "@/components/ThemeToggle";
import { RealtimeNotifications } from "@/components/RealtimeNotifications";
import RealtimeDashboard from "@/components/RealtimeDashboard";
import { MobileBottomNav, NavItem } from "@/components/MobileBottomNav";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import {
  LogOut, Users, DollarSign, Smartphone, BarChart3, Plus, Search,
  ToggleLeft, ToggleRight, History, Landmark, TrendingUp,
  Wallet, Menu, X, Shield, Eye, Phone, Mail, Calendar, ChevronRight,
  ArrowLeft, UserCheck, UserX, Hash, Activity, CreditCard, Settings, Save, Loader2,
  Globe, Bot, RefreshCw, Wifi, WifiOff, CheckCircle2, AtSign, Trash2, AlertTriangle,
  ChevronDown, Link2, EyeOff, Tag, FileText, Copy, Zap, RotateCcw, Clock, HardDrive, Package,
  Download, Upload, Database, CheckSquare, Square, Server, Send, Megaphone,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllRows } from "@/lib/fetchAll";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Revendedor {
  id: string;
  nome: string | null;
  email: string | null;
  active: boolean;
  created_at: string;
  saldo: number;
  telefone: string | null;
  telegram_username: string | null;
  whatsapp_number: string | null;
  isRevendedor: boolean;
  role: "admin" | "revendedor" | "cliente" | "usuario" | "sem_role";
  avatar_url: string | null;
}

interface RecargaHistorico {
  id: string;
  user_id: string;
  telefone: string;
  operadora: string | null;
  valor: number;
  custo: number;
  custo_api: number;
  status: string;
  created_at: string;
}

type PrincipalView = "dashboard" | "lista" | "detalhe" | "config-api" | "pagamentos" | "depositos" | "bot" | "geral" | "relatorios" | "backup" | "precificacao" | "broadcast";

interface PricingRule {
  id?: string;
  operadora_id: string;
  valor_recarga: number;
  custo: number;
  tipo_regra: "fixo" | "margem";
  regra_valor: number;
}

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

export default function Principal() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [revendedores, setRevendedores] = useState<Revendedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"todos" | "admin" | "revendedor" | "cliente" | "usuario" | "sem_role">("todos");
  const [menuOpen, setMenuOpen] = useState(false);
  const [view, setView] = useState<PrincipalView>("dashboard");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSaldoModal, setShowSaldoModal] = useState<Revendedor | null>(null);

  // Broadcast state
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [broadcastProgressId, setBroadcastProgressId] = useState<string | null>(null);
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastUserCount, setBroadcastUserCount] = useState(0);
  const [broadcastHistory, setBroadcastHistory] = useState<any[]>([]);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  const [selectedRev, setSelectedRev] = useState<Revendedor | null>(null);
  const [revRecargas, setRevRecargas] = useState<RecargaHistorico[]>([]);
  const [revTransactions, setRevTransactions] = useState<{ amount: number; created_at: string; status: string; type: string }[]>([]);
  const [revLoading, setRevLoading] = useState(false);
  const [revGatewayConfig, setRevGatewayConfig] = useState<Record<string, string>>({});
  const [revGatewayLoading, setRevGatewayLoading] = useState(false);
  const [revPricingRules, setRevPricingRules] = useState<{ operadora_id: string; valor_recarga: number; regra_valor: number }[]>([]);
  const [revDetailPricingRules, setRevDetailPricingRules] = useState<PricingRule[]>([]);
  const [revDetailPricingOp, setRevDetailPricingOp] = useState<string>("");
  const [revDetailPricingOpen, setRevDetailPricingOpen] = useState(false);

  // All recargas for counting
  const [allRecargas, setAllRecargas] = useState<RecargaHistorico[]>([]);
  const [allUsers, setAllUsers] = useState<{ id: string; active: boolean; created_at: string }[]>([]);

  // Report state
  const [reportData, setReportData] = useState<{ user_id: string; nome: string | null; email: string | null; totalRecargas: number; totalValor: number; totalVendas: number; totalCusto: number; lucro: number }[]>([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>("mes");

  // Config API states
  const [apiConfig, setApiConfig] = useState<Record<string, string>>({});
  const [configLoading, setConfigLoading] = useState(false);
  const [configSaving, setConfigSaving] = useState(false);

  // Global config states (Pagamentos, Depósitos, Bot, Geral)
  const [globalConfig, setGlobalConfig] = useState<Record<string, string>>({});
  const [globalConfigLoading, setGlobalConfigLoading] = useState(false);
  const [globalConfigSaving, setGlobalConfigSaving] = useState(false);

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

  // Pricing rules state
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [pricingOps, setPricingOps] = useState<{ id: string; nome: string; valores: number[]; ativo: boolean }[]>([]);
  const [pricingSelectedOp, setPricingSelectedOp] = useState<string>("");
  const [pricingSaving, setPricingSaving] = useState<Record<string, boolean>>({});
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingTab, setPricingTab] = useState<"global" | "revendedor">("global");

  // Reseller pricing state
  const [resellerPricingRules, setResellerPricingRules] = useState<PricingRule[]>([]);
  const [resellerPricingSelectedUser, setResellerPricingSelectedUser] = useState<string>("");
  const [resellerPricingSelectedOp, setResellerPricingSelectedOp] = useState<string>("");
  const [resellerPricingSaving, setResellerPricingSaving] = useState<Record<string, boolean>>({});

  const configKeys = ["apiBaseURL", "apiKey", "margemLucro", "alertaSaldoBaixo", "consultaOperadoraURL", "consultaOperadoraKey"];

  const fetchApiConfig = useCallback(async () => {
    setConfigLoading(true);
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
    setConfigLoading(false);
  }, []);

  const fetchGlobalConfig = useCallback(async () => {
    setGlobalConfigLoading(true);
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
    setGlobalConfigLoading(false);
  }, [user?.id]);

  const saveGlobalConfig = async () => {
    setGlobalConfigSaving(true);
    try {
      for (const [key, value] of Object.entries(globalConfig)) {
        await supabase.from("system_config").upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
      }
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

  const fetchPricingData = useCallback(async () => {
    setPricingLoading(true);
    try {
      // 1. Fetch catalog from API to sync operadoras
      const { data: catData, error: catError } = await supabase.functions.invoke("recarga-express", {
        body: { action: "catalog" },
      });

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
          // Sync API costs into pricing_rules (only update custo, don't overwrite user rules)
          if (opId) {
            for (const v of values) {
              const faceValue = v.value || v.cost;
              const apiCost = v.cost || 0;
              if (faceValue > 0 && apiCost > 0) {
                const { data: existingRule } = await supabase.from("pricing_rules")
                  .select("id, custo, regra_valor")
                  .eq("operadora_id", opId)
                  .eq("valor_recarga", faceValue)
                  .maybeSingle();
                if (existingRule) {
                  // Update custo if it was 0 (not yet set)
                  if (Number(existingRule.custo) === 0) {
                    await supabase.from("pricing_rules").update({ custo: apiCost }).eq("id", existingRule.id);
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
          }
        }
        toast.success(`${catData.data.length} operadora(s) sincronizadas da API!`);
      }

      // 2. Now fetch from DB (synced)
      const [{ data: ops }, { data: rules }] = await Promise.all([
        supabase.from("operadoras").select("*").eq("ativo", true).order("nome"),
        supabase.from("pricing_rules").select("*"),
      ]);
      setPricingOps((ops || []).map((o: any) => ({ ...o, valores: o.valores || [] })));
      setPricingRules((rules || []).map((r: any) => ({ ...r, valor_recarga: Number(r.valor_recarga), custo: Number(r.custo), regra_valor: Number(r.regra_valor), tipo_regra: r.tipo_regra as "fixo" | "margem" })));
    } catch (err) { console.error(err); toast.error("Erro ao carregar precificação"); }
    setPricingLoading(false);
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

  const resetPricingRule = async (operadora_id: string, valor_recarga: number) => {
    const existing = pricingRules.find(r => r.operadora_id === operadora_id && r.valor_recarga === valor_recarga);
    if (!existing?.id) return;
    try {
      await supabase.from("pricing_rules").delete().eq("id", existing.id);
      toast.success("Regra removida");
      fetchPricingData();
    } catch (err: any) { toast.error(err.message || "Erro"); }
  };

  const fetchResellerPricingRules = useCallback(async (userId: string) => {
    try {
      const { data } = await supabase.from("reseller_pricing_rules").select("*").eq("user_id", userId);
      const mapped = (data || []).map((r: any) => ({ ...r, valor_recarga: Number(r.valor_recarga), custo: Number(r.custo), regra_valor: Number(r.regra_valor), tipo_regra: r.tipo_regra as "fixo" | "margem" }));
      setResellerPricingRules(mapped);
      setRevDetailPricingRules(mapped);
    } catch (err) { console.error(err); }
  }, []);

  const saveResellerPricingRule = async (userId: string, rule: PricingRule) => {
    const key = `r-${rule.operadora_id}-${rule.valor_recarga}`;
    setResellerPricingSaving(prev => ({ ...prev, [key]: true }));
    try {
      const { error } = await supabase.from("reseller_pricing_rules").upsert({
        user_id: userId,
        operadora_id: rule.operadora_id,
        valor_recarga: rule.valor_recarga,
        custo: rule.custo,
        tipo_regra: rule.tipo_regra,
        regra_valor: rule.regra_valor,
        updated_at: new Date().toISOString(),
      } as any, { onConflict: "user_id,operadora_id,valor_recarga" } as any);
      if (error) throw error;
      toast.success(`Preço para R$ ${rule.valor_recarga.toFixed(2)} salvo!`);
      fetchResellerPricingRules(userId);
    } catch (err: any) { toast.error(err.message || "Erro ao salvar"); }
    setResellerPricingSaving(prev => ({ ...prev, [key]: false }));
  };

  const resetResellerPricingRule = async (userId: string, operadora_id: string, valor_recarga: number) => {
    const existing = resellerPricingRules.find(r => r.operadora_id === operadora_id && r.valor_recarga === valor_recarga)
      || revDetailPricingRules.find(r => r.operadora_id === operadora_id && r.valor_recarga === valor_recarga);
    if (!existing?.id) return;
    try {
      await supabase.from("reseller_pricing_rules").delete().eq("id", existing.id);
      // Update local state immediately to avoid page jump
      const filter = (rules: PricingRule[]) => rules.filter(r => r.id !== existing.id);
      setResellerPricingRules(prev => filter(prev));
      setRevDetailPricingRules(prev => filter(prev));
      toast.success("Preço removido (usará preço global)");
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

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [roles, profiles, saldos, recData] = await Promise.all([
        fetchAllRows("user_roles", { select: "user_id, role" }),
        fetchAllRows("profiles", { select: "id, nome, email, active, created_at, telegram_username, whatsapp_number, avatar_url" }),
        fetchAllRows("saldos", { select: "user_id, valor", filters: (q: any) => q.eq("tipo", "revenda") }),
        fetchAllRows("recargas", { select: "id, telefone, operadora, valor, custo, custo_api, status, created_at, user_id", orderBy: { column: "created_at", ascending: false } }),
      ]);

      setAllUsers((profiles || []).map(p => ({ id: p.id, active: p.active, created_at: p.created_at })));

      const roleMap: Record<string, string> = {};
      (roles || []).forEach(r => {
        const current = roleMap[r.user_id];
        if (!current || r.role === "admin") roleMap[r.user_id] = r.role;
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
          isRevendedor: roleMap[p.id] === "revendedor",
          role: resolvedRole,
          avatar_url: p.avatar_url || null,
        };
      });

      setRevendedores(list);
      setAllRecargas((recData || []).map(r => ({ ...r, valor: Number(r.valor), custo: Number(r.custo), custo_api: Number(r.custo_api || 0) })));
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar dados");
    }
    setLoading(false);
  }, []);

  const fetchRevDetail = useCallback(async (rev: Revendedor) => {
    setRevLoading(true);
    try {
      const [{ data: recData }, { data: transData }, { data: rpRules }] = await Promise.all([
        supabase.from("recargas").select("*").eq("user_id", rev.id).order("created_at", { ascending: false }).limit(100),
        supabase.from("transactions").select("amount, created_at, status, type").eq("user_id", rev.id).order("created_at", { ascending: false }).limit(100),
        supabase.from("reseller_pricing_rules").select("*").eq("user_id", rev.id),
      ]);
      setRevRecargas((recData || []).map(r => ({ ...r, valor: Number(r.valor), custo: Number(r.custo) })));
      setRevTransactions((transData || []).map(t => ({ ...t, amount: Number(t.amount) })));
      setRevPricingRules((rpRules || []).map(r => ({ operadora_id: r.operadora_id, valor_recarga: Number(r.valor_recarga), regra_valor: Number(r.regra_valor) })));
      setRevDetailPricingRules((rpRules || []).map((r: any) => ({ ...r, valor_recarga: Number(r.valor_recarga), custo: Number(r.custo), regra_valor: Number(r.regra_valor), tipo_regra: r.tipo_regra as "fixo" | "margem" })));
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

  useEffect(() => { fetchData(); }, [fetchData]);

  // Realtime: atualiza usuários automaticamente
  useEffect(() => {
    const channel = supabase.channel('principal-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'saldos' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_roles' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'recargas' }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

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
    if (!confirm("Resetar gateway do revendedor? Ele usará a gateway global.")) return;
    try {
      await supabase.from("reseller_config").delete().eq("user_id", userId);
      toast.success("Gateway do revendedor resetada!");
      setRevGatewayConfig({});
    } catch (err: any) {
      toast.error(err.message || "Erro ao resetar");
    }
  };

  const filtered = revendedores.filter(r => {
    const matchSearch = (r.nome || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.email || "").toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "todos" || r.role === roleFilter;
    return matchSearch && matchRole;
  });

  const totalUsers = allUsers.length;
  const activeCount = allUsers.filter(u => u.active).length;
  const inactiveCount = allUsers.filter(u => !u.active).length;
  const totalSaldo = revendedores.reduce((s, r) => s + r.saldo, 0);

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const fmtDate = (d: string) => new Date(d).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });

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
    if (reportPeriod === "hoje") return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    if (reportPeriod === "7dias") { const d = new Date(now); d.setDate(d.getDate() - 7); return d.toISOString(); }
    if (reportPeriod === "mes") return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
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
        supabase.from("reseller_pricing_rules").select("*"),
        supabase.from("pricing_rules").select("*"),
        supabase.from("operadoras").select("id, nome"),
      ]);

      const profileMap: Record<string, { nome: string | null; email: string | null }> = {};
      (profiles || []).forEach((p: any) => { profileMap[p.id] = { nome: p.nome, email: p.email }; });

      const opNameToId: Record<string, string> = {};
      (opsData || []).forEach((o: any) => { opNameToId[o.nome] = o.id; });

      const globalPriceMap: Record<string, { preco: number; custo: number }> = {};
      (globalPricing || []).forEach((r: any) => {
        const preco = r.tipo_regra === "fixo" ? Number(r.regra_valor) : Number(r.valor_recarga) * (1 + Number(r.regra_valor) / 100);
        globalPriceMap[`${r.operadora_id}-${r.valor_recarga}`] = { preco, custo: Number(r.custo) };
      });

      const resellerPriceMap: Record<string, Record<string, { preco: number; custo: number }>> = {};
      (allResellerPricing || []).forEach((r: any) => {
        if (!resellerPriceMap[r.user_id]) resellerPriceMap[r.user_id] = {};
        const preco = r.tipo_regra === "fixo" ? Number(r.regra_valor) : Number(r.valor_recarga) * (1 + Number(r.regra_valor) / 100);
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
    setReportLoading(false);
  }, [reportPeriodStart]);

  useEffect(() => { if (view === "relatorios") fetchReport(); }, [view, fetchReport]);
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
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayRecs = allRecargas.filter(r => r.created_at?.slice(0, 10) === todayStr);
    const completedToday = todayRecs.filter(r => r.status === "completed" || r.status === "concluida");
    const cobradoHoje = completedToday.reduce((s, r) => s + r.custo, 0);
    const custoApiHoje = completedToday.reduce((s, r) => s + r.custo_api, 0);
    const lucroHoje = cobradoHoje - custoApiHoje;
    const receitaHoje = cobradoHoje;

    const now = new Date();
    const mesStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const mesRecs = allRecargas.filter(r => r.created_at >= mesStart && (r.status === "completed" || r.status === "concluida"));
    const cobradoMes = mesRecs.reduce((s, r) => s + r.custo, 0);
    const custoApiMes = mesRecs.reduce((s, r) => s + r.custo_api, 0);
    const lucroMes = cobradoMes - custoApiMes;
    const receitaMes = cobradoMes;

    // Top 5 resellers by volume today
    const revVolumeMap: Record<string, { nome: string; count: number; total: number }> = {};
    todayRecs.forEach(r => {
      const rev = revendedores.find(rv => rv.id === r.user_id);
      if (!rev) return;
      if (!revVolumeMap[r.user_id]) revVolumeMap[r.user_id] = { nome: rev.nome || rev.email || "Sem nome", count: 0, total: 0 };
      revVolumeMap[r.user_id].count++;
      revVolumeMap[r.user_id].total += r.valor;
    });
    const topResellers = Object.entries(revVolumeMap)
      .map(([id, d]) => ({ id, ...d }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    // Recent 8 recharges
    const recentRecs = allRecargas.slice(0, 8);

    // Resellers with low balance (<50)
    const lowBalanceRevs = revendedores.filter(r => r.saldo > 0 && r.saldo < 50 && r.active);

    // Total global (all time)
    const allCompleted = allRecargas.filter(r => r.status === "completed" || r.status === "concluida");
    const cobradoTotal = allCompleted.reduce((s, r) => s + r.custo, 0);
    const custoApiTotal = allCompleted.reduce((s, r) => s + r.custo_api, 0);
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
      case "pagamentos": return "Pagamentos";
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
      .select('id, title, message, sent_count, created_at')
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) {
      const ids = data.map((n: any) => n.id);
      const { data: progresses } = await (supabase.from('broadcast_progress' as any) as any)
        .select('notification_id, status')
        .in('notification_id', ids)
        .order('created_at', { ascending: false });
      const statusMap: Record<string, string> = {};
      progresses?.forEach((p: any) => { if (!statusMap[p.notification_id]) statusMap[p.notification_id] = p.status; });
      setBroadcastHistory(data.map((n: any) => ({ ...n, status: statusMap[n.id] || 'pending' })));
    }
  }, []);

  const fetchBroadcastUserCount = useCallback(async () => {
    const { count } = await (supabase.from('telegram_users' as any) as any)
      .select('*', { count: 'exact', head: true })
      .eq('is_blocked', false)
      .eq('is_registered', true);
    setBroadcastUserCount(count || 0);
  }, []);

  useEffect(() => { if (view === "broadcast") { fetchBroadcastHistory(); fetchBroadcastUserCount(); } }, [view, fetchBroadcastHistory, fetchBroadcastUserCount]);

  const menuItems: { key: string; icon: any; label: string; color: string; link?: string }[] = [
    { key: "dashboard", icon: BarChart3, label: "Dashboard", color: "text-primary" },
    { key: "lista", icon: Users, label: "Usuários", color: "text-accent" },
    { key: "relatorios", icon: FileText, label: "Relatórios", color: "text-warning" },
    { key: "precificacao", icon: Tag, label: "Precificação", color: "text-warning" },
    { key: "config-api", icon: Settings, label: "API Recarga", color: "text-[hsl(280,70%,60%)]" },
    { key: "pagamentos", icon: CreditCard, label: "Pagamentos", color: "text-destructive" },
    { key: "depositos", icon: Landmark, label: "Depósitos", color: "text-success" },
    { key: "bot", icon: Bot, label: "Bot Telegram", color: "text-[hsl(200,80%,55%)]" },
    { key: "broadcast", icon: Megaphone, label: "Broadcast", color: "text-warning" },
    { key: "backup", icon: HardDrive, label: "Backup", color: "text-[hsl(40,80%,55%)]" },
    { key: "geral", icon: Globe, label: "Configurações", color: "text-muted-foreground" },
  ];

  return (
    <div className="min-h-screen md:flex">
      {/* Mobile Menu Bottom Sheet */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setMenuOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background border-t border-border rounded-t-2xl max-h-[70vh] overflow-y-auto">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mt-3 mb-2" />
            <div className="px-4 pb-3 grid grid-cols-3 gap-2">
              {menuItems.map((item) => {
                const isActive = view === item.key;
                return (
                  <button key={item.key}
                    onClick={() => {
                      if (item.link) { navigate(item.link); } else {
                        setView(item.key as any);
                        if (item.key === "config-api") fetchApiConfig();
                        else if (item.key === "precificacao") fetchPricingData();
                        else if (!["dashboard", "lista", "relatorios"].includes(item.key)) fetchGlobalConfig();
                      }
                      setMenuOpen(false);
                    }}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium transition-all group ${
                      isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/40"
                    }`}>
                    <item.icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5" />
                    <span className="text-center leading-tight">{item.label}</span>
                  </button>
                );
              })}
              <button onClick={() => { navigate("/admin"); setMenuOpen(false); }}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium text-muted-foreground hover:bg-muted/40 transition-all">
                <BarChart3 className="h-5 w-5 text-primary" />
                <span className="text-center leading-tight">Painel Admin</span>
              </button>
              <button onClick={() => { navigate("/painel"); setMenuOpen(false); }}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium text-muted-foreground hover:bg-muted/40 transition-all">
                <Landmark className="h-5 w-5 text-success" />
                <span className="text-center leading-tight">Painel Cliente</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:block md:sticky top-0 left-0 h-screen w-[250px] z-30 border-r border-border glass-header">
        <div className="h-full flex flex-col">
          <div className="px-5 py-5 border-b border-border">
            <h1 className="font-display text-xl font-bold shimmer-letters">
              Recargas <span className="brasil-word">Brasil</span>
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-white font-medium mt-1">Principal</p>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {menuItems.map(item => {
              const isActive = view === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    if (item.link) { navigate(item.link); } else {
                      setView(item.key as any);
                      if (item.key === "config-api") fetchApiConfig();
                      else if (item.key === "precificacao") fetchPricingData();
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
                  <item.icon className={`h-5 w-5 shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${isActive ? "text-primary-foreground animate-[pulse_2s_ease-in-out_1]" : item.color}`} />
                  <span>{item.label}</span>
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
                </button>
              );
            })}
          </nav>

          <div className="p-3 border-t border-border space-y-1">
            <button onClick={() => navigate("/admin")} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors">
              <BarChart3 className="h-4 w-4 text-primary" /> <span>Painel Admin</span>
            </button>
            <button onClick={() => navigate("/painel")} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors">
              <Landmark className="h-4 w-4 text-success" /> <span>Painel Cliente</span>
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
              {view === "pagamentos" && "Configure gateways de pagamento."}
              {view === "depositos" && "Configure limites e taxas de depósitos."}
              {view === "bot" && "Configure o bot do Telegram."}
              {view === "geral" && "Configurações gerais do sistema."}
              {view === "broadcast" && "Envie mensagens em massa para usuários do Telegram."}
              {view === "backup" && "Exportar e restaurar backup do sistema."}
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
            <RealtimeNotifications
              listenTo={["deposit", "recarga"]}
              revendedores={revendedores.map(r => ({ id: r.id, nome: r.nome, email: r.email }))}
              showFilter={true}
            />
          </div>
        </header>

        <main className="max-w-6xl mx-auto p-4 md:p-6 pb-24 md:pb-6 space-y-6">

          {/* ===== DASHBOARD ===== */}
          {view === "dashboard" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* KPI Row */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {[
                  { icon: Smartphone, label: "Recargas Hoje", rawValue: dashboardMetrics.recargasHoje, isInt: true, sub: `${dashboardMetrics.completedHoje} concluídas`, color: "text-primary", bgColor: "bg-primary/10" },
  { icon: TrendingUp, label: "Vendas Hoje", rawValue: dashboardMetrics.receitaHoje, isInt: false, sub: `Custo API: ${fmt(dashboardMetrics.receitaHoje - dashboardMetrics.lucroHoje)} • Lucro: ${fmt(dashboardMetrics.lucroHoje)}`, color: "text-success", bgColor: "bg-success/10" },
                  { icon: Wallet, label: "Saldo Total", rawValue: totalSaldo, isInt: false, sub: `${activeCount} revendedores ativos`, color: "text-warning", bgColor: "bg-warning/10" },
                  { icon: DollarSign, label: "Vendas do Mês", rawValue: dashboardMetrics.receitaMes, isInt: false, sub: `Custo API: ${fmt(dashboardMetrics.receitaMes - dashboardMetrics.lucroMes)} • Lucro: ${fmt(dashboardMetrics.lucroMes)}`, color: "text-accent", bgColor: "bg-accent/10" },
                  { icon: BarChart3, label: "Lucro Acumulado", rawValue: dashboardMetrics.lucroTotal, isInt: false, sub: `${dashboardMetrics.totalRecargas} recargas • Custo API: ${fmt(dashboardMetrics.custoTotal)}`, color: "text-success", bgColor: "bg-success/10" },
                  { icon: Activity, label: "Faturamento Total", rawValue: dashboardMetrics.receitaTotal, isInt: false, sub: `Custo API: ${fmt(dashboardMetrics.custoTotal)} • Lucro: ${fmt(dashboardMetrics.lucroTotal)}`, color: "text-primary", bgColor: "bg-primary/10" },
                ].map((c) => (
                  <div key={c.label} className="glass-card rounded-2xl p-4 md:p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-11 h-11 rounded-2xl ${c.bgColor} flex items-center justify-center shrink-0`}>
                        <c.icon className={`h-5 w-5 ${c.color}`} />
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{c.label}</p>
                    <p className={`text-xl md:text-2xl font-bold ${c.color} mt-0.5`}>
                      {c.isInt ? (
                        <AnimatedInt value={c.rawValue} />
                      ) : (
                        <AnimatedCounter value={c.rawValue} prefix="R$&nbsp;" />
                      )}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">{c.sub}</p>
                  </div>
                ))}
                {/* Saldo Provedor (API) */}
                <div className="glass-card rounded-2xl p-4 md:p-5 col-span-2 lg:col-span-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-11 h-11 rounded-2xl bg-[hsl(280,70%,60%)]/10 flex items-center justify-center shrink-0">
                      <Server className="h-5 w-5 text-[hsl(280,70%,60%)]" />
                    </div>
                    <button onClick={fetchProviderBalance} disabled={providerBalance.loading}
                      className="p-1.5 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50">
                      <RefreshCw className={`h-3.5 w-3.5 ${providerBalance.loading ? "animate-spin" : ""}`} />
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Saldo Provedor</p>
                  {providerBalance.loading ? (
                    <div className="mt-1"><SkeletonCard /></div>
                  ) : providerBalance.error ? (
                    <p className="text-xl md:text-2xl font-bold text-destructive mt-0.5">Erro</p>
                  ) : providerBalance.value !== null ? (
                    <p className={`text-xl md:text-2xl font-bold mt-0.5 ${providerBalance.value < 50 ? "text-destructive" : "text-[hsl(280,70%,60%)]"}`}>
                      <AnimatedCounter value={providerBalance.value} prefix="R$&nbsp;" />
                    </p>
                  ) : (
                    <p className="text-xl md:text-2xl font-bold text-muted-foreground mt-0.5">—</p>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {providerBalance.error ? "Falha ao consultar API" : "API Recarga Express"}
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="glass-card rounded-xl p-4 md:p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" /> Ações Rápidas
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
                    <Plus className="h-4 w-4" /> Novo Revendedor
                  </button>
                  <button onClick={() => setView("lista")} className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-muted/60 text-foreground text-sm font-medium hover:bg-muted transition-colors">
                    <Users className="h-4 w-4" /> Ver Revendedores
                  </button>
                  <button onClick={() => { setView("relatorios"); }} className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-muted/60 text-foreground text-sm font-medium hover:bg-muted transition-colors">
                    <FileText className="h-4 w-4" /> Relatórios
                  </button>
                  <button onClick={() => { setView("config-api"); fetchApiConfig(); }} className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-muted/60 text-foreground text-sm font-medium hover:bg-muted transition-colors">
                    <Settings className="h-4 w-4" /> Configurar API
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Recent Activity */}
                <div className="glass-card rounded-xl p-4 md:p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <History className="h-4 w-4 text-muted-foreground" /> Atividade Recente
                    </h3>
                    <button onClick={() => setView("lista")} className="text-xs text-primary font-medium hover:underline">Ver tudo</button>
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
                            <div className={`w-2 h-2 rounded-full shrink-0 ${statusOk ? "bg-success" : r.status === "pending" ? "bg-warning" : "bg-destructive"}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground truncate">
                                {rev?.nome || rev?.email?.split("@")[0] || "—"} • {r.operadora || "—"}
                              </p>
                              <p className="text-[10px] text-muted-foreground">{r.telefone} • {fmtDate(r.created_at)}</p>
                            </div>
                            <span className="text-sm font-bold font-mono text-foreground shrink-0">{fmt(r.valor)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Top Resellers Today */}
                <div className="glass-card rounded-xl p-4 md:p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-success" /> Top Revendedores Hoje
                  </h3>
                  {dashboardMetrics.topResellers.length === 0 ? (
                    <p className="text-center py-6 text-muted-foreground text-sm">Sem atividade hoje</p>
                  ) : (
                    <div className="space-y-2">
                      {dashboardMetrics.topResellers.map((r, i) => (
                        <div key={r.id} className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0 cursor-pointer hover:bg-muted/30 rounded-lg px-2 -mx-2 transition-colors"
                          onClick={() => { const rev = revendedores.find(rv => rv.id === r.id); if (rev) openRevDetail(rev); }}>
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${i === 0 ? "bg-warning/20 text-warning" : "bg-muted/60 text-muted-foreground"}`}>
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{r.nome}</p>
                            <p className="text-[10px] text-muted-foreground">{r.count} recargas</p>
                          </div>
                          <span className="text-sm font-bold font-mono text-success shrink-0">{fmt(r.total)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Alerts Row */}
              {dashboardMetrics.lowBalanceRevs.length > 0 && (
                <div className="glass-card rounded-xl p-4 md:p-5 border-warning/30">
                  <h3 className="text-sm font-semibold text-warning mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" /> Saldo Baixo ({dashboardMetrics.lowBalanceRevs.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {dashboardMetrics.lowBalanceRevs.map(r => (
                      <div key={r.id} className="flex items-center justify-between gap-2 rounded-lg border border-warning/20 bg-warning/5 p-3 cursor-pointer hover:bg-warning/10 transition-colors"
                        onClick={() => setShowSaldoModal(r)}>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{r.nome || r.email?.split("@")[0] || "—"}</p>
                        </div>
                        <span className="text-sm font-bold font-mono text-warning shrink-0">{fmt(r.saldo)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* System Status */}
              <div className="glass-card rounded-xl p-4 md:p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" /> Status do Sistema
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="flex items-center gap-2 rounded-lg bg-muted/30 p-3">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <div>
                      <p className="text-xs font-medium text-foreground">Banco de Dados</p>
                      <p className="text-[10px] text-muted-foreground">Conectado</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-muted/30 p-3">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <div>
                      <p className="text-xs font-medium text-foreground">Autenticação</p>
                      <p className="text-[10px] text-muted-foreground">Ativo</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-muted/30 p-3">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-foreground">Revendedores</p>
                      <p className="text-[10px] text-muted-foreground">{activeCount} ativos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-muted/30 p-3">
                    <Smartphone className="h-3.5 w-3.5 text-primary shrink-0" />
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
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { icon: Users, label: "Total Usuários", value: String(totalUsers), color: "text-primary", bgColor: "bg-primary/10" },
                  { icon: UserCheck, label: "Ativos", value: String(activeCount), color: "text-success", bgColor: "bg-success/10" },
                  { icon: UserX, label: "Inativos", value: String(inactiveCount), color: "text-destructive", bgColor: "bg-destructive/10" },
                  { icon: Wallet, label: "Saldo Total", value: fmt(totalSaldo), color: "text-warning", bgColor: "bg-warning/10", highlight: true },
                ].map((c, i) => (
                  <div key={c.label} className={`glass-card rounded-xl p-3 flex items-center gap-3 ${c.highlight ? "border-primary/20 ring-1 ring-primary/10" : ""}`}>
                    <div className={`w-9 h-9 rounded-lg ${c.bgColor} flex items-center justify-center shrink-0`}>
                      <c.icon className={`h-4 w-4 ${c.color}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{c.label}</p>
                      <p className={`text-lg font-bold text-foreground ${c.highlight ? "text-success" : ""}`}>{c.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Role Filter */}
              <div className="flex items-center gap-2 flex-wrap">
                {([
                  { key: "todos", label: "Todos", count: revendedores.length },
                  { key: "admin", label: "Admin", count: revendedores.filter(r => r.role === "admin").length },
                  { key: "revendedor", label: "Revendedor", count: revendedores.filter(r => r.role === "revendedor").length },
                  { key: "usuario", label: "Usuário", count: revendedores.filter(r => r.role === "usuario").length },
                  { key: "cliente", label: "Cliente", count: revendedores.filter(r => r.role === "cliente").length },
                  { key: "sem_role", label: "Sem função", count: revendedores.filter(r => r.role === "sem_role").length },
                ] as const).filter(f => f.key === "todos" || f.count > 0).map(f => (
                  <button
                    key={f.key}
                    onClick={() => setRoleFilter(f.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      roleFilter === f.key
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {f.label} ({f.count})
                  </button>
                ))}
              </div>

              {/* Mobile: User Cards */}
              <div className="md:hidden space-y-3">
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
                  return filtered.map(r => {
                    const initial = ((r.nome || r.email || "R")[0]).toUpperCase();
                    const userRecs = allRecargas.filter(rc => rc.user_id === r.id);
                    const recCount = userRecs.length;
                    const recHoje = userRecs.filter(rc => rc.created_at?.slice(0, 10) === todayStr).length;
                    const completedRecs = userRecs.filter(rc => rc.status === "completed" || rc.status === "concluida");
                    const totalVendido = completedRecs.reduce((s, rc) => s + (Number(rc.custo) || 0), 0);
                    const totalCustoApi = completedRecs.reduce((s, rc) => s + (Number(rc.custo_api) || 0), 0);
                    const lucro = totalVendido - totalCustoApi;
                    const ultimaRec = userRecs[0];
                    return (
                      <div key={r.id} className="glass-card rounded-xl p-4 active:scale-[0.98] transition-transform" onClick={() => openRevDetail(r)}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3 min-w-0">
                            {r.avatar_url ? (
                              <img src={r.avatar_url} alt="" className={`w-10 h-10 rounded-full object-cover shrink-0 ring-2 ${r.active ? "ring-success/30" : "ring-destructive/30"}`} />
                            ) : (
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${r.active ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                                {initial}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground text-sm truncate">{r.nome || "Sem nome"}</p>
                              <p className="text-xs text-muted-foreground truncate">{r.email || "—"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                              r.role === "admin" ? "bg-[hsl(280,70%,60%)]/15 text-[hsl(280,70%,60%)]" :
                              r.role === "revendedor" ? "bg-primary/15 text-primary" :
                              r.role === "usuario" ? "bg-[hsl(200,70%,50%)]/15 text-[hsl(200,70%,50%)]" :
                              r.role === "cliente" ? "bg-accent/15 text-accent" :
                              "bg-muted text-muted-foreground"
                            }`}>
                              {r.role === "sem_role" ? "Sem função" : r.role === "usuario" ? "Usuário" : r.role}
                            </span>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${r.active ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                              {r.active ? "Ativo" : "Inativo"}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-3 border-t border-border">
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Saldo</p>
                            <p className="text-sm font-bold font-mono text-foreground">{fmt(r.saldo)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total Vendido</p>
                            <p className="text-sm font-bold font-mono text-success">{fmt(totalVendido)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Recargas</p>
                            <p className="text-sm font-bold text-foreground">{recCount}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Hoje</p>
                            <p className="text-sm font-bold text-primary">{recHoje}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Custo</p>
                            <p className="text-sm font-bold font-mono text-warning">{fmt(totalCustoApi)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Lucro</p>
                            <p className={`text-sm font-bold font-mono ${lucro > 0 ? "text-success" : lucro < 0 ? "text-destructive" : "text-muted-foreground"}`}>{fmt(lucro)}</p>
                          </div>
                        </div>
                        {ultimaRec && (
                          <div className="mt-2 pt-2 border-t border-border/50">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Última Recarga</p>
                            <p className="text-xs text-foreground">
                              {ultimaRec.operadora || "—"} • {ultimaRec.telefone} • {fmt(ultimaRec.valor)}
                              <span className="text-muted-foreground ml-1">({fmtDate(ultimaRec.created_at)})</span>
                            </p>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50" onClick={e => e.stopPropagation()}>
                          <button onClick={() => setShowSaldoModal(r)} className="flex-1 py-2 rounded-lg text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors">Saldo</button>
                          <button onClick={() => openRevDetail(r)} className="flex-1 py-2 rounded-lg text-xs font-semibold bg-muted/60 text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1">
                            <Eye className="h-3.5 w-3.5" /> Detalhes
                          </button>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Desktop: Table */}
              <div className="hidden md:block glass-card rounded-xl overflow-x-auto">
                <table className="w-full text-sm min-w-[900px]">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/30">
                      <th className="text-left px-3 lg:px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Usuário</th>
                      <th className="text-center px-2 lg:px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Tipo</th>
                      <th className="text-right px-3 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Saldo</th>
                      <th className="text-center px-2 lg:px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Recargas</th>
                      <th className="text-center px-2 lg:px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Hoje</th>
                      <th className="text-right px-2 lg:px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Total Vendido</th>
                      <th className="text-right px-2 lg:px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Lucro</th>
                      <th className="text-center px-2 lg:px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="text-center px-2 lg:px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {loading ? (
                      <tr><td colSpan={9} className="py-4"><div className="space-y-2">{[1,2,3].map(i => <SkeletonRow key={i} />)}</div></td></tr>
                    ) : filtered.length === 0 ? (
                      <tr><td colSpan={9} className="text-center py-10">
                        <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                        <p className="text-muted-foreground text-sm">Nenhum usuário encontrado</p>
                        <button onClick={() => setShowCreateModal(true)} className="mt-3 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
                          <Plus className="h-4 w-4 inline mr-1" /> Criar revendedor
                        </button>
                      </td></tr>
                    ) : (() => {
                      const todayStr = new Date().toISOString().slice(0, 10);
                      return filtered.map(r => {
                        const initial = ((r.nome || r.email || "R")[0]).toUpperCase();
                        const userRecs = allRecargas.filter(rc => rc.user_id === r.id);
                        const recCount = userRecs.length;
                        const recHoje = userRecs.filter(rc => rc.created_at?.slice(0, 10) === todayStr).length;
                        const completedRecs = userRecs.filter(rc => rc.status === "completed" || rc.status === "concluida");
                        const totalVendido = completedRecs.reduce((s, rc) => s + (Number(rc.custo) || 0), 0);
                        const totalCustoApiDesk = completedRecs.reduce((s, rc) => s + (Number(rc.custo_api) || 0), 0);
                        const lucroDesk = totalVendido - totalCustoApiDesk;
                        const ultimaRec = userRecs[0];
                        const saldoBaixo = r.saldo > 0 && r.saldo < 50;
                        return (
                          <tr key={r.id} className="hover:bg-primary/[0.04] transition-all cursor-pointer group" onClick={() => openRevDetail(r)}>
                            <td className="px-3 lg:px-5 py-3">
                              <div className="flex items-center gap-3">
                                {r.avatar_url ? (
                                  <img src={r.avatar_url} alt="" className={`w-10 h-10 rounded-full object-cover shrink-0 ring-2 ${r.active ? "ring-success/30" : "ring-destructive/30"}`} />
                                ) : (
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ring-2 ${r.active ? "bg-success/15 text-success ring-success/30" : "bg-destructive/15 text-destructive ring-destructive/30"}`}>
                                    {initial}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="font-semibold text-foreground leading-tight text-sm">{r.nome || "Sem nome"}</p>
                                  <p className="text-xs text-muted-foreground truncate max-w-[160px]">{r.email || "—"}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-2 lg:px-4 py-3 text-center">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                                r.role === "admin" ? "bg-[hsl(280,70%,60%)]/15 text-[hsl(280,70%,60%)]" :
                                r.role === "revendedor" ? "bg-primary/15 text-primary" :
                                r.role === "usuario" ? "bg-[hsl(200,70%,50%)]/15 text-[hsl(200,70%,50%)]" :
                                r.role === "cliente" ? "bg-accent/15 text-accent" :
                                "bg-muted text-muted-foreground"
                              }`}>
                                {r.role === "sem_role" ? "Sem função" : r.role === "usuario" ? "Usuário" : r.role}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-right">
                              <div>
                                <span className={`font-mono font-bold tabular-nums text-sm ${saldoBaixo ? "text-warning" : "text-foreground"}`}>{fmt(r.saldo)}</span>
                                {saldoBaixo && <p className="text-[10px] text-warning mt-0.5">Saldo baixo</p>}
                              </div>
                            </td>
                            <td className="px-2 lg:px-4 py-3 text-center">
                              <span className="font-mono font-semibold text-muted-foreground tabular-nums text-sm">{recCount}</span>
                            </td>
                            <td className="px-2 lg:px-4 py-3 text-center">
                              {recHoje > 0 ? (
                                <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full text-xs font-bold bg-primary/15 text-primary">
                                  {recHoje}
                                </span>
                              ) : (
                                <span className="text-muted-foreground/50 text-xs">0</span>
                              )}
                            </td>
                            <td className="px-2 lg:px-4 py-3 text-right">
                              <span className="font-mono font-bold text-success tabular-nums text-sm">{fmt(totalVendido)}</span>
                            </td>
                            <td className="px-2 lg:px-4 py-3 text-right">
                              <span className={`font-mono font-bold tabular-nums text-sm ${lucroDesk > 0 ? "text-success" : lucroDesk < 0 ? "text-destructive" : "text-muted-foreground"}`}>{fmt(lucroDesk)}</span>
                            </td>
                            <td className="px-2 lg:px-4 py-3 text-center">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${r.active ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${r.active ? "bg-success animate-pulse" : "bg-destructive"}`} />
                                {r.active ? "Ativo" : "Inativo"}
                              </span>
                            </td>
                            <td className="px-2 lg:px-4 py-3" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center justify-center gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => setShowSaldoModal(r)} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors" title="Gerenciar saldo">
                                  <DollarSign className="h-3.5 w-3.5 inline mr-0.5" />Saldo
                                </button>
                                <button onClick={() => toggleRevendedorRole(r)}
                                  title={r.isRevendedor ? "Remover função revendedor" : "Ativar função revendedor"}
                                  className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${r.isRevendedor ? "bg-success/15 text-success hover:bg-success/25" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}
                                >
                                  {r.isRevendedor ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                                </button>
                                <button onClick={() => toggleActive(r)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground" title={r.active ? "Desativar" : "Ativar"}>
                                  {r.active ? <ToggleRight className="h-4 w-4 text-success" /> : <ToggleLeft className="h-4 w-4" />}
                                </button>
                                <button onClick={() => openRevDetail(r)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground group-hover:text-primary" title="Ver detalhes">
                                  <Eye className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ===== DETALHE REVENDEDOR ===== */}
          {view === "detalhe" && selectedRev && (
            <>
              {/* Profile Card */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-6">
                <div className="flex flex-col sm:flex-row items-start gap-5">
                  {selectedRev.avatar_url ? (
                    <img src={selectedRev.avatar_url} alt="" className={`w-16 h-16 rounded-2xl object-cover shrink-0 ring-2 ${selectedRev.active ? "ring-success/30" : "ring-destructive/30"}`} />
                  ) : (
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl shrink-0 ${selectedRev.active ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                      {((selectedRev.nome || selectedRev.email || "R")[0]).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-display text-2xl font-bold text-foreground">{selectedRev.nome || "Sem nome"}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedRev.active ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                        {selectedRev.active ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4 shrink-0" /> {selectedRev.email || "—"}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4 shrink-0" /> {selectedRev.telefone || "Não informado"}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 shrink-0" /> Desde {new Date(selectedRev.created_at).toLocaleDateString("pt-BR")}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Hash className="h-4 w-4 shrink-0" /> ID: {selectedRev.id.slice(0, 8)}...
                      </div>
                      {selectedRev.telegram_username && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Send className="h-4 w-4 shrink-0" /> Telegram: @{selectedRev.telegram_username}
                        </div>
                      )}
                      {selectedRev.whatsapp_number && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4 shrink-0" /> WhatsApp: {selectedRev.whatsapp_number}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <button onClick={() => setShowSaldoModal(selectedRev)} className="px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
                      <DollarSign className="h-4 w-4 inline mr-1" /> Saldo
                    </button>
                    <button onClick={() => toggleRevendedorRole(selectedRev)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${selectedRev.isRevendedor ? "bg-success/10 text-success hover:bg-success/20" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}
                    >
                      {selectedRev.isRevendedor ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                      {selectedRev.isRevendedor ? "Revenda Ativa" : "Ativar Revenda"}
                    </button>
                    <button onClick={() => toggleActive(selectedRev)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedRev.active ? "bg-destructive/10 text-destructive hover:bg-destructive/20" : "bg-success/10 text-success hover:bg-success/20"}`}>
                      {selectedRev.active ? <><UserX className="h-4 w-4 inline mr-1" /> Desativar</> : <><UserCheck className="h-4 w-4 inline mr-1" /> Ativar</>}
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm(`Tem certeza que deseja DELETAR permanentemente o usuário "${selectedRev.nome || selectedRev.email}"? Esta ação não pode ser desfeita.`)) return;
                        try {
                          const { data, error } = await supabase.functions.invoke("admin-delete-user", {
                            body: { user_id: selectedRev.id },
                          });
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
                      className="px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-destructive/10 text-destructive hover:bg-destructive/20"
                    >
                      <Trash2 className="h-4 w-4 inline mr-1" /> Deletar
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Rev KPIs */}
              {revLoading ? (
                <div className="space-y-3 py-4">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
              ) : revAnalytics && (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { label: "Saldo Atual", value: fmt(selectedRev.saldo), color: "text-success" },
                      { label: "Total Vendas", value: fmt(revAnalytics.totalVendas), color: "text-primary" },
                      { label: "Recargas", value: `${revAnalytics.totalRec} (${revAnalytics.successRec} ✓)`, color: "text-foreground" },
                      { label: "Total Depositado", value: fmt(revAnalytics.totalDeposited), color: "text-warning" },
                      { label: "Custo Total", value: fmt(revAnalytics.totalCusto), color: "text-muted-foreground" },
                      { label: "Seu Lucro (Admin)", value: fmt(revAnalytics.lucro), color: revAnalytics.lucro > 0 ? "text-success" : "text-destructive" },
                      { label: "Lucro do Revenda", value: fmt(revAnalytics.lucroRevenda), color: revAnalytics.lucroRevenda > 0 ? "text-accent" : "text-muted-foreground" },
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
                                        const rule = revDetailPricingRules.find(r => r.operadora_id === activeOpId && r.valor_recarga === valor);
                                        const globalRule = pricingRules.find(r => r.operadora_id === activeOpId && r.valor_recarga === valor);
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
                                            savedCusto={apiCost}
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
                    {revRecargas.length === 0 ? (
                      <p className="text-center py-6 text-muted-foreground text-sm">Nenhuma recarga encontrada</p>
                    ) : (
                      <>
                        {/* Mobile cards */}
                        <div className="md:hidden space-y-2">
                          {revRecargas.slice(0, 25).map(r => {
                            const statusLabel = (r.status === "completed" || r.status === "concluida") ? "Concluída" : r.status === "pending" ? "Pendente" : r.status === "falha" ? "Falha" : r.status;
                            const statusClass = (r.status === "completed" || r.status === "concluida") ? "bg-success/15 text-success" : r.status === "pending" ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive";
                            return (
                              <div key={r.id} className="rounded-lg border border-border p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <p className="text-sm font-semibold text-foreground">{r.operadora || "—"}</p>
                                    <p className="text-xs text-muted-foreground font-mono">{r.telefone}</p>
                                  </div>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusClass}`}>{statusLabel}</span>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                  <span className="text-[10px] text-muted-foreground">{fmtDate(r.created_at)}</span>
                                  <span className="font-bold font-mono text-sm text-foreground">{fmt(r.valor)}</span>
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
                                <th className="text-center px-3 py-2 font-medium text-muted-foreground">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {revRecargas.slice(0, 25).map(r => (
                                <tr key={r.id} className="border-b border-border last:border-0">
                                  <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{fmtDate(r.created_at)}</td>
                                  <td className="px-3 py-2 font-mono text-foreground">{r.telefone}</td>
                                  <td className="px-3 py-2 text-foreground">{r.operadora || "—"}</td>
                                  <td className="px-3 py-2 text-right font-mono font-medium text-foreground">{fmt(r.valor)}</td>
                                  <td className="px-3 py-2 text-center">
                                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                      (r.status === "completed" || r.status === "concluida") ? "bg-success/15 text-success" :
                                      r.status === "pending" ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive"
                                    }`}>{(r.status === "completed" || r.status === "concluida") ? "Concluída" : r.status === "pending" ? "Pendente" : r.status}</span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
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
                          const statusLabel = (t.status === "completed" || t.status === "confirmado") ? "Confirmado" : t.status === "pending" ? "Pendente" : t.status;
                          const statusClass = (t.status === "completed" || t.status === "confirmado") ? "bg-success/15 text-success" : t.status === "pending" ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive";
                          return (
                            <div key={i} className="rounded-lg border border-border p-3">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-semibold text-foreground capitalize">{isDeposit ? "Depósito" : t.type}</p>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusClass}`}>{statusLabel}</span>
                              </div>
                              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                <span className="text-[10px] text-muted-foreground">{fmtDate(t.created_at)}</span>
                                <span className={`font-bold font-mono text-sm ${isDeposit ? "text-success" : "text-foreground"}`}>{fmt(t.amount)}</span>
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
                              <th className="text-left px-3 py-2 font-medium text-muted-foreground">Tipo</th>
                              <th className="text-right px-3 py-2 font-medium text-muted-foreground">Valor</th>
                              <th className="text-center px-3 py-2 font-medium text-muted-foreground">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {revTransactions.slice(0, 20).map((t, i) => (
                              <tr key={i} className="border-b border-border last:border-0">
                                <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{fmtDate(t.created_at)}</td>
                                <td className="px-3 py-2 text-foreground capitalize">{t.type}</td>
                                <td className="px-3 py-2 text-right font-mono font-medium text-foreground">{fmt(t.amount)}</td>
                                <td className="px-3 py-2 text-center">
                                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                    (t.status === "completed" || t.status === "confirmado") ? "bg-success/15 text-success" :
                                    t.status === "pending" ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive"
                                  }`}>{(t.status === "completed" || t.status === "confirmado") ? "Confirmado" : t.status === "pending" ? "Pendente" : t.status}</span>
                                </td>
                              </tr>
                            ))}
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
              {configLoading ? (
                <div className="space-y-3 py-4">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
              ) : (
                <PinProtection configKey="adminPin">
                  <div className="glass-card rounded-xl p-6 space-y-4">
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
                </PinProtection>
              )}
            </motion.div>
          )}

          {/* ===== PAGAMENTOS (GATEWAY GLOBAL) ===== */}
          {view === "pagamentos" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {globalConfigLoading ? (
                <div className="space-y-3 py-4">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
              ) : (
                <PinProtection configKey="adminPin">
                  <div className="glass-card rounded-xl p-6 space-y-4">
                    <h4 className="font-semibold text-foreground text-lg">Gateway Principal</h4>
                    <div>
                      <label className="block text-sm font-bold text-foreground mb-2">Provedor Selecionado</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          { value: "mercadopago", label: "Mercado Pago", icon: "💳" },
                          { value: "pushinpay", label: "PushinPay", icon: "⚡" },
                          { value: "woovi", label: "Woovi (OpenPix)", icon: "🟢" },
                          { value: "efipay", label: "Efi Pay", icon: "🏦" },
                          { value: "virtualpay", label: "VirtualPay", icon: "💎" },
                          { value: "misticpay", label: "MisticPay", icon: "✨" },
                          { value: "pixgo", label: "PixGo", icon: "🟣" },
                        ].map(gw => (
                          <button
                            key={gw.value}
                            type="button"
                            onClick={() => setGlobalConfig(prev => ({ ...prev, paymentModule: gw.value }))}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all text-left ${
                              (globalConfig.paymentModule || "virtualpay") === gw.value
                                ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30"
                                : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                            }`}
                          >
                            <span className="text-base">{gw.icon}</span>
                            <span className="truncate">{gw.label}</span>
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
                      <h4 className="font-semibold text-primary text-lg">Configuração Efi Pay</h4>
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
                      <div className="glass-card rounded-lg p-4 space-y-3">
                        <h5 className="font-bold text-foreground text-sm">Automação PIX</h5>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Chave PIX Sincronizada</label>
                          <input type="text" value={globalConfig.efiPayPixKey || ""} onChange={e => setGlobalConfig(prev => ({ ...prev, efiPayPixKey: e.target.value }))}
                            className="w-full px-3 py-2.5 rounded-md border border-input bg-muted/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="f1b10157-b043-4ee3-adf6-ea5d2c5a49ea" />
                        </div>
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
                </PinProtection>
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
                  <div className="glass-card rounded-xl p-6 space-y-4">
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
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {globalConfigLoading ? (
                <div className="space-y-3 py-4">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
              ) : (
                <>
                  {/* Status */}
                  <div className="glass-card rounded-xl p-5 space-y-4 border border-border/50">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Bot className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground text-sm">Status do Bot</h4>
                        <p className="text-[10px] text-muted-foreground">
                          Sincronização automática ({Math.round(botPollIntervalMs / 1000)}s)
                          {botStatus.lastSyncAt ? ` • última atualização às ${new Date(botStatus.lastSyncAt).toLocaleTimeString("pt-BR")}` : ""}
                        </p>
                      </div>
                      {botStatus.connected ? (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-success/10 text-success border border-success/20 shrink-0">
                          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> Conectado
                        </span>
                      ) : botStatus.error ? (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-destructive/10 text-destructive border border-destructive/20 shrink-0">
                          <WifiOff className="h-3 w-3" /> Offline
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground border border-border shrink-0">
                          <Wifi className="h-3 w-3" /> Pendente
                        </span>
                      )}
                    </div>

                    {botStatus.connected && (
                      <>
                        {/* Bot info grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { icon: Bot, label: "Nome", value: botStatus.botName || "—" },
                            { icon: AtSign, label: "Username", value: `@${botStatus.botUsername || "—"}` },
                            { icon: Hash, label: "ID", value: botStatus.botId || "—" },
                            { icon: Clock, label: "Pendentes", value: botStatus.pendingUpdates !== null ? String(botStatus.pendingUpdates) : "—", highlight: (botStatus.pendingUpdates ?? 0) > 0 },
                          ].map((item: any) => (
                            <div key={item.label} className={`rounded-xl border bg-background/50 p-3 ${item.highlight ? "border-warning/40" : "border-border"}`}>
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
                                <item.icon className="h-3 w-3" /> {item.label}
                              </div>
                              <p className={`font-semibold text-sm truncate ${item.highlight ? "text-warning" : "text-foreground"}`}>{item.value}</p>
                            </div>
                          ))}
                        </div>

                        {/* Webhook error */}
                        {botStatus.webhookError && (
                          <div className={`flex items-center gap-2 p-2.5 rounded-xl text-xs border ${webhookErrorIsActive ? "bg-warning/10 border-warning/20 text-warning" : "bg-muted border-border text-muted-foreground"}`}>
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{webhookErrorIsActive ? `Erro em tempo real: ${botStatus.webhookError}` : `Último erro (histórico): ${botStatus.webhookError}`}</span>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="grid grid-cols-2 gap-2">
                          <button onClick={() => {
                            if (!globalConfig.telegramBotToken) { toast.error("Configure o token primeiro"); return; }
                            refreshBotStatus();
                          }} disabled={botStatus.loading} className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-input bg-background text-foreground font-medium text-xs hover:bg-accent/50 disabled:opacity-50 transition-colors">
                            <RefreshCw className={`h-3.5 w-3.5 ${botStatus.loading ? "animate-spin" : ""}`} /> Atualizar
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
                              toast.success("✅ Webhook resetado e reconfigurado!");
                            } catch { toast.error("Erro ao resetar webhook"); }
                          }} className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-warning/15 border border-warning/30 text-warning font-medium text-xs hover:bg-warning/25 transition-colors">
                            <RotateCcw className="h-3.5 w-3.5" /> Resetar Webhook
                          </button>
                        </div>
                      </>
                    )}

                    {botStatus.error && !botStatus.connected && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                        {botStatus.error}
                      </div>
                    )}
                  </div>

                  {/* Token */}
                  <div className="glass-card rounded-xl border border-border/50 overflow-hidden">
                    <button onClick={() => setTokenSectionOpen(!tokenSectionOpen)} className="w-full flex items-center justify-between p-6 hover:bg-accent/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Link2 className="h-5 w-5 text-primary" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-semibold text-foreground">Token do Bot</h4>
                          <p className="text-xs text-muted-foreground">Configure a chave de acesso do BotFather</p>
                        </div>
                      </div>
                      <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${tokenSectionOpen ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {tokenSectionOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                          <div className="px-6 pb-6 space-y-4">
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20 text-warning text-sm">
                              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                              Alterar o token desconectará o bot atual.
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="relative flex-1">
                                <input type={showApiKey ? "text" : "password"} value={globalConfig.telegramBotToken || ""} onChange={e => setGlobalConfig(prev => ({ ...prev, telegramBotToken: e.target.value }))}
                                  className="w-full px-3 py-2.5 pr-10 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring font-mono" placeholder="123456789:ABC-DEF_ghi..." />
                                <button type="button" onClick={() => setShowApiKey(!showApiKey)} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground">
                                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                              <button onClick={async () => {
                                const token = globalConfig.telegramBotToken;
                                if (!token) { toast.error("Insira o token"); return; }
                                setValidatingToken(true);
                                try {
                                  // 1. Validate token
                                  const resp = await fetch(`https://api.telegram.org/bot${token}/getMe`);
                                  const data = await resp.json();
                                  if (!data.ok) {
                                    toast.error("Token inválido: " + (data.description || "Erro desconhecido"));
                                    setValidatingToken(false);
                                    return;
                                  }

                                  // 2. Save to system_config
                                  const { error: cfgError } = await supabase.from("system_config").upsert(
                                    { key: "telegramBotToken", value: token, updated_at: new Date().toISOString() },
                                    { onConflict: "key" }
                                  );
                                  if (cfgError) throw cfgError;

                                  // 3. Setup webhook automatically
                                  toast.info("Configurando webhook...");
                                  const setupResp = await supabase.functions.invoke("telegram-setup", {
                                    body: { token },
                                  });
                                  if (setupResp.error) {
                                    console.error("Webhook setup error:", setupResp.error);
                                    toast.warning("Token salvo, mas falha ao configurar webhook. Tente resetar manualmente.");
                                  } else if (!setupResp.data?.success) {
                                    toast.warning(`Token salvo, mas webhook falhou: ${setupResp.data?.error || "Erro desconhecido"}`);
                                  } else {
                                    toast.success(`✅ Bot configurado! ${data.result.first_name} (@${data.result.username})`);
                                  }

                                  // 4. Update local state
                                  setBotStatus({
                                    connected: true, loading: false,
                                    botName: data.result.first_name, botUsername: data.result.username,
                                    botId: String(data.result.id), error: null,
                                    webhookUrl: setupResp.data?.webhook || null,
                                    webhookError: null, webhookErrorAt: null, pendingUpdates: null, lastSyncAt: Date.now(),
                                  });
                                  await fetchGlobalConfig();
                                } catch (err: any) {
                                  toast.error(err.message || "Erro de conexão ao validar");
                                }
                                setValidatingToken(false);
                              }} disabled={validatingToken} className="px-5 py-2.5 rounded-lg border border-input bg-background text-foreground font-medium text-sm hover:bg-accent/50 disabled:opacity-50 transition-colors whitespace-nowrap">
                                {validatingToken ? "Validando..." : "Validar"}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Links */}
                  <div className="glass-card rounded-xl p-6 space-y-4 border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Globe className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">Links</h4>
                        <p className="text-xs text-muted-foreground">Links de grupo e suporte</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">URL do Grupo Telegram</label>
                        <input type="url" value={globalConfig.telegramGroupUrl || ""} onChange={e => setGlobalConfig(prev => ({ ...prev, telegramGroupUrl: e.target.value }))}
                          className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="https://t.me/seugrupo" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">URL de Suporte</label>
                        <input type="url" value={globalConfig.supportUrl || ""} onChange={e => setGlobalConfig(prev => ({ ...prev, supportUrl: e.target.value }))}
                          className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="https://t.me/seusuporte" />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* ===== GERAL ===== */}
          {view === "geral" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {globalConfigLoading ? (
                <div className="space-y-3 py-4">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
              ) : (
                <>
                <div className="glass-card rounded-xl p-6 space-y-4">
                  <h4 className="font-semibold text-foreground flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> Configurações Gerais</h4>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Nome do Site</label>
                    <input type="text" value={globalConfig.siteTitle || ""} onChange={e => setGlobalConfig(prev => ({ ...prev, siteTitle: e.target.value }))}
                      className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Recargas Brasil" />
                  </div>
                </div>

                <BannersManager botUsername={botStatus.botUsername} />
                </>
              )}
            </motion.div>
          )}

          {/* ===== RELATÓRIOS ===== */}
          {view === "relatorios" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">Relatório de Lucro</h2>
                  <p className="text-sm text-muted-foreground">Lucro por revendedor baseado nos preços personalizados vs custo.</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex rounded-lg overflow-hidden glass w-fit">
                    {([
                      { key: "hoje" as ReportPeriod, label: "Hoje" },
                      { key: "7dias" as ReportPeriod, label: "7 Dias" },
                      { key: "mes" as ReportPeriod, label: "Mês" },
                      { key: "total" as ReportPeriod, label: "Total" },
                    ]).map(p => (
                      <button key={p.key} onClick={() => setReportPeriod(p.key)}
                        className={`px-3 py-1.5 text-xs font-medium transition-colors ${reportPeriod === p.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <button onClick={fetchReport} disabled={reportLoading} className="p-2 rounded-lg border border-border hover:bg-muted/50 text-muted-foreground transition-colors">
                    <RefreshCw className={`h-4 w-4 ${reportLoading ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>

              {/* Summary cards */}
              {reportData.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { label: "Revendedores", value: reportData.length, icon: Users, color: "text-primary" },
                    { label: "Total Recarga", value: fmt(reportData.reduce((s, r) => s + r.totalValor, 0)), icon: Smartphone, color: "text-foreground" },
                    { label: "Total Custo", value: fmt(reportData.reduce((s, r) => s + r.totalCusto, 0)), icon: Wallet, color: "text-warning" },
                    { label: "Total Vendas", value: fmt(reportData.reduce((s, r) => s + r.totalVendas, 0)), icon: TrendingUp, color: "text-success" },
                    { label: "Lucro Acumulado", value: fmt(reportData.reduce((s, r) => s + r.lucro, 0)), icon: DollarSign, color: "text-success" },
                  ].map((card, i) => (
                    <motion.div key={card.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="glass-card rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <card.icon className={`h-4 w-4 ${card.color}`} />
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{card.label}</span>
                      </div>
                      <p className="text-lg font-bold text-foreground">{card.value}</p>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Bar chart */}
              {reportData.length > 0 && (
                <div className="glass-card rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Lucro por Revendedor</h3>
                  <ResponsiveContainer width="100%" height={Math.max(200, reportData.slice(0, 15).length * 45)}>
                    <BarChart data={reportData.slice(0, 15)} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                      <XAxis type="number" tickFormatter={(v: number) => `R$${v.toFixed(0)}`} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis type="category" dataKey="nome" width={120} tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }} tickFormatter={(v: string) => v || "Sem nome"} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                        formatter={(value: number, name: string) => [fmt(value), name === "lucro" ? "Lucro" : name === "totalVendas" ? "Vendas" : "Custo"]}
                        labelFormatter={(label: string) => label || "Sem nome"}
                      />
                      <Bar dataKey="totalVendas" name="Vendas" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} opacity={0.3} />
                      <Bar dataKey="lucro" name="Lucro" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Table */}
              {reportLoading ? (
                <div className="space-y-2">{[1,2,3].map(i => <SkeletonRow key={i} />)}</div>
              ) : reportData.length === 0 ? (
                <div className="glass-card rounded-xl p-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Nenhuma recarga encontrada no período selecionado.</p>
                </div>
              ) : (
                <div className="glass-card rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Revendedor</th>
                          <th className="text-center px-4 py-3 font-medium text-muted-foreground">Recargas</th>
                          <th className="text-right px-4 py-3 font-medium text-muted-foreground">Recarga</th>
                          <th className="text-right px-4 py-3 font-medium text-muted-foreground">Custo</th>
                          <th className="text-right px-4 py-3 font-medium text-muted-foreground">Vendas</th>
                          <th className="text-right px-4 py-3 font-medium text-muted-foreground">Lucro</th>
                          <th className="text-right px-4 py-3 font-medium text-muted-foreground">Margem</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.map((r, i) => {
                          const margem = r.totalVendas > 0 ? ((r.lucro / r.totalVendas) * 100) : 0;
                          return (
                            <motion.tr key={r.user_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                              className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                              <td className="px-4 py-3">
                                <p className="font-medium text-foreground">{r.nome || "Sem nome"}</p>
                                <p className="text-xs text-muted-foreground">{r.email}</p>
                              </td>
                              <td className="px-4 py-3 text-center font-mono text-foreground">{r.totalRecargas}</td>
                              <td className="px-4 py-3 text-right font-mono text-muted-foreground">{fmt(r.totalValor)}</td>
                              <td className="px-4 py-3 text-right font-mono text-muted-foreground">{fmt(r.totalCusto)}</td>
                              <td className="px-4 py-3 text-right font-mono text-foreground">{fmt(r.totalVendas)}</td>
                              <td className={`px-4 py-3 text-right font-mono font-bold ${r.lucro > 0 ? "text-success" : r.lucro < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                                {fmt(r.lucro)}
                              </td>
                              <td className={`px-4 py-3 text-right font-mono text-sm ${margem > 0 ? "text-success" : margem < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                                {margem.toFixed(1)}%
                              </td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-muted/40 font-bold">
                          <td className="px-4 py-3 text-foreground">Total</td>
                          <td className="px-4 py-3 text-center font-mono text-foreground">{reportData.reduce((s, r) => s + r.totalRecargas, 0)}</td>
                          <td className="px-4 py-3 text-right font-mono text-muted-foreground">{fmt(reportData.reduce((s, r) => s + r.totalValor, 0))}</td>
                          <td className="px-4 py-3 text-right font-mono text-muted-foreground">{fmt(reportData.reduce((s, r) => s + r.totalCusto, 0))}</td>
                          <td className="px-4 py-3 text-right font-mono text-foreground">{fmt(reportData.reduce((s, r) => s + r.totalVendas, 0))}</td>
                          <td className="px-4 py-3 text-right font-mono text-success">{fmt(reportData.reduce((s, r) => s + r.lucro, 0))}</td>
                          <td className="px-4 py-3 text-right font-mono text-success">
                            {(() => { const tv = reportData.reduce((s, r) => s + r.totalVendas, 0); const tl = reportData.reduce((s, r) => s + r.lucro, 0); return tv > 0 ? `${((tl / tv) * 100).toFixed(1)}%` : "—"; })()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ===== PRECIFICAÇÃO ===== */}
          {view === "precificacao" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">Precificação</h2>
                  <p className="text-sm text-muted-foreground">Regras de preço globais e por revendedor.</p>
                </div>
                <button onClick={fetchPricingData} className="p-2 rounded-lg border border-border hover:bg-muted/50 text-muted-foreground transition-colors">
                  <RefreshCw className={`h-4 w-4 ${pricingLoading ? "animate-spin" : ""}`} />
                </button>
              </div>

              {/* Tabs: Global / Por Revendedor */}
              <div className="flex rounded-xl bg-muted/50 p-1 gap-1">
                <button
                  onClick={() => setPricingTab("global")}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${pricingTab === "global" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Globe className="h-4 w-4 inline mr-1.5" />Global
                </button>
                <button
                  onClick={() => setPricingTab("revendedor")}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${pricingTab === "revendedor" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Users className="h-4 w-4 inline mr-1.5" />Por Revendedor
                </button>
              </div>

              {pricingLoading ? (
                <div className="space-y-2">{[1,2,3].map(i => <SkeletonRow key={i} />)}</div>
              ) : pricingOps.length === 0 ? (
                <div className="glass-card rounded-xl p-8 text-center">
                  <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Nenhuma operadora ativa cadastrada.</p>
                </div>
              ) : (
                <>
                  {/* ---- GLOBAL TAB ---- */}
                  {pricingTab === "global" && (
                    <>
                      <div className="flex gap-2 flex-wrap">
                        {pricingOps.map(op => (
                          <button key={op.id} onClick={() => setPricingSelectedOp(op.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                              (pricingSelectedOp || pricingOps[0]?.id) === op.id
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                : "glass-card text-muted-foreground hover:text-foreground hover:bg-muted/40"
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
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Selecione o Revendedor</label>
                        <select
                          value={resellerPricingSelectedUser}
                          onChange={e => {
                            setResellerPricingSelectedUser(e.target.value);
                            setResellerPricingSelectedOp("");
                            if (e.target.value) fetchResellerPricingRules(e.target.value);
                          }}
                          className="w-full px-3 py-2.5 rounded-lg glass-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                  (resellerPricingSelectedOp || pricingOps[0]?.id) === op.id
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                    : "glass-card text-muted-foreground hover:text-foreground hover:bg-muted/40"
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
                                  const resellerRule = resellerPricingRules.find(r => r.operadora_id === activeOpId && r.valor_recarga === valor);
                                  const globalRule = pricingRules.find(r => r.operadora_id === activeOpId && r.valor_recarga === valor);
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
                                    />
                                  );
                                })}
                              </div>
                            );
                          })()}
                        </>
                      )}

                      {!resellerPricingSelectedUser && (
                        <div className="glass-card rounded-xl p-8 text-center">
                          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground">Selecione um revendedor para gerenciar seus preços personalizados.</p>
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-foreground">Notificações</h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                    <Users className="w-4 h-4" /> {broadcastUserCount} usuários ativos para receber
                  </p>
                </div>
                <button
                  onClick={() => setShowBroadcastModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity glow-primary text-sm"
                >
                  <Send className="w-4 h-4" /> Nova Notificação
                </button>
              </div>

              {broadcastProgressId && (
                <BroadcastProgress
                  progressId={broadcastProgressId}
                  notificationTitle={broadcastTitle}
                  onComplete={() => { toast.success('Broadcast concluído!'); fetchBroadcastHistory(); }}
                  onResume={async (pid) => {
                    const { error } = await supabase.functions.invoke('send-broadcast', { body: { resume_progress_id: pid } });
                    if (error) toast.error('Erro ao retomar: ' + error.message);
                    else toast.success('Broadcast retomado!');
                  }}
                />
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
                              {h.message && <p className="text-sm text-muted-foreground mt-1 line-clamp-3 whitespace-pre-wrap">{h.message}</p>}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <span className="text-sm font-bold text-green-400">{h.sent_count} enviados</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(h.created_at).toLocaleDateString('pt-BR')}, {new Date(h.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                            <button
                              onClick={async () => {
                                setBroadcastSending(true);
                                setBroadcastTitle(h.title);
                                try {
                                  const { data: result, error } = await supabase.functions.invoke('send-broadcast', { body: { notification_id: h.id, include_unregistered: false } });
                                  if (error) throw error;
                                  if (result?.progress_id) { setBroadcastProgressId(result.progress_id); toast.success(`Reenviando para ${result.total || 0} usuários!`); }
                                } catch (err: any) { toast.error('Erro: ' + (err.message || 'Erro desconhecido')); }
                                finally { setBroadcastSending(false); }
                              }}
                              disabled={broadcastSending}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass text-xs text-muted-foreground hover:text-foreground transition-colors mt-1"
                            >
                              <RefreshCw className="w-3 h-3" /> Reenviar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {showBroadcastModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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

          {/* ===== BACKUP ===== */}
          {view === "backup" && <PinProtection configKey="adminPin"><BackupSection /></PinProtection>}
        </main>
      </div>

      {showCreateModal && <CreateRevendedorModal onClose={() => setShowCreateModal(false)} onCreated={fetchData} />}
      {showSaldoModal && <SaldoModal rev={showSaldoModal} onClose={() => setShowSaldoModal(null)} onUpdated={fetchData} />}

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
          else if (key === "precificacao") fetchPricingData();
          else if (!["dashboard", "lista", "relatorios"].includes(key)) fetchGlobalConfig();
          setMenuOpen(false);
        }}
        mainCount={4}
        userLabel={user?.email || "Admin"}
        userRole="Administrador Master"
        onSignOut={signOut}
        panelLinks={[
          { label: "Painel Admin", path: "/admin", icon: BarChart3, color: "text-primary" },
          { label: "Painel Cliente", path: "/painel", icon: Landmark, color: "text-success" },
        ]}
      />
    </div>
  );
}
const fmtCurrency = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function PricingCard({ valor, savedTipo, savedValor, savedCusto, onSave, onReset, label, highlight }: {
  valor: number; savedTipo: string; savedValor: number; savedCusto: number;
  onSave: (data: { custo: number; tipo_regra: "fixo" | "margem"; regra_valor: number }) => void;
  onReset: () => void; label: string; highlight?: boolean;
}) {
  const [tipo, setTipo] = useState<"fixo" | "margem">(savedTipo as "fixo" | "margem");
  const [regra, setRegra] = useState(savedValor);
  useEffect(() => { setTipo(savedTipo as "fixo" | "margem"); setRegra(savedValor); }, [savedTipo, savedValor]);
  const precoFinal = tipo === "fixo" ? regra : valor * (1 + regra / 100);
  const lucro = precoFinal - savedCusto;
  return (
    <div className={`glass-card rounded-xl p-4 space-y-3 ${highlight ? "border border-primary/40" : ""}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Recarga</p>
          <p className="text-xl font-bold text-foreground">{fmtCurrency(valor)}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
          <p className={`text-xl font-bold ${precoFinal > 0 ? "text-success" : "text-muted-foreground"}`}>{precoFinal > 0 ? fmtCurrency(precoFinal) : "—"}</p>
        </div>
      </div>
      <div className="flex items-center justify-between rounded-2xl bg-muted/40 border border-border/40 px-4 py-3 text-sm">
        <span className="text-muted-foreground">Custo: <span className="font-medium text-foreground">{fmtCurrency(savedCusto)}</span></span>
        <span className={`font-medium ${lucro > 0 ? "text-success" : lucro < 0 ? "text-destructive" : "text-muted-foreground"}`}>Lucro: {fmtCurrency(lucro)}</span>
      </div>
      <div className="grid grid-cols-[auto_1fr_auto] gap-2 items-end">
        <div>
          <label className="text-[10px] text-muted-foreground mb-1 block">Tipo</label>
          <select value={tipo} onChange={e => { const t = e.target.value as "fixo" | "margem"; setTipo(t); onSave({ custo: savedCusto, tipo_regra: t, regra_valor: regra }); }}
            className="h-11 rounded-2xl bg-muted/70 border border-border/60 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="margem">Margem (%)</option>
            <option value="fixo">Fixo (R$)</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground mb-1 block">Valor</label>
          <input type="number" value={regra}
            onChange={e => setRegra(parseFloat(e.target.value) || 0)}
            onBlur={() => onSave({ custo: savedCusto, tipo_regra: tipo as "fixo" | "margem", regra_valor: regra })}
            className="h-11 w-full rounded-2xl bg-muted/70 border border-border/60 px-4 text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <button onClick={onReset} className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-destructive/10 text-destructive/60 hover:text-destructive transition-colors" title="Resetar">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
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
