

# Plano: Liberar Meus Preços e Gestão Completa da Rede para Todos os Usuários

## O que muda

A tabela de acesso aprovada anteriormente restringia "Meus Preços" a admin/revendedor. O usuário agora quer que **todos** (incluindo cargo `usuario`) tenham:
- **Minha Rede** — gestão completa (promover, rebaixar, preços exclusivos)
- **Meus Preços** — configurar suas próprias margens de lucro

A regra de ouro permanece: **o preço do administrador principal é o piso mínimo**. Ninguém pode vender abaixo do preço global definido pelo admin. Revendedores e usuários só adicionam margem sobre esse piso.

## Alteração

### Arquivo: `src/pages/RevendedorPainel.tsx`

Linha ~891: remover a condição `if (role === "admin" || role === "revendedor")` do item "Meus Preços", tornando-o visível para todos (assim como "Minha Rede" já é).

```typescript
// ANTES
if (role === "admin" || role === "revendedor") {
  items.push({ key: "meusprecos", ... });
}

// DEPOIS
items.push({ key: "meusprecos", label: "Meus Preços", icon: Tag, color: "text-amber-400" });
```

### Segurança — já garantida

- **Frontend**: `MeusPrecos` e `ClientPricingModal` já bloqueiam salvamento de regras com lucro negativo ou abaixo do preço global do admin (safety floor).
- **Backend**: A Edge Function `recarga-express` aplica o `safety_floor` hierárquico — nunca cobra menos que o preço global do admin.
- **RLS**: `reseller_pricing_rules` permite que qualquer usuário autenticado gerencie suas próprias regras (`auth.uid() = user_id`), mas a política de escrita exige `has_role(auth.uid(), 'revendedor')`.

### RLS — ajuste necessário

A política de escrita da tabela `reseller_pricing_rules` exige cargo `revendedor`. Para que usuários comuns também salvem suas regras, é necessário alterar a policy:

```sql
-- Alterar política para permitir que qualquer autenticado gerencie suas próprias regras
DROP POLICY "Resellers can manage own pricing" ON public.reseller_pricing_rules;
CREATE POLICY "Users can manage own pricing"
ON public.reseller_pricing_rules
FOR ALL
TO public
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

## Resumo atualizado

| Recurso | Usuario | Revendedor | Admin |
|---|---|---|---|
| Minha Rede | Gestao completa | Gestao completa | Gestao completa |
| Meus Preços | Sim | Sim | Sim |
| Bot próprio | Não | Sim (/admin) | Sim |
| Painel Admin (/admin) | Não | Sim | Sim |
| Taxa Depósito Rede | Sim | Sim | Sim |
| Bot token em Config | Não | Sim | Sim |

## Arquivos modificados
1. **`src/pages/RevendedorPainel.tsx`** — Remover restrição de cargo no menu "Meus Preços"
2. **Migration SQL** — Atualizar RLS de `reseller_pricing_rules` para permitir escrita por qualquer autenticado

