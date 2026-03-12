

## Plano: Validar status real no comprovante de recarga

### Situação Atual
- O `RevendedorPainel.tsx` já bloqueia corretamente a abertura do comprovante para recargas não concluídas (linhas 1466, 1632, 1749).
- O problema está no `RecargaReceipt.tsx` (linha 332-336): o badge de status é **hardcoded** como "Recarga Concluída" com ícone verde, sem verificar `recarga.status`.
- A data no footer usa `new Date()` sem `formatDateTimeBR`.

### Alterações

**1. `RecargaReceipt.tsx` — Badge dinâmico por status**
- Substituir o badge fixo "Recarga Concluída" por lógica condicional:
  - `completed`/`concluida` → verde, "Recarga Concluída" ✅
  - `processing`/`pending` → amarelo, "Em Processamento" ⏳
  - `failed`/`erro` → vermelho, "Falhou" ❌
- Corrigir a data do footer para usar `formatDateTimeBR(new Date())` (timezone BR).
- Bloquear o botão "Compartilhar" se status não for concluído (camada extra de segurança).

**2. `RecargaReceipt.tsx` — Texto do `buildText`**
- Incluir o status real no texto compartilhado em vez de assumir "✅ Comprovante de Recarga" sempre.

Nenhuma alteração no banco de dados é necessária.

