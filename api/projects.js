/**
 * Consolidated API - Projects
 * GET: Fetch project readme
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseHeaders = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json'
};

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { repo } = req.query;
    if (!repo) return res.status(400).json({ error: 'repo required' });

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/github_readmes?repo_full_name=eq.${repo}&select=*`, { headers: supabaseHeaders });
      const data = await response.json();
      if (data && data.length > 0) {
        return res.status(200).json({ success: true, repo: data[0].repo_full_name, readme: data[0].readme_content, updated_at: data[0].updated_at });
      }
      return res.status(404).json({ success: false, error: 'Not found' });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
