/**
 * Balloon System - Floating notification cards with track-based positioning
 * Features: Independent tracks, dynamic height calculation, anti-repetition, and active-on-screen tracking
 */

class BalloonSystem {
    constructor() {
        this.container = null;
        this.isRunning = false;
        this.lastZIndex = 100;

        // Independent tracks for left and right sides
        this.tracks = {
            left: { lastY: window.innerHeight + 100, lastTick: Date.now() },
            right: { lastY: window.innerHeight + 100, lastTick: Date.now() }
        };

        // Anti-repetition system
        this.recent = [];
        this.maxRecent = 5;

        // Tracks balloons currently on screen to avoid duplicates
        this.activeBalloons = new Set();

        // Page context for filtering
        this.currentContext = 'home';

        // Flag to ensure ad is shown first
        this.hasShownInitialAd = false;

        this.init();
    }

    init() {
        // Don't initialize on mobile or if space is too tight
        if (!this.hasEnoughSpace()) {
            return;
        }

        this.container = document.createElement("div");
        this.container.id = "balloon-container";
        this.container.style.cssText = `
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 999;
            overflow: hidden;
            transition: opacity 1s ease;
            opacity: 1;
        `;
        document.body.appendChild(this.container);

        // Handle window resize with Debounce
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const safe = this.hasEnoughSpace();
                if (safe) {
                    if (this.container) this.container.style.opacity = '1';
                    if (!this.isRunning) {
                        this.start();
                    } else {
                        this.repositionBalloons();
                    }
                } else {
                    if (this.container) this.container.style.opacity = '0';
                }
            }, 200);
        });

        // Handle URL changes to update context
        window.addEventListener('hashchange', () => this.updateContext());
        window.addEventListener('load', () => this.updateContext());

        // Watch for main container size changes
        const mainContainer = document.querySelector('.main-container');
        if (mainContainer) {
            const resizeObserver = new ResizeObserver(() => {
                this.repositionBalloons();
            });
            resizeObserver.observe(mainContainer);
        }

        // Tab Visibility: Reset tracks when user returns to tab to avoid "sprouting" 
        // of balloons that were queued while tab was inactive
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") {
                this.tracks.left = { lastY: window.innerHeight + 50, lastTick: Date.now() };
                this.tracks.right = { lastY: window.innerHeight + 50, lastTick: Date.now() };
                if (!this.isRunning) this.start();
            }
        });
    }

    hasEnoughSpace() {
        if (window.innerWidth <= 1200) return false;
        const mainContainer = document.querySelector('.main-container');
        if (!mainContainer) return true;

        // Calculate the available margin on one side
        const margin = (window.innerWidth - mainContainer.offsetWidth) / 2;
        // More forgiving threshold: 320px is enough to show most of the 380px balloon
        return margin >= 320;
    }

    repositionBalloons() {
        const mainContainer = document.querySelector('.main-container');
        let margin = mainContainer ? (window.innerWidth - mainContainer.offsetWidth) / 2 : 550;
        
        const balloons = document.querySelectorAll('.floating-balloon');
        const balloonWidth = 380;
        const tailBuffer = 100;
        const minOffset = 20;

        balloons.forEach(balloon => {
            if (margin < 320) {
                balloon.style.opacity = '0';
                balloon.style.pointerEvents = 'none';
                return;
            }
            balloon.style.opacity = '1';
            balloon.style.pointerEvents = 'auto'; // Re-enable
            
            const side = balloon.dataset.side || (balloon.style.left && balloon.style.left !== 'auto' ? 'left' : 'right');
            const maxOffset = Math.max(minOffset, margin - balloonWidth - tailBuffer);
            // Keep current offset if within bounds, otherwise adjust
            const currentOffset = parseFloat(side === 'left' ? balloon.style.left : balloon.style.right) || minOffset;
            let newOffset = Math.min(Math.max(currentOffset, minOffset), maxOffset);

            if (side === 'left') {
                balloon.style.left = `${newOffset}px`;
                balloon.style.right = 'auto'; // Ensure the other side is auto
            } else {
                balloon.style.right = `${newOffset}px`;
                balloon.style.left = 'auto'; // Ensure the other side is auto
            }
        });
    }

    chooseSide() {
        return Math.random() < 0.5 ? "left" : "right";
    }

    createBalloon(data) {
        // Temporary measure to calculate height
        const temp = document.createElement("div");
        temp.className = "balloon-temp";
        temp.style.cssText = `position: absolute; opacity: 0; pointer-events: none; width: 380px;`;
        temp.innerHTML = this.buildBalloonHTML(data);
        this.container.appendChild(temp);
        const height = temp.clientHeight;
        temp.remove();

        const side = this.chooseSide();
        const track = this.tracks[side];
        
        // Spacing: 300px for ads, 200px for regular
        const spacing = data.type === "ad" ? 250 : 150;
        
        const isBusyPage = this.currentContext === 'home' || this.currentContext === 'academic';
        const speed = isBusyPage ? 100 : 60;
        
        const now = Date.now();
        const delta = (now - track.lastTick) / 1000;
        track.lastTick = now;
        
        // Track positioning logic: CAP AT 300px below fold to avoid long "invisible" travel
        // Also ensure startY is at least viewport + 50
        track.lastY = Math.max(window.innerHeight + 50, track.lastY - (delta * speed));
        if (track.lastY > window.innerHeight + 300) track.lastY = window.innerHeight + 300;
        
        const startY = track.lastY;
        track.lastY = startY + height + spacing;

        const mainContainer = document.querySelector('.main-container');
        const margin = mainContainer ? (window.innerWidth - mainContainer.offsetWidth) / 2 : 550;
        const balloonWidth = 380;
        const tailBuffer = 60; // Reduced buffer
        const minOffset = 20;
        const maxOffset = Math.max(minOffset, margin - balloonWidth - tailBuffer);
        const horizontalOffset = minOffset + Math.random() * (maxOffset - minOffset);

        const balloon = document.createElement("div");
        balloon.className = "floating-balloon";
        balloon.innerHTML = this.buildBalloonHTML(data);
        
        // Animation Duration & Distance
        const totalTravelPx = window.innerHeight + height + 200; // Only travel enough to clear screen
        const travelDistance = -(totalTravelPx + startY + 100); // end well above viewport
        const duration = Math.abs(travelDistance) / speed;
        
        const rotation = (Math.random() - 0.5) * 8;
        const currentZ = data.type === 'ad' ? 2000 : this.lastZIndex++;

        balloon.dataset.side = side;
        balloon.style.cssText = `
            position: absolute;
            ${side}: ${horizontalOffset}px;
            top: ${startY}px;
            --balloon-rotation: ${rotation}deg;
            --balloon-travel-y: ${travelDistance}px;
            animation: balloon-move-up ${duration}s linear forwards;
            z-index: ${currentZ};
        `;
        
        // DUPLICATE PREVENTION: ADD TO ACTIVE SET
        this.activeBalloons.add(data.id);
        this.container.appendChild(balloon);
        
        // Cleanup after animation
        setTimeout(() => { 
            if (balloon.parentNode) balloon.remove(); 
            this.activeBalloons.delete(data.id);
        }, duration * 1000 + 1000);
    }

    buildBalloonHTML(data) {
        const colors = ['blue', 'green', 'yellow', 'orange', 'pink', 'purple'];
        const randomColor = data.color || colors[Math.floor(Math.random() * colors.length)];

        return `
            <div class="balloon-card organic-balloon balloon-bg-${randomColor}">
                ${data.image ? `<img src="${data.image}" alt="${data.name}" class="balloon-avatar">` : ''}
                <div class="balloon-header">
                    <span class="balloon-name">${data.name}</span>
                    ${data.badge ? `<span class="balloon-badge">${data.badge}</span>` : ''}
                </div>
                <div class="balloon-message">${data.message}</div>
                ${data.link ? `
                     <div style="margin-top: 10px; font-size: 0.8rem; font-weight: 800; text-decoration: underline; cursor: pointer; color: #000;" 
                          onclick="window.open('${data.link}', '_blank')">LEARN MORE →</div>
                ` : ''}
            </div>
        `;
    }

    async start() {
        if (this.isRunning || !this.hasEnoughSpace()) return;
        
        // Reset tracks for a fresh start
        this.tracks.left = { lastY: window.innerHeight + 50, lastTick: Date.now() };
        this.tracks.right = { lastY: window.innerHeight + 50, lastTick: Date.now() };
        
        this.isRunning = true;
        this.runId = (this.runId || 0) + 1;
        const currentRunId = this.runId;

        const spawn = async () => {
            if (!this.isRunning || this.runId !== currentRunId) return;
            const data = await this.getBalloonData();
            if (!this.isRunning || this.runId !== currentRunId) return;
            
            if (data) {
                this.createBalloon(data);
            }
            
            // Dynamic interval: 3-5s on About/Academic, 8-15s elsewhere
            const isBusyPage = this.currentContext === 'home' || this.currentContext === 'academic';
            const next = isBusyPage ? 
                (3000 + Math.random() * 2000) : 
                (8000 + Math.random() * 7000);
            
            // Faster retry if no data was found
            const retryInterval = data ? next : 1000;
            this.spawnTimeout = setTimeout(spawn, retryInterval);
        };

        const initialDelay = 500 + Math.random() * 1000;
        this.spawnTimeout = setTimeout(spawn, initialDelay);
    }

    stop() {
        this.isRunning = false;
        this.runId = (this.runId || 0) + 1;
        if (this.spawnTimeout) {
            clearTimeout(this.spawnTimeout);
            this.spawnTimeout = null;
        }
    }

    async getBalloonData() {
        // 1. PRIORITY: Standardized YellowHood Ad
        // We always try to show this first if it's not already on screen
        if (!this.activeBalloons.has("ad-yellowhood-standard")) {
            return {
                id: "ad-yellowhood-standard",
                type: "ad",
                name: "YELLOWHOOD AGENCY",
                message: "Transform your idea into an elite digital product. Strategy, Design, and Full-stack.",
                badge: "Agency",
                color: "blue",
                link: "https://yellowhood.com.br",
                contexts: ['home', 'projects', 'academic', 'feed', 'photos']
            };
        }

        // 2. VARIETY: If Ad is already active, pull from other sources
        let pool = await this.getAllData();
        
        // Filter by context, active state, and recent logic
        const validItems = pool.filter(item => {
            const contextMatch = !item.contexts || item.contexts.includes(this.currentContext);
            const notActive = !this.activeBalloons.has(item.id);
            const notRecent = !this.recent.includes(item.id);
            return contextMatch && notActive && notRecent;
        });

        if (validItems.length === 0) return null;

        // Pick random valid item
        const selected = validItems[Math.floor(Math.random() * validItems.length)];
        
        // Track recent to avoid same-balloon succession
        this.recent.push(selected.id);
        if (this.recent.length > this.maxRecent) this.recent.shift();

        return selected;
    }

    async getAllData() {
        try {
            const context = this.currentContext;
            const response = await fetch(`/api/get-balloon-data?context=${context}`);
            const result = await response.json();
            if (result.success && result.data && result.data.length > 0) return result.data;
        } catch (error) { }
        return this.getFallbackData();
    }

    getFallbackData() {
        return [
            { id: "p1", type: "notification", name: "Shii App", message: "v2.1 Available!", badge: "Hot", color: "green", contexts: ['projects', 'home', 'academic'] },
            { id: "p2", type: "notification", name: "New Release", message: "Performance updates pushed.", badge: "New", color: "green", contexts: ['projects', 'home', 'academic'] },
            { id: "a1", type: "notification", name: "Publication", message: "New article about LLMs!", badge: "Article", color: "yellow", contexts: ['home', 'academic'] },
            { id: "s1", type: "notification", name: "Twitter", message: "Discussion about dynamic UI.", badge: "Social", color: "pink", contexts: ['home', 'academic'] },
            { id: "r1", type: "notification", name: "Reading", message: "Reading: Foundation.", badge: "Reading", image: "https://m.media-amazon.com/images/I/91M9Ef-07-L._AC_UF1000,1000_QL80_.jpg", color: "purple", contexts: ['home', 'academic'] },
            { id: "c1", type: "notification", name: "Contact", message: "Let's chat on WhatsApp.", badge: "Links", color: "orange", link: "https://wa.me/seunumeroaqui", contexts: ['home', 'projects', 'academic'] }
        ];
    }

    async updateContext() {
        const hash = window.location.hash;
        if (hash === '#/projects') this.currentContext = 'projects';
        else if (hash === '#/academic') this.currentContext = 'academic';
        else if (hash === '#/home') this.currentContext = 'home';
        else if (hash.startsWith('#/detail/projects/')) {
            const projectId = hash.split('/').pop();
            try {
                // Assuming DataService is globally available or handled elsewhere
                if (typeof DataService !== 'undefined') {
                    const repoSlug = await DataService.getProjectRepoSlug(projectId);
                    this.currentContext = repoSlug || 'home';
                } else {
                    this.currentContext = 'home';
                }
            } catch (e) { this.currentContext = 'home'; }
        }
        else this.currentContext = 'home';
        
        this.recent = [];
        setTimeout(() => this.repositionBalloons(), 100);
    }
}

// Global initialization
const balloonSystem = new BalloonSystem();
window.balloonSystem = balloonSystem;
