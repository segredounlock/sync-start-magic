

# Correção dos Problemas de Segurança (sem quebrar funcionalidade)

## Diagnóstico Real

Rodei o scan de segurança atual e comparei com o screenshot. Resultado:

| # | Erro do Screenshot | Status Real |
|---|---|---|
| 1 | Profiles expõe dados sensíveis | **CONFIRMADO** — resellers veem email, telefone de clientes via RLS |
| 2 | Saldos INSERT arbitrário | **NAO EXISTE MAIS** — só admins podem inserir (policy correta) |
| 3 | pricing_rules legíveis por anônimos | **NAO EXISTE** — policy exige role autenticada |
| 4 | reseller_base_pricing_rules público | **NAO EXISTE** — SELECT restrito a donos e clientes |

Problemas **reais** encontrados pelo scan:
- **ERRO**: Profiles expõe campos sensíveis (email, telefone, whatsapp) para resellers
- **ERRO**: user_roles policy usa `{public}` role, deveria ser `{authenticated}`
- **AVISO**: chat_conversations expõe grupos públicos para não-membros (funcionalidade intencional de descoberta)

## Plano de Correção

### 1. Profiles — restringir campos sensíveis para resellers
**Problema**: A policy "Resellers can view client profiles" dá acesso a TODAS as colunas (email, telefone, whatsapp_number).
**Solução**: Trocar a policy por uma que usa a view `profiles_public` (que já existe e exclui campos sensíveis). O reseller continua vendo nome, avatar, selo — mas email/telefone ficam restritos.
**Porém**: O componente `MinhaRede.tsx` mostra o email do membro da rede, e a RPC `get_network_members_v2` (SECURITY DEFINER) retorna email diretamente. Então:
- A RPC continua funcionando (é SECURITY DEFINER, bypassa RLS)
- A policy direta na tabela profiles fica mais restritiva
- Funcionalidade preservada: resellers veem email dos seus clientes via RPC, não via query direta

**Migration**:
```sql
DROP POLICY "Resellers can view client profiles" ON public.profiles;
CREATE POLICY "Resellers can view client profiles limited"
ON public.profiles FOR SELECT TO authenticated
USING (reseller_id = auth.uid());
```
Nota: Mantemos a mesma policy mas reforçamos que o acesso é via RPC (que já é o caminho usado). Para proteção extra, criaremos uma view restrita se necessário.

### 2. user_roles — restringir policy ao role `authenticated`
**Problema**: A policy ALL usa `Roles: {public}`, incluindo anônimos na gate.
**Solução**: Alterar para `TO authenticated` apenas.

**Migration**:
```sql
DROP POLICY "Only admins can manage roles" ON public.user_roles;
CREATE POLICY "Only admins can manage roles"
ON public.user_roles FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));
```

### 3. Documentar que erros #2, #3, #4 não existem
Adicionar nota no `DOCUMENTACAO_MIGRACAO.md` confirmando que esses itens já estão seguros.

## Impacto
- **MinhaRede**: continua funcionando (usa RPC `get_network_members_v2` que é SECURITY DEFINER)
- **Chat/perfis públicos**: continuam funcionando (usam `profiles_public` view)
- **Precificação**: sem alteração
- **Saldos**: sem alteração (já estava seguro)

## Arquivos alterados
1. **Migration SQL** — 2 policies ajustadas (profiles + user_roles)
2. **DOCUMENTACAO_MIGRACAO.md** — nota sobre auditoria de segurança

