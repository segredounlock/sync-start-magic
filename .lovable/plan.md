

# Corrigir InstallWizard aparecendo no Preview

## Problema
O `LicenseGate` lê `install_completed` e `masterAdminId` de `system_config` antes do login. A policy pública atual só permite `siteTitle`, `siteName`, `siteSubtitle`, `seasonalTheme`, `siteLogo` — não inclui essas duas chaves. Resultado: retorna `null` para ambas e o wizard aparece indevidamente.

## Alterações

### 1. Migração SQL
Atualizar a policy `Public can read branding configs` adicionando `install_completed` e `masterAdminId`:

```sql
DROP POLICY IF EXISTS "Public can read branding configs" ON public.system_config;
CREATE POLICY "Public can read branding configs" ON public.system_config
  FOR SELECT TO anon, authenticated
  USING (key = ANY (ARRAY[
    'siteTitle','siteName','siteSubtitle','seasonalTheme','siteLogo',
    'install_completed','masterAdminId'
  ]));
```

### 2. Inserir flag `install_completed`
Como o sistema já está instalado mas pode não ter essa chave:

```sql
INSERT INTO public.system_config (key, value)
VALUES ('install_completed', 'true')
ON CONFLICT (key) DO NOTHING;
```

## Segurança
- `install_completed` é apenas `"true"` — sem dado sensível
- `masterAdminId` é um UUID — não concede acesso, apenas indica que o sistema já foi configurado
- Nenhuma alteração funcional — apenas informativa para pular o wizard

## Resultado
- Preview e domínios externos: wizard não aparece em sistema já instalado
- Espelhos novos (banco vazio): wizard continua aparecendo normalmente

