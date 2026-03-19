

## Diagnóstico

A aba "Configurações de Suporte" **salva** os canais no banco de dados (`reseller_config` com chaves `custom_support_enabled` e `support_channels`), porém **nenhum outro componente lê esses dados**. Ou seja:

- O `FloatingSupportButton` (balão flutuante) **não consulta** os canais configurados pelo revendedor
- O portal do cliente (`ClientePortal`) **não exibe** os canais personalizados
- A `SupportChatWidget` **não usa** essa configuração

**Resultado:** A configuração é funcional no sentido de salvar/ler dados, mas **não tem efeito prático** — os indicados nunca veem os canais configurados.

---

## Plano de Correção

### 1. Criar hook `useSupportChannels`
- Novo hook que, dado um `resellerId`, busca na `reseller_config` se o revendedor tem `custom_support_enabled = true` e quais `support_channels` estão configurados
- Se o revendedor direto não tiver suporte personalizado, subir na cadeia (reseller do reseller) até encontrar um que tenha, ou usar o suporte padrão do sistema
- Retorna `{ channels, bubbleChannel, isCustom, loading }`

### 2. Integrar no `FloatingSupportButton`
- Quando o usuário (cliente/revendedor) tem um `reseller_id`, usar o hook para buscar os canais do seu revendedor
- Se houver canal marcado como `showInBubble`, exibir esse canal diretamente no botão flutuante (ex: abrir WhatsApp ao clicar)
- Manter o comportamento atual (chat de suporte do sistema) como fallback quando não há suporte personalizado

### 3. Integrar no `ClientePortal`
- Na seção de suporte do portal do cliente, exibir os canais personalizados do revendedor (ícone + label + link) em vez do suporte genérico do sistema
- Cada canal abre o respectivo link (WhatsApp, Telegram, Instagram, etc.)

### 4. Exibir canais na página de suporte do cliente (`ClientSupport`)
- Mostrar os canais personalizados do revendedor no topo da página de suporte, antes do chat

### Arquivos afetados
- **Novo:** `src/hooks/useSupportChannels.ts`
- **Editar:** `src/components/support/FloatingSupportButton.tsx`
- **Editar:** `src/pages/ClientePortal.tsx`
- **Editar:** `src/pages/ClientSupport.tsx`

