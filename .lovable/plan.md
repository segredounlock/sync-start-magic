

# Plano: Resetar raspadinha de hoje

## O que será feito
Deletar a raspadinha de hoje do banco de dados para que você possa resgatar uma nova e testar o sistema de faixas.

## Detalhes técnicos
- Existe 1 raspadinha para hoje (14/03/2026), ID `7e0c1d89-cadd-4e68-aed7-aa227d804a64`, já raspada (perdeu).
- Executar `DELETE FROM scratch_cards WHERE card_date = CURRENT_DATE` para limpar.
- Após deletar, basta clicar em "Resgatar Raspadinha" na tela para testar com o novo sistema de 3 faixas.

