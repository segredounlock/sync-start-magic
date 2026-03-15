

# Corrigir Role de Cadastro via Link de Indicação

## Problema

- Cadastro via **loja pública** (`client-register`): atribui role `cliente` via service role
- Cadastro via **link de indicação** (`Auth.tsx` com `?ref=`): o trigger `handle_new_user` atribui `usuario`
- O front-end não pode inserir em `user_roles` (RLS restringe a admins)

## Solução

Modificar o trigger `handle_new_user` para verificar se o usuário tem `reseller_id` nos metadados (`raw_user_meta_data`). Se tiver, atribuir `cliente` ao invés de `usuario`.

### Migração SQL

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _reseller_id uuid;
  _role text;
BEGIN
  -- Extract reseller_id from metadata (set by Auth.tsx signup with ref param)
  _reseller_id := (NEW.raw_user_meta_data->>'reseller_id')::uuid;

  INSERT INTO public.profiles (id, email, nome, reseller_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    _reseller_id
  );

  INSERT INTO public.saldos (user_id, tipo, valor) VALUES (NEW.id, 'revenda', 0);
  INSERT INTO public.saldos (user_id, tipo, valor) VALUES (NEW.id, 'pessoal', 0);

  -- If has reseller, assign 'cliente'; otherwise 'usuario'
  _role := CASE WHEN _reseller_id IS NOT NULL THEN 'cliente' ELSE 'usuario' END;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role);

  RETURN NEW;
END;
$$;
```

### Ajuste em Auth.tsx

Remover o `update` manual de `reseller_id` no perfil após signup (linhas ~207-210), pois o trigger já faz isso via metadata. O `reseller_id` já é passado em `options.data` do `signUp`.

### Resumo das Mudanças

| Arquivo | Ação |
|---|---|
| Migração SQL | Atualizar `handle_new_user` para ler `reseller_id` do metadata e atribuir role correta |
| `Auth.tsx` | Remover update redundante de `reseller_id` no perfil (trigger já faz) |

