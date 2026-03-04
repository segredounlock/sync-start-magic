import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Returns Tailwind classes for operadora badge (bg + text + border) */
export function operadoraColors(name: string | null | undefined): { bg: string; text: string; border: string } {
  switch ((name || "").toUpperCase()) {
    case "TIM":
      return { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30" };
    case "VIVO":
      return { bg: "bg-purple-500/15", text: "text-purple-400", border: "border-purple-500/30" };
    case "CLARO":
      return { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30" };
    case "OI":
      return { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30" };
    default:
      return { bg: "bg-muted/50", text: "text-muted-foreground", border: "border-border" };
  }
}
