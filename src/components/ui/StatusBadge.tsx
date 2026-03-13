import { cn } from "@/lib/utils";

type RecargaStatus = "completed" | "concluida" | "pending" | "falha" | string;
type DepositStatus = "completed" | "confirmado" | "pending" | "expired" | "failed" | "cancelled" | string;

interface StatusBadgeProps {
  status: string;
  /** "recarga" uses Concluída/Processando/Falha; "deposit" uses Confirmado/Processando/Expirado */
  type?: "recarga" | "deposit";
  className?: string;
  /** Include border in classes */
  withBorder?: boolean;
}

const recargaLabels: Record<string, string> = {
  completed: "Concluída",
  concluida: "Concluída",
  pending: "Processando",
  falha: "Falha",
};

const depositLabels: Record<string, string> = {
  completed: "Confirmado",
  confirmado: "Confirmado",
  pending: "Processando",
  expired: "Expirado",
  failed: "Falhou",
  cancelled: "Cancelado",
};

function getVariant(status: string, type: "recarga" | "deposit") {
  const isSuccess =
    type === "recarga"
      ? status === "completed" || status === "concluida"
      : status === "completed" || status === "confirmado";
  const isPending = status === "pending";

  if (isSuccess) return "success" as const;
  if (isPending) return "warning" as const;
  return "destructive" as const;
}

const variantClasses = {
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  destructive: "bg-destructive/15 text-destructive",
} as const;

const variantBorderClasses = {
  success: "border-success/30",
  warning: "border-warning/30",
  destructive: "border-destructive/30",
} as const;

/**
 * Consistent status badge for recargas and deposits.
 * Eliminates repeated status label/class logic across all pages.
 *
 * Usage:
 *   <StatusBadge status={r.status} type="recarga" />
 *   <StatusBadge status={t.status} type="deposit" />
 */
export function StatusBadge({
  status,
  type = "recarga",
  className,
  withBorder = false,
}: StatusBadgeProps) {
  const variant = getVariant(status, type);
  const labels = type === "recarga" ? recargaLabels : depositLabels;
  const label = labels[status] || status;

  return (
    <span
      className={cn(
        "inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold",
        variantClasses[variant],
        withBorder && `border ${variantBorderClasses[variant]}`,
        className,
      )}
    >
      {label}
    </span>
  );
}

/** Helper to get just the label text */
export function getStatusLabel(status: string, type: "recarga" | "deposit" = "recarga"): string {
  const labels = type === "recarga" ? recargaLabels : depositLabels;
  return labels[status] || status;
}

/** Helper to get just the variant */
export function getStatusVariant(status: string, type: "recarga" | "deposit" = "recarga") {
  return getVariant(status, type);
}

/** Helper to get the CSS classes */
export function getStatusClasses(status: string, type: "recarga" | "deposit" = "recarga", withBorder = false): string {
  const variant = getVariant(status, type);
  return cn(variantClasses[variant], withBorder && `border ${variantBorderClasses[variant]}`);
}

export default StatusBadge;
