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

    // For 'home' and 'academic', we want EVERYTHING (Followers + All Project Data)
    if (context === 'home' || context === 'academic') {
      const [followersRes, projectDataRes] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/github_followers?select=*&order=created_at.desc&limit=25${dateFilter}`, { headers: supabaseHeaders }),
        fetch(`${SUPABASE_URL}/rest/v1/github_project_data?select=*&order=created_at.desc&limit=50${dateFilter}`, { headers: supabaseHeaders })
      ]);

      const followers = await followersRes.json();
      const projectData = await projectDataRes.json();

      const mappedFollowers = Array.isArray(followers) ? followers.map(f => ({
        id: f.id,
        type: 'notification',
        name: f.username,
        message: 'Started following you on GitHub',
        badge: 'Follower',
        image: f.avatar_url,
        date: f.created_at,
        contexts: ['home', 'academic']
      })) : [];

      const mappedProjects = Array.isArray(projectData) ? projectData.map(item => ({
        id: item.id,
        type: 'notification',
        name: item.username,
        message: getMessageForType(item.type, item),
        badge: getBadgeForType(item.type),
        image: item.avatar_url,
        date: item.created_at,
        contexts: ['home', 'academic', 'projects']
      })) : [];

      data = [...mappedFollowers, ...mappedProjects];

    } else if (project) {
      // Specific project context
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/github_project_data?project_context=eq.${project}&select=*&order=created_at.desc&limit=50${dateFilter}`,
        { headers: supabaseHeaders }
      );
      const projectData = await response.json();
      
      data = Array.isArray(projectData) ? projectData.map(item => ({
        id: item.id,
        type: 'notification',
        name: item.username,
        message: getMessageForType(item.type, item),
        badge: getBadgeForType(item.type),
        image: item.avatar_url,
        date: item.created_at,
        contexts: [project]
      })) : [];
      
    } else {
      // General projects context
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/github_project_data?select=*&order=created_at.desc&limit=50${dateFilter}`,
        { headers: supabaseHeaders }
      );
      const projectData = await response.json();
      
      data = Array.isArray(projectData) ? projectData.map(item => ({
        id: item.id,
        type: 'notification',
        name: item.username,
        message: getMessageForType(item.type, item),
        badge: getBadgeForType(item.type),
        image: item.avatar_url,
        date: item.created_at,
        contexts: ['projects']
      })) : [];
    }

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
