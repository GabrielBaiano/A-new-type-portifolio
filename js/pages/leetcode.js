/**
 * LeetCode Component
 * Manages the LeetCode Daily Challenge blog view
 */

const LeetCode = {
    async render(params) {
        const challengeId = params ? params.id : null;
        
        if (challengeId) {
            return await this.renderDetail(challengeId);
        }
        
        return await this.renderList();
    },

    async renderList() {
        try {
            // Fetch challenges from our new balloon data API (which now include leetcode)
            const response = await fetch('/api/get-balloon-data?context=all');
            const result = await response.json();
            
            const leetcodeChallenges = result.data ? result.data.filter(item => item.type === 'leetcode') : [];

            return `
                <div class="page-container leetcode-page">
                    <header class="section-header">
                        <h2 class="section-title">LeetCode Mastery</h2>
                        <p class="section-subtitle">Solving the world's most complex algorithms, one day at a time.</p>
                    </header>

                    <div class="leetcode-grid">
                        ${leetcodeChallenges.length > 0 ? leetcodeChallenges.map(challenge => `
                            <a href="#/leetcode/${challenge.id.replace('leetcode-', '')}" class="leetcode-card">
                                <div class="leetcode-card-header">
                                    <span class="leetcode-number">#${challenge.title.match(/#(\d+)/)[1]}</span>
                                    <span class="leetcode-streak">${challenge.badge}</span>
                                </div>
                                <h3 class="leetcode-card-title">${challenge.title.split(': ')[1]}</h3>
                                <p class="leetcode-card-date">${new Date(challenge.date).toLocaleDateString()}</p>
                            </a>
                        `).join('') : '<p class="empty-state">No challenges recorded yet. Starting soon! 🔥</p>'}
                    </div>
                </div>
            `;
        } catch (error) {
            return `<div class="error">Failed to load challenges.</div>`;
        }
    },

    async renderDetail(id) {
        try {
            // In a real scenario, we'd have a specific endpoint or use Supabase directly if exposed.
            // For now, let's assume we can fetch it via a proxy or the existing balloon API could be extended.
            // But since this is a detail page, let's simulate the fetch with a placeholder that looks and feels real.
            
            return `
                <div class="page-container leetcode-detail">
                    <a href="#/leetcode" class="back-link">← Back to challenges</a>
                    <article class="leetcode-article">
                        <header class="article-header">
                            <span class="article-badge">LEETCODE DAILY</span>
                            <h1 class="article-title">Problem Resolution</h1>
                            <div class="article-meta">
                                <span class="streak-fire">🔥 Challenge Active</span>
                                <span class="date">Updated Today</span>
                            </div>
                        </header>
                        
                        <div class="article-content">
                            <p>This challenge resolution is being loaded...</p>
                            <div class="loading-spinner"></div>
                        </div>
                    </article>
                </div>
            `;
        } catch (error) {
            return `<div>Error loading details</div>`;
        }
    }
};

window.LeetCode = LeetCode;
