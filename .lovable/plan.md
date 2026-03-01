

## Correção do cálculo de lucro na página Principal

### Problema
A página `/principal` (arquivo `src/pages/Principal.tsx`) calcula lucro como `valor_facial - custo` (50 - 19 = 31), quando deveria ser `custo_cobrado_revendedor - custo_api` (19 - 15 = 4).

O mesmo bug aparece em 3 lugares dentro do `dashboardMetrics` (linhas 893-950):
- **Lucro Hoje** (linha 899): `receitaHoje(valor) - custoHoje(custo)` → errado
- **Lucro Mês** (linha 906): `receitaMes(valor) - custoMes(custo)` → errado  
- **Lucro Total** (linha 932): `receitaTotal(valor) - custoTotal(custo)` → errado

Além disso, os cards mostram "Receita" como o valor facial, mas a receita real do admin é o que foi cobrado dos revendedores (`custo`).

### Plano

1. **Ajustar o `useMemo` de `dashboardMetrics`** para usar `custo_api`:
   - `custoApiHoje = completedToday.reduce((s, r) => s + (r.custo_api || 0), 0)`
   - `lucroHoje = custoHoje - custoApiHoje` (cobrado do revendedor - custo API)
   - Mesma lógica para mês e total
   - Renomear variáveis para clareza: `receita` = custo cobrado do revendedor, não valor facial

2. **Ajustar os textos dos cards** (linhas 1143-1149) para refletir os valores corretos:
   - "Receita Hoje" → mostra o que foi cobrado dos revendedores
   - "Lucro" → diferença entre cobrado e custo API
   - Subtítulos com "Custo API" ao invés de "Custo"

3. **Verificar o `allRecargas` fetch** para garantir que `custo_api` está sendo buscado do banco (preciso verificar o select usado)

4. **Verificar a seção de relatórios** (linha 2681-2683) que também calcula lucro — corrigir se necessário

### Detalhes técnicos
- Coluna `custo_api` já existe na tabela `recargas` (adicionada na migração anterior)
- O campo `custo` na tabela = preço cobrado do revendedor (R$ 19)
- O campo `custo_api` = custo real da API (R$ 15)
- Lucro real = `custo - custo_api` = 19 - 15 = R$ 4

