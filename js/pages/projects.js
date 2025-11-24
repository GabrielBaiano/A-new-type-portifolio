// Projects Page Component - Renders from JSON configuration
const ProjectsPage = {
    render() {
        // Get preloaded data synchronously
        const topProjects = DataService.projectsData?.topProjects || [];
        const otherProjects = DataService.projectsData?.otherProjects || null;

        return `
            <!-- Card 1: Top Projects -->
            <div class="card projects-card">
                <h2 class="section-title">Top Projects</h2>
                
                <div id="top-projects-grid" class="projects-grid-cards">
                    ${topProjects.map(project => `
                        <div class="project-card" data-project-id="${project.id}">
                            <div class="project-image">
                                ${project.image ? 
                                    `<img src="${project.image}" alt="${project.title}" class="project-image-real">` :
                                    `<div class="project-image-placeholder ${project.gradient}">
                                        <i class="${project.icon}"></i>
                                    </div>`
                                }
                            </div>
                            <div class="project-info">
                                <h3 class="project-title">${project.title}</h3>
                                <p class="project-subtitle">${project.subtitle}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Card 2: Other Projects -->
            <div class="card other-projects-card">
                <h2 class="section-title">Other Projects</h2>
                <p class="other-projects-description">I maintain many projects, including some very popular ones.</p>

                <div id="other-projects-container">
                    ${otherProjects ? otherProjects.categories.map(category => `
                        <div class="other-projects-category">
                            <h3 class="category-title">${category.name}</h3>
                            <div class="other-projects-list">
                                ${category.projects.map(project => `
                                    <a href="${project.link}" target="_blank" rel="noopener noreferrer" class="other-project-item">
                                        <h4>${project.title}</h4>
                                        <p>${project.subtitle}</p>
                                    </a>
                                `).join('')}
                            </div>
                        </div>
                    `).join('') : ''}
                </div>
            </div>
        `;
    },

    onMount() {
        console.log('Projects page mounted');
        
        // Add click handlers to project cards
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach(card => {
            card.style.cursor = 'pointer';
            card.addEventListener('click', (e) => {
                const projectId = card.getAttribute('data-project-id');
                if (projectId) {
                    router.navigate(`detail/project/${projectId}`);
                }
            });
        });
    },

    onUnmount() {
        // Cleanup se necessário
    }
};
