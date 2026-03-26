import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");

  if (!slug) {
    return new Response("Missing slug", { status: 400, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase.rpc("get_public_store_by_slug", {
    _slug: slug,
  });

  const store = Array.isArray(data) ? data[0] : null;

  // Fetch dynamic site name
  let siteName = "Recargas Brasil";
  try {
    const { data: configData } = await supabase.from("system_config").select("value").eq("key", "siteTitle").maybeSingle();
    if (configData?.value) siteName = configData.value;
  } catch {}

  // Defaults
  const defaultTitle = `${siteName} - Sistema de Recargas`;
  const defaultDescription =
    "Sistema de recargas de celular para revendedores. Gerencie saldos, recargas e clientes.";
  const defaultImage = "https://recargasbrasill.com/og-image.png";

  // Dynamic values
  const title = store?.store_name
    ? `${store.store_name} - Recargas`
    : defaultTitle;
  const description = store?.store_name
    ? `Recargas rápidas e seguras em ${store.store_name}. Todas as operadoras disponíveis.`
    : defaultDescription;
  const image = store?.store_logo_url || defaultImage;

  // The actual SPA URL to redirect real users to
  const spaUrl = `https://recargasbrasill.com/loja/${slug}`;

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(image)}">
  <meta property="og:url" content="${escapeHtml(spaUrl)}">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(image)}">

  <!-- Redirect real users to SPA -->
  <meta http-equiv="refresh" content="0;url=${escapeHtml(spaUrl)}">
</head>
<body>
  <p>Redirecionando para <a href="${escapeHtml(spaUrl)}">${escapeHtml(title)}</a>...</p>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
