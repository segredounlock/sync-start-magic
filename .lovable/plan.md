

## Plano: Corrigir saldo no Mini App do Telegram

### Problema Identificado

A subscrição Realtime na tabela `saldos` filtra apenas por `user_id`, mas cada usuário tem **dois registros**: um `revenda` e um `pessoal`. Quando qualquer um dos dois muda, o Realtime dispara e o Mini App pega o valor que chegar — que pode ser o saldo `pessoal` (R$ 0,00), sobrescrevendo o saldo correto de `revenda`.

A busca inicial via Edge Function está correta (filtra `tipo = 'revenda'`), por isso o saldo aparece certo no primeiro carregamento, mas pode "zerar" depois via Realtime.

### Correção

**Arquivo**: `src/pages/TelegramMiniApp.tsx` (linha ~456-461)

Adicionar verificação do campo `tipo` no payload do Realtime antes de atualizar o saldo:

```tsx
// De:
(payload) => {
  const newVal = (payload.new as any)?.valor;
  if (newVal !== undefined) {
    setSaldo(Number(newVal));
    tgWebApp?.HapticFeedback?.impactOccurred("light");
  }
}

// Para:
(payload) => {
  const row = payload.new as any;
  if (row?.tipo === "revenda" && row?.valor !== undefined) {
    setSaldo(Number(row.valor));
    tgWebApp?.HapticFeedback?.impactOccurred("light");
  }
}
```

Alteração de uma única linha de lógica. Nenhuma mudança no backend ou banco de dados necessária.

