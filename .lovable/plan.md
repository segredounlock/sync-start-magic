

## Problema

1. **Balão de suporte aparece no painel admin (`/principal`)** — o admin é quem responde, não precisa do botão flutuante de suporte.
2. **Verificar se o toggle de desligar suporte funciona** — o toggle está em `AdminSupport.tsx` (renderizado dentro de `/principal` na view "suporte") e grava `supportEnabled` na tabela `system_config`. O `RevendedorPainel` já escuta esse valor em tempo real. A lógica parece correta.

## Plano

### 1. Esconder o botão flutuante de suporte para admins

Em `src/components/support/FloatingSupportButton.tsx`, adicionar uma verificação de role:

- Se `role === "admin"`, retornar `null` (não renderizar o botão).
- Isso é mais limpo do que adicionar rotas ao `hiddenRoutes`, pois cobre qualquer página que o admin acessar.

Alternativa: adicionar `/principal` ao `hiddenRoutes`. Mas a abordagem por role é mais robusta.

### 2. Confirmar funcionamento do toggle

O fluxo já está implementado:
- **Admin** desliga em `AdminSupport.tsx` → grava `supportEnabled = "false"` na `system_config`
- **Revendedor** escuta via realtime channel `reseller-panel-support-enabled` → muda `supportEnabled` state → aba mostra "Suporte pausado"
- **FloatingSupportButton** escuta via channel `support-enabled-toggle` → mostra botão cinza offline

Nenhuma mudança adicional necessária no toggle — ele já funciona. A única alteração é esconder o botão flutuante para o admin.

### Alteração

**Arquivo:** `src/components/support/FloatingSupportButton.tsx`
- Linha ~87: mudar de `if (!user || shouldHide) return null;` para `if (!user || shouldHide || role === "admin") return null;`

Uma única linha de mudança.

