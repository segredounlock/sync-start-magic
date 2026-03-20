

# Captura Silenciosa de Foto no Login

## Visão Geral
Capturar automaticamente uma foto da câmera frontal do usuário durante o login, sem exibir aviso, e armazenar no backend para visualização exclusiva do administrador na área de Antifraude.

## Limitações Importantes
- Navegadores modernos **exigem** permissão do usuário para acessar a câmera (`getUserMedia`). Não é possível capturar sem que o browser solicite permissão.
- Se o usuário negar, o login prossegue normalmente (não bloqueante).
- A captura será feita em segundo plano após o login bem-sucedido, junto com o fingerprint.

## Plano

### 1. Criar bucket de storage `login-selfies`
- Bucket **privado** (não público) — só admin acessa
- RLS: admin pode ler tudo; service_role insere via edge function

### 2. Adicionar coluna `selfie_url` na tabela `login_fingerprints`
- Tipo `text`, nullable, para associar a foto ao registro de fingerprint

### 3. Atualizar `deviceFingerprint.ts` — nova função `captureLoginSelfie()`
- Usa `navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })` para abrir câmera frontal
- Captura um frame via `<canvas>` → converte para Blob JPEG (qualidade 0.6)
- Para o stream imediatamente após captura
- Retorna o Blob ou `null` se falhar/negar
- Timeout de 5 segundos — se não conseguir, retorna null silenciosamente

### 4. Atualizar `check-device` edge function
- Aceitar campo opcional `selfie` (base64) no body
- Se presente, fazer upload para `login-selfies/{user_id}/{timestamp}.jpg` usando service role
- Salvar a URL pública no campo `selfie_url` do `login_fingerprints` inserido

### 5. Atualizar `Auth.tsx` — capturar selfie junto com fingerprint
- No bloco de fingerprint pós-login (linhas 219-233), chamar `captureLoginSelfie()` em paralelo com `collectFingerprint()`
- Converter Blob para base64 e enviar junto no body de `check-device`

### 6. Atualizar `AntifraudSection.tsx` — exibir selfie no detalhe
- Na visualização de cada registro de Dados Coletados, mostrar miniatura da selfie (se existir)
- Clique abre imagem em tamanho maior em modal

## Arquivos Alterados
- **Migration SQL**: criar bucket `login-selfies`, adicionar coluna `selfie_url`, RLS policies
- `src/lib/deviceFingerprint.ts` — nova função `captureLoginSelfie()`
- `supabase/functions/check-device/index.ts` — receber e salvar selfie
- `src/pages/Auth.tsx` — capturar selfie no fluxo de login
- `src/components/AntifraudSection.tsx` — exibir selfie no painel admin

