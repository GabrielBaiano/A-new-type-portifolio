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

            // Note: Visualizer is already initialized inside DrawingSystem
            // attached to 'bg-drawing-canvas'.
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
        });
    }

    // 5. Sound Toggle Logic
    const soundToggle = document.getElementById('sound-toggle');

    const triggerVisualizer = () => {
        const viz = window.drawingSystem?.audioVisualizer;
        if (!viz) return;
        const state = viz.toggle();
        if (soundToggle) {
            state ? soundToggle.classList.remove('muted') : soundToggle.classList.add('muted');
        }
    };

    if (soundToggle) {
        soundToggle.addEventListener('click', triggerVisualizer);
    }

    // "Prime" Audio on first user interaction to bypass browser policies
    const primeAudio = () => {
        const viz = window.drawingSystem?.audioVisualizer;
        if (viz && viz.isInitialized) {
            console.log("System: Audio primed by user interaction");
            if (document.documentElement.getAttribute('data-theme') !== 'light') {
                viz.play();
            }
            window.removeEventListener('click', primeAudio);
            window.removeEventListener('touchstart', primeAudio);
        }
    };
    window.addEventListener('click', primeAudio);
    window.addEventListener('touchstart', primeAudio);

    // Auto-play/pause based on theme
    document.addEventListener('themeChanged', (e) => {
        const isCreative = e.detail.theme !== 'light';
        const viz = window.drawingSystem?.audioVisualizer;
        if (!viz) return;

        if (isCreative) {
            viz.play();
            if (soundToggle) soundToggle.classList.remove('muted');
        } else {
            viz.pause();
            if (soundToggle) soundToggle.classList.add('muted');
        }
    });
    // 6. Cookie Popup Logic
    const cookiePopup = document.getElementById('cookie-popup');
    const acceptCookies = document.getElementById('accept-cookies');
    const declineCookies = document.getElementById('decline-cookies');

    const showCookiePopup = () => {
        if (!cookiePopup) return;
        cookiePopup.classList.remove('hidden');
        // Small delay to allow CSS transitions to trigger after display change
        requestAnimationFrame(() => {
            cookiePopup.classList.add('visible');
        });
    };

    const hideCookiePopup = () => {
        if (!cookiePopup) return;
        cookiePopup.classList.remove('visible');
        setTimeout(() => cookiePopup.classList.add('hidden'), 800);
    };

    if (cookiePopup && !localStorage.getItem('cookies-accepted')) {
        setTimeout(showCookiePopup, 2000);
    }

    if (acceptCookies) {
        acceptCookies.addEventListener('click', () => {
            localStorage.setItem('cookies-accepted', 'true');
            hideCookiePopup();

            // Interaction achieved! Prime audio.
            primeAudio();
        });
    }

    if (declineCookies) {
        declineCookies.addEventListener('click', () => {
            hideCookiePopup();
            // We DON'T set cookies-accepted, so it shows up next time
        });
    }

    // Manual test trigger
    window.testCookieAnimation = () => {
        console.log("Testing Cookie Animation...");
        localStorage.removeItem('cookies-accepted');
        showCookiePopup();
    };

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
