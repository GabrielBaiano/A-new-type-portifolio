/**
 * API para buscar README de um projeto específico
 * Retorna o conteúdo do README.md do Supabase
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
    const { repo } = req.query;
    
    if (!repo) {
      return res.status(400).json({ error: 'repo parameter is required' });
    }
    
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res.status(500).json({ error: 'Supabase not configured' });
    }

    // Buscar README do Supabase
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/github_readmes?repo_full_name=eq.${repo}&select=*`,
      { headers: supabaseHeaders }
    );
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return res.status(200).json({
        success: true,
        repo: data[0].repo_full_name,
        readme: data[0].readme_content,
        updated_at: data[0].updated_at
      });
    } else {
      return res.status(404).json({
        success: false,
        error: 'README not found for this repository'
      });
    }

  } catch (error) {
    console.error('Error fetching README:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
