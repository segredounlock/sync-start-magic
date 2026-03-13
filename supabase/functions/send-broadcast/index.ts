import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const EdgeRuntime: { waitUntil(promise: Promise<unknown>): void };

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const BATCH_SIZE = 25;
const BATCH_DELAY = 1100;

function isValidUUID(value: unknown): boolean {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return typeof value === 'string' && regex.test(value);
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const tokenCache = new Map<string, { token: string; time: number }>();
const CACHE_TTL = 60000;

// Track active broadcasts for graceful shutdown
const activeBroadcasts = new Map<string, string>(); // progressId -> notificationId

// Graceful shutdown: mark active broadcasts as cancelled
addEventListener('beforeunload', async () => {
  console.log(`[BROADCAST] beforeunload fired, ${activeBroadcasts.size} active broadcast(s)`);
  if (activeBroadcasts.size === 0) return;

  const promises = Array.from(activeBroadcasts.entries()).map(([progressId]) =>
    supabase.from('broadcast_progress').update({
      status: 'cancelled',
      error_message: 'Servidor reiniciado durante envio. Retome o broadcast.',
      completed_at: new Date().toISOString(),
    }).eq('id', progressId)
  );

  await Promise.allSettled(promises);
  console.log('[BROADCAST] beforeunload cleanup done');
});

async function getBotToken(): Promise<string> {
  const now = Date.now();
  const cached = tokenCache.get('global');
  if (cached && now - cached.time < CACHE_TTL) return cached.token;

  const { data } = await supabase
    .from('bot_settings')
    .select('value')
    .eq('key', 'telegram_bot_token')
    .maybeSingle();

  if (data?.value) {
    tokenCache.set('global', { token: data.value, time: now });
    return data.value;
  }

  const { data: sysData } = await supabase
    .from('system_config')
    .select('value')
    .eq('key', 'telegramBotToken')
    .maybeSingle();

  if (sysData?.value) {
    tokenCache.set('global', { token: sysData.value, time: now });
    return sysData.value;
  }

  throw new Error('No Telegram bot token configured');
}

async function sendTelegramMessage(
  botToken: string,
  chatId: number,
  text: string,
  imageUrl?: string | null,
  buttons?: Array<{ text: string; url: string }>,
  messageEffectId?: string | null,
  retries = 2
): Promise<{ ok: boolean; error_code?: number }> {
  const hasImage = imageUrl && imageUrl.trim().length > 0;
  const url = hasImage
    ? `https://api.telegram.org/bot${botToken}/sendPhoto`
    : `https://api.telegram.org/bot${botToken}/sendMessage`;

  let replyMarkup = undefined;
  if (buttons && buttons.length > 0) {
    replyMarkup = {
      inline_keyboard: [buttons.map(btn => ({ text: btn.text, url: btn.url }))]
    };
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const body = hasImage
        ? {
            chat_id: chatId, photo: imageUrl, caption: text, parse_mode: 'HTML',
            ...(replyMarkup && { reply_markup: replyMarkup }),
            ...(messageEffectId && { message_effect_id: messageEffectId }),
          }
        : {
            chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true,
            ...(replyMarkup && { reply_markup: replyMarkup }),
            ...(messageEffectId && { message_effect_id: messageEffectId }),
          };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (result.error_code === 429 && attempt < retries) {
        const retryAfter = result.parameters?.retry_after || 5;
        console.log(`[BROADCAST] Rate limited, waiting ${retryAfter}s`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        continue;
      }

      return result;
    } catch {
      if (attempt === retries) return { ok: false, error_code: 0 };
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return { ok: false, error_code: 0 };
}

async function updateProgress(progressId: string, updates: Record<string, unknown>) {
  await supabase.from('broadcast_progress').update(updates).eq('id', progressId);
}

async function sendBroadcastInBackground(
  notificationId: string,
  progressId: string,
  includeUnregistered: boolean = false,
  resumeFromBatch: number = 0,
  resumeSentCount: number = 0,
  resumeFailedCount: number = 0,
  resumeBlockedCount: number = 0
) {
  const startTime = Date.now();
  activeBroadcasts.set(progressId, notificationId);
  console.log(`[BROADCAST] START notif=${notificationId} progress=${progressId} resume=${resumeFromBatch}`);

  try {
    const botToken = await getBotToken();

    const { data: notification } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', notificationId)
      .single();

    if (!notification) {
      await updateProgress(progressId, { status: 'failed', error_message: 'Notificação não encontrada' });
      activeBroadcasts.delete(progressId);
      return;
    }

    let usersQuery = supabase
      .from('telegram_users')
      .select('telegram_id, first_name')
      .eq('is_blocked', false);

    if (!includeUnregistered) {
      usersQuery = usersQuery.eq('is_registered', true);
    }

    const { data: users, error: usersError } = await usersQuery;

    if (usersError) {
      await updateProgress(progressId, { status: 'failed', error_message: 'Erro ao buscar usuários' });
      activeBroadcasts.delete(progressId);
      return;
    }

    const totalUsers = users?.length || 0;
    const totalBatches = Math.ceil(totalUsers / BATCH_SIZE);
    console.log(`[BROADCAST] ${totalUsers} users, ${totalBatches} batches`);

    await updateProgress(progressId, {
      status: 'running',
      total_users: totalUsers,
      total_batches: totalBatches,
      started_at: resumeFromBatch === 0 ? new Date().toISOString() : undefined,
      error_message: null,
    });

    if (totalUsers === 0) {
      await updateProgress(progressId, { status: 'completed', completed_at: new Date().toISOString() });
      activeBroadcasts.delete(progressId);
      return;
    }

    let sentCount = resumeSentCount;
    let failedCount = resumeFailedCount;
    let blockedUsers: number[] = [];
    let blockedCount = resumeBlockedCount;
    let currentBatch = resumeFromBatch;

    const batches = [];
    for (let i = 0; i < totalUsers; i += BATCH_SIZE) {
      batches.push(users!.slice(i, i + BATCH_SIZE));
    }

    const batchesToProcess = resumeFromBatch > 0 ? batches.slice(resumeFromBatch) : batches;

    for (const batch of batchesToProcess) {
      currentBatch++;
      const batchStartTime = Date.now();

      const batchPromises = batch.map(async (user: any, index: number) => {
        await new Promise(resolve => setTimeout(resolve, index * 40));

        const message = `📢 <b>${notification.title}</b>\n\n${notification.message}`;
        const buttons = Array.isArray(notification.buttons) ? notification.buttons : [];

        try {
          const result = await sendTelegramMessage(
            botToken, user.telegram_id, message,
            notification.image_url,
            buttons as Array<{ text: string; url: string }>,
            notification.message_effect_id
          );

          if (result.ok) return { success: true, telegramId: user.telegram_id };
          if (result.error_code === 403) return { success: false, blocked: true, telegramId: user.telegram_id };
          return { success: false, telegramId: user.telegram_id };
        } catch {
          return { success: false, telegramId: user.telegram_id };
        }
      });

      const results = await Promise.all(batchPromises);

      for (const result of results) {
        if (result.success) sentCount++;
        else {
          failedCount++;
          if ((result as any).blocked) { blockedUsers.push(result.telegramId); blockedCount++; }
        }
      }

      const elapsedMs = Date.now() - startTime;
      const processedInThisRun = sentCount - resumeSentCount + failedCount - resumeFailedCount;
      const messagesPerSecond = processedInThisRun / (elapsedMs / 1000);
      const remainingMessages = totalUsers - (sentCount + failedCount);
      const estimatedSecondsRemaining = remainingMessages / Math.max(messagesPerSecond, 1);

      console.log(`[BROADCAST] batch ${currentBatch}/${totalBatches} sent=${sentCount} failed=${failedCount} speed=${messagesPerSecond.toFixed(1)}/s`);

      await updateProgress(progressId, {
        sent_count: sentCount,
        failed_count: failedCount,
        blocked_count: blockedCount,
        current_batch: currentBatch,
        speed_per_second: Math.round(messagesPerSecond * 10) / 10,
        estimated_completion: new Date(Date.now() + estimatedSecondsRemaining * 1000).toISOString(),
      });

      await supabase.from('notifications').update({ sent_count: sentCount }).eq('id', notificationId);

      if (currentBatch < totalBatches) {
        const waitTime = Math.max(BATCH_DELAY - (Date.now() - batchStartTime), 100);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    if (blockedUsers.length > 0) {
      await supabase.from('telegram_users')
        .update({ is_blocked: true, block_reason: 'telegram_blocked' })
        .in('telegram_id', blockedUsers);
    }

    await updateProgress(progressId, {
      status: 'completed', sent_count: sentCount, failed_count: failedCount,
      blocked_count: blockedCount, completed_at: new Date().toISOString(),
    });

    console.log(`[BROADCAST] COMPLETED notif=${notificationId} sent=${sentCount} failed=${failedCount} elapsed=${((Date.now() - startTime) / 1000).toFixed(1)}s`);
  } catch (error) {
    console.error(`[BROADCAST] ERROR notif=${notificationId}:`, error);
    await updateProgress(progressId, {
      status: 'failed', error_message: String(error), completed_at: new Date().toISOString(),
    });
  } finally {
    activeBroadcasts.delete(progressId);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { notification_id, include_unregistered = false, resume_progress_id } = body;

    // Resume logic
    if (resume_progress_id && isValidUUID(resume_progress_id)) {
      const { data: existingProgress } = await supabase
        .from('broadcast_progress')
        .select('*')
        .eq('id', resume_progress_id)
        .single();

      if (!existingProgress) {
        return new Response(JSON.stringify({ error: 'Progresso não encontrado' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      await supabase.from('broadcast_progress')
        .update({ status: 'running', error_message: null, completed_at: null })
        .eq('id', resume_progress_id);

      const promise = sendBroadcastInBackground(
        existingProgress.notification_id, String(resume_progress_id), true,
        existingProgress.current_batch, existingProgress.sent_count,
        existingProgress.failed_count, existingProgress.blocked_count
      );
      EdgeRuntime.waitUntil(promise);

      return new Response(JSON.stringify({
        success: true, message: 'Broadcast retomado', progress_id: String(resume_progress_id),
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // New broadcast
    if (!notification_id || !isValidUUID(notification_id)) {
      return new Response(JSON.stringify({ error: 'notification_id inválido' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: notification } = await supabase
      .from('notifications').select('id, title').eq('id', notification_id).single();

    if (!notification) {
      return new Response(JSON.stringify({ error: 'Notificação não encontrada' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let userQuery = supabase
      .from('telegram_users')
      .select('*', { count: 'exact', head: true })
      .eq('is_blocked', false);

    if (!include_unregistered) {
      userQuery = userQuery.eq('is_registered', true);
    }

    const { count: userCount } = await userQuery;

    const { data: progressRecord } = await supabase
      .from('broadcast_progress')
      .insert({
        notification_id, status: 'pending',
        total_users: userCount || 0,
        total_batches: Math.ceil((userCount || 0) / BATCH_SIZE),
      })
      .select().single();

    const promise = sendBroadcastInBackground(
      String(notification_id), progressRecord.id, Boolean(include_unregistered)
    );
    EdgeRuntime.waitUntil(promise);

    return new Response(JSON.stringify({
      success: true, message: 'Broadcast iniciado',
      progress_id: progressRecord.id, total: userCount || 0,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('[BROADCAST] Handler error:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
