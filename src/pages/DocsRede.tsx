import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronRight, BookOpen, Users, DollarSign, Shield, Smartphone, GitBranch, Layers, Database, Settings, ArrowLeft, Copy, Check } from "lucide-react";

const sections = [
  {
    id: "visao-geral",
    icon: BookOpen,
    title: "1. Visão Geral",
    content: `O sistema de rede de indicações permite que **qualquer usuário autenticado** construa e gerencie sua própria rede de clientes, funcionando como um micro-revendedor dentro da plataforma. O sistema opera como um **modelo multinível de 2 camadas** (direto + indireto).

### Princípios Fundamentais

- **Democrático** — Todos os cargos (incluindo usuário comum) podem gerenciar sua rede quando as ferramentas estão ativadas.
- **Isolado** — Cada gestor só vê e administra seus próprios membros — nunca os de outro.
- **Seguro** — O preço mínimo é imposto pelo administrador principal (piso obrigatório).
- **Unificado** — A mesma engine de recarga funciona em todos os canais (Painel, Bot, Mini App, Loja Pública).`,
  },
  {
    id: "hierarquia",
    icon: Layers,
    title: "2. Hierarquia de Cargos",
    content: `| Cargo | Prioridade | Acesso /admin | Ferramentas de Venda | Bot Próprio |
|-------|-----------|--------------|---------------------|------------|
| admin | 1 (mais alta) | ✅ Completo | ✅ Sempre | ✅ |
| revendedor | 2 | ✅ Completo | ✅ (via toggle) | ✅ |
| cliente | 3 | ❌ | ✅ (via toggle) | ❌ |
| usuario | 4 (padrão) | ❌ | ✅ (via toggle) | ❌ |

### Regras de Cargo

- **Todo cadastro novo** recebe o cargo \`usuario\` por padrão.
- Se o cadastro vem com link de indicação (reseller_id), recebe \`cliente\`.
- O cargo \`revendedor\` **só é atribuído manualmente** por um admin ou pelo dono da rede.
- Um usuário pode ter **múltiplos cargos** — o sistema usa o de maior prioridade.`,
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
\`\`\`

### 3.2 Cadastro via Link de Indicação

O link de indicação segue dois formatos:
- **Via referral_code:** \`https://dominio.com/recarga?ref=123456\`
- **Via slug de loja:** \`https://dominio.com/loja/nome-da-loja\`

\`\`\`
Usuário acessa link → Cadastra com reseller_id →
  Trigger handle_new_user() →
    1. Cria profile com reseller_id preenchido
    2. Cria 2 saldos (R$ 0)
    3. Atribui cargo 'cliente'
\`\`\`

### 3.3 Cadastro pelo Bot do Telegram

Mesmo fluxo via Edge Function \`client-register\`: cria user, define reseller_id, atribui cargo \`cliente\`.

### 3.4 Cadastro pelo Admin

Edge Function \`admin-create-user\`: pode escolher cargo. Default: \`usuario\`.`,
  },
  {
    id: "banco-dados",
    icon: Database,
    title: "4. Estrutura do Banco de Dados",
    content: `### Tabelas Principais

#### profiles
Armazena dados do usuário: nome, email, avatar, slug da loja, cores da loja, telefone, telegram, whatsapp, badge de verificação, bio, referral_code e **reseller_id** (quem indicou).

#### user_roles
Cargos do usuário. Constraint UNIQUE (user_id, role). Função \`has_role()\` com SECURITY DEFINER para evitar recursão RLS.

#### saldos
Carteira dupla: tipo \`revenda\` (operacional) e \`pessoal\` (comissões). Função \`increment_saldo()\` para operações atômicas.

#### recargas
Histórico de recargas: telefone, operadora, valor, custo, custo_api, status (pending/completed/failed), external_id.

#### referral_commissions
Comissões geradas: user_id (quem recebe), referred_user_id (quem gerou), recarga_id, amount, type (direct/indirect).

### Tabelas de Precificação

#### pricing_rules (Preços Globais do Admin)
Define custo real da API e preço base por operadora/valor. Campos: operadora_id, valor_recarga, custo, tipo_regra, regra_valor.

#### reseller_pricing_rules (Preços do Revendedor)
Margem do revendedor sobre o preço base. UNIQUE (user_id, operadora_id, valor_recarga).

#### client_pricing_rules (Preços Exclusivos)
Margem individual por cliente. UNIQUE (reseller_id, client_id, operadora_id, valor_recarga). **Prioridade máxima** na resolução.

#### reseller_deposit_fees (Taxa de Depósito)
Taxa por rede: fee_type (fixo/percentual), fee_value. 1:1 com reseller.`,
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

### Cálculo do Custo Base

- Se margem global ativada: \`baseCost = apiCost + margemGlobal\` (fixo ou %)
- Se existe pricing_rule: \`baseCost = regra_valor\` (fixo) ou \`apiCost × (1 + %)\`
- Senão: \`baseCost = apiCost\`

### Preço Final

\`\`\`
precoFinal = baseCost + lucro_do_revendedor
\`\`\`

### Safety Floor (Trava de Segurança)

O sistema **impede** que qualquer nível venda abaixo do custo real da API, garantindo que o admin nunca tenha prejuízo.

### Regra da Margem Padrão Global

Se o revendedor tem QUALQUER regra customizada, a Margem Padrão Global NÃO se aplica (funciona apenas como fallback).`,
  },
  {
    id: "comissoes",
    icon: GitBranch,
    title: "6. Comissões e Lucros",
    content: `### Modelo de 2 Camadas

\`\`\`
👴 Avô (quem te indicou) ← recebe comissão INDIRETA
  ↓
👨 Você (vendedor) ← fica com comissão DIRETA
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

### Exemplo Prático

- Custo base: R$ 12,00
- Preço cobrado: R$ 15,00
- Lucro: R$ 3,00
- Comissão direta (100%): **R$ 3,00**
- Comissão indireta (10%): **R$ 0,30**`,
  },
  {
    id: "ferramentas",
    icon: Settings,
    title: "7. Ferramentas de Venda",
    content: `### Controle de Visibilidade

Ativado globalmente pelo admin via \`salesToolsEnabled\`. Quando ativo, TODOS os cargos veem no /painel:

### Minha Rede
- 📊 Dashboard: contagem diretos/indiretos, lucro direto/indireto
- 🔗 Link de indicação (slug da loja ou referral_code)
- 🔍 Busca e filtros (ativo/inativo/todos)
- 👥 Lista com avatar, nome, email, cargo, rede D/I, lucro D/I
- ⚡ Ações: Preços Exclusivos, Promover p/ Vendedor, Rebaixar p/ Cliente

### Meus Preços
- 📋 Tabs por operadora
- 💰 Custo base visível
- ✏️ Edição individual de lucro
- ✅ Seleção em lote + lucro em massa
- 📊 Diagrama visual da cadeia de indicação
- 🔒 Trava: impede lucro negativo

### Preços Exclusivos
- Acessado via menu do membro na Minha Rede
- Define margem individual por cliente
- Prioridade máxima na resolução de preços`,
  },
  {
    id: "carteira",
    icon: DollarSign,
    title: "8. Carteira Dupla (Saldos)",
    content: `Cada usuário possui **dois saldos** independentes:

| Tipo | Finalidade | Depósito PIX | Usado p/ Recarga |
|------|-----------|-------------|-----------------|
| revenda | Saldo operacional | ✅ (único destino) | ✅ |
| pessoal | Comissões recebidas | ❌ | ❌ (apenas consulta) |

### Regras

- **Depósitos PIX** sempre creditam no saldo \`revenda\`
- **Comissões** creditam no saldo \`pessoal\`
- **Recargas** debitam do saldo \`revenda\`
- Limite de **3 PIX pendentes** por usuário
- PIX pendentes expiram após **45 minutos**`,
  },
  {
    id: "canais",
    icon: Smartphone,
    title: "9. Canais de Entrada",
    content: `Todos os canais utilizam a mesma Edge Function \`recarga-express\`:

| Canal | Descrição | Autenticação |
|-------|-----------|-------------|
| Painel Web (/painel) | Interface principal | JWT do usuário |
| Bot do Telegram | Bot configurável | Token do bot + user_id |
| Mini App Telegram | Interface dentro do Telegram | JWT via Telegram |
| Loja Pública (/loja/:slug) | Página com visual customizado | Via reseller_id |

### Fluxo Unificado

\`\`\`
Qualquer Canal → recarga-express →
  1. Identifica usuário e reseller_id
  2. Resolve preço (hierarquia)
  3. Valida saldo
  4. Debita saldo
  5. Envia para API externa
  6. Registra recarga
  7. Calcula comissões (D + I)
  8. Notifica via Telegram
\`\`\``,
  },
  {
    id: "seguranca",
    icon: Shield,
    title: "10. Segurança e Isolamento (RLS)",
    content: `### Princípio de Isolamento

Cada usuário **só pode ver e gerenciar** os dados da sua própria rede. Garantido por Row Level Security (RLS).

### Políticas Principais

- **profiles**: Usuário vê seu perfil; Revendedor vê clientes; Admin vê todos
- **reseller_pricing_rules**: Usuário gerencia seus preços; Clientes veem preços do revendedor
- **client_pricing_rules**: Revendedor gerencia; Cliente vê seus exclusivos; Admin gerencia todos
- **saldos**: Usuário vê o seu; Revendedor vê/atualiza dos clientes; Admin tudo
- **recargas**: Usuário vê as suas; Revendedor vê dos clientes; Admin todas

### Funções SECURITY DEFINER

Funções que precisam acessar dados fora do escopo RLS:
- \`has_role()\` — Verifica cargo sem recursão
- \`get_network_stats()\` — Estatísticas da rede
- \`get_network_members_v2()\` — Membros com métricas
- \`get_deposit_fee_for_user()\` — Taxa de depósito
- \`increment_saldo()\` — Operações atômicas de saldo`,
  },
  {
    id: "config-admin",
    icon: Settings,
    title: "11. Configurações Globais do Admin",
    content: `### system_config (chaves relevantes)

| Chave | Tipo | Descrição |
|-------|------|-----------|
| salesToolsEnabled | boolean | Ativa ferramentas de venda para todos |
| defaultMarginEnabled | boolean | Ativa margem padrão global |
| defaultMarginType | text | 'fixo' ou 'percentual' |
| defaultMarginValue | numeric | Valor da margem |
| directCommissionPercent | numeric | % comissão direta (default: 100) |
| indirectCommissionPercent | numeric | % comissão indireta (default: 10) |
| taxaTipo | text | Tipo da taxa global de depósito |
| taxaValor | numeric | Valor da taxa global de depósito |`,
  },
];

