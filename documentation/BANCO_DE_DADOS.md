# 🗄️ Banco de Dados — 42 Tabelas

## Tabelas Core

| Tabela | Descrição | Colunas principais |
|--------|-----------|-------------------|
| `profiles` | Perfis de usuários | id, nome, email, telefone, avatar_url, slug, store_name, reseller_id, active, verification_badge, bio, referral_code |
| `user_roles` | Roles dos usuários | user_id, role (admin/revendedor/cliente/usuario) |
| `saldos` | Saldos financeiros | user_id, tipo (revenda/pessoal), valor |

## Tabelas de Negócio

| Tabela | Descrição | Colunas principais |
|--------|-----------|-------------------|
| `operadoras` | Operadoras de telefonia | nome, valores (jsonb), ativo |
| `recargas` | Histórico de recargas | user_id, telefone, operadora, valor, custo, custo_api, status, external_id |
| `transactions` | Transações financeiras | user_id, amount, type, status, payment_id, metadata, module |
| `pricing_rules` | Precificação global | operadora_id, valor_recarga, custo, tipo_regra, regra_valor |
| `reseller_pricing_rules` | Precificação por revendedor | user_id, operadora_id, valor_recarga, custo, set_by_admin |
| `reseller_base_pricing_rules` | Preço base do revendedor | user_id, operadora_id, valor_recarga, custo |
| `reseller_config` | Config individual do revendedor | user_id, key, value |
| `reseller_deposit_fees` | Taxa de depósito por revendedor | reseller_id, fee_type, fee_value |
| `client_pricing_rules` | Preço por cliente específico | reseller_id, client_id, operadora_id, valor_recarga, lucro |
| `disabled_recharge_values` | Valores desabilitados | operadora_id, valor, disabled_by |
| `referral_commissions` | Comissões de indicação | user_id, referred_user_id, amount, type (direct/indirect), recarga_id |
| `scratch_cards` | Raspadinhas | user_id, card_date, is_scratched, is_won, prize_amount |

## Tabelas de Configuração

| Tabela | Descrição | Colunas principais |
|--------|-----------|-------------------|
| `system_config` | Config global (key/value) | key, value |
| `bot_settings` | Config do bot Telegram | key, value |

## Tabelas de Comunicação

| Tabela | Descrição | Colunas principais |
|--------|-----------|-------------------|
| `notifications` | Broadcasts enviados | title, message, image_url, buttons, sent_count, failed_count |
| `broadcast_messages` | Mensagens individuais de broadcast | notification_id, telegram_id, message_id |
| `broadcast_progress` | Progresso de envio | notification_id, status, sent_count, failed_count, total_users, speed_per_second |
| `admin_notifications` | Notificações internas admin | user_id, message, type, amount, is_read |
| `banners` | Banners promocionais | title, subtitle, link, icon_url, type, enabled, position |
| `polls` | Enquetes | question, options (jsonb), active, created_by, expires_at |
| `poll_votes` | Votos nas enquetes | poll_id, user_id, option_index |

## Tabelas de Chat

| Tabela | Descrição | Colunas principais |
|--------|-----------|-------------------|
| `chat_conversations` | Conversas | type (direct/group), participant_1, participant_2, name, is_blocked, is_private, category |
| `chat_members` | Membros de grupo | conversation_id, user_id |
| `chat_messages` | Mensagens | conversation_id, sender_id, content, type, image_url, audio_url, reply_to_id, is_pinned, is_deleted |
| `chat_message_reads` | Leituras de mensagem | message_id, user_id, read_at |
| `chat_reactions` | Reações emoji | message_id, user_id, emoji |

## Tabelas Telegram

| Tabela | Descrição | Colunas principais |
|--------|-----------|-------------------|
| `telegram_users` | Usuários do bot | telegram_id, first_name, username, is_blocked, is_registered |
| `telegram_sessions` | Sessões do bot | chat_id, step, data (jsonb) |
| `terms_acceptance` | Aceite de termos | telegram_id, accepted_at |

## Tabelas de Segurança

| Tabela | Descrição | Colunas principais |
|--------|-----------|-------------------|
| `login_attempts` | Tentativas de login | email, ip_address, success |
| `login_fingerprints` | Fingerprints de dispositivo | user_id, fingerprint_hash, user_agent, ip_address, latitude, longitude, selfie_url |
| `banned_devices` | Dispositivos banidos | fingerprint_hash, ip_address, reason, original_user_id, active |
| `audit_logs` | Logs de auditoria | admin_id, action, target_type, target_id, details |

## Tabelas de Suporte

