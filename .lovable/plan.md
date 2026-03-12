

## Checksum de Integridade para Arquivos Verificáveis

### Problema
A verificação atual só confirma que o arquivo **existe** no manifesto. Não detecta se foi **modificado**.

### Abordagem
Criar um **plugin Vite** que, durante o build, lê cada arquivo fonte, computa um hash curto (djb2) e gera um módulo virtual com o mapa `path → hash`. Isso evita incluir o conteúdo bruto dos arquivos no bundle (que adicionaria centenas de KB).

### Alterações

**1. `vite.config.ts`** — Adicionar plugin `sourceHashPlugin`:
- No `buildStart`, escaneia `src/**/*.{tsx,ts,css}` e `public/sw-push.js`
- Computa hash djb2 de cada arquivo (8 chars hex)
- Serve como módulo virtual `virtual:source-hashes` exportando o mapa `Record<string, string>`

**2. `src/lib/sourceManifest.ts`** — Importar hash map do módulo virtual:
- Exportar `getFileHashes(): Record<string, string>` além do `getKnownPaths()` existente
- Adicionar declaração de tipo para o módulo virtual

**3. `src/components/BackupSection.tsx`** — Atualizar `runIntegrityCheck`:
- Importar `getFileHashes()`
- No resultado, incluir os hashes por arquivo
- Na UI, mostrar um resumo com o hash (ex: "85 arquivos · checksum global: a3f7b2c1")
- Adicionar seção expansível mostrando cada arquivo com seu hash individual
- Computar um hash agregado de todos os hashes para dar um "fingerprint" geral do build

### Resultado na UI
```text
✅ 85/85 verificáveis OK · Fingerprint: a3f7b2c1
  ▸ Ver checksums individuais
    src/App.tsx .............. e4a2f1b3
    src/main.tsx ............. 7c3d9e01
    ...
```

