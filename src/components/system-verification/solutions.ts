import type { SolutionInfo } from "./types";

export const SOLUTIONS: Record<string, SolutionInfo> = {
  // Tables
  "table:missing": {
    fixable: false,
    riskLevel: "high",
    instruction: "Execute o Publish no Lovable Cloud para aplicar as migrations pendentes. Se for espelho, faça Publish no ambiente do espelho.",
    sqlHint: "-- A tabela será criada automaticamente pelo Publish.\n-- Se precisar criar manualmente:\n-- CREATE TABLE public.NOME_TABELA (\n--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\n--   created_at timestamptz DEFAULT now()\n-- );",
  },
  // Columns
  "column:missing": {
    fixable: false,
    riskLevel: "medium",
    instruction: "Esta coluna está faltando na tabela. Execute o Publish para aplicar migrations pendentes, ou adicione manualmente via SQL.",
    sqlHint: "-- ALTER TABLE public.TABELA\n-- ADD COLUMN nome_coluna tipo_dado DEFAULT valor_padrao;",
  },
  // RLS
  "rls:missing": {
    fixable: false,
    riskLevel: "high",
    instruction: "⚠️ RISCO ALTO: Esta tabela está sem proteção RLS. Dados podem estar expostos. Crie uma política via migration SQL.",
    sqlHint: "-- ALTER TABLE public.TABELA ENABLE ROW LEVEL SECURITY;\n-- CREATE POLICY \"Admins can manage\"\n--   ON public.TABELA FOR ALL TO authenticated\n--   USING (has_role(auth.uid(), 'admin'))\n--   WITH CHECK (has_role(auth.uid(), 'admin'));",
  },
  // Functions
  "fn:missing": {
    fixable: false,
    riskLevel: "high",
    instruction: "Esta função SQL é necessária para o sistema funcionar. Faça Publish no Lovable Cloud para aplicar migrations pendentes.",
  },
  // Edge Functions
  "edge:missing": {
    fixable: false,
    riskLevel: "medium",
    instruction: "Faça deploy pelo Lovable Cloud (Publish). Em espelhos, verifique se o código foi sincronizado via GitHub e faça Publish no ambiente do espelho.",
  },
  // Storage
  "bucket:missing": {
    fixable: true,
    riskLevel: "low",
    instruction: "Clique em 'Criar' para criar este bucket automaticamente.",
  },
  // Config
  "config:missing": {
    fixable: true,
    riskLevel: "low",
    instruction: "Clique em 'Inicializar' para criar esta configuração com valor padrão.",
  },
  // Triggers
  "trigger:missing": {
    fixable: false,
    riskLevel: "medium",
    instruction: "Este trigger é necessário para atualizar timestamps automaticamente. Faça Publish para aplicar.",
    sqlHint: "-- CREATE TRIGGER update_TABELA_updated_at\n--   BEFORE UPDATE ON public.TABELA\n--   FOR EACH ROW\n--   EXECUTE FUNCTION update_updated_at_column();",
  },
  // Payment
  "payment:missing": {
    fixable: false,
    riskLevel: "medium",
    instruction: "Configure esta chave na aba Configurações > Pagamentos do painel admin. Sem isso, depósitos PIX não funcionarão.",
  },
  // Mirror
  "mirror:desync": {
    fixable: false,
    riskLevel: "medium",
    instruction: "O espelho está desatualizado. Acesse Ferramentas > Sync e execute uma sincronização. Depois, faça Publish no ambiente espelho.",
  },
  "mirror:conflict": {
    fixable: false,
    riskLevel: "high",
    instruction: "Existem conflitos entre o sistema principal e o espelho. Resolva manualmente verificando os arquivos conflitantes no painel de Sync.",
  },
};
