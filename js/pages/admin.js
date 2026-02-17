/**
 * Admin Page Component
 * Centralized dashboard for managing books, photos, and other site content.
 */
const AdminPage = {
    isAuthenticated: false,
    isVerifying: false,
    activeTab: 'overview',
    activePostFilter: 'all', // New state for filtering
    allBooks: [],
    allPhotos: [],
    allPosts: [],
    allLeetCode: [],
    allBalloons: [],
    allMonitoredRepos: [],
    editingItem: null,
    isUploading: false,
    isEditingPost: false,
    isPreviewMode: false,
    autoSaveInterval: null,

    async render() {
        if (this.isVerifying) {
            return `
                <div class="admin-login-container">
                    <div class="card login-card" style="text-align: center; padding: 40px;">
                        <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 2rem; color: var(--accent-blue); margin-bottom: 20px;"></i>
                        <h2 style="font-family: 'Sora', sans-serif;">🔒 Verifying Security...</h2>
                        <p style="color: var(--text-muted); margin-top: 10px;">Establishing secure handshake with the server.</p>
                    </div>
                </div>
            `;
        }

        if (!this.isAuthenticated) {
            return this.renderLogin();
        }

        if (this.isEditingPost) {
            return this.renderPostEditor();
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
                            <button class="admin-nav-item ${this.activeTab === 'tabnews' ? 'active' : ''}" data-tab="tabnews">
                                <i class="fa-solid fa-newspaper"></i> TabNews
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
                return this.isEditingPost ? this.renderPostEditor() : this.renderFeedModule();
            case 'guides':
                return this.renderGuidesModule();
            case 'leetcode':
                return this.renderLeetCodeModule();
            case 'tabnews':
                return this.renderTabNewsManager();
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
            <div class="photo-card-preview" style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column;">
                <img src="${photo.image || ''}" style="width: 100%; object-fit: contain; max-height: 400px; background: rgba(0,0,0,0.2);">
                <div style="padding: 15px;">
                    <h4 style="margin: 0 0 5px 0; font-family: 'Sora', sans-serif;">${photo.title || 'Untitled Photo'}</h4>
                    <p style="margin: 0; font-size: 0.85rem; line-height: 1.4; color: var(--text-muted);">${photo.description || 'No description provided.'}</p>
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
                        <div class="form-group" style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                            <input type="checkbox" id="book-is-special" ${this.editingItem?.is_special === true ? 'checked' : ''} style="width: auto;">
                            <label for="book-is-special" style="margin-bottom: 0;">Mark as Special Recommendation</label>
                        </div>
                        <div class="form-group">
                            <label>Review Content (Markdown)</label>
                            <textarea id="book-content" style="height: 200px; font-family: monospace;">${this.editingItem?.content || ''}</textarea>
                        </div>
                        <div class="form-group" style="display: flex; align-items: center; gap: 10px;">
                            <input type="checkbox" id="book-show-in-feed" ${this.editingItem?.show_in_feed !== false ? 'checked' : ''} style="width: auto;">
                            <label for="book-show-in-feed" style="margin-bottom: 0;">Show in Public Feed</label>
                        </div>
                        <div style="display: flex; gap: 10px; margin-top: 20px;">
                            <button type="submit" class="btn-save" style="flex: 1;">Save Book</button>
                            ${this.editingItem?.id ? `<button type="button" class="btn-delete" id="btn-delete-book" style="background: var(--accent-red); color: white; border: none; padding: 10px 15px; border-radius: 8px; cursor: pointer;">Delete</button>` : ''}
                        </div>
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

        let htmlContent = '';
        try {
            if (typeof marked !== 'undefined') {
                htmlContent = marked.parse(post.content || '');
            } else {
                htmlContent = (post.content || '').replace(/\n/g, '<br>');
            }
        } catch (e) {
            htmlContent = post.content || '';
        }

        return `
            <div class="detail-card organic-detail" style="padding: 0; background: transparent; border: none; box-shadow: none;">
                <div class="detail-header">
                    <h1 class="detail-title">${post.title || 'Post Title'}</h1>
                    <div class="detail-date">${(() => {
                try {
                    const d = new Date(post.date || new Date());
                    return isNaN(d) ? post.date : d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
                } catch (e) { return post.date || ''; }
            })()} • <span style="color: var(--accent-blue)">${post.tag || 'Thoughts'}</span></div>
                </div>

                ${post.image ? `
                    <div class="detail-image-container" style="margin-bottom: 2rem; border-radius: 12px; overflow: hidden; border: 1px solid var(--border-color); background: rgba(0,0,0,0.2);">
                        <img src="${post.image}" alt="${post.title}" style="width: 100%; height: auto; display: block; object-fit: contain; max-height: 70vh;">
                    </div>
                ` : ''}
                
                <div class="markdown-content">
                    ${htmlContent || '<p style="color: grey;">Start writing to see the preview...</p>'}
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
                    <div class="header-actions">
                        <select id="feed-filter-select" style="padding: 8px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--card-bg); color: var(--text-color); margin-right: 10px;">
                            <option value="all" ${this.activePostFilter === 'all' ? 'selected' : ''}>All Posts</option>
                            <option value="Thoughts" ${this.activePostFilter === 'Thoughts' ? 'selected' : ''}>Thoughts</option>
                            <option value="TabNews" ${this.activePostFilter === 'TabNews' ? 'selected' : ''}>TabNews</option>
                            <option value="Guides" ${this.activePostFilter === 'Guides' ? 'selected' : ''}>Guides</option>
                            <option value="LeetCode" ${this.activePostFilter === 'LeetCode' ? 'selected' : ''}>LeetCode</option>
                            <option value="Updates" ${this.activePostFilter === 'Updates' ? 'selected' : ''}>Updates</option>
                        </select>
                        <button class="btn-action secondary" id="btn-sync-tabnews">
                            <i class="fa-solid fa-sync"></i> Sync TabNews
                        </button>
                        <button class="btn-action primary" id="btn-new-post">
                            <i class="fa-solid fa-plus"></i> New Post
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="admin-inventory-full">
                <div class="inventory-list-header">
                    <span>Title</span>
                    <span>Tag</span>
                    <span>Date</span>
                    <span>Status</span>
                </div>
                <div class="inventory-list" id="posts-inventory-full">
                    ${(() => {
                let filtered = this.allPosts;
                if (this.activePostFilter !== 'all') {
                    filtered = filtered.filter(p => p.tag === this.activePostFilter);
                }

                return filtered.length > 0 ? filtered.map(p => `
                        <div class="inventory-item-row" data-id="${p.id}">
                            <span class="item-title">
                                ${p.title}
                                ${p.tag === 'TabNews' ? '<span class="badge-tabnews-inline">TabNews</span>' : ''}
                            </span>
                            <span class="item-tag">${p.tag}</span>
                            <span class="item-date">${new Date(p.date).toLocaleDateString()}</span>
                            <span class="item-visibility">${p.show_in_feed !== false ? 'Public' : 'Hidden'}</span>
                        </div>
                    `).join('') : '<p style="padding: 20px; color: grey; text-align: center;">No posts found for this filter.</p>';
            })()}
                </div>
            </div>
        `;
    },

    renderPostEditor() {
        const post = this.editingItem || { title: '', content: '', tag: 'Thoughts', image: '', show_in_feed: true, is_popular: false, show_toc: false };

        return `
            <div class="admin-editor-shell">
                <header class="editor-header">
                    <div class="editor-header-left">
                        <button class="btn-back" id="btn-editor-back" title="Discard and Exit">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                        <div class="editor-title-container">
                            <h2>${this.editingItem ? 'Editing Article' : 'New Article'}</h2>
                            <span id="autosave-status" class="autosave-status">
                                <i class="fa-solid fa-cloud-check"></i> Draft ready
                            </span>
                        </div>
                    </div>

                    <div class="editor-header-actions">
                        <button class="btn-preview-toggle ${this.isPreviewMode ? 'active' : ''}" id="btn-preview-toggle">
                            <i class="fa-solid ${this.isPreviewMode ? 'fa-eye' : 'fa-laptop-code'}"></i> 
                            <span>${this.isPreviewMode ? 'Switch to Editor' : 'Switch to Preview'}</span>
                        </button>
                        <div class="divider-v"></div>
                        <button class="btn-save-final" id="btn-publish-post">
                            <i class="fa-solid fa-paper-plane"></i> Publish
                        </button>
                        ${this.editingItem?.id ? `
                            <button class="btn-delete-editor" id="btn-delete-post-editor" title="Delete Post">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        ` : ''}
                    </div>
                </header>

                <div class="editor-container ${this.isPreviewMode ? 'preview-active' : ''}">
                    <!-- Main Form / Editor -->
                    <div class="editor-main-lane">
                        <div class="editor-content-scroller">
                            <div class="editor-form-grid">
                                <div class="form-group full-width">
                                    <label>Article Title</label>
                                    <input type="text" id="post-title" class="input-title-large" value="${post.title}" placeholder="Enter an engaging title..." required>
                                </div>
                                
                                <div class="form-group">
                                    <label>Category / Tag</label>
                                    <select id="post-tag">
                                        <option value="Thoughts" ${post.tag === 'Thoughts' ? 'selected' : ''}>Thoughts</option>
                                        <option value="Updates" ${post.tag === 'Updates' ? 'selected' : ''}>Updates</option>
                                        <option value="Guides" ${post.tag === 'Guides' ? 'selected' : ''}>Guides</option>
                                        <option value="Study Notes" ${post.tag === 'Study Notes' ? 'selected' : ''}>Study Notes</option>
                                        <option value="LeetCode" ${post.tag === 'LeetCode' ? 'selected' : ''}>LeetCode</option>
                                        <option value="Book Review" ${post.tag === 'Book Review' ? 'selected' : ''}>Book Review</option>
                                        <option value="Release" ${post.tag === 'Release' ? 'selected' : ''}>Release</option>
                                    </select>
                                </div>

                                <div class="form-group">
                                    <label>Cover Image URL</label>
                                    <div class="upload-row">
                                        <input type="url" id="post-image" value="${post.image || ''}" placeholder="https://unsplash.com/...">
                                        <label for="post-image-upload" class="btn-upload-label" title="Upload Cover">
                                            <i class="fa-solid ${this.isUploading ? 'fa-spinner fa-spin' : 'fa-cloud-arrow-up'}"></i>
                                            <input type="file" id="post-image-upload" accept="image/*" style="display: none;">
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div class="editor-textarea-wrapper">
                                <label>Content (Markdown)</label>
                                <textarea id="post-content" class="editor-textarea" placeholder="Start writing your masterpiece here... Support for bold, lists, code blocks, etc.">${post.content || ''}</textarea>
                            </div>

                            <div class="editor-settings-row">
                                <div class="form-group checkbox-group">
                                    <input type="checkbox" id="post-show-in-feed" ${post.show_in_feed !== false ? 'checked' : ''}>
                                    <label for="post-show-in-feed">Public Feed</label>
                                </div>
                                <div class="form-group checkbox-group">
                                    <input type="checkbox" id="post-is-popular" ${post.is_popular === true ? 'checked' : ''}>
                                    <label for="post-is-popular">Popular Content</label>
                                </div>
                                <div class="form-group checkbox-group">
                                    <input type="checkbox" id="post-show-toc" ${post.show_toc === true ? 'checked' : ''}>
                                    <label for="post-show-toc">Show TOC</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Live Preview Panel -->
                    <div class="editor-preview-lane">
                        <div class="preview-content-scroller">
                            <div id="post-preview-container">
                                ${this.renderPostPreview(post)}
                            </div>
                        </div>
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
                            <label>Title</label>
                            <input type="text" id="photo-title" value="${this.editingItem?.title || ''}" placeholder="E.g. Belém - PA">
                        </div>
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
                            <textarea id="photo-desc" style="height: 100px;">${this.editingItem?.description || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label>Link (Optional)</label>
                            <input type="url" id="photo-link" value="${this.editingItem?.link || ''}" placeholder="External link?">
                        </div>
                        <div class="form-group" style="display: flex; align-items: center; gap: 10px;">
                            <input type="checkbox" id="photo-show-in-feed" ${this.editingItem?.show_in_feed !== false ? 'checked' : ''} style="width: auto;">
                            <label for="photo-show-in-feed" style="margin-bottom: 0;">Show in Public Feed</label>
                        </div>
                        <div style="display: flex; gap: 10px; margin-top: 20px;">
                            <button type="submit" class="btn-save" style="flex: 1;">Save Photo</button>
                            ${this.editingItem?.id ? `<button type="button" class="btn-delete" id="btn-delete-photo" style="background: var(--accent-red); color: white; border: none; padding: 10px 15px; border-radius: 8px; cursor: pointer;">Delete</button>` : ''}
                        </div>
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
                        <button id="btn-sync-github" class="btn-action primary">
                            <i class="fa-solid fa-sync"></i> Sync GitHub
                        </button>
                        <a href="balloons-preview.html" target="_blank" class="btn-action secondary">
                            <i class="fa-solid fa-arrow-up-right-from-square"></i> Open Preview
                        </a>
                    </div>
                </div>
                <p>Balloons are dynamically generated from GitHub and LeetCode activity.</p>
            </div>

            <div class="admin-grid">
                <div class="admin-card">
                    <h3>Monitored Repositories</h3>
                    <p class="card-subtitle">Release notes will be pulled from these repos.</p>
                    
                    <div class="repo-form-mini">
                        <input type="text" id="repo-input" placeholder="owner/repo (ex: GabrielBaiano/shii-app)">
                        <button id="btn-add-repo" class="btn-add-mini"><i class="fa-solid fa-plus"></i></button>
                    </div>

                    <div class="monitored-repos-list">
                        ${this.allMonitoredRepos.length > 0 ? this.allMonitoredRepos.map(r => `
                            <div class="repo-item-admin">
                                <i class="fa-brands fa-github"></i>
                                <span>${r.repo_full_name}</span>
                                <button class="btn-delete-repo" data-id="${r.id}"><i class="fa-solid fa-trash"></i></button>
                            </div>
                        `).join('') : '<p class="empty-state">No repos monitored yet.</p>'}
                    </div>
                </div>

                <div class="admin-card">
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
                        `).join('') : '<p class="empty-state">No active balloons in the last 7 days.</p>'}
                    </div>
                </div>
            </div>
        `;
    },

    renderTabNewsManager() {
        const tabNewsPosts = this.allPosts.filter(p => p.tag === 'TabNews');

        return `
            <div class="admin-tab-header">
                <div class="header-main">
                    <h1>TabNews Manager</h1>
                    <div class="header-actions">
                         <button class="btn-action secondary" id="btn-sync-all-tabnews">
                            <i class="fa-solid fa-sync"></i> Sync All
                        </button>
                    </div>
                </div>
                <p>Manage visibility and translations for TabNews content.</p>
            </div>

            <div class="admin-inventory-full">
                <div class="inventory-list-header" style="grid-template-columns: 2fr 1fr 1fr 1fr 1fr;">
                    <span>Title</span>
                    <span>Date</span>
                    <span>Translation</span>
                    <span>Visibility</span>
                    <span>Actions</span>
                </div>
                <div class="inventory-list" id="tabnews-inventory">
                    ${tabNewsPosts.length > 0 ? tabNewsPosts.map(p => {
            const isTranslated = p.title_en && p.content_en;
            return `
                        <div class="inventory-item-row" style="grid-template-columns: 2fr 1fr 1fr 1fr 1fr; cursor: default;">
                            <span class="item-title" title="${p.title}">
                                ${p.title}
                                <a href="${p.source_url}" target="_blank" style="margin-left:5px; color: var(--accent-blue);"><i class="fa-solid fa-external-link-alt"></i></a>
                            </span>
                            <span class="item-date">${new Date(p.date).toLocaleDateString()}</span>
                            <span class="item-status">
                                ${isTranslated
                    ? '<span class="badge-success" style="color: #4CAF50; font-size: 0.8rem;"><i class="fa-solid fa-check"></i> EN Ready</span>'
                    : '<span class="badge-warning" style="color: #FF9800; font-size: 0.8rem;"><i class="fa-solid fa-triangle-exclamation"></i> PT Only</span>'}
                            </span>
                            <span class="item-visibility">
                                <label class="switch-toggle" style="position: relative; display: inline-block; width: 40px; height: 20px;">
                                    <input type="checkbox" class="toggle-visibility-btn" data-id="${p.id}" ${p.show_in_feed !== false ? 'checked' : ''} style="opacity: 0; width: 0; height: 0;">
                                    <span class="slider round" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 20px;"></span>
                                </label>
                            </span>
                            <span class="item-actions">
                                <button class="btn-action-mini btn-translate-single" data-slug="${p.external_id}" title="Force Translate" style="background: var(--accent-blue); color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">
                                    <i class="fa-solid fa-language"></i> Translate
                                </button>
                            </span>
                        </div>
                        `;
        }).join('') : '<p class="empty-state" style="padding: 20px; text-align: center; color: grey;">No TabNews posts found. Try syncing first.</p>'}
                </div>
            </div>
            <style>
                .switch-toggle input:checked + .slider { background-color: var(--accent-blue); }
                .switch-toggle input:checked + .slider:before { transform: translateX(20px); }
                .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 2px; bottom: 2px; background-color: white; transition: .4s; border-radius: 50%; }
            </style>
        `;
    },

    setupTabNewsLogic() {
        // Sync All
        const syncBtn = document.getElementById('btn-sync-all-tabnews');
        if (syncBtn) {
            syncBtn.addEventListener('click', async () => {
                const secret = sessionStorage.getItem('admin_secret');
                syncBtn.disabled = true;
                syncBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Syncing...';
                try {
                    const res = await fetch(`/api/sync-tabnews?secret=${secret}`);
                    const data = await res.json();
                    if (res.ok && data.success) {
                        const { synced, translationsSuccessful, safetyFailures } = data.results;
                        alert(`Sync Complete!\nFound: ${synced}\nTranslated: ${translationsSuccessful}\nSafety Blocks: ${safetyFailures}`);
                        this.loadInitialData();
                    } else {
                        alert('Sync failed: ' + (data.error || 'Unknown error'));
                    }
                } catch (e) {
                    alert('Error during sync.');
                } finally {
                    syncBtn.disabled = false;
                    syncBtn.innerHTML = '<i class="fa-solid fa-sync"></i> Sync All';
                }
            });
        }

        // Visibility Toggles
        const toggles = document.querySelectorAll('.toggle-visibility-btn');
        toggles.forEach(toggle => {
            toggle.addEventListener('change', async (e) => {
                const id = e.target.dataset.id;
                const showInFeed = e.target.checked;
                const secret = sessionStorage.getItem('admin_secret');

                const post = this.allPosts.find(p => p.id === id);
                if (!post) return;

                // We need to send a valid update payload. 
                // Since api/feed POST is an UPSERT, we need minimal required fields + changed field.
                // However, the current implementation might require more fields.
                // Let's rely on standard fields.
                const payload = {
                    id: post.id,
                    title: post.title,
                    content: post.content, // We might need to fetch full content if it is not in list? 
                    // Wait, this.allPosts usually has content.
                    tag: post.tag,
                    date: post.date,
                    image: post.image,
                    show_in_feed: showInFeed,
                    secret
                };

                try {
                    const res = await fetch('/api/feed', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    if (!res.ok) {
                        e.target.checked = !showInFeed;
                        alert('Failed to update visibility.');
                    } else {
                        post.show_in_feed = showInFeed;
                    }
                } catch (err) {
                    e.target.checked = !showInFeed;
                    alert('Connection error.');
                }
            });
        });

        // Translate Single
        const translateBtns = document.querySelectorAll('.btn-translate-single');
        translateBtns.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const slug = btn.dataset.slug;
                const secret = sessionStorage.getItem('admin_secret');

                if (!confirm(`Force re-translation for this post?`)) return;

                btn.disabled = true;
                const originalHtml = btn.innerHTML;
                btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

                try {
                    const res = await fetch(`/api/sync-tabnews?secret=${secret}&slug=${slug}&force=true`);
                    const data = await res.json();

                    if (res.ok && data.success) {
                        alert(`Translation Success!\nNew translations: ${data.results.translationsSuccessful}`);
                        this.loadInitialData();
                    } else {
                        alert('Translation failed: ' + (data.error || 'Unknown error'));
                    }
                } catch (err) {
                    alert('Error requesting translation.');
                } finally {
                    btn.disabled = false;
                    btn.innerHTML = originalHtml;
                }
            });
        });
    },

    onMount() {
        // If already authenticated in current session object, just init modules
        if (this.isAuthenticated) {
            this.setupNavigation();
            this.setupModules();
            this.loadInitialData();
            return;
        }

        // Try Auto-login from sessionStorage
        const savedSecret = sessionStorage.getItem('admin_secret');
        if (savedSecret && !this.isVerifying) {
            this.verifyAndLogin(savedSecret);
        } else if (!this.isVerifying) {
            this.setupLogin();
        }
    },

    async verifyAndLogin(secret) {
        this.isVerifying = true;
        pageManager.loadPage('admin'); // Trigger render state

        try {
            const res = await fetch('/api/feed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ secret, checkOnly: true })
            });

            if (res.ok) {
                this.isAuthenticated = true;
                sessionStorage.setItem('admin_authenticated', 'true');
                sessionStorage.setItem('admin_secret', secret);
            } else {
                this.isAuthenticated = false;
                sessionStorage.removeItem('admin_authenticated');
                sessionStorage.removeItem('admin_secret');
            }
        } catch (err) {
            console.error('Session verification failed:', err);
            this.isAuthenticated = false;
        } finally {
            this.isVerifying = false;
            pageManager.loadPage('admin'); // Transition to final state (Dashboard or Login)
        }
    },

    async loadInitialData() {
        const secret = sessionStorage.getItem('admin_secret');
        const ts = Date.now(); // Cache buster
        const [books, photos, balloons, posts, leetcode, repos] = await Promise.all([
            fetch(`/api/books?secret=${secret}&_t=${ts}`).then(r => r.json()).catch(() => ({ data: [] })),
            fetch(`/api/photos?secret=${secret}&_t=${ts}`).then(r => r.json()).catch(() => ({ data: [] })),
            fetch(`/api/balloons?context=all&secret=${secret}&_t=${ts}`).then(r => r.json()).catch(() => ({ data: [] })),
            fetch(`/api/feed?secret=${secret}&_t=${ts}`).then(r => r.json()).catch(() => ({ data: [] })),
            fetch(`/api/leetcode?secret=${secret}&_t=${ts}`).then(r => r.json()).catch(() => ({ data: [] })),
            fetch(`/api/balloons?update=list&secret=${secret}&_t=${ts}`).then(r => r.json()).catch(() => ({ data: [] }))
        ]);

        this.allBooks = books.data || [];
        this.allPhotos = (photos.data || []).map(p => ({
            id: p.id,
            image: p.image_url,
            title: p.title,
            description: p.description,
            link: p.link
        }));
        this.allBalloons = balloons.data || [];
        this.allPosts = posts.data || [];
        this.allLeetCode = leetcode.data || [];
        this.allMonitoredRepos = repos.data || [];

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
        if (this.activeTab === 'guides') this.setupGuidesLogic();
        if (this.activeTab === 'balloons') this.setupBalloonsLogic();
        if (this.activeTab === 'tabnews') this.setupTabNewsLogic();
    },

    setupFeedLogic() {
        if (!this.isEditingPost) {
            // List View Logic
            const listItems = document.querySelectorAll('#posts-inventory-full .inventory-item-row');
            const newBtn = document.getElementById('btn-new-post');

            if (newBtn) {
                newBtn.addEventListener('click', () => {
                    this.editingItem = null;
                    this.isEditingPost = true;
                    this.isPreviewMode = false;
                    pageManager.loadPage('admin');
                });
            }

            const filterSelect = document.getElementById('feed-filter-select');
            if (filterSelect) {
                filterSelect.addEventListener('change', (e) => {
                    this.activePostFilter = e.target.value;
                    pageManager.loadPage('admin');
                });
            }

            listItems.forEach(item => {
                item.addEventListener('click', () => {
                    const id = item.dataset.id;
                    this.editingItem = this.allPosts.find(p => p.id === id);
                    this.isEditingPost = true;
                    this.isPreviewMode = false;
                    pageManager.loadPage('admin');
                });
            });
        } else {
            // Editor View Logic
            const backBtn = document.getElementById('btn-editor-back');
            const previewToggle = document.getElementById('btn-preview-toggle');
            const publishBtn = document.getElementById('btn-publish-post');
            const deleteBtn = document.getElementById('btn-delete-post-editor');
            const uploadInput = document.getElementById('post-image-upload');
            const uploadIcon = document.querySelector('label[for="post-image-upload"] i');

            const titleInput = document.getElementById('post-title');
            const contentInput = document.getElementById('post-content');
            const tagSelect = document.getElementById('post-tag');
            const imageInput = document.getElementById('post-image');
            const previewContainer = document.getElementById('post-preview-container');

            const updateLivePreview = () => {
                if (!previewContainer) return;

                const currentData = {
                    title: titleInput.value,
                    content: contentInput.value,
                    tag: tagSelect.value,
                    image: imageInput.value,
                    date: this.editingItem?.date || new Date().toISOString()
                };

                previewContainer.innerHTML = this.renderPostPreview(currentData);
                this.saveDraftToLocalStorage(currentData);
            };

            [titleInput, contentInput, imageInput].forEach(el => {
                if (el) el.addEventListener('input', updateLivePreview);
            });
            if (tagSelect) tagSelect.addEventListener('change', updateLivePreview);

            if (backBtn) {
                backBtn.addEventListener('click', () => {
                    if (confirm('Leave editor? Any unsaved changes in the database will be lost (draft is still local).')) {
                        this.isEditingPost = false;
                        this.isPreviewMode = false;
                        this.stopAutoSave();
                        pageManager.loadPage('admin');
                    }
                });
            }

            if (previewToggle) {
                previewToggle.addEventListener('click', () => {
                    this.isPreviewMode = !this.isPreviewMode;
                    pageManager.loadPage('admin');
                });
            }

            if (uploadInput && uploadIcon) {
                uploadInput.addEventListener('change', async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        this.isUploading = true;
                        uploadIcon.className = 'fa-solid fa-spinner fa-spin';
                        try {
                            const url = await this.uploadImage(file, 'post-image', updateLivePreview);
                            if (this.editingItem) this.editingItem.image = url;
                        } finally {
                            this.isUploading = false;
                            uploadIcon.className = 'fa-solid fa-cloud-arrow-up';
                        }
                    }
                });
            }

            if (publishBtn) {
                publishBtn.addEventListener('click', async () => {
                    const payload = {
                        id: this.editingItem?.id || null,
                        title: titleInput.value,
                        content: contentInput.value,
                        tag: tagSelect.value,
                        image: imageInput.value,
                        show_in_feed: document.getElementById('post-show-in-feed').checked,
                        is_popular: document.getElementById('post-is-popular').checked,
                        show_toc: document.getElementById('post-show-toc').checked,
                        secret: sessionStorage.getItem('admin_secret')
                    };

                    publishBtn.disabled = true;
                    publishBtn.innerText = 'Publishing...';

                    try {
                        const res = await fetch('/api/feed', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                        });

                        if (res.ok) {
                            alert('Post published successfully!');
                            localStorage.removeItem('admin_post_draft');
                            this.isEditingPost = false;
                            this.editingItem = null;
                            this.loadInitialData();
                        } else {
                            const errData = await res.json();
                            alert('Error: ' + (errData.error || 'Failed to publish'));
                        }
                    } finally {
                        publishBtn.disabled = false;
                        publishBtn.innerText = 'Publish';
                    }
                });
            }

            if (deleteBtn) {
                deleteBtn.addEventListener('click', async () => {
                    if (!confirm('Permanently delete this article?')) return;

                    const secret = sessionStorage.getItem('admin_secret');
                    const id = this.editingItem.id;

                    const res = await fetch('/api/feed', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id, secret })
                    });

                    if (res.ok) {
                        alert('Deleted.');
                        this.isEditingPost = false;
                        this.editingItem = null;
                        this.loadInitialData();
                    } else {
                        alert('Delete failed.');
                    }
                });
            }

            this.startAutoSave();
            this.loadDraftFromLocalStorage();
        }

        // TabNews Sync Button
        const syncTabNewsBtn = document.getElementById('btn-sync-tabnews');
        if (syncTabNewsBtn) {
            syncTabNewsBtn.addEventListener('click', async () => {
                const secret = sessionStorage.getItem('admin_secret');
                syncTabNewsBtn.disabled = true;
                syncTabNewsBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Syncing...';

                try {
                    const res = await fetch(`/api/sync-tabnews?secret=${secret}`);
                    const data = await res.json();
                    if (res.ok && data.success) {
                        const { synced, skipped, errors, lastError } = data.results;
                        let msg = `TabNews Sync complete!\nSynced: ${synced}\nSkipped: ${skipped}\nErrors: ${errors}`;
                        if (errors > 0 && lastError) {
                            msg += `\n\nLast Error: ${lastError}`;
                        }
                        alert(msg);
                        this.loadInitialData();
                    } else {
                        alert('Sync failed: ' + (data.error || 'Unknown error'));
                    }
                } catch (e) {
                    alert('Error during sync.');
                } finally {
                    syncTabNewsBtn.disabled = false;
                    syncTabNewsBtn.innerHTML = '<i class="fa-solid fa-sync"></i> Sync TabNews';
                }
            });
        }
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
                is_special: document.getElementById('book-is-special').checked,
                content: document.getElementById('book-content').value,
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

        const deleteBtn = document.getElementById('btn-delete-book');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', async () => {
                if (!confirm('Are you sure you want to delete this book? This will also remove Github assets.')) return;

                const secret = sessionStorage.getItem('admin_secret');
                const id = document.getElementById('book-id').value;

                const res = await fetch('/api/books', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, secret })
                });

                if (res.ok) {
                    alert('Book deleted!');
                    this.editingItem = null;
                    this.loadInitialData();
                } else {
                    alert('Delete failed.');
                }
            });
        }
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

            this.editingItem.title = document.getElementById('photo-title').value;
            this.editingItem.image = document.getElementById('photo-image').value;
            this.editingItem.description = document.getElementById('photo-desc').value;
            this.editingItem.link = document.getElementById('photo-link').value;

            previewContainer.innerHTML = this.renderPhotoPreview(this.editingItem);
        };

        // Add input listeners for live preview
        ['photo-title', 'photo-image', 'photo-desc', 'photo-link'].forEach(id => {
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
                title: document.getElementById('photo-title').value,
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
                console.error('Upload failed:', errData);
                alert('Error saving photo: ' + (errData.error || 'Unknown error'));
            }
        });

        const deleteBtn = document.getElementById('btn-delete-photo');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', async () => {
                if (!confirm('Are you sure you want to delete this photo?')) return;

                const secret = sessionStorage.getItem('admin_secret');
                const id = document.getElementById('photo-id').value;

                const res = await fetch('/api/photos', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, secret })
                });

                if (res.ok) {
                    alert('Photo deleted!');
                    this.editingItem = null;
                    this.loadInitialData();
                } else {
                    alert('Delete failed.');
                }
            });
        }
    },

    setupBalloonsLogic() {
        // Sync Button
        const syncBtn = document.getElementById('btn-sync-github');
        if (syncBtn) {
            syncBtn.addEventListener('click', async () => {
                const secret = sessionStorage.getItem('admin_secret');
                syncBtn.disabled = true;
                syncBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Syncing...';

                try {
                    const res = await fetch(`/api/balloons?update=true&secret=${secret}`);
                    if (res.ok) {
                        alert('GitHub Sync complete! New releases cached.');
                        this.loadInitialData();
                    } else {
                        alert('Sync failed.');
                    }
                } catch (e) {
                    alert('Error during sync.');
                } finally {
                    syncBtn.disabled = false;
                    syncBtn.innerHTML = '<i class="fa-solid fa-sync"></i> Sync GitHub';
                }
            });
        }

        // Add Repo
        const addBtn = document.getElementById('btn-add-repo');
        const repoInput = document.getElementById('repo-input');
        if (addBtn && repoInput) {
            addBtn.addEventListener('click', async () => {
                const repo = repoInput.value.trim();
                const secret = sessionStorage.getItem('admin_secret');
                if (!repo || !repo.includes('/')) return alert('Use format: owner/repo');

                try {
                    const res = await fetch('/api/balloons', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'add', repo, secret })
                    });
                    if (res.ok) {
                        repoInput.value = '';
                        this.loadInitialData();
                    } else {
                        alert('Add failed.');
                    }
                } catch (e) { alert('Error adding repo.'); }
            });
        }

        // Delete Repo Buttons
        document.querySelectorAll('.btn-delete-repo').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                const secret = sessionStorage.getItem('admin_secret');
                if (!confirm('Stop monitoring this repo?')) return;

                try {
                    const res = await fetch('/api/balloons', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'remove', id, secret })
                    });
                    if (res.ok) {
                        this.loadInitialData();
                    } else {
                        alert('Delete failed.');
                    }
                } catch (e) { alert('Error deleting repo.'); }
            });
        });
    },

    refreshInventory() {
        // This is a bit hacky in this simple PageManager, 
        // usually would use an observable or partial re-render.
        // For now, onMount handles the initial load.
    },

    saveDraftToLocalStorage(data) {
        localStorage.setItem('admin_post_draft', JSON.stringify({
            ...data,
            lastSaved: new Date().getTime(),
            editingId: this.editingItem?.id || null
        }));

        const status = document.getElementById('autosave-status');
        if (status) {
            status.innerText = 'Draft saved locally at ' + new Date().toLocaleTimeString();
            status.classList.add('saved');
            setTimeout(() => status.classList.remove('saved'), 2000);
        }
    },

    loadDraftFromLocalStorage() {
        const draftJson = localStorage.getItem('admin_post_draft');
        if (!draftJson) return;

        const draft = JSON.parse(draftJson);
        const editingId = this.editingItem?.id || null;

        // Only offer to restore if it's the same item (or both are new)
        if (draft.editingId === editingId) {
            const timeDiff = (new Date().getTime() - draft.lastSaved) / 1000;
            if (timeDiff < 3600) { // Only if less than 1 hour old
                if (confirm('Found a recent local draft. Restore it?')) {
                    document.getElementById('post-title').value = draft.title || '';
                    document.getElementById('post-content').value = draft.content || '';
                    if (document.getElementById('post-tag')) document.getElementById('post-tag').value = draft.tag || 'Thoughts';
                    if (document.getElementById('post-image')) document.getElementById('post-image').value = draft.image || '';

                    // Trigger preview update
                    const preview = document.getElementById('post-preview-container');
                    if (preview) preview.innerHTML = this.renderPostPreview(draft);
                }
            }
        }
    },

    startAutoSave() {
        this.stopAutoSave();
        this.autoSaveInterval = setInterval(() => {
            const titleEl = document.getElementById('post-title');
            const contentEl = document.getElementById('post-content');
            if (titleEl || contentEl) {
                this.saveDraftToLocalStorage({
                    title: titleEl?.value || '',
                    content: contentEl?.value || '',
                    tag: document.getElementById('post-tag')?.value || 'Thoughts',
                    image: document.getElementById('post-image')?.value || ''
                });
            }
        }, 30000); // Auto-save every 30s
    },

    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
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
