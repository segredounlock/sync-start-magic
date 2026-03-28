// send-broadcast edge function
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const EdgeRuntime: { waitUntil(promise: Promise<unknown>): void };

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const BATCH_SIZE = 25;
const BATCH_DELAY = 1100;

// Error codes that indicate the user permanently can't receive messages
// NOTE: 400 is NOT included here because many 400 errors are formatting issues (e.g. invalid keyboard),
// not user blocks. 400 errors are only treated as permanent if the description matches known patterns.
const PERMANENT_BLOCK_CODES = new Set([
  403, // Forbidden - user blocked the bot
]);

// Telegram error descriptions indicating permanent failures
const PERMANENT_ERROR_DESCRIPTIONS = [
  'chat not found',
  'user is deactivated',
  'bot was blocked by the user',
  'bot was kicked from the group',
  'bot can\'t initiate conversation',
  'have no rights to send a message',
  'need to be invited',
  'peer_id_invalid',
  'user_not_participant',
];

function isValidUUID(value: unknown): boolean {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return typeof value === 'string' && regex.test(value);
}

function isPermanentError(errorCode: number, description?: string): boolean {
  // 403 is always a permanent block
  if (PERMANENT_BLOCK_CODES.has(errorCode)) return true;
  // For 400 errors, only treat as permanent if the description matches known user-level failures
  if (errorCode === 400 && description) {
    const lower = description.toLowerCase();
    return PERMANENT_ERROR_DESCRIPTIONS.some(d => lower.includes(d));
  }
  return false;
}

