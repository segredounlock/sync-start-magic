

## Plano: Mover Dashboard Live do /painel para /principal

### O que será feito

1. **Remover do RevendedorPainel** (`src/pages/RevendedorPainel.tsx`):
   - Remover o import do `RealtimeDashboard`
   - Remover a aba "Dashboard Live" do menu lateral (linha 618)
   - Remover a aba "Dashboard" do menu mobile (linha 1736)
   - Remover o bloco de renderização da tab `dashboard` (linhas 1294-1297)
   - Remover `"dashboard"` do tipo `PainelTab`

2. **Adicionar no Principal** (`src/pages/Principal.tsx`):
   - Importar o componente `RealtimeDashboard`
   - O Principal já tem uma view `"dashboard"` — vou adicionar o `RealtimeDashboard` dentro dessa view existente, como uma seção do dashboard do admin
   - Usar `user.id` como prop (o admin verá suas próprias recargas em tempo real)

### Detalhe técnico

O `RealtimeDashboard` filtra por `user_id` — no `/principal` (admin), pode fazer sentido mostrar **todas** as recargas (sem filtro de user). Preciso verificar se você quer ver apenas as suas recargas ou as de todos os usuários.

Porém, como o componente atual já filtra por `userId`, vou mantê-lo assim por agora e integrá-lo ao dashboard do admin. Se quiser ver de todos os usuários, será uma mudança adicional.

