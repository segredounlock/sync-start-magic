import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GITHUB_API = "https://api.github.com";

async function ghFetch(path: string, pat: string, options: RequestInit = {}) {
  const res = await fetch(`${GITHUB_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${pat}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || `GitHub API ${res.status}`);
  return body;
}

async function verifyAdmin(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) throw new Error("Não autorizado");

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const supabaseUser = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user } } = await supabaseUser.auth.getUser();
  if (!user) throw new Error("Não autorizado");

  const { data: roleData } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();
  if (!roleData) throw new Error("Acesso negado");

  return { user, supabaseAdmin };
}

// Files to sync as the backup module
const BACKUP_MODULE_FILES = [
  "supabase/functions/backup-export/index.ts",
  "supabase/functions/backup-restore/index.ts",
  "supabase/functions/expire-pending-deposits/index.ts",
  "supabase/functions/github-sync/index.ts",
  "src/components/BackupSection.tsx",
  "src/pages/Principal.tsx",
  "src/pages/MaintenancePage.tsx",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Try DB first, fallback to env
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data: configRow } = await supabaseAdmin
      .from("system_config")
      .select("value")
      .eq("key", "githubPat")
      .maybeSingle();
    const pat = (configRow?.value?.trim()) || Deno.env.get("GITHUB_PAT");
    if (!pat) {
      return new Response(
        JSON.stringify({ error: "GITHUB_PAT não configurado" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // LIST REPOS — GET ?action=list-repos
    if (action === "list-repos") {
      await verifyAdmin(req);
      const repos = await ghFetch("/user/repos?per_page=100&sort=updated&affiliation=owner", pat);
      const simplified = repos.map((r: any) => ({
        full_name: r.full_name,
        name: r.name,
        owner: r.owner.login,
        private: r.private,
        default_branch: r.default_branch,
      }));
      return new Response(JSON.stringify(simplified), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // SYNC FILES — POST ?action=sync
    if (action === "sync") {
      const { user, supabaseAdmin } = await verifyAdmin(req);
      const body = await req.json();
      const { repo, branch, files } = body;

      if (!repo) throw new Error("Repositório não informado");

      const filesToSync: { path: string; content: string }[] = files || [];
      if (filesToSync.length === 0) {
        // If no files provided, fetch from Supabase database backup
        // We'll get the actual file contents from the project source
        return new Response(
          JSON.stringify({ error: "Nenhum arquivo para sincronizar" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const targetBranch = branch || "main";
      const results: any[] = [];

      for (const file of filesToSync) {
        try {
          // Check if file exists (to get sha for update)
          let sha: string | undefined;
          try {
            const existing = await ghFetch(`/repos/${repo}/contents/${file.path}?ref=${targetBranch}`, pat);
            sha = existing.sha;
          } catch {
            // File doesn't exist yet, will create
          }

          // Create or update file
          const payload: any = {
            message: `[Backup Module] Sync ${file.path}`,
            content: btoa(unescape(encodeURIComponent(file.content))),
            branch: targetBranch,
          };
          if (sha) payload.sha = sha;

          await ghFetch(`/repos/${repo}/contents/${file.path}`, pat, {
            method: "PUT",
            body: JSON.stringify(payload),
          });

          results.push({ path: file.path, status: "ok" });
        } catch (err: any) {
          results.push({ path: file.path, status: "error", error: err.message });
        }
      }

      return new Response(
        JSON.stringify({ success: true, repo, branch: targetBranch, results }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Ação inválida. Use ?action=list-repos ou ?action=sync" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: error.message.includes("autorizado") || error.message.includes("negado") ? 403 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
