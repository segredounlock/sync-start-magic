

# Melhorias de Segurança — Cadastro, Login e Senha

## O que já temos implementado ✓
- Fingerprint de dispositivo (canvas, WebGL, hardware)
- Banimento por fingerprint e IP
- Bloqueio após 5 tentativas falhas (cooldown 60s)
- Coleta silenciosa de fingerprint para usuários existentes
- PIN de proteção no painel admin
- Validação de e-mail com regex
- Tradução de erros de autenticação
- Controle de código de referência obrigatório

## Melhorias propostas

### 1. Senha forte obrigatória
Atualmente a senha exige apenas 6 caracteres. Adicionar validação que exige:
- Mínimo 8 caracteres
- Pelo menos 1 letra maiúscula
- Pelo menos 1 número
- Pelo menos 1 caractere especial (!@#$%...)
- Indicador visual de força da senha (fraca/média/forte) no cadastro

**Arquivos**: `src/pages/Auth.tsx`, `src/pages/ResetPassword.tsx`, `supabase/functions/client-register/index.ts`, `supabase/functions/admin-reset-password/index.ts`

### 2. Rate limiting persistente no servidor
O bloqueio atual é apenas client-side (resetado ao recarregar página). Criar tabela `login_attempts` e edge function que:
- Registra cada tentativa falha com IP e timestamp
- Bloqueia IP/email após 5 falhas em 15 minutos
- Desbloqueio automático após o período
- Admin pode ver tentativas suspeitas no painel Antifraude

**Arquivos**: migração SQL nova, `supabase/functions/check-device/index.ts` (extender), `src/components/AntifraudSection.tsx`

### 3. Verificação de e-mail obrigatória antes do login
Atualmente `email_confirm: true` é usado apenas no `client-register`. No signup padrão via Auth page, o usuário entra direto sem confirmar e-mail. Forçar confirmação impedindo login até e-mail verificado.

**Arquivos**: `src/pages/Auth.tsx` (verificar `email_confirmed_at`), configuração de auth

### 4. Detecção de login em novo dispositivo
Quando um usuário loga de um dispositivo diferente (fingerprint_hash novo), registrar alerta no painel Antifraude e opcionalmente notificar o admin.

**Arquivos**: `supabase/functions/check-device/index.ts`, `src/components/AntifraudSection.tsx`

### 5. Expiração de sessão automática
Adicionar timeout de inatividade (ex: 30 min sem interação) que desloga o usuário automaticamente, protegendo contra sessões abertas em dispositivos compartilhados.

**Arquivos**: `src/AppRoot.tsx` (listener de atividade)

### 6. Bloqueio de senhas comuns
Lista de senhas proibidas (123456, password, qwerty, etc.) verificada tanto no client quanto no servidor.

**Arquivos**: `src/pages/Auth.tsx`, `src/pages/ResetPassword.tsx`, edge functions de criação de usuário

## Resumo de impacto
- **6 melhorias** de segurança
- Nenhuma alteração no design existente
- Proteção em múltiplas camadas (client + servidor)
- Todas retrocompatíveis com usuários existentes

