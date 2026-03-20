# 🔑 Secrets e Variáveis de Ambiente

## Secrets do Supabase (Edge Functions)

| Secret | Descrição | Auto-configurado |
|--------|-----------|------------------|
| `SUPABASE_URL` | URL do projeto | ✅ |
| `SUPABASE_ANON_KEY` | Chave anônima | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de serviço admin | ✅ |
| `SUPABASE_DB_URL` | URL direta do PostgreSQL | ✅ |
| `LOVABLE_API_KEY` | Chave do Lovable AI Gateway | ✅ |

## Frontend (.env — auto-gerado)

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