function renderMarkdown(text: string) {
  // Simple markdown renderer for tables, code blocks, bold, inline code
  const lines = text.split("\n");
  const elements: JSX.Element[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code blocks
    if (line.trim().startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      elements.push(
        <pre key={`code-${i}`} className="bg-muted/50 border border-border rounded-lg p-4 overflow-x-auto text-xs font-mono text-foreground my-3">
          {codeLines.join("\n")}
        </pre>
      );
      continue;
    }

    // Tables
    if (line.includes("|") && line.trim().startsWith("|")) {
      const tableRows: string[] = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim().startsWith("|")) {
        tableRows.push(lines[i]);
        i++;
      }
      // Parse table
      const parsed = tableRows
        .filter((r) => !r.match(/^\|\s*[-:]+/)) // skip separator
        .map((r) => r.split("|").filter(Boolean).map((c) => c.trim()));

      if (parsed.length > 0) {
        const header = parsed[0];
        const body = parsed.slice(1);
        elements.push(
          <div key={`table-${i}`} className="overflow-x-auto my-3">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  {header.map((h, hi) => (
                    <th key={hi} className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30 border-b border-border first:rounded-tl-lg last:rounded-tr-lg">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {body.map((row, ri) => (
                  <tr key={ri} className="border-b border-border/50 hover:bg-muted/10">
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-3 py-2 text-foreground">
                        <span dangerouslySetInnerHTML={{ __html: cell.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-muted text-xs font-mono text-primary">$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') }} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    // H3
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={`h3-${i}`} className="text-base font-bold text-foreground mt-5 mb-2">
          {line.replace("### ", "")}
        </h3>
      );
      i++;
      continue;
    }

    // H4
    if (line.startsWith("#### ")) {
      elements.push(
        <h4 key={`h4-${i}`} className="text-sm font-bold text-primary mt-4 mb-1">
          {line.replace("#### ", "")}
        </h4>
      );
      i++;
      continue;
    }

    // List items
    if (line.trim().startsWith("- ")) {
      elements.push(
        <li key={`li-${i}`} className="text-sm text-muted-foreground ml-4 list-disc my-1">
          <span dangerouslySetInnerHTML={{ __html: line.trim().slice(2).replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-muted text-xs font-mono text-primary">$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong class="text-foreground">$1</strong>') }} />
        </li>
      );
      i++;
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={`p-${i}`} className="text-sm text-muted-foreground leading-relaxed my-2">
        <span dangerouslySetInnerHTML={{ __html: line.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-muted text-xs font-mono text-primary">$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong class="text-foreground">$1</strong>') }} />
      </p>
    );
    i++;
  }

  return elements;
}

function SectionAccordion({ section, isOpen, onToggle }: { section: typeof sections[0]; isOpen: boolean; onToggle: () => void }) {
  const Icon = section.icon;
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card/50 backdrop-blur-sm">
      <button onClick={onToggle} className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-muted/20 transition-colors">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="h-4.5 w-4.5 text-primary" />
        </div>
        <span className="flex-1 text-base font-bold text-foreground">{section.title}</span>
        {isOpen ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
      </button>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="px-5 pb-5 border-t border-border"
        >
          <div className="pt-4">{renderMarkdown(section.content)}</div>
        </motion.div>
      )}
    </div>
  );
}

export default function DocsRede() {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["visao-geral"]));
  const [copied, setCopied] = useState(false);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const expandAll = () => setOpenSections(new Set(sections.map((s) => s.id)));
  const collapseAll = () => setOpenSections(new Set());

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText("https://recargasbrasill.com/docs/rede");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Voltar</span>
          </a>
          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copiado!" : "Copiar Link"}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 pb-20">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
            <BookOpen className="h-3.5 w-3.5" />
            Documentação Técnica
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground mb-3">
            Sistema de Rede de Indicações
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
            Documentação completa do modelo de micro-franquias digitais — precificação em cascata, comissões automáticas, isolamento por RLS e multicanal unificado.
          </p>
        </motion.div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-xs text-muted-foreground font-medium">{sections.length} seções</p>
          <div className="flex gap-2">
            <button onClick={expandAll} className="text-xs font-semibold text-primary hover:underline">Expandir Tudo</button>
            <span className="text-muted-foreground">·</span>
            <button onClick={collapseAll} className="text-xs font-semibold text-primary hover:underline">Fechar Tudo</button>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-3">
          {sections.map((section, i) => (
            <motion.div key={section.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <SectionAccordion
                section={section}
                isOpen={openSections.has(section.id)}
                onToggle={() => toggleSection(section.id)}
              />
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/30 border border-border">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Documentação gerada automaticamente · Atualizada em Março 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}
