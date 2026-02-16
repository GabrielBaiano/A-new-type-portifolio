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
    if (!GEMINI_API_KEY) {
        console.error('[Gemini] Missing API KEY');
        return null;
    }

    const prompt = isTitle
        ? `Translate the following technical article title from Portuguese to English. Ensure it sounds natural and professional for a tech portfolio. Return only the translated text. Original: "${text}"`
        : `Translate the following technical article content from Portuguese to English. 
           Maintain the Markdown formatting exactly as it is. 
           Preserve code blocks, links, and bold text. 
           Ensure technical terms are correctly handled. 
           Return only the translated markdown. 
           Content to translate:\n\n${text}`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`[Gemini] API Error ${response.status}:`, errorBody);
            return null;
        }

        const data = await response.json();
        const translated = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (!translated) {
            console.error('[Gemini] Empty response from API');
            return null;
        }

        return translated;
    } catch (error) {
        console.error('[Gemini] Translation Exception:', error);
        return null;
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
            if (post.status !== 'published' || !post.title) {
                results.skipped++;
                continue;
            }

            const detailRes = await fetch(`https://www.tabnews.com.br/api/v1/contents/${TABNEWS_USERNAME}/${post.slug}`);
            if (!detailRes.ok) {
                results.errors++;
                continue;
            }
            const detail = await detailRes.json();

            // Translate
            const deterministicId = `tabnews-${post.slug}`.substring(0, 100);
            const translatedTitle = await translateWithGemini(post.title, true);
            const translatedContent = await translateWithGemini(detail.body, false);

            const payload = {
                id: deterministicId,
                title: post.title,
                content: detail.body,
                tag: 'TabNews',
                date: new Date(post.created_at).toISOString(),
                show_in_feed: true,
                source_url: `https://www.tabnews.com.br/${TABNEWS_USERNAME}/${post.slug}`,
                external_id: post.slug,
                image: null
            };

            // Only update translation if successful
            if (translatedTitle) payload.title_en = translatedTitle;
            if (translatedContent) payload.content_en = translatedContent;

            const saveRes = await fetch(`${SUPABASE_URL}/rest/v1/feed_posts?on_conflict=external_id`, {
                method: 'POST',
                headers: {
                    ...supabaseHeaders,
                    'Prefer': 'resolution=merge-duplicates,return=minimal'
                },
                body: JSON.stringify(payload)
            });

            if (saveRes.ok) {
                results.synced++;
                if (translatedTitle && translatedContent) {
                    results.translated = (results.translated || 0) + 1;
                }
            } else {
                results.errors++;
            }
        }

        return res.status(200).json({
            success: true,
            message: `Synced ${results.synced} posts, ${results.translated || 0} with new translations.`,
            results
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
