

# Plano: Conta sempre começa como Usuário — Revendedor só por ativação manual

## Resumo

Por padrão, toda conta criada (app, bot, site, mobile, desktop) será **usuario**. O cargo **revendedor** só é atribuído quando um admin (ou dono da rede) ativa manualmente essa função no usuário. Somente revendedores acessam o `/admin` (bot, clientes, loja). Usuários comuns acessam apenas as ferramentas de venda (Minha Rede, Meus Preços) no `/painel`.

## O que muda

### 1. Edge Function `admin-create-user` — default para `usuario`

**Arquivo:** `supabase/functions/admin-create-user/index.ts`

Atualmente o role padrão é `revendedor`. Mudar para `usuario`:

```typescript
// ANTES
const assignRole = validRoles.includes(role) ? role : "revendedor";
// DEPOIS
const assignRole = validRoles.includes(role) ? role : "usuario";
```

O admin ainda pode escolher o cargo ao criar, mas se não especificar, será `usuario`.

### 2. Trigger `handle_new_user` — já correto

O trigger já atribui `usuario` por padrão (ou `cliente` se vier com `reseller_id`). Sem alteração necessária.

### 3. Painel `/painel` — link do Admin só para revendedor/admin

**Arquivo:** `src/pages/RevendedorPainel.tsx`

Já está correto — o link "Painel Admin" e seção de administração só aparecem quando `role === "admin" || role === "revendedor"`. Sem alteração.

### 4. Ferramentas de Venda — visíveis para todos (quando ativado pelo admin)

Já está correto — "Meus Preços" e "Minha Rede" aparecem para todos os cargos quando `salesToolsEnabled` está ativo. Sem alteração.

### 5. Rota `/admin` — já restrita

Já está correto — `allowedRoles={["admin", "revendedor"]}`. Usuários comuns são redirecionados. Sem alteração.

## Arquivo modificado

1. **`supabase/functions/admin-create-user/index.ts`** — Mudar role padrão de `revendedor` para `usuario`

## Resumo de acesso

| Recurso | Usuario (padrão) | Revendedor (ativado) | Admin |
|---|---|---|---|
| Minha Rede | Sim (se ativado) | Sim (se ativado) | Sim |
| Meus Preços | Sim (se ativado) | Sim (se ativado) | Sim |
| Painel Admin (/admin) | Não | Sim | Sim |
| Bot próprio | Não | Sim | Sim |
| Promover a revendedor | Não | Não | Sim |

