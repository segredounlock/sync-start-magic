
# Plano de Otimização de Carregamento + Verificação de Bugs + Atualização do Backup

## Resumo
Otimizar o carregamento das páginas principais (Principal, AdminDashboard, RevendedorPainel) sem alterar design, funcionalidades ou efeitos visuais. Adicionar logs estratégicos para diagnóstico. Atualizar o sistema de backup para incluir tabelas novas.

---

## 1. Otimização de Importações em Principal.tsx e AdminDashboard.tsx

**Problema**: Ambos os arquivos importam `recharts` e `framer-motion` de forma síncrona no topo, o que puxa essas bibliotecas pesadas no bundle principal mesmo quando o usuário ainda não está na aba que usa gráficos.

**Solução**:
- Manter os `manualChunks` do Vite (já existem), mas garantir que os componentes de gráficos sejam lazy-loaded dentro das páginas
- Adicionar `React.memo` nos sub-componentes pesados que re-renderizam desnecessariamente (listas de revendedores, tabelas de histórico)

## 2. Otimização de Fetches Paralelos

**Problema**: Em `Principal.tsx`, `fetchPricingData` faz dezenas de chamadas sequenciais ao banco (um upsert por operadora, um por regra de preço). Isso pode levar 10-30 segundos.

**Solução**:
- Agrupar operações de sync em batches com `Promise.all` onde possível
- Usar `Promise.allSettled` para operações independentes
- Adicionar log de tempo: `console.log("[Principal] fetchPricingData completed in Xms")`

## 3. Logs Estratégicos

Adicionar `console.log` com timestamps nos pontos críticos:
- `[AppRoot] MaintenanceGuard check: Xms`
- `[Principal] fetchData completed: Xms, {count} users`
- `[Principal] fetchAnalytics completed: Xms, {count} recargas`
- `[AdminDashboard] initial load: Xms`
- `[RevendedorPainel] initial load: Xms`
- `[Backup] export started/completed: Xms`
- `[Backup] restore started/completed: Xms`

## 4. Atualização do Sistema de Backup

**Problema encontrado**: O `backup-restore` edge function não conhece as tabelas novas do sistema de suporte e taxas de depósito:
- `support_tickets`
- `support_messages`
- `support_templates`
- `reseller_deposit_fees`

Isso pode causar restauração fora de ordem (FK errors).

**Solução**:
- Adicionar essas tabelas ao `knownOrder` no `backup-restore/index.ts` na posição correta (support_tickets antes de support_messages)
- Adicionar `support_tickets` e `support_messages` ao `profileFkTables` (ambos têm `user_id`/`sender_id` referenciando profiles)
- Adicionar ao fallback `candidateTables` no `backup-export/index.ts`

## 5. Memoização de Componentes Pesados

- Envolver listas filtradas com `useMemo` onde ainda não existe
- Evitar recálculos de `filteredRevendedores` a cada render
- Garantir que `useCallback` esteja em todas as funções passadas como props

## 6. Correção de Bug Potencial

**Verificação**: O `fetchPricingData` em `Principal.tsx` chama a API de catálogo toda vez que é invocado, mesmo para refresh. Isso gera chamadas desnecessárias à API externa e sincronizações redundantes.

**Solução**: Adicionar flag `pricingSynced.current` para evitar re-sync do catálogo em chamadas subsequentes (manter apenas refresh do banco local).

---

## Detalhes Técnicos

### Arquivos modificados:
1. `src/pages/Principal.tsx` — logs + memoização + otimização fetchPricingData
2. `src/pages/AdminDashboard.tsx` — logs + memoização
3. `src/pages/RevendedorPainel.tsx` — logs
4. `src/components/BackupSection.tsx` — logs
5. `supabase/functions/backup-restore/index.ts` — adicionar tabelas novas
6. `supabase/functions/backup-export/index.ts` — adicionar tabelas no fallback

### Impacto esperado:
- Redução de ~2-5s no carregamento inicial das páginas admin
- Backup/restore mais confiável com todas as tabelas
- Logs para diagnóstico futuro de problemas de performance
