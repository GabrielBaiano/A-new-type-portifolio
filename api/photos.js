/**
 * Consolidated API - Photos
 * GET: Fetch all photos
 * POST: Add/Update a photo
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
    const { secret } = req.query;
    const isAuth = API_SECRET && secret && secret === API_SECRET;
    const filter = isAuth ? '' : '&show_in_feed=eq.true';

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/photos?select=*&order=created_at.desc${filter}`, { headers: supabaseHeaders });
      if (!response.ok) {
        const errorText = await response.text();
        return res.status(500).json({ success: false, error: `Supabase Error: ${response.status} ${errorText}` });
      }
      const data = await response.json();
      return res.status(200).json({ success: true, count: data.length, data: data });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  if (req.method === 'POST') {
    const { id, title, image_url, description, link, show_in_feed, secret } = req.body;
    
    if (!API_SECRET) {
      return res.status(500).json({ error: 'Server configuration error: Admin key not found' });
    }

    if (!secret) {
      return res.status(401).json({ error: 'Unauthorized: Missing secret key' });
    }

    if (secret !== API_SECRET) {
      return res.status(401).json({ error: 'Unauthorized: Invalid secret key' });
    }
    if (!image_url) return res.status(400).json({ error: 'Missing Image URL' });

    try {
      const finalId = id || `photo-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const method = id ? 'PATCH' : 'POST';
      const endpoint = id ? `${SUPABASE_URL}/rest/v1/photos?id=eq.${id}` : `${SUPABASE_URL}/rest/v1/photos`;
      
      const payload = { title, image_url, description, link, show_in_feed: show_in_feed !== false ? true : false };
      if (method === 'POST') {
        payload.id = finalId;
        payload.created_at = new Date().toISOString();
      }

      const response = await fetch(endpoint, {
        method,
        headers: supabaseHeaders,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Supabase Error:', response.status, errorText);
        return res.status(500).json({ success: false, error: `Supabase Error: ${response.status} ${errorText}` });
      }

      const result = method === 'POST' ? await response.json() : null;
      return res.status(200).json({ success: true, message: 'Photo saved!', data: result ? result[0] : null });
    } catch (error) {
      console.error('API Error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  if (req.method === 'DELETE') {
    const { id, secret } = req.body;

    if (!secret || secret !== API_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!id) return res.status(400).json({ error: 'Missing ID' });

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/photos?id=eq.${id}`, {
        method: 'DELETE',
        headers: supabaseHeaders
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete photo');
      }

      return res.status(200).json({ success: true, message: 'Photo deleted!' });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
