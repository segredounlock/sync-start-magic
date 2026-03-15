

## Adicionar Template "Recarga Maluca" ao Broadcast

Adicionar um novo template ao array `TEMPLATES` em `src/components/BroadcastForm.tsx` com texto promocional para a promoção de fim de semana.

### Mudança

No array `TEMPLATES` (linha ~38), adicionar um 5º item:

```ts
{ key: 'maluca', label: 'Recarga Maluca', emoji: '🤪', color: 'bg-orange-600/80',
  title: '🤪🔥 RECARGA MALUCA do FDS!',
  message: '⚡ Todo fim de semana tem RECARGA MALUCA!\n\n💰 Preços EXCLUSIVOS e DIFERENCIADOS que você só encontra aqui!\n\n📱 Recarregue já e aproveite antes que acabe!\n\n⏰ Válido sábado e domingo!' }
```

Ajustar o grid de templates de `grid-cols-2` para acomodar 5 itens (última linha com item centralizado ou manter 2 colunas com 3 linhas).

