

# Corrigir ReinstallBanner: Mostrar apenas no iOS

## Problema
O banner de reinstalação aparece para todos os usuários em modo standalone, mas no Android/Chrome o nome/ícone do PWA atualiza automaticamente via WebAPK. Só o iOS precisa do aviso manual.

## Alteração

### `src/components/ReinstallBanner.tsx`
- No `useEffect`, adicionar verificação: se **não** for iOS, retornar sem mostrar o banner
- Manter toda a lógica atual, apenas filtrar para exibir somente em dispositivos iOS

```tsx
useEffect(() => {
  const isStandalone = ...;
  if (!isStandalone) return;
  
  // Android auto-updates via WebAPK — only iOS needs this
  if (!isIOS) return;
  
  const dismissed = localStorage.getItem(DISMISS_KEY);
  if (dismissed === CURRENT_APP_VERSION) return;
  setShow(true);
}, []);
```

- Remover a lógica condicional de texto/botão para Android (só iOS será exibido)
- Simplificar as mensagens para focar no fluxo iOS

