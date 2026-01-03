// Detail Page Component - Generic detail page for projects, blog posts, and tools
const DetailPage = {
    currentType: null,
    currentId: null,
    currentData: null,

    /**
     * Render the detail page
     * @param {Object} params - Route parameters {type, id}
     */
    render(params) {
        const { type, id } = params;
        this.currentType = type;
        this.currentId = id;

        // Show loading state initially
        return `
            <div class="card detail-card">
                <a href="javascript:history.back()" class="back-button" id="detail-back-btn">
                    <i class="fa-solid fa-arrow-left"></i>
                    <span>Back</span>
                </a>
                
                <div id="detail-content" class="detail-content">
                    <div class="loading-state">
                        <i class="fa-solid fa-spinner fa-spin"></i>
                        <p>Loading...</p>
                        <p id="loading-status" style="font-size: 0.8rem; color: #888; margin-top: 8px;"></p>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Called after the page is mounted to the DOM
     */
    async onMount() {
        console.log(`[Detail] Mounted: ${this.currentType}/${this.currentId}`);
        document.body.classList.add('detail-mode');
        document.body.classList.add('wide-layout');
        
        const statusEl = document.getElementById('loading-status');
        const updateStatus = (msg) => { if (statusEl) statusEl.textContent = msg; };

        // Better back button fallback
        const backBtn = document.getElementById('detail-back-btn');
        if (backBtn) {
            const fallbackMap = {
                'project': '#/projects',
                'academic': '#/academic',
                'tool': '#/projects',
                'category': '#/academic'
            };
            const fallback = fallbackMap[this.currentType] || '#/feed';
            
            // If they land directly (no history), clicking back goes to fallback
            if (window.history.length <= 1) {
                backBtn.href = fallback;
            }
        }

        // Safety timeout
        const timeout = setTimeout(() => {
            this.renderError("Request timed out. Please check your connection or try again.");
        }, 8000);

        try {
            let data;
            updateStatus("Fetching data...");
            
            // Artificial delay check? No.
            
            switch (this.currentType) {
                case 'project':
                    data = await DataService.getProjectById(this.currentId);
                    break;
                case 'academic':
                    data = await DataService.getBlogPostById(this.currentId);
                    break;
                case 'tool':
                    data = await DataService.getToolById(this.currentId);
                    break;
                case 'feed':
                    data = await DataService.getFeedItemById(this.currentId);
                    break;
                case 'category':
                    data = await DataService.getPublicationsByCategory(this.currentId);
                    break;
                default:
                    throw new Error(`Unknown content type: ${this.currentType}`);
            }

            clearTimeout(timeout);
            updateStatus("Rendering content...");
            
            this.currentData = data;
            this.renderContent(data);
            
        } catch (error) {
            clearTimeout(timeout);
            console.error('[Detail] Error:', error);
            this.renderError(error.message);
        }
    },

    /**
     * Render the actual content after data is loaded
     * @param {Object} data - Content data
     */
    renderContent(data) {
        const contentDiv = document.getElementById('detail-content');
        if (!contentDiv) return;

        try {
            // Check if marked is available
            if (typeof marked === 'undefined') {
                throw new Error("Markdown parser (marked) not loaded");
            }

            // Convert markdown to HTML using marked.js
            const htmlContent = marked.parse(data.content || '');

            contentDiv.innerHTML = `
                <div class="detail-header">
                    <h1 class="detail-title">${data.title}</h1>
                    ${data.subtitle ? `<p class="detail-subtitle">${data.subtitle}</p>` : ''}
                    ${data.date ? `<div class="detail-date">${(() => {
                        try {
                            const d = new Date(data.date);
                            return isNaN(d) ? data.date : d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
                        } catch (e) { return data.date; }
                    })()}</div>` : ''}
                    ${data.count !== undefined ? `<div class="detail-date">${data.count} Articles</div>` : ''}
                </div>

                ${data.image ? `
                    <div class="detail-image-container" style="margin-bottom: 2rem; border-radius: 12px; overflow: hidden; border: 1px solid var(--border-color); background: rgba(0,0,0,0.2);">
                        <img src="${data.image}" alt="${data.title}" style="width: 100%; height: auto; display: block; object-fit: contain; max-height: 70vh;">
                    </div>
                ` : ''}
                
                <div class="markdown-content">
                    ${data.items ? `
                        <div class="pub-grid">
                            ${data.items.map(pub => `
                                <div class="pub-card" onclick="location.hash='#/detail/academic/${pub.id}'">
                                    <h3>${pub.title}</h3>
                                    <p>${pub.excerpt || 'Explore the full content of this publication.'}</p>
                                    <span class="read-more-btn">Read more</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : htmlContent}
                </div>

                ${data.show_toc || data.tag === 'Guides' ? this.renderTOC() : ''}
            `;

            // If TOC is needed, generate it
            if (data.show_toc || data.tag === 'Guides') {
                this.generateTOC();
            }

            // Add syntax highlighting to code blocks if needed
            this.enhanceCodeBlocks();
        } catch (e) {
            console.error('[Detail] Render Error:', e);
            this.renderError("Failed to render content: " + e.message);
        }
    },

    /**
     * Render error state
     * @param {string} message - Error message
     */
    renderError(message) {
        const contentDiv = document.getElementById('detail-content');
        if (!contentDiv) return;

        contentDiv.innerHTML = `
            <div class="error-state">
                <i class="fa-solid fa-exclamation-triangle"></i>
                <h3>Error Loading Content</h3>
                <p>${message}</p>
                <button class="retry-button" onclick="location.reload()">
                    <i class="fa-solid fa-rotate-right"></i>
                    Retry
                </button>
            </div>
        `;
    },

    /**
     * Enhance code blocks with copy button and styling
     */
    enhanceCodeBlocks() {
        const codeBlocks = document.querySelectorAll('.markdown-content pre code');
        codeBlocks.forEach((block, index) => {
            const pre = block.parentElement;
            
            // Add copy button
            const copyButton = document.createElement('button');
            copyButton.className = 'code-copy-button';
            copyButton.innerHTML = '<i class="fa-solid fa-copy"></i>';
            copyButton.onclick = () => this.copyCode(block, copyButton);
            
            pre.style.position = 'relative';
            pre.appendChild(copyButton);
        });
    },

    /**
     * Generate TOC from headers
     */
    generateTOC() {
        const contentArea = document.querySelector('.markdown-content');
        const tocList = document.getElementById('toc-list');
        if (!contentArea || !tocList) return;

        const headers = contentArea.querySelectorAll('h2, h3');
        if (headers.length === 0) {
            const container = document.querySelector('.toc-container');
            if (container) container.style.display = 'none';
            return;
        }

        let tocHTML = '';
        headers.forEach((header, index) => {
            const text = header.textContent;
            const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') + '-' + index;
            header.id = id;

            const level = header.tagName.toLowerCase();
            tocHTML += `
                <li class="toc-item toc-${level}">
                    <a href="#${id}" class="toc-link">${text}</a>
                </li>
            `;
        });

        tocList.innerHTML = tocHTML;

        // Smooth scroll handling
        const links = tocList.querySelectorAll('.toc-link');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').slice(1);
                const targetEl = document.getElementById(targetId);
                if (targetEl) {
                    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    },

    /**
     * Render TOC container HTML
     */
    renderTOC() {
        return `
            <div class="toc-container">
                <div class="toc-sticky">
                    <div class="toc-header">
                        <i class="fa-solid fa-list-ul"></i>
                        <span>Summary</span>
                    </div>
                    <ul id="toc-list" class="toc-list">
                        <!-- Dynamically populated -->
                    </ul>
                </div>
            </div>
        `;
    },

    /**
     * Copy code to clipboard
     * @param {HTMLElement} codeBlock - Code block element
     * @param {HTMLElement} button - Copy button element
     */
    copyCode(codeBlock, button) {
        const code = codeBlock.textContent;
        navigator.clipboard.writeText(code).then(() => {
            // Show feedback
            const originalHTML = button.innerHTML;
            button.innerHTML = '<i class="fa-solid fa-check"></i>';
            button.classList.add('copied');
            
            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.classList.remove('copied');
            }, 2000);
        });
    },

    /**
     * Called when navigating away from the page
     */
    onUnmount() {
        document.body.classList.remove('detail-mode');
        document.body.classList.remove('wide-layout');
        this.currentType = null;
        this.currentId = null;
        this.currentData = null;
    }
};
