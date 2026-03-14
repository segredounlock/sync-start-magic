

## Plano: Remover aba "Configurações" do painel do revendedor

### O que será feito

Remover completamente a aba "Configurações" (admin-only, com BackupSection) do painel. O BackupSection será movido para dentro da aba "Atualizações" (visível apenas para admin).

### Alterações em `src/pages/RevendedorPainel.tsx`

1. **Tipo `PainelTab`** (linha 48): Remover `"configuracoes"` do union type
2. **Menu lateral** (linha 734): Remover a entrada `configuracoes` do array de tabs
3. **tabTitle** (linha 746): Remover `configuracoes: "Configurações"`
4. **Tab content** (linhas 2164-2169): Remover o bloco inteiro de renderização da tab configuracoes
5. **Tab Atualizações** (linha 2162): Adicionar BackupSection (admin only) abaixo de AtualizacoesSection
6. **Mobile nav** (linha 2202): Remover entrada `configuracoes` do bottom nav

