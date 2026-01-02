/**
 * API - Get Feed Posts
 * Fetches manual posts from Supabase.
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
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/feed_posts?select=*&order=date.desc`,
      { headers: supabaseHeaders }
    );

    if (!response.ok) {
      return res.status(200).json({ success: true, data: [] });
    }

    const data = await response.json();

    return res.status(200).json({
      success: true,
      count: data.length,
      data: data
    });

  } catch (error) {
    console.error('Error fetching posts:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
