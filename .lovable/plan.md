

## Plano: Adicionar logs detalhados na Edge Function create-pix

### Problema
Quando ocorre erro na geração de PIX, o log atual registra apenas "Error creating PIX" sem incluir o `userId`, gateway, valor ou detalhes do erro do gateway. Isso dificulta o diagnóstico.

### Alterações

**Arquivo:** `supabase/functions/create-pix/index.ts`

1. **No catch principal (linha 611-613):** Incluir `userId`, `gateway` e `amount` no log de erro:
```typescript
console.error(`[create-pix] ERRO user=${userId} gateway=${gateway} amount=${amount} individual=${useIndividualGateway} error=`, error);
```

2. **Em cada função de gateway**, melhorar os logs de erro incluindo contexto:
   - `createMercadoPago`: log com status HTTP e corpo completo da resposta
   - `createPushinPay`: idem
   - `createVirtualPay`: log no auth e no request
   - `createEfiPay`: já tem bons logs, manter
   - `createPixGo` (linha 304-306): adicionar status HTTP e response body completo
   - `createMisticPay`: idem

3. **Adicionar log de sucesso** após salvar a transação (linha 606), incluindo `payment_id`:
```typescript
console.log(`[create-pix] OK user=${userId} gateway=${gateway} amount=${amount} payment_id=${result.payment_id}`);
```

4. **Mover declaração de `userId`/`gateway`/`amount`** para escopo acessível no catch (declarar `let` antes do try).

### Resultado
Qualquer falha futura aparecerá nos logs com: usuário afetado, gateway usado, valor, se era individual ou global, e a resposta exata do gateway.

