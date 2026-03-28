

# Sistema de Licenciamento para Espelhos

## O que é
Um sistema onde cada espelho do seu projeto só funciona se tiver uma **licença válida** gerada por você no servidor principal. Sem licença ativa, o espelho mostra uma tela de "Licença expirada/inválida" e bloqueia o uso.

## Como funciona (visão simples)

```text
┌──────────────────┐                          ┌──────────────────┐
│  SEU SERVIDOR    │   Gera licença (chave)   │   ESPELHO (X)    │
│  (Principal)     │ ──────────────────────►   │                  │
│                  │                           │  Salva a chave   │
│  Painel de       │   Valida a cada 6h       │  no system_config│
│  Licenças        │ ◄─────────────────────    │                  │
│                  │   ✅ ou ❌               │  Se inválida:    │
│  Pode revogar    │                           │  BLOQUEIA TUDO   │
│  a qualquer hora │                           │                  │
└──────────────────┘                           └──────────────────┘
```

1. Você gera uma **chave de licença** no seu painel `/principal`
2. A chave contém: ID do espelho, data de expiração, domínio permitido
3. A chave é **assinada digitalmente** (JWT com secret só seu) — impossível falsificar
4. O espelho salva a chave e a cada 6 horas chama seu servidor para validar
5. Se a licença expirou, foi revogada ou o domínio não bate → **tela de bloqueio**

## Segurança máxima
- **Assinatura JWT** — a licença é um token assinado com um secret que só existe no seu servidor
- **Validação server-side** — o espelho chama uma edge function no SEU backend para confirmar
- **Heartbeat periódico** — mesmo que a chave local pareça válida, o espelho confirma remotamente
- **Domínio travado** — a licença só funciona no domínio autorizado
- **Revogação instantânea** — você revoga no painel e na próxima verificação o espelho para

---

## Implementação técnica

### 1. Nova tabela `licenses` (no SEU servidor principal)

```sql
CREATE TABLE public.licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  license_key text UNIQUE NOT NULL,        -- JWT assinado
  mirror_name text NOT NULL,               -- Nome do cliente/espelho
  mirror_domain text,                      -- Domínio autorizado
  expires_at timestamptz NOT NULL,          -- Data de expiração
  is_active boolean DEFAULT true,           -- Pode revogar
  max_users integer DEFAULT 100,            -- Limite de usuários
  features jsonb DEFAULT '["all"]',         -- Features permitidas
  last_heartbeat_at timestamptz,            -- Último ping do espelho
  created_by uuid NOT NULL,                 -- Admin que criou
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 2. Edge Function `license-generate` (no servidor principal)
- Recebe: nome do espelho, domínio, data de expiração, features
- Gera um JWT assinado com HMAC-SHA256 usando um secret exclusivo
- Salva na tabela `licenses`
- Retorna a chave para você copiar e enviar ao espelho

### 3. Edge Function `license-validate` (no servidor principal, pública)
- Recebe: license_key + domínio do chamador
- Verifica assinatura JWT, expiração, domínio, se está ativa
- Retorna: `{ valid: true, expires_at, features, max_users }` ou `{ valid: false, reason }`
- Atualiza `last_heartbeat_at`

### 4. Componente `LicenseGate` (no código compartilhado — vai pro espelho via sync)
- No boot da aplicação, antes de renderizar qualquer rota
- Verifica a chave salva em `system_config` (key: `license_key`)
- Chama a edge function de validação no servidor principal
- Se inválida → mostra tela de bloqueio com instruções
- Se válida → renderiza o app normalmente
- Cache de 6 horas para não sobrecarregar

### 5. Painel de Gestão de Licenças (na página `/principal`)
- Listar todas as licenças
- Criar nova licença (nome, domínio, expiração, features)
- Revogar/reativar licença
- Ver último heartbeat de cada espelho
- Indicador visual: ativo, expirado, sem heartbeat

### 6. Configuração no espelho
- O admin do espelho cola a chave na tela de configuração
- A chave é salva em `system_config` com key `license_key`
- O `LicenseGate` faz o resto automaticamente

---

## Arquivos a criar/alterar

| Arquivo | Ação |
|---------|------|
| **Migration SQL** | Criar tabela `licenses` + RLS (só admin) |
| `supabase/functions/license-generate/index.ts` | Nova edge function — gera licenças JWT |
| `supabase/functions/license-validate/index.ts` | Nova edge function — valida licenças (pública) |
| `src/components/LicenseGate.tsx` | Novo — wrapper que bloqueia app sem licença válida |
| `src/components/LicenseManager.tsx` | Novo — painel de gestão de licenças no /principal |
| `src/pages/Principal.tsx` | Adicionar aba/seção de Licenças |
| `src/AppRoot.tsx` | Envolver rotas com `LicenseGate` |
| **Secret** | `LICENSE_SIGNING_SECRET` — chave HMAC para assinar licenças |

## Lógica de bypass no servidor principal
O `LicenseGate` detecta automaticamente se está no servidor principal (comparando `masterAdminId` ou domínio de origem) e pula a validação — o servidor principal nunca se bloqueia.

## Impacto
- Espelhos sem licença ficam completamente bloqueados
- Servidor principal continua funcionando normalmente
- Você tem controle total sobre quem usa seu sistema

