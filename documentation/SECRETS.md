# 🔑 Secrets e Variáveis de Ambiente

## Secrets do Supabase (Edge Functions)

> **⚡ Lovable Cloud provisiona automaticamente** todos os 6 secrets base ao criar o projeto. Isso vale tanto para o projeto de origem quanto para projetos espelho — cada um recebe seus **próprios valores** apontando para seu backend independente.

| Secret | Descrição | Auto-configurado | Usado por |
|--------|-----------|:----------------:|-----------|
| `SUPABASE_URL` | URL do projeto | ✅ | Todas as functions |
| `SUPABASE_ANON_KEY` | Chave anônima | ✅ | Todas as functions |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de serviço admin | ✅ | Todas as functions |
| `SUPABASE_DB_URL` | URL direta do PostgreSQL | ✅ | backup-export, backup-restore |
| `LOVABLE_API_KEY` | Chave do Lovable AI Gateway | ✅ | Functions com AI |
| `SUPABASE_PUBLISHABLE_KEY` | Chave pública | ✅ | — |

> **Importante:** `SUPABASE_DB_URL` é essencial para backup/restore de `auth.users` com senhas criptografadas. Sem ele, o sistema usa fallback via Admin API (sem senhas).

## Frontend (.env — auto-gerado)

> O `.env` é gerado e gerenciado automaticamente pelo Lovable Cloud. **Nunca edite manualmente.**

| Variável | Descrição |
|----------|-----------|
| `VITE_SUPABASE_URL` | URL do Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chave pública |
| `VITE_SUPABASE_PROJECT_ID` | ID do projeto |

## Configs em `system_config` (banco de dados)

### Gateways de Pagamento
| Key | Descrição |
|-----|-----------|
| `activeGateway` | Gateway ativo (mercadoPago/pushinPay/virtualPay/efiPay/misticPay) |
| `mercadoPagoKeyProd` | Token produção do Mercado Pago |
| `mercadoPagoKeyTest` | Token teste do Mercado Pago |
| `mercadoPagoModo` | Modo (test/prod) |
| `pushinPayToken` | Token do PushinPay |
| `virtualPayClientId` | Client ID do VirtualPay |
| `virtualPayClientSecret` | Client Secret do VirtualPay |
| `virtualPayPlatformId` | Platform ID do VirtualPay |
| `efiPayClientId` | Client ID da EfiPay |
| `efiPayClientSecret` | Client Secret da EfiPay |
| `efiPayPixKey` | Chave PIX da EfiPay |
| `efiPaySandbox` | Modo sandbox da EfiPay |
| `misticPayClientId` | Client ID da MisticPay |
| `misticPayClientSecret` | Client Secret da MisticPay |

### Taxas
| Key | Descrição |
|-----|-----------|
| `taxaTipo` | Tipo da taxa global (fixo/percentual) |
| `taxaValor` | Valor da taxa global |

### Telegram
| Key (bot_settings) | Descrição |
|-----|-----------|
| `botToken` | Token do bot Telegram |
| `webhookSecret` | Secret para validar webhooks |

### Sistema
| Key | Descrição |
|-----|-----------|
| `maintenanceMode` | Modo manutenção (true/false) |
| `masterPin` | PIN de acesso ao painel master |
| `seasonalTheme` | Tema sazonal ativo |
| `chat_enabled` | Chat habilitado (true/false) |
| `chat_new_conv_filter` | Filtro de novas conversas |
| `supportEnabled` | Suporte habilitado (true/false) |
| `salesToolsEnabled` | Ferramentas de venda (true/false) |
| `requireReferralCode` | Exigir código de indicação (true/false) |
| `defaultMarginEnabled` | Margem padrão habilitada |
| `defaultMarginType` | Tipo da margem padrão |
| `defaultMarginValue` | Valor da margem padrão |

### Push Notifications
| Key | Descrição |
|-----|-----------|
| `vapid_public_key` | Chave pública VAPID |
| `vapid_private_key` | Chave privada VAPID |

### GitHub
| Key | Descrição |
|-----|-----------|
| `githubPat` | Personal Access Token do GitHub |

---

## Configuração em Projeto Espelho

Projetos espelho (mirror) recebem seus próprios secrets automaticamente do Lovable Cloud. Configurações adicionais necessárias no banco de dados do espelho:

1. **Gateway de pagamento** — Configurar chaves em `system_config`
2. **Bot Telegram** — Configurar `botToken` em `bot_settings` e executar `telegram-setup`
3. **Chaves VAPID** — Executar `vapid-setup` para gerar novas chaves
4. **GitHub PAT** — Configurar se quiser usar GitHub Sync no espelho
5. **PIN Master** — Definir `masterPin` em `system_config`
