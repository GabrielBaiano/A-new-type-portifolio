/**
 * API - Get Photos
 * Fetches manual photo entries from Supabase.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseHeaders = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json'
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/photos?select=*&order=created_at.desc`,
      { headers: supabaseHeaders }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch photos');
    }

    const data = await response.json();

    return res.status(200).json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Error fetching photos:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
