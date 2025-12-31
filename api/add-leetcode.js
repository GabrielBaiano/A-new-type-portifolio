/**
 * API - Add LeetCode Challenge
 * Adds a new challenge resolution and automatically calculates the streak.
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

  const { number, name, content, external_link, secret, category = 'daily' } = req.body;

  // Simple security check
  if (secret !== API_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!number || !name || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 1. Get the latest challenge to calculate streak
    const latestRes = await fetch(
      `${SUPABASE_URL}/rest/v1/leetcode_challenges?select=created_at,streak&order=created_at.desc&limit=1`,
      { headers: supabaseHeaders }
    );
    const latestData = await latestRes.json();
    
    let currentStreak = 1;
    
    if (Array.isArray(latestData) && latestData.length > 0) {
      const lastChallenge = latestData[0];
      const lastDate = new Date(lastChallenge.created_at);
      const today = new Date();
      
      // Reset hours to compare dates only
      lastDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      const diffTime = Math.abs(today - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Yesterday! Increment streak
        currentStreak = lastChallenge.streak + 1;
      } else if (diffDays === 0) {
        // Already posted today? Just keep same streak (or increment if user wants multiple per day to count)
        currentStreak = lastChallenge.streak;
      } else {
        // Skipped a day or more. Reset to 1.
        currentStreak = 1;
      }
    }

    // 2. Insert new challenge
    const insertRes = await fetch(
      `${SUPABASE_URL}/rest/v1/leetcode_challenges`,
      {
        method: 'POST',
        headers: supabaseHeaders,
        body: JSON.stringify({
          number,
          name,
          content,
          external_link,
          streak: currentStreak,
          category
        })
      }
    );

    if (!insertRes.ok) {
      const error = await insertRes.json();
      throw new Error(error.message || 'Failed to insert challenge');
    }

    const result = await insertRes.json();

    return res.status(200).json({
      success: true,
      message: `Challenge #${number} added! Current streak: ${currentStreak} 🔥`,
      data: result[0]
    });

  } catch (error) {
    console.error('Error adding leetcode challenge:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
