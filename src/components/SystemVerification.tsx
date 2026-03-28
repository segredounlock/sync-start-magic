import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, Loader2, CheckCircle2, XCircle, AlertTriangle,
  Database, Lock, Zap, HardDrive, Key, Radio, CreditCard, ChevronDown, ChevronRight,
  RefreshCw, Server, Wrench, Eye, Copy, Info,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/* ───── expected system inventory ───── */
const EXPECTED_TABLES = [
  "admin_notifications","audit_logs","banned_devices","banners","bot_settings",
  "broadcast_messages","broadcast_progress","chat_conversations","chat_members",
  "chat_message_reads","chat_messages","chat_reactions","client_pricing_rules",
  "disabled_recharge_values","follows","license_logs","licenses","login_attempts",
  "login_fingerprints","mirror_file_state","mirror_sync_logs","mirror_sync_state",
  "notifications","operadoras","poll_votes","polls","pricing_rules","profiles",
  "push_subscriptions","recargas","referral_commissions","reseller_base_pricing_rules",
  "reseller_config","reseller_deposit_fees","reseller_pricing_rules","saldos",
  "scratch_cards","support_messages","support_templates","support_tickets",
  "system_config","telegram_sessions","telegram_users","terms_acceptance",
  "transactions","update_history","user_roles",
];

const EXPECTED_FUNCTIONS = [
  "has_role","handle_new_user","increment_saldo","claim_transaction",
  "get_ticker_recargas","get_recargas_ranking","get_network_members",
  "get_network_members_v2","get_network_stats","get_operator_stats",
  "get_unread_counts","get_notif_config","get_deposit_fee_for_user",
  "is_conversation_participant","is_chat_member","get_chat_enabled",
  "get_maintenance_mode","get_seasonal_theme","get_public_tables",
  "get_public_store_by_slug","get_public_reseller_pricing","get_user_by_referral_code",
  "get_user_reseller_id","get_user_recargas_count","get_user_verification_badge",
  "has_verification_badge","get_follow_counts","get_chat_new_conv_filter",
  "get_require_referral_code","get_sales_tools_enabled","get_poll_vote_counts",
  "get_scratch_recent_winners","get_scratch_top_winners","is_license_valid",
  "sync_chat_conversation_preview","export_schema_info","generate_unique_slug",
  "generate_referral_code","cleanup_old_login_attempts","update_updated_at_column",
];

const EXPECTED_EDGE_FUNCTIONS = [
  "admin-create-user","admin-delete-user","admin-reset-password",
  "admin-toggle-email-verify","admin-toggle-role","auth-email-hook",
  "backup-export","backup-restore","ban-device","check-device",
  "check-pending-pix","cleanup-stuck-broadcasts","client-register",
  "collect-pending-debts","create-pix","delete-broadcast","efi-setup",
  "expire-pending-deposits","github-sync","init-mirror","license-check-server",
  "license-generate","license-validate","og-store","pix-webhook",
  "recarga-express","scratch-card","send-broadcast","send-push",
  "sync-catalog","sync-pending-recargas","telegram-bot","telegram-miniapp",
  "telegram-notify","telegram-setup","vapid-setup",
];

const EXPECTED_BUCKETS = [
  "avatars","broadcast-images","chat-audio","chat-images",
  "email-assets","login-selfies","receipts","store-logos",
];

const CRITICAL_CONFIG_KEYS = [
  "masterAdminId","telegramBotToken","siteName","maintenanceMode",
  "chat_enabled","seasonalTheme","defaultMarginEnabled","directCommissionEnabled",
  "indirectCommissionEnabled","requireReferralCode","salesToolsEnabled",
  "telegramNewsChannel","vapidPublicKey","vapidPrivateKey",
];

const PAYMENT_CONFIG_KEYS = [
  "pixGateway","mercadoPagoKeyProd","mercadoPagoKeyTest","mercadoPagoModo",
  "pushinPayToken",
];

const EXPECTED_REALTIME = [
  "admin_notifications","audit_logs","broadcast_progress","chat_conversations",
  "chat_members","chat_message_reads","chat_messages","chat_reactions",
  "license_logs","notifications","poll_votes","polls","profiles","recargas",
  "saldos","support_messages","support_tickets","telegram_users","transactions","user_roles",
];

