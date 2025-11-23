// Projects Page Component
const ProjectsPage = {
    render() {
        return `
            <!-- Card 1: Top Projects -->
            <div class="card projects-card">
                <h2 class="section-title">Top Projects</h2>
                
                <div class="projects-grid-cards">
                    <div class="project-card">
                        <div class="project-image">
                            <div class="project-image-placeholder">
                                <i class="fa-solid fa-code"></i>
                            </div>
                        </div>
                        <div class="project-info">
                            <h3 class="project-title">E-Commerce Platform</h3>
                            <p class="project-subtitle">Full-stack online store with payment integration</p>
                        </div>
                    </div>

                    <div class="project-card">
                        <div class="project-image">
                            <div class="project-image-placeholder bg-purple-gradient">
                                <i class="fa-solid fa-mobile-screen"></i>
                            </div>
                        </div>
                        <div class="project-info">
                            <h3 class="project-title">Mobile Banking App</h3>
                            <p class="project-subtitle">React Native app for financial management</p>
                        </div>
                    </div>

                    <div class="project-card">
                        <div class="project-image">
                            <div class="project-image-placeholder bg-green-gradient">
                                <i class="fa-solid fa-chart-line"></i>
                            </div>
                        </div>
                        <div class="project-info">
                            <h3 class="project-title">Analytics Dashboard</h3>
                            <p class="project-subtitle">Real-time data visualization platform</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Card 2: Other Projects -->
            <div class="card other-projects-card">
                <h2 class="section-title">Other Projects</h2>
                <p class="other-projects-description">I maintain many projects, including some very popular ones.</p>

                <div class="other-projects-category">
                    <h3 class="category-title">Web Tools</h3>
                    <div class="other-projects-list">
                        <div class="other-project-item">
                            <h4>Quick Reference</h4>
                            <p>开发人员分享快速参考备忘清单</p>
                        </div>
                        <div class="other-project-item">
                            <h4>linux-command</h4>
                            <p>Linux命令大全搜索工具，内容包含...</p>
                        </div>
                        <div class="other-project-item">
                            <h4>Web Tool</h4>
                            <p>Many many useful Web Online Too...</p>
                        </div>
                        <div class="other-project-item">
                            <h4>WXMP</h4>
                            <p>微信公众号文章 Markdown 编辑器</p>
                        </div>
                        <div class="other-project-item">
                            <h4>SVG Badges</h4>
                            <p>SVG badges to display</p>
                        </div>
                        <div class="other-project-item">
                            <h4>npm-unpkg</h4>
                            <p>A web application to npm...</p>
                        </div>
                        <div class="other-project-item">
                            <h4>keycode-info</h4>
                            <p>A simple web page that responds to...</p>
                        </div>
                        <div class="other-project-item">
                            <h4>nginx-editor</h4>
                            <p>Nginx language for Monaco Editor</p>
                        </div>
                    </div>
                </div>

                <div class="other-projects-category">
                    <h3 class="category-title">Development Tools</h3>
                    <div class="other-projects-list">
                        <div class="other-project-item">
                            <h4>SVG Icon Search</h4>
                            <p>Search SVG Icons. Easily include...</p>
                        </div>
                        <div class="other-project-item">
                            <h4>CodeImage</h4>
                            <p>Create beautiful images of your...</p>
                        </div>
                        <div class="other-project-item">
                            <h4>json-viewer</h4>
                            <p>Online JSON viewer, JSON Beautifi...</p>
                        </div>
                        <div class="other-project-item">
                            <h4>run-web</h4>
                            <p>Online Code Editor for Rapid Web...</p>
                        </div>
                        <div class="other-project-item">
                            <h4>ui-color</h4>
                            <p>Converting HEX & RGB colors to...</p>
                        </div>
                        <div class="other-project-item">
                            <h4>github-rank</h4>
                            <p>Github China/Global User Ranking...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    onMount() {
        console.log('Projects page mounted');
    },

    onUnmount() {
        // Cleanup se necessário
    }
};
