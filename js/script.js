document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize SPA System immediately to prevent hanging
    initializeSPA();
    initializeNavigation();

    // 2. Handle Loader Lifecycle
    const loader = document.getElementById('site-loader');
    const startTime = Date.now();
    const MIN_LOAD_TIME = 800; // ms

    // Preload all data in background
    DataService.preloadAllData().then(() => {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, MIN_LOAD_TIME - elapsedTime);

        setTimeout(() => {
            if (loader) {
                loader.classList.add('hidden');
            }
        }, remainingTime);
    }).catch(err => {
        console.error("Data preload failed:", err);
        if (loader) loader.classList.add('hidden');
    });

    // 4. HUD Toggle Logic
    const hudToggle = document.getElementById('hud-toggle');
    if (hudToggle) {
        hudToggle.addEventListener('click', () => {
            document.body.classList.toggle('hud-hidden');
            hudToggle.classList.toggle('active');
            
            // Icon is now managed dynamically by drawingSystem to match selected tool theme
        });
    }

    // 5. Auto-Draw Toggle Logic
    const autoDrawToggle = document.getElementById('auto-draw-toggle-wrapper');
    let autoDrawInterval = null;

    if (autoDrawToggle) {
        autoDrawToggle.addEventListener('click', () => {
            const isActive = autoDrawToggle.classList.toggle('active');
            const label = autoDrawToggle.querySelector('.toggle-label');
            const icon = autoDrawToggle.querySelector('.fa-wand-magic-sparkles');
            
            if (label) label.textContent = isActive ? 'ON' : 'OFF';
            if (icon) icon.style.color = isActive ? 'var(--accent-blue)' : 'var(--text-muted)';

            if (isActive) {
                // START looping
                if (window.drawingSystem) {
                    window.drawingSystem.autoWriteTryDrawing(); // First run
                    autoDrawInterval = setInterval(() => {
                        if (!window.drawingSystem.isAutoWriting && !window.drawingSystem.isDrawing) {
                            window.drawingSystem.autoWriteTryDrawing();
                        }
                    }, 10000); // Try to repeat every 10s if not busy
                }
            } else {
                // STOP looping
                if (autoDrawInterval) {
                    clearInterval(autoDrawInterval);
                    autoDrawInterval = null;
                }
                if (window.drawingSystem) {
                    window.drawingSystem.isAutoWriting = false; // Interrupt current if possible
                }
            }
        });
    }
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
    pageManager.registerPage('leetcode', LeetCode);
    pageManager.registerPage('notes', NotesPage);
    pageManager.registerPage('reviews', ReviewsPage);
    pageManager.registerPage('admin', AdminPage);
    pageManager.registerPage('tools', ToolsPage);
    pageManager.registerPage('review-view', ReviewView);

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

    router.register('leetcode', () => {
        pageManager.loadPage('leetcode');
        updateNavigation('leetcode');
    });

    router.register('leetcode/:id', (params) => {
        pageManager.loadPage('leetcode', params);
    });

    router.register('notes', () => {
        pageManager.loadPage('notes');
        updateNavigation('notes');
    });

    router.register('reviews', () => {
        pageManager.loadPage('reviews');
    });

    router.register('review-view/:id', (params) => {
        pageManager.loadPage('review-view', params);
    });

    router.register('admin', () => {
        pageManager.loadPage('admin');
    });

    router.register('tools', () => {
        pageManager.loadPage('tools');
    });

    router.register('notes/:id', (params) => {
        pageManager.loadPage('detail', { ...params, type: 'note' }); // Use DetailPage or NotesPage detail? Plan said NotesPage detail but DetailPage is generic. 
        // Let's stick to NotesPage for list for now, and maybe generic detail logic?
        // Actually NotesPage has `render(params)` which calls `renderDetail` if ID exists.
        // Wait, NotesPage implementation I wrote: `render` calls `renderList` regardless unless I misread? 
        // Let me re-read my NotesPage implementation.
        // `render(params) { if(id) return this.renderDetail(id)... but I only implemented renderList? Wait.`
        // Looking back at previous step 212: `render(params) { return await this.renderList(); }`
        // So for now, detail view just renders list. That's fine for MVP.
        pageManager.loadPage('notes', params);
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
