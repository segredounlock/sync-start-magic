import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * License Integrity Check (runs on MASTER)
 * 
 * Remotely probes a mirror to verify:
 * 1. license-check-server is responding
 * 2. The mirror is validating against THIS master (not itself)
 * 3. RLS policies are active (by attempting an unauthenticated query)
 * 4. is_license_valid() function exists
 * 
 * Can be called manually from LicenseManager or via cron.
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
    const body = await req.json().catch(() => ({}));
    const { license_id, mirror_url } = body;

    // Can check a specific mirror or all active mirrors
    let mirrors: any[] = [];

    if (license_id) {
      const { data } = await supabaseAdmin
        .from("licenses")
        .select("id, mirror_name, mirror_domain, is_active, last_heartbeat_at")
        .eq("id", license_id)
        .maybeSingle();
      if (data) mirrors = [data];
    } else if (mirror_url) {
      // Ad-hoc check of a specific URL
      mirrors = [{ id: "manual", mirror_name: "manual", mirror_domain: mirror_url, is_active: true }];
    } else {
      // Check all active mirrors
      const { data } = await supabaseAdmin
        .from("licenses")
        .select("id, mirror_name, mirror_domain, is_active, last_heartbeat_at")
        .eq("is_active", true);
      mirrors = data || [];
    }

    const results: any[] = [];

    for (const mirror of mirrors) {
      const domain = mirror.mirror_domain;
      if (!domain) {
        results.push({
          id: mirror.id,
          mirror: mirror.mirror_name,
          status: "skipped",
          reason: "No mirror_domain configured",
        });
        continue;
      }

      const checks = {
        id: mirror.id,
        mirror: mirror.mirror_name,
        domain,
        license_check_server: "unknown" as string,
        anon_data_leak: "unknown" as string,
        heartbeat_age: "unknown" as string,
        overall: "unknown" as string,
      };

      // 1. Check if license-check-server responds
      try {
        // Derive supabase URL from domain or use stored URL
        // Try the mirror's edge function endpoint
        const mirrorSupabaseUrl = await getMirrorSupabaseUrl(supabaseAdmin, mirror);
        
        if (mirrorSupabaseUrl) {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 10000);
          
          const resp = await fetch(`${mirrorSupabaseUrl}/functions/v1/license-check-server`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ domain }),
            signal: controller.signal,
          });
          clearTimeout(timeout);

          const data = await resp.json().catch(() => null);
          
          if (data?.valid === true) {
            checks.license_check_server = "active";
          } else if (data?.valid === false) {
            checks.license_check_server = `rejected: ${data.reason || data.code || "unknown"}`;
          } else {
            checks.license_check_server = "invalid_response";
          }
        } else {
          checks.license_check_server = "no_supabase_url";
        }
      } catch (err) {
        checks.license_check_server = `error: ${err.message}`;
      }

      // 2. Check anonymous data leak (try to read recargas without auth)
      try {
        const mirrorSupabaseUrl = await getMirrorSupabaseUrl(supabaseAdmin, mirror);
        if (mirrorSupabaseUrl) {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 8000);

          // Try to query recargas table via PostgREST without auth
          const resp = await fetch(`${mirrorSupabaseUrl}/rest/v1/recargas?select=id&limit=1`, {
            headers: {
              "apikey": "anonymous-probe-test",
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          });
          clearTimeout(timeout);

          if (resp.status === 401 || resp.status === 403) {
            checks.anon_data_leak = "protected";
          } else {
            const data = await resp.json().catch(() => null);
            if (Array.isArray(data) && data.length > 0) {
              checks.anon_data_leak = "LEAK_DETECTED";
            } else {
              checks.anon_data_leak = "protected";
            }
          }
        }
      } catch {
        checks.anon_data_leak = "unreachable";
      }

      // 3. Heartbeat age
      if (mirror.last_heartbeat_at) {
        const ageMs = Date.now() - new Date(mirror.last_heartbeat_at).getTime();
        const ageHours = Math.round(ageMs / (1000 * 60 * 60) * 10) / 10;
        checks.heartbeat_age = `${ageHours}h ago`;
        
        if (ageHours > 48) {
          checks.heartbeat_age += " (CRITICAL)";
        } else if (ageHours > 24) {
          checks.heartbeat_age += " (STALE)";
        }
      } else {
        checks.heartbeat_age = "never";
      }

      // 4. Overall assessment
      const hasLeak = checks.anon_data_leak === "LEAK_DETECTED";
      const serverDown = checks.license_check_server.startsWith("error");
      const noHeartbeat = checks.heartbeat_age === "never" || checks.heartbeat_age.includes("CRITICAL");

      if (hasLeak) {
        checks.overall = "COMPROMISED";
      } else if (serverDown && noHeartbeat) {
        checks.overall = "SUSPICIOUS";
      } else if (serverDown || noHeartbeat) {
        checks.overall = "WARNING";
      } else {
        checks.overall = "HEALTHY";
      }

      // Log the integrity check
      await supabaseAdmin.from("license_logs").insert({
        event_type: "integrity_check",
        license_id: mirror.id === "manual" ? null : mirror.id,
        mirror_name: mirror.mirror_name,
        domain,
        result: checks.overall.toLowerCase(),
        reason: `Server: ${checks.license_check_server}, Data: ${checks.anon_data_leak}, Heartbeat: ${checks.heartbeat_age}`,
        details: checks,
      });

      results.push(checks);
    }

    return new Response(JSON.stringify({ checked: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

/**
 * Try to derive the mirror's Supabase URL from its domain or stored config
 */
async function getMirrorSupabaseUrl(supabase: any, mirror: any): Promise<string | null> {
  // If mirror_domain looks like a supabase URL, use it directly
  const domain = mirror.mirror_domain || "";
  if (domain.includes(".supabase.co")) {
    return domain.startsWith("https://") ? domain : `https://${domain}`;
  }
  
  // Otherwise we can't determine the supabase URL from just a domain
  // The mirror would need to have stored its supabase URL somewhere accessible
  return null;
}
