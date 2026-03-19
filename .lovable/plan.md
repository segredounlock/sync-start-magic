

## Sistema de Notificação Automática de Atraso no PIX

### Problema
Quando o gateway PixGo apresenta lentidão, o usuário fica esperando sem feedback. Atualmente não há comunicação proativa informando que o pagamento está sendo processado.

### Solução
Adicionar lógica de notificação automática diretamente na Edge Function `check-pending-pix` (que já roda a cada 2 minutos via cron). Quando um depósito pendente ultrapassar um tempo configurável (ex: 5 minutos), o sistema envia automaticamente uma mensagem via Telegram e Push informando que o pagamento está sendo processado.

### Detalhes Técnicos

**1. Adicionar coluna de controle na tabela `transactions`**

Nova migração SQL:
```sql
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS delay_notified boolean DEFAULT false;
```

Isso evita enviar a mensagem de atraso mais de uma vez para o mesmo depósito.

**2. Modificar `check-pending-pix/index.ts`**

Após o loop de verificação de status na API, adicionar uma etapa que:

- Identifica depósitos pendentes há mais de **5 minutos** que ainda não foram notificados (`delay_notified = false`)
- Consulta o status na API do gateway (PixGo/MP) para verificar:
  - Se está `pending` → envia mensagem "processando"
  - Se está com status de disputa/MED → envia alerta diferente ao admin
  - Se a API retorna erro/timeout → informa "verificando com o gateway"
- Envia notificação via Telegram (se o usuário tem `telegram_id`) e Push (PWA)
- Marca `delay_notified = true` na transação

**3. Mensagem automática enviada ao usuário (Telegram + Push)**

```
⏳ Processando seu PIX...

Seu pagamento de R$ XX,XX foi identificado e está sendo
processado pelo nosso sistema. Em momentos de alta demanda,
pode haver um pequeno atraso na confirmação.

⏱ Tempo estimado: até 15 minutos
✅ Seu saldo será creditado automaticamente

Caso demore mais que 30 minutos, entre em contato
com nosso suporte.

📢 Grupo de Suporte: [link]
```

**4. Configuração via `system_config`**

Duas novas chaves opcionais:
- `pixDelayThresholdMinutes` → tempo em minutos para disparar (padrão: 5)
- `supportGroupLink` → link do grupo de suporte para incluir na mensagem

### Arquivos alterados

| Arquivo | Descrição |
|---------|-----------|
| `supabase/functions/check-pending-pix/index.ts` | Adicionar lógica de notificação de atraso |
| Nova migração SQL | Adicionar coluna `delay_notified` em `transactions` |

### Fluxo

```text
Cron (2 min) → check-pending-pix
  │
  ├─ Para cada depósito pendente:
  │   ├─ Verifica status na API do gateway
  │   ├─ Se confirmado → credita saldo (já existente)
  │   ├─ Se pendente + >5 min + não notificado:
  │   │   ├─ Envia Telegram "processando..."
  │   │   ├─ Envia Push "processando..."
  │   │   └─ Marca delay_notified = true
  │   └─ Se expirado → marca expired (já existente)
```

