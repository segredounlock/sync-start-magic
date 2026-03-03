

## Alterar Labels dos Temas Sazonais para "Feliz ..."

O banner sazonal exibe apenas o nome do tema (ex: "PÁSCOA"), mas deveria exibir uma saudação completa (ex: "FELIZ PÁSCOA").

### Alteração

Atualizar o campo `label` de cada tema em `src/components/SeasonalEffects.tsx`:

| Atual | Novo |
|-------|------|
| Ano Novo | Feliz Ano Novo |
| Carnaval | Feliz Carnaval |
| Páscoa | Feliz Páscoa |
| Dia das Mães | Feliz Dia das Mães |
| Dia dos Namorados | Feliz Dia dos Namorados |
| Festa Junina | Feliz Festa Junina |
| Dia dos Pais | Feliz Dia dos Pais |
| Dia das Crianças | Feliz Dia das Crianças |
| Black Friday | Black Friday (mantém — não faz sentido "Feliz Black Friday") |
| Natal | Feliz Natal |

Resultado: o banner exibirá **🐰 FELIZ PÁSCOA 🐰** em vez de **🐰 PÁSCOA 🐰**.

