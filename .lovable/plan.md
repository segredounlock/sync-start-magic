
# Plano: Restaurar App.tsx e index.css corrompidos

## Problema
Os arquivos `src/App.tsx` e `src/index.css` foram sobrescritos com a saída compilada do Vite (código transformado com HMR, `$RefreshReg$`, etc.) em vez do código-fonte original. Isso causa centenas de erros de build.

## Solução
Reconstruir ambos os arquivos a partir do código compilado, extraindo a lógica original:

### 1. Restaurar `src/App.tsx`
Baseado na versão compilada, o arquivo original contém:
- Imports: `Routes`, `Route`, `AuthProvider`, `useAuth`, `ThemeProvider`, `ProtectedRoute`, `lazy`, `Suspense`, `useEffect`, `useState`, `SplashScreen`, `supabase`, e páginas (Auth, RecargaPublica, etc.)
- Lazy loads: AdminDashboard, RevendedorPainel, Principal, ChatApp, UserProfile
- `MaintenanceGuard` component (verifica modo manutenção via RPC + realtime)
- `App` component com ThemeProvider > AuthProvider > SeasonalEffects + PullToRefresh + MaintenanceGuard > Routes
- Rotas: `/`, `/login`, `/recarga`, `/reset-password`, `/loja/:slug`, `/miniapp`, `/instalar`, `/admin` (admin+revendedor), `/principal` (admin), `/painel`, `/chat`, `/perfil/:userId`, `*`

### 2. Restaurar `src/index.css`
Extrair o CSS original do conteúdo compilado — basicamente as variáveis de tema (light/dark), classes glass/glow/kpi, e diretivas Tailwind.

### Atualização do Backup
Nenhuma tabela ou arquivo novo será adicionado — apenas restauração dos existentes.
