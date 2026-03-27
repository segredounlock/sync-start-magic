

# Limpeza de Codigo — Remover Peso Desnecessario

## Resumo
Os 3 arquivos principais (AdminDashboard 4187 linhas, Principal 5705 linhas, RevendedorPainel 3232 linhas) tem imports nao usados e codigo morto. Tambem ha a aba "Clientes" duplicada no AdminDashboard que ja deveria ter sido removida.

---

## 1. AdminDashboard.tsx (4187 linhas)

### 1a. Imports Recharts nao usados
- `AreaChart` e `Area` sao importados mas nunca usados no JSX. Remover da linha de import.

### 1b. Aba "Clientes" ainda existe
- A sub-tab "clientes" no `userSubTab` ainda esta presente (linhas 1590-1600, 1991-2130+)
- Todo o state relacionado: `clientsList`, `clientsLoading`, `clientsLoaded`, `clientSearch`, `creditClientModal`, `creditAmount`, `creditSaving`, `clientHistoryModal`, `clientRecargas`, `clientRecargasLoading` (linhas 208-218)
- Funcoes `fetchClients`, `handleCreditClient`, `fetchClientRecargas` (linhas 220-290)
- **Remover tudo isso** — a aba Cliente ja nao deveria existir

### 1c. Lucide icons possivelmente nao usados
- Verificar e remover icons importados que nao aparecem no JSX (ex: `Settings2`, `ArrowUpRight` etc.)

### 1d. Estado `role === "revendedor"` no fetchData
- O AdminDashboard so e acessivel por admins (`allowedRoles={["admin"]}`), mas tem um branch inteiro `if (role === "revendedor")` no fetchData (linhas 314-368). Esse branch nunca executa — remover.

---

## 2. Principal.tsx (5705 linhas)

### 2a. Verificar imports de Lucide nao usados
- Lista massiva de ~60 icons importados. Auditar quais sao realmente usados.

### 2b. Roles antigos nos filtros
- `roleFilter` ainda inclui `"cliente"` como opcao (linha 192). Verificar se esse filtro ainda e necessario ou se pode ser simplificado.

---

## 3. RevendedorPainel.tsx (3232 linhas)

### 3a. Import `handleExpiredSession`
- Importado na linha 57. Verificar se e usado diretamente ou so via sessionGuard.

### 3b. Lucide icons nao usados
- Auditar lista de ~50 icons.

---

## 4. types/index.ts

### 4a. Roles antigos no tipo
- `Revendedor.role` ainda lista `"revendedor" | "cliente"` como opcoes tipadas. Manter por compatibilidade de exibicao, mas adicionar comentario.

---

## 5. useAuth.tsx

### 5a. AppRole type
- Ainda inclui `"revendedor" | "cliente"` — manter pois o banco ainda pode retornar esses valores de usuarios antigos.

---

## Impacto Estimado
- **~500-700 linhas removidas** do AdminDashboard (aba Clientes + branch revendedor + imports mortos)
- **~20-30 linhas** de imports limpos nos outros arquivos
- **Bundle menor** com menos imports de recharts e lucide
- **Zero impacto funcional** — tudo removido e codigo morto

## Arquivos Alterados (4 arquivos)
1. `src/pages/AdminDashboard.tsx` — remover aba Clientes, branch revendedor, imports mortos
2. `src/pages/Principal.tsx` — limpar imports nao usados
3. `src/pages/RevendedorPainel.tsx` — limpar imports nao usados
4. `src/types/index.ts` — adicionar comentario sobre roles legados

