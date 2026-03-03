import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { styledToast as toast } from "@/lib/toast";
import { confirm } from "@/lib/confirm";

interface UseCrudOptions {
  /** Callback to refresh data after mutation */
  onRefresh?: () => void | Promise<void>;
  /** Custom success messages */
  messages?: {
    created?: string;
    updated?: string;
    deleted?: string;
  };
}

/**
 * Hook global para operações CRUD com confirmação e toast automático.
 *
 * @example
 * const { remove, update, create } = useCrud("operadoras", { onRefresh: fetchData });
 * await remove(id, "Excluir esta operadora?");
 * await update(id, { nome: "Nova Operadora" });
 * await create({ nome: "Vivo", ativo: true });
 */
export function useCrud(table: string, options: UseCrudOptions = {}) {
  const { onRefresh, messages } = options;

  const create = useCallback(async (data: Record<string, any>) => {
    try {
      const { error } = await (supabase.from(table as any) as any).insert(data);
      if (error) throw error;
      toast.success(messages?.created || "Criado com sucesso!");
      await onRefresh?.();
      return true;
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar");
      return false;
    }
  }, [table, onRefresh, messages?.created]);

  const update = useCallback(async (id: string, data: Record<string, any>) => {
    try {
      const { error } = await (supabase.from(table as any) as any).update(data).eq("id", id);
      if (error) throw error;
      toast.success(messages?.updated || "Atualizado com sucesso!");
      await onRefresh?.();
      return true;
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar");
      return false;
    }
  }, [table, onRefresh, messages?.updated]);

  const remove = useCallback(async (id: string, confirmMessage?: string) => {
    if (confirmMessage) {
      const ok = await confirm(confirmMessage, { destructive: true });
      if (!ok) return false;
    }
    try {
      const { error } = await (supabase.from(table as any) as any).delete().eq("id", id);
      if (error) throw error;
      toast.success(messages?.deleted || "Excluído com sucesso!");
      await onRefresh?.();
      return true;
    } catch (err: any) {
      toast.error(err.message || "Erro ao excluir");
      return false;
    }
  }, [table, onRefresh, messages?.deleted]);

  const upsert = useCallback(async (data: Record<string, any>) => {
    try {
      const { error } = await (supabase.from(table as any) as any).upsert(data);
      if (error) throw error;
      toast.success(messages?.updated || "Salvo com sucesso!");
      await onRefresh?.();
      return true;
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar");
      return false;
    }
  }, [table, onRefresh, messages?.updated]);

  return { create, update, remove, upsert };
}
