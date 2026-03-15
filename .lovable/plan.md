

# Reativar Cobrança Automática — Álika (R$ 17,00)

## Situação Atual

A recarga `8eb6faae` (Claro, R$ 50, tel: 86995959545) da Álika já foi cobrada (custo = R$ 17,00). Para reativar a cobrança automática, basta zerar o campo `custo` dessa recarga — o sistema de recuperação de débitos detectará `custo=0` com `custo_api=17` e cobrará automaticamente quando ela tiver saldo.

## Ação

1. Atualizar a recarga `8eb6faae` → setar `custo = 0`
2. Executar a Edge Function `collect-pending-debts` para processar imediatamente (ou aguardar o Cron Job)

## Resultado Esperado

- O sistema detecta a recarga com custo pendente
- Se Álika tiver saldo >= R$ 17,00, o débito é feito automaticamente
- Notificação admin gerada e log de auditoria registrado

