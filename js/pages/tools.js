// Tools Page Component - Renders user-created tools from JSON configuration
const ToolsPage = {
    categories: [],

    render() {
        return `
            <div class="card tools-card">
                <h2 class="section-title">Tools & Utilities</h2>
                <p class="other-projects-description">Tools and utilities I've created to solve real-world problems.</p>

                <div id="tools-container">
                </div>
            </div>
        `;
    },

    async onMount() {
        console.log('Tools page mounted');
        
        try {
            // Load tools from JSON (already preloaded)
            this.categories = await DataService.getAllTools();
            this.renderTools();
        } catch (error) {
            console.error('Error loading tools:', error);
        }
    },

    renderTools() {
        const container = document.getElementById('tools-container');
        if (!container) return;

        container.innerHTML = this.categories.map(category => `
            <div class="other-projects-category">
                <h3 class="category-title">${category.name}</h3>
                <div class="other-projects-list">
                    ${category.tools.map(tool => `
                        <a href="${tool.link}" target="_blank" rel="noopener noreferrer" class="other-project-item">
                            <h4>${tool.title}</h4>
                            <p>${tool.subtitle}</p>
                        </a>
                    `).join('')}
                </div>
            </div>
        `).join('');
    },

    onUnmount() {
        // Cleanup se necessário
    }
};
