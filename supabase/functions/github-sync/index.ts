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
  if (res.status === 204) return {};
  const body = await res.json().catch(() => ({ message: `GitHub API ${res.status}` }));
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

async function getPat(supabaseAdmin: any): Promise<string> {
  const { data: configRow } = await supabaseAdmin
    .from("system_config")
    .select("value")
    .eq("key", "githubPat")
    .maybeSingle();
  const pat = configRow?.value?.trim() || Deno.env.get("GITHUB_PAT");
  if (!pat) throw new Error("GITHUB_PAT não configurado");
  return pat;
}

// Compute SHA-256 hash of content
async function sha256(content: string): Promise<string> {
  const data = new TextEncoder().encode(content);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Get file content from GitHub
async function getGitHubFileContent(repo: string, path: string, branch: string, pat: string): Promise<string | null> {
  try {
    const data = await ghFetch(`/repos/${repo}/contents/${encodeURIComponent(path)}?ref=${branch}`, pat);
    if (data.content) {
      return atob(data.content.replace(/\n/g, ""));
    }
    return null;
  } catch {
    return null;
  }
}

// Get full tree from GitHub repo
async function getGitHubTree(repo: string, branch: string, pat: string): Promise<Map<string, string>> {
  const tree = new Map<string, string>(); // path -> sha
  try {
    const data = await ghFetch(`/repos/${repo}/git/trees/${branch}?recursive=1`, pat);
    for (const item of data.tree || []) {
      if (item.type === "blob") {
        tree.set(item.path, item.sha);
      }
    }
  } catch { /* empty tree */ }
  return tree;
}

// Fetch file content via raw URL for efficiency
async function getGitHubFileRaw(repo: string, path: string, branch: string, pat: string): Promise<string | null> {
  try {
    const res = await fetch(`https://raw.githubusercontent.com/${repo}/${branch}/${path}`, {
      headers: { Authorization: `Bearer ${pat}` },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // ════════════════════════════════════════════
    // RECONCILE — Compare source hashes with mirror
    // ════════════════════════════════════════════
    if (action === "reconcile") {
      const { user, supabaseAdmin } = await verifyAdmin(req);
      const pat = await getPat(supabaseAdmin);
      const mirrorId = url.searchParams.get("mirror_id");
      if (!mirrorId) throw new Error("mirror_id obrigatório");

      const body = await req.json();
      const sourceHashes: Record<string, string> = body.source_hashes || {};
      const protectedPaths: string[] = body.protected_paths || [".env", "supabase/config.toml", ".github/workflows/"];
      const mirrorRepo: string = body.mirror_repo;
      const sourceRepoName: string = body.source_repo || "";

      if (!mirrorRepo) throw new Error("mirror_repo obrigatório");

      // Get mirror repo tree
      const mirrorTree = await getGitHubTree(mirrorRepo, "main", pat);

      // Ensure mirror_sync_state exists
      await supabaseAdmin.from("mirror_sync_state").upsert({
        mirror_id: mirrorId,
        mirror_repo: mirrorRepo,
        source_repo: sourceRepoName,
        protected_paths: protectedPaths,
        updated_at: new Date().toISOString(),
      }, { onConflict: "mirror_id" });

      let synced = 0, pending = 0, conflict = 0, protectedCount = 0, newFiles = 0, modified = 0;
      const fileStates: any[] = [];

      const isProtected = (path: string) => protectedPaths.some(pp => path === pp || path.startsWith(pp));

      // Compare each source file
      for (const [filePath, sourceHash] of Object.entries(sourceHashes)) {
        if (isProtected(filePath)) {
          protectedCount++;
          fileStates.push({
            mirror_id: mirrorId, file_path: filePath,
            source_hash: sourceHash, mirror_hash: null,
            status: "protected", action: "skip",
            updated_at: new Date().toISOString(),
          });
          continue;
        }

        const mirrorSha = mirrorTree.get(filePath);

        if (!mirrorSha) {
          // File doesn't exist in mirror
          newFiles++;
          pending++;
          fileStates.push({
            mirror_id: mirrorId, file_path: filePath,
            source_hash: sourceHash, mirror_hash: null,
            status: "pending", action: "create",
            updated_at: new Date().toISOString(),
          });
        } else {
          // File exists — we need to compare content hashes
          // GitHub tree SHA is a git blob SHA (not content SHA-256), so we sample a few files
          // For efficiency, use git tree sha comparison: if mirror has same git sha, it's synced
          // We'll fetch content for a subset and compare properly
          // For now, compare source_hash with what we have stored
          const { data: existingState } = await supabaseAdmin
            .from("mirror_file_state")
            .select("mirror_hash, source_hash")
            .eq("mirror_id", mirrorId)
            .eq("file_path", filePath)
            .maybeSingle();

          if (existingState?.source_hash === sourceHash && existingState?.mirror_hash === sourceHash) {
            // Already synced
            synced++;
            fileStates.push({
              mirror_id: mirrorId, file_path: filePath,
              source_hash: sourceHash, mirror_hash: sourceHash,
              status: "synced", action: null,
              updated_at: new Date().toISOString(),
            });
          } else if (existingState?.mirror_hash && existingState.mirror_hash !== existingState.source_hash && existingState.mirror_hash !== sourceHash) {
            // Mirror was modified independently = conflict
            conflict++;
            fileStates.push({
              mirror_id: mirrorId, file_path: filePath,
              source_hash: sourceHash, mirror_hash: existingState.mirror_hash,
              status: "conflict", action: "update",
              updated_at: new Date().toISOString(),
            });
          } else {
            // Source hash changed = pending update
            modified++;
            pending++;
            fileStates.push({
              mirror_id: mirrorId, file_path: filePath,
              source_hash: sourceHash, mirror_hash: existingState?.mirror_hash || null,
              status: "pending", action: "update",
              updated_at: new Date().toISOString(),
            });
          }
        }
      }

      // Batch upsert file states
      const BATCH = 50;
      for (let i = 0; i < fileStates.length; i += BATCH) {
        const batch = fileStates.slice(i, i + BATCH);
        await supabaseAdmin.from("mirror_file_state").upsert(batch, { onConflict: "mirror_id,file_path" });
      }

      // Update sync state summary
      const total = Object.keys(sourceHashes).length;
      await supabaseAdmin.from("mirror_sync_state").upsert({
        mirror_id: mirrorId,
        mirror_repo: mirrorRepo,
        source_repo: sourceRepoName,
        total_files: total,
        synced_files: synced,
        pending_files: pending,
        conflict_files: conflict,
        updated_at: new Date().toISOString(),
      }, { onConflict: "mirror_id" });

      return new Response(JSON.stringify({
        summary: { total, synced, pending, conflict, protected: protectedCount, new_files: newFiles, modified },
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ════════════════════════════════════════════
    // SMART-SYNC — Send only pending files
    // ════════════════════════════════════════════
    if (action === "smart-sync") {
      const { user, supabaseAdmin } = await verifyAdmin(req);
      const pat = await getPat(supabaseAdmin);
      const mirrorId = url.searchParams.get("mirror_id");
      if (!mirrorId) throw new Error("mirror_id obrigatório");

      const body = await req.json();
      const sourceHashes: Record<string, string> = body.source_hashes || {};
      const mirrorRepo: string = body.mirror_repo;
      const forceFiles: string[] = body.force_files || [];

      if (!mirrorRepo) throw new Error("mirror_repo obrigatório");

      const startTime = Date.now();

      // Get pending files (or forced files)
      let query = supabaseAdmin
        .from("mirror_file_state")
        .select("file_path, source_hash, action")
        .eq("mirror_id", mirrorId);

      if (forceFiles.length > 0) {
        query = query.in("file_path", forceFiles);
      } else {
        query = query.eq("status", "pending");
      }

      const { data: pendingFiles } = await query;
      if (!pendingFiles || pendingFiles.length === 0) {
        return new Response(JSON.stringify({ files_sent: 0, files_failed: 0, files_skipped: 0, message: "Nenhum arquivo pendente" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      let sent = 0, failed = 0, skipped = 0;
      const details: any[] = [];
      const BATCH_SIZE = 5;
      const MAX_RETRIES = 3;

      // Collect file contents from source
      for (let b = 0; b < pendingFiles.length; b += BATCH_SIZE) {
        const batch = pendingFiles.slice(b, b + BATCH_SIZE);

        for (const fileState of batch) {
          let success = false;
          let lastError = "";

          for (let retry = 0; retry < MAX_RETRIES && !success; retry++) {
            try {
              // Get file content from origin (via the request context, we need to fetch from the source)
              // Since edge function can't access Vite build output, we fetch from GitHub source repo
              const { data: stateData } = await supabaseAdmin
                .from("mirror_sync_state")
                .select("source_repo")
                .eq("mirror_id", mirrorId)
                .maybeSingle();
              const srcRepo = stateData?.source_repo;

              let content: string | null = null;
              if (srcRepo) {
                content = await getGitHubFileRaw(srcRepo, fileState.file_path, "main", pat);
              }

              if (!content) {
                skipped++;
                details.push({ path: fileState.file_path, status: "skipped", error: "Arquivo não encontrado na origem" });
                success = true;
                break;
              }

              // Get existing file SHA for update
              let sha: string | undefined;
              try {
                const existing = await ghFetch(`/repos/${mirrorRepo}/contents/${fileState.file_path}?ref=main`, pat);
                sha = existing.sha;
              } catch { /* new file */ }

              const payload: any = {
                message: `[Smart Sync] ${fileState.action || "update"} ${fileState.file_path}`,
                content: btoa(unescape(encodeURIComponent(content))),
                branch: "main",
              };
              if (sha) payload.sha = sha;

              await ghFetch(`/repos/${mirrorRepo}/contents/${fileState.file_path}`, pat, {
                method: "PUT",
                body: JSON.stringify(payload),
              });

              // Update file state to synced
              await supabaseAdmin.from("mirror_file_state").upsert({
                mirror_id: mirrorId,
                file_path: fileState.file_path,
                source_hash: fileState.source_hash,
                mirror_hash: fileState.source_hash,
                status: "synced",
                action: null,
                last_synced_at: new Date().toISOString(),
                error_message: null,
                updated_at: new Date().toISOString(),
              }, { onConflict: "mirror_id,file_path" });

              sent++;
              details.push({ path: fileState.file_path, status: "ok" });
              success = true;
            } catch (err: any) {
              lastError = err.message;
              if (retry < MAX_RETRIES - 1) {
                await new Promise(r => setTimeout(r, 1000 * (retry + 1)));
              }
            }
          }

          if (!success) {
            failed++;
            details.push({ path: fileState.file_path, status: "error", error: lastError });
            await supabaseAdmin.from("mirror_file_state").upsert({
              mirror_id: mirrorId,
              file_path: fileState.file_path,
              error_message: lastError,
              updated_at: new Date().toISOString(),
            }, { onConflict: "mirror_id,file_path" });
          }
        }
      }

      const durationMs = Date.now() - startTime;

      // Log sync
      await supabaseAdmin.from("mirror_sync_logs").insert({
        mirror_id: mirrorId,
        sync_type: forceFiles.length > 0 ? "force" : "incremental",
        files_sent: sent,
        files_skipped: skipped,
        files_failed: failed,
        conflicts_detected: 0,
        duration_ms: durationMs,
        details,
        completed_at: new Date().toISOString(),
      });

      // Update sync state
      await supabaseAdmin.from("mirror_sync_state").upsert({
        mirror_id: mirrorId,
        mirror_repo: mirrorRepo,
        last_sync_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "mirror_id" });

      return new Response(JSON.stringify({ files_sent: sent, files_failed: failed, files_skipped: skipped, duration_ms: durationMs, details }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ════════════════════════════════════════════
    // MIRROR-STATUS — Get mirror state summary
    // ════════════════════════════════════════════
    if (action === "mirror-status") {
      const { supabaseAdmin } = await verifyAdmin(req);
      const mirrorId = url.searchParams.get("mirror_id");
      if (!mirrorId) throw new Error("mirror_id obrigatório");

      const { data: stateData } = await supabaseAdmin
        .from("mirror_sync_state")
        .select("*")
        .eq("mirror_id", mirrorId)
        .maybeSingle();

      const { data: conflicts } = await supabaseAdmin
        .from("mirror_file_state")
        .select("file_path, source_hash, mirror_hash")
        .eq("mirror_id", mirrorId)
        .eq("status", "conflict");

      const { data: recentLogs } = await supabaseAdmin
        .from("mirror_sync_logs")
        .select("*")
        .eq("mirror_id", mirrorId)
        .order("started_at", { ascending: false })
        .limit(5);

      return new Response(JSON.stringify({
        state: stateData,
        conflicts: conflicts || [],
        recent_logs: recentLogs || [],
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ════════════════════════════════════════════
    // EXISTING ACTIONS (unchanged)
    // ════════════════════════════════════════════

    // Get PAT for existing actions
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data: configRow } = await supabaseAdmin
      .from("system_config")
      .select("value")
      .eq("key", "githubPat")
      .maybeSingle();
    const pat = configRow?.value?.trim() || Deno.env.get("GITHUB_PAT");
    if (!pat) {
      return new Response(
        JSON.stringify({ error: "GITHUB_PAT não configurado" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // LIST REPOS
    if (action === "list-repos") {
      await verifyAdmin(req);
      const repos = await ghFetch("/user/repos?per_page=100&sort=updated&affiliation=owner", pat);
      const simplified = repos.map((r: any) => ({
        full_name: r.full_name, name: r.name, owner: r.owner.login,
        private: r.private, default_branch: r.default_branch,
      }));
      return new Response(JSON.stringify(simplified), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // WORKFLOW RUNS
    if (action === "workflow-runs") {
      await verifyAdmin(req);
      const repo = url.searchParams.get("repo");
      if (!repo) throw new Error("Repositório não informado");
      const runs = await ghFetch(`/repos/${repo}/actions/runs?per_page=10`, pat);
      const simplified = (runs.workflow_runs || []).map((r: any) => ({
        id: r.id, name: r.name, status: r.status, conclusion: r.conclusion,
        created_at: r.created_at, updated_at: r.updated_at, html_url: r.html_url,
        head_branch: r.head_branch, head_sha: r.head_sha?.substring(0, 7),
        run_number: r.run_number, event: r.event,
      }));
      return new Response(JSON.stringify(simplified), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // WORKFLOW LOGS
    if (action === "workflow-logs") {
      await verifyAdmin(req);
      const repo = url.searchParams.get("repo");
      const runId = url.searchParams.get("run_id");
      if (!repo || !runId) throw new Error("Repositório e run_id são obrigatórios");
      const jobs = await ghFetch(`/repos/${repo}/actions/runs/${runId}/jobs`, pat);
      const jobDetails = (jobs.jobs || []).map((j: any) => ({
        id: j.id, name: j.name, status: j.status, conclusion: j.conclusion,
        started_at: j.started_at, completed_at: j.completed_at,
        steps: (j.steps || []).map((s: any) => ({
          name: s.name, status: s.status, conclusion: s.conclusion, number: s.number,
        })),
      }));
      let logText = "";
      if (jobDetails.length > 0) {
        try {
          const logRes = await fetch(`${GITHUB_API}/repos/${repo}/actions/jobs/${jobDetails[0].id}/logs`, {
            headers: { Authorization: `Bearer ${pat}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
            redirect: "follow",
          });
          if (logRes.ok) {
            logText = await logRes.text();
            if (logText.length > 10000) logText = logText.substring(logText.length - 10000);
          }
        } catch { /* logs may not be available */ }
      }
      return new Response(JSON.stringify({ jobs: jobDetails, log: logText }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // TRIGGER WORKFLOW
    if (action === "trigger-workflow") {
      await verifyAdmin(req);
      const body = await req.json();
      const { repo, workflow_id, branch } = body;
      if (!repo) throw new Error("Repositório não informado");
      if (workflow_id) {
        await ghFetch(`/repos/${repo}/actions/workflows/${workflow_id}/dispatches`, pat, {
          method: "POST", body: JSON.stringify({ ref: branch || "main" }),
        });
      } else {
        const workflows = await ghFetch(`/repos/${repo}/actions/workflows`, pat);
        const wfs = workflows.workflows || [];
        if (wfs.length === 0) throw new Error("Nenhum workflow encontrado");
        await ghFetch(`/repos/${repo}/actions/workflows/${wfs[0].id}/dispatches`, pat, {
          method: "POST", body: JSON.stringify({ ref: branch || "main" }),
        });
      }
      return new Response(JSON.stringify({ success: true, message: "Workflow disparado!" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // LIST WORKFLOWS
    if (action === "list-workflows") {
      await verifyAdmin(req);
      const repo = url.searchParams.get("repo");
      if (!repo) throw new Error("Repositório não informado");
      const workflows = await ghFetch(`/repos/${repo}/actions/workflows`, pat);
      const simplified = (workflows.workflows || []).map((w: any) => ({
        id: w.id, name: w.name, path: w.path, state: w.state,
      }));
      return new Response(JSON.stringify(simplified), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // SYNC FILES
    if (action === "sync") {
      const { user, supabaseAdmin: sa } = await verifyAdmin(req);
      const body = await req.json();
      const { repo, branch, files } = body;
      if (!repo) throw new Error("Repositório não informado");
      const filesToSync: { path: string; content: string }[] = files || [];
      if (filesToSync.length === 0) {
        return new Response(JSON.stringify({ error: "Nenhum arquivo para sincronizar" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const targetBranch = branch || "main";
      const results: any[] = [];
      for (const file of filesToSync) {
        try {
          let sha: string | undefined;
          try {
            const existing = await ghFetch(`/repos/${repo}/contents/${file.path}?ref=${targetBranch}`, pat);
            sha = existing.sha;
          } catch { /* new file */ }
          const payload: any = {
            message: `[Backup Module] Sync ${file.path}`,
            content: btoa(unescape(encodeURIComponent(file.content))),
            branch: targetBranch,
          };
          if (sha) payload.sha = sha;
          await ghFetch(`/repos/${repo}/contents/${file.path}`, pat, {
            method: "PUT", body: JSON.stringify(payload),
          });
          results.push({ path: file.path, status: "ok" });
        } catch (err: any) {
          results.push({ path: file.path, status: "error", error: err.message });
        }
      }
      return new Response(JSON.stringify({ success: true, repo, branch: targetBranch, results }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(
      JSON.stringify({ error: "Ação inválida. Use ?action=list-repos, workflow-runs, workflow-logs, trigger-workflow, list-workflows, sync, reconcile, smart-sync ou mirror-status" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: error.message.includes("autorizado") || error.message.includes("negado") ? 403 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
