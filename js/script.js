// Script.js - Main application initialization
document.addEventListener('DOMContentLoaded', () => {
    // Preload all data first for instant navigation
    DataService.preloadAllData();
    
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
    pageManager.registerPage('feed', FeedPage);
    pageManager.registerPage('academic', AcademicPage);
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
    
    router.register('feed', () => {
        pageManager.loadPage('feed');
        updateNavigation('feed');
    });
    
    router.register('academic', () => {
        pageManager.loadPage('academic');
        updateNavigation('academic');
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
    router.setDefaultRoute('feed');
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
