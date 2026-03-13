
Sim — faz sentido. Hoje o “Relatórios” está focado em lucro por revendedor e, na prática, ele filtra apenas recargas concluídas; por isso pendentes/falhas podem “sumir” e parecer que não há nada.

## Plano (conciso)

### 1) Ajustar o conceito da tela de Relatórios
- Manter o bloco atual de **lucro por revendedor** (porque é financeiro).
- Criar um bloco/seção específica de **“Todas as Recargas”** dentro de Relatórios (local fixo para você ver tudo).

### 2) Garantir que “Todas as Recargas” mostre de verdade tudo
- Incluir no dataset da seção:
  - `completed/concluida`
  - `pending`
  - `falha`
- Aplicar período (Hoje/7d/Mês/Total), mas sem esconder por status.
- Ordenar por data mais recente primeiro.

### 3) Filtros úteis na seção de recargas
- Filtro por status: **Todas | Concluídas | Pendentes | Falhas**.
- Busca por **telefone, operadora, nome/email do usuário**.
- Paginação para volume alto (sem travar a tela).

### 4) UX no mobile e desktop
- **Desktop:** tabela completa com Data, Usuário, Telefone, Operadora, Valor, Status.
- **Mobile (430x660):** cards compactos com os mesmos dados essenciais.
- Mensagem de vazio mais clara: “Sem recargas para os filtros selecionados”.

### 5) Validar fluxo esperado
- Clicar em “Ver tudo” → Relatórios → seção “Todas as Recargas” com dados.
- Mesmo quando não houver concluídas, pendentes/falhas continuam visíveis na seção de recargas.
- Bloco de lucro continua correto e separado.

## Arquivo principal impactado
- `src/pages/Principal.tsx` (fetch + render da view `relatorios`).

## Detalhes técnicos
- Problema atual identificado: query do relatório usa filtro de status apenas concluído (`in("status", ["completed", "concluida"])`), o que exclui pendentes/falhas.
- Implementação proposta:
  - Separar dataset de **lucro** (concluídas) do dataset de **listagem operacional** (todas).
  - Reaproveitar padrões já existentes de status/cores/formatação.
  - Manter paginação e busca no cliente para a nova lista.
- Sem alteração de banco, sem migração, sem mudança de permissão.
