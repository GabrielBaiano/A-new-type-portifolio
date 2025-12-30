// Tools Page Component - Renders user-created tools from JSON configuration
const ToolsPage = {
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
        return items.map(item => `
            <div class="feed-item feed-item-btn" data-id="${item.id}">
                <div class="feed-item-header">
                    <span class="feed-date">${item.date}</span>
                    <span class="feed-tag">${item.tag}</span>
                </div>
                
                ${item.image ? `
                    <div class="feed-item-image">
                        <img src="${item.image}" alt="${item.title}">
                    </div>
                ` : ''}
                
                <div class="feed-item-content">
                    <h4 class="feed-title">${item.title}</h4>
                    <p class="feed-description">${item.description}</p>
                </div>
            </div>
        `).join('');
    },

    render() {
        const articleTypes = DataService.toolsData?.articleTypes || [];
        const feed = DataService.toolsData?.feed || [];
        const sidebarData = DataService.toolsData?.sidebar || { categories: [], popularContent: [] };

        return `
            <div class="page-layout-grid">
                <div class="main-content-area">
                    <!-- Card 1: Resources & Publications -->
                    <div class="card projects-card">
                        <h2 class="section-title">Resources & Publications</h2>
                        
                        <div id="article-types-grid" class="projects-grid-cards article-types-grid">
                            ${articleTypes.map(type => `
                                <div class="project-card type-card clickable-category" data-type-id="${type.id}">
                                    <div class="type-card-header ${type.gradient}">
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
                            ${this.renderFeedItems(feed)}
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
        const allItems = DataService.toolsData?.feed || [];

        // Category card clicks (Navigate to category page)
        document.querySelectorAll('.clickable-category').forEach(card => {
            card.addEventListener('click', () => {
                const typeId = card.getAttribute('data-type-id');
                router.navigate(`detail/category/${typeId}`);
            });
        });

        // Feed Filter Logic
        const updateFeed = (filter, activeElement) => {
            const filtered = filter 
                ? allItems.filter(item => item.tag.toLowerCase() === filter.toLowerCase())
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
                    if (id) router.navigate(`detail/feed/${id}`);
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
