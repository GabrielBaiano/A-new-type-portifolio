// Blog Page Component - Renders from JSON configuration
const BlogPage = {
    posts: [],

    render() {
        return `
            <div class="card blog-card">
                <h2 class="section-title">Blog</h2>
                
                <div id="blog-list" class="blog-list">
                    <!-- Loading state -->
                    <div class="loading-placeholder">Loading blog posts...</div>
                </div>
            </div>
        `;
    },

    async onMount() {
        console.log('Blog page mounted');
        
        try {
            // Load blog posts from JSON
            this.posts = await DataService.getAllBlogPosts();
            this.renderPosts();
        } catch (error) {
            console.error('Error loading blog posts:', error);
        }
    },

    renderPosts() {
        const container = document.getElementById('blog-list');
        if (!container) return;

        container.innerHTML = this.posts.map(post => `
            <article class="blog-post" data-blog-id="${post.id}">
                <div class="post-date">${post.date}</div>
                <h3 class="post-title">${post.title}</h3>
                <p class="post-excerpt">${post.excerpt}</p>
                <a href="#" class="read-more">Read more →</a>
            </article>
        `).join('');

        // Add click handlers
        const blogPosts = container.querySelectorAll('.blog-post');
        blogPosts.forEach(post => {
            post.style.cursor = 'pointer';
            post.addEventListener('click', (e) => {
                e.preventDefault();
                const blogId = post.getAttribute('data-blog-id');
                if (blogId) {
                    router.navigate(`detail/blog/${blogId}`);
                }
            });
        });
    },

    onUnmount() {
        // Cleanup se necessário
    }
};
