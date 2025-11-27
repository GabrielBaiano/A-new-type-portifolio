/**
 * Vercel Serverless Function - GitHub Data Cache
 * 
 * Fetches GitHub data and stores in Supabase for balloon notifications
 * 
 * Endpoints:
 * - GET /api/update-github-cache?username=YOUR_USERNAME
 * - Cron job runs every 6 hours
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const headers = {
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'Portfolio-Cache-System',
  ...(GITHUB_TOKEN && { 'Authorization': `token ${GITHUB_TOKEN}` })
};

export default async function handler(req, res) {
  try {
    const username = req.query.username || process.env.GITHUB_USERNAME;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    console.log(`Updating cache for user: ${username}`);

    // ========================================
    // A) FOLLOWERS (para Home)
    // ========================================
    const followersRes = await fetch(
      `https://api.github.com/users/${username}/followers?per_page=100`,
      { headers }
    );
    const followers = await followersRes.json();

    const followersData = followers.map(follower => ({
      id: `follower-${follower.id}`,
      type: 'follower',
      username: follower.login,
      avatar_url: follower.avatar_url,
      profile_url: follower.html_url,
      context: 'home',
      created_at: new Date().toISOString()
    }));

    // ========================================
    // B) USER REPOS (para pegar dados de cada projeto)
    // ========================================
    const reposRes = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
      { headers }
    );
    const repos = await reposRes.json();

    const allProjectData = [];

    // Para cada repositório, buscar dados detalhados
    for (const repo of repos.slice(0, 10)) { // Limitar a 10 repos principais
      const repoFullName = repo.full_name;
      
      console.log(`Processing repo: ${repoFullName}`);

      // 1. Stargazers (quem deu estrela)
      const starsRes = await fetch(
        `https://api.github.com/repos/${repoFullName}/stargazers?per_page=100`,
        { headers }
      );
      const stargazers = await starsRes.json();

      stargazers.forEach(user => {
        allProjectData.push({
          id: `star-${repo.id}-${user.id}`,
          type: 'star',
          username: user.login,
          avatar_url: user.avatar_url,
          profile_url: user.html_url,
          repo_name: repo.name,
          repo_full_name: repoFullName,
          context: 'projects',
          project_context: repo.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          created_at: new Date().toISOString()
        });
      });

      // 2. Contributors (quem contribuiu)
      const contributorsRes = await fetch(
        `https://api.github.com/repos/${repoFullName}/contributors?per_page=100`,
        { headers }
      );
      const contributors = await contributorsRes.json();

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
            project_context: repo.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            created_at: new Date().toISOString()
          });
        });
      }

      // 3. Forks (quem fez fork)
      const forksRes = await fetch(
        `https://api.github.com/repos/${repoFullName}/forks?per_page=100`,
        { headers }
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
            project_context: repo.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            created_at: fork.created_at
          });
        });
      }

      // 4. Issues (abertas e fechadas recentes)
      const issuesRes = await fetch(
        `https://api.github.com/repos/${repoFullName}/issues?state=all&per_page=50`,
        { headers }
      );
      const issues = await issuesRes.json();

      if (Array.isArray(issues)) {
        issues.forEach(issue => {
          if (!issue.pull_request) { // Filtrar apenas issues, não PRs
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
              project_context: repo.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
              created_at: issue.created_at
            });
          }
        });
      }

      // 5. Pull Requests
      const prsRes = await fetch(
        `https://api.github.com/repos/${repoFullName}/pulls?state=all&per_page=50`,
        { headers }
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
            project_context: repo.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            created_at: pr.created_at
          });
        });
      }

      // 6. README.md do projeto
      try {
        const readmeRes = await fetch(
          `https://raw.githubusercontent.com/${repoFullName}/main/README.md`,
          { headers }
        );
        
        let readme = '';
        if (readmeRes.ok) {
          readme = await readmeRes.text();
        } else {
          // Tentar branch master se main não existir
          const readmeMasterRes = await fetch(
            `https://raw.githubusercontent.com/${repoFullName}/master/README.md`,
            { headers }
          );
          if (readmeMasterRes.ok) {
            readme = await readmeMasterRes.text();
          }
        }

        // Salvar README separadamente
        await supabase
          .from('github_readmes')
          .upsert({
            repo_full_name: repoFullName,
            repo_name: repo.name,
            readme_content: readme,
            updated_at: new Date().toISOString()
          }, { onConflict: 'repo_full_name' });

      } catch (error) {
        console.error(`Error fetching README for ${repoFullName}:`, error);
      }

      // Pequeno delay para não bater rate limit
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // ========================================
    // SALVAR TUDO NO SUPABASE
    // ========================================

    // 1. Limpar dados antigos
    await supabase.from('github_followers').delete().neq('id', '');
    await supabase.from('github_project_data').delete().neq('id', '');

    // 2. Inserir followers
    if (followersData.length > 0) {
      const { error: followersError } = await supabase
        .from('github_followers')
        .insert(followersData);
      
      if (followersError) {
        console.error('Error inserting followers:', followersError);
      }
    }

    // 3. Inserir project data
    if (allProjectData.length > 0) {
      const { error: projectError } = await supabase
        .from('github_project_data')
        .insert(allProjectData);
      
      if (projectError) {
        console.error('Error inserting project data:', projectError);
      }
    }

    // 4. Atualizar timestamp do último update
    await supabase
      .from('github_cache_metadata')
      .upsert({
        username: username,
        last_updated: new Date().toISOString(),
        followers_count: followersData.length,
        project_data_count: allProjectData.length
      }, { onConflict: 'username' });

    return res.status(200).json({
      success: true,
      updated_at: new Date().toISOString(),
      data: {
        followers: followersData.length,
        project_data: allProjectData.length,
        repos_processed: Math.min(repos.length, 10)
      }
    });

  } catch (error) {
    console.error('Error updating GitHub cache:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
