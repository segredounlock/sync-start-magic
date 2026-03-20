# 🔐 Sistema de Autenticação

## Hierarquia de Roles

```
admin (master) → acesso total ao sistema
  ├── Painel Principal (/principal) com PIN de proteção
  ├── Painel Admin (/admin) — gestão completa
  ├── Gerencia todos os usuários, saldos, preços
  ├── Configura sistema, gateways, bot
  └── Backup, restore, auditoria

usuario → todos os demais usuários
  ├── Painel (/painel) — acesso padrão
  ├── Realiza recargas
  ├── Deposita saldo via PIX
  ├── Gerencia rede de indicações
  ├── Define preços personalizados (rede)
  └── Visualiza histórico e comissões
```

> **Nota:** O cargo `revendedor` foi eliminado. Todos os usuários possuem o cargo `usuario` por padrão, preservando acesso a funções de rede e precificação personalizada. O acesso administrativo (/admin) é restrito ao cargo `admin`.

## Tabela `user_roles`

```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role TEXT NOT NULL, -- 'admin', 'usuario'
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);
```

## Função de Verificação de Role

```sql
-- SECURITY DEFINER para evitar recursão em RLS
CREATE FUNCTION has_role(_user_id UUID, _role TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

## Trigger de Criação Automática

Quando um novo usuário se cadastra via `auth.users`, o trigger `handle_new_user` executa:

1. **Cria perfil** em `profiles` (nome, email, slug, reseller_id)
2. **Cria 2 saldos** em `saldos` (revenda=0, pessoal=0)
3. **Atribui role** `usuario` em `user_roles`
4. **Gera slug** único via `generate_unique_slug()`
5. **Gera código** de indicação via `generate_referral_code()`

## Fluxo de Login

```
1. Usuário entra email/senha → supabase.auth.signInWithPassword()
2. Supabase valida credenciais → retorna JWT
3. Frontend consulta role via user_roles → determina painel
4. ProtectedRoute verifica:
   - Sessão ativa? → senão redireciona para /login
   - Role compatível? → senão redireciona para /painel
   - Conta ativa? → senão mostra mensagem de bloqueio
```

## Fluxo de Recuperação de Senha

```
1. Usuário clica "Esqueci minha senha" → supabase.auth.resetPasswordForEmail()
2. E-mail com link de recuperação é enviado (template recovery.tsx)
3. Link redireciona para /reset-password com hash type=recovery
4. Página ResetPassword.tsx detecta sessão de recuperação:
   a. Verifica hash URL para "type=recovery"
   b. Escuta evento PASSWORD_RECOVERY do onAuthStateChange
   c. Verifica sessão ativa (hash já consumido pelo Supabase)
   d. Estado "loading" com timeout de 3s antes de exibir "inválido"
5. Usuário define nova senha → supabase.auth.updateUser({ password })
6. Redirecionado para /login após sucesso
```

> **Fix aplicado:** A página agora aguarda o Supabase processar o link antes de decidir se é válido. Anteriormente, exibia "link inválido" instantaneamente porque o hash já havia sido consumido pelo Supabase antes do componente verificar.

## Proteções de Segurança

| Proteção | Descrição |
|----------|-----------|
| **PIN Master** | Painel Principal requer PIN (config: `masterPin`) |
| **Inatividade** | Logout automático após inatividade |
| **Fingerprint** | Coleta dados do dispositivo no login |
| **Banimento** | Ban por fingerprint/IP |
| **Login Attempts** | Registro de tentativas de login |
| **Session Guard** | Proteção multi-tab + interceptor 401 |
| **VAPID Push** | Push notifications web |
| **Senha Forte** | Mín. 8 chars, maiúscula, número, especial, sem senhas comuns |

## Email Templates (6 templates)

| Template | Descrição |
|----------|-----------|
| `signup.tsx` | Confirmação de cadastro |
| `recovery.tsx` | Recuperação de senha |
| `magic-link.tsx` | Link mágico de login |
| `invite.tsx` | Convite de usuário |
| `email-change.tsx` | Mudança de email |
| `reauthentication.tsx` | Reautenticação (OTP) |

Todos os templates utilizam identidade visual do Recargas Brasil (Verde #1D9E5E) com logo no bucket `email-assets`. Domínio verificado: `notify.recargasbrasill.com`.
