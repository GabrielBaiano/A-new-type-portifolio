/**
 * API - Add/Update Photo
 * Saves a manual photo entry to Supabase.
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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id: manualId, image_url, description, link, secret } = req.body;

  // Simple security check
  if (secret !== API_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!image_url) {
    return res.status(400).json({ error: 'Missing required fields: image_url' });
  }

  try {
    // Generate simple ID if not provided (using timestamp for uniqueness if new)
    const id = manualId || `photo-${Date.now()}`;

    // UPSERT: Insert or Update photo into 'photos' table
    const insertRes = await fetch(
      `${SUPABASE_URL}/rest/v1/photos`,
      {
        method: 'POST',
        headers: supabaseHeaders,
        body: JSON.stringify({
          id,
          image_url,
          description: description || '',
          link: link || '',
          created_at: new Date().toISOString()
        })
      }
    );

    if (!insertRes.ok) {
      const error = await insertRes.json();
      throw new Error(error.message || 'Failed to save photo.');
    }

    const result = await insertRes.json();

    return res.status(200).json({
      success: true,
      message: `Photo saved successfully!`,
      data: result[0]
    });

  } catch (error) {
    console.error('Error saving photo:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
