// Projects Page Component
const ProjectsPage = {
    render() {
        return `
            <div class="card projects-card">
                <h2 class="section-title">Projects</h2>
                
                <div class="projects-grid">
                    <div class="project-item">
                        <div class="project-icon bg-blue">
                            <i class="fa-solid fa-code"></i>
                        </div>
                        <div class="project-content">
                            <h3>Project Title 1</h3>
                            <p>Description of your amazing project goes here. Add details about technologies used and what problem it solves.</p>
                            <div class="project-tags">
                                <span class="tag">React</span>
                                <span class="tag">Node.js</span>
                                <span class="tag">AWS</span>
                            </div>
                        </div>
                    </div>

                    <div class="project-item">
                        <div class="project-icon bg-purple">
                            <i class="fa-solid fa-mobile-screen"></i>
                        </div>
                        <div class="project-content">
                            <h3>Project Title 2</h3>
                            <p>Another cool project description. Highlight the key features and your role in the development.</p>
                            <div class="project-tags">
                                <span class="tag">React Native</span>
                                <span class="tag">TypeScript</span>
                            </div>
                        </div>
                    </div>

                    <div class="project-item">
                        <div class="project-icon bg-green">
                            <i class="fa-solid fa-database"></i>
                        </div>
                        <div class="project-content">
                            <h3>Project Title 3</h3>
                            <p>Describe your third project here. What makes it special? What did you learn?</p>
                            <div class="project-tags">
                                <span class="tag">Python</span>
                                <span class="tag">PostgreSQL</span>
                                <span class="tag">Docker</span>
                            </div>
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
