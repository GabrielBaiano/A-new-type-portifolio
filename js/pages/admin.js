/**
 * Admin Page Component
 * Centralized dashboard for managing books, photos, and other site content.
 */
const AdminPage = {
    isAuthenticated: sessionStorage.getItem('admin_authenticated') === 'true',
    activeTab: 'overview',
    allBooks: [],
    allPhotos: [],
    allBalloons: [],
    editingItem: null,

    async render() {
        if (!this.isAuthenticated) {
            return this.renderLogin();
        }

        return `
            <div class="admin-dashboard card">
                <div class="admin-layout">
                    <aside class="admin-sidebar">
                        <div class="admin-user-info">
                            <div class="admin-avatar">GB</div>
                            <div class="admin-user-details">
                                <span class="admin-name">Gabriel Baiano</span>
                                <span class="admin-role">Administrator</span>
                            </div>
                        </div>
                        <nav class="admin-nav">
                            <button class="admin-nav-item ${this.activeTab === 'overview' ? 'active' : ''}" data-tab="overview">
                                <i class="fa-solid fa-chart-line"></i> Overview
                            </button>
                            <button class="admin-nav-item ${this.activeTab === 'books' ? 'active' : ''}" data-tab="books">
                                <i class="fa-solid fa-book"></i> Books
                            </button>
                            <button class="admin-nav-item ${this.activeTab === 'photos' ? 'active' : ''}" data-tab="photos">
                                <i class="fa-solid fa-camera"></i> Photos
                            </button>
                            <button class="admin-nav-item ${this.activeTab === 'balloons' ? 'active' : ''}" data-tab="balloons">
                                <i class="fa-solid fa-circle-nodes"></i> Balloons
                            </button>
                        </nav>
                        <button class="admin-logout-btn" id="admin-logout">
                            <i class="fa-solid fa-right-from-bracket"></i> Logout
                        </button>
                    </aside>
                    
                    <main class="admin-main-content">
                        ${await this.renderTabContent()}
                    </main>
                </div>
            </div>
        `;
    },

    renderLogin() {
        return `
            <div class="admin-login-container">
                <div class="card login-card">
                    <div class="login-header">
                        <i class="fa-solid fa-shield-halved"></i>
                        <h1>Admin Access</h1>
                        <p>Please enter your secret key to continue.</p>
                    </div>
                    <form id="admin-login-form" class="login-form">
                        <div class="form-group">
                            <input type="password" id="admin-secret" placeholder="••••••••••••" required autofocus>
                        </div>
                        <button type="submit" class="btn-login">Unlock Dashboard</button>
                        <div id="login-error" class="login-error-msg"></div>
                    </form>
                </div>
            </div>
        `;
    },

    async renderTabContent() {
        switch (this.activeTab) {
            case 'books':
                return this.renderBooksModule();
            case 'photos':
                return this.renderPhotosModule();
            case 'balloons':
                return this.renderBalloonsModule();
            default:
                return this.renderOverview();
        }
    },

    renderOverview() {
        return `
            <div class="admin-tab-header">
                <h1>Overview</h1>
                <p>Welcome back! Here's what's happening in your portfolio.</p>
            </div>
            <div class="admin-stats-grid">
                <div class="stat-card">
                    <span class="stat-value">${this.allBooks.length}</span>
                    <span class="stat-label">Books Managed</span>
                </div>
                <div class="stat-card">
                    <span class="stat-value">${this.allPhotos.length}</span>
                    <span class="stat-label">Photos in Gallery</span>
                </div>
                <div class="stat-card">
                    <span class="stat-value">${this.allBalloons.length}</span>
                    <span class="stat-label">Active Balloons</span>
                </div>
            </div>
        `;
    },

    renderBooksModule() {
        return `
            <div class="admin-tab-header">
                <div class="header-main">
                    <h1>Book Management</h1>
                    <button class="btn-action" id="btn-new-book">+ New Book</button>
                </div>
            </div>
            <div class="admin-three-panel">
                <div class="panel-inventory">
                    <h3>Inventory</h3>
                    <div class="inventory-list" id="books-inventory">
                        ${this.allBooks.map(b => `
                            <div class="inventory-item ${this.editingItem?.id === b.id ? 'active' : ''}" data-id="${b.id}">
                                <img src="${b.image}" alt="">
                                <div class="item-info">
                                    <span class="item-title">${b.title}</span>
                                    <span class="item-meta">${b.status}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="panel-editor">
                    <h3>Editor</h3>
                    <form id="book-form" class="admin-form">
                        <input type="hidden" id="book-id" value="${this.editingItem?.id || ''}">
                        <div class="form-group">
                            <label>Title</label>
                            <input type="text" id="book-title" value="${this.editingItem?.title || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Image URL</label>
                            <input type="url" id="book-image" value="${this.editingItem?.image || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Status</label>
                            <select id="book-status">
                                <option value="Reading" ${this.editingItem?.status === 'Reading' ? 'selected' : ''}>Reading</option>
                                <option value="Finished" ${this.editingItem?.status === 'Finished' ? 'selected' : ''}>Finished</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Markdown URL</label>
                            <input type="url" id="book-md" value="${this.editingItem?.md_link || ''}">
                        </div>
                        <div class="form-group">
                            <label>Tags (Comma separated)</label>
                            <input type="text" id="book-tags" value="${(this.editingItem?.tags || []).join(', ')}">
                        </div>
                        <button type="submit" class="btn-save">Save Content</button>
                    </form>
                </div>
                <div class="panel-preview">
                    <h3>Preview</h3>
                    <div id="book-preview-container">
                        <!-- Preview rendered here -->
                    </div>
                </div>
            </div>
        `;
    },

    renderPhotosModule() {
        return `
            <div class="admin-tab-header">
                <div class="header-main">
                    <h1>Photo Gallery</h1>
                    <button class="btn-action" id="btn-new-photo">+ Add Photo</button>
                </div>
            </div>
            <div class="admin-three-panel">
                <div class="panel-inventory">
                    <h3>Library</h3>
                    <div class="inventory-grid" id="photos-inventory">
                        ${this.allPhotos.map(p => `
                            <div class="grid-item ${this.editingItem?.id === p.id ? 'active' : ''}" data-id="${p.id}">
                                <img src="${p.image}" alt="">
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="panel-editor">
                    <h3>Editor</h3>
                    <form id="photo-form" class="admin-form">
                        <input type="hidden" id="photo-id" value="${this.editingItem?.id || ''}">
                        <div class="form-group">
                            <label>Image URL</label>
                            <input type="url" id="photo-image" value="${this.editingItem?.image || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Description</label>
                            <textarea id="photo-desc">${this.editingItem?.description || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label>Link (Optional)</label>
                            <input type="url" id="photo-link" value="${this.editingItem?.link || ''}">
                        </div>
                        <button type="submit" class="btn-save">Save Photo</button>
                    </form>
                </div>
                <div class="panel-preview">
                    <h3>Preview</h3>
                    <div id="photo-preview-container">
                        <!-- Preview rendered here -->
                    </div>
                </div>
            </div>
        `;
    },

    renderBalloonsModule() {
        return `
            <div class="admin-tab-header">
                <div class="header-main">
                    <h1>Balloon System</h1>
                    <div class="header-actions">
                        <a href="balloons-preview.html" target="_blank" class="btn-action secondary">
                            <i class="fa-solid fa-arrow-up-right-from-square"></i> Open Preview
                        </a>
                    </div>
                </div>
                <p>Balloons are dynamically generated from GitHub and LeetCode activity.</p>
            </div>
            
            <div class="balloon-feed-container">
                <h3>Live Feed (Active Balloons)</h3>
                <div class="balloon-list-admin" id="balloons-inventory">
                    ${this.allBalloons.length > 0 ? this.allBalloons.map(b => `
                        <div class="balloon-item-admin">
                            <div class="balloon-badge-mini ${b.color}">${b.badge}</div>
                            <div class="balloon-info-admin">
                                <span class="balloon-title-admin">${b.name}</span>
                                <span class="balloon-msg-admin">${b.message || (b.title ? b.title : 'GitHub Activity')}</span>
                            </div>
                            <div class="balloon-date-admin">${new Date(b.date).toLocaleDateString()}</div>
                        </div>
                    `).join('') : '<p style="color: grey; padding: 20px;">No active balloons in the last 7 days.</p>'}
                </div>
            </div>
        `;
    },

    onMount() {
        if (!this.isAuthenticated) {
            this.setupLogin();
            return;
        }

        this.setupNavigation();
        this.setupModules();
        this.loadInitialData();
    },

    async loadInitialData() {
        const [books, photos, balloons] = await Promise.all([
            fetch('/api/get-books').then(r => r.json()).catch(() => ({ data: [] })),
            fetch('/api/get-photos').then(r => r.json()).catch(() => ({ data: [] })),
            fetch('/api/get-balloon-data?context=all').then(r => r.json()).catch(() => ({ data: [] }))
        ]);
        
        this.allBooks = books.data || [];
        this.allPhotos = (photos.data || []).map(p => ({
            id: p.id,
            image: p.image_url,
            description: p.description,
            link: p.link
        }));
        this.allBalloons = balloons.data || [];

        // Determine if we need to refresh overview stats if that's the current tab
        if (this.activeTab === 'overview') {
            const stats = document.querySelectorAll('.stat-value');
            if (stats.length >= 3) {
                stats[0].innerText = this.allBooks.length;
                stats[1].innerText = this.allPhotos.length;
                stats[2].innerText = this.allBalloons.length;
            }
        }

        this.refreshInventory();
    },

    setupLogin() {
        const form = document.getElementById('admin-login-form');
        const error = document.getElementById('login-error');
        if (!form) return;
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const secret = document.getElementById('admin-secret').value;
            
            if (secret) {
                // Store in session
                sessionStorage.setItem('admin_authenticated', 'true');
                sessionStorage.setItem('admin_secret', secret);
                
                // Update local state and re-render
                this.isAuthenticated = true;
                pageManager.loadPage('admin');
            } else {
                error.innerText = 'Please enter a secret key.';
            }
        });
    },

    setupNavigation() {
        const items = document.querySelectorAll('.admin-nav-item');
        items.forEach(item => {
            item.addEventListener('click', () => {
                this.activeTab = item.dataset.tab;
                this.editingItem = null;
                pageManager.loadPage('admin'); // Force re-render of the dashboard
            });
        });

        document.getElementById('admin-logout').addEventListener('click', () => {
            sessionStorage.removeItem('admin_authenticated');
            sessionStorage.removeItem('admin_secret');
            this.isAuthenticated = false;
            router.navigate('home');
        });
    },

    setupModules() {
        if (this.activeTab === 'books') this.setupBooksLogic();
        if (this.activeTab === 'photos') this.setupPhotosLogic();
    },

    setupBooksLogic() {
        const form = document.getElementById('book-form');
        if (!form) return;

        const listItems = document.querySelectorAll('#books-inventory .inventory-item');
        const newBtn = document.getElementById('btn-new-book');

        if (newBtn) {
            newBtn.addEventListener('click', () => {
                this.editingItem = null;
                pageManager.loadPage('admin');
            });
        }

        listItems.forEach(item => {
            item.addEventListener('click', () => {
                const id = item.dataset.id;
                this.editingItem = this.allBooks.find(b => b.id === id);
                pageManager.loadPage('admin');
            });
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                id: document.getElementById('book-id').value || null,
                title: document.getElementById('book-title').value,
                image: document.getElementById('book-image').value,
                status: document.getElementById('book-status').value,
                mdLink: document.getElementById('book-md').value,
                tags: document.getElementById('book-tags').value.split(',').map(t => t.trim()).filter(Boolean),
                secret: sessionStorage.getItem('admin_secret')
            };

            const res = await fetch('/api/add-book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert('Book saved!');
                this.loadInitialData();
            } else {
                alert('Error saving book.');
            }
        });
    },

    setupPhotosLogic() {
        const form = document.getElementById('photo-form');
        if (!form) return;

        const gridItems = document.querySelectorAll('#photos-inventory .grid-item');
        const newBtn = document.getElementById('btn-new-photo');

        if (newBtn) {
            newBtn.addEventListener('click', () => {
                this.editingItem = null;
                pageManager.loadPage('admin');
            });
        }

        gridItems.forEach(item => {
            item.addEventListener('click', () => {
                const id = item.dataset.id;
                this.editingItem = this.allPhotos.find(p => p.id === id);
                pageManager.loadPage('admin');
            });
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                id: document.getElementById('photo-id').value || null,
                image_url: document.getElementById('photo-image').value,
                description: document.getElementById('photo-desc').value,
                link: document.getElementById('photo-link').value,
                secret: sessionStorage.getItem('admin_secret')
            };

            const res = await fetch('/api/add-photo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert('Photo saved!');
                this.loadInitialData();
            } else {
                alert('Error saving photo.');
            }
        });
    },

    refreshInventory() {
        // This is a bit hacky in this simple PageManager, 
        // usually would use an observable or partial re-render.
        // For now, onMount handles the initial load.
    }
};