| Tabela | Descrição | Colunas principais |
|--------|-----------|-------------------|
| `support_tickets` | Tickets de suporte | user_id, subject, message, department, priority, status, assigned_to |
| `support_messages` | Mensagens de suporte | ticket_id, sender_id, message, sender_role, image_url |
| `support_templates` | Templates de resposta | title, content, category, shortcut, variables |

## Tabelas de Sistema

| Tabela | Descrição | Colunas principais |
|--------|-----------|-------------------|
| `push_subscriptions` | Inscrições push web | user_id, endpoint, p256dh, auth |
| `update_history` | Histórico de atualizações | version, results, tables_restored, total_records |
| `follows` | Seguidores | follower_id, following_id |

## Views

| View | Descrição |
|------|-----------|
| `profiles_public` | Dados públicos dos perfis (sem email, telefone, etc.) |

---

## Funções do Banco (RPC)

| Função | Descrição | Segurança |
|--------|-----------|-----------|
| `has_role(_user_id, _role)` | Verifica se usuário tem role | SECURITY DEFINER |
| `has_verification_badge(_user_id)` | Verifica badge de verificação | SECURITY DEFINER |
| `increment_saldo(p_user_id, p_tipo, p_amount)` | Incrementa/decrementa saldo | SECURITY DEFINER |
| `claim_transaction(p_tx_id, p_from_status, p_to_status)` | Transição atômica de status | SECURITY DEFINER |
| `get_network_members_v2(_user_id, _filter)` | Membros da rede com stats | SECURITY DEFINER |
| `get_network_stats(_user_id)` | Estatísticas da rede | SECURITY DEFINER |
| `get_recargas_ranking(_limit)` | Ranking de recargas | SECURITY DEFINER |
| `get_operator_stats()` | Estatísticas por operadora | SECURITY DEFINER |
| `get_ticker_recargas()` | Últimas 200 recargas para ticker | SECURITY DEFINER |
| `get_public_reseller_pricing(_slug)` | Preços públicos por slug | SECURITY DEFINER |
| `get_public_store_by_slug(_slug)` | Dados da loja por slug | SECURITY DEFINER |
| `get_deposit_fee_for_user(_user_id)` | Taxa de depósito do usuário | SECURITY DEFINER |
| `get_unread_counts(_user_id, _conversation_ids)` | Contagem de não lidas | SECURITY DEFINER |
| `get_follow_counts(_user_id)` | Contagem de seguidores | SECURITY DEFINER |
| `get_poll_vote_counts(_poll_id)` | Contagem de votos | SECURITY DEFINER |
| `get_scratch_recent_winners()` | Últimos ganhadores raspadinha | SECURITY DEFINER |
| `get_scratch_top_winners()` | Top ganhadores raspadinha | SECURITY DEFINER |
| `get_user_recargas_count(_user_id)` | Total de recargas do user | SECURITY DEFINER |
| `get_user_by_referral_code(_code)` | Busca user por código | SECURITY DEFINER |
| `get_maintenance_mode()` | Verifica modo manutenção | SECURITY DEFINER |
| `get_chat_enabled()` | Verifica se chat está ativo | SECURITY DEFINER |
| `get_seasonal_theme()` | Tema sazonal atual | SECURITY DEFINER |
| `get_sales_tools_enabled()` | Verifica se ferramentas de venda estão ativas | SECURITY DEFINER |
| `get_require_referral_code()` | Obrigar código de indicação | SECURITY DEFINER |
| `get_notif_config(_key)` | Config de notificação | SECURITY DEFINER |
| `get_chat_new_conv_filter()` | Filtro de nova conversa | SECURITY DEFINER |
| `generate_unique_slug(p_nome, p_user_id)` | Gera slug único | SECURITY DEFINER |
| `export_schema_info()` | Exporta schema completo | SECURITY DEFINER |
| `get_public_tables()` | Lista tabelas públicas | SECURITY DEFINER |
| `is_conversation_participant(...)` | Verifica participante | SECURITY DEFINER |
| `is_chat_member(...)` | Verifica membro do chat | SECURITY DEFINER |
| `sync_chat_conversation_preview(...)` | Atualiza preview da conversa | SECURITY DEFINER |
| `cleanup_old_login_attempts()` | Limpa tentativas antigas | SECURITY DEFINER |

## Triggers

| Trigger | Tabela | Descrição |
|---------|--------|-----------|
| `handle_new_user` | `auth.users` (AFTER INSERT) | Cria profile + saldos + role automaticamente |
| `generate_referral_code` | `profiles` (BEFORE INSERT) | Gera código de indicação |
| `update_updated_at_column` | Várias tabelas | Atualiza updated_at automaticamente |
