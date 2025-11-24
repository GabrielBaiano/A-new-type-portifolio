// Tools Page Component - Renders from JSON configuration
const ToolsPage = {
    categories: [],

    render() {
        return `
            <div class="card tools-card">
                <h2 class="section-title">Tools & Technologies</h2>
                <p class="other-projects-description">Technologies and tools I use to build amazing things.</p>

                <div id="tools-container">
                    <!-- Loading state -->
                    <div class="loading-placeholder">Loading tools...</div>
                </div>
            </div>
        `;
    },

    async onMount() {
        console.log('Tools page mounted');
        
        try {
            // Load tools from JSON
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
            <div class="tools-section">
                <h3 class="tools-category">${category.name}</h3>
                <div class="tools-grid">
                    ${category.tools.map(tool => `
                        <div class="tool-item" style="--tool-color: ${tool.color}">
                            <i class="${tool.icon}" style="color: ${tool.color}"></i>
                            <span class="tool-name">${tool.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    },

    onUnmount() {
        // Cleanup se necessário
    }
};
