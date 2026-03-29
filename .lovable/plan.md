

## Remover nome do usuário do body das notificações push

O texto "from" exibido na notificação é gerado pelo **sistema operacional** e não pode ser removido pelo código. Ele sempre mostra a origem da notificação.

Porém, podemos **remover a linha `👤 userName`** do body, deixando só valor, custo e telefone.

### Mudança

**Arquivo:** `supabase/functions/sync-pending-recargas/index.ts`

Nas 3 notificações push (sucesso, falha, expirada), remover `👤 nome` do body:

- **Sucesso** (linha ~157): body passa de `👤 nome\n💰 Custo...\n📞 tel` para `💰 Custo...\n📞 tel`
- **Falha** (linha ~215): remover `👤 nome` do body
- **Expirada** (linha ~283): remover `👤 nome` do body

### Resultado
- Notificação fica mais compacta: só operadora/valor no título, custo e telefone no body
- O "from" do OS continuará aparecendo pois é comportamento do sistema

