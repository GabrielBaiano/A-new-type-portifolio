// Data Service - Handles data fetching for detail pages and content
// Loads data from JSON configuration files

const DataService = {
    // Cache for loaded data
    projectsData: null,
    toolsData: null,
    blogData: null,

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
     * Load blog data from JSON
     */
    async loadBlogData() {
        if (!this.blogData) {
            const response = await fetch('data/blog.json');
            this.blogData = await response.json();
        }
        return this.blogData;
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
                this.loadBlogData()
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
        const data = await this.loadBlogData();
        return data.posts;
    },

    /**
     * Get blog post by ID
     * @param {string} id - Blog post identifier
     * @returns {Promise<Object>} Blog post data
     */
    async getBlogPostById(id) {
        const data = await this.loadBlogData();
        const post = data.posts.find(p => p.id === id);
        
        if (post) {
            // Load markdown content from file
            if (post.contentFile) {
                const response = await fetch(post.contentFile);
                const content = await response.text();
                return { ...post, content };
            }
            return post;
        } else {
            throw new Error('Blog post not found');
        }

        // Future backend integration:
        // return fetch(`/api/blog/${id}`).then(res => res.json());
    }
};
