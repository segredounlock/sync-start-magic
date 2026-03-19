# Plano: Separar acesso por cargo (Revendedor vs Usuário)

## Situacao Atual

- Rota `/admin` aceita roles `admin` e `revendedor` — revendedores ja acessam o painel admin com bot, clientes, loja, etc.
- No `/painel` (RevendedorPainel), os menus "Meus Precos" e "Minha Rede" aparecem para todos quando `salesToolsEnabled` esta ativo, independente do cargo.
- O campo de bot token aparece nas Configuracoes do `/painel` para todos os usuarios.
- Usuarios com cargo `usuario` nao tem acesso ao `/admin` mas veem ferramentas de venda no `/painel`.

## O Que Vai Mudar

### 1. Restringir bot e ferramentas avancadas ao cargo `revendedor`

**Arquivo:** `src/pages/RevendedorPainel.tsx`

- O campo de **bot token** nas Configuracoes (tab "contatos") so aparece se `role === "admin" || role === "revendedor"`.
- A **Taxa de Deposito da Rede** (ResellerFeeConfig) ja esta corretamente restrita — manter.
- Os menus **"Meus Precos"** continuam restritos a revendedores (ja funciona via salesMenuItems com role check).
- **"Minha Rede"** passa a estar disponivel para `usuario` tambem (para ver indicacoes), mas sem funcoes de gestao como promover/rebaixar.

### 2. Separar visibilidade no menu lateral do `/painel`

**Arquivo:** `src/pages/RevendedorPainel.tsx`

- `salesMenuItems` atualmente exige `role === "admin" || salesToolsEnabled`. Alterar para:
  - **Meus Precos**: so `admin` ou `revendedor`
  - **Minha Rede**: visivel para todos (usuario tambem pode ver sua rede de indicacoes)

### 3. Acesso ao `/admin` — manter apenas admin e revendedor

**Arquivo:** `src/AppRoot.tsx`

- Ja esta correto: `allowedRoles={["admin", "revendedor"]}`. Sem alteracao necessaria.
- Usuarios comuns (`usuario`) continuam sendo redirecionados para `/painel`.

### 4. Bot proprio — so para revendedores no `/admin`

**Arquivo:** `src/pages/AdminDashboard.tsx`

- O menu "Bot" ja aparece para revendedores (nao e `adminOnly`). Manter como esta — so revendedores e admins acessam `/admin`.

## Resumo das Alteracoes


| Recurso                    | Usuario         | Revendedor      | Admin           |
| -------------------------- | --------------- | --------------- | --------------- |
| Minha Rede                 | Gestao completa | Gestao completa | Gestao completa |
| Meus Precos                | Sim             | Sim             | Sim             |
| Bot proprio                | Nao             | Sim (/admin)    | Sim             |
| Painel Admin (/admin)      | Nao             | Sim             | Sim             |
| Taxa Deposito Rede         | Sim             | Sim             | Sim             |
| Bot token em Configuracoes | Nao             | Sim             | Sim             |


## Arquivos Modificados

1. `**src/pages/RevendedorPainel.tsx**` — Ajustar `salesMenuItems` para separar "Meus Precos" (so revendedor) de "Minha Rede" (todos); esconder bot token para usuarios comuns.