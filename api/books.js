/**
 * Consolidated API - Books
 * GET: Fetch all books
 * POST: Add/Update a book
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const API_SECRET = process.env.LEETCODE_ADMIN_KEY;

const supabaseHeaders = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation, resolution=merge-duplicates'
};

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/books?select=*&order=date.desc`, { headers: supabaseHeaders });
      if (!response.ok) return res.status(200).json({ success: true, data: [] });
      const data = await response.json();
      return res.status(200).json({ success: true, count: data.length, data: data });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  if (req.method === 'POST') {
    const { id: manualId, title, image, status, mdLink, tags, secret, date: manualDate } = req.body;
    if (secret !== API_SECRET) return res.status(401).json({ error: 'Unauthorized' });
    if (!title || !image || !status) return res.status(400).json({ error: 'Missing required fields' });

    try {
      const id = manualId || title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/books`, {
        method: 'POST',
        headers: supabaseHeaders,
        body: JSON.stringify({
          id, title, image, status, md_link: mdLink, tags,
          date: manualDate || new Date().toISOString()
        })
      });
      if (!insertRes.ok) {
        const error = await insertRes.json();
        throw new Error(error.message || 'Failed to insert book');
      }
      const result = await insertRes.json();
      return res.status(200).json({ success: true, message: `Book "${title}" saved!`, data: result[0] });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
