import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE // precisa ser service role
);

export default async function handler(req, res) {
  const { repo } = req.query;
  if (!repo) return res.status(400).json({ error: "repo obrigatório" });

  // 1. Buscar contributors
  const contributors = await fetch(
    `https://api.github.com/repos/${repo}/contributors`,
    { headers: { "User-Agent": "CacheUpdater" } }
  ).then(r => r.json());

  // 2. Issues abertas
  const issues = await fetch(
    `https://api.github.com/repos/${repo}/issues?state=open`,
    { headers: { "User-Agent": "CacheUpdater" } }
  ).then(r => r.json());

  // 3. README
  const readmeResp = await fetch(
    `https://raw.githubusercontent.com/${repo}/main/README.md`
  );
  const readme = await readmeResp.text();

  // 4. Atualizar Supabase
  await supabase
    .from("github_projects_cache")
    .upsert({
      repo_name: repo,
      contributors,
      issues,
      readme,
      updated_at: new Date()
    });

  return res.status(200).json({ ok: true });
}
