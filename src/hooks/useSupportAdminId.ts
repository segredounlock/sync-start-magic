import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const FALLBACK_TELEGRAM_ID = "1901426549";

let cache: { telegramId: string; userId: string } | null = null;

export function useSupportAdminId() {
  const [telegramId, setTelegramId] = useState(cache?.telegramId || FALLBACK_TELEGRAM_ID);
  const [userId, setUserId] = useState(cache?.userId || "");

  useEffect(() => {
    if (cache) {
      setTelegramId(cache.telegramId);
      setUserId(cache.userId);
      return;
    }

    supabase
      .from("system_config")
      .select("key, value")
      .in("key", ["supportAdminTelegramId", "supportAdminUserId"])
      .then(({ data }) => {
        const tgId = data?.find(r => r.key === "supportAdminTelegramId")?.value || FALLBACK_TELEGRAM_ID;
        const uId = data?.find(r => r.key === "supportAdminUserId")?.value || "";
        cache = { telegramId: tgId, userId: uId };
        setTelegramId(tgId);
        setUserId(uId);
      });
  }, []);

  return { supportAdminTelegramId: telegramId, supportAdminUserId: userId };
}

/** Standalone fetch for non-hook contexts */
export async function getSupportAdminTelegramId(): Promise<string> {
  if (cache) return cache.telegramId;
  const { data } = await supabase
    .from("system_config")
    .select("key, value")
    .in("key", ["supportAdminTelegramId", "supportAdminUserId"]);
  const tgId = data?.find(r => r.key === "supportAdminTelegramId")?.value || FALLBACK_TELEGRAM_ID;
  const uId = data?.find(r => r.key === "supportAdminUserId")?.value || "";
  cache = { telegramId: tgId, userId: uId };
  return tgId;
}

export function invalidateSupportAdminCache() {
  cache = null;
}
