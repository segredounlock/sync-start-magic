

## Plano: Sistema de Atualização Inteligente + Correção de Build

### Problema Atual
1. **Erro de build**: O componente `RecargaReceipt.tsx` importa `html2canvas` que não está instalado, quebrando o build.
2. **Pedido do usuário**: Criar um sistema de "atualização" que permita exportar o estado atual do sistema como um pacote de atualização, e depois importá-lo em outra instância (ou na mesma após migração), atualizando tudo sem quebrar.

---

### Correção Imediata: Build Error

**Arquivo**: `src/components/RecargaReceipt.tsx`
- Remover a importação dinâmica de `html2canvas` (não instalado)
- O botão "Download" vai usar o fallback de compartilhar/copiar texto que já existe

---

### Sistema de Atualização

O conceito é transformar o sistema de backup existente em um **sistema de atualização versionado** com as seguintes capacidades:

#### 1. Nova aba "Atualização" no BackupSection
- Adicionar uma terceira aba ao lado de "Dados" e "GitHub" chamada **"Atualização"**
- Interface com dois botões: **"Gerar Pacote de Atualização"** e **"Aplicar Atualização"**

#### 2. Gerar Pacote de Atualização (Exportar)
- Exporta um ZIP contendo:
  - `update-manifest.json` com versão, data, lista de tabelas e arquivos, checksums
  - `database/` com dados de todas as 23 tabelas (via edge function existente)
  - `source/` com todo o código-fonte (lista SOURCE_PATHS existente)
- O manifesto inclui a versão do sistema para comparação na hora de aplicar

#### 3. Aplicar Atualização (Importar)
- Upload de um ZIP de atualização
- Lê o `update-manifest.json` e compara com a versão atual
- **Restaura banco de dados** via edge function `backup-restore` existente (já faz upsert inteligente sem apagar dados)
- Mostra um resumo do que foi atualizado (tabelas, quantidade de registros)
- Exibe status de cada tabela: restaurada, ignorada, erro

#### 4. Controle de Versão no Banco
- Armazenar a versão atual do sistema na tabela `system_config` com a chave `system_version`
- A cada atualização aplicada, a versão é incrementada automaticamente

---

### Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `src/components/RecargaReceipt.tsx` | Remover import `html2canvas` |
| `src/components/BackupSection.tsx` | Adicionar aba "Atualização" com exportação/importação inteligente |

### Detalhes Técnicos

- Reutiliza a edge function `backup-export` para exportar dados do banco
- Reutiliza a edge function `backup-restore` para restaurar dados (já faz upsert sem quebrar FK)
- O pacote de atualização é o mesmo ZIP do backup mas com um manifesto de versão adicional
- A restauração de código-fonte não é automática (o código roda no Lovable), mas os dados do banco são restaurados diretamente
- A versão do sistema é salva em `system_config` para rastreamento

