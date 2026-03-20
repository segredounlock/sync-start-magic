# 🔐 Sistema de Autenticação

## Hierarquia de Roles

```
admin (master) → acesso total ao sistema
  ├── Painel Principal (/principal) com PIN de proteção
  ├── Gerencia todos os usuários, saldos, preços
  ├── Configura sistema, gateways, bot
  └── Backup, restore, auditoria

revendedor → gerencia sua rede
  ├── Painel Revendedor (/revendedor)
  ├── Gerencia clientes vinculados
  ├── Define preços personalizados
  ├── Configura gateway próprio
  └── Visualiza comissões e relatórios

cliente → vinculado a um revendedor
  ├── Portal do Cliente (/cliente)
  ├── Realiza recargas
  ├── Deposita saldo via PIX
  └── Visualiza histórico

usuario → cadastro pendente
  └── Aguarda aprovação/ativação
```

## Tabela `user_roles`

```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role TEXT NOT NULL, -- 'admin', 'revendedor', 'cliente', 'usuario'
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
   - Sessão ativa? → senão redireciona para /auth
   - Role compatível? → senão redireciona para painel correto
   - Conta ativa? → senão mostra mensagem de bloqueio
```

## Proteções de Segurança

| Proteção | Descrição |
|----------|-----------|
| **PIN Master** | Painel Principal requer PIN (config: `masterPin`) |
| **Inatividade** | Logout automático após inatividade |
| **Fingerprint** | Coleta dados do dispositivo no login |
| **Banimento** | Ban por fingerprint/IP |
| **Login Attempts** | Registro de tentativas de login |
| **Session Guard** | Proteção multi-tab |
| **VAPID Push** | Push notifications web |

## Email Templates (6 templates)

| Template | Descrição |
|----------|-----------|
| `signup.tsx` | Confirmação de cadastro |
| `recovery.tsx` | Recuperação de senha |
| `magic-link.tsx` | Link mágico de login |
| `invite.tsx` | Convite de usuário |
| `email-change.tsx` | Mudança de email |
| `reauthentication.tsx` | Reautenticação (OTP) |
