// Script.js - Main application initialization
document.addEventListener('DOMContentLoaded', () => {
    // Initialize SPA System
    initializeSPA();
    
    // Initialize navigation
    initializeNavigation();
});

/**
 * Initialize the SPA routing system
 */
function initializeSPA() {
    // Register all pages
    pageManager.registerPage('home', HomePage);
    pageManager.registerPage('projects', ProjectsPage);
    pageManager.registerPage('tools', ToolsPage);
    pageManager.registerPage('blog', BlogPage);
    pageManager.registerPage('photos', PhotosPage);
    pageManager.registerPage('detail', DetailPage);

    // Register routes
    router.register('home', () => {
        pageManager.loadPage('home');
        updateNavigation('home');
    });
    
    router.register('projects', () => {
        pageManager.loadPage('projects');
        updateNavigation('projects');
    });
    
    router.register('tools', () => {
        pageManager.loadPage('tools');
        updateNavigation('tools');
    });
    
    router.register('blog', () => {
        pageManager.loadPage('blog');
        updateNavigation('blog');
    });
    
    router.register('photos', () => {
        pageManager.loadPage('photos');
        updateNavigation('photos');
    });

    // Register detail route with parameters
    router.register('detail/:type/:id', (params) => {
        pageManager.loadPage('detail', params);
        // Don't update navigation for detail pages
    });

    // Set default route
    router.setDefaultRoute('home');
}

/**
 * Initialize navigation bar interactions
 */
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item:not(.icon-only)');
    
    // Event listeners para navegação
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Let the router handle the navigation
            // Just update the active state
            const route = item.getAttribute('data-route');
            if (route) {
                updateNavigation(route);
            }
        });
    });
}

/**
 * Update navigation active state
 * @param {string} activeRoute - The currently active route
 */
function updateNavigation(activeRoute) {
    const navItems = document.querySelectorAll('.nav-item:not(.icon-only)');
    
    navItems.forEach(item => {
        const route = item.getAttribute('data-route');
        if (route === activeRoute) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}
