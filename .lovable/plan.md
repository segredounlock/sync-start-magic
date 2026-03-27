

# Documentar o Sistema de masterAdminId e Validar Auto-Criação

## Contexto
O usuário reportou (screenshot) que o `masterAdminId` não existia na tabela `system_config`, causando redirecionamento para `/painel` em vez de `/principal`. O sistema **já funciona automaticamente** via o trigger `handle_new_user` -- quando o primeiro usuário se cadastra, ele é auto-promovido a admin master e o `masterAdminId` é salvo. Porém, em ambientes migrados ou restaurados, essa chave pode não existir se o backup não a incluiu.

## O que já funciona automaticamente
1. **Trigger `handle_new_user`** -- ao cadastrar o primeiro usuário (sem admins no sistema), cria `masterAdminId` em `system_config`
2. **Migrations SQL** -- já estão no repositório e são aplicadas automaticamente pelo Lovable Cloud ao fazer deploy
3. **RLS Policy** -- `Authenticated can view master admin config` já permite leitura

## O que falta documentar
A documentação atual não explica claramente:
- O que acontece se `masterAdminId` não existir no `system_config`
- Como corrigir manualmente
- Que em migrações/restaurações essa chave precisa ser verificada

## Plano

### 1. Atualizar `documentation/AUTENTICACAO.md`
Adicionar seção "Troubleshooting" com:
- Problema: `masterAdminId` ausente causa redirecionamento para `/painel`
- Causa: backup/migração sem essa chave, ou banco limpo sem primeiro cadastro
- Solução: INSERT manual ou novo cadastro como primeiro usuário
- Fallback hardcoded nos edge functions (`f5501acc-...`) como segurança extra

### 2. Atualizar `documentation/MIGRACAO.md`
No checklist de restauração (seção 6.2), adicionar item explícito:
- Verificar que `masterAdminId` existe em `system_config`
- Se não existir, inserir manualmente com o UUID do admin principal

### 3. Atualizar `documentation/BANCO_DE_DADOS.md`
Documentar a chave `masterAdminId` na lista de chaves críticas do `system_config`

### 4. Atualizar `DOCUMENTACAO_MIGRACAO.md`
Adicionar nota sobre auto-criação do `masterAdminId` e verificação pós-migração

## Detalhes Técnicos
- O trigger `handle_new_user` usa `ON CONFLICT (key) DO UPDATE` -- seguro para re-execução
- Edge functions `admin-toggle-role` e `admin-delete-user` têm fallback hardcoded para `f5501acc-...`
- `MasterOnlyRoute.tsx` consulta `system_config` diretamente -- se a chave não existir, ninguém acessa `/principal`
- `Principal.tsx` também tem fallback hardcoded no `MASTER_ADMIN_ID`

## Arquivos alterados
1. `documentation/AUTENTICACAO.md` -- seção troubleshooting
2. `documentation/MIGRACAO.md` -- item no checklist
3. `documentation/BANCO_DE_DADOS.md` -- chaves críticas do system_config
4. `DOCUMENTACAO_MIGRACAO.md` -- nota sobre masterAdminId

