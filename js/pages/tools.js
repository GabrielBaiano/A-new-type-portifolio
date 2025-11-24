// Tools Page Component - Renders user-created tools from JSON configuration
const ToolsPage = {
    render() {
        // Get preloaded data synchronously
        const categories = DataService.toolsData?.categories || [];

        return `
            <div class="card tools-card">
                <h2 class="section-title">Tools & Utilities</h2>
                <p class="other-projects-description">Tools and utilities I've created to solve real-world problems.</p>

                <div id="tools-container">
                    ${categories.map(category => `
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
                    `).join('')}
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
