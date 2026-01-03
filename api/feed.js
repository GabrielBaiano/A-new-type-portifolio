/**
 * Consolidated API - Feed Posts
 * GET: Fetch all posts
 * POST: Add a new post
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const API_SECRET = process.env.LEETCODE_ADMIN_KEY;

const supabaseHeaders = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/feed_posts?select=*&order=date.desc`, { headers: supabaseHeaders });
      if (!response.ok) return res.status(200).json({ success: true, data: [] });
      const data = await response.json();
      return res.status(200).json({ success: true, count: data.length, data: data });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  if (req.method === 'POST') {
    const { id: manualId, title, content, tag, show_in_feed, is_popular, show_toc, secret, checkOnly } = req.body;
    if (secret !== API_SECRET) return res.status(401).json({ error: 'Unauthorized' });
    
    if (checkOnly) {
      return res.status(200).json({ success: true, message: 'Authenticated' });
    }

    if (!title || !content || !tag) return res.status(400).json({ error: 'Missing fields' });

    try {
      const id = manualId || title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString().slice(-4);
      
      const upsertHeaders = {
        ...supabaseHeaders,
        'Prefer': 'return=representation, resolution=merge-duplicates'
      };

      const payload = { 
        id, title, content, tag, 
        show_in_feed: show_in_feed !== false ? true : false,
        is_popular: is_popular === true ? true : false,
        show_toc: show_toc === true ? true : false
      };
      
      // Only set date on new posts if we can detect it, but for a simple API 
      // we'll just keep the existing date if possible. 
      // In Supabase REST/PostgREST, we can use UPSERT logic.
      if (!manualId) {
        payload.date = new Date().toISOString();
      }

      const response = await fetch(`${SUPABASE_URL}/rest/v1/feed_posts`, {
        method: 'POST',
        headers: upsertHeaders,
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Supabase error');
      }

      const result = await response.json();
      return res.status(200).json({ success: true, message: `Post saved!`, data: result[0] });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
