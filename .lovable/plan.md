

## Plano: Padronizar resolução de `valor_facial` no Bot do Telegram

### Problema encontrado

Na linha 1154 do bot, ao selecionar um valor de recarga (`rec_val_`), o `valorFacial` é calculado com:
```typescript
const valorFacial = Number(valueObj?.maxValue || valueObj?.minValue || 0);
```

Isso **não usa** a função `resolveValue()` que já existe no bot (linha 1081). Se `maxValue` e `minValue` forem `0` ou ausentes, o `valorFacial` salvo na sessão fica errado, e isso afeta:
- A tela de confirmação (linha 1428): exibe valor facial incorreto
- O registro da recarga no banco (linha 1296/1303): salva `valor` errado na tabela `recargas`

### Alteração

**`supabase/functions/telegram-bot/index.ts`**

1. **Linha 1154**: Substituir `Number(valueObj?.maxValue || valueObj?.minValue || 0)` por `resolveValue(valueObj)` — mas `resolveValue` está definida dentro do escopo do `rec_op_` handler. Precisa extrair para escopo global ou redefinir inline.

   Solução: Extrair `resolveValue` para fora do handler `rec_op_` (mover da linha 1081 para o escopo do arquivo, antes de `handleCallback`), e usá-la na linha 1154.

2. **Linha 1081-1093**: Mover a função `resolveValue` para escopo global do arquivo (antes da função `handleCallback`, por volta da linha 305).

3. **Linha 1154**: Alterar para:
```typescript
const valorFacial = resolveValue(valueObj);
```

### O que já está OK
- A exibição de preços no catálogo (`rec_op_`) já usa `resolveValue` corretamente
- O cálculo de `getUserCost` já usa `resolveValue` corretamente
- O handler legado `confirm_` (linhas 1341-1381) é legado e não usa API catalog — funciona diferente mas é só para compatibilidade retroativa

