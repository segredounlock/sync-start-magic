

## Plano: Melhorar a interface do módulo de Backup

O screenshot mostra que o diálogo nativo do navegador (`window.confirm`) ainda está aparecendo. Porém, no código atual, o modal customizado já existe e o `window.confirm` foi removido. Isso indica que o build anterior não foi aplicado. O código já contém o modal elegante — basta garantir que o build está correto.

Além disso, vou melhorar a interface geral das 3 abas para ficar mais profissional:

### Melhorias Planejadas

**1. Aba GitHub — Redesign visual**
- Cards com ícones e bordas mais refinadas para PAT, seleção de repo e resumo do projeto
- Seletor de repositório estilizado com ícone de cadeado/globo inline em vez de emoji
- Contador de arquivos dinâmico baseado no `effectivePaths` real em vez de números hardcoded ("9 páginas · 10 componentes...")
- Botão "Sincronizar tudo" com gradiente e animação hover

**2. Aba Dados — Refinamentos**
- Botões de Exportar/Restaurar com visual de card mais consistente com a aba Atualização
- Progress bar com label mais descritiva

**3. Unificar os dois modais de confirmação**
- Atualmente existem DOIS modais: `showConfirmation` (para updates) e `confirmModal` (para GitHub sync e restore)
- Unificar tudo no `confirmModal` genérico que já é elegante, removendo o `showConfirmation` duplicado

**4. Contadores dinâmicos**
- Calcular automaticamente quantas páginas, componentes, hooks, libs e edge functions existem no `effectivePaths` em vez de valores fixos hardcoded na linha 836

### Arquivos a modificar
- `src/components/BackupSection.tsx` — todas as melhorias acima

