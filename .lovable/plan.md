

# Plano: Exibir contagem de usuários bloqueados no header do Broadcast

## O que será feito
Adicionar ao lado de "X usuários ativos" a contagem de usuários bloqueados no Telegram (ex: `661 usuários ativos · 12 bloqueados`), nos dois arquivos que exibem o header do Broadcast.

## Alterações

### 1. `src/pages/Principal.tsx`
- Adicionar state `broadcastBlockedCount`
- Na função `fetchBroadcastUserCount`, fazer uma segunda query contando `telegram_users` com `is_blocked = true`
- No header do broadcast (linha ~4200), exibir: `{broadcastUserCount} usuários ativos · {broadcastBlockedCount} bloqueados`

### 2. `src/pages/AdminDashboard.tsx`
- Mesma lógica: state `broadcastBlockedCount`, query adicional, exibição no header (linha ~3424)

### Detalhes técnicos
- Query: `supabase.from('telegram_users').select('*', { count: 'exact', head: true }).eq('is_blocked', true)`
- Exibição com ícone `UserX` e cor `text-orange-400` para diferenciar visualmente

