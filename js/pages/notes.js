/**
 * Notes Page Component
 * Manages the Study Notes view with search and tag filtering
 */

const NotesPage = {
    allNotes: [],
    selectedTags: new Set(),
    searchQuery: '',

    async render(params) {
        // If an ID is provided, render detail view (future implementation or reuse generic detail)
        // For now, we focus on the list view as requested
        return await this.renderList();
    },

    async renderList() {
        try {
            const data = await DataService.loadNotesData();
            this.allNotes = data.notes || [];
        } catch (error) {
            console.error('[Notes] Error loading data:', error);
            this.allNotes = [];
        }

        // Extract all unique tags for the filter cloud
        const allTags = new Set();
        this.allNotes.forEach(note => {
            if (note.tags) {
                note.tags.forEach(tag => allTags.add(tag));
            }
        });
        const sortedTags = Array.from(allTags).sort();

        return `
            <div class="card detail-card notes-card-theme">
                <a href="#/feed" class="back-button">
                    <i class="fa-solid fa-arrow-left"></i>
                    <span>Back</span>
                </a>

                <div class="detail-header">
                    <h1 class="detail-title">Study Notes</h1>
                    <p class="detail-subtitle">This is where I share my notes and summaries of the things I'm studying.</p>
                </div>

                <div class="notes-controls">
                    <!-- Search Bar -->
                    <div class="search-box notes-search-box">
                        <i class="fa-solid fa-magnifying-glass"></i>
                        <input type="text" id="notes-search" placeholder="Filter by name, topic, or content..." value="${this.searchQuery}">
                    </div>

                    <!-- Tag Cloud -->
                    <div class="notes-tag-cloud">
                        <span class="tag-cloud-label">Filter by topics:</span>
                        <div class="tags-wrapper">
                            ${sortedTags.map(tag => `
                                <button class="sidebar-tag clickable-filter ${this.selectedTags.has(tag) ? 'active' : ''}" data-tag="${tag}">
                                    ${tag}
                                </button>
                            `).join('')}
                        </div>
                        ${this.selectedTags.size > 0 ? `<button id="clear-tags" class="clear-tags-btn">Clear Filters</button>` : ''}
                    </div>
                </div>

                <div class="notes-grid" id="notes-grid">
                    ${this.generateGridHTML(this.filterNotes())}
                </div>
            </div>
        `;
    },

    generateGridHTML(notes) {
        if (notes.length === 0) {
            return `<div class="empty-state">No notes found matching your criteria.</div>`;
        }

        return notes.map(note => `
            <div class="note-card" data-id="${note.id}">
                <div class="note-header">
                    <span class="note-date">${new Date(note.date).toLocaleDateString()}</span>
                    <div class="note-tags">
                        ${note.tags.slice(0, 3).map(tag => `<span class="feed-tag">${tag}</span>`).join('')}
                        ${note.tags.length > 3 
                            ? `<span class="more-tags" data-tooltip="${note.tags.slice(3).join(', ')}">...</span>` 
                            : ''}
                    </div>
                </div>
                <h3 class="note-title">${note.title}</h3>
                <p class="note-excerpt">${note.excerpt}</p>
                <a href="#/notes/${note.id}" class="read-note-btn">Read Note →</a>
            </div>
        `).join('');
    },

    filterNotes() {
        let filtered = [...this.allNotes];

        // 1. Text Search
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(note => 
                note.title.toLowerCase().includes(query) || 
                note.excerpt.toLowerCase().includes(query) ||
                (note.tags && note.tags.some(t => t.toLowerCase().includes(query)))
            );
        }

        // 2. Tag Filter (OR logic: note must have at least one of the selected tags)
        // Adjust to AND logic if strict filtering is preferred. For typical "filtering", OR within tags is common?
        // Actually, user said "choose tags" (plural). Usually if I click "JS" and "React", I might want things that are BOTH?
        // Or things that are either?
        // Let's stick to: If ANY selected tag is present in the note, show it.
        if (this.selectedTags.size > 0) {
            filtered = filtered.filter(note => 
                note.tags && note.tags.some(tag => this.selectedTags.has(tag))
            );
        }

        return filtered;
    },

    onMount() {
        console.log('[Notes] Page mounted');
        document.body.classList.add('wide-layout');
        this.setupListeners();
    },

    setupListeners() {
        // Search
        const searchInput = document.getElementById('notes-search');
        if (searchInput) {
            searchInput.focus(); // Auto focus on search
            const end = searchInput.value.length;
            searchInput.setSelectionRange(end, end);

            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.updateGrid();
            });
        }

        // Tags
        const tagBtns = document.querySelectorAll('.sidebar-tag.clickable-filter');
        tagBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tag = btn.dataset.tag;
                if (this.selectedTags.has(tag)) {
                    this.selectedTags.delete(tag);
                    btn.classList.remove('active');
                } else {
                    this.selectedTags.add(tag);
                    btn.classList.add('active');
                }
                this.updateGrid();
                this.updateClearButton();
            });
        });

        // Clear Tags
        const clearBtn = document.getElementById('clear-tags');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.selectedTags.clear();
                document.querySelectorAll('.sidebar-tag.clickable-filter.active').forEach(b => b.classList.remove('active'));
                this.updateGrid();
                this.updateClearButton();
            });
        }
    },

    updateGrid() {
        const grid = document.getElementById('notes-grid');
        if (grid) {
            grid.innerHTML = this.generateGridHTML(this.filterNotes());
        }
    },

    updateClearButton() {
        const container = document.querySelector('.notes-tag-cloud');
        let clearBtn = document.getElementById('clear-tags');
        
        if (this.selectedTags.size > 0) {
            if (!clearBtn) {
                clearBtn = document.createElement('button');
                clearBtn.id = 'clear-tags';
                clearBtn.className = 'clear-tags-btn';
                clearBtn.textContent = 'Clear Filters';
                clearBtn.addEventListener('click', () => {
                    this.selectedTags.clear();
                    document.querySelectorAll('.sidebar-tag.clickable-filter.active').forEach(b => b.classList.remove('active'));
                    this.updateGrid();
                    this.updateClearButton();
                });
                container.appendChild(clearBtn);
            }
        } else {
            if (clearBtn) {
                clearBtn.remove();
            }
        }
    },

    onUnmount() {
        document.body.classList.remove('wide-layout');
        // Keep state? Or reset?
        // Usually nice to keep filter state if navigating back and forth quickly, 
        // but let's reset for fresh start unless requested otherwise.
        this.searchQuery = '';
        this.selectedTags.clear();
    }
};

window.NotesPage = NotesPage;
