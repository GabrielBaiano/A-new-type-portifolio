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
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/photos?select=*&order=created_at.desc`, { headers: supabaseHeaders });
      if (!response.ok) return res.status(200).json({ success: true, data: [] });
      const data = await response.json();
      return res.status(200).json({ success: true, count: data.length, data: data });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  if (req.method === 'POST') {
    const { id, image_url, description, link, secret } = req.body;
    
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
      const method = id ? 'PATCH' : 'POST';
      const endpoint = id ? `${SUPABASE_URL}/rest/v1/photos?id=eq.${id}` : `${SUPABASE_URL}/rest/v1/photos`;
      
      const response = await fetch(endpoint, {
        method,
        headers: supabaseHeaders,
        body: JSON.stringify({ image_url, description, link })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save photo');
      }

      const result = method === 'POST' ? await response.json() : null;
      return res.status(200).json({ success: true, message: 'Photo saved!', data: result ? result[0] : null });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
