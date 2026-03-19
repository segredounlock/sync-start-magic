

# Converter 475 Revendedores para Usuários

## Resumo
Atualizar todos os registros com role `revendedor` na tabela `user_roles` para `usuario`, e restringir a rota `/admin` apenas para admins.

## Impacto
- 475 usuários perderão acesso ao painel `/admin`
- Permissões de rede (Minha Rede, Meus Preços) continuam funcionando para todos
- RLS policies que checam `has_role(uid, 'revendedor')` deixarão de aplicar — mas as policies genéricas por `auth.uid()` cobrem as mesmas funcionalidades

## Passos

### 1. Atualizar roles no banco de dados
Executar via insert tool (data update):
```sql
UPDATE user_roles SET role = 'usuario' WHERE role = 'revendedor';
```

### 2. Atualizar a rota `/admin` no AppRoot.tsx
Restringir `allowedRoles` de `["admin", "revendedor"]` para apenas `["admin"]`.

### 3. Atualizar o trigger `handle_new_user`
Atualmente, novos cadastros com `reseller_id` recebem role `cliente`. Sem revendedores, manter essa lógica ou simplificar para sempre atribuir `usuario`.

### 4. Atualizar a edge function `admin-toggle-role`
Remover a lógica que permite revendedores gerenciar roles na sua rede, já que não existirão mais revendedores.

### 5. Atualizar RLS policy de `pricing_rules`
A policy "Admins and resellers can read pricing rules" checa `has_role('revendedor')`. Atualizar para permitir todos os autenticados (já existe uma policy separada que faz isso, então pode ser removida).

### 6. Revisar referências no código
Buscar por `revendedor` no frontend para remover/ajustar condicionais que mostram UI específica para esse cargo.

## Detalhes técnicos
- A conversão é feita via UPDATE (insert tool), não migration
- Policies RLS existentes com `auth.uid() = user_id` já cobrem as funcionalidades de pricing e rede para qualquer usuário autenticado
- O cargo `revendedor` no enum `app_role` pode ser mantido no banco para compatibilidade, mas não será mais atribuído

