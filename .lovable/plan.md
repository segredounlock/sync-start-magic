

# Plano: Forçar operadora UPPERCASE em todos os painéis

## Problema
Vários locais nos painéis Principal, Admin, Revendedor e Mini App exibem o nome da operadora sem `.toUpperCase()`.

## Locais a corrigir

### 1. `src/pages/AdminDashboard.tsx`
- **Linha 1312**: `{r.operadora || "—"}` → `{(r.operadora || "—").toUpperCase()}`
- **Linha 1373**: `{r.operadora || "—"}` → `{(r.operadora || "—").toUpperCase()}`

### 2. `src/pages/Principal.tsx`
- **Linha 1509**: `{r.operadora || "—"}` → `{(r.operadora || "—").toUpperCase()}`
- **Linha 2248**: `{r.operadora || "—"}` → `{(r.operadora || "—").toUpperCase()}`

### 3. `src/pages/TelegramMiniApp.tsx`
- **Linha 963**: `${d.operadora}` → `${(d.operadora || "—").toUpperCase()}`
- **Linha 1357**: `{r.operadora || "—"}` → `{(r.operadora || "—").toUpperCase()}`
- **Linha 1568**: `viewingReceipt.operadora || "—"` → `(viewingReceipt.operadora || "—").toUpperCase()`
- **Linha 1587**: `${viewingReceipt.operadora || "—"}` → `${(viewingReceipt.operadora || "—").toUpperCase()}`
- **Linha 1637**: `{r.operadora || "—"}` → `{(r.operadora || "—").toUpperCase()}`

### 4. `src/components/RecargasTicker.tsx`
- **Linha 168**: `{r.operadora || "—"}` → `{(r.operadora || "—").toUpperCase()}`

### 5. `src/components/RealtimeDashboard.tsx`
- **Linha 98**: `{r.operadora || "—"}` → `{(r.operadora || "—").toUpperCase()}`

### 6. `src/components/chat/UserRecargasModal.tsx`
- **Linha 475**: `{r.operadora || "—"}` → `{(r.operadora || "—").toUpperCase()}`

Total: 12 pontos de correção em 6 arquivos. Todos recebem `.toUpperCase()`.