function classifyBlockReason(errorCode: number, description?: string): string {
  if (!description) return `telegram_error_${errorCode}`;
  const lower = description.toLowerCase();
  if (lower.includes('blocked')) return 'telegram_blocked';
  if (lower.includes('deactivated')) return 'user_deactivated';
  if (lower.includes('chat not found')) return 'chat_not_found';
  if (lower.includes('kicked')) return 'bot_kicked';
  if (lower.includes('can\'t initiate')) return 'cant_initiate';
  return `telegram_error_${errorCode}`;
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const tokenCache = new Map<string, { token: string; time: number }>();
const CACHE_TTL = 60000;

// Track active broadcasts for graceful shutdown
const activeBroadcasts = new Map<string, string>();

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

interface SendResult {
  ok: boolean;
  error_code?: number;
  description?: string;
  parameters?: { retry_after?: number };
  message_id?: number;
}

async function sendTelegramMessage(
  botToken: string,
  chatId: number,
  text: string,
  imageUrl?: string | null,
  buttons?: Array<{ text: string; url: string }>,
  messageEffectId?: string | null,
  retries = 2
): Promise<SendResult> {
  const hasImage = imageUrl && imageUrl.trim().length > 0;
  const url = hasImage
    ? `https://api.telegram.org/bot${botToken}/sendPhoto`
    : `https://api.telegram.org/bot${botToken}/sendMessage`;

  let replyMarkup = undefined;
  if (buttons && buttons.length > 0) {
    replyMarkup = {
      inline_keyboard: [buttons.map(btn => {
        const b: Record<string, any> = { text: btn.text, url: btn.url };
        if ((btn as any).style && (btn as any).style !== 'primary') b.style = (btn as any).style;
        return b;
      })]
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

      // Rate limit - wait and retry
      if (result.error_code === 429 && attempt < retries) {
        const retryAfter = result.parameters?.retry_after || 5;
        console.log(`[BROADCAST] Rate limited chat=${chatId}, waiting ${retryAfter}s`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        continue;
      }

      // Permanent errors - don't retry
      if (result.error_code && isPermanentError(result.error_code, result.description)) {
        return {
          ok: false,
          error_code: result.error_code,
          description: result.description,
        };
      }

      return {
        ok: result.ok ?? false,
        error_code: result.error_code,
        description: result.description,
        parameters: result.parameters,
        message_id: result.result?.message_id,
      };
    } catch (err) {
      if (attempt === retries) {
        return { ok: false, error_code: 0, description: `network_error: ${String(err)}` };
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }

  return { ok: false, error_code: 0, description: 'max_retries_exhausted' };
}

async function updateProgress(progressId: string, updates: Record<string, unknown>) {
  await supabase.from('broadcast_progress').update(updates).eq('id', progressId);
}

async function checkCancelled(progressId: string): Promise<boolean> {
  const { data } = await supabase
    .from('broadcast_progress')
    .select('status')
    .eq('id', progressId)
    .single();
  return data?.status === 'cancelled';
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

    // Query ALL users with pagination to bypass 1000-row default limit
    const allUsers: any[] = [];
    const PAGE_SIZE = 1000;
    let page = 0;
    let hasMore = true;

    while (hasMore) {
      let usersQuery = supabase
        .from('telegram_users')
        .select('telegram_id, first_name, is_blocked')
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (!includeUnregistered) {
        usersQuery = usersQuery.eq('is_registered', true);
      }

      const { data: pageData, error: pageError } = await usersQuery;

      if (pageError) {
        await updateProgress(progressId, { status: 'failed', error_message: 'Erro ao buscar usuários' });
        activeBroadcasts.delete(progressId);
        return;
      }

      if (pageData && pageData.length > 0) {
        allUsers.push(...pageData);
        hasMore = pageData.length === PAGE_SIZE;
        page++;
      } else {
        hasMore = false;
      }
    }

    const users = allUsers;
    const usersError = null;

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
    let blockedCount = resumeBlockedCount;
    let currentBatch = resumeFromBatch;

    // Collect status changes for batch update
    const blockedUpdates: Array<{ telegram_id: number; reason: string }> = [];
    const unblockedIds: number[] = []; // Users that succeeded but were previously blocked
    const messageRecords: Array<{ notification_id: string; telegram_id: number; message_id: number }> = [];

    const batches: typeof users[] = [];
    for (let i = 0; i < totalUsers; i += BATCH_SIZE) {
      batches.push(users!.slice(i, i + BATCH_SIZE));
    }

    const batchesToProcess = resumeFromBatch > 0 ? batches.slice(resumeFromBatch) : batches;

    for (const batch of batchesToProcess) {
      currentBatch++;

      // Check for cancellation every 5 batches to reduce DB calls
      if (currentBatch % 5 === 0) {
        const cancelled = await checkCancelled(progressId);
        if (cancelled) {
          console.log(`[BROADCAST] CANCELLED by user at batch ${currentBatch}/${totalBatches}`);
          await updateProgress(progressId, {
            sent_count: sentCount,
            failed_count: failedCount,
            blocked_count: blockedCount,
            current_batch: currentBatch,
            completed_at: new Date().toISOString(),
          });
          break;
        }
      }

      const batchStartTime = Date.now();

      const batchPromises = batch.map(async (user: any, index: number) => {
        // Stagger requests within batch to avoid burst
        await new Promise(resolve => setTimeout(resolve, index * 40));

        const message = `📢 <b>${notification.title}</b>\n\n${notification.message}`;
        const rawButtons = Array.isArray(notification.buttons) ? notification.buttons : [];
        // Normalize buttons: support both {text, url} and {label, url} formats
        const buttons = rawButtons
          .filter((btn: any) => btn && (btn.text || btn.label) && btn.url)
          .map((btn: any) => ({ text: btn.text || btn.label, url: btn.url }));

        const result = await sendTelegramMessage(
          botToken, user.telegram_id, message,
          notification.image_url,
          buttons as Array<{ text: string; url: string }>,
          notification.message_effect_id
        );

        return {
          telegramId: user.telegram_id,
          firstName: user.first_name,
          wasBlocked: user.is_blocked === true,
          ...result,
        };
      });

      const results = await Promise.all(batchPromises);

      for (const result of results) {
        if (result.ok) {
          sentCount++;
          // Save message_id for future delete/edit
          if (result.message_id) {
            messageRecords.push({ notification_id: notificationId, telegram_id: result.telegramId, message_id: result.message_id });
          }
          // If this user was previously blocked, unblock them (they unblocked the bot!)
          if (result.wasBlocked) {
            unblockedIds.push(result.telegramId);
            console.log(`[BROADCAST] UNBLOCKED ${result.firstName}(${result.telegramId}): message delivered successfully`);
          }
        } else {
          failedCount++;
          const errorCode = result.error_code || 0;
          const description = result.description || '';

          if (isPermanentError(errorCode, description)) {
            const reason = classifyBlockReason(errorCode, description);
            blockedUpdates.push({ telegram_id: result.telegramId, reason });
            blockedCount++;
            console.log(`[BROADCAST] BLOCKED ${result.firstName}(${result.telegramId}): ${reason} [${errorCode}] ${description}`);
          } else {
            console.log(`[BROADCAST] FAIL ${result.firstName}(${result.telegramId}): [${errorCode}] ${description}`);
          }
        }
      }

      // Flush blocked/unblocked/message records in batches of 50
      if (blockedUpdates.length >= 50) {
        await flushBlockedUsers(blockedUpdates.splice(0, 50));
      }
      if (unblockedIds.length >= 50) {
        await flushUnblockedUsers(unblockedIds.splice(0, 50));
      }
      if (messageRecords.length >= 50) {
        await flushMessageRecords(messageRecords.splice(0, 50));
      }

      const elapsedMs = Date.now() - startTime;
      const processedInThisRun = sentCount - resumeSentCount + failedCount - resumeFailedCount;
      const messagesPerSecond = processedInThisRun / (elapsedMs / 1000);
      const remainingMessages = totalUsers - (sentCount + failedCount);
      const estimatedSecondsRemaining = remainingMessages / Math.max(messagesPerSecond, 1);

      console.log(`[BROADCAST] batch ${currentBatch}/${totalBatches} sent=${sentCount} failed=${failedCount} blocked=${blockedCount} speed=${messagesPerSecond.toFixed(1)}/s`);

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

    // Flush remaining blocked/unblocked/message records
    if (blockedUpdates.length > 0) {
      await flushBlockedUsers(blockedUpdates);
    }
    if (unblockedIds.length > 0) {
      await flushUnblockedUsers(unblockedIds);
    }
    if (messageRecords.length > 0) {
      await flushMessageRecords(messageRecords);
    }

    // Only mark completed if not already cancelled
    const { data: currentStatus } = await supabase
      .from('broadcast_progress')
      .select('status')
      .eq('id', progressId)
      .single();

    if (currentStatus?.status !== 'cancelled') {
      await updateProgress(progressId, {
        status: 'completed',
        sent_count: sentCount,
        failed_count: failedCount,
        blocked_count: blockedCount,
        completed_at: new Date().toISOString(),
      });

      // Post to "Atualizações do Sistema" chat group
      await postNotificationToChat(notification);

      // Replicate to news channel if configured
      await postToNewsChannel(botToken, notification);
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[BROADCAST] DONE notif=${notificationId} sent=${sentCount} failed=${failedCount} blocked=${blockedCount} elapsed=${elapsed}s`);
  } catch (error) {
    console.error(`[BROADCAST] ERROR notif=${notificationId}:`, error);
    await updateProgress(progressId, {
      status: 'failed',
      error_message: String(error),
      completed_at: new Date().toISOString(),
    });
  } finally {
    activeBroadcasts.delete(progressId);
  }
}

async function flushBlockedUsers(updates: Array<{ telegram_id: number; reason: string }>) {
  // Group by reason for efficient batch updates
  const byReason = new Map<string, number[]>();
  for (const u of updates) {
    const ids = byReason.get(u.reason) || [];
    ids.push(u.telegram_id);
    byReason.set(u.reason, ids);
  }

  const promises = Array.from(byReason.entries()).map(([reason, ids]) =>
    supabase.from('telegram_users')
      .update({ is_blocked: true, block_reason: reason })
      .in('telegram_id', ids)
  );

  await Promise.allSettled(promises);
  console.log(`[BROADCAST] Flushed ${updates.length} blocked users`);
}

async function flushUnblockedUsers(telegramIds: number[]) {
  await supabase.from('telegram_users')
    .update({ is_blocked: false, block_reason: null })
    .in('telegram_id', telegramIds);
  console.log(`[BROADCAST] Unblocked ${telegramIds.length} users (they unblocked the bot)`);
}

async function flushMessageRecords(records: Array<{ notification_id: string; telegram_id: number; message_id: number }>) {
  const { error } = await supabase.from('broadcast_messages').upsert(records, { onConflict: 'notification_id,telegram_id' });
  if (error) {
    console.error(`[BROADCAST] Failed to save ${records.length} message records:`, error.message);
  } else {
    console.log(`[BROADCAST] Saved ${records.length} message records`);
  }
}


const UPDATES_CONVERSATION_ID = '00000000-0000-0000-0000-000000000003';
const SYSTEM_ADMIN_ID = 'f5501acc-79f3-460f-bc3e-493280ea84f0';

async function postNotificationToChat(notification: any) {
  try {
    // Build message content similar to Telegram format
    let content = `📢 **${notification.title}**\n\n${notification.message}`;

    // Add buttons as links
    const buttons = Array.isArray(notification.buttons) ? notification.buttons : [];
    if (buttons.length > 0) {
      content += '\n\n' + buttons.map((btn: any) => `[btn:${btn.text || btn.label}|${btn.url}]`).join('\n');
    }

    // Insert as chat message
    const insertData: Record<string, any> = {
      conversation_id: UPDATES_CONVERSATION_ID,
      sender_id: SYSTEM_ADMIN_ID,
      content,
      type: 'text',
    };

    // If notification has image, send as image type
    if (notification.image_url) {
      insertData.image_url = notification.image_url;
      insertData.type = 'image';
    }

    const { error } = await supabase.from('chat_messages').insert(insertData);
    if (error) {
      console.error('[BROADCAST] Failed to post to chat:', error.message);
    } else {
      console.log('[BROADCAST] Posted notification to Atualizações do Sistema chat');
      // Update conversation preview directly (service role can't use auth.uid()-based RPC)
      const previewText = `Admin: 📢 ${notification.title}`;
      await supabase.from('chat_conversations').update({
        last_message_text: previewText.length > 100 ? previewText.slice(0, 100) + '…' : previewText,
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('id', UPDATES_CONVERSATION_ID);
    }
  } catch (err) {
    console.error('[BROADCAST] Chat post error:', err);
  }
}

Deno.serve(async (req) => {
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

    // Count ALL users (including blocked) since broadcast re-verifies everyone
    let userQuery = supabase
      .from('telegram_users')
      .select('*', { count: 'exact', head: true });

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
