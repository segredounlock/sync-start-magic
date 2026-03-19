import { Info, type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";

interface InfoItem {
  icon: LucideIcon;
  iconColor?: string;
  label: string;
  description: string;
}

interface InfoCardProps {
  title?: string;
  items: InfoItem[];
  /** Optional extra content below the items */
  children?: ReactNode;
}

/**
 * Card de resumo explicativo reutilizável.
 * Usado em todas as seções do painel admin para contextualizar cada funcionalidade.
 */
export function InfoCard({ title = "Como funciona", items, children }: InfoCardProps) {
  return (
    <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 space-y-2">
      <div className="flex items-center gap-2 text-primary">
        <Info className="h-4 w-4 shrink-0" />
        <span className="text-sm font-medium">{title}</span>
      </div>
      <div className="grid gap-2 text-xs text-muted-foreground">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="flex items-start gap-2">
              <Icon className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${item.iconColor || "text-primary"}`} />
              <span>
                <strong className="text-foreground">{item.label}:</strong> {item.description}
              </span>
            </div>
          );
        })}
      </div>
      {children}
    </div>
  );
}
