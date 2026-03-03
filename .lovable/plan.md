

## Plano: Consolidação Global — Módulos Únicos e Eliminação de Duplicatas

### Problema Identificado

O projeto tem **duplicação massiva** de interfaces, lógica de negócio e estado espalhados por arquivos enormes (Principal.tsx: 4200 linhas, AdminDashboard.tsx: 4081 linhas, RevendedorPainel.tsx: 2466 linhas). Os padrões duplicados incluem:

1. **Interfaces repetidas**: `Revendedor`, `Recarga`, `Operadora`, `RecargaHistorico` definidas em 5-8 arquivos diferentes
2. **Fluxo PIX duplicado**: Estado completo de depósito PIX (pixData, pollCount, paymentConfirmed, checking, etc.) copiado identicamente em 3 páginas
3. **Padrão de loading duplicado**: `setLoading(true)` / `try-catch` / `finally setLoading(false)` repetido 30+ vezes sem padronização
4. **Lógica de CRUD inline**: Operações de criar/editar/excluir escritas diretamente nos componentes sem abstração

---

### Arquitetura Proposta

```text
src/
├── types/                     ← NOVO: Tipos globais
│   └── index.ts               (Revendedor, Recarga, Operadora, etc.)
│
├── hooks/                     ← EXPANDIR: Hooks reutilizáveis
│   ├── useAsync.ts            ← NOVO: Loading/error/retry genérico
│   ├── usePixDeposit.ts       ← NOVO: Fluxo PIX completo
│   ├── useCrud.ts             ← NOVO: Operações CRUD com confirmação
│   └── useSupabaseQuery.ts    ← NOVO: Wrapper fetch + cache
│
├── lib/
│   └── confirm.tsx            ← NOVO: Modal de confirmação global
```

---

### Módulos a Criar

#### 1. `src/types/index.ts` — Tipos Globais Únicos
Centralizar todas as interfaces duplicadas (`Revendedor`, `Recarga`, `RecargaHistorico`, `Operadora`, `PricingRule`, `Transaction`) num único arquivo. Remover definições locais de cada página.

#### 2. `src/hooks/useAsync.ts` — Loading Resiliente Global
Um hook genérico que encapsula o padrão repetido de loading/error/retry:
```typescript
const { execute, loading, error } = useAsync(async () => {
  return await supabase.from("recargas").select("*");
});
```
- Gerencia `loading`, `error`, `data` automaticamente
- Retry automático configurável
- Timeout com AbortController
- `finally` garantido (sem travamentos)

#### 3. `src/hooks/usePixDeposit.ts` — Fluxo PIX Único
Extrair todo o estado e lógica de depósito PIX (duplicado em AdminDashboard, RevendedorPainel e TelegramMiniApp) para um único hook:
- `pixData`, `generating`, `checking`, `paymentConfirmed`, `pollCount`, `copied`
- `generatePix(amount, opts)`, `checkStatus()`, `copyCode()`, `reset()`
- Auto-polling com cleanup
- Presets de valores

#### 4. `src/hooks/useCrud.ts` — Operações CRUD com Confirmação
Hook global para operações de criar/editar/excluir em qualquer tabela:
```typescript
const { remove, update, create } = useCrud("operadoras");
await remove(id, "Excluir esta operadora?"); // Modal de confirmação embutido
```
- Modal de confirmação reutilizável (substituir `window.confirm`)
- Toast automático de sucesso/erro
- Callback de refresh após operação

#### 5. `src/lib/confirm.tsx` — Modal de Confirmação Global
Componente + função imperativa para substituir `window.confirm()` e confirmações inline:
```typescript
const ok = await confirm("Excluir esta enquete?", { destructive: true });
```

#### 6. Refatoração das Páginas Gigantes
Após criar os módulos, atualizar `AdminDashboard.tsx`, `Principal.tsx`, `RevendedorPainel.tsx` e `TelegramMiniApp.tsx` para:
- Importar tipos de `@/types`
- Usar `usePixDeposit()` em vez de estado local duplicado
- Usar `useAsync()` para todas as operações de carregamento
- Usar `useCrud()` para operações de banco

---

### Impacto Esperado

- **~500 linhas removidas** de código duplicado entre as páginas
- **Carregamento mais resiliente** com retry e timeout padronizados
- **Manutenção simplificada**: mudança num hook reflete em todas as páginas
- **Velocidade**: menos re-renders desnecessários com estado isolado em hooks

### Ordem de Implementação

1. Criar `src/types/index.ts` com tipos globais
2. Criar `src/hooks/useAsync.ts`
3. Criar `src/hooks/usePixDeposit.ts`
4. Criar `src/hooks/useCrud.ts` + `src/lib/confirm.tsx`
5. Refatorar as 4 páginas principais para usar os novos módulos

