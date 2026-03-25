

# Devolver R$ 134,50 para 5 Usuários Sobrecarregados

## Resumo

Recargas Brasil **não é bug** -- tem preço customizado definido pelo admin. Apenas 5 usuários foram prejudicados e precisam de devolução.

## Ações

### Migração SQL -- Creditar saldo e registrar auditoria

Para cada usuário afetado:

| Usuário | Valor Devolvido |
|---------|----------------|
| Cassio | R$ 45,20 |
| Jdfcell | R$ 35,30 |
| LNCELL | R$ 24,00 |
| ALÊ-RECARGAS | R$ 19,00 |
| Evolution | R$ 11,00 |
| **Total** | **R$ 134,50** |

Para cada um:
1. `SELECT increment_saldo(user_id, 'revenda', valor)` -- credita o saldo
2. `INSERT INTO audit_logs` -- registra a devolução com detalhes

Nenhum arquivo de código será alterado. Apenas uma migração SQL.

