import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const EdgeRuntime: { waitUntil(promise: Promise<unknown>): void };

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const BATCH_SIZE = 25;
const BATCH_DELAY = 1100;

async function getBotToken(): Promise<string> {
  const { data } = await supabase
    .from('bot_settings')
    .select('value')
    .eq('key', 'telegram_bot_token')
    .maybeSingle();
  if (data?.value) return data.value;

  const { data: sysData } = await supabase
    .from('system_config')
    .select('value')
    .eq('key', 'telegramBotToken')
    .maybeSingle();
  if (sysData?.value) return sysData.value;

  throw new Error('No Telegram bot token configured');
}

async function deleteBroadcastMessages(notificationId: string) {
  console.log(`[DELETE-BROADCAST] Starting delete for notification=${notificationId}`);

  const botToken = await getBotToken();

  // Fetch all saved message records for this notification
  const { data: messages, error } = await supabase
    .from('broadcast_messages')
    .select('telegram_id, message_id')
    .eq('notification_id', notificationId);

  if (error) {
    console.error('[DELETE-BROADCAST] Error fetching messages:', error.message);
    return { deleted: 0, failed: 0, total: 0, error: error.message };
  }

  if (!messages || messages.length === 0) {
    console.log('[DELETE-BROADCAST] No messages found for this notification');
    return { deleted: 0, failed: 0, total: 0, error: 'Nenhuma mensagem salva para esta notificação' };
  }

  console.log(`[DELETE-BROADCAST] Found ${messages.length} messages to delete`);

  let deleted = 0;
  let failed = 0;

  // Process in batches
  for (let i = 0; i < messages.length; i += BATCH_SIZE) {
    const batch = messages.slice(i, i + BATCH_SIZE);

    const promises = batch.map(async (msg: any, index: number) => {
      await new Promise(resolve => setTimeout(resolve, index * 40));

      try {
        const response = await fetch(
          `https://api.telegram.org/bot${botToken}/deleteMessage`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: msg.telegram_id,
              message_id: msg.message_id,
            }),
          }
        );
        const result = await response.json();
        return result.ok;
      } catch {
        return false;
      }
    });

    const results = await Promise.all(promises);
    for (const ok of results) {
      if (ok) deleted++;
      else failed++;
    }

    // Rate limit between batches
    if (i + BATCH_SIZE < messages.length) {
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
    }
  }

  // Clean up the records after deletion
  if (deleted > 0) {
    await supabase
      .from('broadcast_messages')
      .delete()
      .eq('notification_id', notificationId);
  }

  console.log(`[DELETE-BROADCAST] Done: deleted=${deleted} failed=${failed} total=${messages.length}`);
  return { deleted, failed, total: messages.length };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { notification_id } = await req.json();

    if (!notification_id) {
      return new Response(JSON.stringify({ error: 'notification_id é obrigatório' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if there are saved messages
    const { count } = await supabase
      .from('broadcast_messages')
      .select('*', { count: 'exact', head: true })
      .eq('notification_id', notification_id);

    if (!count || count === 0) {
      return new Response(JSON.stringify({
        error: 'Nenhuma mensagem salva para esta notificação. Apenas broadcasts enviados após a atualização do sistema podem ser deletados.',
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Run deletion in background for large broadcasts
    if (count > 50) {
      const promise = deleteBroadcastMessages(notification_id);
      EdgeRuntime.waitUntil(promise);

      return new Response(JSON.stringify({
        success: true,
        message: `Deletando ${count} mensagens em segundo plano...`,
        total: count,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // For small broadcasts, wait for completion
    const result = await deleteBroadcastMessages(notification_id);

    return new Response(JSON.stringify({
      success: true,
      ...result,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('[DELETE-BROADCAST] Error:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
