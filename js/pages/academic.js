// Academic Page Component - Renders from JSON configuration
const AcademicPage = {
    renderSidebar(readingListData, sidebarData, isMobile = false) {
        return `
            <div class="sidebar-card">
                <div class="sidebar-section">
                    <span class="sidebar-label">Library Shelf</span>
                    <div id="bookshelf-multi-container" class="bookshelf-multi-container">
                        ${this.renderIndividualShelves(this.groupBooksByYear(readingListData))}
                    </div>
                </div>
            </div>
        `;
    },

    render() {
        // Get preloaded data
        const data = DataService.academicData || { profile: {}, education: [], professionalExperience: [], publications: [], skills: [], readingList: [] };
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

                    <!-- Honors & Awards Section (End of main) -->

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

        // Dynamic Sync: Try to get latest books from GitHub
        this.syncGitHubBooks();

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
                    router.navigate(`detail/academic/${id}`);
                }
            });
        });
    },

    /**
     * Sync books dynamically from personal-library README
     */
    /**
     * Helper to group books by year for fallback data
     */
    groupBooksByYear(books) {
        if (!books) return {};
        const groups = {};
        books.forEach(book => {
            const year = book.year || 'Reading';
            const key = year.includes('20') ? `${year} books` : year;
            if (!groups[key]) groups[key] = [];
            groups[key].push(book);
        });
        return groups;
    },

    /**
     * Helper to render multiple shelves based on grouped data
     */
    renderIndividualShelves(groupedBooks) {
        if (!groupedBooks || Object.keys(groupedBooks).length === 0) {
            return '<p class="no-content-msg">No books added yet.</p>';
        }

        const sortedEntries = Object.entries(groupedBooks).sort(([a], [b]) => {
            const isAReading = a.toLowerCase().includes('reading');
            const isBReading = b.toLowerCase().includes('reading');
            
            if (isAReading) return -1;
            if (isBReading) return 1;
            
            const yearA = parseInt(a.match(/\d+/)) || 0;
            const yearB = parseInt(b.match(/\d+/)) || 0;
            return yearB - yearA; // Recente primeiro
        });

        return sortedEntries.map(([year, books]) => {
            // Chunk books into sets of 5-6 to avoid long wrapping rows without boards
            const booksPerShelf = 6;
            const chunks = [];
            for (let i = 0; i < books.length; i += booksPerShelf) {
                chunks.push(books.slice(i, i + booksPerShelf));
            }

            return `
                <div class="shelf-group">
                    <span class="shelf-year-label">${year}</span>
                    <div class="shelves-wrapper">
                        ${chunks.map(chunk => `
                            <div class="bookshelf">
                                ${chunk.map(book => `
                                    <a href="${book.link}" target="_blank" class="spine-book" data-tag="${book.tag}" title="${book.title} - ${book.author}">
                                        <span class="spine-title">${book.title}</span>
                                        ${book.isBR ? '<span class="spine-br">BR</span>' : ''}
                                    </a>
                                `).join('')}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');
    },

    async syncGitHubBooks() {
        const containers = document.querySelectorAll('#bookshelf-multi-container');
        if (containers.length === 0) return;

        try {
            const groupedBooks = await DataService.getGitHubReadingList();
            if (groupedBooks) {
                const shelfHtml = this.renderIndividualShelves(groupedBooks);
                
                containers.forEach(container => {
                    container.innerHTML = shelfHtml;
                });
                console.log('📚 Multi-year bookshelf synced');
            }
        } catch (err) {
            console.warn('Sync failed, using fallback data:', err);
        }
    },

    onUnmount() {
        // Remove wide layout when leaving academic page
        document.body.classList.remove('wide-layout');
    }
};
