

## Plano: Unificar Backup Completo (Dados + Código)

### Situação Atual
- **Exportar ZIP** = apenas banco de dados (15 tabelas)
- **GitHub Sync** = apenas código-fonte → GitHub
- Não existe opção de baixar um ZIP com **tudo** (dados + código)

### O que precisa mudar

**1. Atualizar a Edge Function `backup-export`**
- Além da pasta `database/`, adicionar uma pasta `source/` no ZIP
- Ler os arquivos do projeto via a mesma lista de caminhos usada no GitHub Sync
- Usar `Deno.readTextFile()` ou similar para incluir cada arquivo `.ts`, `.tsx`, `.css`, `.json`, `.html` no ZIP
- O ZIP final teria:
  ```text
  backup-recargas-2026-03-01.zip
  ├── backup-info.json
  ├── database/
  │   ├── operadoras.json
  │   ├── profiles.json
  │   └── ... (15 tabelas)
  └── source/
      ├── src/App.tsx
      ├── src/pages/Principal.tsx
      └── ... (todos os arquivos)
  ```

**2. Atualizar `BackupSection.tsx`**
- Adicionar checkbox "Incluir código-fonte" no formulário de exportação
- Passar parâmetro `includeSource: true` na chamada da edge function

**3. Atualizar `backup-restore` (restauração)**
- Ignorar a pasta `source/` na restauração (restaurar apenas dados, o código já está no Lovable)
- Ou opcionalmente listar os arquivos incluídos para referência

### Limitação Importante
As Edge Functions **não têm acesso ao sistema de arquivos do projeto**. Elas rodam em ambiente Deno isolado e não conseguem ler os arquivos `.tsx` do repositório. Para incluir código no ZIP, a lógica precisaria rodar **no frontend** (ler os arquivos via `fetch` e montar o ZIP no navegador), similar ao que o GitHub Sync já faz.

### Abordagem Recomendada
Mover a lógica de backup de código para o **frontend** em `BackupSection.tsx`:
1. Buscar o conteúdo de cada arquivo via `fetch` (igual ao GitHub Sync)
2. Adicionar ao ZIP junto com os dados do banco
3. Gerar o download completo no navegador

Isso garante um ZIP com dados + código sem depender de acesso ao filesystem na edge function.

