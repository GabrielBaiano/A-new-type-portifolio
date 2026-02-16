const GEMINI_API_KEY = process.argv[2];

async function listModels() {
    if (!GEMINI_API_KEY) {
        console.error('❌ Missing API KEY argument.');
        return;
    }

    console.log('🔄 Listing available Gemini models...');

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`);

        const status = response.status;
        console.log(`📡 Response Status: ${status}`);

        const textBody = await response.text();

        if (!response.ok) {
            console.error(`❌ API Error:\n${textBody}`);
            return;
        }

        const data = JSON.parse(textBody);

        if (data.models) {
            console.log('✅ Available Models:');
            data.models.forEach(model => {
                if (model.name.includes('gemini')) {
                    console.log(`- ${model.name} (${model.version}) [Methods: ${model.supportedGenerationMethods}]`);
                }
            });
        } else {
            console.log('⚠️ No models found in response.');
            console.log(textBody);
        }

    } catch (error) {
        console.error('❌ Exception:', error);
    }
}

listModels();
