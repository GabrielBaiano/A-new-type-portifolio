// Tools Page Component - Renders user-created tools from JSON configuration
const ToolsPage = {
    renderSidebar(sidebarData, isMobile = false) {
        return `
            <div class="sidebar-card">
                <div class="sidebar-section">
                    <span class="sidebar-label">Browse by Category</span>
                    <div class="tag-cloud">
                        ${sidebarData.categories.map(cat => `<span class="sidebar-tag" data-tag="${cat}">${cat}</span>`).join('')}
                    </div>
                </div>

                <div class="sidebar-section ${isMobile ? 'collapsible-section' : ''}">
                    <div class="sidebar-section-header ${isMobile ? 'sidebar-toggle-btn' : ''}">
                        <span class="sidebar-label">Popular Content</span>
                        <i class="fa-solid fa-chevron-down sidebar-toggle-icon"></i>
                    </div>
                    <div class="sidebar-section-content">
                        <div class="sidebar-link-list">
                            ${sidebarData.popularContent.map(item => `
                                <a href="${item.link}" class="sidebar-link">
                                    <i class="fa-solid fa-arrow-right"></i>
                                    <span>${item.title}</span>
                                </a>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
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
                                <div class="project-card type-card" data-type-id="${type.id}">
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
                        <h2 class="section-title">Explore Feed</h2>
                        <p class="other-projects-description">Chronological updates on my latest works, releases, and platform updates.</p>

                        <div id="feed-container" class="feed-list">
                            ${feed.map(item => `
                                <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="feed-item">
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
                                </a>
                            `).join('')}
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
        
        // Enable wide layout for tools (feed) page
        document.body.classList.add('wide-layout');

        // Initialize sidebar toggle (only for collapsible sections)
        const toggles = document.querySelectorAll('.sidebar-toggle-btn');
        toggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const section = toggle.closest('.collapsible-section');
                if (section) {
                    section.classList.toggle('expanded');
                }
            });
        });
    },

    onUnmount() {
        // Remove wide layout when leaving tools page
        document.body.classList.remove('wide-layout');
    }
};
