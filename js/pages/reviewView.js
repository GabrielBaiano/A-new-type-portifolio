/**
 * ReviewView Component
 * Fetches and renders Markdown reviews inside the portfolio
 */

const ReviewView = {
    async render(params) {
        const bookId = params ? params.id : null;
        if (!bookId) return '<p>No book selected.</p>';

        return `
            <div class="review-view-container" style="padding: 40px; max-width: 900px; margin: 0 auto; color: white;">
                <button onclick="window.history.back()" style="background: none; border: 1px solid #444; color: #888; padding: 8px 16px; border-radius: 6px; cursor: pointer; margin-bottom: 30px;">
                    ← Back to Reviews
                </button>
                
                <div id="review-content" class="markdown-body">
                    <div style="text-align: center; padding: 100px;">
                        <div class="loading-spinner"></div>
                        <p>Loading review...</p>
                    </div>
                </div>
            </div>
        `;
    },

    async onMount(params) {
        const bookId = params ? params.id : null;
        if (!bookId) return;

        // 1. Fetch data to find the mdLink or content
        const data = await DataService.loadReviewsData();
        const book = data.reviews.find(r => r.id === bookId);

        const contentDiv = document.getElementById('review-content');

        if (!book) {
            contentDiv.innerHTML = `
                <div style="padding: 40px; text-align: center; border: 1px dashed #444; border-radius: 12px;">
                    <h2>Review Not Found</h2>
                </div>
            `;
            return;
        }

        // 2. Use internal content or fetch external Markdown
        try {
            let markdown = '';
            
            if (book.content) {
                markdown = book.content;
            } else if (book.mdLink) {
                // Legacy fallback: Fetch from GitHub
                let url = book.mdLink;
                if (url.includes('github.com') && !url.includes('raw.githubusercontent.com')) {
                    url = url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
                }
                const response = await fetch(url);
                markdown = await response.text();
            } else {
                contentDiv.innerHTML = `
                    <div style="padding: 40px; text-align: center; border: 1px dashed #444; border-radius: 12px;">
                        <h2>No Review Content</h2>
                        <p style="color: #888;">This book might not have a review written yet.</p>
                    </div>
                `;
                return;
            }

            // 3. Render Markdown
            contentDiv.innerHTML = this.parseMarkdown(markdown, book);
            
        } catch (error) {
            contentDiv.innerHTML = `<p style="color: #ff4444;">Error loading review: ${error.message}</p>`;
        }
    },

    /**
     * Use Marked library for professional rendering
     */
    parseMarkdown(md, book) {
        // Set options for marked
        marked.setOptions({
            breaks: true,
            gfm: true
        });

        const htmlContent = marked.parse(md);
        
        // Add header with book info
        const header = `
            <div style="display: flex; gap: 30px; align-items: flex-start; margin-bottom: 50px; background: rgba(255,255,255,0.03); padding: 30px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05);">
                <img src="${book.image}" style="width: 150px; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                <div>
                    <h1 style="margin: 0; font-size: 2rem;">${book.title}</h1>
                    <div style="margin-top: 10px;">
                        <span style="background: #a855f7; color: white; padding: 4px 10px; border-radius: 4px; font-weight: bold; font-size: 0.8rem;">FULL REVIEW</span>
                        <span style="color: #888; margin-left: 10px;">Published on ${new Date(book.date).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        `;

        return header + '<div class="md-content" style="line-height: 1.8; font-size: 1.1rem; color: #ddd;">' + htmlContent + '</div>';
    }
};