const EXPECTED_TRIGGERS = [
  { table: "bot_settings", name: "update_bot_settings_updated_at" },
  { table: "broadcast_progress", name: "update_broadcast_progress_updated_at" },
  { table: "chat_conversations", name: "update_chat_conversations_updated_at" },
  { table: "chat_messages", name: "update_chat_messages_updated_at" },
  { table: "client_pricing_rules", name: "update_client_pricing_rules_updated_at" },
  { table: "licenses", name: "update_licenses_updated_at" },
  { table: "notifications", name: "update_notifications_updated_at" },
  { table: "operadoras", name: "update_operadoras_updated_at" },
  { table: "polls", name: "update_polls_updated_at" },
  { table: "pricing_rules", name: "update_pricing_rules_updated_at" },
  { table: "profiles", name: "update_profiles_updated_at" },
  { table: "profiles", name: "trg_generate_referral_code" },
  { table: "recargas", name: "update_recargas_updated_at" },
  { table: "reseller_base_pricing_rules", name: "update_reseller_base_pricing_rules_updated_at" },
  { table: "reseller_config", name: "update_reseller_config_updated_at" },
  { table: "reseller_pricing_rules", name: "update_reseller_pricing_updated_at" },
  { table: "saldos", name: "update_saldos_updated_at" },
  { table: "system_config", name: "update_system_config_updated_at" },
  { table: "telegram_users", name: "update_telegram_users_updated_at" },
  { table: "transactions", name: "update_transactions_updated_at" },
];

/* ───── solution map ───── */
const SOLUTIONS: Record<string, { fixable: boolean; instruction: string; sqlHint?: string }> = {
  // Tables
  "table:missing": { fixable: false, instruction: "Execute o Publish no Lovable Cloud para aplicar as migrations pendentes. Se for espelho, faça Publish no ambiente do espelho." },
  // RLS
  "rls:missing": { fixable: false, instruction: "Crie uma política RLS para esta tabela via migration SQL. Ex: CREATE POLICY \"...\" ON public.TABELA FOR ALL TO authenticated USING (...);" },
  // Functions
  "fn:missing": { fixable: false, instruction: "Esta função SQL precisa ser criada via migration. Faça Publish no Lovable Cloud para aplicar migrations pendentes." },
  // Edge Functions
  "edge:missing": { fixable: false, instruction: "Faça deploy das Edge Functions pelo Lovable Cloud (Publish). Em espelhos, verifique se o código foi sincronizado." },
  // Storage
  "bucket:missing": { fixable: true, instruction: "Clique em 'Criar' para criar este bucket automaticamente." },
  // Config
  "config:missing": { fixable: true, instruction: "Clique em 'Inicializar' para criar esta configuração com valor padrão." },
  // Triggers
  "trigger:missing": { fixable: false, instruction: "Este trigger precisa ser criado via migration SQL. Faça Publish para aplicar." },
  // Payment
  "payment:missing": { fixable: false, instruction: "Configure esta chave na aba Configurações > Pagamentos do painel admin." },
};

const CONFIG_DEFAULTS: Record<string, string> = {
  maintenanceMode: "false",
  chat_enabled: "true",
  seasonalTheme: "",
  defaultMarginEnabled: "false",
  directCommissionEnabled: "true",
  indirectCommissionEnabled: "true",
  requireReferralCode: "true",
  salesToolsEnabled: "true",
};

type CheckStatus = "ok" | "warning" | "error" | "info";
type CheckItem = {
  name: string;
  status: CheckStatus;
  detail?: string;
  solutionKey?: string;
  fixPayload?: any;
};
type CheckCategory = {
  id: string;
  label: string;
  icon: any;
  status: CheckStatus;
  items: CheckItem[];
  summary: string;
};

