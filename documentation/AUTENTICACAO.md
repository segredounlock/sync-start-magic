# 🔐 Sistema de Autenticação

## Hierarquia de Roles

```
admin master → acesso TOTAL e irrevogável ao sistema
  ├── Painel Principal (/principal) com PIN de proteção + MasterOnlyRoute
  ├── Único que pode acessar /principal
  ├── Gerencia todos os admins, usuários, saldos, preços
  ├── Configura sistema, gateways, bot
  ├── Backup, restore, auditoria
  ├── Não pode ter seu cargo removido por nenhum outro admin
  └── Definido automaticamente: primeiro usuário do sistema

admin → acesso administrativo parcial
  ├── Painel Admin (/admin) — gestão de usuários e recargas
  ├── NÃO tem acesso ao /principal (apenas admin master)
  ├── Pode receber permissão `allowPrincipal` para acesso ao /principal
  └── Pode ser promovido/rebaixado pelo admin master

revendedor → usuário com acesso a ferramentas de rede
  ├── Acesso a "Meus Preços", "Minha Rede", "Minha Loja"
  ├── Pode definir preços personalizados para seus clientes
  ├── Pode gerenciar sua rede de indicações
  ├── Atribuído automaticamente a usuários SEM vínculo de rede (reseller_id = NULL)
  └── Usuários COM indicação (reseller_id preenchido) NÃO recebem este cargo

suporte → agente de suporte
  ├── Acesso a tickets de suporte
  ├── Pode responder mensagens de suporte
  └── Não tem acesso ao painel admin

usuario → todos os usuários
  ├── Cargo base atribuído a todos
  ├── Painel (/painel) — acesso padrão
  ├── Realiza recargas
  ├── Deposita saldo via PIX
  └── Visualiza histórico e comissões
```

> **Nota:** O cargo `revendedor` é atribuído automaticamente a novos usuários que se cadastram **sem** código de indicação (sem `reseller_id`). Usuários que entram via link de indicação recebem apenas `usuario`, ficando vinculados à rede do revendedor que os indicou.

## Admin Master

### Conceito
O **Admin Master** é o usuário supremo do sistema. Ele tem acesso total e irrestrito, e nenhum outro admin pode remover seu cargo.

### Implementação

1. **`masterAdminId` em `system_config`** — Armazena o UUID do admin master
2. **`MasterOnlyRoute.tsx`** — Componente que protege `/principal`, verificando se `user.id === masterAdminId`
3. **Auto-promoção do primeiro usuário** — O trigger `handle_new_user` verifica se existe algum admin no sistema:
   - Se **não existe nenhum admin**: o primeiro usuário recebe `admin` + `usuario` + `revendedor` e é salvo como `masterAdminId`
   - Se **já existe admin e sem vínculo**: o novo usuário recebe `usuario` + `revendedor`
   - Se **já existe admin e com vínculo**: o novo usuário recebe apenas `usuario`

### Fluxo de Verificação (`MasterOnlyRoute.tsx`)
```
1. Busca masterAdminId em system_config
2. Verifica se user.id === masterAdminId
3. Se sim → renderiza children (acesso ao /principal)
4. Se não → redireciona para /painel
```

### Proteção de Cargo
Na interface de gestão de usuários (Painel Principal):
- Ao atribuir cargo `admin`, aparece sub-menu perguntando se é "Admin com acesso ao Principal" ou "Admin comum"
- O admin master **nunca** aparece na lista de remoção de cargos
- Apenas o admin master pode promover outros admins

## Tabela `user_roles`

```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role TEXT NOT NULL, -- 'admin', 'usuario', 'revendedor', 'suporte'
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
3. **Verifica se existe admin no sistema:**
   - Se não existe → atribui `admin` + `usuario` + `revendedor` + salva como `masterAdminId`
   - Se existe e `reseller_id IS NULL` → atribui `usuario` + `revendedor`
   - Se existe e `reseller_id IS NOT NULL` → atribui apenas `usuario`
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
5. MasterOnlyRoute (para /principal):
   - user.id === masterAdminId? → senão redireciona para /painel
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

## Backup e Migração de Senhas

O sistema de backup exporta `encrypted_password` (hash bcrypt) de `auth.users` via SQL direto. Na restauração:

1. INSERT SQL direto em `auth.users` com UUID original + hash bcrypt
2. INSERT em `auth.identities` para provider email
3. Usuários migrados fazem login com a mesma senha — sem necessidade de reset

> **Requisito:** `SUPABASE_DB_URL` deve estar configurado como secret. Sem ele, fallback para Admin API (sem senhas, UUIDs novos).

## Proteções de Segurança

| Proteção | Descrição |
|----------|-----------|
| **Admin Master** | Cargo irrevogável, acesso total via MasterOnlyRoute |
| **PIN Master** | Painel Principal requer PIN (config: `masterPin`) com dígitos em blur |
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

Todos os templates utilizam identidade visual dinâmica (cor primária #1D9E5E) com logo no bucket `email-assets`. O domínio de envio e o nome do site são configuráveis via `system_config` (keys: `siteTitle`, `siteUrl`) e secret `SENDER_DOMAIN`.
