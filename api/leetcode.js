/**
 * Consolidated API - LeetCode
 * GET: Fetch all or one challenge
 * POST: Add a new challenge
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
    const { id } = req.query;
    try {
      const endpoint = id ? `${SUPABASE_URL}/rest/v1/leetcode_challenges?id=eq.${id}&select=*` : `${SUPABASE_URL}/rest/v1/leetcode_challenges?select=*&order=created_at.desc`;
      const response = await fetch(endpoint, { headers: supabaseHeaders });
      const data = await response.json();
      if (id) {
         if (!data || data.length === 0) return res.status(404).json({ error: 'Not found' });
         return res.status(200).json(data[0]);
      }
      return res.status(200).json({ success: true, count: data.length, data: data });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  if (req.method === 'POST') {
    const { number, name, content, external_link, secret, category = 'daily' } = req.body;
    
    if (!API_SECRET || !secret || secret !== API_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!number || !name || !content) return res.status(400).json({ error: 'Missing fields' });

    try {
      const latestRes = await fetch(`${SUPABASE_URL}/rest/v1/leetcode_challenges?select=created_at,streak&order=created_at.desc&limit=1`, { headers: supabaseHeaders });
      const latestData = await latestRes.json();
      let currentStreak = 1;
      if (Array.isArray(latestData) && latestData.length > 0) {
        const lastDate = new Date(latestData[0].created_at);
        const today = new Date();
        lastDate.setHours(0,0,0,0); today.setHours(0,0,0,0);
        const diffDays = Math.ceil(Math.abs(today - lastDate) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) currentStreak = latestData[0].streak + 1;
        else if (diffDays === 0) currentStreak = latestData[0].streak;
      }
      const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/leetcode_challenges`, {
        method: 'POST',
        headers: supabaseHeaders,
        body: JSON.stringify({ number, name, content, external_link, streak: currentStreak, category })
      });
      const result = await insertRes.json();
      return res.status(200).json({ success: true, message: `Streak: ${currentStreak} 🔥`, data: result[0] });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
