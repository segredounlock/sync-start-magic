

# Auditoria Completa do Sistema — Relatório de Findings

Após análise detalhada de todo o código (frontend, edge functions, banco de dados, Telegram bot, Mini App, chat, painéis), segue o relatório consolidado de problemas encontrados:

---

## BUGS CRÍTICOS (Impacto financeiro / segurança)

### 1. Race Condition no Débito de Saldo — `recarga-express` (linhas 750-755)
O débito de saldo nas ações `recharge` e `public-recharge` usa read-then-write **não atômico**:
```text
1. Lê saldo atual (SELECT)
2. Calcula novo saldo (JS)
3. Grava novo saldo (UPDATE)
```
Se duas recargas simultâneas ocorrerem, ambas leem o mesmo saldo e debitam apenas uma vez.

**Correção:** Usar `increment_saldo(user_id, tipo, -chargedCost)` (já existe e é atômico), igual ao `pix-webhook` faz para créditos.

### 2. Race Condition no Estorno — `sync-pending-recargas` e `order-status`
Mesmo problema: estorno de saldo usa read-then-write manual ao invés de `increment_saldo`.

**Correção:** Substituir por `increment_saldo(user_id, 'revenda', +custo)`.

### 3. `public-recharge` Não Aplica Margem Padrão Global
A action `public-recharge` (linhas 849-874) tem lógica de pricing simplificada — verifica apenas `reseller_pricing_rules` e `pricing_rules`, mas **ignora** o `defaultMarginOverride`. Recargas públicas podem cobrar preço incorreto quando a margem padrão está ativa.

**Correção:** Adicionar verificação de `defaultMarginEnabled` na lógica de `public-recharge`.

### 4. `public-recharge` Não Aplica Safety Floor
A action `public-recharge` não tem o safety check `chargedCost < apiCost` que existe na action `recharge` (linha 637). Poderia cobrar abaixo do custo da API.

**Correção:** Adicionar o mesmo safety floor.

---

## BUGS MODERADOS (Funcionalidade afetada)

### 5. Arquivo `App.tsx` Duplicado — Código Morto
Existem dois arquivos: `src/App.tsx` e `src/AppRoot.tsx`. O `main.tsx` importa `AppRoot.tsx`. O `App.tsx` é código morto que pode causar confusão, mas não afeta o runtime.

**Correção:** Excluir `src/App.tsx`.

### 6. `AtualizacoesSection` Sem Atualização em Tempo Real
O componente carrega notificações apenas uma vez no mount (sem realtime subscription). Novas mensagens de broadcast enviadas enquanto o cliente está na aba "Novidades" não aparecem até recarregar a página.

**Correção:** Adicionar subscription realtime na tabela `notifications`.

### 7. `useAuth` Busca Apenas Uma Role — `maybeSingle()`
Na linha 41 do `useAuth.tsx`, usa `maybeSingle()` para buscar role. Usuários com múltiplas roles (ex: admin + revendedor) retornarão erro pois `maybeSingle()` falha quando há mais de um resultado.

**Correção:** Usar a mesma lógica de prioridade do `resolveUserRole` do bot — buscar todas as roles e pegar a de maior prioridade.

### 8. `collect-pending-debts` Usa Saldo Read-Then-Write
A edge function `collect-pending-debts` (linhas 63-77) lê saldo, faz cálculos em JS e grava. Mesma race condition dos itens 1 e 2.

**Correção:** Usar `increment_saldo` com valor negativo.

---

## BUGS MENORES (UX / Cosmético)

### 9. `sessionGuard` Redireciona para `/login` mas Rota é `/login`
O `handleExpiredSession` redireciona para `/login`. Conferido com rotas em `AppRoot.tsx` — a rota existe como `/login`, OK. Sem problema.

### 10. `send-broadcast` Usa `serve` Deprecated
Usa `import { serve } from "https://deno.land/std@0.168.0/http/server.ts"` ao invés de `Deno.serve`. Funciona mas está deprecated.

### 11. Console Logs Excessivos no Background Payment Monitor
O `useBackgroundPaymentMonitor` loga "Tab visible, reconnecting..." toda vez que o usuário troca de aba, gerando ruído nos logs.

---

## INCONSISTÊNCIAS DE SINCRONIZAÇÃO

### 12. `sync-pending-recargas` Limita a 100 Recargas
A query `limit(100)` pode perder recargas pendentes se houver mais de 100. O memory diz que suporta 500 via paginação, mas o código atual faz apenas uma query com `limit(100)`.

**Correção:** Implementar paginação ou aumentar limit para 500.

### 13. `public-recharge` Código Duplicado (DRY Violation)
A lógica de `public-recharge` (linhas 808-985) duplica ~80% da lógica de `recharge` (linhas 394-805). Qualquer correção em um precisa ser replicada no outro.

**Correção:** Refatorar para função compartilhada interna.

---

## PLANO DE CORREÇÕES (Priorizado)

| # | Prioridade | Correção | Onde |
|---|-----------|----------|------|
| 1 | CRÍTICA | Usar `increment_saldo` atômico para débito de recarga | `recarga-express` recharge + public-recharge |
| 2 | CRÍTICA | Usar `increment_saldo` atômico para estornos | `sync-pending-recargas` + `recarga-express` order-status |
| 3 | CRÍTICA | Adicionar defaultMargin + safety floor ao public-recharge | `recarga-express` |
| 4 | ALTA | Corrigir `useAuth` para suportar múltiplas roles | `src/hooks/useAuth.tsx` |
| 5 | ALTA | Adicionar realtime ao AtualizacoesSection | `src/components/AtualizacoesSection.tsx` |
| 6 | MÉDIA | Usar increment_saldo em collect-pending-debts | `collect-pending-debts` |
| 7 | MÉDIA | Aumentar limit do sync-pending para 500 | `sync-pending-recargas` |
| 8 | BAIXA | Remover App.tsx duplicado | `src/App.tsx` |
| 9 | BAIXA | Atualizar serve deprecated | `send-broadcast` |

### Sistemas Verificados Sem Problemas Significativos
- **Chat/Bate-papo**: RLS, realtime, moderação — OK
- **Telegram Bot**: Role resolution, pricing, seasonal themes — OK
- **Mini App**: Avatar bypass, saldo filter, theme — OK
- **PIX Webhook**: Claim atômico, multi-gateway — OK
- **Painel Admin**: Broadcast, usuarios, operadoras — OK
- **Painel Revendedor**: Dashboard, recarga, histórico — OK
- **Autenticação**: Session guard, role realtime — OK (exceto item 7)
- **RLS Policies**: Corretamente aplicadas em todas as tabelas críticas

Deseja que eu implemente as correções? Recomendo começar pelas **3 críticas** (race conditions + public-recharge).

