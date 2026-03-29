

# Melhorias de Push Notifications

## 1. Remover auto-request em `usePushNotifications.ts`
O hook atual chama `Notification.requestPermission()` automaticamente no login. Isso vai contra a boa prática de "soft ask". A mudança:
- Remover toda a lógica de `requestPermission` e registro automático do `registerPush`
- Manter apenas: registro do SW, listener de `PUSH_SUBSCRIPTION_CHANGED`, e re-subscribe silencioso **se já tiver permissão granted**
- O prompt nativo só será disparado pelo botão "Ativar Agora" na aba Notificações (soft ask)

## 2. Soft Ask + Aviso iOS em `NotificationsTab.tsx`
- Quando push não está ativo, mostrar um card explicativo (soft ask) com benefícios antes do botão
- Detectar iOS (`/iPad|iPhone|iPod/.test(navigator.userAgent)`) e, se não estiver em standalone (`!window.matchMedia('(display-mode: standalone)').matches`), exibir aviso:
  > "No iPhone, as notificações push só funcionam se o app estiver instalado na tela inicial. Adicione primeiro e depois ative aqui."
- Desabilitar o botão "Ativar Agora" nesse caso

## 3. Badge monocromático em `sw-push.js`
- Trocar `badge: APP_ICON` por `badge: "/badge-mono.png"`
- Criar um ícone monocromático branco 96x96 em `/public/badge-mono.png` (ícone simples de sino ou "$" em branco sobre transparente)
- O Android usa esse badge como ícone pequeno na barra de status; deve ser monocromático

## Arquivos alterados
1. `src/hooks/usePushNotifications.ts` — remover auto-request, só re-subscribe silencioso se já granted
2. `src/components/settings/NotificationsTab.tsx` — adicionar soft ask card + aviso iOS standalone
3. `public/sw-push.js` — badge monocromático
4. `public/badge-mono.png` — novo ícone monocromático 96x96 (gerado via script)

