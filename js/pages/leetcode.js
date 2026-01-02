/**
 * LeetCode Component
 * Manages the LeetCode Daily Challenge blog view
 */

const LeetCode = {
    allChallenges: [],
    currentFilter: 'all',
    currentSort: 'date-desc',
    searchQuery: '',

    async render(params) {
        const challengeId = params ? params.id : null;
        
        // Ensure detail mode class is handled by lifecycle, but clear state just in case
        if (challengeId) {
            return await this.renderDetail(challengeId);
        }
        
        return await this.renderList();
    },

    async renderList() {
        // Initial fetch to have data ready
        try {
            const response = await fetch('/api/balloons?context=all');
            const result = await response.json();
            
            this.allChallenges = result.data 
                ? result.data
                    .filter(item => item.type === 'leetcode')
                : [];
        } catch (error) {
            console.log('[LeetCode] Offline/Error - Using mockups');
            this.allChallenges = [];
        }

        if (this.allChallenges.length === 0) {
            this.allChallenges = [
                {
                    id: 'leetcode-mock-1',
                    type: 'leetcode',
                    title: '#1970: Last Day Where You Can Still Cross',
                    name: 'Last Day Where You Can Still Cross',
                    date: '2026-01-01T10:00:00Z',
                    badge: '10 🔥',
                    streak: 10,
                    category: 'daily'
                },
                {
                    id: 'leetcode-mock-2',
                    type: 'leetcode',
                    title: '#224: Basic Calculator',
                    name: 'Basic Calculator',
                    date: '2026-02-15T10:00:00Z',
                    badge: '11 🔥',
                    streak: 11,
                    category: 'daily'
                },
                {
                    id: 'leetcode-mock-3',
                    type: 'leetcode',
                    title: '#1: Two Sum',
                    name: 'Two Sum',
                    date: '2026-03-10T10:00:00Z',
                    badge: '12 🔥',
                    streak: 12,
                    category: 'training'
                }
            ];
        }

        const challenges = [...this.allChallenges].sort((a, b) => new Date(b.date) - new Date(a.date));

        // Heatmap logic for Full Year 2026 grouped by month
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const heatmapMonths = months.map((name, index) => {
            const monthStart = new Date(2026, index, 1);
            const monthEnd = new Date(2026, index + 1, 0);
            
            // Find first Sunday on or before month start to align grid
            const firstDay = new Date(monthStart);
            firstDay.setDate(monthStart.getDate() - monthStart.getDay());
            
            const weeks = [];
            const activeDates = new Set(challenges.map(c => new Date(c.date).toDateString()));
            
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
                    <div class="detail-date leetcode-badge-pink">${challenges.length} Resolutions</div>
                </div>

                <div class="leetcode-heatmap-container">
                    <div class="leetcode-heatmap-header">
                        <span class="leetcode-heatmap-title">Activity Monitor (2026)</span>
                        <span class="streak-fire">🔥 ${challenges[0]?.badge || '0 🔥'}</span>
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

                <div class="leetcode-filters">
                    <div class="filter-group">
                        <button class="filter-btn active" data-filter="all">All</button>
                        <button class="filter-btn" data-filter="daily">Daily</button>
                        <button class="filter-btn" data-filter="training">Training</button>
                    </div>
                    
                    <div class="search-box">
                        <i class="fa-solid fa-magnifying-glass"></i>
                        <input type="text" id="leetcode-search" placeholder="Filter by name or number...">
                    </div>

                    <div class="sort-group">
                        <select id="leetcode-sort">
                            <option value="date-desc">Newest First</option>
                            <option value="date-asc">Oldest First</option>
                            <option value="num-desc">Higher Number</option>
                            <option value="num-asc">Lower Number</option>
                        </select>
                    </div>
                </div>

                <div class="pub-grid leetcode-pub-grid" id="leetcode-grid">
                    ${this.generateGridHTML(challenges)}
                </div>
            </div>
        `;
    },

    generateGridHTML(challenges) {
        if (challenges.length === 0) {
            return `<div class="empty-state">No resolutions found for the current filters.</div>`;
        }

        return challenges.map(challenge => {
            const number = challenge.title?.match(/#(\d+)/)?.[1] || challenge.number || '---';
            const name = challenge.title?.split(': ')[1] || challenge.name;
            const category = challenge.category || 'daily';
            const isDaily = category === 'daily';
            
            return `
                <a href="#/leetcode/${challenge.id.replace('leetcode-', '')}" class="pub-card leetcode-item-card ${category}-category">
                    <div class="card-category-tag ${category}">${category.toUpperCase()}</div>
                    <h3>#${number}: ${name}</h3>
                    <p>${new Date(challenge.date).toLocaleDateString()} — ${isDaily ? `Algorithm resolution with ${challenge.badge} day streak.` : 'Practice resolution for technical interviews.'}</p>
                    <span class="read-more-btn">Read resolution</span>
                </a>
            `;
        }).join('');
    },

    applyFilters() {
        let filtered = [...this.allChallenges];

        // 1. Text Search
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(c => 
                c.name.toLowerCase().includes(query) || 
                String(c.number).includes(query) ||
                (c.title && c.title.toLowerCase().includes(query))
            );
        }

        // 2. Category Filter
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(c => (c.category || 'daily') === this.currentFilter);
        }

        // 3. Sorting
        filtered.sort((a, b) => {
            const numA = parseInt(a.title?.match(/#(\d+)/)?.[1] || a.number || 0);
            const numB = parseInt(b.title?.match(/#(\d+)/)?.[1] || b.number || 0);
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();

            switch (this.currentSort) {
                case 'date-asc': return dateA - dateB;
                case 'date-desc': return dateB - dateA;
                case 'num-asc': return numA - numB;
                case 'num-desc': return numB - numA;
                default: return dateB - dateA;
            }
        });

        const grid = document.getElementById('leetcode-grid');
        if (grid) {
            grid.innerHTML = this.generateGridHTML(filtered);
        }
    },

    async renderDetail(id) {
        try {
            const response = await fetch(`/api/leetcode?id=${id}`);
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
                        <div class="article-badge ${challenge.category || 'daily'}">${(challenge.category || 'daily').toUpperCase()} RESOLUTION</div>
                        <h1 class="detail-title">#${challenge.number}: ${challenge.name}</h1>
                        <div class="detail-date article-meta">
                            ${(challenge.category || 'daily') === 'daily' ? `<span class="streak-fire">🔥 ${challenge.streak} Day Streak</span>` : '<span class="practice-tag">🛠️ Practice / Training</span>'}
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
        } else {
            // Setup list view listeners
            this.setupListListeners();
        }
        document.body.classList.add('wide-layout');
    },

    setupListListeners() {
        const searchInput = document.getElementById('leetcode-search');
        const sortSelect = document.getElementById('leetcode-sort');
        const filterBtns = document.querySelectorAll('.filter-btn');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.applyFilters();
            });
        }

        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.applyFilters();
            });
        }

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.dataset.filter;
                this.applyFilters();
            });
        });
    },

    onUnmount() {
        console.log('[LeetCode] Page unmounted');
        document.body.classList.remove('detail-mode');
        document.body.classList.remove('wide-layout');
        // Reset state for next mount
        this.searchQuery = '';
        this.currentFilter = 'all';
        this.currentSort = 'date-desc';
    }
};

window.LeetCode = LeetCode;
