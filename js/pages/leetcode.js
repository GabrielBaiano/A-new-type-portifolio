/**
 * LeetCode Component
 * Manages the LeetCode Daily Challenge blog view
 */

const LeetCode = {
    async render(params) {
        const challengeId = params ? params.id : null;
        
        // Ensure detail mode class is handled by lifecycle, but clear state just in case
        if (challengeId) {
            return await this.renderDetail(challengeId);
        }
        
        return await this.renderList();
    },

    async renderList() {
        let leetcodeChallenges = [];
        try {
            const response = await fetch('/api/get-balloon-data?context=all');
            const result = await response.json();
            
            leetcodeChallenges = result.data 
                ? result.data
                    .filter(item => item.type === 'leetcode')
                    .sort((a, b) => new Date(b.date) - new Date(a.date)) 
                : [];
        } catch (error) {
            console.log('[LeetCode] Offline/Error - Using mockups');
        }

        // Mockup data if nothing was fetched (offline or no data)
        if (leetcodeChallenges.length === 0) {
            leetcodeChallenges = [
                {
                    id: 'leetcode-mock-1',
                    type: 'leetcode',
                    title: '#1970: Last Day Where You Can Still Cross',
                    name: 'Last Day Where You Can Still Cross',
                    date: '2026-01-01T10:00:00Z',
                    badge: '10 🔥',
                    streak: 10
                },
                {
                    id: 'leetcode-mock-2',
                    type: 'leetcode',
                    title: '#224: Basic Calculator',
                    name: 'Basic Calculator',
                    date: '2026-02-15T10:00:00Z',
                    badge: '11 🔥',
                    streak: 11
                },
                {
                    id: 'leetcode-mock-3',
                    type: 'leetcode',
                    title: '#1: Two Sum',
                    name: 'Two Sum',
                    date: '2026-03-10T10:00:00Z',
                    badge: '12 🔥',
                    streak: 12
                }
            ];
        }

        // Heatmap logic for Full Year 2026 grouped by month
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const heatmapMonths = months.map((name, index) => {
            const monthStart = new Date(2026, index, 1);
            const monthEnd = new Date(2026, index + 1, 0);
            
            // Find first Sunday on or before month start to align grid
            const firstDay = new Date(monthStart);
            firstDay.setDate(monthStart.getDate() - monthStart.getDay());
            
            const weeks = [];
            const activeDates = new Set(leetcodeChallenges.map(c => new Date(c.date).toDateString()));
            
            let currentDay = new Date(firstDay);
            // We want to show weeks that contain at least one day of this month
            while (currentDay <= monthEnd || (currentDay.getDay() !== 0 && weeks.length > 0)) {
                if (currentDay > monthEnd && currentDay.getDay() === 0) break;
                
                const week = [];
                for (let j = 0; j < 7; j++) {
                    week.push({
                        date: currentDay.toDateString(),
                        active: activeDates.has(currentDay.toDateString()),
                        isCurrentMonth: currentDay.getMonth() === index && currentDay.getFullYear() === 2026
                    });
                    currentDay.setDate(currentDay.getDate() + 1);
                }
                weeks.push(week);
            }
            return { name, weeks };
        });

        return `
            <div class="card detail-card leetcode-card-theme">
                <a href="#/feed" class="back-button">
                    <i class="fa-solid fa-arrow-left"></i>
                    <span>Back</span>
                </a>

                <div class="detail-header">
                    <h1 class="detail-title">LeetCode Resolutions</h1>
                    <p class="detail-subtitle">Chronological updates on my latest algorithm resolutions and logic challenges.</p>
                    <div class="detail-date leetcode-badge-pink">${leetcodeChallenges.length} Resolutions</div>
                </div>

                <div class="leetcode-heatmap-container">
                    <div class="leetcode-heatmap-header">
                        <span class="leetcode-heatmap-title">Activity Monitor (2026)</span>
                        <span class="streak-fire">🔥 ${leetcodeChallenges[0]?.badge || '0 🔥'}</span>
                    </div>
                    <div class="leetcode-months-scroll-container">
                        <div class="leetcode-months-grid">
                            ${heatmapMonths.map(month => `
                                <div class="heatmap-month-block">
                                    <span class="month-label">${month.name}</span>
                                    <div class="leetcode-heatmap">
                                        ${month.weeks.map(week => `
                                            <div class="heatmap-week">
                                                ${week.map(day => `
                                                    <div class="heatmap-day ${day.active ? 'active' : ''} ${!day.isCurrentMonth ? 'not-this-month' : ''}" 
                                                         title="${day.date}"></div>
                                                `).join('')}
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div class="pub-grid leetcode-pub-grid">
                    ${leetcodeChallenges.map(challenge => {
                        const number = challenge.title.match(/#(\d+)/)?.[1] || challenge.number || '---';
                        const name = challenge.title.split(': ')[1] || challenge.name;
                        return `
                            <a href="#/leetcode/${challenge.id.replace('leetcode-', '')}" class="pub-card leetcode-item-card">
                                <h3>#${number}: ${name}</h3>
                                <p>${new Date(challenge.date).toLocaleDateString()} — Algorithm resolution with ${challenge.badge} day streak status.</p>
                                <span class="read-more-btn">Read resolution</span>
                            </a>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
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
                <div class="card detail-card leetcode-card-theme">
                    <a href="#/leetcode" class="back-button">
                        <i class="fa-solid fa-arrow-left"></i>
                        <span>Back</span>
                    </a>

                    <div class="detail-header">
                        <div class="article-badge">LEETCODE DAILY</div>
                        <h1 class="detail-title">#${challenge.number}: ${challenge.name}</h1>
                        <div class="detail-date article-meta">
                            <span class="streak-fire">🔥 ${challenge.streak} Day Streak</span>
                            <span>${new Date(challenge.created_at).toLocaleDateString()}</span>
                            ${challenge.external_link ? `<a href="${challenge.external_link}" target="_blank" class="external-link" style="margin-left: 10px; color: #ff2d55;">View on LeetCode ↗</a>` : ''}
                        </div>
                    </div>
                    
                    <div class="article-content">
                        ${formattedContent}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('[LeetCode] Detail Error:', error);
            return `
                <div class="card detail-card leetcode-card-theme">
                    <a href="#/leetcode" class="back-button">
                        <i class="fa-solid fa-arrow-left"></i>
                        <span>Back</span>
                    </a>
                    <div class="error-state">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                        <h2>Challenge not found</h2>
                        <p>We couldn't load the details for this challenge. It might have been moved or deleted.</p>
                        <button class="retry-button" onclick="location.reload()">Retry</button>
                    </div>
                </div>
            `;
        }
    },

    onMount(params) {
        console.log('[LeetCode] Page mounted');
        if (params && params.id) {
            document.body.classList.add('detail-mode');
        }
        document.body.classList.add('wide-layout');
    },

    onUnmount() {
        console.log('[LeetCode] Page unmounted');
        document.body.classList.remove('detail-mode');
        document.body.classList.remove('wide-layout');
    }
};

window.LeetCode = LeetCode;
