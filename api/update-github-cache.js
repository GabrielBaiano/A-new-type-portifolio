/**
 * Vercel Serverless Function - GitHub Data Cache with Supabase
 * Uses Supabase REST API directly (no npm package needed)
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

export default async function handler(req, res) {
  try {
    const username = req.query.username || process.env.GITHUB_USERNAME || 'GabrielBaiano';
    
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res.status(500).json({ 
        error: 'Supabase not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY' 
      });
    }

    console.log(`Updating cache for user: ${username}`);

    // Buscar followers do GitHub
    const followersRes = await fetch(
      `https://api.github.com/users/${username}/followers?per_page=50`,
      { headers: githubHeaders }
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

    // Limpar dados antigos do Supabase
    await fetch(`${SUPABASE_URL}/rest/v1/github_followers?id=neq.dummy`, {
      method: 'DELETE',
      headers: supabaseHeaders
    });

    // Inserir novos followers no Supabase
    if (followersData.length > 0) {
      await fetch(`${SUPABASE_URL}/rest/v1/github_followers`, {
        method: 'POST',
        headers: supabaseHeaders,
        body: JSON.stringify(followersData)
      });
    }

    // Atualizar metadata
    await fetch(`${SUPABASE_URL}/rest/v1/github_cache_metadata`, {
      method: 'POST',
      headers: {
        ...supabaseHeaders,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        username: username,
        last_updated: new Date().toISOString(),
        followers_count: followersData.length,
        project_data_count: 0
      })
    });

    return res.status(200).json({
      success: true,
      updated_at: new Date().toISOString(),
      data: {
        followers: followersData.length,
        cached: true
      }
    });

  } catch (error) {
    console.error('Error updating cache:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
