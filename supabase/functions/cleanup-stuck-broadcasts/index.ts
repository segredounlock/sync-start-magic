import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const STUCK_THRESHOLD_MINUTES = 10;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const thresholdTime = new Date(Date.now() - STUCK_THRESHOLD_MINUTES * 60 * 1000).toISOString();

  const { data: stuckBroadcasts, error } = await supabase
    .from('broadcast_progress')
    .select('id, notification_id, sent_count, failed_count, total_users')
    .eq('status', 'running')
    .lt('updated_at', thresholdTime);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!stuckBroadcasts || stuckBroadcasts.length === 0) {
    return new Response(JSON.stringify({ success: true, cleaned: 0 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  for (const broadcast of stuckBroadcasts) {
    const remaining = broadcast.total_users - (broadcast.sent_count + broadcast.failed_count);
    await supabase.from('broadcast_progress').update({
      status: 'cancelled',
      error_message: `Interrompido automaticamente - ${remaining} restantes.`,
      completed_at: new Date().toISOString(),
    }).eq('id', broadcast.id);
  }

  return new Response(JSON.stringify({
    success: true, cleaned: stuckBroadcasts.length,
  }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
});
