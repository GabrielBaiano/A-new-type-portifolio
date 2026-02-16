/**
 * TabNews & Gemini Synchronization API
 * Fetches content from TabNews, translates to English using Gemini 1.5 Flash,
 * and saves to Supabase feed_posts.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const API_SECRET = process.env.LEETCODE_ADMIN_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const TABNEWS_USERNAME = process.env.TABNEWS_USERNAME;

const supabaseHeaders = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
};

async function translateWithGemini(text, isTitle = false) {
    if (!GEMINI_API_KEY) return text; // Fallback

    const prompt = isTitle
        ? `Translate the following technical article title from Portuguese to English. Return only the translated text: "${text}"`
        : `Translate the following technical article content from Portuguese to English. Keep the Markdown formatting exactly as it is, only translate the text content. Return only the translated markdown:\n\n${text}`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        return data.candidates[0].content.parts[0].text.trim();
    } catch (error) {
        console.error('Gemini Translation Error:', error);
        return text;
    }
}

export default async function handler(req, res) {
    const secret = req.method === 'POST' ? req.body.secret : req.query.secret;

    if (!API_SECRET || !secret || secret !== API_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // 1. Fetch contents from TabNews
        const tabNewsRes = await fetch(`https://www.tabnews.com.br/api/v1/contents/${TABNEWS_USERNAME}`);
        if (!tabNewsRes.ok) throw new Error('Failed to fetch from TabNews');
        const posts = await tabNewsRes.json();

        const results = { synced: 0, skipped: 0, errors: 0 };

        for (const post of posts) {
            if (post.status !== 'published') continue;

            // 2. Check if already exists in Supabase
            const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/feed_posts?external_id=eq.${post.slug}&select=id`, { headers: supabaseHeaders });
            const existing = await checkRes.json();

            if (existing.length > 0) {
                results.skipped++;
                continue;
            }

            // 3. Fetch full content
            const detailRes = await fetch(`https://www.tabnews.com.br/api/v1/contents/${TABNEWS_USERNAME}/${post.slug}`);
            const detail = await detailRes.json();

            // 4. Translate using Gemini
            console.log(`Translating: ${post.title}`);
            const translatedTitle = await translateWithGemini(post.title, true);
            const translatedContent = await translateWithGemini(detail.body, false);

            // 5. Generate ID (slug-based like in feed.js)
            const id = post.slug.substring(0, 100) + '-' + Date.now().toString().slice(-4);

            // 6. Save to Supabase
            const payload = {
                id,
                title: post.title,
                title_en: translatedTitle,
                content: detail.body,
                content_en: translatedContent,
                tag: 'Artigo',
                date: new Date(post.created_at).toISOString(),
                show_in_feed: true,
                source_url: `https://www.tabnews.com.br/${TABNEWS_USERNAME}/${post.slug}`,
                external_id: post.slug,
                image: 'assets/images/tabnews-logo.png'
            };

            const saveRes = await fetch(`${SUPABASE_URL}/rest/v1/feed_posts`, {
                method: 'POST',
                headers: { ...supabaseHeaders, 'Prefer': 'return=representation' },
                body: JSON.stringify(payload)
            });

            if (saveRes.ok) {
                results.synced++;
            } else {
                const errorData = await saveRes.json();
                console.error('Supabase Save error:', errorData);
                results.errors++;
                results.lastError = errorData.message || JSON.stringify(errorData);
            }
        }

        return res.status(200).json({ success: true, results });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