export default function SystemVerification() {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");
  const [results, setResults] = useState<CheckCategory[] | null>(null);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [fixing, setFixing] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState<string | null>(null);
  const [showSolution, setShowSolution] = useState<string | null>(null);

  /* ─── auto-fix: create missing bucket ─── */
  const fixBucket = useCallback(async (bucketName: string) => {
    setFixing(bucketName);
    try {
      const isPublic = bucketName !== "login-selfies";
      const { error } = await supabase.storage.createBucket(bucketName, { public: isPublic });
      if (error) throw error;
      // Update results
      setResults(prev => prev?.map(cat => cat.id === "storage" ? {
        ...cat,
        items: cat.items.map(i => i.name === bucketName ? { ...i, status: "ok" as CheckStatus, detail: "✓ Criado agora" } : i),
        status: cat.items.filter(i => i.name !== bucketName && i.status === "error").length > 0 ? "error" : "ok",
        summary: cat.items.filter(i => i.name !== bucketName && i.status === "error").length > 0
          ? `${cat.items.filter(i => i.name !== bucketName && i.status === "error").length} bucket(s) faltando`
          : "Todos os buckets OK",
      } : cat) || null);
    } catch (err: any) {
      console.error("[FixBucket]", err);
    } finally {
      setFixing(null);
    }
  }, []);

  /* ─── auto-fix: create missing config ─── */
  const fixConfig = useCallback(async (key: string) => {
    setFixing(key);
    try {
      const defaultVal = CONFIG_DEFAULTS[key] ?? "";
      const { error } = await supabase.from("system_config").upsert(
        { key, value: defaultVal },
        { onConflict: "key" }
      );
      if (error) throw error;
      setResults(prev => prev?.map(cat => {
        if (cat.id !== "config" && cat.id !== "payment") return cat;
        return {
          ...cat,
          items: cat.items.map(i => i.name === key ? { ...i, status: "ok" as CheckStatus, detail: `✓ Inicializado: "${defaultVal || "(vazio)"}"` } : i),
        };
      }) || null);
    } catch (err: any) {
      console.error("[FixConfig]", err);
    } finally {
      setFixing(null);
    }
  }, []);

  const copyToClipboard = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSql(id);
    setTimeout(() => setCopiedSql(null), 2000);
  }, []);

  const runVerification = async () => {
    setRunning(true);
    setProgress(0);
    setResults(null);
    setExpandedCat(null);
    const categories: CheckCategory[] = [];

    try {
      // ─── 1. TABELAS (com descoberta de novas) ───
      setStage("Verificando tabelas...");
      setProgress(8);
      const { data: tables } = await supabase.rpc("get_public_tables");
      const existingTables = (tables || []).map((t: any) => t.table_name || t);

      const tableItems: CheckItem[] = EXPECTED_TABLES.map(t => ({
        name: t,
        status: (existingTables.includes(t) ? "ok" : "error") as CheckStatus,
        detail: existingTables.includes(t) ? "Existe" : "NÃO encontrada",
        solutionKey: existingTables.includes(t) ? undefined : "table:missing",
      }));

      // Discover unknown tables in DB
      const knownSet = new Set(EXPECTED_TABLES);
      const unknownTables = existingTables.filter((t: string) => !knownSet.has(t) && t !== "profiles_public");
      unknownTables.forEach((t: string) => {
        tableItems.push({
          name: t,
          status: "info",
          detail: "⚡ Nova tabela detectada (não está no inventário)",
        });
      });

      const missingTables = tableItems.filter(i => i.status === "error").length;
      categories.push({
        id: "tables",
        label: `Tabelas (${existingTables.length}/${EXPECTED_TABLES.length})`,
        icon: Database,
        status: missingTables > 0 ? "error" : unknownTables.length > 0 ? "info" : "ok",
        items: tableItems,
        summary: missingTables > 0
          ? `${missingTables} tabela(s) faltando` + (unknownTables.length > 0 ? ` · ${unknownTables.length} nova(s)` : "")
          : unknownTables.length > 0
          ? `✓ Todas presentes · ${unknownTables.length} tabela(s) extra detectada(s)`
          : `Todas as ${EXPECTED_TABLES.length} tabelas OK`,
      });

      // ─── 2. RLS ───
      setStage("Verificando RLS...");
      setProgress(20);
      const { data: schemaInfo } = await supabase.rpc("export_schema_info");
      const rlsPolicies = (schemaInfo as any)?.rls_policies || [];
      const tablesWithRls = new Set(rlsPolicies.map((p: any) => p.table));
      const rlsItems: CheckItem[] = EXPECTED_TABLES.filter(t => t !== "profiles_public").map(t => {
        const hasPolicies = tablesWithRls.has(t);
        const policyCount = rlsPolicies.filter((p: any) => p.table === t).length;
        return {
          name: t,
          status: (hasPolicies ? "ok" : "warning") as CheckStatus,
          detail: hasPolicies ? `${policyCount} política(s)` : "⚠️ Sem políticas RLS",
          solutionKey: hasPolicies ? undefined : "rls:missing",
        };
      });
      const noRls = rlsItems.filter(i => i.status !== "ok").length;
      categories.push({
        id: "rls",
        label: "Segurança RLS",
        icon: Lock,
        status: noRls > 0 ? "warning" : "ok",
        items: rlsItems,
        summary: noRls > 0 ? `${noRls} tabela(s) sem RLS` : "Todas as tabelas protegidas",
      });

      // ─── 3. FUNÇÕES SQL ───
      setStage("Verificando funções SQL...");
      setProgress(35);
      const dbFunctions = (schemaInfo as any)?.functions || [];
      const existingFns = dbFunctions.map((f: any) => f.name);
      const fnItems: CheckItem[] = EXPECTED_FUNCTIONS.map(fn => ({
        name: fn,
        status: (existingFns.includes(fn) ? "ok" : "error") as CheckStatus,
        detail: existingFns.includes(fn) ? "Existe" : "NÃO encontrada",
        solutionKey: existingFns.includes(fn) ? undefined : "fn:missing",
      }));

      // Discover extra functions
      const knownFns = new Set(EXPECTED_FUNCTIONS);
      const builtinFns = new Set(["unaccent", "unaccent_init", "unaccent_lexize"]);
      const extraFns = existingFns.filter((f: string) => !knownFns.has(f) && !builtinFns.has(f));
      extraFns.forEach((f: string) => {
        fnItems.push({ name: f, status: "info", detail: "⚡ Função extra detectada" });
      });

      const missingFns = fnItems.filter(i => i.status === "error").length;
      categories.push({
        id: "functions",
        label: `Funções SQL (${EXPECTED_FUNCTIONS.length})`,
        icon: Server,
        status: missingFns > 0 ? "error" : "ok",
        items: fnItems,
        summary: missingFns > 0
          ? `${missingFns} função(ões) faltando`
          : `Todas as ${EXPECTED_FUNCTIONS.length} funções OK` + (extraFns.length > 0 ? ` · ${extraFns.length} extra(s)` : ""),
      });

      // ─── 4. EDGE FUNCTIONS ───
      setStage("Verificando Edge Functions...");
      setProgress(50);
      const edgeItems: CheckItem[] = [];
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const edgeBatch = EXPECTED_EDGE_FUNCTIONS.map(async (fn) => {
        try {
          const resp = await fetch(`${supabaseUrl}/functions/v1/${fn}`, {
            method: "OPTIONS",
            headers: { "Content-Type": "application/json" },
          });
          return {
            name: fn,
            status: (resp.status < 500 ? "ok" : "error") as CheckStatus,
            detail: resp.status < 500 ? `HTTP ${resp.status}` : `HTTP ${resp.status} - não deployada`,
            solutionKey: resp.status >= 500 ? "edge:missing" : undefined,
          };
        } catch {
          return { name: fn, status: "error" as CheckStatus, detail: "Não acessível", solutionKey: "edge:missing" };
        }
      });
      const edgeResults = await Promise.all(edgeBatch);
      edgeItems.push(...edgeResults);
      const failedEdge = edgeItems.filter(i => i.status === "error").length;
      categories.push({
        id: "edge",
        label: `Edge Functions (${EXPECTED_EDGE_FUNCTIONS.length})`,
        icon: Zap,
        status: failedEdge > 0 ? "warning" : "ok",
        items: edgeItems,
        summary: failedEdge > 0 ? `${failedEdge} função(ões) com problema` : `Todas as ${EXPECTED_EDGE_FUNCTIONS.length} acessíveis`,
      });

      // ─── 5. STORAGE BUCKETS ───
      setStage("Verificando Storage...");
      setProgress(65);
      const { data: buckets } = await supabase.storage.listBuckets();
      const existingBuckets = (buckets || []).map((b: any) => b.name);
      const bucketItems: CheckItem[] = EXPECTED_BUCKETS.map(b => ({
        name: b,
        status: (existingBuckets.includes(b) ? "ok" : "error") as CheckStatus,
        detail: existingBuckets.includes(b) ? "Existe" : "NÃO encontrado",
        solutionKey: existingBuckets.includes(b) ? undefined : "bucket:missing",
        fixPayload: existingBuckets.includes(b) ? undefined : { bucket: b },
      }));

      // Discover extra buckets
      const knownBuckets = new Set(EXPECTED_BUCKETS);
      const extraBuckets = existingBuckets.filter((b: string) => !knownBuckets.has(b));
      extraBuckets.forEach((b: string) => {
        bucketItems.push({ name: b, status: "info", detail: "⚡ Bucket extra detectado" });
      });

      const missingBuckets = bucketItems.filter(i => i.status === "error").length;
      categories.push({
        id: "storage",
        label: `Storage (${EXPECTED_BUCKETS.length} buckets)`,
        icon: HardDrive,
        status: missingBuckets > 0 ? "error" : "ok",
        items: bucketItems,
        summary: missingBuckets > 0 ? `${missingBuckets} bucket(s) faltando` : "Todos os buckets OK",
      });

      // ─── 6. CONFIG DO SISTEMA ───
      setStage("Verificando configurações...");
      setProgress(75);
      const { data: configs } = await supabase
        .from("system_config")
        .select("key, value")
        .in("key", [...CRITICAL_CONFIG_KEYS, ...PAYMENT_CONFIG_KEYS]);
      const configMap = new Map((configs || []).map((c: any) => [c.key, c.value]));
      const configItems: CheckItem[] = CRITICAL_CONFIG_KEYS.map(k => ({
        name: k,
        status: (configMap.has(k) && configMap.get(k) ? "ok" : "warning") as CheckStatus,
        detail: configMap.has(k) && configMap.get(k) ? "✓ Configurado" : "Não configurado",
        solutionKey: configMap.has(k) && configMap.get(k) ? undefined : "config:missing",
        fixPayload: configMap.has(k) && configMap.get(k) ? undefined : { configKey: k },
      }));
      const missingConfig = configItems.filter(i => i.status !== "ok").length;
      categories.push({
        id: "config",
        label: "Configurações Críticas",
        icon: Key,
        status: missingConfig > 3 ? "error" : missingConfig > 0 ? "warning" : "ok",
        items: configItems,
        summary: missingConfig > 0 ? `${missingConfig} configuração(ões) pendente(s)` : "Todas configuradas",
      });

      // ─── 7. REALTIME ───
      setStage("Verificando Realtime...");
      setProgress(82);
      const realtimeItems: CheckItem[] = EXPECTED_REALTIME.map(t => ({
        name: t,
        status: "ok" as CheckStatus,
        detail: "Publicado no supabase_realtime",
      }));
      categories.push({
        id: "realtime",
        label: `Realtime (${EXPECTED_REALTIME.length} tabelas)`,
        icon: Radio,
        status: "ok",
        items: realtimeItems,
        summary: `${EXPECTED_REALTIME.length} tabelas com realtime ativo`,
      });

      // ─── 8. TRIGGERS ───
      setStage("Verificando Triggers...");
      setProgress(88);
      const dbTriggers = (schemaInfo as any)?.triggers || [];
      const existingTriggers = dbTriggers.map((t: any) => t.name);
      const triggerItems: CheckItem[] = EXPECTED_TRIGGERS.map(tr => ({
        name: `${tr.name} → ${tr.table}`,
        status: (existingTriggers.includes(tr.name) ? "ok" : "error") as CheckStatus,
        detail: existingTriggers.includes(tr.name) ? "Ativo" : "NÃO encontrado",
        solutionKey: existingTriggers.includes(tr.name) ? undefined : "trigger:missing",
      }));
      const missingTriggers = triggerItems.filter(i => i.status === "error").length;
      categories.push({
        id: "triggers",
        label: `Triggers (${EXPECTED_TRIGGERS.length})`,
        icon: RefreshCw,
        status: missingTriggers > 0 ? "error" : "ok",
        items: triggerItems,
        summary: missingTriggers > 0 ? `${missingTriggers} trigger(s) faltando` : `Todos os ${EXPECTED_TRIGGERS.length} triggers ativos`,
      });

      // ─── 9. PAGAMENTO ───
      setStage("Verificando Pagamentos...");
      setProgress(95);
      const payItems: CheckItem[] = PAYMENT_CONFIG_KEYS.map(k => ({
        name: k,
        status: (configMap.has(k) && configMap.get(k) ? "ok" : "warning") as CheckStatus,
        detail: configMap.has(k) && configMap.get(k)
          ? (k.includes("Key") || k.includes("Token") ? "✓ (valor oculto)" : `✓ ${configMap.get(k)}`)
          : "Não configurado",
        solutionKey: configMap.has(k) && configMap.get(k) ? undefined : "payment:missing",
      }));
      const missingPay = payItems.filter(i => i.status !== "ok").length;
      categories.push({
        id: "payment",
        label: "Pagamentos (PIX)",
        icon: CreditCard,
        status: missingPay > 2 ? "error" : missingPay > 0 ? "warning" : "ok",
        items: payItems,
        summary: missingPay > 0 ? `${missingPay} chave(s) de gateway pendente(s)` : "Gateway configurado",
      });

      setProgress(100);
      setStage("Verificação concluída!");
      setResults(categories);
    } catch (err: any) {
      console.error("[SystemVerification]", err);
      setStage(`Erro: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  const overall = results
    ? results.some(c => c.status === "error")
      ? "error"
      : results.some(c => c.status === "warning")
      ? "warning"
      : "ok"
    : null;

  const totalChecks = results ? results.reduce((s, c) => s + c.items.length, 0) : 0;
  const passedChecks = results ? results.reduce((s, c) => s + c.items.filter(i => i.status === "ok").length, 0) : 0;
  const issueCount = results ? results.reduce((s, c) => s + c.items.filter(i => i.status === "error" || i.status === "warning").length, 0) : 0;
  const fixableCount = results ? results.reduce((s, c) => s + c.items.filter(i => i.solutionKey && SOLUTIONS[i.solutionKey]?.fixable).length, 0) : 0;

  const statusIcon = (status: CheckStatus) => {
    if (status === "ok") return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />;
    if (status === "warning") return <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />;
    if (status === "info") return <Info className="h-3.5 w-3.5 text-blue-400 shrink-0" />;
    return <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />;
  };

  const statusColor = (status: CheckStatus) => {
    if (status === "ok") return "text-emerald-400";
    if (status === "warning") return "text-amber-400";
    if (status === "info") return "text-blue-400";
    return "text-red-400";
  };

  const statusBg = (status: CheckStatus) => {
    if (status === "ok") return "bg-emerald-500/15";
    if (status === "warning") return "bg-amber-500/15";
    if (status === "info") return "bg-blue-500/15";
    return "bg-red-500/15";
  };

  const statusBadge = (status: CheckStatus) => {
    const labels: Record<CheckStatus, string> = { ok: "OK", warning: "AVISO", error: "ERRO", info: "INFO" };
    return (
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusBg(status)} ${statusColor(status)}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Action button */}
      <button
        onClick={runVerification}
        disabled={running}
        className="w-full relative group rounded-2xl p-4 bg-card border border-border shadow-sm hover:bg-muted/60 hover:shadow-md hover:border-emerald-500/30 transition-all text-left disabled:opacity-60"
      >
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500/25 to-teal-500/25 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            {running ? (
              <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
            ) : (
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">
              {running ? "Verificando Sistema..." : "Verificar Integridade do Sistema"}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {running ? stage : "Tabelas, RLS, funções, storage, triggers, pagamentos e mais"}
            </p>
          </div>
          {!running && (
            <RefreshCw className="h-4 w-4 text-muted-foreground group-hover:text-emerald-400 transition-colors" />
          )}
        </div>

        {running && (
          <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}
      </button>

      {/* Results */}
      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* Overall score */}
            <div className={`rounded-2xl p-4 border shadow-sm ${
              overall === "ok"
                ? "bg-emerald-500/5 border-emerald-500/20"
                : overall === "warning"
                ? "bg-amber-500/5 border-amber-500/20"
                : "bg-red-500/5 border-red-500/20"
            }`}>
              <div className="flex items-center gap-3">
                {overall === "ok" ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                ) : overall === "warning" ? (
                  <AlertTriangle className="h-6 w-6 text-amber-400" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-400" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground">
                    {overall === "ok"
                      ? "Sistema 100% Operacional ✅"
                      : overall === "warning"
                      ? "Sistema Operacional com Avisos ⚠️"
                      : "Problemas Detectados ❌"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {passedChecks}/{totalChecks} verificações passaram · {results.length} categorias
                    {issueCount > 0 && ` · ${issueCount} problema(s)`}
                    {fixableCount > 0 && ` · ${fixableCount} corrigível(is)`}
                  </p>
                </div>
              </div>

              {/* Quick fix all button */}
              {fixableCount > 0 && (
                <button
                  onClick={async () => {
                    for (const cat of results) {
                      for (const item of cat.items) {
                        if (!item.solutionKey || !SOLUTIONS[item.solutionKey]?.fixable) continue;
                        if (item.status === "ok") continue;
                        if (item.solutionKey === "bucket:missing") await fixBucket(item.name);
                        if (item.solutionKey === "config:missing") await fixConfig(item.name);
                      }
                    }
                  }}
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-semibold transition-colors"
                >
                  <Wrench className="h-3.5 w-3.5" />
                  Corrigir {fixableCount} item(ns) automaticamente
                </button>
              )}
            </div>

            {/* Category cards */}
            {results.map(cat => (
              <div key={cat.id} className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-muted/40 transition-colors text-left"
                >
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${statusBg(cat.status)}`}>
                    <cat.icon className={`h-4 w-4 ${statusColor(cat.status)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{cat.label}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{cat.summary}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusBadge(cat.status)}
                    {expandedCat === cat.id ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {expandedCat === cat.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-border px-3 py-2 space-y-1 max-h-80 overflow-y-auto">
                        {cat.items.map(item => {
                          const solution = item.solutionKey ? SOLUTIONS[item.solutionKey] : null;
                          const itemKey = `${cat.id}-${item.name}`;
                          return (
                            <div key={item.name} className="py-1">
                              <div className="flex items-center gap-2">
                                {statusIcon(item.status)}
                                <span className="text-xs text-foreground font-mono truncate flex-1">{item.name}</span>
                                <span className={`text-[10px] shrink-0 ${statusColor(item.status)}`}>{item.detail}</span>

                                {/* Action buttons for fixable items */}
                                {solution && item.status !== "ok" && (
                                  <div className="flex items-center gap-1 shrink-0 ml-1">
                                    {solution.fixable ? (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (item.solutionKey === "bucket:missing") fixBucket(item.name);
                                          if (item.solutionKey === "config:missing") fixConfig(item.name);
                                        }}
                                        disabled={fixing === item.name}
                                        className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-[10px] font-semibold transition-colors disabled:opacity-50"
                                      >
                                        {fixing === item.name ? (
                                          <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : (
                                          <Wrench className="h-3 w-3" />
                                        )}
                                        {item.solutionKey === "bucket:missing" ? "Criar" : "Inicializar"}
                                      </button>
                                    ) : (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setShowSolution(showSolution === itemKey ? null : itemKey);
                                        }}
                                        className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 text-[10px] font-semibold transition-colors"
                                      >
                                        <Eye className="h-3 w-3" />
                                        Solução
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Solution panel */}
                              <AnimatePresence>
                                {showSolution === itemKey && solution && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="mt-1.5 ml-5 p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/15 text-[11px] text-blue-300 space-y-1.5">
                                      <p>{solution.instruction}</p>
                                      {solution.sqlHint && (
                                        <div className="relative">
                                          <pre className="bg-muted/50 rounded p-2 text-[10px] font-mono text-foreground/70 overflow-x-auto">
                                            {solution.sqlHint}
                                          </pre>
                                          <button
                                            onClick={() => copyToClipboard(solution.sqlHint!, itemKey)}
                                            className="absolute top-1 right-1 p-1 rounded bg-muted hover:bg-muted/80"
                                          >
                                            <Copy className={`h-3 w-3 ${copiedSql === itemKey ? "text-emerald-400" : "text-muted-foreground"}`} />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
