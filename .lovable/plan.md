## Plano: Criar role "usuario" para usuários sem função

### Contexto

Atualmente, 3 usuários cadastrados não possuem role atribuída. O plano é criar o role `usuario` que funciona como um papel padrão — sem permissões especiais, mas com uma identificação clara no sistema.

### Alterações

**1. Banco de dados — Atribuir role "usuario" aos 3 usuários existentes sem role**

- INSERT na tabela `user_roles` para os 3 usuários órfãos com `role = 'usuario'`

**2. Edge function `admin-create-user` — Aceitar "usuario" como role válido**

- Atualizar a validação de role para incluir `"usuario"` como opção válida (além de admin e revendedor)
- &nbsp;

**4. `src/hooks/useAuth.tsx` — Incluir "usuario" no tipo AppRole**

- Atualizar `type AppRole` para incluir `"usuario"`

**5. `src/components/ProtectedRoute.tsx` — Nenhuma alteração necessária**

- Já funciona com qualquer string de role via `allowedRoles`

**6. Painel Admin (Principal) — Exibir "usuario" como opção ao criar/editar usuários**

- Atualizar o formulário de criação de usuário para incluir "usuario" no dropdown de roles

### Detalhes Técnicos

- O tipo `AppRole` passa de `"admin" | "revendedor" | "cliente"` para `"admin" | "revendedor" | "cliente" | "usuario"`
- A edge function `admin-create-user` aceita `role = "usuario"` no array de roles válidos
- O `Auth.tsx` perde ~50 linhas de código do formulário de cadastro, ficando mais limpo e seguro