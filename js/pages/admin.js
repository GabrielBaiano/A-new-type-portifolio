/**
 * Admin Page Component
 * Centralized dashboard for managing books, photos, and other site content.
 */
const AdminPage = {
    isAuthenticated: false,
    activeTab: 'overview',
    allBooks: [],
    allPhotos: [],
    allPosts: [],
    allLeetCode: [],
    allBalloons: [],
    editingItem: null,
    isUploading: false,

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
                                <span class="admin-role">Administrator v1.1</span>
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
                            <button class="admin-nav-item ${this.activeTab === 'posts' ? 'active' : ''}" data-tab="posts">
                                <i class="fa-solid fa-pen-nib"></i> Posts
                            </button>
                            <button class="admin-nav-item ${this.activeTab === 'guides' ? 'active' : ''}" data-tab="guides">
                                <i class="fa-solid fa-chalkboard-user"></i> Guides
                            </button>
                            <button class="admin-nav-item ${this.activeTab === 'leetcode' ? 'active' : ''}" data-tab="leetcode">
                                <i class="fa-solid fa-code"></i> LeetCode
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
                            <input type="password" id="admin-secret" placeholder="••••••••••••" required autofocus autocomplete="off">
                            <div id="caps-warning" class="caps-warning-msg" style="display: none;">
                                <i class="fa-solid fa-triangle-exclamation"></i> Caps Lock is ON
                            </div>
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
            case 'posts':
                return this.renderFeedModule();
            case 'guides':
                return this.renderGuidesModule();
            case 'leetcode':
                return this.renderLeetCodeModule();
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
                    <span class="stat-value">${this.allPosts.length}</span>
                    <span class="stat-label">Feed Posts</span>
                </div>
                <div class="stat-card">
                    <span class="stat-value">${this.allLeetCode.length}</span>
                    <span class="stat-label">LeetCode Solved</span>
                </div>
            </div>
        `;
    },

    renderBookPreview(book) {
        if (!book) return '<p style="color: grey; padding: 20px;">Select a book to preview.</p>';
        return `
            <div class="book-card-preview" style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px; text-align: center;">
                <img src="${book.image || ''}" style="width: 120px; height: 170px; object-fit: cover; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.3);">
                <h4 style="margin: 0; font-family: 'Sora', sans-serif;">${book.title || 'Untitled'}</h4>
                <p style="font-size: 0.8rem; color: var(--accent-blue); margin: 5px 0;">${book.status || 'Status'}</p>
                <div style="display: flex; gap: 5px; justify-content: center; flex-wrap: wrap; margin-top: 10px;">
                    ${(book.tags || []).map(t => `<span style="font-size: 0.65rem; background: rgba(0,112,243,0.1); color: var(--accent-blue); padding: 2px 8px; border-radius: 4px;">${t}</span>`).join('')}
                </div>
            </div>
            <div style="margin-top: 20px; font-size: 0.75rem; color: var(--text-muted);">
                <i class="fa-solid fa-link"></i> Markdown: ${book.md_link || 'Not set'}
            </div>
        `;
    },

    renderPhotoPreview(photo) {
        if (!photo) return '<p style="color: grey; padding: 20px;">Select a photo to preview.</p>';
        return `
            <div class="photo-card-preview" style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden;">
                <img src="${photo.image || ''}" style="width: 100%; aspect-ratio: 16/10; object-fit: cover;">
                <div style="padding: 15px;">
                    <p style="margin: 0; font-size: 0.85rem; line-height: 1.4;">${photo.description || 'No description provided.'}</p>
                    ${photo.link ? `<p style="margin-top: 10px; font-size: 0.75rem; color: var(--accent-blue);"><i class="fa-solid fa-external-link"></i> ${photo.link}</p>` : ''}
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
                            <div class="upload-row">
                                <input type="url" id="book-image" value="${this.editingItem?.image || ''}" placeholder="https://..." required>
                                <label for="book-upload" class="btn-upload-label" title="Upload from computer">
                                    <i class="fa-solid ${this.isUploading ? 'fa-spinner fa-spin' : 'fa-cloud-arrow-up'}"></i>
                                    <input type="file" id="book-upload" accept="image/*" style="display: none;">
                                </label>
                            </div>
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
                            <input type="text" id="book-tags" value="${(this.editingItem?.tags || []).join(', ')}" placeholder="AI, Math, SC-FI">
                        </div>
                        <div class="form-group" style="display: flex; align-items: center; gap: 10px;">
                            <input type="checkbox" id="book-show-in-feed" ${this.editingItem?.show_in_feed !== false ? 'checked' : ''} style="width: auto;">
                            <label for="book-show-in-feed" style="margin-bottom: 0;">Show in Public Feed</label>
                        </div>
                        <button type="submit" class="btn-save">Save Book</button>
                    </form>
                </div>
                <div class="panel-preview">
                    <h3>Preview</h3>
                    <div id="book-preview-container">
                        ${this.renderBookPreview(this.editingItem)}
                    </div>
                </div>
            </div>
        `;
    },

    renderPostPreview(post) {
        if (!post) return '<p style="color: grey; padding: 20px;">Draft a post to preview.</p>';
        return `
            <div class="post-card-preview" style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <span style="font-size: 0.7rem; color: var(--text-muted);">${new Date().toLocaleDateString()}</span>
                    <span style="font-size: 0.65rem; background: var(--accent-blue); color: white; padding: 2px 8px; border-radius: 4px;">${post.tag || 'Pensamentos'}</span>
                </div>
                <h4 style="margin: 0 0 10px 0; font-family: 'Sora', sans-serif;">${post.title || 'Post Title'}</h4>
                <div class="markdown-body" style="font-size: 0.85rem; line-height: 1.6; color: var(--text-normal);">
                    ${post.content ? post.content.substring(0, 300) + (post.content.length > 300 ? '...' : '') : 'Write something to see the preview...'}
                </div>
            </div>
        `;
    },

    renderLeetCodePreview(lc) {
        if (!lc) return '<p style="color: grey; padding: 20px;">Draft a resolution to preview.</p>';
        return `
            <div class="lc-card-preview" style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <span style="font-size: 0.7rem; color: var(--text-muted);">#${lc.number || '000'}</span>
                    <span style="font-size: 0.65rem; background: #FF375F; color: white; padding: 2px 8px; border-radius: 4px;">LeetCode</span>
                </div>
                <h4 style="margin: 0 0 10px 0; font-family: 'Sora', sans-serif;">${lc.name || 'Problem Name'}</h4>
                <div style="font-size: 0.8rem; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 6px; font-family: monospace; white-space: pre-wrap;">
                    ${lc.content ? lc.content.substring(0, 200) + '...' : '// Solution code here'}
                </div>
            </div>
        `;
    },

    renderFeedModule() {
        return `
            <div class="admin-tab-header">
                <div class="header-main">
                    <h1>Feed Posts</h1>
                    <button class="btn-action" id="btn-new-post">+ New Post</button>
                </div>
            </div>
            <div class="admin-three-panel">
                <div class="panel-inventory">
                    <h3>History</h3>
                    <div class="inventory-list" id="posts-inventory">
                        ${this.allPosts.length > 0 ? this.allPosts.map(p => `
                            <div class="inventory-item ${this.editingItem?.id === p.id ? 'active' : ''}" data-id="${p.id}">
                                <div class="item-info">
                                    <span class="item-title">${p.title}</span>
                                    <span class="item-meta">${p.tag} • ${new Date(p.date).toLocaleDateString()}</span>
                                </div>
                            </div>
                        `).join('') : '<p style="padding: 10px; color: grey;">No posts yet.</p>'}
                    </div>
                </div>
                <div class="panel-editor">
                    <h3>Editor</h3>
                    <form id="post-form" class="admin-form">
                        <input type="hidden" id="post-id" value="${this.editingItem?.id || ''}">
                        <div class="form-group">
                            <label>Title</label>
                            <input type="text" id="post-title" value="${this.editingItem?.title || ''}" placeholder="What's on your mind?" required>
                        </div>
                        <div class="form-group">
                            <label>Content (Markdown Support)</label>
                            <textarea id="post-content" style="height: 300px; font-family: monospace;" placeholder="Write your thoughts..." required>${this.editingItem?.content || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label>Category / Tag</label>
                            <select id="post-tag">
                                <option value="Thoughts" ${this.editingItem?.tag === 'Thoughts' ? 'selected' : ''}>Thoughts</option>
                                <option value="Updates" ${this.editingItem?.tag === 'Updates' ? 'selected' : ''}>Updates</option>
                                <option value="Guides" ${this.editingItem?.tag === 'Guides' ? 'selected' : ''}>Guides</option>
                                <option value="Study Notes" ${this.editingItem?.tag === 'Study Notes' ? 'selected' : ''}>Study Notes</option>
                                <option value="LeetCode" ${this.editingItem?.tag === 'LeetCode' ? 'selected' : ''}>LeetCode</option>
                                <option value="Book Review" ${this.editingItem?.tag === 'Book Review' ? 'selected' : ''}>Book Review</option>
                                <option value="Release" ${this.editingItem?.tag === 'Release' ? 'selected' : ''}>Release</option>
                            </select>
                        </div>
                        <div class="form-group" style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                            <input type="checkbox" id="post-show-in-feed" ${this.editingItem?.show_in_feed !== false ? 'checked' : ''} style="width: auto;">
                            <label for="post-show-in-feed" style="margin-bottom: 0;">Show in Public Feed</label>
                        </div>
                        <div class="form-group" style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                            <input type="checkbox" id="post-is-popular" ${this.editingItem?.is_popular === true ? 'checked' : ''} style="width: auto;">
                            <label for="post-is-popular" style="margin-bottom: 0;">Mark as Popular Content (Sidebar)</label>
                        </div>
                        <div class="form-group" style="display: flex; align-items: center; gap: 10px;">
                            <input type="checkbox" id="post-show-toc" ${this.editingItem?.show_toc === true ? 'checked' : ''} style="width: auto;">
                            <label for="post-show-toc" style="margin-bottom: 0;">Show Table of Contents (TOC)</label>
                        </div>
                        <button type="submit" class="btn-save">Publish to Feed</button>
                    </form>
                </div>
                <div class="panel-preview">
                    <h3>Preview</h3>
                    <div id="post-preview-container">
                        ${this.renderPostPreview(this.editingItem)}
                    </div>
                </div>
            </div>
        `;
    },

    renderLeetCodeModule() {
        return `
            <div class="admin-tab-header">
                <div class="header-main">
                    <h1>LeetCode Resolutions</h1>
                    <button class="btn-action" id="btn-new-lc">+ Log Solution</button>
                </div>
            </div>
            <div class="admin-three-panel">
                <div class="panel-inventory">
                    <h3>Solved Problems</h3>
                    <div class="inventory-list" id="lc-inventory">
                        ${this.allLeetCode.length > 0 ? this.allLeetCode.map(l => `
                            <div class="inventory-item ${this.editingItem?.id === l.id ? 'active' : ''}" data-id="${l.id}">
                                <div class="item-info">
                                    <span class="item-title">#${l.number}: ${l.name}</span>
                                    <span class="item-meta">Streak: ${l.streak} 🔥</span>
                                </div>
                            </div>
                        `).join('') : '<p style="padding: 10px; color: grey;">No solutions yet.</p>'}
                    </div>
                </div>
                <div class="panel-editor">
                    <h3>Editor</h3>
                    <form id="lc-form" class="admin-form">
                        <div class="form-row" style="display: flex; gap: 15px;">
                            <div class="form-group" style="flex: 0 0 80px;">
                                <label>Number</label>
                                <input type="number" id="lc-number" value="${this.editingItem?.number || ''}" required>
                            </div>
                            <div class="form-group" style="flex: 1;">
                                <label>Problem Name</label>
                                <input type="text" id="lc-name" value="${this.editingItem?.name || ''}" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Solution Code / Content</label>
                            <textarea id="lc-content" style="height: 250px; font-family: monospace;" placeholder="Paste your solution here..." required>${this.editingItem?.content || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label>External Link (LeetCode URL)</label>
                            <input type="url" id="lc-link" value="${this.editingItem?.external_link || ''}">
                        </div>
                        <button type="submit" class="btn-save">Save Resolution</button>
                    </form>
                </div>
                <div class="panel-preview">
                    <h3>Preview</h3>
                    <div id="lc-preview-container">
                        ${this.renderLeetCodePreview(this.editingItem)}
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
                            <div class="upload-row">
                                <input type="url" id="photo-image" value="${this.editingItem?.image || ''}" placeholder="https://..." required>
                                <label for="photo-upload" class="btn-upload-label" title="Upload from computer">
                                    <i class="fa-solid ${this.isUploading ? 'fa-spinner fa-spin' : 'fa-cloud-arrow-up'}"></i>
                                    <input type="file" id="photo-upload" accept="image/*" style="display: none;">
                                </label>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Description</label>
                            <textarea id="photo-desc">${this.editingItem?.description || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label>Link (Optional)</label>
                            <input type="url" id="photo-link" value="${this.editingItem?.link || ''}" placeholder="External link?">
                        </div>
                        <div class="form-group" style="display: flex; align-items: center; gap: 10px;">
                            <input type="checkbox" id="photo-show-in-feed" ${this.editingItem?.show_in_feed !== false ? 'checked' : ''} style="width: auto;">
                            <label for="photo-show-in-feed" style="margin-bottom: 0;">Show in Public Feed</label>
                        </div>
                        <button type="submit" class="btn-save">Save Photo</button>
                    </form>
                </div>
                <div class="panel-preview">
                    <h3>Preview</h3>
                    <div id="photo-preview-container">
                        ${this.renderPhotoPreview(this.editingItem)}
                    </div>
                </div>
            </div>
        `;
    },

    renderGuidesModule() {
        // Only show guides (tag: Guides)
        const guides = this.allPosts.filter(p => p.tag === 'Guides');

        return `
            <div class="admin-tab-header">
                <div class="header-main">
                    <h1>Mastery & Guides</h1>
                    <button class="btn-action" id="btn-new-guide">+ New Guide</button>
                </div>
            </div>
            <div class="admin-three-panel">
                <div class="panel-inventory">
                    <h3>Available Guides</h3>
                    <div class="inventory-list" id="guides-inventory">
                        ${guides.length > 0 ? guides.map(p => `
                            <div class="inventory-item ${this.editingItem?.id === p.id ? 'active' : ''}" data-id="${p.id}">
                                <div class="item-info">
                                    <span class="item-title">${p.title}</span>
                                    <span class="item-meta">${p.date ? new Date(p.date).toLocaleDateString() : 'No date'}</span>
                                </div>
                            </div>
                        `).join('') : '<p style="padding: 10px; color: grey;">No guides yet.</p>'}
                    </div>
                </div>
                <div class="panel-editor">
                    <h3>Guide Editor</h3>
                    <form id="guide-form" class="admin-form">
                        <input type="hidden" id="guide-id" value="${this.editingItem?.id || ''}">
                        <div class="form-group">
                            <label>Title</label>
                            <input type="text" id="guide-title" value="${this.editingItem?.title || ''}" placeholder="Deep dive into..." required>
                        </div>
                        <div class="form-group">
                            <label>Content (Markdown Support)</label>
                            <textarea id="guide-content" style="height: 400px; font-family: monospace;" placeholder="Write your technical guide..." required>${this.editingItem?.content || ''}</textarea>
                        </div>
                        <div class="form-group" style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                            <input type="checkbox" id="guide-show-in-feed" ${this.editingItem?.show_in_feed !== false ? 'checked' : ''} style="width: auto;">
                            <label for="guide-show-in-feed" style="margin-bottom: 0;">Show in Public Feed</label>
                        </div>
                        <div class="form-group" style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                            <input type="checkbox" id="guide-is-popular" ${this.editingItem?.is_popular === true ? 'checked' : ''} style="width: auto;">
                            <label for="guide-is-popular" style="margin-bottom: 0;">Mark as Popular</label>
                        </div>
                        <div class="form-group" style="display: flex; align-items: center; gap: 10px;">
                            <input type="checkbox" id="guide-show-toc" ${this.editingItem?.show_toc !== false ? 'checked' : ''} style="width: auto;">
                            <label for="guide-show-toc" style="margin-bottom: 0;">Auto-generate Table of Contents (TOC)</label>
                        </div>
                        <button type="submit" class="btn-save">Save Guide</button>
                    </form>
                </div>
                <div class="panel-preview">
                    <h3>Preview</h3>
                    <div id="guide-preview-container">
                        ${this.renderPostPreview(this.editingItem)}
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
        const [books, photos, balloons, posts, leetcode] = await Promise.all([
            fetch('/api/books').then(r => r.json()).catch(() => ({ data: [] })),
            fetch('/api/photos').then(r => r.json()).catch(() => ({ data: [] })),
            fetch('/api/balloons?context=all').then(r => r.json()).catch(() => ({ data: [] })),
            fetch('/api/feed').then(r => r.json()).catch(() => ({ data: [] })),
            fetch('/api/leetcode').then(r => r.json()).catch(() => ({ data: [] }))
        ]);
        
        this.allBooks = books.data || [];
        this.allPhotos = (photos.data || []).map(p => ({
            id: p.id,
            image: p.image_url,
            description: p.description,
            link: p.link
        }));
        this.allBalloons = balloons.data || [];
        this.allPosts = posts.data || [];
        this.allLeetCode = leetcode.data || [];

        // Determine if we need to refresh overview stats if that's the current tab
        if (this.activeTab === 'overview') {
            const stats = document.querySelectorAll('.stat-value');
            if (stats.length >= 5) {
                stats[0].innerText = this.allBooks.length;
                stats[1].innerText = this.allPhotos.length;
                stats[2].innerText = this.allBalloons.length;
                stats[3].innerText = this.allPosts.length;
                stats[4].innerText = this.allLeetCode.length;
            }
        }

        this.refreshInventory();
    },

    setupLogin() {
        const form = document.getElementById('admin-login-form');
        const secretInput = document.getElementById('admin-secret');
        const capsWarning = document.getElementById('caps-warning');
        const error = document.getElementById('login-error');
        
        if (!form) return;

        // Caps Lock detection
        secretInput.addEventListener('keyup', (event) => {
            if (event.getModifierState('CapsLock')) {
                capsWarning.style.display = 'block';
            } else {
                capsWarning.style.display = 'none';
            }
        });

        secretInput.addEventListener('keydown', (event) => {
            if (event.getModifierState('CapsLock')) {
                capsWarning.style.display = 'block';
            } else {
                capsWarning.style.display = 'none';
            }
        });
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const secret = secretInput.value;
            
            if (secret) {
                error.innerText = 'Checking credentials...';
                
                try {
                    const res = await fetch('/api/feed', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ secret, checkOnly: true })
                    });
                    
                    if (res.ok) {
                        // Store in session
                        sessionStorage.setItem('admin_authenticated', 'true');
                        sessionStorage.setItem('admin_secret', secret);
                        
                        // Update local state and re-render
                        this.isAuthenticated = true;
                        pageManager.loadPage('admin');
                    } else {
                        const data = await res.json();
                        error.innerText = data.error || 'Invalid secret key.';
                    }
                } catch (err) {
                    error.innerText = 'Connection error. Try again.';
                }
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

        const logoutBtn = document.getElementById('admin-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                sessionStorage.removeItem('admin_authenticated');
                sessionStorage.removeItem('admin_secret');
                this.isAuthenticated = false;
                router.navigate('home');
            });
        }
    },

    setupModules() {
        if (this.activeTab === 'books') this.setupBooksLogic();
        if (this.activeTab === 'photos') this.setupPhotosLogic();
        if (this.activeTab === 'posts') this.setupFeedLogic();
        if (this.activeTab === 'leetcode') this.setupLeetCodeLogic();
    },

    setupFeedLogic() {
        const form = document.getElementById('post-form');
        if (!form) return;

        const listItems = document.querySelectorAll('#posts-inventory .inventory-item');
        const newBtn = document.getElementById('btn-new-post');
        const previewContainer = document.getElementById('post-preview-container');

        const updateLivePreview = () => {
            if (!previewContainer) return;

            // Sync with state
            if (!this.editingItem) {
                this.editingItem = { id: null, tags: [] };
            }
            
            this.editingItem.title = document.getElementById('post-title').value;
            this.editingItem.content = document.getElementById('post-content').value;
            this.editingItem.tag = document.getElementById('post-tag').value;

            previewContainer.innerHTML = this.renderPostPreview(this.editingItem);
        };

        ['post-title', 'post-content', 'post-tag'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', updateLivePreview);
                if (el.tagName === 'SELECT') el.addEventListener('change', updateLivePreview);
            }
        });

        if (newBtn) {
            newBtn.addEventListener('click', () => {
                this.editingItem = null;
                pageManager.loadPage('admin');
            });
        }

        listItems.forEach(item => {
            item.addEventListener('click', () => {
                const id = item.dataset.id;
                this.editingItem = this.allPosts.find(p => p.id === id);
                pageManager.loadPage('admin');
            });
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                id: document.getElementById('post-id').value || null,
                title: document.getElementById('post-title').value,
                content: document.getElementById('post-content').value,
                tag: document.getElementById('post-tag').value,
                show_in_feed: document.getElementById('post-show-in-feed').checked,
                is_popular: document.getElementById('post-is-popular').checked,
                show_toc: document.getElementById('post-show-toc').checked,
                secret: sessionStorage.getItem('admin_secret')
            };

            const res = await fetch('/api/feed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert('Post published!');
                this.loadInitialData();
            } else {
                const errData = await res.json();
                alert('Error saving post: ' + (errData.error || 'Unknown error'));
            }
        });
    },

    setupLeetCodeLogic() {
        const form = document.getElementById('lc-form');
        if (!form) return;

        const listItems = document.querySelectorAll('#lc-inventory .inventory-item');
        const newBtn = document.getElementById('btn-new-lc');
        const previewContainer = document.getElementById('lc-preview-container');

        const updateLivePreview = () => {
            if (!previewContainer) return;

             // Sync with state
             if (!this.editingItem) {
                this.editingItem = { id: null };
            }

            this.editingItem.number = document.getElementById('lc-number').value;
            this.editingItem.name = document.getElementById('lc-name').value;
            this.editingItem.content = document.getElementById('lc-content').value;
            this.editingItem.external_link = document.getElementById('lc-link').value;

            previewContainer.innerHTML = this.renderLeetCodePreview(this.editingItem);
        };

        ['lc-number', 'lc-name', 'lc-content'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', updateLivePreview);
        });

        if (newBtn) {
            newBtn.addEventListener('click', () => {
                this.editingItem = null;
                pageManager.loadPage('admin');
            });
        }

        listItems.forEach(item => {
            item.addEventListener('click', () => {
                const id = item.dataset.id;
                this.editingItem = this.allLeetCode.find(l => l.id === id);
                pageManager.loadPage('admin');
            });
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                number: parseInt(document.getElementById('lc-number').value),
                name: document.getElementById('lc-name').value,
                content: document.getElementById('lc-content').value,
                external_link: document.getElementById('lc-link').value,
                secret: sessionStorage.getItem('admin_secret')
            };

            const res = await fetch('/api/leetcode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert('Solution logged!');
                this.loadInitialData();
            } else {
                alert('Error logging solution.');
            }
        });
    },

    setupBooksLogic() {
        const form = document.getElementById('book-form');
        if (!form) return;

        const listItems = document.querySelectorAll('#books-inventory .inventory-item');
        const newBtn = document.getElementById('btn-new-book');
        const previewContainer = document.getElementById('book-preview-container');

        const updateLivePreview = () => {
            if (!previewContainer) return;

            // Sync with state
            if (!this.editingItem) {
                this.editingItem = { id: null, tags: [] };
            }

            this.editingItem.title = document.getElementById('book-title').value;
            this.editingItem.image = document.getElementById('book-image').value;
            this.editingItem.status = document.getElementById('book-status').value;
            this.editingItem.md_link = document.getElementById('book-md').value;
            this.editingItem.tags = document.getElementById('book-tags').value.split(',').map(t => t.trim()).filter(Boolean);

            previewContainer.innerHTML = this.renderBookPreview(this.editingItem);
        };

        // Add input listeners for live preview
        ['book-title', 'book-image', 'book-status', 'book-md', 'book-tags'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', updateLivePreview);
                if (el.tagName === 'SELECT') el.addEventListener('change', updateLivePreview);
            }
        });

        const uploadInput = document.getElementById('book-upload');
        const uploadIcon = document.querySelector('label[for="book-upload"] i');

        if (uploadInput && uploadIcon) {
            uploadInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.isUploading = true;
                    // Update UI manually for better speed/state preservation
                    uploadIcon.className = 'fa-solid fa-spinner fa-spin';
                    
                    try {
                        const url = await this.uploadImage(file, 'book-image', updateLivePreview);
                        if (this.editingItem) this.editingItem.image = url;
                    } finally {
                        this.isUploading = false;
                        uploadIcon.className = 'fa-solid fa-cloud-arrow-up';
                    }
                }
            });
        }

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
                show_in_feed: document.getElementById('book-show-in-feed').checked,
                secret: sessionStorage.getItem('admin_secret')
            };

            const res = await fetch('/api/books', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert('Book saved!');
                this.loadInitialData();
            } else {
                const errData = await res.json();
                alert('Error saving book: ' + (errData.error || 'Unknown error'));
            }
        });
    },

    setupGuidesLogic() {
        const form = document.getElementById('guide-form');
        if (!form) return;

        const listItems = document.querySelectorAll('#guides-inventory .inventory-item');
        const newBtn = document.getElementById('btn-new-guide');
        const previewContainer = document.getElementById('guide-preview-container');

        const updateLivePreview = () => {
            if (!previewContainer) return;
            const content = document.getElementById('guide-content').value;
            const title = document.getElementById('guide-title').value;
            previewContainer.innerHTML = this.renderPostPreview({ title, content });
        };

        ['guide-title', 'guide-content'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', updateLivePreview);
        });

        if (newBtn) {
            newBtn.addEventListener('click', () => {
                this.editingItem = null;
                pageManager.loadPage('admin');
            });
        }

        listItems.forEach(item => {
            item.addEventListener('click', () => {
                const id = item.dataset.id;
                this.editingItem = this.allPosts.find(p => p.id === id);
                pageManager.loadPage('admin');
            });
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                id: document.getElementById('guide-id').value || null,
                title: document.getElementById('guide-title').value,
                content: document.getElementById('guide-content').value,
                tag: 'Guides', // Force Guides tag
                show_in_feed: document.getElementById('guide-show-in-feed').checked,
                is_popular: document.getElementById('guide-is-popular').checked,
                show_toc: document.getElementById('guide-show-toc').checked,
                secret: sessionStorage.getItem('admin_secret')
            };

            const res = await fetch('/api/feed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert('Guide saved!');
                this.loadInitialData();
            } else {
                const errData = await res.json();
                alert('Error saving guide: ' + (errData.error || 'Unknown error'));
            }
        });
    },

    setupPhotosLogic() {
        const form = document.getElementById('photo-form');
        if (!form) return;

        const gridItems = document.querySelectorAll('#photos-inventory .grid-item');
        const newBtn = document.getElementById('btn-new-photo');
        const previewContainer = document.getElementById('photo-preview-container');

        const updateLivePreview = () => {
            if (!previewContainer) return;

            // Sync with state
            if (!this.editingItem) {
                this.editingItem = { id: null };
            }

            this.editingItem.image = document.getElementById('photo-image').value;
            this.editingItem.description = document.getElementById('photo-desc').value;
            this.editingItem.link = document.getElementById('photo-link').value;

            previewContainer.innerHTML = this.renderPhotoPreview(this.editingItem);
        };

        // Add input listeners for live preview
        ['photo-image', 'photo-desc', 'photo-link'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', updateLivePreview);
        });

        const uploadInput = document.getElementById('photo-upload');
        const uploadIcon = document.querySelector('label[for="photo-upload"] i');

        if (uploadInput && uploadIcon) {
            uploadInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.isUploading = true;
                    // Update UI manually
                    uploadIcon.className = 'fa-solid fa-spinner fa-spin';

                    try {
                        const url = await this.uploadImage(file, 'photo-image', updateLivePreview);
                        if (this.editingItem) this.editingItem.image = url;
                    } finally {
                        this.isUploading = false;
                        uploadIcon.className = 'fa-solid fa-cloud-arrow-up';
                    }
                }
            });
        }

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
                show_in_feed: document.getElementById('photo-show-in-feed').checked,
                secret: sessionStorage.getItem('admin_secret')
            };

            const res = await fetch('/api/photos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert('Photo saved!');
                this.loadInitialData();
            } else {
                const errData = await res.json();
                alert('Error saving photo: ' + (errData.error || 'Unknown error'));
            }
        });
    },

    refreshInventory() {
        // This is a bit hacky in this simple PageManager, 
        // usually would use an observable or partial re-render.
        // For now, onMount handles the initial load.
    },

    async uploadImage(file, targetInputId, previewCallback) {
        if (!file) return;
        
        const secret = sessionStorage.getItem('admin_secret');
        const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
        
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64Data = reader.result.split(',')[1];
                
                try {
                    const res = await fetch('/api/upload', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            fileName,
                            fileData: base64Data,
                            contentType: file.type,
                            secret
                        })
                    });
                    
                    const data = await res.json();
                    if (data.success) {
                        const input = document.getElementById(targetInputId);
                        if (input) {
                            input.value = data.url;
                            if (previewCallback) previewCallback();
                        }
                        resolve(data.url);
                    } else {
                        throw new Error(data.error);
                    }
                } catch (error) {
                    alert('Upload failed: ' + error.message);
                    reject(error);
                }
            };
            reader.onerror = reject;
        });
    }
};

window.AdminPage = AdminPage;
