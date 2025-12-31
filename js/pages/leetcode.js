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
            
            const leetcodeChallenges = result.data 
                ? result.data
                    .filter(item => item.type === 'leetcode')
                    .sort((a, b) => new Date(b.date) - new Date(a.date)) 
                : [];

            // Heatmap logic: Last 12 weeks
            const today = new Date();
            const heatmapData = [];
            const activeDates = new Set(leetcodeChallenges.map(c => new Date(c.date).toDateString()));

            for (let i = 11; i >= 0; i--) {
                const week = [];
                for (let j = 0; j < 7; j++) {
                    const day = new Date(today);
                    day.setDate(today.getDate() - (i * 7 + (6 - j)));
                    week.push({
                        date: day.toDateString(),
                        active: activeDates.has(day.toDateString())
                    });
                }
                heatmapData.push(week);
            }

            return `
                <div class="page-container leetcode-page">
                    <header class="section-header leetcode-header">
                        <h2 class="section-title pink-gradient-text">LeetCode Mastery</h2>
                        <p class="section-subtitle">Solving the world's most complex algorithms, one day at a time.</p>
                    </header>

                    <div class="leetcode-heatmap-container">
                        <div class="leetcode-heatmap-header">
                            <span class="leetcode-heatmap-title">Activity Monitor</span>
                            <span class="streak-fire">🔥 ${leetcodeChallenges[0]?.badge || '0 🔥'} Current Streak</span>
                        </div>
                        <div class="leetcode-heatmap">
                            ${heatmapData.map(week => `
                                <div class="heatmap-week">
                                    ${week.map(day => `
                                        <div class="heatmap-day ${day.active ? 'active' : ''}" title="${day.date}"></div>
                                    `).join('')}
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="leetcode-grid">
                        ${leetcodeChallenges.length > 0 ? leetcodeChallenges.map(challenge => `
                            <a href="#/leetcode/${challenge.id.replace('leetcode-', '')}" class="leetcode-card">
                                <div class="leetcode-card-header">
                                    <span class="leetcode-number">#${challenge.title.match(/#(\d+)/)?.[1] || '---'}</span>
                                    <span class="leetcode-streak">${challenge.badge}</span>
                                </div>
                                <h3 class="leetcode-card-title">${challenge.title.split(': ')[1] || challenge.name}</h3>
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
            const response = await fetch(`/api/get-leetcode-challenge?id=${id}`);
            if (!response.ok) throw new Error('Challenge not found');
            const challenge = await response.json();
            
            const formattedContent = (typeof marked !== 'undefined') 
                ? marked.parse(challenge.content) 
                : challenge.content;

            return `
                <div class="page-container leetcode-detail">
                    <a href="#/leetcode" class="back-link">← Back to challenges</a>
                    <article class="leetcode-article">
                        <header class="article-header">
                            <span class="article-badge">LEETCODE DAILY</span>
                            <h1 class="article-title">#${challenge.number}: ${challenge.name}</h1>
                            <div class="article-meta">
                                <span class="streak-fire">🔥 ${challenge.streak} Day Streak</span>
                                <span class="date">${new Date(challenge.created_at).toLocaleDateString()}</span>
                                ${challenge.external_link ? `<a href="${challenge.external_link}" target="_blank" class="external-link">View on LeetCode ↗</a>` : ''}
                            </div>
                        </header>
                        
                        <div class="article-content">
                            ${formattedContent}
                        </div>
                    </article>
                </div>
            `;
        } catch (error) {
            return `
                <div class="page-container leetcode-error">
                    <a href="#/leetcode" class="back-link">← Back to challenges</a>
                    <div class="error-state">
                        <h2>Challenge not found</h2>
                        <p>We couldn't load the details for this challenge. It might have been moved or deleted.</p>
                    </div>
                </div>
            `;
        }
    }
};

window.LeetCode = LeetCode;
