

# Modo Seguro de Restauração — Apenas Adicionar, Nunca Sobrescrever

## Problema
Ao restaurar backup no espelho, o sistema sobrescreve usuários, `system_config`, `bot_settings` e outros dados existentes. O espelho já tem seu próprio backend configurado e não deve ter dados substituídos.

## Solução
Adicionar um modo **"Restauração Segura"** que:
- **Pula** completamente a restauração de `auth.users` (não toca nos usuários do destino)
- **Pula** tabelas de configuração do sistema (`system_config`, `bot_settings`)
- Para as demais tabelas, usa **INSERT ... ON CONFLICT DO NOTHING** em vez de UPSERT (só adiciona registros que não existem)

## Alterações

### 1. Edge Function `backup-restore/index.ts`
- Ler query param `?mode=safe` da URL
- Se `mode === "safe"`:
  - Pular completamente a restauração de `auth/users.json`
  - Pular tabelas `system_config` e `bot_settings`
  - Trocar `upsert` por `insert` com `{ onConflict: "id", ignoreDuplicates: true }` para todas as tabelas (insere apenas novos, ignora existentes)
  - Retornar `authRestoreResult = { status: "skipped_safe_mode" }`

### 2. Frontend `BackupSection.tsx`
- Adicionar novo botão **"Restauração Segura"** ao lado do botão "Restaurar" existente, com ícone de escudo e cor verde/azul
- Novo botão abre o file picker e chama `executeImport(file, true)` (flag safeMode)
- `executeImport` recebe param `safeMode` e adiciona `?mode=safe` na URL da edge function
- Modal de confirmação diferente: "Apenas dados novos serão adicionados. Usuários e configurações existentes NÃO serão alterados."
- Novo `fileInputRef` dedicado (ou reutilizar com state)

### Arquivos alterados
1. `supabase/functions/backup-restore/index.ts` — lógica safe mode
2. `src/components/BackupSection.tsx` — botão + handler

