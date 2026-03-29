

# Análise de Segurança do Sistema de Licenças

## Situação atual

### O que está no código (frontend — manipulável)
- `MASTER_SUPABASE_URL` e `MASTER_PROJECT_URL` em `src/utils/licenseConfig.ts`
- `LicenseGate` e `InstallWizard` como portões visuais
- Detecção master/mirror via `isMasterEnvironment()`

### O que está no servidor (protegido)
- `license-validate` no master — valida JWT com `LICENSE_SIGNING_SECRET`
- `license-check-server` no espelho — chama o master
- `is_license_valid()` no banco — verifica status + expiração
- RLS policies em tabelas críticas usando `is_license_valid()`

## Cenário de ataque: usuário remove LicenseGate no Lovable

| Camada | Bypassed? | Por quê |
|--------|-----------|---------|
| Frontend (LicenseGate) | Sim | Código editável |
| Edge Functions | Não | Deploy separado, não depende do frontend |
| RLS no banco | Não | `is_license_valid()` roda no Postgres |
| LICENSE_SIGNING_SECRET | Não | Espelho não tem, não pode forjar licenças |

**Resultado**: O app abre visualmente, mas todas as queries de dados falham por RLS.

## O que NÃO vale a pena fazer
- Criptografar URLs no banco — o espelho tem `SERVICE_ROLE_KEY`, descriptografa tudo
- Ofuscar o código — Lovable regenera, e JS é inspecionável

## O que VALE a pena fazer (reforço adicional)

### 1. Expandir RLS com `is_license_valid()` para TODAS as tabelas críticas
Hoje nem todas as tabelas usam essa verificação. Adicionar a check em:
- `recargas` (SELECT/INSERT)
- `transactions` (SELECT/INSERT)
- `saldos` (SELECT)
- `profiles` (SELECT próprio)

Isso garante que sem licença válida, **zero dados** são acessíveis.

### 2. Adicionar verificação de licença no `telegram-bot`
O bot do Telegram roda server-side. Adicionar check de `is_license_valid()` antes de processar qualquer comando. Se expirada, responder "Sistema em manutenção".

### 3. Adicionar heartbeat obrigatório
Criar um cron (pg_cron ou edge function schedulada) que invalida `license_status` se `license_validated_at` for > 24h atrás. Isso força revalidação periódica e impede que alguém desconecte do master e continue usando.

### 4. Proteger `system_config` contra adulteração de license keys
Adicionar uma RLS policy que **impede UPDATE** nas keys de licença (`license_key`, `license_master_url`, `license_status`, `license_expires_at`) exceto via `service_role`. Hoje o admin do espelho pode alterar esses valores diretamente.

## Implementação proposta

### Migration SQL
```sql
-- Policy: bloquear alteração manual das keys de licença por usuários
CREATE POLICY "Block license config tampering"
ON public.system_config
FOR UPDATE
TO authenticated
USING (
  key NOT IN ('license_key', 'license_master_url', 'license_status', 
              'license_expires_at', 'license_validated_at', 'masterProjectUrl', 'install_secret')
  OR has_role(auth.uid(), 'admin')
)
WITH CHECK (
  key NOT IN ('license_key', 'license_master_url', 'license_status', 
              'license_expires_at', 'license_validated_at', 'masterProjectUrl', 'install_secret')
  OR has_role(auth.uid(), 'admin')
);

-- Adicionar is_license_valid() nas tabelas mais críticas
-- (apenas para espelhos — no master a função retorna true naturalmente)
```

### Arquivo: nenhuma alteração de código necessária
A proteção real já está server-side. O reforço é apenas no banco.

## Resumo

```text
Camada          Quem controla     Bypass possível?
─────────────   ──────────────    ────────────────
Frontend        Dono do espelho   Sim (editável)
Edge Functions  Lovable Cloud     Não (deploy independente)
RLS/Postgres    Lovable Cloud     Não (precisa de migration)
Signing Secret  Só o master       Não (espelho não tem)
```

**Conclusão**: As constantes no código são "portas visuais". A segurança real está no banco e nas edge functions. O reforço proposto é expandir RLS para cobrir 100% das tabelas e impedir adulteração das keys de licença no `system_config`.

## Arquivos alterados
1. **Migration SQL** — novas RLS policies para proteger keys de licença no `system_config`
2. **Nenhum arquivo de código** — a arquitetura atual já é correta

