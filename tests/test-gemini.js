require('dotenv').config({ path: '../.env.local' }); // Adjust path if needed

const GEMINI_API_KEY = process.argv[2] || process.env.GEMINI_API_KEY;

async function testGemini() {
    if (!GEMINI_API_KEY) {
        console.error('❌ Missing GEMINI_API_KEY in environment variables.');
        return;
    }

    console.log('🔄 Testing Gemini API...');
    console.log(`🔑 Key fragment: ${GEMINI_API_KEY.substring(0, 5)}...`);

    const text = "O React é uma biblioteca JavaScript para criar interfaces de usuário.";

    // Exact logic from sync-tabnews.js
    const body = {
        system_instruction: {
            parts: [{
                text: "You are an expert software developer. Your task is to translate technical articles from Portuguese to English. Maintain the exact meaning, technical terms, and all Markdown formatting. You MUST output ONLY the translated English text. No introductions, no explanations."
            }]
        },
        contents: [{
            parts: [{
                text: `Translate this markdown body from Portuguese to English:\n\n${text}`
            }]
        }],
        generationConfig: {
            temperature: 0.1,
            topP: 0.95,
        }
    };

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const status = response.status;
        console.log(`📡 Response Status: ${status}`);

        const textBody = await response.text();
        console.log(`📦 Raw Response Body:\n${textBody}`);

        if (!response.ok) {
            console.error('❌ API Error');
            return;
        }

        const data = JSON.parse(textBody);
        const translated = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (!translated) {
            console.error('❌ API returned valid JSON but no translation content.');
        } else {
            console.log(`✅ Translated Output:\n"${translated}"`);

            // Safety check logic
            const inputSnippet = text.substring(0, 50).toLowerCase();
            const outputSnippet = translated.substring(0, 50).toLowerCase();

            console.log(`🔍 Safety Check:\n   Input: "${inputSnippet}"\n   Output: "${outputSnippet}"`);

            if (inputSnippet === outputSnippet) {
                console.error('⚠️ SAFETY CHECK FAILED: Output is effectively identical to input.');
            } else {
                console.log('✅ Safety check passed.');
            }
        }

    } catch (error) {
        console.error('❌ Exception:', error);
    }
}

testGemini();
