

# Tornar o Sistema 100% White-Label — Remover Hardcodes "Recargas Brasil"

## Objetivo
Eliminar todas as referências hardcoded a "Recargas Brasil", "recargasbrasill.com" e "RecargasBrasilBot" para que o sistema seja facilmente revendido — bastando alterar as configs no painel admin.

## Referências Encontradas (por arquivo)

### Frontend — Código React/TS

| Arquivo | O que tem hardcoded | Solução |
|---|---|---|
| `src/hooks/useSiteName.ts` | `DEFAULT_SITE_NAME = "Recargas Brasil"` | Manter como fallback genérico: `"Sistema de Recargas"` |
| `src/components/BrandedQRCode.tsx` | Fallback "Recargas" + "Brasil" separado | Usar `useSiteName()` como fallback em vez de texto fixo |
| `src/components/SplashScreen.tsx` | `import logo from "@/assets/recargas-brasil-logo.jpeg"` | Manter import (é só o nome do arquivo), já usa `useSiteName()` — OK |
| `src/pages/Auth.tsx` | Import do logo + subtítulo "SISTEMA DE RECARGAS PARA REVENDEDORES" | Tornar subtítulo dinâmico via `system_config` (nova key `siteSubtitle`) |
| `src/pages/InstallApp.tsx` | Import do logo | OK (nome do arquivo apenas) |
| `src/pages/TelegramMiniApp.tsx` | Import do logo | OK (nome do arquivo apenas) |
| `src/pages/MaintenancePage.tsx` | Link hardcoded `https://t.me/RecargasBrasilBot` | Buscar de `system_config` (key `telegramBotUrl`) ou remover |
| `src/pages/ClientePortal.tsx` | `"Sistema de Recargas"` no title | Já usa `siteName` — OK |
| `src/lib/domain.ts` | Fallback `https://recargasbrasill.com` | Trocar para fallback genérico ou remover (já usa `window.location.origin`) |
| `src/lib/reservedNames.ts` | `"recargas brasil", "recargasbrasil"` na lista | Remover nomes específicos da marca, manter genéricos |
| `src/AppRoot.tsx` | `"Sistema de Recargas"` no title | Já usa `siteName` — OK |

### PWA / HTML

| Arquivo | O que tem | Solução |
|---|---|---|
| `index.html` | Title, OG tags com "Sistema de Recargas" | Manter genérico (é substituído em runtime pelo `DynamicTitle`) |
| `vite.config.ts` | PWA manifest `name: "Recargas Brasil"` | Trocar para texto genérico `"Sistema de Recargas"` |

### Edge Functions (Backend)

| Arquivo | O que tem | Solução |
|---|---|---|
| `auth-email-hook/index.ts` | `DEFAULT_SITE_NAME`, `DEFAULT_SITE_URL`, `SENDER_DOMAIN` | Já busca de `system_config` — apenas trocar defaults para genérico |
| `telegram-bot/index.ts` | Fallbacks `"Recargas Brasil"` e `"recargasbrasill.com"` em ~6 lugares | Trocar defaults para genérico |
| `og-store/index.ts` | Fallbacks hardcoded | Trocar defaults para genérico |
| `client-register/index.ts` | `reservedNames` com "recargas brasil" | Remover nomes da marca |
| Email templates (`signup.tsx`, `recovery.tsx`, etc.) | `siteName = 'Recargas Brasil'` como default prop | Trocar default para `"Sistema de Recargas"` |

### Documentação

| Arquivo | Ação |
|---|---|
| `documentation/AUTENTICACAO.md` | Remover menção a "Recargas Brasil" e domínio específico |
| Outros docs | Usar linguagem genérica |

## Resumo das Alterações

1. **Trocar todos os defaults** de `"Recargas Brasil"` para `"Sistema de Recargas"` (14 arquivos)
2. **Trocar fallbacks de URL** de `"recargasbrasill.com"` para usar `window.location.origin` ou `""` (5 arquivos)
3. **BrandedQRCode** — usar `useSiteName()` em vez de "Recargas" + "Brasil"
4. **MaintenancePage** — tornar link do Telegram dinâmico via `system_config`
5. **reservedNames** — remover `"recargas brasil"` e `"recargasbrasil"` (2 arquivos)
6. **SENDER_DOMAIN** no `auth-email-hook` — tornar dinâmico via secret ou `system_config` (nova key `senderDomain`)
7. **vite.config.ts** — PWA name genérico
8. **Documentação** — linguagem genérica

### Novas keys em `system_config` (opcionais)
- `siteSubtitle` — subtítulo na tela de login (default: "SISTEMA DE RECARGAS PARA REVENDEDORES")
- `telegramBotUrl` — link do bot Telegram para página de manutenção
- `senderDomain` — domínio de envio de emails (default do secret SENDER_DOMAIN)

Resultado: qualquer comprador só precisa alterar as configs no painel admin para ter o sistema com sua própria marca.

