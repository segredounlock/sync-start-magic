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

/** Minimal style override – positioning is handled by CSS on [data-sonner-toaster] */
function randomStyle(): React.CSSProperties {
  return { zIndex: 9999 };
}

type ToastOpts = Parameters<typeof toast>[1];

/** ── Notificações de negócio ─────────────────────────── */

export const appToast = {
  // Depósitos
  depositConfirmed: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(DollarSign, "text-success"), style: randomStyle() }),

  // Recargas
  recargaProcessing: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(Smartphone, "text-primary"), style: randomStyle() }),
  recargaCompleted: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(CheckCircle2, "text-success"), style: randomStyle() }),
  recargaFailed: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(XCircle, "text-destructive"), style: randomStyle() }),

  // Cadastros
  newUserWeb: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(UserPlus, "text-success"), style: randomStyle() }),
  newUserTelegram: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(Bot, "text-primary"), style: randomStyle() }),

  // Auth
  loginSuccess: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(LogIn, "text-success"), style: randomStyle() }),
  logoutSuccess: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(LogOut, "text-muted-foreground"), style: randomStyle() }),
  authError: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(Ban, "text-destructive"), style: randomStyle() }),
  pinSuccess: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(Key, "text-success"), style: randomStyle() }),
  emailSent: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(Mail, "text-primary"), style: randomStyle() }),
  passwordChanged: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(ShieldCheck, "text-success"), style: randomStyle() }),

  // CRUD / ações genéricas
  saved: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(Save, "text-success"), style: randomStyle() }),
  deleted: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(Trash2, "text-destructive"), style: randomStyle() }),
  refreshed: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(RefreshCw, "text-primary"), style: randomStyle() }),
  uploaded: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(Upload, "text-success"), style: randomStyle() }),
  downloaded: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(Download, "text-primary"), style: randomStyle() }),
  sent: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(Send, "text-success"), style: randomStyle() }),

  // Status genéricos
  success: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(CheckCircle2, "text-success"), style: randomStyle() }),
  error: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(XCircle, "text-destructive"), style: randomStyle() }),
  warning: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(AlertTriangle, "text-warning"), style: randomStyle() }),
  info: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(Info, "text-primary"), style: randomStyle() }),
  loading: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(Clock, "text-muted-foreground"), style: randomStyle() }),
  blocked: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(Ban, "text-destructive"), style: randomStyle() }),
  starred: (msg: string, opts?: ToastOpts) =>
    toast(msg, { ...opts, icon: iconNode(Star, "text-warning"), style: randomStyle() }),
};

/**
 * Drop-in replacement for `import { toast } from "sonner"`.
 */
export const styledToast = Object.assign(
  (msg: string, opts?: ToastOpts) => toast(msg, { ...opts, icon: iconNode(Info, "text-primary"), style: randomStyle() }),
  {
    success: appToast.success,
    error: appToast.error,
    warning: appToast.warning,
    info: appToast.info,
    message: (msg: string, opts?: ToastOpts) => toast(msg, { ...opts, icon: iconNode(Info, "text-primary"), style: randomStyle() }),
  }
);
