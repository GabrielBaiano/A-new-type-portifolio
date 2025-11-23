// Tools Page Component
const ToolsPage = {
    render() {
        return `
            <div class="card tools-card">
                <h2 class="section-title">Tools & Technologies</h2>
                <p class="other-projects-description">Technologies and tools I use to build amazing things.</p>

                <div class="other-projects-category">
                    <h3 class="category-title">Frontend</h3>
                    <div class="other-projects-list">
                        <div class="other-project-item">
                            <h4>React</h4>
                            <p>Building interactive UIs</p>
                        </div>
                        <div class="other-project-item">
                            <h4>JavaScript</h4>
                            <p>Core programming language</p>
                        </div>
                        <div class="other-project-item">
                            <h4>HTML5</h4>
                            <p>Semantic markup</p>
                        </div>
                        <div class="other-project-item">
                            <h4>CSS3</h4>
                            <p>Modern styling</p>
                        </div>
                        <div class="other-project-item">
                            <h4>Vue.js</h4>
                            <p>Progressive framework</p>
                        </div>
                        <div class="other-project-item">
                            <h4>React Native</h4>
                            <p>Mobile development</p>
                        </div>
                    </div>
                </div>

                <div class="other-projects-category">
                    <h3 class="category-title">Backend</h3>
                    <div class="other-projects-list">
                        <div class="other-project-item">
                            <h4>Node.js</h4>
                            <p>JavaScript runtime</p>
                        </div>
                        <div class="other-project-item">
                            <h4>Python</h4>
                            <p>Versatile programming</p>
                        </div>
                        <div class="other-project-item">
                            <h4>SQL</h4>
                            <p>Relational databases</p>
                        </div>
                        <div class="other-project-item">
                            <h4>AWS</h4>
                            <p>Cloud infrastructure</p>
                        </div>
                        <div class="other-project-item">
                            <h4>Firebase</h4>
                            <p>Backend as a service</p>
                        </div>
                        <div class="other-project-item">
                            <h4>REST APIs</h4>
                            <p>API development</p>
                        </div>
                    </div>
                </div>

                <div class="other-projects-category">
                    <h3 class="category-title">DevOps & Tools</h3>
                    <div class="other-projects-list">
                        <div class="other-project-item">
                            <h4>Git</h4>
                            <p>Version control</p>
                        </div>
                        <div class="other-project-item">
                            <h4>Docker</h4>
                            <p>Containerization</p>
                        </div>
                        <div class="other-project-item">
                            <h4>Linux</h4>
                            <p>Server administration</p>
                        </div>
                        <div class="other-project-item">
                            <h4>CI/CD</h4>
                            <p>Continuous integration</p>
                        </div>
                        <div class="other-project-item">
                            <h4>GitHub</h4>
                            <p>Code collaboration</p>
                        </div>
                        <div class="other-project-item">
                            <h4>Kubernetes</h4>
                            <p>Container orchestration</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    onMount() {
        console.log('Tools page mounted');
    },

    onUnmount() {
        // Cleanup se necessário
    }
};
