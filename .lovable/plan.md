

## Plano: Corrigir navegação do "Ver tudo" em Atividade Recente

### Problema
O botão "Ver tudo" na seção "Atividade Recente" executa `setView("lista")`, levando à aba de Usuários. Como a seção mostra recargas recentes, o destino correto é a aba de Relatórios/Recargas.

### Correção

**Arquivo: `src/pages/Principal.tsx`** (linha 1412)
- Trocar `setView("lista")` por `setView("relatorios")` no botão "Ver tudo".

Mudança de 1 linha.

