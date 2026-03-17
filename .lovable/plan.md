

## Problema
O item "Suporte" não aparece no menu inferior mobile do painel do revendedor (`RevendedorPainel.tsx`). Não há nenhuma entrada com key `suporte` nos itens da `MobileBottomNav`.

## Plano

1. **Adicionar item "Suporte" na lista de itens do `MobileBottomNav`** em `src/pages/RevendedorPainel.tsx` (linha ~2503), com ícone `Headphones` ou `LifeBuoy`, cor adequada e animação.

2. **Verificar se a tab "suporte" já é tratada** no componente (se já existe um `SupportTab` ou seção de suporte renderizada). Se não existir, adicionar a renderização condicional quando `tab === "suporte"`.

3. **Garantir que o import do ícone** (ex: `Headphones` do lucide-react) está presente.

### Arquivos a editar
- `src/pages/RevendedorPainel.tsx` — adicionar item de suporte na