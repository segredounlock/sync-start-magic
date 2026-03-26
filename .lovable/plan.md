
# Corrigir Layout do Backup no Mobile

## Problema
A seção de Backup tem elementos desalinhados no mobile (390px):
1. Grid de 3 botoes (Exportar, Restaurar, Restauracao Segura) em `grid-cols-2` deixa o terceiro botao sozinho e desalinhado
2. Textos e cards podem estar cortados ou apertados no viewport de 390px

## Alteracoes

### `src/components/BackupSection.tsx`

1. **Grid dos botoes de acao (linha ~984)**: Mudar de `grid-cols-2` para `grid-cols-1` no mobile e `grid-cols-3` no desktop, garantindo que os 3 botoes fiquem uniformes
   - `grid grid-cols-1 sm:grid-cols-3 gap-3`

2. **Grid de stats do GitHub (linha ~1393)**: Mudar de `grid-cols-3` para `grid-cols-2` no mobile com o ultimo item spanning
   - `grid grid-cols-2 sm:grid-cols-3 gap-2.5`

3. **Diagnostico do Mirror (linha ~1534)**: Os textos longos (nome do repo) podem quebrar — adicionar `break-all` nos nomes de repo e ajustar flex para `flex-col` no mobile

4. **Header principal (linha ~955)**: Padding e tamanhos OK, manter

5. **Tabs (linha ~966)**: Reduzir gap e padding dos tabs para mobile
   - `gap-0.5 p-1` e texto `text-xs`

6. **Toggles de inclusao (linhas ~1197-1256)**: Padding interno menor no mobile

### Resultado
Layout fluido e legivel em 390px sem cortes ou desalinhamentos
