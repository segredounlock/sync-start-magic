

# Meta Tags Dinâmicas para Lojas Públicas (`/loja/:slug`)

## Problema
Quando o link `/loja/segredo` é compartilhado (WhatsApp, Telegram, etc.), o preview mostra "Recargas Brasil - Sistema de Recargas" com a imagem genérica `og-image.png`, em vez do nome e logo da loja específica.

## Por que é complexo
Meta tags OG são lidas por crawlers que **não executam JavaScript**. Como o app é uma SPA React, as tags do `index.html` são sempre as mesmas. Alterar via `document.title` no React não resolve para crawlers.

## Solução: Edge Function de renderização de meta tags

Criar uma Edge Function `og-store` que, dado um slug, retorna um HTML mínimo com as meta tags corretas. O compartilhamento de links usaria essa URL, ou configuramos um redirect no nível do servidor.

### Abordagem concreta

1. **Nova Edge Function `og-store`**
   - Recebe `?slug=segredo` como query param
   - Consulta `get_public_store_by_slug` para obter nome, logo, cores
   - Retorna HTML com meta tags OG dinâmicas:
     - `og:title` = store_name (fallback: "Recargas Brasil")
     - `og:image` = store_logo_url (fallback: `/og-image.png`)
     - `og:description` = "Recargas rápidas e seguras em {store_name}"
   - Inclui `<meta http-equiv="refresh">` para redirecionar ao app SPA real

2. **Atualizar `ClientePortal.tsx`**
   - Usar `document.title` e atualizar meta tags via JS (para quando o usuário já está no app)
   - `useEffect` que seta `og:title`, `og:image` dinamicamente ao carregar a loja

3. **Instruções de uso**
   - Para previews funcionarem em crawlers, o link compartilhado deve apontar para a Edge Function (ex: `https://{project}.supabase.co/functions/v1/og-store?slug=segredo`)
   - Ou: configurar a URL da loja para passar pela Edge Function primeiro

### Arquivos

| Ação | Arquivo |
|------|---------|
| Criar | `supabase/functions/og-store/index.ts` |
| Editar | `src/pages/ClientePortal.tsx` — adicionar `useEffect` para atualizar `document.title` e meta tags client-side |

### Limitação importante
Crawlers de WhatsApp/Telegram/Twitter acessam a URL direta. Para que o preview dinâmico funcione nesses serviços, o link compartilhado precisa ser o da Edge Function (`/functions/v1/og-store?slug=X`), que retorna HTML estático com as tags corretas e redireciona o navegador real para `/loja/:slug`. Alternativamente, o usuário pode configurar um proxy/CDN que intercepte requests de bots.

