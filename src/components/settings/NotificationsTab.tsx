import { useEffect, useState, useCallback, useMemo } from "react";
import { Bell, Send, BellOff, CheckCircle2, Loader2, LinkIcon, Smartphone, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { styledToast as toast } from "@/lib/toast";

interface NotificationsTabProps {
  userId: string;
  telegramLinked: boolean;
  telegramUsername: string;
}

export function NotificationsTab({ userId, telegramLinked, telegramUsername }: NotificationsTabProps) {
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(true);
  const [activating, setActivating] = useState(false);

  // Detect iOS not in standalone
  const iosNotInstalled = useMemo(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (!isIOS) return false;
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
      || (navigator as any).standalone === true;
    return !isStandalone;
  }, []);

  const pushSupported = useMemo(() =>
    "serviceWorker" in navigator && "PushManager" in window,
  []);

  const checkPushStatus = useCallback(async () => {
    if (!pushSupported) {
      setPushLoading(false);
      return;
    }
    try {
      const reg = await navigator.serviceWorker.getRegistration("/sw-push.js");
      if (reg) {
        const sub = await reg.pushManager.getSubscription();
        setPushEnabled(!!sub);
      }
    } catch {}
    setPushLoading(false);
  }, [pushSupported]);

  useEffect(() => {
    checkPushStatus();
  }, [checkPushStatus]);

  const handleActivatePush = async () => {
    setActivating(true);
    try {
      const { data: setupData, error: setupErr } = await supabase.functions.invoke("vapid-setup");
      if (setupErr || !setupData?.publicKey) {
        toast.error("Erro ao configurar notificações push");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("Permissão de notificação negada");
        return;
      }

      let registration = await navigator.serviceWorker.getRegistration("/sw-push.js");
      if (!registration) {
        registration = await navigator.serviceWorker.register("/sw-push.js");
        await registration.update();
        if (!registration.active) {
          await new Promise<void>((resolve) => {
            const sw = registration!.installing || registration!.waiting;
            if (!sw) { resolve(); return; }
            sw.addEventListener("statechange", () => { if (sw.state === "activated") resolve(); });
          });
        }
      }

      const vapidPublicKey = setupData.publicKey;
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      const json = subscription.toJSON();
      await supabase.from("push_subscriptions").upsert(
        {
          user_id: userId,
          endpoint: json.endpoint!,
          p256dh: json.keys!.p256dh,
          auth: json.keys!.auth,
        },
        { onConflict: "user_id,endpoint" }
      );

      setPushEnabled(true);
      toast.success("Notificações push ativadas!");
    } catch (e) {
      console.error("[Push] Error:", e);
      toast.error("Erro ao ativar notificações");
    } finally {
      setActivating(false);
    }
  };

  const handleDeactivatePush = async () => {
    try {
      const reg = await navigator.serviceWorker.getRegistration("/sw-push.js");
      if (reg) {
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await sub.unsubscribe();
          await supabase.from("push_subscriptions").delete().eq("user_id", userId).eq("endpoint", sub.endpoint);
        }
      }
      setPushEnabled(false);
      toast.success("Notificações push desativadas");
    } catch {
      toast.error("Erro ao desativar");
    }
  };

  const handleUnlinkTelegram = async () => {
    try {
      await supabase.from("profiles").update({ telegram_id: null, telegram_username: null } as any).eq("id", userId);
      toast.success("Telegram desvinculado! Recarregue a página.");
    } catch {
      toast.error("Erro ao desvincular");
    }
  };

  const canActivatePush = pushSupported && !iosNotInstalled;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Push Notifications */}
      <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <h3 className="text-base font-bold text-foreground">Push Notifications</h3>
        </div>
        <p className="text-xs text-muted-foreground">Receba alertas no navegador ou celular.</p>

        {/* Status card */}
        <div className="p-4 rounded-xl bg-muted/30 flex items-center gap-3">
          {pushLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : pushEnabled ? (
            <>
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm font-bold text-success">Notificações Ativadas</p>
                <p className="text-xs text-muted-foreground">Você receberá alertas sobre suas recargas.</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <BellOff className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Notificações Desativadas</p>
                <p className="text-xs text-muted-foreground">Ative para saber quando suas recargas forem concluídas.</p>
              </div>
            </>
          )}
        </div>

        {/* Soft ask - benefits card (only when not enabled) */}
        {!pushEnabled && !pushLoading && (
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <Bell className="h-4 w-4" />
              <span className="text-xs font-semibold">Por que ativar?</span>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1 ml-6 list-disc">
              <li>Saiba <strong className="text-foreground">instantaneamente</strong> quando seu depósito for confirmado</li>
              <li>Receba alertas de <strong className="text-foreground">recargas concluídas</strong></li>
              <li>Fique por dentro de <strong className="text-foreground">promoções exclusivas</strong></li>
            </ul>
          </div>
        )}

        {/* iOS warning */}
        {iosNotInstalled && !pushEnabled && !pushLoading && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <div className="text-xs text-muted-foreground">
              <p className="font-semibold text-amber-600 dark:text-amber-400">Necessário instalar o app</p>
              <p className="mt-1">
                No iPhone, as notificações push só funcionam se o app estiver{" "}
                <strong className="text-foreground">instalado na tela inicial</strong>.
                Toque em <Smartphone className="h-3 w-3 inline-block mx-0.5" /> Compartilhar → "Adicionar à Tela de Início" e depois ative aqui.
              </p>
            </div>
          </div>
        )}

        {/* Action button */}
        {pushEnabled ? (
          <button
            onClick={handleDeactivatePush}
            className="w-full py-3 rounded-xl bg-destructive/10 text-destructive text-sm font-bold hover:bg-destructive/20 transition-colors"
          >
            Desativar Notificações
          </button>
        ) : (
          <button
            onClick={handleActivatePush}
            disabled={activating || !canActivatePush}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {activating && <Loader2 className="h-4 w-4 animate-spin" />}
            {iosNotInstalled ? "Instale o app primeiro" : "Ativar Agora"}
          </button>
        )}
      </div>

      {/* Telegram Bot */}
      <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Send className="h-5 w-5 text-primary" />
          <h3 className="text-base font-bold text-foreground">Telegram Bot</h3>
        </div>
        <p className="text-xs text-muted-foreground">Receba atualizações no seu app do Telegram.</p>

        <div className="p-4 rounded-xl bg-muted/30 flex items-center gap-3">
          {telegramLinked ? (
            <>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-primary">Conta Vinculada</p>
                <p className="text-xs text-muted-foreground">
                  {telegramUsername ? `@${telegramUsername} — ` : ""}Você receberá mensagens do nosso bot.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <LinkIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Não Vinculado</p>
                <p className="text-xs text-muted-foreground">Vincule sua conta pelo bot do Telegram.</p>
              </div>
            </>
          )}
        </div>

        {telegramLinked ? (
          <button
            onClick={handleUnlinkTelegram}
            className="w-full py-3 rounded-xl bg-destructive text-white text-sm font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <LinkIcon className="h-4 w-4" /> Desvincular Telegram
          </button>
        ) : (
          <p className="text-xs text-center text-muted-foreground py-2">
            Use o comando <span className="font-mono font-bold">/start</span> no nosso bot do Telegram para vincular.
          </p>
        )}
      </div>
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}
