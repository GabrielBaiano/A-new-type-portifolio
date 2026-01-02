/**
 * Consolidated API - Image Upload
 * Handles uploading files to Supabase Storage
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const API_SECRET = process.env.LEETCODE_ADMIN_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fileName, fileData, contentType, secret } = req.body;

  if (secret !== API_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!fileName || !fileData) {
    return res.status(400).json({ error: 'Missing file data' });
  }

  try {
    // 1. Prepare data (fileData is expected to be base64)
    const buffer = Buffer.from(fileData, 'base64');
    
    // 2. Upload to Supabase Storage
    // Path: /storage/v1/object/{bucket}/{path}
    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/images/${fileName}`;
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': contentType || 'image/jpeg',
        'x-upsert': 'true'
      },
      body: buffer
    });

    if (!response.ok) {
        const errData = await response.json();
        
        // Auto-create bucket if missing
        if (errData.message === 'Bucket not found' || errData.error === 'Bucket not found') {
            console.log('[Upload API] Bucket "images" missing. Attempting to create...');
            const createBucketRes = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: 'images', name: 'images', public: true })
            });
            
            if (createBucketRes.ok) {
                // Retry the upload
                const retryResponse = await fetch(uploadUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${SUPABASE_KEY}`,
                        'Content-Type': contentType || 'image/jpeg',
                        'x-upsert': 'true'
                    },
                    body: buffer
                });
                if (retryResponse.ok) {
                    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/images/${fileName}`;
                    return res.status(200).json({ success: true, url: publicUrl, message: 'Bucket created and upload successful' });
                }
            }
        }
        
        throw new Error(errData.message || 'Supabase storage error');
    }

    // 3. Construct Public URL
    // Public URL format: {SUPABASE_URL}/storage/v1/object/public/{bucket}/{path}
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/images/${fileName}`;

    return res.status(200).json({ 
      success: true, 
      url: publicUrl,
      message: 'Upload successful' 
    });

  } catch (error) {
    console.error('[Upload API] Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
