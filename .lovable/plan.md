

# Atualizar Documentacao Completa do Sistema

## Problema
A documentacao esta desatualizada em varios pontos criticos:
- Contagem de edge functions diz 31, mas existem **32** (pasta `_shared` nao conta)
- Falta documentacao do sistema de **espelhamento (mirror sync)** com GitHub Actions
- Falta mencao ao isolamento de ambiente (`.env` e `config.toml` removidos no sync)
- A condicao `if: github.repository` no workflow nao esta documentada
- O numero de **migrations** (187 arquivos) nao esta documentado
- Falta a tabela `admin_notifications` na documentacao de banco
- Falta a tabela `disabled_recharge_values` na documentacao
- Falta a tabela `login_attempts` no schema (esta no BANCO_DE_DADOS.md mas nao no schema visivel)
- O SECRETS.md nao menciona que o Lovable Cloud provisiona automaticamente todos os secrets
- O MIGRACAO.md nao documenta o processo de espelhamento para projetos mirror
- O README principal (`DOCUMENTACAO_MIGRACAO.md`) diz 31 funcoes, precisa ser 32
- A versao precisa ser atualizada para **v2.2**
- Data de atualizacao precisa ser **2026-03-26**

## Arquivos a Alterar

### 1. `documentation/README.md`
- Atualizar versao para v2.2, data para 2026-03-26
- Edge Functions: 31 → 32
- Adicionar changelog v2.2 com sistema de mirror sync e isolamento de ambiente
- Adicionar link para novo doc `MIRROR_SYNC.md`

### 2. `documentation/ARQUITETURA.md`
- Edge Functions: 31 → 32
- Adicionar secao sobre GitHub Actions e mirror sync na arquitetura
- Atualizar contagem de migrations (187)

### 3. `documentation/EDGE_FUNCTIONS.md`
- Contagem: 31 → 32
- Verificar se todas as 32 funcoes estao listadas (comparar com `supabase/functions/`)

### 4. `documentation/BANCO_DE_DADOS.md`
- Adicionar `admin_notifications` (notificacoes internas admin com realtime)
- Adicionar `disabled_recharge_values` (valores de recarga desabilitados)
- Confirmar contagem total de tabelas

### 5. `documentation/SECRETS.md`
- Adicionar nota: Lovable Cloud provisiona automaticamente todos os 6 secrets base
- Explicar que projetos mirror tambem recebem seus proprios secrets automaticamente
- Adicionar secao sobre configuracao em projeto espelho

### 6. `documentation/MIGRACAO.md`
- Adicionar secao "Migração para Projeto Espelho (Mirror)"
- Documentar que migrations sao aplicadas automaticamente
- Documentar que `.env` e `config.toml` sao isolados pelo workflow
- Documentar que `types.ts` e seguro pois reflete o schema identico

### 7. Nova: `documentation/MIRROR_SYNC.md`
- Documentacao completa do sistema de espelhamento
- Como funciona o `sync-mirror.yml`
- Protecao de ambiente (`.env`, `config.toml` removidos)
- Condicao `if: github.repository` para evitar execucao no destino
- Requisitos: secret `GH_TOKEN` no GitHub com escopos `repo` e `workflow`
- Fluxo: Lovable push → GitHub → Action dispara → remove env files → force push mirror
- O que e sincronizado vs o que e protegido
- Como configurar o projeto espelho (backend proprio)

### 8. `DOCUMENTACAO_MIGRACAO.md` (raiz)
- Atualizar versao para v2.2, data para 2026-03-26
- Edge Functions: 31 → 32
- Adicionar `MIRROR_SYNC.md` na tabela de documentos
- Atualizar regra de manutencao com mirror sync

### 9. `documentation/BACKUP.md`
- Adicionar referencia ao mirror sync como alternativa de backup de codigo
- Mencionar que o sync automatico garante codigo atualizado no espelho

## Detalhes Tecnicos

### Contagem Real de Edge Functions (32)
```
admin-create-user, admin-delete-user, admin-reset-password,
admin-toggle-email-verify, admin-toggle-role, auth-email-hook,
backup-export, backup-restore, ban-device, check-device,
check-pending-pix, cleanup-stuck-broadcasts, client-register,
collect-pending-debts, create-pix, delete-broadcast, efi-setup,
expire-pending-deposits, github-sync, og-store, pix-webhook,
recarga-express, scratch-card, send-broadcast, send-push,
sync-catalog, sync-pending-recargas, telegram-bot,
telegram-miniapp, telegram-notify, telegram-setup, vapid-setup
```

### Tabelas no Schema Atual (da configuracao fornecida)
As tabelas listadas no contexto incluem: profiles, profiles_public (view), user_roles, saldos, operadoras, recargas, transactions, pricing_rules, reseller_pricing_rules, reseller_base_pricing_rules, reseller_deposit_fees, client_pricing_rules, referral_commissions, scratch_cards, system_config, bot_settings, notifications, broadcast_messages, broadcast_progress, admin_notifications, banners, polls, poll_votes, chat_conversations, chat_members, chat_messages, chat_message_reads, chat_reactions, support_tickets, support_messages, support_templates, telegram_users, telegram_sessions, terms_acceptance, banned_devices, audit_logs, push_subscriptions, update_history, follows, reseller_config, disabled_recharge_values, login_attempts

### Workflow Mirror Sync
```yaml
# Pontos chave documentados:
- Trigger: push main + workflow_dispatch
- Condicao: if github.repository == 'segredounlock/recargas-brasil-v2'
- Remove .env e supabase/config.toml antes do push
- Force push para sync-start-magic
- Requer secret GH_TOKEN
```

