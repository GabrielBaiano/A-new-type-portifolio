// Data Service - Handles data fetching for detail pages and content
// Loads data from JSON configuration files

const DataService = {
    // Cache for loaded data
    projectsData: null,
    toolsData: null,
    academicData: null,
    notesData: null,
    reviewsData: null,



    /**
     * Load projects data from JSON
     */
    async loadProjectsData() {
        if (!this.projectsData) {
            const response = await fetch('data/projects.json');
            this.projectsData = await response.json();
        }
        return this.projectsData;
    },

    /**
     * Load tools data from JSON
     */
    async loadToolsData() {
        if (!this.toolsData) {
            const response = await fetch('data/tools.json');
            this.toolsData = await response.json();
        }
        return this.toolsData;
    },

    /**
     * Load academic (cv) data from JSON
     */
    async loadAcademicData() {
        if (!this.academicData) {
            const response = await fetch('data/academic.json');
            this.academicData = await response.json();
        }
        return this.academicData;
    },

    /**
     * Load notes data from JSON
     */
    async loadNotesData() {
        if (!this.notesData) {
            const response = await fetch('data/notes.json');
            this.notesData = await response.json();
        }
        return this.notesData;
    },

    /**
     * Load reviews data from JSON
     */
    async loadReviewsData() {
        if (!this.reviewsData) {
            const response = await fetch('data/reviews.json');
            this.reviewsData = await response.json();
        }
        return this.reviewsData;
    },



    /**
     * Preload all data at once to avoid loading states when navigating
     * Call this on page load
     */
    async preloadAllData() {
        try {
            await Promise.all([
                this.loadProjectsData(),
                this.loadToolsData(),
                this.loadAcademicData()
            ]);
            console.log('✅ All data preloaded successfully');
        } catch (error) {
            console.error('Error preloading data:', error);
        }
    },

    /**
     * Get all top projects
     * @returns {Promise<Array>} Array of top projects
     */
    async getTopProjects() {
        const data = await this.loadProjectsData();
        return data.topProjects;
    },

    /**
     * Get all other projects organized by categories
     * @returns {Promise<Object>} Other projects with categories
     */
    async getOtherProjects() {
        const data = await this.loadProjectsData();
        return data.otherProjects;
    },

    async getProjectById(id) {
        const data = await this.loadProjectsData();
        const project = data.topProjects.find(p => p.id === id);
        
        if (project) {
            // If project has github_repo, fetch README from API
            if (project.github_repo) {
                try {
                    const response = await fetch(`/api/get-project-readme?repo=${project.github_repo}`);
                    const result = await response.json();
                    
                    if (result.success && result.readme) {
                        return { 
                            ...project, 
                            content: result.readme,
                            source: 'github'
                        };
                    }
                } catch (error) {
                    console.error('Error fetching README from API:', error);
                    // Fall through to use contentFile as fallback
                }
            }
            
            // Fallback: Load markdown content from static file
            if (project.contentFile) {
                const response = await fetch(project.contentFile);
                const content = await response.text();
                return { ...project, content, source: 'file' };
            }
            
            return project;
        } else {
            throw new Error('Project not found');
        }
    },

    /**
     * Helper to get GitHub repo slug from project ID
     * @param {string} id - Project ID
     * @returns {Promise<string|null>} Repo slug (e.g. 'shii-study-assistant') or null
     */
    async getProjectRepoSlug(id) {
        const data = await this.loadProjectsData();
        const project = data.topProjects.find(p => p.id === id);
        
        if (project && project.github_repo) {
            // Extract slug from "User/Repo" format
            return project.github_repo.split('/').pop();
        }
        return null;
    },

    /**
     * Get all tools organized by categories
     * @returns {Promise<Object>} Tools data with categories
     */
    async getAllTools() {
        const data = await this.loadToolsData();
        return data.categories;
    },

    /**
     * Get tool by ID
     * @param {string} id - Tool identifier
     * @returns {Promise<Object>} Tool data
     */
    async getToolById(id) {
        const data = await this.loadToolsData();
        
        // Search through all categories
        for (const category of data.categories) {
            const tool = category.tools.find(t => t.id === id);
            if (tool) {
                return {
                    ...tool,
                    category: category.name,
                    content: `# ${tool.name}\n\nA powerful tool in the ${category.name} category.\n\n## Description\n\nThis tool is essential for modern development workflows.`
                };
            }
        }
        
        throw new Error('Tool not found');

        // Future backend integration:
        // return fetch(`/api/tools/${id}`).then(res => res.json());
    },

    /**
     * Get all blog posts
     * @returns {Promise<Array>} Array of blog posts
     */
    async getAllBlogPosts() {
        const data = await this.loadAcademicData();
        return data.posts;
    },

    /**
     * Get blog post by ID
     * @param {string} id - Blog post identifier
     * @returns {Promise<Object>} Blog post data
     */
    async getBlogPostById(id) {
        const data = await this.loadAcademicData();
        const post = data.publications.find(p => p.id === id);
        
        if (post) {
            // Load markdown content from file
            if (post.contentFile) {
                const response = await fetch(post.contentFile);
                const content = await response.text();
                return { ...post, content };
            }
            return post;
        } else {
            throw new Error('Publication not found');
        }

        // Future backend integration:
        // return fetch(`/api/blog/${id}`).then(res => res.json());
    },

    /**
     * Get feed item by ID
     * @param {string} id - Feed item identifier
     * @returns {Promise<Object>} Feed item data
     */
    async getFeedItemById(id) {
        const data = await this.loadToolsData();
        const item = data.feed.find(f => f.id === id);
        
        if (item) {
            return {
                ...item,
                content: `# ${item.title}\n\n${item.description}\n\nPublished on ${item.date}.\n\n[Check it out here](${item.link})`
            };
        }
        
        throw new Error('Feed item not found');
    },

    /**
     * Get publications for a specific category
     * @param {string} typeId - Category identifier (articles, tutorials, etc.)
     */
    /**
     * Get publications for a specific category
     * @param {string} typeId - Category identifier (articles, tutorials, etc.)
     */
    async getPublicationsByCategory(typeId) {
        const academicData = await this.loadAcademicData();
        const toolsData = await this.loadToolsData();
        const type = toolsData.articleTypes.find(t => t.id === typeId);
        
        // Filter academic publications
        let items = [];
        if (typeId === 'articles') {
            items = academicData.publications.filter(p => p.category === 'Articles');
        } else {
            // For now, other categories filter from the same pool or as placeholders
            items = academicData.publications.filter(p => p.category.toLowerCase() === typeId);
        }

        return {
            title: type ? type.title : 'Publications',
            subtitle: type ? type.subtitle : '',
            items: items,
            count: items.length
        };
    },

    async getUnifiedFeed() {
        const [toolsData, notesData, reviewsData] = await Promise.all([
            this.loadToolsData(),
            this.loadNotesData().catch(() => ({ notes: [] })),
            this.loadReviewsData().catch(() => ({ shelves: [] }))
        ]);

        // 1. Static Feed (Manual)
        const staticFeed = (toolsData.feed || []).map(item => ({
            ...item,
            _source: 'static'
        }));

        // 2. Notes
        const notesFeed = (notesData.notes || []).map(note => ({
            id: note.id,
            type: 'study-notes',
            date: note.date,
            tag: 'Study Note',
            title: note.title,
            description: note.excerpt,
            link: `#/detail/video-tutorial/${note.id}`,
            image: null,
            _source: 'notes'
        }));

        // 3. Reviews (Flatten shelves or use reviews array)
        let reviewsFeed = [];
        if (reviewsData.reviews) {
             reviewsFeed = reviewsData.reviews.map(review => ({
                id: review.id || `review-${review.title.replace(/\s+/g, '-').toLowerCase()}`,
                type: 'full-reviews',
                date: review.date || '2024-01-01',
                tag: 'Book Review',
                title: review.title,
                // If status is Reading, show "Starting reading...", otherwise show the review excerpt
                description: review.status === 'Reading' 
                    ? `Starting reading this book: ${review.title}` 
                    : (review.content ? review.content.substring(0, 150).replace(/[#*]/g, '') + '...' : `Review of ${review.title}`),
                content: review.content || null,
                link: review.link || '#',
                image: review.image,
                status: review.status,
                _source: 'reviews'
            }));
        } else if (reviewsData.shelves) {
            // Flatten shelves if reviews array is missing
            reviewsData.shelves.forEach(shelf => {
                const shelfBooks = shelf.books.map(book => ({
                    id: `book-${book.title.replace(/\s+/g, '-').toLowerCase()}`,
                    type: 'full-reviews',
                    date: '2025-01-01', // Default date for shelf items
                    tag: 'Book Review',
                    title: book.title,
                    description: `Book in ${shelf.category} shelf: ${book.author}`,
                    link: book.link || '#',
                    image: book.image,
                    _source: 'shelf'
                }));
                reviewsFeed.push(...shelfBooks);
            });
        }

        // 4. Dynamic API (LeetCode)
        let apiFeed = [];
        try {
            const apiRes = await fetch('/api/get-balloon-data?context=all');
            const apiJson = await apiRes.json();
            if (apiJson.success && apiJson.data) {
                apiFeed = apiJson.data.map(item => {
                    if (item.type === 'leetcode') {
                        return {
                            id: item.id,
                            type: 'leetcode-resolutions',
                            date: item.date,
                            tag: 'LeetCode',
                            title: item.title,
                            description: `Streak: ${item.badge}. ${item.name}`,
                            link: item.link,
                            _source: 'api'
                        };
                    } else if (item.type === 'notification' || item.type === 'release') {
                         return {
                            id: item.id,
                            type: 'projects-labs',
                            date: item.date,
                            tag: 'Release',
                            title: item.title,
                            description: item.message,
                            link: item.link,
                            image: null,
                             _source: 'api'
                        };
                    }
                    return null;
                }).filter(Boolean);
            }
        } catch (e) {
            console.error('Feed API Error:', e);
        }

        // Merge All
        const combined = [
            ...staticFeed,
            ...notesFeed,
            ...reviewsFeed,
            ...apiFeed
        ];

        // Sort by Date Descending
        return combined.sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    /**
     * Fetch and parse dynamic reading list from personal-library README
     */
    async getGitHubReadingList() {
        const username = 'GabrielBaiano';
        const repo = 'personal-library';
        const rawUrl = `https://raw.githubusercontent.com/${username}/${repo}/main/README.md`;

        try {
            const response = await fetch(rawUrl);
            if (!response.ok) throw new Error('Failed to fetch reading list');
            const markdown = await response.text();

            // Split by headers (e.g., # Reading, ## 2024, ## 2023)
            const sections = markdown.split(/(?=^#{1,3} )/m);
            const groupedBooks = {};

            const itemRegex = /<td[^>]*>[\s\S]*?<img src="([^"]+)"[\s\S]*?<span[^>]*>([^<]+)<\/span>[\s\S]*?<a[^>]*>([^<]+)<\/a>[\s\S]*?Status: <strong>([^<]+)<\/strong>[\s\S]*?<\/td>/g;

            sections.forEach(section => {
                const headerMatch = section.match(/^#{1,3}\s+(.+)$/m);
                if (!headerMatch) return;

                const sectionTitle = headerMatch[1].trim();
                // Filter titles to only those that likely contain books (Reading or Years)
                if (!/Reading|\d{4}/i.test(sectionTitle)) return;

                const booksInTitle = [];
                let match;
                while ((match = itemRegex.exec(section)) !== null) {
                    booksInTitle.push({
                        image: match[1],
                        tag: match[2],
                        title: match[3],
                        status: match[4],
                        link: `https://github.com/${username}/${repo}`,
                        icon: match[4].toLowerCase().includes('reading') ? 'fa-solid fa-book-open' : 'fa-solid fa-check-double',
                        isBR: match[3].includes('BR')
                    });
                }

                if (booksInTitle.length > 0) {
                    groupedBooks[sectionTitle] = booksInTitle;
                }
            });

            console.log('Grouped books found:', Object.keys(groupedBooks));
            return Object.keys(groupedBooks).length > 0 ? groupedBooks : null;
        } catch (error) {
            console.error('Error syncing reading list:', error);
            return null;
        }
    }
};
