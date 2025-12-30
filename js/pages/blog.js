// Blog Page Component - Renders from JSON configuration
const BlogPage = {
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
        // Get preloaded data synchronously
        const posts = DataService.blogData?.posts || [];
        const sidebarData = DataService.toolsData?.sidebar || { categories: [], popularContent: [] };

        return `
            <div class="page-layout-grid academic-page-container">
                <div class="main-content-area">
                    <div class="card academic-card" style="width: 100%; max-width: none;">
                        <h2 class="section-title">Academic Production</h2>
                        <div id="academic-list" class="academic-list">
                            ${posts.map(post => `
                                <article class="academic-item" data-id="${post.id}">
                                    <div class="academic-item-header">
                                        <span class="academic-date">${post.date}</span>
                                        <span class="academic-type">${post.type}</span>
                                    </div>
                                    <h3 class="academic-title">${post.title}</h3>
                                    <p class="academic-excerpt">${post.excerpt}</p>
                                    <a href="#" class="read-more academic-link">Access work →</a>
                                </article>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Mobile Sidebar Content (Between sections) -->
                    <div class="mobile-only">
                        ${this.renderSidebar(sidebarData, true)}
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
        console.log('Academic page mounted');
        
        // Enable wide layout for academic page
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
        
        // Add click handlers to academic items
        const academicItems = document.querySelectorAll('.academic-item');
        academicItems.forEach(item => {
            item.style.cursor = 'pointer';
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const id = item.getAttribute('data-id');
                if (id) {
                    router.navigate(`detail/blog/${id}`);
                }
            });
        });
    },

    onUnmount() {
        // Remove wide layout when leaving academic page
        document.body.classList.remove('wide-layout');
    }
};
