/**
 * Vercel Serverless Function - Complete GitHub Data Cache
 * Fetches followers, repos, stars, contributors, forks, issues, PRs, and READMEs
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
    // 1. FOLLOWERS (para Home)
    // ========================================
    const followersRes = await fetch(
      `https://api.github.com/users/${username}/followers?per_page=100`,
      { headers: githubHeaders }
    );
    const followers = await followersRes.json();

    const followersData = followers.map(f => ({
      id: `follower-${f.id}`,
      type: 'follower',
      username: f.login,
      avatar_url: f.avatar_url,
      profile_url: f.html_url,
      context: 'home',
      created_at: new Date().toISOString()
    }));

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
    const priorityRepos = repos.filter(r => priorityReposNames.includes(r.name));
    
    // Get other repos (excluding priority ones) up to a safe limit
    // Total limit of 6 ensures execution time stays safely within Vercel's 10s limit for Hobby plan
    // (6 repos * ~6 requests each = ~36 requests)
    const MAX_REPOS = 6;
    const remainingSlots = Math.max(0, MAX_REPOS - priorityRepos.length);
    const otherRepos = repos
      .filter(r => !priorityReposNames.includes(r.name))
      .slice(0, remainingSlots);

    const reposToProcess = [...priorityRepos, ...otherRepos];

    console.log(`Selected ${reposToProcess.length} repos for processing: ${reposToProcess.map(r => r.name).join(', ')}`);

    // Process selected repos
    for (const repo of reposToProcess) {
      const repoFullName = repo.full_name;
      const projectContext = repo.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      
      console.log(`Processing: ${repoFullName}`);

      // 2.1 Stargazers
      try {
        const starsRes = await fetch(
          `https://api.github.com/repos/${repoFullName}/stargazers?per_page=100`,
          { 
            headers: {
              ...githubHeaders,
              'Accept': 'application/vnd.github.v3.star+json'
            }
          }
        );
        const stars = await starsRes.json();
        
        if (Array.isArray(stars)) {
          stars.forEach(starItem => {
            const user = starItem.user;
            allProjectData.push({
              id: `star-${repo.id}-${user.id}`,
              type: 'star',
              username: user.login,
              avatar_url: user.avatar_url,
              profile_url: user.html_url,
              repo_name: repo.name,
              repo_full_name: repoFullName,
              context: 'projects',
              project_context: projectContext,
              created_at: starItem.starred_at // Real timestamp
            });
          });
        }
      } catch (e) { console.error('Error fetching stars:', e); }

      // 2.2 Contributors
      try {
        const contribRes = await fetch(
          `https://api.github.com/repos/${repoFullName}/contributors?per_page=100`,
          { headers: githubHeaders }
        );
        const contributors = await contribRes.json();
        
        if (Array.isArray(contributors)) {
          contributors.forEach(user => {
            allProjectData.push({
              id: `contributor-${repo.id}-${user.id}`,
              type: 'contributor',
              username: user.login,
              avatar_url: user.avatar_url,
              profile_url: user.html_url,
              contributions: user.contributions,
              repo_name: repo.name,
              repo_full_name: repoFullName,
              context: 'projects',
              project_context: projectContext,
              created_at: new Date().toISOString()
            });
          });
        }
      } catch (e) { console.error('Error fetching contributors:', e); }

      // 2.3 Forks
      try {
        const forksRes = await fetch(
          `https://api.github.com/repos/${repoFullName}/forks?per_page=50`,
          { headers: githubHeaders }
        );
        const forks = await forksRes.json();
        
        if (Array.isArray(forks)) {
          forks.forEach(fork => {
            allProjectData.push({
              id: `fork-${repo.id}-${fork.id}`,
              type: 'fork',
              username: fork.owner.login,
              avatar_url: fork.owner.avatar_url,
              profile_url: fork.owner.html_url,
              repo_name: repo.name,
              repo_full_name: repoFullName,
              fork_url: fork.html_url,
              context: 'projects',
              project_context: projectContext,
              created_at: fork.created_at
            });
          });
        }
      } catch (e) { console.error('Error fetching forks:', e); }

      // 2.4 Issues
      try {
        const issuesRes = await fetch(
          `https://api.github.com/repos/${repoFullName}/issues?state=all&per_page=30`,
          { headers: githubHeaders }
        );
        const issues = await issuesRes.json();
        
        if (Array.isArray(issues)) {
          issues.forEach(issue => {
            if (!issue.pull_request) {
              allProjectData.push({
                id: `issue-${repo.id}-${issue.id}`,
                type: issue.state === 'closed' ? 'issue_closed' : 'issue_opened',
                username: issue.user.login,
                avatar_url: issue.user.avatar_url,
                profile_url: issue.user.html_url,
                issue_title: issue.title,
                issue_url: issue.html_url,
                issue_number: issue.number,
                repo_name: repo.name,
                repo_full_name: repoFullName,
                context: 'projects',
                project_context: projectContext,
                created_at: issue.created_at
              });
            }
          });
        }
      } catch (e) { console.error('Error fetching issues:', e); }

      // 2.5 Pull Requests
      try {
        const prsRes = await fetch(
          `https://api.github.com/repos/${repoFullName}/pulls?state=all&per_page=30`,
          { headers: githubHeaders }
        );
        const prs = await prsRes.json();
        
        if (Array.isArray(prs)) {
          prs.forEach(pr => {
            allProjectData.push({
              id: `pr-${repo.id}-${pr.id}`,
              type: pr.state === 'closed' ? 'pr_merged' : 'pr_opened',
              username: pr.user.login,
              avatar_url: pr.user.avatar_url,
              profile_url: pr.user.html_url,
              pr_title: pr.title,
              pr_url: pr.html_url,
              pr_number: pr.number,
              repo_name: repo.name,
              repo_full_name: repoFullName,
              context: 'projects',
              project_context: projectContext,
              created_at: pr.created_at
            });
          });
        }
      } catch (e) { console.error('Error fetching PRs:', e); }

      // 2.6 README
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

      // Delay para não bater rate limit
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // ========================================
    // 3. SALVAR NO SUPABASE
    // ========================================

    // ========================================
    // 3. SALVAR NO SUPABASE
    // ========================================

    const debugInfo = {
      reposFound: repos ? repos.length : 0,
      followersFound: followersData.length,
      projectDataCount: allProjectData.length,
      sampleProjectData: allProjectData.length > 0 ? allProjectData[0] : null,
      errors: []
    };

    // Only update if we actually found data (Safety Check)
    if (allProjectData.length > 0) {
      // Limpar dados antigos
      await supabaseRequest('github_project_data?id=neq.dummy', 'DELETE');
      
      // Normalize data to ensure all keys exist (Supabase requirement for bulk insert)
      const normalizedData = allProjectData.map(item => ({
        contributions: null,
        fork_url: null,
        issue_title: null,
        issue_url: null,
        issue_number: null,
        pr_title: null,
        pr_url: null,
        pr_number: null,
        ...item
      }));

      // Inserir project data
      const insertRes = await supabaseRequest('github_project_data', 'POST', normalizedData);
      if (!insertRes.ok) {
        const errorText = await insertRes.text();
        debugInfo.errors.push(`Insert Project Data Failed: ${insertRes.statusText} - ${errorText}`);
        console.error('Supabase Insert Error:', errorText);
      }
    } else {
      debugInfo.errors.push("No project data found to insert. Skipping DB wipe to preserve cache.");
    }

    if (followersData.length > 0) {
        await supabaseRequest('github_followers?id=neq.dummy', 'DELETE');
        await supabaseRequest('github_followers', 'POST', followersData);
    }
    
    // Atualizar metadata
    await supabaseRequest('github_cache_metadata', 'POST', {
      username: username,
      last_updated: new Date().toISOString(),
      followers_count: followersData.length,
      project_data_count: allProjectData.length
    });

    return res.status(200).json({
      success: true,
      updated_at: new Date().toISOString(),
      debug: debugInfo,
      data: {
        followers: followersData.length,
        project_data: allProjectData.length,
        repos_processed: reposToProcess.length
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
