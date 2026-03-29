

# Tornar KPI Cards Responsivos (sem truncar valores)

## Problema
O valor "R$ 50.359..." está sendo cortado pelo `truncate` (CSS `text-overflow: ellipsis`) nos cards do Stats Grid. Com o crescimento da plataforma, valores maiores serão cada vez mais comuns.

## Solução

### 1. Remover `truncate` e usar texto auto-ajustável
Em todos os locais onde valores monetários/numéricos aparecem em cards, substituir `truncate` por tamanho de fonte responsivo que diminui automaticamente conforme o valor cresce.

### 2. Arquivos a alterar

**`src/components/BankDashboard.tsx`** (Stats Grid, linha 243)
- Remover `truncate` da classe do `<p>` de valor
- Usar classes responsivas: `text-lg sm:text-2xl md:text-3xl` para que o texto se adapte
- Adicionar `break-all` ou `whitespace-nowrap` com `overflow-hidden` + `text-[clamp(0.9rem,4vw,1.875rem)]` para escalar automaticamente

**`src/components/ui/KpiCard.tsx`** (linha 72)
- Mesmo ajuste: remover `truncate`, usar `text-[clamp(1rem,4vw,1.5rem)]` para auto-scale
- Garantir que funcione em todos os contextos onde `KpiCard` é usado

### 3. Abordagem técnica
Usar CSS `clamp()` para auto-escalar o font-size:
- Cards 2-col (BankDashboard): `font-size: clamp(0.95rem, 3.5vw, 1.875rem)` — nunca corta, apenas diminui
- KpiCard genérico: similar com breakpoints adequados

### Resultado
- Valores como R$ 50.359,00 ou R$ 150.000,00 aparecem completos
- O tamanho da fonte diminui automaticamente em telas menores
- Nenhum card trunca valores independente do tamanho

