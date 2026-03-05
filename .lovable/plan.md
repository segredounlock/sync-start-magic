

## Plano: Traduzir labels em inglês para português em todo o sistema

### Problema
Vários locais exibem valores brutos do banco de dados em inglês (ex: "deposit", "expired", "pending", "completed") diretamente na interface, sem tradução.

### Alterações

**1. `src/pages/RevendedorPainel.tsx`**
- **Linha 1809**: `{t.type}` com `capitalize` → traduzir: "deposit"/"deposito" → "Depósito", "withdrawal" → "Saque", fallback → valor original
- **Linha 1817**: fallback final `: t.status` → traduzir "expired" → "Expirado"

**2. `src/pages/AdminDashboard.tsx`**
- **Linha 2205, 2225, 2274**: Onde faz `t.type === "deposito" ? "Depósito" : t.type` — incluir também `"deposit"` → "Depósito"
- **Linhas 2205, 2282, 2300**: Fallback `: t.status` já traduz "expired" → "Expirado", mas garantir cobertura total

**3. `src/pages/Principal.tsx`**
- **Linha 2173**: statusLabel fallback `: t.status` → traduzir "expired" → "Expirado"
- **Linha 2204**: `{t.type}` com `capitalize` → traduzir tipo
- **Linha 2210**: statusLabel fallback `: t.status` → traduzir

**4. `src/components/BroadcastProgress.tsx`**
- **Linha 108**: `{progress.status}` renderizado cru → traduzir:
  - "pending" → "Aguardando"
  - "running" → "Enviando"
  - "completed" → "Concluído"
  - "failed" → "Falhou"
  - "cancelled" → "Cancelado"

### Abordagem
Criar mapas de tradução inline (ou constantes locais) para `type` e `status`, aplicando em cada ponto onde o valor bruto aparece. Não alterar os valores internos/banco — apenas a exibição.

### Mapa de tradução

| Campo   | Inglês     | Português    |
|---------|-----------|--------------|
| type    | deposit   | Depósito     |
| type    | withdrawal| Saque        |
| status  | completed | Confirmado   |
| status  | pending   | Processando  |
| status  | expired   | Expirado     |
| status  | running   | Enviando     |
| status  | failed    | Falhou       |
| status  | cancelled | Cancelado    |

