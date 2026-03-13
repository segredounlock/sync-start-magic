

## Plano: Adicionar toggle de ativar/desativar valor na seção Precificação

### O que será feito
Adicionar um botão toggle (ativar/desativar) em cada **PricingCard** na seção de Precificação do painel Principal. Quando desativado, o valor ficará visualmente marcado e não aparecerá no catálogo (site, bot, miniapp).

### Alterações

**1. `src/pages/Principal.tsx`**

- **Importar** o hook `useDisabledValues` no topo do arquivo.
- **Inicializar** o hook dentro do componente Principal: `const { isDisabled, toggle, refetch } = useDisabledValues();`
- **Passar novas props** para o `PricingCard`: `disabled` (boolean) e `onToggleDisabled` (callback).
- **Na aba Global**: ao renderizar cada `PricingCard`, passar `disabled={isDisabled(activeOpId, valor)}` e `onToggleDisabled={() => toggle(activeOpId, valor, user.id)}`.
- **Na aba Por Revendedor**: mesma lógica de props.

- **Alterar o componente `PricingCard`**:
  - Adicionar props `disabled?: boolean` e `onToggleDisabled?: () => void`.
  - Adicionar um botão toggle no canto superior direito do card (ao lado do badge Global/Personalizado).
  - Quando `disabled=true`: o card fica com opacidade reduzida, borda vermelha, e um indicador "Desativado".
  - O botão usa os ícones `ToggleLeft`/`ToggleRight` (já importados no arquivo).
  - Ao clicar no toggle, chama `onToggleDisabled()`.

### Resultado
- O admin poderá ativar/desativar qualquer valor de recarga diretamente na tela de Precificação, sem precisar de uma aba separada "Operadoras".
- A mudança é refletida instantaneamente em todo o sistema (site, bot, miniapp) pois usa a mesma tabela `disabled_recharge_values`.

