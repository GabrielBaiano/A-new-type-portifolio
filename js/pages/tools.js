// Tools Page Component
const ToolsPage = {
    render() {
        return `
            <div class="card tools-card">
                <h2 class="section-title">Tools & Technologies</h2>
                
                <div class="tools-section">
                    <h3 class="tools-category">Frontend</h3>
                    <div class="tools-grid">
                        <div class="tool-item">
                            <i class="fa-brands fa-react"></i>
                            <span>React</span>
                        </div>
                        <div class="tool-item">
                            <i class="fa-brands fa-js"></i>
                            <span>JavaScript</span>
                        </div>
                        <div class="tool-item">
                            <i class="fa-brands fa-html5"></i>
                            <span>HTML5</span>
                        </div>
                        <div class="tool-item">
                            <i class="fa-brands fa-css3-alt"></i>
                            <span>CSS3</span>
                        </div>
                    </div>
                </div>

                <div class="tools-section">
                    <h3 class="tools-category">Backend</h3>
                    <div class="tools-grid">
                        <div class="tool-item">
                            <i class="fa-brands fa-node-js"></i>
                            <span>Node.js</span>
                        </div>
                        <div class="tool-item">
                            <i class="fa-brands fa-python"></i>
                            <span>Python</span>
                        </div>
                        <div class="tool-item">
                            <i class="fa-solid fa-database"></i>
                            <span>SQL</span>
                        </div>
                        <div class="tool-item">
                            <i class="fa-brands fa-aws"></i>
                            <span>AWS</span>
                        </div>
                    </div>
                </div>

                <div class="tools-section">
                    <h3 class="tools-category">Other</h3>
                    <div class="tools-grid">
                        <div class="tool-item">
                            <i class="fa-brands fa-git-alt"></i>
                            <span>Git</span>
                        </div>
                        <div class="tool-item">
                            <i class="fa-brands fa-docker"></i>
                            <span>Docker</span>
                        </div>
                        <div class="tool-item">
                            <i class="fa-solid fa-terminal"></i>
                            <span>Linux</span>
                        </div>
                        <div class="tool-item">
                            <i class="fa-solid fa-code-branch"></i>
                            <span>CI/CD</span>
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
