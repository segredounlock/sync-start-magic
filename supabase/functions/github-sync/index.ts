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
  if (res.status === 204) return {}; // No Content (e.g. workflow dispatch)
  const body = await res.json().catch(() => ({ message: `GitHub API ${res.status}` }));
  if (!res.ok) throw new Error(body.message || `GitHub API ${res.status}`);
  return body;
}

async function ghFetchRaw(path: string, pat: string) {
  const res = await fetch(`${GITHUB_API}${path}`, {
    headers: {
      Authorization: `Bearer ${pat}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
    throw new Error(body.message || `GitHub API ${res.status}`);
  }
  return res;
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

    // WORKFLOW RUNS — GET ?action=workflow-runs&repo=owner/name
    if (action === "workflow-runs") {
      await verifyAdmin(req);
      const repo = url.searchParams.get("repo");
      if (!repo) throw new Error("Repositório não informado");
      
      const runs = await ghFetch(`/repos/${repo}/actions/runs?per_page=10`, pat);
      const simplified = (runs.workflow_runs || []).map((r: any) => ({
        id: r.id,
        name: r.name,
        status: r.status,
        conclusion: r.conclusion,
        created_at: r.created_at,
        updated_at: r.updated_at,
        html_url: r.html_url,
        head_branch: r.head_branch,
        head_sha: r.head_sha?.substring(0, 7),
        run_number: r.run_number,
        event: r.event,
      }));
      return new Response(JSON.stringify(simplified), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // WORKFLOW RUN LOGS — GET ?action=workflow-logs&repo=owner/name&run_id=123
    if (action === "workflow-logs") {
      await verifyAdmin(req);
      const repo = url.searchParams.get("repo");
      const runId = url.searchParams.get("run_id");
      if (!repo || !runId) throw new Error("Repositório e run_id são obrigatórios");
      
      // Get jobs for this run
      const jobs = await ghFetch(`/repos/${repo}/actions/runs/${runId}/jobs`, pat);
      const jobDetails = (jobs.jobs || []).map((j: any) => ({
        id: j.id,
        name: j.name,
        status: j.status,
        conclusion: j.conclusion,
        started_at: j.started_at,
        completed_at: j.completed_at,
        steps: (j.steps || []).map((s: any) => ({
          name: s.name,
          status: s.status,
          conclusion: s.conclusion,
          number: s.number,
        })),
      }));

      // Try to get log text for the first job
      let logText = "";
      if (jobDetails.length > 0) {
        try {
          const logRes = await fetch(`${GITHUB_API}/repos/${repo}/actions/jobs/${jobDetails[0].id}/logs`, {
            headers: {
              Authorization: `Bearer ${pat}`,
              Accept: "application/vnd.github+json",
              "X-GitHub-Api-Version": "2022-11-28",
            },
            redirect: "follow",
          });
          if (logRes.ok) {
            logText = await logRes.text();
            // Truncate if too large
            if (logText.length > 10000) {
              logText = logText.substring(logText.length - 10000);
            }
          }
        } catch {
          // Logs may not be available
        }
      }

      return new Response(JSON.stringify({ jobs: jobDetails, log: logText }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // TRIGGER WORKFLOW — POST ?action=trigger-workflow
    if (action === "trigger-workflow") {
      await verifyAdmin(req);
      const body = await req.json();
      const { repo, workflow_id, branch } = body;
      if (!repo) throw new Error("Repositório não informado");

      // If workflow_id provided, dispatch it
      if (workflow_id) {
        await ghFetch(`/repos/${repo}/actions/workflows/${workflow_id}/dispatches`, pat, {
          method: "POST",
          body: JSON.stringify({ ref: branch || "main" }),
        });
      } else {
        // Find first workflow and dispatch it
        const workflows = await ghFetch(`/repos/${repo}/actions/workflows`, pat);
        const wfs = workflows.workflows || [];
        if (wfs.length === 0) throw new Error("Nenhum workflow encontrado");
        
        await ghFetch(`/repos/${repo}/actions/workflows/${wfs[0].id}/dispatches`, pat, {
          method: "POST",
          body: JSON.stringify({ ref: branch || "main" }),
        });
      }

      return new Response(JSON.stringify({ success: true, message: "Workflow disparado!" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // LIST WORKFLOWS — GET ?action=list-workflows&repo=owner/name
    if (action === "list-workflows") {
      await verifyAdmin(req);
      const repo = url.searchParams.get("repo");
      if (!repo) throw new Error("Repositório não informado");

      const workflows = await ghFetch(`/repos/${repo}/actions/workflows`, pat);
      const simplified = (workflows.workflows || []).map((w: any) => ({
        id: w.id,
        name: w.name,
        path: w.path,
        state: w.state,
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
        return new Response(
          JSON.stringify({ error: "Nenhum arquivo para sincronizar" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const targetBranch = branch || "main";
      const results: any[] = [];

      for (const file of filesToSync) {
        try {
          let sha: string | undefined;
          try {
            const existing = await ghFetch(`/repos/${repo}/contents/${file.path}?ref=${targetBranch}`, pat);
            sha = existing.sha;
          } catch {
            // File doesn't exist yet
          }

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
      JSON.stringify({ error: "Ação inválida. Use ?action=list-repos, workflow-runs, workflow-logs, trigger-workflow, list-workflows ou sync" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: error.message.includes("autorizado") || error.message.includes("negado") ? 403 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
