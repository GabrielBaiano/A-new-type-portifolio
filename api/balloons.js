/**
 * Consolidated API - Balloons & GitHub Cache
 * GET: Fetch balloon data
 * POST: Manually trigger GitHub Cache Update
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const API_SECRET = process.env.LEETCODE_ADMIN_KEY;

const supabaseHeaders = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
};

const githubHeaders = {
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'Portfolio-Cache-System',
  ...(GITHUB_TOKEN && { 'Authorization': `token ${GITHUB_TOKEN}` })
};

export default async function handler(req, res) {
  // Allow cron or manual trigger via GET/POST
  const isCron = req.headers['x-vercel-cron'] === '1';
  const isUpdateTrigger = (req.method === 'POST') || (req.method === 'GET' && req.query.update === 'true');
  const secret = req.method === 'POST' ? req.body.secret : req.query.secret;

  if (isUpdateTrigger) {
    if (!isCron && secret !== API_SECRET) return res.status(401).json({ error: 'Unauthorized' });
    // Cache update logic...
    try {
      const username = (req.method === 'POST' ? req.body.username : req.query.username) || 'GabrielBaiano';
      const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { headers: githubHeaders });
      const repos = await reposRes.json();
      const priorityReposNames = ['shii-study-assistant', 'awesome-readme', 'A-new-type-portifolio'];
      const reposToProcess = Array.isArray(repos) ? repos.filter(r => priorityReposNames.includes(r.name) || true).slice(0, 10) : [];
      
      const allProjectData = [];
      for (const repo of reposToProcess) {
        // Fetch Releases
        const relRes = await fetch(`https://api.github.com/repos/${repo.full_name}/releases?per_page=1`, { headers: githubHeaders });
        const releases = await relRes.json();
        if (Array.isArray(releases) && releases.length > 0) {
          const latest = releases[0];
          allProjectData.push({
            id: `release-${repo.id}-${latest.id}`, type: 'release', username: latest.author.login,
            avatar_url: latest.author.avatar_url, repo_name: repo.name, repo_full_name: repo.full_name,
            release_tag: latest.tag_name, release_notes: latest.body ? latest.body.substring(0, 500) : '',
            context: 'projects', project_context: repo.name.toLowerCase().replace(/[^a-z0-9]/g, '-'), created_at: latest.published_at
          });
        }
        // Fetch README
        let readmeRes = await fetch(`https://raw.githubusercontent.com/${repo.full_name}/main/README.md`);
        if (!readmeRes.ok) readmeRes = await fetch(`https://raw.githubusercontent.com/${repo.full_name}/master/README.md`);
        if (readmeRes.ok) {
          const content = await readmeRes.text();
          await fetch(`${SUPABASE_URL}/rest/v1/github_readmes`, {
            method: 'POST', headers: supabaseHeaders, body: JSON.stringify({ repo_full_name: repo.full_name, repo_name: repo.name, readme_content: content, updated_at: new Date().toISOString() })
          });
        }
      }

      if (allProjectData.length > 0) {
        await fetch(`${SUPABASE_URL}/rest/v1/github_project_data?id=neq.dummy`, { method: 'DELETE', headers: supabaseHeaders });
        await fetch(`${SUPABASE_URL}/rest/v1/github_project_data`, { method: 'POST', headers: supabaseHeaders, body: JSON.stringify(allProjectData) });
      }

      await fetch(`${SUPABASE_URL}/rest/v1/github_cache_metadata`, { method: 'POST', headers: supabaseHeaders, body: JSON.stringify({ username, last_updated: new Date().toISOString(), project_data_count: allProjectData.length }) });
      return res.status(200).json({ success: true, updated_at: new Date().toISOString() });
    } catch (error) {
       return res.status(500).json({ success: false, error: error.message });
    }
  }

  if (req.method === 'GET') {
    try {
      const { context, project } = req.query;
      const [projectDataRes, leetcodeRes] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/github_project_data?select=*&order=created_at.desc&limit=100${project ? `&project_context=eq.${project}` : ''}`, { headers: supabaseHeaders }),
        fetch(`${SUPABASE_URL}/rest/v1/leetcode_challenges?select=*&order=created_at.desc&limit=1`, { headers: supabaseHeaders })
      ]);
      const projectData = await projectDataRes.json();
      const leetcodeData = await leetcodeRes.json();
      
      const mappedReleases = (Array.isArray(projectData) ? projectData : []).filter(item => item.type === 'release').map(item => ({
        id: item.id, type: 'notification', name: item.repo_name, title: `New release ${item.release_tag}`,
        message: item.release_notes, badge: item.release_tag, image: item.avatar_url, color: 'green',
        link: `https://github.com/${item.repo_full_name}/releases/tag/${item.release_tag}`,
        date: item.created_at, contexts: project ? [project] : (context && context !== 'all' ? context.split(',') : ['home', 'academic', 'projects'])
      }));

      const mappedLeetcode = (Array.isArray(leetcodeData) ? leetcodeData : []).map(item => ({
        id: `leetcode-${item.id}`, type: 'leetcode', name: 'LeetCode Challenge', title: `#${item.number}: ${item.name}`,
        message: null, badge: `${item.streak} 🔥`, color: 'pink', category: item.category, link: `#/leetcode/${item.id}`,
        date: item.created_at, contexts: ['home', 'projects', 'academic']
      }));

      return res.status(200).json({ success: true, count: mappedReleases.length + mappedLeetcode.length, data: [...mappedReleases, ...mappedLeetcode] });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
