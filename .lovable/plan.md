

# Plano: Exportar auth.users no Backup

## Problema

O backup atual exporta apenas as tabelas do schema `public`. A tabela `auth.users` (emails, metadados, datas de criacao, confirmacao de email) fica de fora. Sem ela, uma migracao completa exige recriar todos os usuarios manualmente.

## Solucao

Adicionar exportacao de `auth.users` dentro da propria edge function `backup-export`, usando a Admin API do Supabase (`supabase.auth.admin.listUsers()`). Os dados serao salvos em `auth/users.json` dentro do ZIP.

### Alteracoes

**1. `supabase/functions/backup-export/index.ts`**

Apos o body parse (linha 58), adicionar flag `includeAuth` (default `true`).

Apos a secao de database export, adicionar bloco que:
- Usa `supabaseAdmin.auth.admin.listUsers()` com paginacao (paginas de 1000)
- Salva no ZIP como `auth/users.json` com campos: `id`, `email`, `email_confirmed_at`, `created_at`, `last_sign_in_at`, `raw_user_meta_data`, `phone`, `banned_until`
- Exclui campos sensíveis como `encrypted_password` (a Admin API nao retorna senhas de qualquer forma)

**2. `src/components/BackupSection.tsx`**

Adicionar checkbox "Incluir dados de autenticacao" na UI de export, enviando `includeAuth: true` no body da requisicao. Atualizar o resumo do backup para mostrar quantidade de usuarios auth exportados.

### Detalhes Tecnicos

```text
ZIP atualizado:
backup-YYYY-MM-DD.zip
├── backup-info.json
├── auth/
│   └── users.json          ← NOVO (id, email, metadata, timestamps)
├── database/
│   └── ... (42 tabelas)
└── schema/ (opcional)
```

A API `auth.admin.listUsers()` retorna ate 1000 usuarios por pagina. O loop de paginacao coletara todos os 1179 usuarios.

### Limitacao importante

Senhas nao sao exportaveis — a Admin API nao as retorna. Na migracao, usuarios precisarao usar "Esqueci minha senha" para definir nova senha, ou o admin pode usar a API para criar usuarios com senhas temporarias.

