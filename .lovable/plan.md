

## Problema Identificado

As notificações **não estão sendo salvas** no banco de dados porque o campo `id` da tabela `admin_notifications` é do tipo `uuid`, mas o código gera IDs com prefixos como `"web-abc123..."`, `"tg-upd-xyz..."` que não são UUIDs válidos. Isso causa erro silencioso em cada inserção.

Erros no banco:
```
invalid input syntax for type uuid: "web-9734f477-96f1-4704-9986-778ec8052108"
invalid input syntax for type uuid: "tg-upd-011740fa-8260-4c05-b46d-a8356d0bd17e"
```

## Plano de Correção

### 1. Migration: Alterar coluna `id` de `uuid` para `text`

Isso permite IDs com prefixos (`web-`, `tg-`, `tg-upd-`, UUIDs puros de transactions/recargas). Recriar as policies RLS após a alteração.

### 2. Atualizar `RealtimeNotifications.tsx`

Remover o cast `as any` agora desnecessário e garantir que o tipo `id` seja tratado como `text` nas operações de insert, update e delete.

### 3. Atualizar `types.ts`

O arquivo é auto-gerado, então apenas a migration resolverá a tipagem automaticamente.

---

**Detalhes técnicos da migration:**

```sql
ALTER TABLE admin_notifications 
  ALTER COLUMN id SET DATA TYPE text 
  USING id::text;

ALTER TABLE admin_notifications 
  ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
```

Isso preserva o default automático para IDs que não forem fornecidos, mas aceita qualquer string como ID.

