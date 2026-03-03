

## Plano: Melhorias Visuais no Dashboard (com cautela)

O dashboard já está funcional e bem estruturado. As melhorias serão **cosméticas e incrementais**, sem alterar lógica de dados ou estrutura de estado.

### Melhorias Planejadas

**1. KPI Cards — Micro-refinamentos** (linhas ~1275-1328)
- Adicionar bordas sutis nos cards com cor contextual (border-success/10, border-primary/10)
- Hover com leve elevação (`hover:shadow-lg hover:-translate-y-0.5 transition-all`)
- Ícone do Saldo Provedor: tornar o card visualmente distinto com borda roxa

**2. Ações Rápidas — Visual mais premium** (linhas ~1330-1349)
- Botão "Novo Revendedor" com gradiente verde e ícone animado
- Os outros botões com ícones coloridos contextuais (Users=azul, FileText=amarelo, Settings=roxo)

**3. Atividade Recente — Badges de status mais claros** (linhas ~1352-1408)
- Substituir o ponto colorido por badges textuais ("Concluída", "Processando", "Falha") como no RealtimeDashboard
- Mostrar o nome da operadora em cor (TIM=azul, VIVO=roxo, Claro=vermelho) para scan rápido

**4. Top Revendedores — Medalha dourada no #1** (linhas ~1384-1408)
- Posição #1 com fundo dourado mais vibrante e ícone de troféu
- Valores em verde para destaque

**5. Saldo Baixo — Borda mais evidente** (linhas ~1411-1450)
- Adicionar ícone de AlertTriangle dentro de cada card individual
- Borda amarela mais visível nos cards

**6. Status do Sistema — Indicadores mais ricos** (linhas ~1452-1487)
- Adicionar ícone específico em cada status (Database, Shield, Users, Smartphone)
- Pulse animation apenas no indicador verde

### Arquivo a modificar
- `src/pages/Principal.tsx` — somente a seção `view === "dashboard"` (linhas ~1272-1492)

### Segurança
- Nenhuma alteração de lógica, estado, queries ou fetching
- Apenas classes CSS e pequenos ajustes de JSX na renderização do dashboard

