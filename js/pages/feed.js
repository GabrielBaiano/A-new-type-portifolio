// Feed Page Component
const FeedPage = {
    renderSidebar(sidebarData, isMobile = false) {
        return `
            <div class="sidebar-card">
                <div class="sidebar-section">
                    <span class="sidebar-label">Browse by Category</span>
                    <div class="tag-cloud">
                        ${sidebarData.categories.map(cat => `<span class="sidebar-tag clickable-filter" data-filter="${cat}" data-tag="${cat}">${cat}</span>`).join('')}
                    </div>
                </div>

                <div class="sidebar-section ${isMobile ? 'collapsible-section' : ''}">
                    <div class="sidebar-section-header ${isMobile ? 'sidebar-toggle-btn' : ''}">
                        <span class="sidebar-label">Popular Content</span>
                        <i class="fa-solid fa-chevron-down sidebar-toggle-icon"></i>
                    </div>
                    <div class="sidebar-section-content">
                        <div class="sidebar-link-list">
                            ${sidebarData.popularContent.length > 0 ? sidebarData.popularContent.map(item => `
                                <a href="${item.link}" class="sidebar-link">
                                    <i class="fa-solid fa-arrow-right"></i>
                                    <span>${item.title}</span>
                                </a>
                            `).join('') : '<p class="no-content-msg">No popular content yet.</p>'}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    renderFeedItems(items) {
        if (items.length === 0) {
            return '<p class="no-results">No items found for this category.</p>';
        }
        return items.map(item => {
            let tagClass = '';
            const type = item.type || '';
            const tag = (item.tag || '').toLowerCase();

            if (type === 'leetcode-resolutions' || tag.includes('leetcode')) tagClass = 'tag-pink';
            else if (type === 'full-reviews' || tag.includes('book') || tag.includes('review')) tagClass = 'tag-purple';
            else if (type === 'deep-tutorials' || tag.includes('tutorial') || tag.includes('mastery') || tag.includes('guide')) tagClass = 'tag-orange';
            else if (type === 'study-notes' || tag.includes('note')) tagClass = 'tag-cyan';
            else if (type === 'projects-labs' || tag.includes('project') || tag.includes('release')) tagClass = 'tag-green';
            else tagClass = 'tag-blue';

            return `
            <div class="feed-item feed-item-btn" data-id="${item.id}">
                <div class="feed-item-header">
                    <span class="feed-date">${(() => {
                        try {
                            const d = new Date(item.date);
                            return isNaN(d) ? item.date : d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
                        } catch (e) { return item.date; }
                    })()}</span>
                    <span class="feed-tag ${tagClass}" data-tag="${item.tag}">${item.tag}</span>
                </div>
                
                ${item.image ? `
                    <div class="feed-item-image ${item.type === 'full-reviews' ? 'book-feed-container' : ''}">
                        <img src="${item.image}" alt="${item.title}" class="${item.type === 'full-reviews' ? 'book-feed-img' : ''}">
                    </div>
                ` : ''}
                
                <div class="feed-item-content">
                    <h4 class="feed-title">${item.title}</h4>
                    <p class="feed-description">${item.description}</p>
                    ${item.status === 'Reading' ? '<span class="status-indicator reading">Currently Reading 📖</span>' : ''}
                </div>
            </div>
        `;
        }).join('');
    },

    async render() {
        const toolsData = await DataService.loadToolsData();
        const articleTypes = toolsData?.articleTypes || [];
        const sidebarData = toolsData?.sidebar || { categories: [], popularContent: [] };

        // 1. Fetch Unified Feed (Handles Static, LeetCode, Notes, Reviews)
        const combinedFeed = await DataService.getUnifiedFeed();

        // Store for onMount filtering
        this.combinedFeed = combinedFeed;

        return `
            <div class="page-layout-grid">
                <div class="main-content-area">
                    <!-- Card 1: Content Channels -->
                    <div class="card projects-card channel-card">
                        <h2 class="section-title">Content Channels</h2>
                        
                        <div id="article-types-grid" class="projects-grid-cards article-types-grid">
                            ${articleTypes.map(type => `
                                <div class="project-card type-card ${type.gradient} clickable-card-filter" data-type-id="${type.id}">
                                    <div class="type-card-header">
                                        <i class="${type.icon}"></i>
                                        <h3 class="project-title">${type.title}</h3>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Mobile Sidebar Content (Between sections) -->
                    <div class="mobile-only">
                        ${this.renderSidebar(sidebarData, true)}
                    </div>

                    <!-- Card 2: Explore Feed -->
                    <div class="card other-projects-card">
                        <div class="feed-header-flex">
                            <h2 class="section-title">Explore Feed</h2>
                            <button id="clear-filter" class="clear-filter-btn" style="display: none;">Show All</button>
                        </div>
                        <p class="other-projects-description">Chronological updates on my latest works, releases, and platform updates.</p>

                        <div id="feed-container" class="feed-list">
                            ${this.renderFeedItems(combinedFeed)}
                        </div>
                    </div>
                </div>

            <!-- Sidebar Area (Desktop Only) -->
            <aside class="sidebar desktop-only">
                ${this.renderSidebar(sidebarData, false)}
            </aside>
        </div>
    `;
},

    onMount() {
        console.log('Tools page mounted');
        document.body.classList.add('wide-layout');

        const feedContainer = document.getElementById('feed-container');
        const clearBtn = document.getElementById('clear-filter');
        const allItems = this.combinedFeed || [];

        // Category card clicks (Navigate to category page)
        document.querySelectorAll('.clickable-category').forEach(card => {
            card.addEventListener('click', () => {
                const typeId = card.getAttribute('data-type-id');
                if (typeId === 'leetcode-resolutions') {
                    router.navigate('leetcode');
                } else if (typeId === 'study-notes') {
                    router.navigate('notes');
                } else if (typeId === 'full-projects') {
                    router.navigate('reviews');
                } else {
                    router.navigate(`detail/category/${typeId}`);
                }
            });
        });

        // Feed Filter Logic
        const updateFeed = (filter, activeElement) => {
            const filtered = filter 
                ? allItems.filter(item => (item.tag || '').toLowerCase() === filter.toLowerCase())
                : allItems;
            
            feedContainer.innerHTML = this.renderFeedItems(filtered);
            clearBtn.style.display = filter ? 'block' : 'none';

            // Active state for sidebar tags
            document.querySelectorAll('.sidebar-tag').forEach(el => el.classList.remove('active'));
            if (activeElement) activeElement.classList.add('active');

            attachFeedListeners();
            window.scrollTo({ top: feedContainer.offsetTop - 100, behavior: 'smooth' });
        };

        const attachFeedListeners = () => {
            const feedItems = document.querySelectorAll('.feed-item-btn');
            feedItems.forEach(item => {
                item.style.cursor = 'pointer';
                item.addEventListener('click', () => {
                    const id = item.getAttribute('data-id');
                    const itemData = allItems.find(i => i.id === id);
                    if (!id || !itemData) return;
                    
                    if (id.startsWith('leetcode-')) {
                        router.navigate(`leetcode/${id.replace('leetcode-', '')}`);
                    } else if (itemData.type === 'full-reviews') {
                        // Only open review if status is Finished
                        if (itemData.status === 'Finished') {
                            router.navigate(`review-view/${id}`);
                        }
                    } else {
                        router.navigate(`detail/feed/${id}`);
                    }
                });
            });
        };

        // Sidebar tag filtering
        document.querySelectorAll('.sidebar-tag.clickable-filter').forEach(el => {
            el.addEventListener('click', () => {
                const filter = el.getAttribute('data-filter');
                if (filter) updateFeed(filter, el);
            });
        });

        clearBtn?.addEventListener('click', () => updateFeed(null));

        // Sidebar toggles
        const toggles = document.querySelectorAll('.sidebar-toggle-btn');
        toggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const section = toggle.closest('.collapsible-section');
                if (section) section.classList.toggle('expanded');
            });
        });

        attachFeedListeners();
    },

    onUnmount() {
        document.body.classList.remove('wide-layout');
        document.body.style.overflow = ''; // Clean up scroll lock if page changed
    }
};
