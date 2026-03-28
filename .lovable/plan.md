

# Aplicar 3 Correções Seguras de RLS

## Correções

### 1. Migration SQL com as 3 correções

**`license_logs`** — trocar `master` (inexistente) por `admin`:
```sql
DROP POLICY "Admins can view license logs" ON public.license_logs;
CREATE POLICY "Admins can view license logs" ON public.license_logs
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'));
```

**`broadcast-images`** — restringir DELETE a admins:
```sql
DROP POLICY IF EXISTS "Authenticated can delete broadcast images" ON storage.objects;
CREATE POLICY "Admins can delete broadcast images" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'broadcast-images' AND has_role(auth.uid(), 'admin'));
```

**`receipts`** — restringir DELETE/UPDATE ao dono:
```sql
DROP POLICY IF EXISTS "Authenticated users can delete receipts" ON storage.objects;
CREATE POLICY "Users can delete own receipts" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'receipts' AND (auth.uid())::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Authenticated users can update receipts" ON storage.objects;
CREATE POLICY "Users can update own receipts" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'receipts' AND (auth.uid())::text = (storage.foldername(name))[1]);
```

### 2. Atualizar `documentation/AUDITORIA.md`

Adicionar seção de correções aplicadas em 2026-03-28 com as 3 correções documentadas.

### Garantias
- Nenhum componente frontend alterado
- Nenhuma edge function alterada
- Nenhum filtro de path do storage alterado
- Risco de quebra: ZERO nas 3 correções

