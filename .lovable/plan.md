

## Plano: Configurações de Notificações por Cargo

### Objetivo
Sons funcionam para todos (admin e revendedor), mas as notificações visuais (toasts, NotificationBell, notificações nativas) são controladas por configurações que o admin master define na tela `/principal` > Configurações (Geral). O admin escolhe, por cargo, quais tipos de notificação cada um recebe.

### Arquitetura

Novas chaves na tabela `system_config`:

| Chave | Valor padrão | Descrição |
|---|---|---|
| `notif_admin_deposit` | `true` | Admin vê toasts de depósito |
| `notif_admin_recarga` | `true` | Admin vê toasts de recarga |
| `notif_admin_new_user` | `true` | Admin vê toasts de novo cadastro |
| `notif_revendedor_deposit` | `false` | Revendedor vê toast do próprio depósito |
| `notif_revendedor_recarga` | `false` | Revendedor vê toasts de recarga |

### Alterações por arquivo

**1. `src/pages/Principal.tsx` — Seção Geral**
- Adicionar um novo card "Notificações" após "Temas Sazonais" com toggles visuais organizados por cargo
- Cada toggle controla uma chave `system_config` (salva junto com `saveGlobalConfig`)
- Layout: dois grupos (Admin Master / Revendedor), cada um com toggles para Depósitos, Recargas e Novos Cadastros

**2. `src/hooks/useNotifications.ts`**
- Receber parâmetro opcional `notifConfig` com as flags de quais toasts/sons/notificações exibir
- Condicionar chamadas de `appToast.*`, `showSystemNotification` e sons às flags ativas
- Sons (`playCashRegisterSound`, `playWebSignupSound`, `playTelegramSignupSound`) continuam tocando sempre — apenas toasts e notificações nativas são condicionados à config

**3. `src/components/NotificationBell.tsx`**
- Carregar as configs `notif_admin_*` do `system_config` e passar para `useNotifications`

**4. `src/hooks/useBackgroundPaymentMonitor.ts`**
- Adicionar parâmetro `showToast?: boolean` (default `true`)
- Adicionar `playCashRegisterSound()` sempre que depósito for confirmado (som para todos)
- Condicionar o toast à flag `showToast`

**5. `src/pages/AdminDashboard.tsx`**
- Carregar config `notif_admin_deposit` e passar para `useBackgroundPaymentMonitor` como `showToast`

**6. `src/pages/RevendedorPainel.tsx`**
- Carregar config `notif_revendedor_deposit` e passar para `useBackgroundPaymentMonitor` como `showToast`

### UI dos Toggles (Seção Geral do Principal)

```text
┌─────────────────────────────────────────┐
│ 🔔 Notificações                        │
│ Configure quais alertas cada cargo vê   │
├─────────────────────────────────────────┤
│                                         │
│ 👑 Administrador Master                 │
│ ┌─────────────────────────────────┐     │
│ │ 💰 Depósitos confirmados  [ON]  │     │
│ │ 📱 Recargas processadas  [ON]  │     │
│ │ 🆕 Novos cadastros       [ON]  │     │
│ └─────────────────────────────────┘     │
│                                         │
│ 🏪 Revendedor                           │
│ ┌─────────────────────────────────┐     │
│ │ 💰 Depósitos confirmados  [OFF] │     │
│ │ 📱 Recargas processadas  [OFF] │     │
│ └─────────────────────────────────┘     │
│                                         │
│ ℹ️ Sons funcionam para todos.           │
│    Toggles controlam toasts e alertas.  │
└─────────────────────────────────────────┘
```

### Fluxo de dados

1. Admin configura toggles → salva em `system_config`
2. `NotificationBell` (admin) lê `notif_admin_*` → passa para `useNotifications` → condiciona toasts
3. `useBackgroundPaymentMonitor` lê config do cargo → condiciona toast, sempre toca som
4. Sons (`pix.mp3`, chimes) tocam independentemente dos toggles

