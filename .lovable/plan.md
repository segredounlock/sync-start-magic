

# Plano: Auto-salvar valor da margem ao ativar toggle

O problema atual é uma questão de UX: o usuário ativa o toggle mas esquece de salvar o valor. A solução é fazer o toggle salvar automaticamente um valor padrão quando ativado, e também salvar o valor automaticamente ao digitar (sem precisar clicar no botão Salvar separado).

## Alterações

### `src/pages/Principal.tsx`
1. **Ao ativar o toggle**, salvar automaticamente as 3 chaves: `defaultMarginEnabled=true`, `defaultMarginType=fixo`, `defaultMarginValue=0.50` (valor padrão)
2. **No campo de valor**, usar `onBlur` para auto-salvar quando o usuário sair do campo, eliminando a necessidade do botão Salvar separado
3. Manter o botão Salvar como confirmação visual, mas o valor já será persistido ao sair do campo

### Detalhes técnicos
- No handler do toggle (linha ~3964), adicionar upserts para `defaultMarginType` e `defaultMarginValue` com valores padrão `fixo` e `0.50`
- Adicionar `onBlur` no input (linha ~3991) que dispara o mesmo upsert do botão Salvar
- Sem alterações no backend — a lógica da Edge Function já está correta

