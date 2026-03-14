

## Problema

Os KPI cards "Recargas Hoje" e "Total" aparecem em todas as abas exceto "contatos". Eles deveriam ser exibidos apenas na aba **Dashboard** (início), pois nas outras abas não fazem sentido contextual e poluem a interface.

## Plano

### 1. Restringir KPI cards ao Dashboard (RevendedorPainel.tsx)

Alterar a condição na linha 1098 de:
```tsx
{tab !== "contatos" && (
```
Para:
```tsx
{tab === "dashboard" && (
```

Isso fará com que os cards apareçam **somente** na aba Dashboard/Início.

### 2. Manter os cards no ProfileTab

O `ProfileTab.tsx` tem sua própria versão dos cards (linhas 371-390) que faz sentido naquele contexto — mantê-los lá.

### Impacto
- Arquivo editado: `src/pages/RevendedorPainel.tsx` (1 linha)
- Sem risco de quebra — apenas restringe visibilidade

