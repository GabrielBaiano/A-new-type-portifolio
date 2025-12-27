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

    if (context === 'home') {
      // Buscar followers para Home (Last 7 days)
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/github_followers?select=*&order=created_at.desc&limit=50${dateFilter}`,
        { headers: supabaseHeaders }
      );
      const followers = await response.json();
      
      data = followers.map(f => ({
        id: f.id,
        type: 'notification',
        name: f.username,
        message: 'Started following you on GitHub',
        badge: '👥',
        image: f.avatar_url,
        date: f.created_at,
        contexts: ['home']
      }));
      
    } else if (project) {
      // Buscar dados de projeto específico (Last 7 days)
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/github_project_data?project_context=eq.${project}&select=*&order=created_at.desc&limit=100${dateFilter}`,
        { headers: supabaseHeaders }
      );
      const projectData = await response.json();
      
      data = projectData.map(item => ({
        id: item.id,
        type: 'notification',
        name: item.username,
        message: getMessageForType(item.type, item),
        badge: getBadgeForType(item.type),
        image: item.avatar_url,
        date: item.created_at,
        contexts: [project]
      }));
      
    } else {
      // Buscar todos os projetos (Last 7 days)
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/github_project_data?context=eq.projects&select=*&order=created_at.desc&limit=100${dateFilter}`,
        { headers: supabaseHeaders }
      );
      const projectData = await response.json();
      
      data = projectData.map(item => ({
        id: item.id,
        type: 'notification',
        name: item.username,
        message: getMessageForType(item.type, item),
        badge: getBadgeForType(item.type),
        image: item.avatar_url,
        date: item.created_at,
        contexts: ['projects']
      }));
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
    'pr_merged': `Merged PR in ${item.repo_name}`
  };
  return messages[type] || 'GitHub activity';
}

function getBadgeForType(type) {
  const badges = {
    'star': '⭐',
    'contributor': '💻',
    'fork': '🍴',
    'issue_opened': '🐛',
    'issue_closed': '🔧',
    'pr_opened': '📝',
    'pr_merged': '✅'
  };
  return badges[type] || '📌';
}
