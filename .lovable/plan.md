

# Tornar Revendedores os Usuários sem Vínculo de Rede

## Resumo
Adicionar o cargo `revendedor` aos ~1.085 usuários que possuem apenas `usuario` e não têm `reseller_id`, e garantir que novos cadastros sem vínculo também recebam `revendedor` automaticamente.

---

## 1. INSERT em massa via insert tool
Adicionar `revendedor` a todos os usuários sem vínculo:
```sql
INSERT INTO user_roles (user_id, role)
SELECT ur.user_id, 'revendedor'
FROM user_roles ur
JOIN profiles p ON p.id = ur.user_id
WHERE ur.role = 'usuario'
  AND (p.reseller_id IS NULL)
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur2
    WHERE ur2.user_id = ur.user_id AND ur2.role = 'revendedor'
  );
```

## 2. Atualizar trigger `handle_new_user` (migration)
No fluxo normal (quando já existe admin), adicionar `revendedor` junto com `usuario` **apenas quando `reseller_id` é NULL**:
```sql
IF _reseller_id IS NULL THEN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'usuario');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'revendedor')
    ON CONFLICT DO NOTHING;
ELSE
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'usuario');
END IF;
```

## 3. Edge Function `client-register` — sem alteração
Esta função é usada quando um cliente se cadastra **via link de revendedor** (sempre tem `reseller_id`), então continua atribuindo apenas `usuario`.

## 4. Edge Function `admin-create-user` — sem alteração
O admin escolhe o cargo manualmente, não precisa de mudança automática.

---

## Arquivos alterados
1. **Banco de dados** — INSERT em massa (~1.085 registros) via insert tool
2. **Trigger `handle_new_user`** — migration para adicionar `revendedor` quando sem vínculo

## Impacto
- ~1.085 usuários passam a ver "Meus Preços", "Minha Rede", "Minha Loja"
- Novos cadastros sem indicação já vêm com `revendedor` + `usuario`
- Cadastros via link de indicação continuam apenas com `usuario`
- Zero impacto em admins e usuários já vinculados a redes

