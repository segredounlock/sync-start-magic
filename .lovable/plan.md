

## Plano: Adicionar saldo atual e botão de adicionar saldo no modal de recargas do usuário

### O que será feito

No modal `UserRecargasModal` (que abre ao clicar no perfil do usuário no chat), adicionar:

1. **Exibição do saldo atual** do usuário (tipo "revenda") no header, ao lado do nome
2. **Botão rápido "Adicionar Saldo"** que abre um mini-formulário inline para inserir valor e confirmar a adição

### Alterações

**Arquivo: `src/components/chat/UserRecargasModal.tsx`**

- Buscar o saldo atual do usuário na tabela `saldos` (filtro `user_id` + `tipo = 'revenda'`) junto com as recargas no `useEffect`
- Exibir o saldo no header como badge verde (ex: `R$ 150,00`)
- Adicionar uma barra de ações rápidas entre o header e a lista de recargas com:
  - **Saldo atual** visível em destaque
  - **Botão "Adicionar Saldo"** (`Plus` icon) que expande um input inline com campo de valor e botão confirmar
- Ao confirmar, atualizar o saldo na tabela `saldos` (ler atual → somar → update) e atualizar o estado local
- Mostrar toast de sucesso/erro via `sonner`

### Detalhes técnicos

- Consulta: `supabase.from("saldos").select("valor").eq("user_id", userId).eq("tipo", "revenda").maybeSingle()`
- Update segue o mesmo padrão usado em `Principal.tsx` (linhas 3580-3584): ler valor atual, somar, e fazer update
- O botão de adicionar saldo só aparece para admins (verificar via `useAuth` ou passar prop `isAdmin`)

