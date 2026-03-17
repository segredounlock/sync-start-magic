import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Zap } from "lucide-react";

interface Template {
  id: string;
  title: string;
  content: string;
  shortcut: string | null;
  category: string;
  usage_count: number;
}

interface Props {
  onSelectTemplate: (content: string) => void;
  compact?: boolean;
}

export function SupportTemplates({ onSelectTemplate, compact = false }: Props) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = useCallback(async () => {
    const { data } = await (supabase.from("support_templates") as any)
      .select("*")
      .order("usage_count", { ascending: false });
    setTemplates(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const handleSelect = async (t: Template) => {
    onSelectTemplate(t.content);
    await (supabase.from("support_templates") as any)
      .update({ usage_count: t.usage_count + 1 })
      .eq("id", t.id);
  };

  if (loading) return <Loader2 className="w-4 h-4 animate-spin text-muted-foreground mx-auto" />;
  if (templates.length === 0) return null;

  return (
    <div className={compact ? "space-y-1" : "space-y-2"}>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1">
        <Zap className="w-3 h-3" /> Respostas Rápidas
      </p>
      <div className={compact ? "flex flex-wrap gap-1" : "space-y-1"}>
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => handleSelect(t)}
            className={compact
              ? "px-2 py-1 rounded-lg bg-muted/60 text-[11px] text-foreground hover:bg-muted transition-colors truncate max-w-[180px]"
              : "w-full text-left px-3 py-2 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors"
            }
            title={t.content}
          >
            {compact ? t.title : (
              <div>
                <p className="text-xs font-medium text-foreground">{t.title}</p>
                <p className="text-[10px] text-muted-foreground truncate">{t.content}</p>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
