

# Correção: Bot Telegram cobrando valor facial em vez do custo real

## Problema

Dois pontos no bot do Telegram usam o **valor de face** (R$ 20) ao invés do **custo do revendedor** (R$ 12) para validar saldo e cobrar:

1. **Menu de botões** (linha 1196-1199): O `callback_data` `rec_val_claro_claro_20_12.00` é parseado com `split("_")`, mas como o `valueId` contém `_` (ex: `claro_20`), o custo é lido como `20` em vez de `12.00`
2. **Atalho rápido** (linha 815): `executeRecarga` compara saldo direto com valor digitado, sem consultar `pricing_rules`

## Correção

### 1. Corrigir parsing do callback_data (Bug 1)

Alterar o formato do `callback_data` para usar `|` como separador do custo (último campo), tornando-o imune a `_` no valueId:

```text
// Antes: rec_val_claro_claro_20_12.00
// Depois: rec_val_claro_claro_20|12.00
```

Na montagem (linha 1182): trocar o último `_` por `|`
Na leitura (linha 1194-1199): fazer split por `|` primeiro para extrair o custo, depois split por `_` no restante

### 2. Corrigir executeRecarga para resolver custo real (Bug 2)

Na função `executeRecarga` (linhas 799-829):
- Detectar operadora pelo número (usar API ou fallback por prefixo)
- Buscar `pricing_rules` / `reseller_pricing_rules` para o valor digitado
- Validar saldo contra o **custo real**, não o valor facial
- Exibir valor facial E custo no texto de confirmação
- Passar custo correto no `callback_data` de confirmação

### Arquivo alterado
- `supabase/functions/telegram-bot/index.ts`

