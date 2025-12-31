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
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/github_project_data?select=*&order=created_at.desc&limit=50${dateFilter}${project ? `&project_context=eq.${project}` : ''}`,
      { headers: supabaseHeaders }
    );
    const projectData = await response.json();
    
    data = Array.isArray(projectData) ? projectData.map(item => {
      const isRelease = item.type === 'release';
      return {
        id: item.id,
        type: 'notification',
        name: isRelease ? formatRepoName(item.repo_name) : item.username,
        message: getMessageForType(item.type, item),
        badge: getBadgeForType(item.type),
        image: item.avatar_url,
        color: isRelease ? 'green' : (item.type === 'star' ? 'blue' : null),
        link: isRelease ? `https://github.com/${item.repo_full_name}/releases/tag/${item.release_tag}` : `https://github.com/${item.username}`,
        date: item.created_at,
        contexts: project ? [project] : (context ? context.split(',') : ['home', 'academic', 'projects'])
      };
    }) : [];

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
    'contributor': `Contributed ${item.contributions || ''} times to ${item.repo_name}`,
    'fork': `Forked ${item.repo_name}`,
    'issue_opened': `Opened issue: ${item.issue_title}`,
    'issue_closed': `Closed issue in ${item.repo_name}`,
    'pr_opened': `Opened PR: ${item.pr_title}`,
    'pr_merged': `Merged PR in ${item.repo_name}`,
    'release': `New release ${item.release_tag}: ${item.release_notes}`
  };
  return messages[type] || 'GitHub activity';
}

function getBadgeForType(type) {
  const badges = {
    'star': 'Star',
    'contributor': 'Commit',
    'fork': 'Fork',
    'issue_opened': 'Issue',
    'issue_closed': 'Fixed',
    'pr_opened': 'PR',
    'pr_merged': 'Merged',
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
