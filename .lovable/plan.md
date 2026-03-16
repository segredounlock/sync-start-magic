

## Plano: Adicionar Página de Regras e Termos de Uso ao Site

### O que será feito

Criar uma página pública `/regras` com as regras da plataforma, incluindo a política de reembolso/MED, e adicionar link para ela na Landing Page e no footer.

### Conteúdo das regras

Baseado nas conversas anteriores e na política do gateway, as regras incluirão:

1. **Política de Reembolso / MED** -- Solicitações de reembolso (MED/contestação) junto ao banco resultam em bloqueio permanente da conta bancária e da plataforma. Nenhum reembolso será concedido por esta via.
2. **Suporte** -- Qualquer problema deve ser tratado exclusivamente pelo suporte da plataforma.
3. **Depósitos expirados** -- PIX não pago dentro do prazo expira automaticamente. Se pagou após expirar, entrar em contato com o suporte.
4. **Responsabilidade do revendedor** -- O revendedor é responsável pelo atendimento ao cliente final e deve verificar o extrato da operadora antes de acionar o suporte.
5. **Prazo de processamento** -- Recargas podem levar até 1 hora; reclamações antes desse prazo não serão atendidas.

### Alterações técnicas

1. **Criar `src/pages/RegrasPage.tsx`** -- Página pública estilizada com as regras acima, usando o mesmo visual da Landing Page (glass cards, gradientes, animações suaves). Incluirá seções claras com ícones para cada regra.

2. **Atualizar `src/AppRoot.tsx`** -- Adicionar rota `/regras` apontando para a nova página.

3. **Atualizar `src/pages/LandingPage.tsx`** -- Adicionar link "Regras de Uso" no footer (seção "Plataforma") apontando para `/regras`.

