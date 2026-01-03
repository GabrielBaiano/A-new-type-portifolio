// Data Service - Handles data fetching for detail pages and content
// Loads data from JSON configuration files

const DataService = {
    // Cache for loaded data
    projectsData: null,
    toolsData: null,
    academicData: null,
    notesData: null,
    reviewsData: null,
    photosData: null,



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
     * Load reviews data from JSON and API (Supabase)
     */
    async loadReviewsData() {
        if (!this.reviewsData) {
            try {
                const [jsonRes, apiRes] = await Promise.all([
                    fetch('data/reviews.json').then(r => r.json()).catch(() => ({ reviews: [], shelves: [] })),
                    fetch('/api/books').then(r => r.json()).catch(() => ({ data: [] }))
                ]);

                // manual reviews from Supabase
                const manualReviews = (apiRes.data || []).map(b => ({
                    ...b,
                    _source: 'supabase'
                }));

                this.reviewsData = {
                    ...jsonRes,
                    reviews: [...(jsonRes.reviews || []), ...manualReviews]
                };
            } catch (error) {
                console.error('Error loading reviews:', error);
                this.reviewsData = { reviews: [], shelves: [] };
            }
        }
        return this.reviewsData;
    },

    /**
     * Load photos data from Supabase
     */
    async loadPhotosData() {
        if (!this.photosData) {
            try {
                // Try fetching from API (Supabase)
                const response = await fetch('/api/photos');
                const result = await response.json();
                
                if (result.success) {
                    this.photosData = result.data.map(p => ({
                        id: p.id,
                        image: p.image_url,
                        description: p.description,
                        link: p.link,
                        date: p.created_at
                    }));
                } else {
                    throw new Error(result.error);
                }
            } catch (error) {
                console.error('Error loading photos:', error);
                
                // Fallback to local JSON if it exists and has content
                try {
                    const fallback = await fetch('data/photos.json').then(r => r.json());
                    this.photosData = fallback.length > 0 ? fallback : [];
                } catch (e) {
                    this.photosData = [];
                }
            }
        }
        return this.photosData;
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
                this.loadAcademicData(),
                this.loadPhotosData(),
                this.loadNotesData(),
                this.loadReviewsData(),
                // Pre-warm the unified feed cache by triggering a load if needed
                this.getUnifiedFeed(true) 
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
                    const response = await fetch(`/api/projects?repo=${project.github_repo}`);
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
        // Get all items to search the correct one
        const allItems = await this.getUnifiedFeed();
        const item = allItems.find(i => i.id === id);
        
        if (item) {
            // Generate content for items that don't have it (static, api)
            if (!item.content) {
                if (item._source === 'static' || item._source === 'api') {
                    return {
                        ...item,
                        content: `# ${item.title}\n\n${item.description || ''}\n\nPublished on ${item.date}.\n\n${item.link ? `[Check it out here](${item.link})` : ''}`
                    };
                }
            }
            return item;
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

    async getUnifiedFeed(isPreload = false) {
        // Parallel fetch for everything needed for the feed
        const [toolsData, notesData, reviewsData, apiRes, postsRes] = await Promise.all([
            this.loadToolsData(),
            this.loadNotesData().catch(() => ({ notes: [] })),
            this.loadReviewsData().catch(() => ({ reviews: [], shelves: [] })),
            fetch('/api/balloons?context=all').then(r => r.json()).catch(() => ({ success: false })),
            fetch('/api/feed').then(r => r.json()).catch(() => ({ success: false }))
        ]);

        if (isPreload) return; // Just warm the cache

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

        // 3. Reviews (Combined from JSON and Supabase)
        const finalReviewsFeed = (reviewsData.reviews || []).map(review => ({
            id: review.id || `review-${(review.title || 'untitled').replace(/\s+/g, '-').toLowerCase()}`,
            type: 'full-reviews',
            date: review.date || '2024-01-01',
            tag: 'Book Review',
            title: review.title,
            description: review.status === 'Reading' 
                ? `Starting reading this book: ${review.title}` 
                : (review.content ? review.content.substring(0, 150).replace(/[#*]/g, '') + '...' : `Finished and reviewed: ${review.title}`),
            content: review.content || null,
            link: review.id ? `#/review-view/${review.id}` : (review.link || '#'),
            image: review.image,
            status: review.status,
            _source: review._source || 'reviews'
        }));

        // 4. Dynamic API (LeetCode & Releases)
        const apiFeed = (apiRes.success && apiRes.data) ? apiRes.data.map(item => {
            if (item.type === 'leetcode') {
                return {
                    id: item.id,
                    type: 'leetcode-resolutions',
                    date: item.date || item.created_at,
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
                    date: item.date || item.created_at,
                    tag: 'Release',
                    title: item.title,
                    description: item.message,
                    link: item.link,
                    image: null,
                     _source: 'api'
                };
            }
            return null;
        }).filter(Boolean) : [];

        // 6. Manual Feed Posts from Supabase
        const manualPosts = (postsRes.success && postsRes.data) ? postsRes.data.map(post => ({
            id: post.id,
            type: 'feed-post',
            date: post.date,
            tag: post.tag || 'Thoughts',
            title: post.title,
            description: post.content ? post.content.substring(0, 150).replace(/[#*]/g, '') + '...' : '',
            content: post.content,
            _source: 'supabase-posts'
        })) : [];

        // 7. Photos
        const photosData = await this.loadPhotosData().catch(() => []);
        const photosFeed = photosData.map(p => ({
            id: p.id,
            type: 'feed-photo',
            date: p.date,
            tag: 'Photos',
            title: 'New Photo',
            description: p.description,
            link: `#/photos`,
            image: p.image,
            _source: 'photos'
        }));

        // Merge All
        const combined = [
            ...staticFeed,
            ...notesFeed,
            ...finalReviewsFeed,
            ...apiFeed,
            ...manualPosts,
            ...photosFeed
        ];

        // Sort by Date Descending
        return combined
            .filter(item => item.show_in_feed !== false)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    },

};
