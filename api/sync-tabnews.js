/**
 * TabNews & Gemini Synchronization API
 * Fetches content from TabNews, translates to English using Gemini 2.5 Flash,
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

    const body = {
        system_instruction: {
            parts: [{
                text: "You are an expert software developer. Your task is to translate technical articles from Portuguese to English. Maintain the exact meaning, technical terms, and all Markdown formatting. You MUST output ONLY the translated English text. No introductions, no explanations."
            }]
        },
        contents: [{
            parts: [{
                text: `Translate this ${isTitle ? 'title' : 'markdown body'} from Portuguese to English:\n\n${text}`
            }]
        }],
        generationConfig: {
            temperature: 0.1,
            topP: 0.95,
        }
    };

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
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

        // SAFETY CHECK: If output is exactly the same as input (even partially for long texts), it failed.
        // We check the first 50 chars to see if they are identical.
        const inputSnippet = text.substring(0, 50).toLowerCase();
        const outputSnippet = translated.substring(0, 50).toLowerCase();

        if (inputSnippet === outputSnippet) {
            console.error('[Gemini] ERROR: AI returned Portuguese text instead of English.');
            return 'REPEATED_PORTUGUESE'; // Sentinel value
        }

        return translated;
    } catch (error) {
        console.error('[Gemini] Exception during translation:', error);
        return null;
    }
}

export default async function handler(req, res) {
    const secret = req.method === 'POST' ? req.body.secret : req.query.secret;
    const targetSlug = req.method === 'GET' ? req.query.slug : req.body.slug;
    const forceTranslate = req.method === 'GET' ? (req.query.force === 'true') : (req.body.force === true);

    if (!API_SECRET || !secret || secret !== API_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        let postsToProcess = [];

        // 1. Fetch content
        if (targetSlug) {
            // Fetch single post details directly to verify existence
            const detailRes = await fetch(`https://www.tabnews.com.br/api/v1/contents/${TABNEWS_USERNAME}/${targetSlug}`);
            if (!detailRes.ok) {
                return res.status(404).json({ error: 'Post not found on TabNews' });
            }
            const detail = await detailRes.json();
            // Construct a "post object" similar to the list format
            postsToProcess = [{
                slug: detail.slug,
                title: detail.title,
                status: detail.status,
                created_at: detail.created_at
            }];
        } else {
            // Fetch all posts
            const tabNewsRes = await fetch(`https://www.tabnews.com.br/api/v1/contents/${TABNEWS_USERNAME}`);
            if (!tabNewsRes.ok) throw new Error('Failed to fetch from TabNews');
            postsToProcess = await tabNewsRes.json();
        }

        const results = { synced: 0, skipped: 0, errors: 0, translationsRequested: 0, translationsSuccessful: 0, safetyFailures: 0 };

        for (const post of postsToProcess) {
            if (post.status !== 'published' || !post.title) {
                results.skipped++;
                continue;
            }

            const slug = post.slug;
            const deterministicId = `tabnews-${slug}`.substring(0, 100);

            // 1. Fetch current record
            let existingRecord = null;
            try {
                const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/feed_posts?external_id=eq.${slug}&select=title_en,content_en,show_in_feed`, { headers: supabaseHeaders });
                const checkData = await checkRes.json();
                if (checkRes.ok && checkData && checkData.length > 0) {
                    existingRecord = checkData[0];
                }
            } catch (err) {
                console.warn(`[Sync] Check record error:`, err.message);
            }

            // 2. Decide if we need to translate
            const isMissingTranslation = !existingRecord || !existingRecord.title_en || !existingRecord.content_en;
            const shouldTranslate = isMissingTranslation || forceTranslate || !!targetSlug;

            let translatedTitle = existingRecord?.title_en || null;
            let translatedContent = existingRecord?.content_en || null;

            // Fetch full content
            const detailRes = await fetch(`https://www.tabnews.com.br/api/v1/contents/${TABNEWS_USERNAME}/${slug}`);
            if (!detailRes.ok) {
                results.errors++;
                continue;
            }
            const detail = await detailRes.json();

            let translationSuccessful = false;

            if (shouldTranslate) {
                console.log(`[Sync] 🤖 Translating: ${post.title} (Force: ${forceTranslate || !!targetSlug})`);
                results.translationsRequested++;

                const tTitle = await translateWithGemini(post.title, true);
                const tContent = await translateWithGemini(detail.body, false);

                if (tTitle === 'REPEATED_PORTUGUESE' || tContent === 'REPEATED_PORTUGUESE') {
                    results.safetyFailures++;
                } else if (tTitle && tContent) {
                    translatedTitle = tTitle;
                    translatedContent = tContent;
                    translationSuccessful = true;
                    results.translationsSuccessful++;
                }
            }

            const payload = {
                id: deterministicId,
                title: post.title,
                content: detail.body,
                tag: 'TabNews',
                date: new Date(post.created_at).toISOString(),
                show_in_feed: existingRecord ? existingRecord.show_in_feed : true,
                source_url: `https://www.tabnews.com.br/${TABNEWS_USERNAME}/${slug}`,
                external_id: slug,
                image: null
            };

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
            } else {
                const saveError = await saveRes.text();
                console.error(`[Sync] Supabase save error for ${slug}:`, saveError);
                results.errors++;
            }
        }

        return res.status(200).json({
            success: true,
            message: `Processed ${postsToProcess.length} posts. Synced: ${results.synced}. New translations: ${results.translationsSuccessful}. Safety Rejections: ${results.safetyFailures}.`,
            results
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
