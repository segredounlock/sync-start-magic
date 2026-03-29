/* ───── Sistema de Inventário Esperado ───── */

export const EXPECTED_TABLES = [
  "admin_notifications","audit_logs","banned_devices","banners","bot_settings",
  "broadcast_messages","broadcast_progress","chat_conversations","chat_members",
  "chat_message_reads","chat_messages","chat_reactions","client_pricing_rules",
  "disabled_recharge_values","follows","login_attempts",
  "login_fingerprints","mirror_file_state","mirror_sync_logs","mirror_sync_state",
  "notifications","operadoras","poll_votes","polls","pricing_rules","profiles",
  "push_subscriptions","recargas","referral_commissions","reseller_base_pricing_rules",
  "reseller_config","reseller_deposit_fees","reseller_pricing_rules","saldos",
  "scratch_cards","support_messages","support_templates","support_tickets",
  "system_config","telegram_sessions","telegram_users","terms_acceptance",
  "transactions","update_history","user_roles",
];

/** Expected columns per table (critical columns only) */
export const EXPECTED_COLUMNS: Record<string, string[]> = {
  profiles: ["id","email","nome","slug","avatar_url","active","reseller_id","referral_code","telegram_id","verification_badge","store_name","store_logo_url","store_primary_color","store_secondary_color","bio","whatsapp_number","telefone","last_seen_at","created_at","updated_at"],
  recargas: ["id","user_id","telefone","operadora","valor","custo","custo_api","status","external_id","completed_at","created_at","updated_at"],
  transactions: ["id","user_id","type","status","amount","payment_id","module","metadata","telegram_notified","delay_notified","created_at","updated_at"],
  saldos: ["id","user_id","tipo","valor","created_at","updated_at"],
  user_roles: ["id","user_id","role","created_at"],
  system_config: ["id","key","value","created_at","updated_at"],
  operadoras: ["id","nome","valores","ativo","created_at","updated_at"],
  pricing_rules: ["id","operadora_id","valor_recarga","custo","regra_valor","tipo_regra","created_at","updated_at"],
  notifications: ["id","title","message","status","sent_count","failed_count","image_url","buttons","message_effect_id","created_at","updated_at"],
  chat_messages: ["id","conversation_id","sender_id","content","type","audio_url","image_url","is_read","is_delivered","is_deleted","is_pinned","reply_to_id","created_at","updated_at"],
  chat_conversations: ["id","type","participant_1","participant_2","name","category","description","icon","is_blocked","is_private","last_message_text","last_message_at","created_at","updated_at"],
  
  support_tickets: ["id","user_id","telegram_chat_id","message","status","priority","department","subject","assigned_to","admin_reply","image_url","replied_at","resolved_at","created_at","updated_at"],
  scratch_cards: ["id","user_id","prize_amount","is_scratched","is_won","scratched_at","card_date","created_at"],
  banners: ["id","type","title","subtitle","link","icon_url","position","enabled","created_at","updated_at"],
  polls: ["id","question","options","active","allow_multiple","total_votes","expires_at","created_by","created_at","updated_at"],
  banned_devices: ["id","fingerprint_hash","ip_address","user_agent_pattern","reason","banned_by","original_user_id","original_user_email","original_user_nome","active","created_at","updated_at"],
  mirror_sync_state: ["id","mirror_id","mirror_repo","source_repo","last_sync_at","last_synced_commit","total_files","synced_files","pending_files","conflict_files","protected_paths","created_at","updated_at"],
};

export const EXPECTED_FUNCTIONS = [
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
  "get_scratch_recent_winners","get_scratch_top_winners",
  "sync_chat_conversation_preview","export_schema_info","generate_unique_slug",
  "generate_referral_code","cleanup_old_login_attempts","update_updated_at_column",
  "get_table_columns_info",
];

export const EXPECTED_EDGE_FUNCTIONS = [
  "admin-create-user","admin-delete-user","admin-reset-password",
  "admin-toggle-email-verify","admin-toggle-role","auth-email-hook",
  "backup-export","backup-restore","ban-device","check-device",
  "check-pending-pix","cleanup-stuck-broadcasts","client-register",
  "collect-pending-debts","create-pix","delete-broadcast","efi-setup",
  "expire-pending-deposits","github-sync","init-mirror","og-store","pix-webhook",
  "recarga-express","scratch-card","send-broadcast","send-push",
  "sync-catalog","sync-pending-recargas","telegram-bot","telegram-miniapp",
  "telegram-notify","telegram-setup","vapid-setup",
];

export const EXPECTED_BUCKETS = [
  "avatars","broadcast-images","chat-audio","chat-images",
  "email-assets","login-selfies","receipts","store-logos",
];

export const CRITICAL_CONFIG_KEYS = [
  "masterAdminId","telegramBotToken","siteName","maintenanceMode",
  "chat_enabled","seasonalTheme","defaultMarginEnabled","directCommissionEnabled",
  "indirectCommissionEnabled","requireReferralCode","salesToolsEnabled",
  "telegramNewsChannel","vapidPublicKey","vapidPrivateKey",
];

export const PAYMENT_CONFIG_KEYS = [
  "pixGateway","mercadoPagoKeyProd","mercadoPagoKeyTest","mercadoPagoModo",
  "pushinPayToken",
];

export const EXPECTED_REALTIME = [
  "admin_notifications","audit_logs","broadcast_progress","chat_conversations",
  "chat_members","chat_message_reads","chat_messages","chat_reactions",
  "notifications","poll_votes","polls","profiles","recargas",
  "saldos","support_messages","support_tickets","telegram_users","transactions","user_roles",
];

export const EXPECTED_TRIGGERS = [
  { table: "bot_settings", name: "update_bot_settings_updated_at" },
  { table: "broadcast_progress", name: "update_broadcast_progress_updated_at" },
  { table: "chat_conversations", name: "update_chat_conversations_updated_at" },
  { table: "chat_messages", name: "update_chat_messages_updated_at" },
  { table: "client_pricing_rules", name: "update_client_pricing_rules_updated_at" },
  
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

export const CONFIG_DEFAULTS: Record<string, string> = {
  maintenanceMode: "false",
  chat_enabled: "true",
  seasonalTheme: "",
  defaultMarginEnabled: "false",
  directCommissionEnabled: "true",
  indirectCommissionEnabled: "true",
  requireReferralCode: "true",
  salesToolsEnabled: "true",
  siteName: "Recargas Brasil",
  telegramNewsChannel: "",
};
