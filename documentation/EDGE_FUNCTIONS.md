# ⚡ Edge Functions — 29 Funções

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

## Funções de Recarga

| Função | Descrição | Auth |
|--------|-----------|------|
| `recarga-express` | Executar recarga via API externa | JWT |
| `sync-catalog` | Sincronizar catálogo de operadoras | JWT + admin |
| `sync-pending-recargas` | Sincronizar recargas pendentes | JWT + admin |

## Funções de Backup

| Função | Descrição | Auth |
|--------|-----------|------|
| `backup-export` | Exportar backup completo em ZIP | JWT + admin |
| `backup-restore` | Restaurar backup de ZIP | JWT + admin |
| `github-sync` | Sincronizar código com GitHub | JWT + admin |

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

## Funções de Sistema

| Função | Descrição | Auth |
|--------|-----------|------|
| `auth-email-hook` | Hook de emails de autenticação | Webhook (Lovable) |
| `client-register` | Auto-registro de cliente via link | Public |
| `expire-pending-deposits` | Expirar depósitos pendentes (>45min) | JWT |
| `og-store` | Gerar meta tags OG para lojas | Public |
| `scratch-card` | Gerar/validar raspadinha | JWT |
| `vapid-setup` | Gerar chaves VAPID para push | JWT + admin |

---

## Gateways de Pagamento Suportados

A função `create-pix` suporta 5 gateways:

| Gateway | Chaves em `system_config` |
|---------|--------------------------|
| **Mercado Pago** | `mercadoPagoKeyProd`, `mercadoPagoKeyTest`, `mercadoPagoModo` |
| **PushinPay** | `pushinPayToken` |
| **VirtualPay** | `virtualPayClientId`, `virtualPayClientSecret`, `virtualPayPlatformId` |
| **EfiPay** | `efiPayClientId`, `efiPayClientSecret`, `efiPayPixKey`, `efiPaySandbox` |
| **MisticPay** | `misticPayClientId`, `misticPayClientSecret` |

Cada revendedor pode ter seu próprio gateway via `reseller_config`.
