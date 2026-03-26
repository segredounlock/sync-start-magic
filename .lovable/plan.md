

# Corrigir Tela Branca no Espelho — RLS + Dados Iniciais

## Diagnóstico Confirmado

O espelho tem as migrations aplicadas (a função `get_maintenance_mode` já existe nas migrations). Os dois problemas reais são:

1. **`system_config` vazia no espelho** — as migrations inserem dados com `siteTitle = 'Recargas Brasil'`, mas se o espelho foi inicializado de forma diferente ou os dados foram limpos, a tabela fica vazia.

2. **RLS bloqueia `useSiteName` para usuários não-autenticados** — O hook faz query direta `supabase.from("system_config").select("value").eq("key", "siteTitle")`, mas as políticas RLS do `system_config` só permitem leitura para admins e para keys específicas (taxas, comissões, margem). **Não existe policy para `siteTitle`/`siteName` nem para `anon`**. Na landing page (sem login), a query retorna vazio silenciosamente.

## Plano de Correção

### 1. Migration: RLS para leitura pública de configs de branding

Adicionar policy SELECT para `anon` e `authenticated` nas keys de branding e manutenção:

```sql
CREATE POLICY "Public can read branding configs"
ON public.system_config FOR SELECT
TO anon, authenticated
USING (key IN ('siteTitle', 'siteName', 'siteSubtitle', 'seasonalTheme'));
```

Isso permite que `useSiteName` funcione sem autenticação. O `get_maintenance_mode` já usa SECURITY DEFINER, então não precisa de policy extra.

### 2. Migration: Garantir dados iniciais existem

```sql
INSERT INTO system_config (key, value) VALUES
  ('siteTitle', 'Sistema de Recargas'),
  ('siteName', 'Sistema de Recargas'),
  ('activeGateway', 'none'),
  ('maintenanceMode', 'false'),
  ... (15 configs essenciais)
ON CONFLICT (key) DO NOTHING;
```

Isso garante que no espelho ou em qualquer novo ambiente, os dados mínimos existam.

### 3. Código: Nenhuma alteração necessária

O `useSiteName` já tem fallback para `DEFAULT_SITE_NAME`. O `MaintenanceGuard` já tem timeout. O `AuthProvider` já tem timeout de 5s. A lógica está correta — só faltavam dados e permissões no banco.

## Resultado Esperado

- Espelho carrega imediatamente ao publicar (sem tela branca)
- Landing page mostra título correto mesmo sem login
- Nenhum arquivo de código alterado
- 1 migration SQL (RLS + dados)

## Arquivos
- 1 nova migration SQL

