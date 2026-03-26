import { BookOpen, Users, DollarSign, Shield, Smartphone, GitBranch, Layers, Database, Settings, Store, Gamepad2, Zap, type LucideIcon } from "lucide-react";

export interface DocSection {
  id: string;
  icon: LucideIcon;
  title: string;
  content: string;
}

export const sections: DocSection[] = [
  {
    id: "visao-geral",
    icon: BookOpen,
    title: "1. Visão Geral",
    content: `O sistema de rede de indicações permite que **qualquer usuário autenticado** construa e gerencie sua própria rede de clientes, funcionando como um micro-revendedor dentro da plataforma. O sistema opera como um **modelo multinível de 2 camadas** (direto + indireto).

### Princípios Fundamentais

- **Democrático** — Todos os cargos (incluindo usuário comum) podem gerenciar sua rede quando as ferramentas estão ativadas.
- **Isolado** — Cada gestor só vê e administra seus próprios membros — nunca os de outro.
- **Seguro** — O preço mínimo é imposto pelo administrador principal (piso obrigatório).
- **Unificado** — A mesma engine de recarga funciona em todos os canais (Painel, Bot, Mini App, Loja Pública).
- **Escalável** — Cada membro da rede pode, por sua vez, criar sua própria sub-rede, formando uma cadeia hierárquica.`,
  },
  {
    id: "hierarquia",
    icon: Layers,
    title: "2. Hierarquia de Cargos",
    content: `| Cargo | Prioridade | Acesso /admin | Ferramentas de Venda | Bot Próprio |
|-------|-----------|--------------|---------------------|------------|
| admin | 1 (mais alta) | ✅ Completo | ✅ Sempre | ✅ |
| revendedor | 2 | ✅ Completo | ✅ (via toggle) | ✅ |
| suporte | 3 | ✅ (Tickets) | ❌ | ❌ |
| cliente | 4 | ❌ | ✅ (via toggle) | ❌ |
| usuario | 5 (padrão) | ❌ | ✅ (via toggle) | ❌ |

### Regras de Cargo

- **Todo cadastro novo** recebe o cargo \`usuario\` por padrão.
- Se o cadastro vem com link de indicação (\`reseller_id\`), recebe \`cliente\`.
- O cargo \`revendedor\` **só é atribuído manualmente** por um admin ou pelo dono da rede.
- O cargo \`suporte\` dá acesso à gestão de tickets de suporte, sem acesso a ferramentas de venda.
- Um usuário pode ter **múltiplos cargos** — o sistema usa o de maior prioridade.
- A verificação de cargo utiliza a função \`has_role(_user_id, _role)\` com \`SECURITY DEFINER\` para evitar recursão de RLS.`,
  },
  {
    id: "cadastro",
    icon: Users,
    title: "3. Fluxo de Cadastro e Vinculação",
    content: `### 3.1 Cadastro Padrão (sem indicação)

\`\`\`
Usuário se cadastra → Trigger handle_new_user() →
  1. Cria profile (profiles)
  2. Cria 2 saldos (revenda + pessoal, ambos R$ 0)
  3. Atribui cargo 'usuario'
  4. Gera referral_code único (numérico)
\`\`\`

### 3.2 Cadastro via Link de Indicação

O link de indicação segue dois formatos:
- **Via referral_code:** \`https://seudominio.com/recarga?ref=123456\`
- **Via slug de loja:** \`https://seudominio.com/loja/nome-da-loja\`

\`\`\`
Usuário acessa link → Cadastra com reseller_id →
  Trigger handle_new_user() →
    1. Cria profile com reseller_id preenchido
    2. Cria 2 saldos (R$ 0)
    3. Atribui cargo 'cliente'
    4. Gera referral_code único
\`\`\`

### 3.3 Cadastro pelo Bot do Telegram

Edge Function \`client-register\`:
- Valida que o revendedor existe e tem cargo \`revendedor\` ou \`admin\`
- Verifica se o revendedor está ativo
- Cria usuário via \`auth.admin.createUser()\` com email confirmado
- Define \`reseller_id\` no profile
- Atribui cargo \`cliente\`

### 3.4 Cadastro pelo Admin

Edge Function \`admin-create-user\`: pode escolher cargo. Default: \`usuario\`.

### 3.5 Vinculação Posterior

O \`reseller_id\` no profile é protegido por RLS — o próprio usuário **não pode alterar** quem o indicou. Apenas admins podem reatribuir via update direto.`,
  },
  {
    id: "banco-dados",
    icon: Database,
    title: "4. Estrutura do Banco de Dados",
    content: `### Tabelas Principais

#### profiles
Armazena dados do usuário. Campos relevantes para rede:
- \`id\` — UUID do usuário (referência ao auth.users)
- \`reseller_id\` — UUID de quem indicou (FK para profiles.id)
- \`referral_code\` — Código numérico único de indicação
- \`slug\` — Slug da loja pública (ex: \`minha-loja\`)
- \`store_name\`, \`store_logo_url\`, \`store_primary_color\`, \`store_secondary_color\` — Personalização da loja
- \`active\` — Se o usuário está ativo
- \`verification_badge\` — Badge de verificação (moderação em chats)
- \`nome\`, \`email\`, \`avatar_url\`, \`bio\`, \`telefone\`, \`telegram_id\`, \`telegram_username\`, \`whatsapp_number\`

#### profiles_public (VIEW)
View pública que expõe apenas campos seguros (sem email, telefone, reseller_id) para uso em lojas públicas e perfis.

#### user_roles
Cargos do usuário. Constraint \`UNIQUE (user_id, role)\`. Função \`has_role()\` com \`SECURITY DEFINER\` para evitar recursão RLS.

#### saldos
Carteira dupla por usuário:
- Tipo \`revenda\` — Saldo operacional (depósitos PIX + débito de recargas)
- Tipo \`pessoal\` — Comissões recebidas (somente leitura)
- Função \`increment_saldo(p_user_id, p_tipo, p_amount)\` para operações atômicas

#### recargas
Histórico de recargas: \`telefone\`, \`operadora\`, \`valor\` (preço cobrado), \`custo\` (custo para o revendedor), \`custo_api\` (custo real da API), \`status\` (pending/completed/failed), \`external_id\`, \`user_id\`, \`completed_at\`.

#### referral_commissions
Comissões geradas por indicação:
- \`user_id\` — Quem recebe a comissão
- \`referred_user_id\` — Quem gerou a venda
- \`recarga_id\` — Recarga que gerou a comissão
- \`amount\` — Valor da comissão
- \`type\` — \`direct\` (vendedor) ou \`indirect\` (avô/indicador)

#### transactions
Registro de transações financeiras (depósitos PIX):
- \`user_id\`, \`amount\`, \`type\`, \`status\` (pending/completed/failed/expired)
- \`payment_id\` — ID do pagamento no gateway (EFÍ)
- \`metadata\` — JSON com dados extras (QR code, txid, etc.)
- \`module\` — Origem da transação
- \`telegram_notified\`, \`delay_notified\` — Flags de notificação

### Tabelas de Precificação

#### pricing_rules (Preços Globais do Admin)
Define custo real da API e preço base por operadora/valor:
- \`operadora_id\`, \`valor_recarga\` — Identificam o item
- \`custo\` — Custo real da API
- \`tipo_regra\` — \`fixo\` ou \`percentual\`
- \`regra_valor\` — Margem do admin (valor fixo ou %)

#### reseller_pricing_rules (Preços do Revendedor)
Margem do revendedor sobre o preço base:
- \`user_id\`, \`operadora_id\`, \`valor_recarga\` — UNIQUE
- \`custo\` — Custo base que o revendedor paga
- \`tipo_regra\`, \`regra_valor\` — Margem adicional

#### client_pricing_rules (Preços Exclusivos por Cliente)
Margem individual por cliente específico:
- \`reseller_id\`, \`client_id\`, \`operadora_id\`, \`valor_recarga\` — UNIQUE
- \`lucro\` — Margem fixa sobre o custo base
- **Prioridade máxima** na resolução de preços

#### reseller_deposit_fees (Taxa de Depósito por Rede)
Taxa personalizada por rede:
- \`reseller_id\` — 1:1 com revendedor (UNIQUE)
- \`fee_type\` — \`fixo\` ou \`percentual\`
- \`fee_value\` — Valor da taxa

#### reseller_config (Configurações por Rede)
Configurações individuais por revendedor:
- \`user_id\`, \`key\`, \`value\` — Par chave-valor
- Permite configurações específicas por rede (ex: bot token, mensagens personalizadas)

#### disabled_recharge_values (Valores Desativados)
Permite desativar valores específicos de recarga por operadora:
- \`disabled_by\` — UUID de quem desativou
- \`operadora_id\`, \`valor\` — Identifica o item desativado
- Útil para bloquear temporariamente valores com problema na API`,
  },
  {
    id: "precificacao",
    icon: DollarSign,
    title: "5. Sistema de Precificação",
    content: `### Hierarquia de Preços (Prioridade Decrescente)

\`\`\`
1. ⭐ Preço Exclusivo do Cliente (client_pricing_rules)
   ↓ se não existir
2. 💰 Preço Customizado do Revendedor (reseller_pricing_rules)
   ↓ se não existir
3. 📊 Margem Padrão Global (system_config: defaultMarginEnabled)
   ↓ se desativada
4. 🏷️ Preço Global do Admin (pricing_rules)
   ↓ se não existir
5. 🔧 Custo da API (fallback final)
\`\`\`

### Regra Importante da Margem Padrão Global

A Margem Padrão Global **só funciona como fallback**. Se o revendedor tem **QUALQUER** regra customizada na \`reseller_pricing_rules\`, a Margem Padrão Global é **completamente ignorada** para aquele revendedor. Isso permite que revendedores tenham controle total sobre seus preços.

### Cálculo do Custo Base

- Se margem global ativada (e sem regras customizadas): \`baseCost = apiCost + margemGlobal\` (fixo ou %)
- Se existe \`pricing_rule\`: \`baseCost = regra_valor\` (fixo) ou \`apiCost × (1 + %)\`
- Senão: \`baseCost = apiCost\`

### Preço Final

\`\`\`
precoFinal = baseCost + lucro_do_revendedor
\`\`\`

### Safety Floor (Trava de Segurança Hierárquica)

O sistema implementa uma **trava de 3 níveis** que protege o lucro em toda a cadeia:

\`\`\`
O preço cobrado NUNCA pode ser menor que:
  1. Custo real da API (protege o provedor)
  2. Preço Global do Admin (custo + margem admin) — protege o admin
  3. Preço customizado do revendedor (para vendas a clientes) — protege o revendedor
\`\`\`

Essa proteção é aplicada em **dois pontos**:
- **Backend** — Edge Function \`recarga-express\` valida antes de processar
- **Frontend** — Telas "Meus Preços" e "Preços Exclusivos" bloqueiam salvamento de lucro negativo

### Regras Órfãs (Soft-Delete)

Quando um item sai do catálogo (operadora desativada ou valor removido), as regras de precificação são **preservadas** na base. Se o item retornar, as regras são automaticamente restauradas sem necessidade de reconfiguração.`,
  },
  {
    id: "comissoes",
    icon: GitBranch,
    title: "6. Comissões e Lucros",
    content: `### Modelo de 2 Camadas

\`\`\`
👴 Avô (quem indicou o vendedor) ← recebe comissão INDIRETA
  ↓
👨 Vendedor (quem fez a venda) ← fica com comissão DIRETA
  ↓
📱 Cliente (comprador) ← paga o preço final
\`\`\`

### Percentuais Configuráveis

| Configuração | Padrão | Descrição |
|-------------|--------|-----------|
| directCommissionPercent | 100% | % do lucro que o vendedor fica |
| indirectCommissionPercent | 10% | % do lucro que o "avô" recebe |

### Cálculo

\`\`\`
lucro = precoFinalCobrado - custoBase

comissãoDireta  = lucro × (directCommissionPercent / 100)
comissãoIndireta = lucro × (indirectCommissionPercent / 100)
\`\`\`

### Regras

- Se o vendedor **não tem indicador** (reseller_id = null), a comissão indireta **não é processada**.
- Comissões são creditadas no saldo \`pessoal\` do beneficiário via \`increment_saldo()\`.
- Cada comissão gera um registro em \`referral_commissions\` com referência à recarga.

### Exemplo Prático

- Custo base: R$ 12,00
- Preço cobrado ao cliente: R$ 15,00
- Lucro: R$ 3,00
- Comissão direta (100%): **R$ 3,00** → saldo pessoal do vendedor
- Comissão indireta (10%): **R$ 0,30** → saldo pessoal do avô

### Rastreabilidade

Toda comissão registra: quem recebeu (\`user_id\`), quem gerou (\`referred_user_id\`), qual recarga (\`recarga_id\`), valor (\`amount\`) e tipo (\`direct\`/\`indirect\`).`,
  },
  {
    id: "ferramentas",
    icon: Settings,
    title: "7. Ferramentas de Venda",
    content: `### Controle de Visibilidade

Ativado globalmente pelo admin via \`salesToolsEnabled\` na \`system_config\`. Quando ativo, TODOS os cargos veem no /painel:

### Minha Rede
- 📊 Dashboard: contagem diretos/indiretos, lucro direto/indireto (via \`get_network_stats()\`)
- 🔗 Link de indicação (referral_code ou slug da loja)
- 🔍 Busca e filtros (ativo/inativo/todos)
- 👥 Lista com avatar, nome, email, cargo, rede D/I, lucro D/I, saldo revenda/pessoal (via \`get_network_members_v2()\`)
- ⚡ Ações: Preços Exclusivos, Promover p/ Vendedor, Rebaixar p/ Cliente

### Meus Preços
- 📋 Tabs por operadora
- 💰 Custo base visível (preço global do admin)
- ✏️ Edição individual de lucro (margem sobre o custo base)
- ✅ Seleção em lote + lucro em massa
- 📊 Diagrama visual da cadeia de indicação
- 🔒 Trava: impede lucro negativo (safety floor)
- 💡 Se não houver regras customizadas, a Margem Padrão Global é aplicada automaticamente

### Preços Exclusivos
- Acessado via menu do membro na Minha Rede
- Define margem individual por cliente (\`client_pricing_rules\`)
- Prioridade máxima na resolução de preços
- UNIQUE por (reseller_id, client_id, operadora_id, valor_recarga)

### Taxa de Depósito por Rede
- Cada revendedor pode configurar taxa própria para depósitos de seus clientes
- Tipos: fixo (ex: R$ 1,00) ou percentual (ex: 2%)
- Configurado via \`reseller_deposit_fees\`
- Função \`get_deposit_fee_for_user()\` resolve taxa com SECURITY DEFINER`,
  },
  {
    id: "carteira",
    icon: DollarSign,
    title: "8. Carteira Dupla (Saldos)",
    content: `Cada usuário possui **dois saldos** independentes:

| Tipo | Finalidade | Depósito PIX | Usado p/ Recarga | Comissões |
|------|-----------|-------------|-----------------|-----------|
| revenda | Saldo operacional | ✅ (único destino) | ✅ | ❌ |
| pessoal | Comissões recebidas | ❌ | ❌ (apenas consulta) | ✅ |

### Regras de Saldo

- **Depósitos PIX** sempre creditam no saldo \`revenda\`
- **Comissões** creditam no saldo \`pessoal\`
- **Recargas** debitam do saldo \`revenda\`
- Operações atômicas via \`increment_saldo(p_user_id, p_tipo, p_amount)\`

### Depósitos PIX

- Limite de **3 PIX pendentes** por usuário simultâneos
- PIX pendentes expiram após **45 minutos** (Cron Job \`expire-pending-deposits\`)
- Gateway: EFÍ (Gerencianet) — criação via \`create-pix\`, webhook via \`pix-webhook\`
- Verificação periódica via \`check-pending-pix\`
- Monitoramento em background no frontend via \`useBackgroundPaymentMonitor\`

### Taxa de Depósito

A taxa pode vir de duas fontes (prioridade):
1. **Taxa da rede** (\`reseller_deposit_fees\`) — configurada pelo dono da rede do usuário
2. **Taxa global** (\`system_config: taxaTipo/taxaValor\`) — fallback para quem não tem rede

### Transações (transactions)

Cada depósito PIX gera um registro em \`transactions\` com:
- Status: \`pending\` → \`completed\` (ou \`failed\`/\`expired\`)
- \`payment_id\` — ID do pagamento no gateway
- \`metadata\` — QR code, txid, dados do PIX
- Flags de notificação: \`telegram_notified\`, \`delay_notified\``,
  },
  {
    id: "loja-publica",
    icon: Store,
    title: "9. Loja Pública",
    content: `### Visão Geral

Cada revendedor/admin pode ter uma **loja pública personalizada** acessível via URL amigável:

\`\`\`
https://recargasbrasill.com/loja/{slug}
\`\`\`

### Personalização

| Campo | Descrição |
|-------|-----------|
| slug | URL amigável (ex: \`minha-loja\`) — UNIQUE |
| store_name | Nome exibido na loja |
| store_logo_url | Logo personalizado |
| store_primary_color | Cor primária do tema |
| store_secondary_color | Cor secundária do tema |

### Funcionamento

- Função RPC \`get_public_store_by_slug(_slug)\` retorna dados públicos da loja
- View \`profiles_public\` expõe apenas campos seguros (sem email, telefone, reseller_id)
- Clientes que se cadastram pela loja recebem automaticamente o \`reseller_id\` do dono
- A loja usa os preços do revendedor (mesma hierarquia de precificação)

### Requisitos

- Apenas usuários com cargo \`revendedor\` ou \`admin\` podem ter loja pública
- O slug deve ser único e não pode ser alterado pelo usuário (apenas admin)
- A loja respeita o status \`active\` do revendedor — se inativo, a loja não aparece`,
  },
  {
    id: "canais",
    icon: Smartphone,
    title: "10. Canais de Entrada",
    content: `Todos os canais utilizam a mesma Edge Function \`recarga-express\`:

| Canal | Descrição | Autenticação |
|-------|-----------|-------------|
| Painel Web (/painel) | Interface principal | JWT do usuário |
| Bot do Telegram | Bot configurável por rede | Token do bot + user_id |
| Mini App Telegram | Interface dentro do Telegram | JWT via Telegram |
| Loja Pública (/loja/:slug) | Página com visual customizado | Via reseller_id |

### Fluxo Unificado (recarga-express)

\`\`\`
Qualquer Canal → recarga-express →
  1. Identifica usuário e reseller_id
  2. Resolve preço (hierarquia de 5 níveis)
  3. Aplica safety floor (trava de 3 níveis)
  4. Valida saldo >= preço final
  5. Debita saldo (revenda) via increment_saldo()
  6. Envia para API externa do provedor
  7. Registra recarga (status: pending → completed/failed)
  8. Calcula comissões (direta + indireta)
  9. Credita comissões nos saldos pessoais
  10. Notifica via Telegram (se configurado)
\`\`\`

### Bot do Telegram

- Cada revendedor/admin pode configurar seu próprio bot (\`bot_settings\`)
- Edge Function \`telegram-bot\` processa comandos
- Edge Function \`telegram-setup\` configura webhook
- Sessões armazenadas em \`telegram_sessions\` (step-by-step)
- Usuários do bot rastreados em \`telegram_users\`
- Termos de uso via \`terms_acceptance\``,
  },
  {
    id: "seguranca",
    icon: Shield,
    title: "11. Segurança e Isolamento (RLS)",
    content: `### Princípio de Isolamento

Cada usuário **só pode ver e gerenciar** os dados da sua própria rede. Garantido por Row Level Security (RLS) em todas as tabelas.

### Políticas Principais

| Tabela | Usuário | Revendedor | Admin |
|--------|---------|-----------|-------|
| profiles | Vê o seu + básicos | Vê clientes | Vê todos |
| saldos | Vê o seu | Vê + atualiza clientes | Tudo |
| recargas | Vê as suas | Vê dos clientes | Todas |
| reseller_pricing_rules | Gerencia seus preços | — | Gerencia todos |
| client_pricing_rules | Vê seus exclusivos | Gerencia dos clientes | Gerencia todos |
| reseller_deposit_fees | — | Gerencia sua taxa | Gerencia todas |
| referral_commissions | Vê suas comissões | — | Gerencia todas |

### Proteções Especiais no Profile

O usuário **não pode alterar** via RLS:
- \`verification_badge\` — Verificado via \`get_user_verification_badge()\`
- \`reseller_id\` — Verificado via \`get_user_reseller_id()\`

Isso impede que um usuário se auto-verifique ou mude de rede por conta própria.

### Funções SECURITY DEFINER

Funções que precisam acessar dados fora do escopo RLS (executam com privilégios do owner):

| Função | Descrição |
|--------|-----------|
| \`has_role(_user_id, _role)\` | Verifica cargo sem recursão RLS |
| \`get_network_stats(_user_id)\` | Estatísticas da rede (contagem D/I, lucros) |
| \`get_network_members_v2(_user_id, _filter)\` | Membros com métricas completas |
| \`get_deposit_fee_for_user(_user_id)\` | Taxa de depósito do revendedor do usuário |
| \`increment_saldo(p_user_id, p_tipo, p_amount)\` | Operações atômicas de saldo |
| \`get_user_reseller_id(_user_id)\` | Retorna reseller_id (proteção RLS) |
| \`get_user_verification_badge(_user_id)\` | Retorna badge (proteção RLS) |
| \`has_verification_badge(_user_id)\` | Verifica se tem badge |
| \`get_public_store_by_slug(_slug)\` | Dados públicos da loja |
| \`get_user_by_referral_code(_code)\` | Resolve código de indicação para UUID |
| \`get_recargas_ranking(_limit)\` | Ranking público de recargas |
| \`get_user_recargas_count(_user_id)\` | Contagem de recargas do usuário |

### Edge Functions com Service Role

As Edge Functions utilizam \`SUPABASE_SERVICE_ROLE_KEY\` para operações que ultrapassam RLS:
- \`recarga-express\` — Processa recargas e comissões
- \`create-pix\` / \`pix-webhook\` — Operações financeiras
- \`admin-create-user\` / \`admin-delete-user\` — Gestão de usuários
- \`client-register\` — Cadastro via loja pública/bot
- \`admin-toggle-role\` — Alteração de cargos`,
  },
  {
    id: "config-admin",
    icon: Settings,
    title: "12. Configurações Globais do Admin",
    content: `### system_config (Chaves Relevantes para Rede)

| Chave | Tipo | Descrição |
|-------|------|-----------|
| salesToolsEnabled | boolean | Ativa ferramentas de venda (Minha Rede, Meus Preços) para todos os cargos |
| defaultMarginEnabled | boolean | Ativa margem padrão global (fallback automático) |
| defaultMarginType | text | \`fixo\` ou \`percentual\` |
| defaultMarginValue | numeric | Valor da margem padrão |
| directCommissionPercent | numeric | % do lucro que o vendedor recebe (default: 100) |
| indirectCommissionPercent | numeric | % do lucro que o indicador recebe (default: 10) |
| taxaTipo | text | Tipo da taxa global de depósito (\`fixo\`/\`percentual\`) |
| taxaValor | numeric | Valor da taxa global de depósito |
| maintenanceMode | boolean | Modo manutenção (bloqueia acesso) |
| chatEnabled | boolean | Ativa/desativa chat interno |
| seasonalTheme | text | Tema sazonal (visual) |

### Interação entre Configurações

\`\`\`
salesToolsEnabled = true
  → Todos veem "Minha Rede" e "Meus Preços"

defaultMarginEnabled = true
  → Aplica margem automática para quem NÃO tem regras customizadas
  → Se revendedor tem QUALQUER regra em reseller_pricing_rules, ignora

directCommissionPercent + indirectCommissionPercent
  → Definem quanto do lucro é distribuído na cadeia
  → Podem somar mais que 100% (admin absorve o custo extra)
\`\`\``,
  },
  {
    id: "gamificacao",
    icon: Gamepad2,
    title: "13. Gamificação (Raspadinha)",
    content: `### Sistema de Raspadinha (Scratch Cards)

O sistema inclui um mecanismo de gamificação para engajamento dos usuários:

#### Tabela scratch_cards
- \`user_id\` — Dono do cartão
- \`card_date\` — Data do cartão (1 por dia)
- \`is_scratched\` — Se já foi raspado
- \`is_won\` — Se ganhou prêmio
- \`prize_amount\` — Valor do prêmio
- \`scratched_at\` — Quando foi raspado

### Regras

- Cada usuário pode ganhar **1 cartão por dia**
- O cartão é gerado via Edge Function \`scratch-card\` (server-side para prevenir fraude)
- Prêmios são creditados no saldo \`pessoal\`
- RLS garante que usuário só vê/raspa seus próprios cartões
- Uma vez raspado (\`is_scratched = true\`), não pode ser "desraspado"

### Funções RPC

| Função | Descrição |
|--------|-----------|
| \`get_scratch_recent_winners()\` | Últimos ganhadores (público) |
| \`get_scratch_top_winners()\` | Maiores prêmios (público) |

### Rankings Públicos

O sistema também possui rankings de recargas via \`get_recargas_ranking(_limit)\`, exibindo os usuários com mais recargas completadas.`,
  },
  {
    id: "edge-functions",
    icon: Zap,
    title: "14. Edge Functions da Rede",
    content: `### Funções Críticas para o Sistema de Rede

| Edge Function | Descrição |
|--------------|-----------|
| \`recarga-express\` | Engine unificada de recarga (todos os canais) |
| \`create-pix\` | Gera cobrança PIX via EFÍ |
| \`pix-webhook\` | Recebe confirmação de pagamento |
| \`check-pending-pix\` | Verifica PIX pendentes periodicamente |
| \`expire-pending-deposits\` | Expira depósitos após 45min (Cron) |
| \`client-register\` | Cadastro de cliente via bot/loja |
| \`admin-create-user\` | Criação de usuário pelo admin |
| \`admin-delete-user\` | Exclusão de usuário pelo admin |
| \`admin-toggle-role\` | Alteração de cargo pelo admin |
| \`admin-reset-password\` | Reset de senha pelo admin |
| \`scratch-card\` | Geração/raspagem de cartão |
| \`sync-catalog\` | Sincroniza catálogo de operadoras |
| \`sync-pending-recargas\` | Sincroniza status de recargas pendentes |
| \`collect-pending-debts\` | Coleta débitos pendentes |
| \`telegram-bot\` | Processa comandos do bot |
| \`telegram-setup\` | Configura webhook do bot |
| \`telegram-notify\` | Envia notificação via Telegram |
| \`send-broadcast\` | Envio em massa via Telegram |
| \`backup-export\` / \`backup-restore\` | Backup e restauração de dados |

### Secrets Necessários

| Secret | Descrição |
|--------|-----------|
| \`EFI_CLIENT_ID\` | Client ID do gateway EFÍ |
| \`EFI_CLIENT_SECRET\` | Client Secret do gateway EFÍ |
| \`EFI_PIX_KEY\` | Chave PIX do recebedor |
| \`EFI_CERTIFICATE\` | Certificado .p12 em base64 |
| \`BOT_TOKEN\` | Token do bot principal do Telegram |
| \`RECHARGE_API_URL\` | URL da API de recargas |
| \`RECHARGE_API_TOKEN\` | Token da API de recargas |`,
  },
];
