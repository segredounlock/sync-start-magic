

## Plano: Refatorar CRUD inline para usar `useCrud` + `confirm` global

### O que isso faria na prática

Substituir operações manuais de banco de dados (insert/update/delete) e chamadas `window.confirm()` espalhadas inline nos componentes por chamadas padronizadas aos hooks `useCrud` e `confirm` que já foram criados. Na prática:

1. **Substitui `window.confirm()` nativo** (caixa cinza feia do navegador) pelo modal estilizado `confirm()` de `src/lib/confirm.tsx` — visual consistente com o tema do app
2. **Reduz boilerplate repetitivo** — cada operação de delete/update que hoje tem 5-8 linhas (try/catch/toast.success/toast.error) passa a ter 1 linha
3. **Padroniza tratamento de erros** — todos os erros de CRUD mostram toast automaticamente

### Locais a refatorar

**`AdminDashboard.tsx`** (3 ocorrências):
- `deleteOperadora()` — usa `window.confirm` + delete manual → `useCrud("operadoras").remove(id, "Excluir operadora X?")`
- `creditClientModal` saldo update — update manual com try/catch → simplificar com `useCrud("saldos").update()`
- Operações inline de update em operadoras

**`Principal.tsx`** (5+ ocorrências):
- `resetRevGateway()` — `confirm()` nativo + delete manual
- Delete user confirmation — `confirm()` nativo
- `toggleActive()` — update manual de profiles
- `verification_badge` updates — inline updates sem error handling
- `pricing_rules` delete — manual delete com try/catch
- `reseller_pricing_rules` delete — manual delete

### Como ficaria o código (exemplo)

**Antes:**
```typescript
const deleteOperadora = async (op: Operadora) => {
  if (!confirm(`Excluir operadora ${op.nome}?`)) return;
  const { error } = await supabase.from("operadoras").delete().eq("id", op.id);
  if (error) { toast.error("Erro ao excluir"); return; }
  toast.success("Operadora excluída");
  fetchOperadoras();
};
```

**Depois:**
```typescript
const { remove: removeOperadora } = useCrud("operadoras", { onRefresh: fetchOperadoras });
// No evento:
await removeOperadora(op.id, `Excluir operadora ${op.nome}?`);
```

### Limitações

- Operações complexas (ex: atualizar saldo com cálculo matemático, ou encadear múltiplas queries) **não** serão migradas para `useCrud` pois precisam de lógica custom. Apenas as operações simples de CRUD serão migradas.
- O `useCrud` usa `.eq("id", id)` como filtro padrão, então operações que filtram por outro campo (ex: `user_id`) precisariam de ajuste ou permaneceriam manuais.

### Impacto esperado

- ~40-60 linhas removidas de boilerplate
- 3 `window.confirm()` substituídos por modais estilizados
- Tratamento de erros garantido em todas as operações CRUD simples

