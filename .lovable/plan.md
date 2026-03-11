

## Problema

A tabela `pricing_rules` possui apenas uma política RLS para admins:
```
policy: "Admins can manage pricing rules"
qual: has_role(auth.uid(), 'admin')
```

Usuários não-admin consultam a tabela e recebem 0 linhas. O código faz fallback para `cost = valor_de_face`, exibindo "Paga R$ 20,00" em vez de "Paga R$ 12,00".

## Solução

Adicionar uma política de **leitura (SELECT)** na tabela `pricing_rules` para todos os usuários autenticados. As regras globais de preço precisam ser visíveis para que o catálogo exiba os custos corretos.

### Migration SQL

```sql
CREATE POLICY "Authenticated users can read pricing rules"
ON public.pricing_rules
FOR SELECT
TO authenticated
USING (true);
```

Isso resolve o problema em todas as plataformas que usam consulta direta ao banco (Site/RevendedorPainel). O Bot e Mini App já usam `service_role_key` nas Edge Functions, então não são afetados por RLS.

### Verificação na tabela `reseller_pricing_rules`

Verificar se a mesma restrição existe, pois o site também consulta essa tabela para preços personalizados do usuário logado.

### Impacto

- Nenhuma alteração de código necessária
- Apenas 1 migration SQL
- Todos os usuários autenticados passarão a ver os preços corretos imediatamente

