import { toast } from "sonner";
import {
  DollarSign,
  Smartphone,
  UserPlus,
  Bot,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  ShieldCheck,
  Key,
  Mail,
  LogIn,
  LogOut,
  Save,
  Trash2,
  RefreshCw,
  Upload,
  Download,
  Send,
  Ban,
  Clock,
  Star,
  type LucideIcon,
} from "lucide-react";
import { type ReactNode } from "react";

function iconNode(Icon: LucideIcon, color: string): ReactNode {
  return <Icon className={`h-5 w-5 ${color}`} />;
}

type ToastOpts = Parameters<typeof toast>[1];

/** ── Notificações de negócio ─────────────────────────── */

export const appToast = {
  // Depósitos
  depositConfirmed: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(DollarSign, "text-success") }),

  // Recargas
  recargaProcessing: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(Smartphone, "text-primary") }),
  recargaCompleted: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(CheckCircle2, "text-success") }),
  recargaFailed: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(XCircle, "text-destructive") }),

  // Cadastros
  newUserWeb: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(UserPlus, "text-success") }),
  newUserTelegram: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(Bot, "text-primary") }),

  // Auth
  loginSuccess: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(LogIn, "text-success") }),
  logoutSuccess: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(LogOut, "text-muted-foreground") }),
  authError: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(Ban, "text-destructive") }),
  pinSuccess: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(Key, "text-success") }),
  emailSent: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(Mail, "text-primary") }),
  passwordChanged: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(ShieldCheck, "text-success") }),

  // CRUD / ações genéricas
  saved: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(Save, "text-success") }),
  deleted: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(Trash2, "text-destructive") }),
  refreshed: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(RefreshCw, "text-primary") }),
  uploaded: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(Upload, "text-success") }),
  downloaded: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(Download, "text-primary") }),
  sent: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(Send, "text-success") }),

  // Status genéricos — drop-in replacement for toast.success/error/warning/info
  success: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(CheckCircle2, "text-success") }),
  error: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(XCircle, "text-destructive") }),
  warning: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(AlertTriangle, "text-warning") }),
  info: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(Info, "text-primary") }),
  loading: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(Clock, "text-muted-foreground") }),
  blocked: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(Ban, "text-destructive") }),
  starred: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(Star, "text-warning") }),
};

/**
 * Drop-in replacement for `import { toast } from "sonner"`.
 * Maps toast.success/error/warning/info to styled versions with icons.
 * Usage: replace `import { toast } from "sonner"` with `import { styledToast as toast } from "@/lib/toast"`
 */
export const styledToast = Object.assign(
  (msg: string, opts?: ToastOpts) => toast(msg, { ...opts, icon: iconNode(Info, "text-primary") }),
  {
    success: appToast.success,
    error: appToast.error,
    warning: appToast.warning,
    info: appToast.info,
    message: (msg: string, opts?: ToastOpts) => toast(msg, { ...opts, icon: iconNode(Info, "text-primary") }),
  }
);
