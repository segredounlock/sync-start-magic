

# Atualizar Backup, Migrations e Documentacao Completa

## Contexto
O sistema possui 201 migrations SQL, 45 tabelas, 33 edge functions e 204+ arquivos fonte. Preciso garantir que nada esteja faltando no backup, na lista de migrations da documentacao, e que tudo esteja sincronizado.

---

## Etapa 1: Atualizar Edge Functions de Backup

### `backup-export/index.ts`
- Atualizar `version` de `"3.2"` para `"3.4"` no `backup-info.json` (linha 299)
- Garantir que a lista de `candidateTables` (fallback) inclui todas as 45 tabelas atuais (verificar se `login_fingerprints` e `admin_notifications` estao no fallback)

### `backup-restore/index.ts`
- Atualizar `knownOrder` para garantir que todas as 45 tabelas estao listadas na ordem correta de dependencia
- Garantir que `profileFkTables` inclui todas tabelas com FK para profiles
- Garantir que `conflictTargets` esta completo

### `BackupSection.tsx`
- Atualizar `SOURCE_PATHS` para incluir quaisquer novos arquivos adicionados recentemente (verificar se nenhum componente, hook ou edge function esta faltando)

---

## Etapa 2: Atualizar Documentacao

### `DOCUMENTACAO_MIGRACAO.md`
- Atualizar contagem de migrations para 201+
- Atualizar versao para v2.5
- Adicionar notas sobre correcoes de seguranca RLS (v2.4)
- Adicionar nota sobre raspadinha refatorada
- Adicionar nota sobre auto-confirm de email

### `documentation/README.md`
- Atualizar changelog com v2.5
- Incluir notas sobre: correcao duplicacao de mensagens no suporte, confirmacao de emails, auditoria RLS

### `documentation/BANCO_DE_DADOS.md`
- Confirmar que as 45 tabelas estao documentadas
- Atualizar contagem de migrations (201+)
- Confirmar que todas as ~38 funcoes SQL estao listadas
- Documentar as policies RLS corrigidas (user_roles `TO authenticated`, profiles restritiva)

### `documentation/EDGE_FUNCTIONS.md`
- Confirmar que as 33 funcoes estao todas listadas

### `documentation/BACKUP.md`
- Atualizar versao do backup para v3.4
- Atualizar contagem de migrations e tabelas

### `documentation/AUTENTICACAO.md`
- Adicionar nota sobre auto-confirm de email ativado
- Documentar correcao de seguranca RLS em user_roles e profiles

### `documentation/MIGRACAO.md`
- Atualizar contagem de migrations
- Adicionar item: verificar auto-confirm de email
- Adicionar item: confirmar correcoes RLS aplicadas

---

## Etapa 3: Verificar Integridade

- Comparar lista de tabelas no banco com a documentacao
- Comparar lista de edge functions no `config.toml` (33) com a documentacao
- Comparar `SOURCE_PATHS` no BackupSection com os arquivos reais do projeto

---

## Arquivos que serao alterados
1. `supabase/functions/backup-export/index.ts` -- versao e fallback tables
2. `supabase/functions/backup-restore/index.ts` -- knownOrder completo
3. `src/components/BackupSection.tsx` -- SOURCE_PATHS atualizado
4. `DOCUMENTACAO_MIGRACAO.md` -- versao, contagens, notas
5. `documentation/README.md` -- changelog v2.5
6. `documentation/BANCO_DE_DADOS.md` -- contagens atualizadas
7. `documentation/BACKUP.md` -- versao v3.4
8. `documentation/AUTENTICACAO.md` -- auto-confirm, RLS
9. `documentation/MIGRACAO.md` -- checklist atualizado

## Impacto
- Zero impacto funcional -- apenas atualizacao de documentacao e listas de referencia
- Backup passa a cobrir 100% dos arquivos e tabelas do projeto
- Documentacao fica sincronizada com o estado atual do sistema

