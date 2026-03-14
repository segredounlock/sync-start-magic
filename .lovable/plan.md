

# Plano: Forçar operadora em UPPERCASE nos comprovantes

## Problema
O nome da operadora aparece em minúsculo ("tim") nos comprovantes do site e do Telegram, apesar da convenção UPPERCASE do sistema.

## Alterações

### 1. `src/components/RecargaReceipt.tsx`
- **Linha 303**: `{r.operadora || "—"}` → `{(r.operadora || "—").toUpperCase()}`
- **Linha 48** (buildText): `${r.operadora || "—"}` → `${(r.operadora || "—").toUpperCase()}`

### 2. `supabase/functions/telegram-notify/index.ts`
- **Linha 182** (imagem Satori): `data.operadora || "—"` → `(data.operadora || "—").toUpperCase()`
- **Linha 357** (caption recarga_completed): `data.operadora` → `data.operadora.toUpperCase()`
- **Linha 387** (generateReceiptPng call): `data.operadora || "—"` → `(data.operadora || "—").toUpperCase()`
- **Linha 416** (caption recarga_failed): `data.operadora` → `data.operadora.toUpperCase()`

Todas as exibições de operadora nos comprovantes passarão a usar `.toUpperCase()`.

