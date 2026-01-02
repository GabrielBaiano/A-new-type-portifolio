/**
 * BookAdmin Component
 * Helper tool to generate JSON for manual book reviews
 */

const BookAdmin = {
    async render() {
        return `
            <div class="admin-container" style="padding: 40px; max-width: 800px; margin: 0 auto; color: white; font-family: sans-serif;">
                <h1 style="font-size: 2.5rem; margin-bottom: 20px;">📚 Book Review Admin</h1>
                <p style="color: #888; margin-bottom: 40px;">Use this form to generate the JSON for your reviews.json file.</p>
                
                <div class="form-grid" style="display: grid; gap: 20px; background: rgba(255,255,255,0.05); padding: 30px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
                    <div class="form-group">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600;">Book Title</label>
                        <input type="text" id="book-title" placeholder="e.g. Dune" style="width: 100%; padding: 12px; border-radius: 6px; border: 1px solid #444; background: #222; color: white;">
                    </div>
                    
                    <div class="form-group">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600;">Cover Image URL</label>
                        <input type="text" id="book-image" placeholder="https://..." style="width: 100%; padding: 12px; border-radius: 6px; border: 1px solid #444; background: #222; color: white;">
                    </div>

                    <div class="form-group">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600;">Markdown Review URL (GitHub Raw)</label>
                        <input type="text" id="book-md" placeholder="https://raw.githubusercontent.com/..." style="width: 100%; padding: 12px; border-radius: 6px; border: 1px solid #444; background: #222; color: white;">
                        <small style="color: #666; display: block; margin-top: 4px;">Link to the .md file in your library repo.</small>
                    </div>

                    <div class="form-group">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600;">Reading Status</label>
                        <select id="book-status" style="width: 100%; padding: 12px; border-radius: 6px; border: 1px solid #444; background: #222; color: white;">
                            <option value="Reading">📖 Reading</option>
                            <option value="Finished" selected>✅ Finished</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600;">Tags (comma separated)</label>
                        <input type="text" id="book-tags" placeholder="Sci-Fi, Classic, Favorite" style="width: 100%; padding: 12px; border-radius: 6px; border: 1px solid #444; background: #222; color: white;">
                    </div>

                    <button id="generate-json" style="padding: 15px; background: #22c55e; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; margin-top: 10px;">
                        GENERATE JSON BLOCK 🚀
                    </button>
                </div>

                <div id="result-area" style="margin-top: 40px; display: none;">
                    <h3 style="margin-bottom: 15px;">Copy this to your <code>data/reviews.json</code>:</h3>
                    <pre id="json-output" style="background: #000; padding: 20px; border-radius: 8px; overflow-x: auto; border: 1px solid #333; color: #0f0;"></pre>
                    <button id="copy-btn" style="padding: 10px 20px; background: #444; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px;">Copy to Clipboard</button>
                </div>
            </div>
        `;
    },

    onMount() {
        const genBtn = document.getElementById('generate-json');
        if (genBtn) {
            genBtn.addEventListener('click', () => {
                const title = document.getElementById('book-title').value;
                const image = document.getElementById('book-image').value;
                const mdLink = document.getElementById('book-md').value;
                const status = document.getElementById('book-status').value;
                const tags = document.getElementById('book-tags').value.split(',').map(t => t.trim());
                
                const id = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                
                const jsonObj = {
                    id: id,
                    title: title,
                    image: image,
                    status: status,
                    mdLink: mdLink,
                    tags: tags,
                    date: new Date().toISOString().split('T')[0]
                };

                const output = document.getElementById('json-output');
                output.textContent = JSON.stringify(jsonObj, null, 2);
                document.getElementById('result-area').style.display = 'block';
            });
        }

        const copyBtn = document.getElementById('copy-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const text = document.getElementById('json-output').textContent;
                navigator.clipboard.writeText(text);
                copyBtn.textContent = '✅ Copied!';
                setTimeout(() => copyBtn.textContent = 'Copy to Clipboard', 2000);
            });
        }
    }
};
