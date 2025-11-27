/**
 * Vercel Serverless Function - GitHub Data
 * 
 * Fetches GitHub data and returns directly (no database)
 * Works without any configuration except optional GITHUB_TOKEN
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const headers = {
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'Portfolio-System',
  ...(GITHUB_TOKEN && { 'Authorization': `token ${GITHUB_TOKEN}` })
};

export default async function handler(req, res) {
  try {
    const username = req.query.username || process.env.GITHUB_USERNAME || 'GabrielBaiano';
    
    console.log(`Fetching data for user: ${username}`);

    // Buscar followers
    const followersRes = await fetch(
      `https://api.github.com/users/${username}/followers?per_page=30`,
      { headers }
    );
    
    if (!followersRes.ok) {
      throw new Error(`GitHub API error: ${followersRes.status}`);
    }
    
    const followers = await followersRes.json();

    // Transformar para formato de balões
    const balloonData = followers.map(follower => ({
      id: `follower-${follower.id}`,
      type: 'notification',
      name: follower.login,
      message: 'Started following you on GitHub',
      badge: '👥',
      image: follower.avatar_url,
      contexts: ['home']
    }));

    return res.status(200).json({
      success: true,
      updated_at: new Date().toISOString(),
      count: balloonData.length,
      data: balloonData
    });

  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
