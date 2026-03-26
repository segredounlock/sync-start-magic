

# Atualizar Documentação do Schema e Corrigir Info sobre Migrations no Espelho

## Problema
A documentação atual diz que "as migrations SQL são sincronizadas via código e **aplicadas automaticamente**" no espelho (seção 9.2 do MIGRACAO.md), mas na prática o banco do espelho está **completamente vazio** — as migrations não foram aplicadas. A publicação deployou o frontend mas não executou o schema.

## Alterações

### 1. `documentation/MIGRACAO.md` — Corrigir seção 9.2
- Remover afirmação de que migrations são "aplicadas automaticamente"
- Documentar que o Lovable Cloud do espelho precisa ter as migrations aplicadas manualmente via publicação ou re-deploy
- Adicionar passo para verificar se o schema foi aplicado após primeiro sync

### 2. `documentation/MIRROR_SYNC.md` — Adicionar seção sobre migrations
- Esclarecer que os **arquivos** de migration são sincronizados, mas a **execução** deles no banco depende do deploy do Lovable Cloud do espelho
- Adicionar troubleshooting: "Banco vazio após sync" com solução
- Documentar que após o primeiro sync, pode ser necessário forçar um re-deploy ou publicar novamente para que as migrations sejam executadas

### 3. `documentation/BANCO_DE_DADOS.md` — Adicionar seção completa de SQL
- Adicionar seção "SQL Completo para Criação Manual" com as 42 tabelas
- Listar todas as tabelas com suas colunas, tipos, defaults e constraints (baseado no schema real do contexto)
- Adicionar todas as RLS policies de cada tabela
- Adicionar as 36+ funções RPC com código SQL completo
- Adicionar os 3 triggers
- Adicionar os storage buckets e realtime config
- Isso serve como referência completa para recriar o banco do zero se necessário

### 4. `documentation/BACKUP.md` — Nota sobre espelho vazio
- Adicionar nota de que o backup-export pode ser usado para verificar se o schema do espelho está correto

## Detalhes Técnicos

### Schema real (42 tabelas confirmadas pelo Cloud)
As tabelas do contexto confirmam: profiles, user_roles, saldos, operadoras, recargas, transactions, pricing_rules, reseller_pricing_rules, reseller_base_pricing_rules, reseller_deposit_fees, client_pricing_rules, referral_commissions, scratch_cards, system_config, bot_settings, notifications, broadcast_messages, broadcast_progress, admin_notifications, banners, polls, poll_votes, chat_conversations, chat_members, chat_messages, chat_message_reads, chat_reactions, support_tickets, support_messages, support_templates, telegram_users, telegram_sessions, terms_acceptance, banned_devices, audit_logs, push_subscriptions, update_history, follows, reseller_config, disabled_recharge_values, login_attempts, login_fingerprints + view profiles_public

### 187 migrations
Os arquivos existem em `supabase/migrations/` e são sincronizados para o espelho via git, mas precisam ser executados pelo Lovable Cloud do espelho.

### Problema do espelho
O Lovable Cloud do espelho recebeu o código mas não aplicou as migrations automaticamente. Soluções documentadas:
1. Forçar re-deploy/publicação no projeto espelho
2. Usar o backup-restore para aplicar o schema
3. Executar migrations manualmente via Cloud View > Run SQL

