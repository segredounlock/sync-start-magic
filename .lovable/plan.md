

## Problema
O admin define preços personalizados no Painel Principal, mas o usuário pode sobrescrever esses preços no "Meus Preços" — não há distinção entre regra definida pelo admin e regra definida pelo próprio usuário.

## Solução

### 1. Migração: Adicionar coluna `set_by_admin` na tabela `reseller_pricing_rules`
```sql
ALTER TABLE reseller_pricing_rules 
  ADD COLUMN set_by_admin boolean NOT NULL DEFAULT false;
```
Marcar as regras existentes dos 3 usuários como `set_by_admin = true` (já que foram definidas pelo admin).

### 2. Atualizar Principal.tsx
Quando o admin salvar um preço personalizado via `saveResellerPricingRule`, incluir `set_by_admin: true` no upsert.

### 3. Atualizar MeusPrecos.tsx
- Carregar a flag `set_by_admin` junto com as regras
- Quando `set_by_admin = true`: exibir o preço como **bloqueado** (ícone de cadeado, campo desabilitado, tooltip "Preço definido pelo administrador")
- Impedir que o usuário edite ou resete regras marcadas como `set_by_admin`
- O usuário ainda pode configurar preços para valores que **não** têm regra do admin

### 4. Atualizar Edge Function recarga-express
Nenhuma mudança necessária — a lógica já lê `regra_valor` da `reseller_pricing_rules`. A flag `set_by_admin` é apenas para controle de UI.

### Arquivos alterados
- **Migração SQL**: adicionar coluna + atualizar regras existentes
- `src/pages/Principal.tsx`: adicionar `set_by_admin: true` no upsert
- `src/components/MeusPrecos.tsx`: bloquear edição de regras do admin

