/**
 * API - Add Feed Post (Thoughts/Ideas)
 * Saves a manual post to Supabase.
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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id: manualId, title, content, tag, secret } = req.body;

  // Simple security check
  if (secret !== API_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!title || !content || !tag) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const id = manualId || title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString().slice(-4);

    // UPSERT: Insert or Update post into 'feed_posts' table
    const insertRes = await fetch(
      `${SUPABASE_URL}/rest/v1/feed_posts`,
      {
        method: 'POST',
        headers: supabaseHeaders,
        body: JSON.stringify({
          id,
          title,
          content,
          tag,
          date: new Date().toISOString()
        })
      }
    );

    if (!insertRes.ok) {
      const error = await insertRes.json();
      throw new Error(error.message || 'Failed to insert post. Ensure "feed_posts" table exists.');
    }

    const result = await insertRes.json();

    return res.status(200).json({
      success: true,
      message: `Post "${title}" added successfully!`,
      data: result[0]
    });

  } catch (error) {
    console.error('Error adding post:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
