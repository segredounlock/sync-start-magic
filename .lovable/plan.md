

# Diagnóstico e Correção — Tela Branca (App Trava ao Carregar)

## Análise do Problema

Após revisar todo o fluxo de inicialização, identifiquei o ponto de travamento:

```text
main.tsx → AppRoot → AuthProvider → getSession() → ???
                   → MaintenanceGuard → supabase.rpc() → ???
```

**O AuthProvider NÃO tem timeout de segurança.** Se `supabase.auth.getSession()` travar (rede lenta, Supabase offline, proxy do preview), o estado `loading: true` persiste PARA SEMPRE → a tela fica no SplashScreen/PageSkeleton infinitamente.

O `MaintenanceGuard` tem timeout de 2s (OK), mas o `AuthProvider` não tem nenhum — esse é o bug.

### Por que acontece nos dois (preview e espelho)?
- **Preview**: O proxy do Lovable pode bloquear requests ao Supabase
- **Espelho**: Se o Supabase do espelho estiver lento ou sem as RPCs esperadas, mesmo resultado

### O `domain.ts` NÃO é o problema
O `window.location.origin` funciona corretamente em qualquer domínio. O problema é a conexão com o backend, não o reconhecimento de domínio.

## Correção

### Arquivo: `src/hooks/useAuth.tsx`

Adicionar **timeout de segurança de 5 segundos** no `hydrateSession`:

- Se `getSession()` não responder em 5s, forçar `loading: false` e `authReady: true` com sessão nula
- O usuário verá a tela de login ao invés de ficar preso na tela branca
- Se a sessão carregar depois, o `onAuthStateChange` ainda captura

```text
Antes:
  getSession() → espera infinitamente → tela branca

Depois:
  getSession() → 5s timeout → libera app sem sessão → mostra login
  (se sessão chegar depois, onAuthStateChange atualiza normalmente)
```

### Arquivo: `src/AppRoot.tsx`

Adicionar **timeout de segurança no MaintenanceGuard** para o caso do canal realtime travar:
- O timeout de 2s já existe, manter
- Adicionar fallback: se após 5s ainda null, forçar false

### Arquivo: `src/main.tsx`

**Reverter a mudança anterior** — o Service Worker NÃO deve ser desativado no preview. A lógica anterior era desnecessária e pode causar confusão. O problema real é o timeout do auth, não o SW.

## Resultado Esperado
- App NUNCA mais fica preso na tela branca
- Se o backend estiver offline → mostra login em 5 segundos no máximo
- Se o backend responder → funciona normalmente
- Funciona tanto no preview, no site publicado e no espelho
- Service Worker restaurado ao comportamento original

## Arquivos alterados
1. `src/hooks/useAuth.tsx` — timeout de 5s no getSession
2. `src/AppRoot.tsx` — reforçar timeout do MaintenanceGuard
3. `src/main.tsx` — reverter desativação do SW no preview

