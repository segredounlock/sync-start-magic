

# Painel de Detalhes do Saque para o Admin

## Problema
Atualmente, quando um saque muda de status (aprovado, pago, rejeitado), o admin nao tem uma area de detalhes expandida mostrando o historico completo e informacoes criticas. Falta visibilidade sobre timestamps de cada etapa, dados PIX completos e timeline do processo.

## Solucao

Adicionar um **card expandivel** em cada saque que, ao clicar, mostra um painel de detalhes completo com:

### Informacoes exibidas no painel expandido:
1. **Timeline de status** -- quando foi solicitado, aprovado e pago (datas/horas extraidas do metadata)
2. **Dados PIX completos** -- tipo da chave, valor da chave, copiavel com um clique
3. **Valor liquido** -- valor do saque
4. **Modulo de origem** -- de onde veio o saldo (comissoes, etc)
5. **ID da transacao** -- para referencia interna
6. **Saldo atual do usuario** -- consulta ao saldo pessoal em tempo real

### Mudancas tecnicas

**Arquivo: `src/components/SaquesSection.tsx`**
- Adicionar estado `expandedId` para controlar qual card esta expandido
- Ao clicar no card, expandir/colapsar o painel de detalhes
- Seção expandida mostra:
  - Timeline visual com icones e datas (Solicitado em → Aprovado em → Pago em)
  - Bloco "Dados PIX" com chave copiavel (botao copiar)
  - ID da transacao copiavel
  - Saldo atual do usuario (fetch sob demanda da tabela `saldos`)
- Botao de copiar chave PIX usando `navigator.clipboard`
- Importar `Copy`, `ChevronUp` do lucide-react

### UI/UX
- Card clicavel com seta indicativa (ChevronDown/Up)
- Secao expandida com fundo levemente diferente e borda superior
- Timeline com bolinhas coloridas conectadas por linha
- Dados PIX em destaque com botao "Copiar"

