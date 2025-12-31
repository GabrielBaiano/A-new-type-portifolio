/**
 * API de Leitura - Get Balloon Data
 * Busca dados do Supabase para exibir nos balões
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseHeaders = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json'
};

export default async function handler(req, res) {
  try {
    const { context, project } = req.query;
    
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res.status(500).json({ error: 'Supabase not configured' });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateFilter = `&created_at=gte.${sevenDaysAgo.toISOString()}`;

    let data = [];

    // Simplified: All contexts now fetch ONLY Project Data (Stars, Releases, etc.)
    const [projectDataRes, leetcodeRes] = await Promise.all([
      fetch(
        `${SUPABASE_URL}/rest/v1/github_project_data?select=*&order=created_at.desc&limit=100${project ? `&project_context=eq.${project}` : ''}`,
        { headers: supabaseHeaders }
      ),
      fetch(
        `${SUPABASE_URL}/rest/v1/leetcode_challenges?select=*&order=created_at.desc&limit=50`,
        { headers: supabaseHeaders }
      )
    ]);

    const projectData = await projectDataRes.json();
    const leetcodeData = await leetcodeRes.json();
    
    const mappedReleases = Array.isArray(projectData) ? projectData
      .filter(item => item.type === 'release')
      .map(item => {
        return {
          id: item.id,
          type: 'notification',
          name: formatRepoName(item.repo_name),
          title: `New release ${item.release_tag}`,
          message: item.release_notes,
          badge: item.release_tag,
          image: item.avatar_url,
          color: 'green',
          link: `https://github.com/${item.repo_full_name}/releases/tag/${item.release_tag}`,
          date: item.created_at,
          contexts: project ? [project] : (context && context !== 'all' ? context.split(',') : ['home', 'academic', 'projects'])
        };
      }) : [];

    const mappedLeetcode = Array.isArray(leetcodeData) ? leetcodeData.map(item => ({
      id: `leetcode-${item.id}`,
      type: 'leetcode',
      name: 'LeetCode Challenge',
      title: `#${item.number}: ${item.name}`,
      message: null,
      badge: `${item.streak} 🔥`,
      color: 'pink',
      category: item.category,
      link: `#/leetcode/${item.id}`, // Route to the new blog page
      date: item.created_at,
      contexts: ['home', 'projects', 'academic']
    })) : [];

    data = [...mappedReleases, ...mappedLeetcode];

    return res.status(200).json({
      success: true,
      count: data.length,
      data: data
    });

  } catch (error) {
    console.error('Error fetching balloon data:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

function getMessageForType(type, item) {
  const messages = {
    'star': `Starred ${item.repo_name}`,
    'release': `New release ${item.release_tag}: ${item.release_notes}`
  };
  return messages[type] || 'GitHub activity';
}

function getBadgeForType(type) {
  const badges = {
    'star': 'Star',
    'release': 'Release'
  };
  return badges[type] || 'Activity';
}

function formatRepoName(repoName) {
  if (!repoName) return '';
  // Turn "shii-study-assistant" into "Shii Study Assistant"
  return repoName
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
