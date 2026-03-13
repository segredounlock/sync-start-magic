

# Diagnóstico: Broadcast Travando ao Enviar

## Problema Identificado

O broadcast **trava** porque a Edge Function é encerrada pelo servidor antes de terminar o envio. Nos logs, vemos `shutdown` logo após o `boot`, confirmando que o runtime mata a função enquanto o `sendBroadcastInBackground()` ainda está rodando.

A causa raiz: o código atual usa `.catch(console.error)` para disparar o envio em background, mas **não usa `EdgeRuntime.waitUntil()`** para manter a função viva. Sem isso, o Deno encerra a função assim que a Response é retornada.

## Diferenças entre o código atual e a documentação

| Item | Documentação | Código Atual |
|---|---|---|
| **`EdgeRuntime.waitUntil()`** | Implícito (usa `beforeunload`) | Ausente - causa do travamento |
| **Handler `beforeunload`** | Marca broadcasts como "cancelado" ao shutdown | Ausente |
| **`activeBroadcasts` tracking** | Map para rastrear broadcasts ativos | Ausente |
| **Rate limiting** | 5 broadcasts/hora | Ausente |
| **Logs de debug** | `console.log` em pontos-chave | Ausente |

## Plano de Correção

### 1. Atualizar `supabase/functions/send-broadcast/index.ts`

- Adicionar **`EdgeRuntime.waitUntil()`** ao disparar `sendBroadcastInBackground()` — isso mantém a função viva até o broadcast terminar
- Adicionar handler **`beforeunload`** para marcar broadcasts ativos como "cancelado" quando o servidor reiniciar
- Adicionar **`activeBroadcasts`** Map para rastrear broadcasts em andamento
- Adicionar **logs de debug** (`console.log`) nos pontos-chave para diagnóstico futuro

### 2. Habilitar Realtime na tabela `broadcast_progress`

A documentação indica que `broadcast_progress` deve ter Realtime habilitado para atualizações ao vivo. Verificar e habilitar se necessário.

### Detalhes Técnicos

A mudança principal é trocar:
```typescript
// ANTES (atual) - função morre antes de terminar
sendBroadcastInBackground(...).catch(console.error);
```

Por:
```typescript
// DEPOIS - mantém a função viva
const promise = sendBroadcastInBackground(...);
EdgeRuntime.waitUntil(promise);
```

E adicionar o handler de shutdown gracioso para não perder o estado quando o servidor reiniciar.

