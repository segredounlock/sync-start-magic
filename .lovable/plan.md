

# Corrigir PIN disparando indevidamente + Permissão de câmera repetida

## Problema 1: PIN dispara quando outro usuário entra/sai
O `PinProtection` observa `user?.id` e re-bloqueia quando muda. Como o PIN está em `system_config` (tabela compartilhada), qualquer mudança de sessão (inclusive de outro usuário) faz o PIN ser reexigido. Além disso, o realtime do `useAuth` pode emitir múltiplos eventos de `onAuthStateChange`, causando falsos disparos.

**Correção**: Só re-bloquear quando o usuário efetivamente **troca** (ID diferente não-nulo → outro ID não-nulo), não quando o auth emite eventos intermediários (ex: token refresh). Ignorar transições `null → user` (login inicial — nesse caso, verificar sessão normalmente sem forçar re-lock).

### `src/components/PinProtection.tsx`
- Mudar lógica do `useEffect([user?.id])`:
  - Se `prevUserId` era um ID válido **e** o novo ID é **diferente e também válido** → re-lock (troca de conta)
  - Se `prevUserId` era `null` e agora tem user → primeiro login, checar PIN normalmente sem forçar clear
  - Se user ficou `null` → logout, limpar sessão
  - Ignorar quando `prevUserId === newUserId` (token refresh)

## Problema 2: Câmera pedindo permissão toda hora
A função `captureLoginSelfie()` chama `getUserMedia` sem verificar se a permissão já foi negada ou concedida. Isso causa o prompt de permissão repetidamente.

**Correção**: Usar `navigator.permissions.query({ name: "camera" })` antes de chamar `getUserMedia`. Se o estado for `"denied"`, retornar `null` imediatamente sem pedir. Se for `"granted"`, prosseguir. Se for `"prompt"`, verificar se o usuário já negou anteriormente (flag em `localStorage`).

### `src/lib/deviceFingerprint.ts` — função `captureLoginSelfie`
- No início, checar `navigator.permissions.query({ name: "camera" })`:
  - `"denied"` → retorna `null` sem prompt
  - `"granted"` → prossegue normalmente
  - `"prompt"` → checar `localStorage.getItem("selfie_camera_declined")`. Se existir, retorna `null`
- No `catch` do `getUserMedia`, setar `localStorage.setItem("selfie_camera_declined", "1")` para não pedir de novo na sessão

## Arquivos alterados
1. `src/components/PinProtection.tsx` — lógica de detecção de troca de usuário
2. `src/lib/deviceFingerprint.ts` — checar permissão antes de pedir câmera

