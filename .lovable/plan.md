

## Plano: Leitura dinâmica do manifesto de arquivos

### O que muda
No `BackupSection.tsx`, ao inicializar e ao exportar/sincronizar, o componente tentará ler a chave `source_paths_manifest` do `system_config` no banco. Se existir, usa essa lista. Se não existir (primeira vez), usa o `SOURCE_PATHS` hardcoded como fallback.

### Alterações em `src/components/BackupSection.tsx`

1. **Adicionar estado e fetch do manifesto** — No carregamento do componente, buscar `system_config` onde `key = 'source_paths_manifest'` e parsear o JSON como array de strings.

2. **Usar lista dinâmica** — Todas as funções que usam `SOURCE_PATHS` (exportação, sincronização GitHub) passam a usar `dynamicPaths || SOURCE_PATHS` como fallback.

3. **Manter `SOURCE_PATHS` como fallback** — A constante continua existindo para o caso do banco não ter o manifesto (ambiente de desenvolvimento ou primeira execução).

### Arquivos a modificar
- `src/components/BackupSection.tsx` — adicionar fetch do manifesto + usar lista dinâmica

