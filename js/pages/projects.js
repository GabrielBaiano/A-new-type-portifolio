// Projects Page Component - Renders from JSON configuration
const ProjectsPage = {
    topProjects: [],
    otherProjects: null,

    render() {
        return `
            <!-- Card 1: Top Projects -->
            <div class="card projects-card">
                <h2 class="section-title">Top Projects</h2>
                
                <div id="top-projects-grid" class="projects-grid-cards">
                </div>
            </div>

            <!-- Card 2: Other Projects -->
            <div class="card other-projects-card">
                <h2 class="section-title">Other Projects</h2>
                <p class="other-projects-description">I maintain many projects, including some very popular ones.</p>

                <div id="other-projects-container">
                </div>
            </div>
        `;
    },

    async onMount() {
        console.log('Projects page mounted');
        
        try {
            // Load top projects (already preloaded)
            this.topProjects = await DataService.getTopProjects();
            this.renderTopProjects();

            // Load other projects (already preloaded)
            this.otherProjects = await DataService.getOtherProjects();
            this.renderOtherProjects();
        } catch (error) {
            console.error('Error loading projects:', error);
        }
    },

    renderTopProjects() {
        const container = document.getElementById('top-projects-grid');
        if (!container) return;

        container.innerHTML = this.topProjects.map(project => `
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
        `).join('');

        // Add click handlers
        const projectCards = container.querySelectorAll('.project-card');
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

    renderOtherProjects() {
        const container = document.getElementById('other-projects-container');
        if (!container || !this.otherProjects) return;

        container.innerHTML = this.otherProjects.categories.map(category => `
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
        `).join('');
    },

    onUnmount() {
        // Cleanup se necessário
    }
};
