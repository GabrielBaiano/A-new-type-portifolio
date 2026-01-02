/**
 * API - Add Book Review
 * Saves a manual book entry to Supabase.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const API_SECRET = process.env.LEETCODE_ADMIN_KEY; // Reusing the same key for simplicity or use process.env.BOOK_ADMIN_KEY

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

  const { title, image, status, mdLink, tags, secret } = req.body;

  // Simple security check
  if (secret !== API_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!title || !image || !status) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const id = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Insert new book into 'books' table (Assuming the user has or will create this table in Supabase)
    const insertRes = await fetch(
      `${SUPABASE_URL}/rest/v1/books`,
      {
        method: 'POST',
        headers: supabaseHeaders,
        body: JSON.stringify({
          id,
          title,
          image,
          status,
          md_link: mdLink,
          tags,
          date: new Date().toISOString()
        })
      }
    );

    if (!insertRes.ok) {
      const error = await insertRes.json();
      throw new Error(error.message || 'Failed to insert book. Make sure the "books" table exists in Supabase.');
    }

    const result = await insertRes.json();

    return res.status(200).json({
      success: true,
      message: `Book "${title}" added successfully!`,
      data: result[0]
    });

  } catch (error) {
    console.error('Error adding book:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
