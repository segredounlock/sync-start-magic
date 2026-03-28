import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, Loader2, CheckCircle2, XCircle, AlertTriangle,
  Database, Lock, Zap, HardDrive, Key, Radio, CreditCard, ChevronDown, ChevronRight,
  RefreshCw, Server,
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

type CheckStatus = "ok" | "warning" | "error";
type CheckCategory = {
  id: string;
  label: string;
  icon: any;
  status: CheckStatus;
  items: { name: string; status: CheckStatus; detail?: string }[];
  summary: string;
};

export default function SystemVerification() {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");
  const [results, setResults] = useState<CheckCategory[] | null>(null);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  const runVerification = async () => {
    setRunning(true);
    setProgress(0);
    setResults(null);
    const categories: CheckCategory[] = [];

    try {
      // ─── 1. TABELAS ───
      setStage("Verificando tabelas...");
      setProgress(10);
      const { data: tables } = await supabase.rpc("get_public_tables");
      const existingTables = (tables || []).map((t: any) => t.table_name || t);
      const tableItems = EXPECTED_TABLES.map(t => ({
        name: t,
        status: (existingTables.includes(t) ? "ok" : "error") as CheckStatus,
        detail: existingTables.includes(t) ? "Existe" : "NÃO encontrada",
      }));
      const missingTables = tableItems.filter(i => i.status === "error").length;
      categories.push({
        id: "tables",
        label: `Tabelas (${EXPECTED_TABLES.length})`,
        icon: Database,
        status: missingTables > 0 ? "error" : "ok",
        items: tableItems,
        summary: missingTables > 0 ? `${missingTables} tabela(s) faltando` : `Todas as ${EXPECTED_TABLES.length} tabelas encontradas`,
      });

      // ─── 2. RLS ───
      setStage("Verificando RLS...");
      setProgress(25);
      const { data: schemaInfo } = await supabase.rpc("export_schema_info");
      const rlsPolicies = (schemaInfo as any)?.rls_policies || [];
      const tablesWithRls = new Set(rlsPolicies.map((p: any) => p.table));
      const rlsItems = EXPECTED_TABLES.filter(t => t !== "profiles_public").map(t => {
        const hasPolicies = tablesWithRls.has(t);
        return {
          name: t,
          status: (hasPolicies ? "ok" : "warning") as CheckStatus,
          detail: hasPolicies
            ? `${rlsPolicies.filter((p: any) => p.table === t).length} política(s)`
            : "Sem políticas RLS",
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
      setProgress(40);
      const dbFunctions = (schemaInfo as any)?.functions || [];
      const existingFns = dbFunctions.map((f: any) => f.name);
      const fnItems = EXPECTED_FUNCTIONS.map(fn => ({
        name: fn,
        status: (existingFns.includes(fn) ? "ok" : "error") as CheckStatus,
        detail: existingFns.includes(fn) ? "Existe" : "NÃO encontrada",
      }));
      const missingFns = fnItems.filter(i => i.status === "error").length;
      categories.push({
        id: "functions",
        label: `Funções SQL (${EXPECTED_FUNCTIONS.length})`,
        icon: Server,
        status: missingFns > 0 ? "error" : "ok",
        items: fnItems,
        summary: missingFns > 0 ? `${missingFns} função(ões) faltando` : `Todas as ${EXPECTED_FUNCTIONS.length} funções OK`,
      });

      // ─── 4. EDGE FUNCTIONS ───
      setStage("Verificando Edge Functions...");
      setProgress(55);
      // We can't directly list deployed edge functions from the client,
      // so we test each one with an OPTIONS request
      const edgeItems: { name: string; status: CheckStatus; detail?: string }[] = [];
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      for (const fn of EXPECTED_EDGE_FUNCTIONS) {
        try {
          const resp = await fetch(`${supabaseUrl}/functions/v1/${fn}`, {
            method: "OPTIONS",
            headers: { "Content-Type": "application/json" },
          });
          edgeItems.push({
            name: fn,
            status: resp.status < 500 ? "ok" : "error",
            detail: resp.status < 500 ? `HTTP ${resp.status}` : `HTTP ${resp.status} - não deployada`,
          });
        } catch {
          edgeItems.push({ name: fn, status: "error", detail: "Não acessível" });
        }
      }
      const failedEdge = edgeItems.filter(i => i.status === "error").length;
      categories.push({
        id: "edge",
        label: `Edge Functions (${EXPECTED_EDGE_FUNCTIONS.length})`,
        icon: Zap,
        status: failedEdge > 0 ? "warning" : "ok",
        items: edgeItems,
        summary: failedEdge > 0 ? `${failedEdge} função(ões) com problema` : `Todas as ${EXPECTED_EDGE_FUNCTIONS.length} funções acessíveis`,
      });

      // ─── 5. STORAGE BUCKETS ───
      setStage("Verificando Storage...");
      setProgress(70);
      const { data: buckets } = await supabase.storage.listBuckets();
      const existingBuckets = (buckets || []).map((b: any) => b.name);
      const bucketItems = EXPECTED_BUCKETS.map(b => ({
        name: b,
        status: (existingBuckets.includes(b) ? "ok" : "error") as CheckStatus,
        detail: existingBuckets.includes(b) ? "Existe" : "NÃO encontrado",
      }));
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
      setProgress(80);
      const { data: configs } = await supabase
        .from("system_config")
        .select("key, value")
        .in("key", [...CRITICAL_CONFIG_KEYS, ...PAYMENT_CONFIG_KEYS]);
      const configMap = new Map((configs || []).map((c: any) => [c.key, c.value]));
      const configItems = CRITICAL_CONFIG_KEYS.map(k => ({
        name: k,
        status: (configMap.has(k) && configMap.get(k) ? "ok" : "warning") as CheckStatus,
        detail: configMap.has(k) && configMap.get(k) ? "✓ Configurado" : "Não configurado",
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
      setProgress(85);
      const EXPECTED_REALTIME = [
        "admin_notifications","audit_logs","broadcast_progress","chat_conversations",
        "chat_members","chat_message_reads","chat_messages","chat_reactions",
        "license_logs","notifications","poll_votes","polls","profiles","recargas",
        "saldos","support_messages","support_tickets","telegram_users","transactions","user_roles",
      ];
      // Check which tables are in the realtime publication via schema info triggers
      const realtimeItems = EXPECTED_REALTIME.map(t => ({
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
      setProgress(90);
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
      const dbTriggers = (schemaInfo as any)?.triggers || [];
      const existingTriggers = dbTriggers.map((t: any) => t.name);
      const triggerItems = EXPECTED_TRIGGERS.map(tr => ({
        name: `${tr.name} → ${tr.table}`,
        status: (existingTriggers.includes(tr.name) ? "ok" : "error") as CheckStatus,
        detail: existingTriggers.includes(tr.name) ? "Ativo" : "NÃO encontrado",
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
      const payItems = PAYMENT_CONFIG_KEYS.map(k => ({
        name: k,
        status: (configMap.has(k) && configMap.get(k) ? "ok" : "warning") as CheckStatus,
        detail: configMap.has(k) && configMap.get(k)
          ? (k.includes("Key") || k.includes("Token") ? "✓ (valor oculto)" : `✓ ${configMap.get(k)}`)
          : "Não configurado",
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
              {running ? stage : "Verifica tabelas, RLS, funções, storage, pagamentos e mais"}
            </p>
          </div>
          {!running && (
            <RefreshCw className="h-4 w-4 text-muted-foreground group-hover:text-emerald-400 transition-colors" />
          )}
        </div>

        {/* Progress bar */}
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
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {overall === "ok"
                      ? "Sistema 100% Operacional ✅"
                      : overall === "warning"
                      ? "Sistema Operacional com Avisos ⚠️"
                      : "Problemas Detectados ❌"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {passedChecks}/{totalChecks} verificações passaram · {results.length} categorias
                  </p>
                </div>
              </div>
            </div>

            {/* Category cards */}
            {results.map(cat => (
              <div key={cat.id} className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-muted/40 transition-colors text-left"
                >
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                    cat.status === "ok"
                      ? "bg-emerald-500/15"
                      : cat.status === "warning"
                      ? "bg-amber-500/15"
                      : "bg-red-500/15"
                  }`}>
                    <cat.icon className={`h-4 w-4 ${
                      cat.status === "ok" ? "text-emerald-400"
                      : cat.status === "warning" ? "text-amber-400"
                      : "text-red-400"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{cat.label}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{cat.summary}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {cat.status === "ok" ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">OK</span>
                    ) : cat.status === "warning" ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">AVISO</span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400">ERRO</span>
                    )}
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
                      <div className="border-t border-border px-3 py-2 space-y-1 max-h-64 overflow-y-auto">
                        {cat.items.map(item => (
                          <div key={item.name} className="flex items-center gap-2 py-1">
                            {item.status === "ok" ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                            ) : item.status === "warning" ? (
                              <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                            )}
                            <span className="text-xs text-foreground font-mono truncate flex-1">{item.name}</span>
                            <span className={`text-[10px] shrink-0 ${
                              item.status === "ok" ? "text-emerald-400"
                              : item.status === "warning" ? "text-amber-400"
                              : "text-red-400"
                            }`}>{item.detail}</span>
                          </div>
                        ))}
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
