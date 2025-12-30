// Blog Page Component - Renders from JSON configuration
const BlogPage = {
    renderSidebar(readingListData, sidebarData, isMobile = false) {
        return `
            <div class="sidebar-card">
                <div class="sidebar-section">
                    <span class="sidebar-label">Recently Reading</span>
                    <div class="sidebar-link-list">
                        ${readingListData && readingListData.length > 0 ? readingListData.map(book => `
                            <div class="sidebar-link" style="cursor: default; pointer-events: none;">
                                <i class="${book.icon || 'fa-solid fa-book'}"></i>
                                <div style="display: flex; flex-direction: column;">
                                    <span style="font-size: 0.9rem; font-weight: 700;">${book.title}</span>
                                    <span style="font-size: 0.75rem; color: var(--text-muted);">${book.author}</span>
                                </div>
                                <span class="timeline-period" style="font-size: 0.65rem; padding: 2px 8px; margin-left: auto;">${book.status}</span>
                            </div>
                        `).join('') : '<p class="no-content-msg">No books added yet.</p>'}
                    </div>
                </div>

                <div class="sidebar-section">
                    <span class="sidebar-label">Core Expertise</span>
                    <div class="tag-cloud">
                        ${sidebarData.skills ? sidebarData.skills.map(skill => `<span class="sidebar-tag" data-tag="${skill}" style="cursor: default;">${skill}</span>`).join('') : ''}
                    </div>
                </div>
            </div>
        `;
    },

    render() {
        // Get preloaded data
        const data = DataService.blogData || { profile: {}, education: [], professionalExperience: [], publications: [], skills: [], readingList: [] };
        const toolsSidebar = DataService.toolsData?.sidebar || { categories: [], popularContent: [] };

        return `
            <div class="page-layout-grid academic-page-container">
                <div class="main-content-area">
                    <!-- CV Profile Header -->
                    <div class="card cv-profile-header">
                        <div class="cv-info">
                            <h1 class="cv-name">${data.profile.name}</h1>
                            <p class="cv-title">${data.profile.title}</p>
                            ${data.profile.citation ? `<p class="cv-citation"><strong>Citation:</strong> ${data.profile.citation}</p>` : ''}
                            <p class="cv-bio">${data.profile.bio}</p>
                            <div class="cv-meta">
                                <span><i class="fa-solid fa-location-dot"></i> ${data.profile.location}</span>
                                <span><i class="fa-solid fa-language"></i> ${data.profile.languages.map(l => `${l.name} (${l.level})`).join(', ')}</span>
                                <a href="http://lattes.cnpq.br/1588167693631178" target="_blank" class="academic-link"><i class="fa-solid fa-link"></i> Full Lattes CV</a>
                            </div>
                        </div>
                    </div>

                    <!-- Research & Articles Section -->
                    <div class="card cv-section-card">
                        <section class="cv-section">
                            <h2 class="cv-section-title">Research & Articles</h2>
                            <div id="articles-list" class="academic-list">
                                ${data.publications.filter(p => p.category === 'Articles').map(post => `
                                    <article class="academic-item" data-id="${post.id}">
                                        <div class="academic-item-header">
                                            <span class="academic-date">${post.date}</span>
                                            <span class="academic-type">${post.category}</span>
                                        </div>
                                        <h3 class="academic-title">${post.title}</h3>
                                        <p class="academic-excerpt">${post.institution} - ${post.excerpt}</p>
                                        <a href="#" class="read-more academic-link">Access article →</a>
                                    </article>
                                `).join('')}
                            </div>
                        </section>
                    </div>

                    <!-- Academic Productions Section -->
                    <div class="card cv-section-card">
                        <section class="cv-section">
                            <h2 class="cv-section-title">Academic Productions</h2>
                            <div id="productions-list" class="academic-list">
                                ${data.publications.filter(p => p.category !== 'Articles').map(post => `
                                    <article class="academic-item" data-id="${post.id}">
                                        <div class="academic-item-header">
                                            <span class="academic-date">${post.date}</span>
                                            <span class="academic-type">${post.category}</span>
                                        </div>
                                        <h3 class="academic-title">${post.title}</h3>
                                        <p class="academic-excerpt">${post.institution} - ${post.excerpt}</p>
                                        <a href="#" class="read-more academic-link">Access production →</a>
                                    </article>
                                `).join('')}
                            </div>
                        </section>
                    </div>

                    <!-- Honors & Awards Section -->
                    <div class="card cv-section-card">
                        <section class="cv-section" style="margin-bottom: 0;">
                            <h2 class="cv-section-title">Honors & Awards</h2>
                            <div class="cv-timeline">
                                ${data.honors.map(award => `
                                    <div class="timeline-item">
                                        <div class="timeline-dot"></div>
                                        <div class="timeline-content">
                                            <div class="timeline-header">
                                                <h3 class="timeline-title">${award.title}</h3>
                                                <span class="timeline-period">${award.date}</span>
                                            </div>
                                            <p class="timeline-institution">${award.institution}</p>
                                            <p class="timeline-desc">${award.description}</p>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </section>
                    </div>

                    <!-- Mobile Sidebar Content -->
                    <div class="mobile-only">
                        ${this.renderSidebar(data.readingList, data, true)}
                    </div>
                </div>

                <!-- Sidebar Area (Desktop Only) -->
                <aside class="sidebar desktop-only">
                    ${this.renderSidebar(data.readingList, data, false)}
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
