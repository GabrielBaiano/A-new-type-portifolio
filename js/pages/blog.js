// Blog Page Component
const BlogPage = {
    render() {
        return `
            <div class="card blog-card">
                <h2 class="section-title">Blog</h2>
                
                <div class="blog-list">
                    <article class="blog-post">
                        <div class="post-date">Nov 23, 2025</div>
                        <h3 class="post-title">Getting Started with SPA Architecture</h3>
                        <p class="post-excerpt">
                            Learn how to build modern single-page applications with vanilla JavaScript.
                            This post covers routing, state management, and best practices.
                        </p>
                        <a href="#" class="read-more">Read more →</a>
                    </article>

                    <article class="blog-post">
                        <div class="post-date">Nov 15, 2025</div>
                        <h3 class="post-title">My Journey into Full Stack Development</h3>
                        <p class="post-excerpt">
                            A reflection on my path from beginner to professional developer.
                            Lessons learned, challenges faced, and advice for newcomers.
                        </p>
                        <a href="#" class="read-more">Read more →</a>
                    </article>

                    <article class="blog-post">
                        <div class="post-date">Nov 01, 2025</div>
                        <h3 class="post-title">Building Scalable APIs with Node.js</h3>
                        <p class="post-excerpt">
                            Best practices for designing and implementing RESTful APIs that can handle
                            high traffic and complex business logic.
                        </p>
                        <a href="#" class="read-more">Read more →</a>
                    </article>
                </div>
            </div>
        `;
    },

    onMount() {
        console.log('Blog page mounted');
    },

    onUnmount() {
        // Cleanup se necessário
    }
};
