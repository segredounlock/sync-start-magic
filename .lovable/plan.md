

## Análise Honesta do Módulo de Backup

Analisei a fundo o sistema e a resposta é: **Não, não vai funcionar automaticamente.** Existem problemas estruturais importantes:

### Problemas Identificados

1. **Lista de arquivos hardcoded (`SOURCE_PATHS`)** — Todos os caminhos de arquivos estão escritos manualmente na constante `SOURCE_PATHS` (linhas 194-249). Se você adicionar um novo componente, página, hook ou edge function aqui comigo, o módulo de backup no site hospedado **não vai saber que esse arquivo existe** e não vai incluí-lo nos backups/sincronizações.

2. **Lista de tabelas hardcoded (`TABLES`)** — As 25 tabelas estão listadas manualmente (linhas 13-20). Se criarmos uma nova tabela no banco, o backup não vai exportá-la nem restaurá-la.

3. **A importação de atualização só restaura DADOS** — O processo de "Importar Atualização" (aba Atualização) lê o ZIP, mas só envia os dados do banco para a edge function `backup-restore`. O código-fonte que está na pasta `source/` do ZIP **é ignorado na importação** — ele é apenas armazenado no ZIP mas nunca aplicado no site destino.

4. **A edge function `backup-export` também tem lista hardcoded** — A lista de tabelas está duplicada na edge function, então precisa ser atualizada em dois lugares.

### Resumo: O que acontece na prática

| Cenário | Funciona? |
|---------|-----------|
| Adiciono nova página/componente aqui | ❌ Backup não inclui |
| Adiciono nova tabela no banco | ❌ Backup não exporta |
| Altero arquivo existente que já está na lista | ✅ Funciona |
| Altero dados de tabela existente | ✅ Funciona |

---

### Plano de Correção

Para tornar o sistema **resiliente a qualquer atualização futura**, proponho:

#### 1. Descoberta dinâmica de tabelas (Edge Functions)
Nas edge functions `backup-export` e `backup-restore`, substituir a lista hardcoded por uma query que descobre todas as tabelas do schema `public` automaticamente:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
```

#### 2. Registro dinâmico de arquivos (Frontend)
No `BackupSection.tsx`, criar um arquivo de manifesto (`source-registry.json`) armazenado no `system_config` do banco que mantém a lista de arquivos atualizada. Toda vez que o backup é exportado aqui (ambiente de desenvolvimento), a lista é salva no banco. O site hospedado lê essa lista do banco em vez de usar hardcoded.

**Alternativa mais simples:** Manter o `SOURCE_PATHS` mas incluí-lo dentro do próprio pacote de atualização, para que o site destino atualize sua lista ao importar.

#### 3. Aplicação real do código-fonte na importação
O maior gap: quando o site hospedado importa um pacote de atualização, os arquivos de código-fonte precisam ser efetivamente aplicados. Como o site está em hospedagem estática (Vite build), a atualização de código só faz sentido via **sincronização GitHub → rebuild**. Isso já existe na aba GitHub.

**Fluxo corrigido:**
- Exportar atualização aqui → ZIP com DB + código + manifesto dinâmico
- No site hospedado: importar → restaura DB automaticamente + sincroniza código via GitHub automaticamente

#### Arquivos a modificar
- `supabase/functions/backup-export/index.ts` — query dinâmica de tabelas
- `supabase/functions/backup-restore/index.ts` — query dinâmica de tabelas
- `src/components/BackupSection.tsx` — manifesto dinâmico + fluxo de importação integrado com GitHub

