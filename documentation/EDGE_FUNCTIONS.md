# ⚡ Edge Functions — 36 Funções

## Funções Administrativas

| Função | Descrição | Auth |
|--------|-----------|------|
| `admin-create-user` | Criar usuário com role e reseller_id | JWT + admin role |
| `admin-delete-user` | Deletar usuário e dados associados | JWT + admin role |
| `admin-reset-password` | Gerar link de reset de senha | JWT + admin role |
| `admin-toggle-email-verify` | Verificar/desverificar email | JWT + admin role |
| `admin-toggle-role` | Alterar role de usuário | JWT + admin role |

## Funções de Pagamento

| Função | Descrição | Auth |
|--------|-----------|------|
| `create-pix` | Gerar cobrança PIX (multi-gateway) | JWT |
| `pix-webhook` | Receber confirmação de pagamento | Public (webhook) |
| `check-pending-pix` | Verificar PIX pendentes | JWT |
| `collect-pending-debts` | Cobrar débitos pendentes | JWT + admin |
| `efi-setup` | Configurar certificado EfiPay | JWT + admin |
| `expire-pending-deposits` | Expirar depósitos pendentes (>45min) | JWT |

## Funções de Recarga

| Função | Descrição | Auth |
|--------|-----------|------|
| `recarga-express` | Executar recarga via API externa | JWT |
| `sync-catalog` | Sincronizar catálogo de operadoras | JWT + admin |
| `sync-pending-recargas` | Sincronizar recargas pendentes | JWT + admin |

## Funções de Backup

| Função | Descrição | Auth | Conexão SQL |
|--------|-----------|------|-------------|
| `backup-export` | Exportar backup completo em ZIP (DB + auth.users + schema) | JWT + admin | ✅ `SUPABASE_DB_URL` |
| `backup-restore` | Restaurar backup de ZIP (DB + auth.users com senhas) | JWT + admin | ✅ `SUPABASE_DB_URL` |
| `github-sync` | Sincronizar código com GitHub | JWT + admin | — |

## Funções de Telegram

| Função | Descrição | Auth |
|--------|-----------|------|
| `telegram-bot` | Webhook do bot Telegram | Public (webhook) |
| `telegram-miniapp` | API do mini app Telegram | Public |
| `telegram-notify` | Enviar notificação via Telegram | JWT |
| `telegram-setup` | Configurar webhook do bot | JWT + admin |

## Funções de Comunicação

| Função | Descrição | Auth |
|--------|-----------|------|
| `send-broadcast` | Enviar broadcast via Telegram | JWT + admin |
| `delete-broadcast` | Deletar broadcast e mensagens | JWT + admin |
| `cleanup-stuck-broadcasts` | Limpar broadcasts travados (>10min) | JWT |
| `send-push` | Enviar push notification web | JWT |

## Funções de Segurança

| Função | Descrição | Auth |
|--------|-----------|------|
| `ban-device` | Banir dispositivo por fingerprint | JWT + admin |
| `check-device` | Verificar se dispositivo está banido | JWT |

## Funções de Licenciamento

| Função | Descrição | Auth |
|--------|-----------|------|
| `license-generate` | Gerar licença para espelho | JWT + admin (master) |
| `license-validate` | Validar licença (chamada pelo espelho) | Public |
| `license-check-server` | Verificação server-side de licença | Public |

## Funções de Sistema

| Função | Descrição | Auth |
|--------|-----------|------|
| `auth-email-hook` | Hook de emails de autenticação | Webhook (Lovable) |
| `client-register` | Auto-registro de cliente via link | Public |
| `init-mirror` | Inicializa ambiente espelho (seeding config + health check) | Public |
| `og-store` | Gerar meta tags OG para lojas | Public |
| `scratch-card` | Gerar/validar raspadinha | JWT |
| `vapid-setup` | Gerar chaves VAPID para push | JWT + admin |

---

## Dependências Externas

### Bibliotecas Deno usadas nas Edge Functions

| Biblioteca | Versão | Usada em |
|------------|--------|----------|
| `supabase-js` | @2 | Todas |
| `jszip` | @3.10.1 | backup-export, backup-restore |
| `postgresjs` | @v3.4.4 | backup-export, backup-restore |

### Gateways de Pagamento Suportados

A função `create-pix` suporta 5 gateways:

| Gateway | Chaves em `system_config` |
|---------|--------------------------|
| **Mercado Pago** | `mercadoPagoKeyProd`, `mercadoPagoKeyTest`, `mercadoPagoModo` |
| **PushinPay** | `pushinPayToken` |
| **VirtualPay** | `virtualPayClientId`, `virtualPayClientSecret`, `virtualPayPlatformId` |
| **EfiPay** | `efiPayClientId`, `efiPayClientSecret`, `efiPayPixKey`, `efiPaySandbox` |
| **MisticPay** | `misticPayClientId`, `misticPayClientSecret` |

Cada revendedor pode ter seu próprio gateway via `reseller_config`.

---

## Webhooks (verify_jwt = false)

As seguintes funções **não verificam JWT** pois recebem chamadas externas:

| Função | Origem da chamada |
|--------|------------------|
| `telegram-bot` | Telegram Bot API |
| `pix-webhook` | Gateway de pagamento |
| `auth-email-hook` | Lovable Cloud (auth hooks) |
| `og-store` | Crawlers web (meta tags) |
| `client-register` | Link público de registro |
| `telegram-miniapp` | Telegram Mini App |
| `init-mirror` | Processo de inicialização de espelho |
