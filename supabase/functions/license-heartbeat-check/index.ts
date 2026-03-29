import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * License Heartbeat Check (runs on MASTER via cron)
 * 
 * Checks all active licenses for stale heartbeats.
 * If a mirror hasn't sent a heartbeat in 24h but license is still active,
 * it's flagged as suspicious. If > 48h, license is auto-suspended.
 * 
 * Also verifies that mirrors are still calling license-validate regularly.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const now = new Date();
    const threshold24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const threshold48h = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();

    // Get all active licenses
    const { data: activeLicenses, error: fetchError } = await supabaseAdmin
      .from("licenses")
      .select("id, mirror_name, mirror_domain, last_heartbeat_at, is_active, expires_at")
      .eq("is_active", true);

    if (fetchError) throw fetchError;
    if (!activeLicenses || activeLicenses.length === 0) {
      return new Response(JSON.stringify({ message: "No active licenses to check", checked: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = {
      checked: activeLicenses.length,
      healthy: 0,
      stale_warning: 0,
      auto_suspended: 0,
      already_expired: 0,
      details: [] as any[],
    };

    for (const license of activeLicenses) {
      // Skip already expired licenses
      if (license.expires_at && new Date(license.expires_at) < now) {
        results.already_expired++;
        results.details.push({
          id: license.id,
          mirror: license.mirror_name,
          status: "expired",
          reason: "License expired naturally",
        });
        continue;
      }

      const lastHeartbeat = license.last_heartbeat_at;

      // No heartbeat ever received
      if (!lastHeartbeat) {
        results.stale_warning++;
        results.details.push({
          id: license.id,
          mirror: license.mirror_name,
          status: "no_heartbeat",
          reason: "Never received a heartbeat",
        });

        // Log the warning
        await supabaseAdmin.from("license_logs").insert({
          event_type: "heartbeat_check",
          license_id: license.id,
          mirror_name: license.mirror_name,
          domain: license.mirror_domain,
          result: "warning",
          reason: "No heartbeat ever received",
        });
        continue;
      }

      // Heartbeat older than 48h → auto-suspend
      if (lastHeartbeat < threshold48h) {
        results.auto_suspended++;

        // Suspend the license
        await supabaseAdmin
          .from("licenses")
          .update({ 
            is_active: false,
            updated_at: now.toISOString(),
          })
          .eq("id", license.id);

        // Log the suspension
        await supabaseAdmin.from("license_logs").insert({
          event_type: "auto_suspend",
          license_id: license.id,
          mirror_name: license.mirror_name,
          domain: license.mirror_domain,
          result: "suspended",
          reason: `No heartbeat for 48h+ (last: ${lastHeartbeat})`,
          details: { last_heartbeat: lastHeartbeat, suspended_at: now.toISOString() },
        });

        results.details.push({
          id: license.id,
          mirror: license.mirror_name,
          status: "auto_suspended",
          reason: `No heartbeat since ${lastHeartbeat}`,
        });
        continue;
      }

      // Heartbeat older than 24h → warning
      if (lastHeartbeat < threshold24h) {
        results.stale_warning++;

        await supabaseAdmin.from("license_logs").insert({
          event_type: "heartbeat_check",
          license_id: license.id,
          mirror_name: license.mirror_name,
          domain: license.mirror_domain,
          result: "stale",
          reason: `Heartbeat stale (last: ${lastHeartbeat})`,
        });

        results.details.push({
          id: license.id,
          mirror: license.mirror_name,
          status: "stale_warning",
          reason: `Last heartbeat: ${lastHeartbeat}`,
        });
        continue;
      }

      // Healthy
      results.healthy++;
      results.details.push({
        id: license.id,
        mirror: license.mirror_name,
        status: "healthy",
        last_heartbeat: lastHeartbeat,
      });
    }

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
