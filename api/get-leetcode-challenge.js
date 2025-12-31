/**
 * API - Get LeetCode Challenge Detail
 * Fetches a single challenge by ID from Supabase
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
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'ID is required' });

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/leetcode_challenges?id=eq.${id}&select=*`,
      { headers: supabaseHeaders }
    );

    const data = await response.json();

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    return res.status(200).json(data[0]);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
