/**
 * Vercel Serverless Function - Complete GitHub Data Cache
 * Fetches followers, repos, stars, contributors, forks, issues, PRs, releases, and READMEs
 * Saves everything to Supabase via REST API
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const githubHeaders = {
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'Portfolio-Cache-System',
  ...(GITHUB_TOKEN && { 'Authorization': `token ${GITHUB_TOKEN}` })
};

const supabaseHeaders = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
};

async function supabaseRequest(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: supabaseHeaders
  };
  if (body) options.body = JSON.stringify(body);
  
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, options);
  return response;
}

export default async function handler(req, res) {
  try {
    const username = req.query.username || process.env.GITHUB_USERNAME || 'GabrielBaiano';
    
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res.status(500).json({ 
        error: 'Supabase not configured' 
      });
    }

    console.log(`Updating cache for user: ${username}`);

    // ========================================
    // 2. REPOSITÓRIOS DO USUÁRIO
    // ========================================
    const reposRes = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
      { headers: githubHeaders }
    );
    const repos = await reposRes.json();

    const allProjectData = [];

    // Priority projects that MUST be processed
    const priorityReposNames = ['shii-study-assistant', 'awesome-readme', 'A-new-type-portifolio'];
    
    // Filter priority repos from the list
    const priorityRepos = Array.isArray(repos) ? repos.filter(r => priorityReposNames.includes(r.name)) : [];
    
    // Get other repos (excluding priority ones) up to a safe limit
    const MAX_REPOS = 6;
    const remainingSlots = Math.max(0, MAX_REPOS - priorityRepos.length);
    const otherRepos = Array.isArray(repos) ? repos
      .filter(r => !priorityReposNames.includes(r.name))
      .slice(0, remainingSlots) : [];

    const reposToProcess = [...priorityRepos, ...otherRepos];

    console.log(`Selected ${reposToProcess.length} repos for processing: ${reposToProcess.map(r => r.name).join(', ')}`);

    // Process selected repos
    for (const repo of reposToProcess) {
      const repoFullName = repo.full_name;
      const projectContext = repo.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      
      console.log(`Processing: ${repoFullName}`);

      // 2.6 Releases (NEW)
      try {
        const releasesRes = await fetch(
          `https://api.github.com/repos/${repoFullName}/releases?per_page=1`,
          { headers: githubHeaders }
        );
        const releases = await releasesRes.json();
        
        if (Array.isArray(releases) && releases.length > 0) {
          const latest = releases[0];
          allProjectData.push({
            id: `release-${repo.id}-${latest.id}`,
            type: 'release',
            username: latest.author.login,
            avatar_url: latest.author.avatar_url,
            profile_url: latest.author.html_url,
            repo_name: repo.name,
            repo_full_name: repoFullName,
            release_tag: latest.tag_name,
            release_notes: latest.body ? latest.body.substring(0, 150) : '',
            context: 'projects',
            project_context: projectContext,
            created_at: latest.published_at
          });
        }
      } catch (e) { console.error('Error fetching releases:', e); }

      // 2.7 README
      try {
        let readmeRes = await fetch(
          `https://raw.githubusercontent.com/${repoFullName}/main/README.md`,
          { headers: githubHeaders }
        );
        
        let readme = '';
        if (readmeRes.ok) {
          readme = await readmeRes.text();
        } else {
          readmeRes = await fetch(
            `https://raw.githubusercontent.com/${repoFullName}/master/README.md`,
            { headers: githubHeaders }
          );
          if (readmeRes.ok) readme = await readmeRes.text();
        }

        if (readme) {
          await supabaseRequest('github_readmes', 'POST', {
            repo_full_name: repoFullName,
            repo_name: repo.name,
            readme_content: readme,
            updated_at: new Date().toISOString()
          });
        }
      } catch (e) { console.error('Error fetching README:', e); }

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // ========================================
    // 3. SALVAR NO SUPABASE
    // ========================================

    const debugInfo = {
      reposFound: repos ? repos.length : 0,
      projectDataCount: allProjectData.length,
      errors: []
    };

    if (allProjectData.length > 0) {
      await supabaseRequest('github_project_data?id=neq.dummy', 'DELETE');
      
      const normalizedData = allProjectData.map(item => ({
        contributions: null,
        release_tag: null,
        release_notes: null,
        ...item
      }));

      const insertRes = await supabaseRequest('github_project_data', 'POST', normalizedData);
      if (!insertRes.ok) {
        const errorText = await insertRes.text();
        debugInfo.errors.push(`Insert Project Data Failed: ${insertRes.statusText} - ${errorText}`);
      }
    }
    
    await supabaseRequest('github_cache_metadata', 'POST', {
      username: username,
      last_updated: new Date().toISOString(),
      project_data_count: allProjectData.length
    });

    return res.status(200).json({
      success: true,
      updated_at: new Date().toISOString(),
      debug: debugInfo
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
