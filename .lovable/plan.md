

# Plano: Backup e Restauracao com Senhas Criptografadas via SQL Direto

## Por que nao funciona hoje

A Admin API do Supabase (`listUsers`) nao retorna o campo `encrypted_password` e a `createUser` nao aceita hash pre-existente. Porem, usando conexao SQL direta ao PostgreSQL via `SUPABASE_DB_URL`, podemos ler e escrever o hash bcrypt diretamente na tabela `auth.users`, preservando as senhas dos usuarios.

## Alteracoes

### 1. `supabase/functions/backup-export/index.ts`

Substituir o bloco de auth export (linhas 146-202) que usa `listUsers()` por uma query SQL direta:

```sql
SELECT id, email, encrypted_password, email_confirmed_at, 
       created_at, updated_at, last_sign_in_at, banned_until,
       raw_user_meta_data, raw_app_meta_data, phone,
       confirmation_token, recovery_token, aud, role
FROM auth.users ORDER BY created_at
```

Usar a lib `postgres` para Deno (`https://deno.land/x/postgresjs/mod.js` ou `https://esm.sh/postgres`) com `SUPABASE_DB_URL`. Isso captura o `encrypted_password` que a Admin API esconde.

O JSON no ZIP passara a incluir o campo `encrypted_password` para cada usuario.

### 2. `supabase/functions/backup-restore/index.ts`

Substituir o bloco de auth restore (linhas 95-160) que usa `createUser()` por INSERT SQL direto:

```sql
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, 
  created_at, updated_at, raw_user_meta_data, raw_app_meta_data, 
  phone, aud, role, instance_id)
VALUES ($1, $2, $3, ...)
ON CONFLICT (id) DO NOTHING
```

Isso preserva:
- O UUID original (resolve o problema de FK com profiles)
- A senha criptografada (usuario faz login normalmente sem resetar)
- Todos os metadados (incluindo dados do Telegram)

### Detalhes Tecnicos

```text
Fluxo atual (quebrado):
  Export: listUsers() → sem encrypted_password
  Restore: createUser() → novo UUID, sem senha

Fluxo novo (completo):
  Export: SQL direto auth.users → com encrypted_password e UUID original
  Restore: INSERT SQL direto → mesmo UUID, mesma senha, mesmo hash
```

A lib PostgreSQL para Deno sera importada como:
```typescript
import postgres from "https://deno.land/x/postgresjs@v3.4.4/mod.js";
```

Conexao via `SUPABASE_DB_URL` que ja esta configurada como secret.

### Campos exportados por usuario

| Campo | Antes | Agora |
|-------|:---:|:---:|
| id (UUID) | OK | OK |
| email | OK | OK |
| encrypted_password | **NA