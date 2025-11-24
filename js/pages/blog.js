// Blog Page Component - Renders from JSON configuration
const BlogPage = {
    render() {
        // Get preloaded data synchronously
        const posts = DataService.blogData?.posts || [];

        return `
            <div class="card blog-card">
                <h2 class="section-title">Blog</h2>
                
                <div id="blog-list" class="blog-list">
                    ${posts.map(post => `
                        <article class="blog-post" data-blog-id="${post.id}">
                            <div class="post-date">${post.date}</div>
                            <h3 class="post-title">${post.title}</h3>
                            <p class="post-excerpt">${post.excerpt}</p>
                            <a href="#" class="read-more">Read more →</a>
                        </article>
                    `).join('')}
                </div>
            </div>
        `;
    },

    onMount() {
        console.log('Blog page mounted');
        
        // Add click handlers to blog posts
        const blogPosts = document.querySelectorAll('.blog-post');
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
