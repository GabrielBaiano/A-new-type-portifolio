/**
 * Balloon System - Persistent & Dynamic Background Notifications
 * Features: Background scattering, non-overlapping positioning, 
 * persistent transitions, replenishment loop, click-to-dismiss.
 */

class BalloonSystem {
    constructor() {
        this.container = null;
        this.isRunning = false;
        
        // Tracks balloons currently on screen
        // Map of balloon element -> { data, side, x, y, rect }
        this.activeBalloons = new Map();
        this.placedRects = []; // For collision detection

        // Page context for filtering
        this.currentContext = 'home';
        
        // Replenishment timer
        this.replenishmentTimer = null;

        this.init();
    }

    init() {
        if (!this.hasEnoughSpace()) return;

        this.container = document.createElement("div");
        this.container.id = "balloon-container";
        this.container.style.cssText = `
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 9999; 
            overflow: hidden;
            transition: opacity 1s ease;
            opacity: 1;
        `;
        document.body.appendChild(this.container);

        // Handle window resize - brusque changes might still need refresh
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const safe = this.hasEnoughSpace();
                if (safe) {
                    if (this.container) this.container.style.opacity = '1';
                    this.repositionBalloons();
                } else {
                    if (this.container) this.container.style.opacity = '0';
                    this.clearBalloons();
                }
            }, 300);
        });

        // Handle context changes
        window.addEventListener('hashchange', () => this.updateContext());
        window.addEventListener('load', () => this.updateContext());

        const mainContainer = document.querySelector('.main-container');
        if (mainContainer) {
            const resizeObserver = new ResizeObserver(() => this.repositionBalloons());
            resizeObserver.observe(mainContainer);
        }

        // Tab Visibility - Fixes Alt-Tab Pause
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") {
                // Force restart loop if it was running before
                if (this.isRunning) {
                   this.startReplenishment(); // Restart loop (slow)
                } else {
                    this.start();
                }
            } else {
                this.stopReplenishment();
            }
        });
    }

    hasEnoughSpace() {
        if (window.innerWidth <= 1200) return false;
        const mainContainer = document.querySelector('.main-container');
        if (!mainContainer) return true;
        const margin = (window.innerWidth - mainContainer.offsetWidth) / 2;
        return margin >= 320;
    }

    async start() {
        return; // Temporarily disabled
        if (this.isRunning || !this.hasEnoughSpace()) return;
        this.isRunning = true;
        await this.initialFill();
        this.startReplenishment();
    }

    clearBalloons() {
        if (this.container) this.container.innerHTML = '';
        this.activeBalloons.clear();
        this.placedRects = [];
    }

    async initialFill() {
        return; // Temporarily disabled
        this.clearBalloons();
        
        // 1. Get all available data
        const dataSet = await this.getAvailableData();
        if (!dataSet || dataSet.length === 0) return;

        // 2. Prioritize by color diversity
        const groupedByColor = {};
        dataSet.forEach(item => {
            const color = item.color || 'blue';
            if (!groupedByColor[color]) groupedByColor[color] = [];
            groupedByColor[color].push(item);
        });

        const colors = Object.keys(groupedByColor);
        const priorityQueue = [];
        let hasMore = true;
        let index = 0;

        // Round-robin selection to ensure color diversity
        while (hasMore) {
            hasMore = false;
            for (const color of colors) {
                if (groupedByColor[color].length > index) {
                    priorityQueue.push(groupedByColor[color][index]);
                    hasMore = true;
                }
            }
            index++;
        }


        // 3. Fast initial spawn sequence
        let delay = 0;
        const spawnInterval = 80; // Rapid fire on load!

        for (const item of priorityQueue) {
            setTimeout(() => {
                if (this.isRunning) {
                    this.tryPlaceBalloon(item);
                }
            }, delay);
            delay += spawnInterval;
        }
    }

    isContextValid(item) {
        if (!item.contexts) return true;
        return item.contexts.includes(this.currentContext);
    }

    startReplenishment() {
        this.stopReplenishment();
        // 2 to 10 minutes (Extreme delay)
        const nextTime = 120000 + Math.random() * 480000; 
        this.replenishmentTimer = setTimeout(async () => {
            await this.replenish();
            this.startReplenishment();
        }, nextTime);
    }

    stopReplenishment() {
        if (this.replenishmentTimer) {
            clearTimeout(this.replenishmentTimer);
            this.replenishmentTimer = null;
        }
    }

    async replenish() {
        if (!this.isRunning || !this.hasEnoughSpace()) return;
        
        const dataSet = await this.getAvailableData();
        const unused = dataSet.filter(item => {
            if (item.id === 'ad-yellowhood-standard' || item.id === 'newsletter-orange') return false;
            for (let balloonContext of this.activeBalloons.values()) {
                if (balloonContext.data.id === item.id) return false;
            }
            return true;
        });

        if (unused.length > 0) {
            const item = unused[Math.floor(Math.random() * unused.length)];
            this.tryPlaceBalloon(item);
        }
    }

    async getAvailableData() {
        let pool = await this.getAllData();
        return pool.filter(item => !item.contexts || item.contexts.includes(this.currentContext));
    }

    repositionBalloons() {
        if (!this.hasEnoughSpace()) return;
        const mainContainer = document.querySelector('.main-container');
        const margin = mainContainer ? (window.innerWidth - mainContainer.offsetWidth) / 2 : 500;
        const balloonWidth = 418;
        const xMin = 20;
        const xMax = margin - balloonWidth - 40;

        // Clear placedRects and rebuild from persistent positions
        this.placedRects = [];

        this.activeBalloons.forEach((context, element) => {
            // Update x limits but keep y
            const side = context.side;
            const currentX = context.x;
            
            // Re-clamp X in case margin changed
            const newX = Math.min(xMax, Math.max(xMin, currentX));
            context.x = newX;

            const rect = {
                x: side === 'left' ? newX : window.innerWidth - newX - balloonWidth,
                y: context.y,
                w: balloonWidth,
                h: element.offsetHeight + 15
            };

            // Update DOM
            element.style[side] = `${newX}px`;
            context.rect = rect;
            this.placedRects.push(rect);
        });
    }

    tryPlaceBalloon(data, force = false) {
        const side = Math.random() < 0.5 ? 'left' : 'right';
        const mainContainer = document.querySelector('.main-container');
        const margin = mainContainer ? (window.innerWidth - mainContainer.offsetWidth) / 2 : 500;
        
        const balloonWidth = 418;
        const xMin = 20;
        const xMax = margin - balloonWidth - 40;
        const yMin = 50;
        const yMax = window.innerHeight - 250;

        const temp = document.createElement("div");
        temp.style.cssText = `position: absolute; visibility: hidden; width: ${balloonWidth}px;`;
        temp.innerHTML = this.buildBalloonHTML(data);
        document.body.appendChild(temp);
        const height = temp.offsetHeight;
        temp.remove();

        // FORCE PLACEMENT: Random anywhere on screen
        if (force) {
            const xMinFull = 20;
            const xMaxFull = window.innerWidth - balloonWidth - 20;
            const yMinFull = 50;
            const yMaxFull = window.innerHeight - height - 20;
            
            const x = xMinFull + Math.random() * (xMaxFull - xMinFull);
            const y = yMinFull + Math.random() * (yMaxFull - yMinFull);
            
            const rect = { x, y, w: balloonWidth, h: height };
            const side = x < window.innerWidth / 2 ? 'left' : 'right';
            this.spawnBalloon(data, side, x, y, rect);
            return true;
        }

        const maxAttempts = 50; // Increased attempts
        for (let i = 0; i < maxAttempts; i++) {
            const x = xMin + Math.random() * (xMax - xMin);
            const y = yMin + Math.random() * (yMax - yMin);
            
            // Allow slight overlapping (negative margin) for initial density if needed
            // But let's stick to strict first.
            const rect = {
                x: side === 'left' ? x : window.innerWidth - x - balloonWidth,
                y: y,
                w: balloonWidth,
                h: height + 10 // Reduced vertical padding slightly
            };

            if (!this.checkCollision(rect)) {
                this.spawnBalloon(data, side, x, y, rect);
                return true;
            }
        }
        
        // Final fallback: Try to force it in a known clear zone if it's the first few
        if (this.activeBalloons.size < 3) {
             // Force placement at random Y with side check? 
             // Let's just return false to avoid overlapping mess, but 50 attempts should be enough.
        }
        
        return false;
    }

    checkCollision(rect) {
        // Reduced collision padding for denser packing
        const padding = 10; 
        for (const other of this.placedRects) {
            if (rect.x < other.x + other.w + padding &&
                rect.x + rect.w > other.x - padding &&
                rect.y < other.y + other.h + padding &&
                rect.y + rect.h > other.y - padding) {
                return true;
            }
        }
        return false;
    }

    spawnBalloon(data, side, x, y, rect) {
        const balloon = document.createElement("div");
        balloon.className = "floating-balloon";
        balloon.innerHTML = this.buildBalloonHTML(data);
        
        const rotation = (Math.random() - 0.5) * 6;
        const delay = Math.random() * 0.8;

        balloon.style.cssText = `
            position: absolute;
            ${side}: ${x}px;
            top: ${y}px;
            --balloon-rotation: ${rotation}deg;
            animation-delay: ${delay}s, ${delay + 0.8}s;
            z-index: ${Math.floor(y)};
            transition: left 0.8s cubic-bezier(0.4, 0, 0.2, 1), 
                        right 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        `;

        this.activeBalloons.set(balloon, { data, side, x, y, rect });
        this.placedRects.push(rect);

        setTimeout(() => {
            if (balloon.parentElement) balloon.classList.add('is-ready');
        }, (delay + 0.8) * 1000);

        balloon.addEventListener('click', (e) => {
            // Don't close if clicking input or button
            if (e.target.closest('.newsletter-form')) return;
            if (e.target.closest('.balloon-link')) return;
            
            e.stopPropagation();
            balloon.classList.add(side === 'left' ? 'balloon-exit-left' : 'balloon-exit-right');
            this.activeBalloons.delete(balloon);
            setTimeout(() => balloon.remove(), 600);
        });

        // Specific logic for newsletter
        if (data.type === 'newsletter') {
            const btn = balloon.querySelector('.subscribe-btn');
            const input = balloon.querySelector('input');
            const form = balloon.querySelector('.newsletter-form');
            
            if (btn && input && form) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const email = input.value;
                    if (!email || !email.includes('@')) {
                        input.style.borderColor = 'red';
                        return;
                    }

                    // Success state
                    form.innerHTML = `
                        <div class="success-msg">
                            <i class="fa-solid fa-circle-check"></i>
                            Welcome to the loop! check your inbox.
                        </div>
                    `;
                    
                });
            }
        }

        this.container.appendChild(balloon);
    }

    buildBalloonHTML(data) {
        const colors = ['blue', 'green', 'yellow', 'orange', 'pink', 'purple'];
        const color = data.color || colors[Math.floor(Math.random() * colors.length)];
        
        // Parse markdown if marked is available
        const formattedMessage = (typeof marked !== 'undefined' && data.message) 
            ? marked.parse(data.message) 
            : data.message;

        // Determine visibility and labels based on color/type
        const isRelease = color === 'green';
        const isLeetCode = color === 'pink';
        const showAvatar = !isRelease && !isLeetCode && data.image; 

        return `
            <div class="balloon-card organic-balloon balloon-bg-${color} ${isRelease ? 'balloon-type-release' : ''} ${isLeetCode ? 'balloon-type-leetcode' : ''} ${data.type === 'newsletter' ? 'balloon-type-newsletter' : ''}">
                <div class="balloon-inner">
                    <div class="balloon-header">
                        ${showAvatar ? `<img src="${data.image}" class="balloon-avatar" alt="">` : ''}
                        <span class="balloon-name">${data.name}</span>
                        ${data.badge ? `<span class="balloon-badge">${data.badge}</span>` : ''}
                    </div>
                    ${data.title ? `<div class="balloon-title">${data.title}</div>` : ''}
                    ${formattedMessage ? `<div class="balloon-message">${formattedMessage}</div>` : ''}
                    
                    ${data.type === 'newsletter' ? `
                        <div class="newsletter-form">
                            <input type="email" placeholder="Type your email..." required>
                            <button class="subscribe-btn">SUBSCRIBE NOW</button>
                        </div>
                    ` : ''}

                    ${data.link && data.type !== 'newsletter' ? `
                         <a href="${data.link}" ${isLeetCode ? '' : 'target="_blank"'} class="balloon-link">
                            ${isRelease ? 'VIEW PATCH NOTES →' : 
                               (isLeetCode ? 'VIEW RESOLUTION →' : (data.linkText || 'LEARN MORE →'))}
                         </a>
                    ` : ''}
                </div>
            </div>
        `;
    }

    async getAllData() {
        try {
            const response = await fetch(`/api/balloons?context=all`);
            const result = await response.json();
            const ad = this.getAd();
            const newsletter = this.getNewsletter();
            
            if (result.success && result.data) {
                // Filter to show green releases and pink leetcode challenges
                let dynamicBalloons = result.data.filter(item => 
                    item.color === 'green' || item.color === 'pink'
                );

                // Dedup filters: Only keep the LATEST of each type (color) to avoid clutter
                // as per user request: "only show the LAST daily challenge"
                const seenColors = new Set();
                dynamicBalloons = dynamicBalloons.filter(item => {
                    if (item.color === 'pink') {
                        if (seenColors.has('pink')) return false;
                        seenColors.add('pink');
                        return true;
                    }
                    return true;
                });

                return [ad, newsletter, ...dynamicBalloons];
            }
        } catch (error) {
            console.error('🎈 Balloon System Error:', error);
        }
        return [this.getAd(), this.getNewsletter(), ...this.getFallbackData()];
    }

    getNewsletter() {
        return {
            id: "newsletter-orange",
            type: "newsletter",
            name: "NEWSLETTER",
            title: "DON'T MISS THE UPDATES",
            message: "Join my circle for exclusive tech deep dives and project insights.",
            badge: "Interactive",
            color: "orange",
            contexts: ['home', 'projects', 'academic', 'feed', 'photos']
        };
    }

    getAd() {
        return {
            id: "ad-yellowhood-standard",
            name: "YELLOWHOOD AGENCY",
            message: "Transform your idea into an elite digital product. Strategy, Design, and Full-stack.",
            badge: "Agency",
            color: "blue", // Force blue for ad
            link: "https://www.yellowhood.com.br",
            contexts: ['home', 'projects', 'academic', 'feed', 'photos']
        };
    }


    getFallbackData() {
        return [
            { id: "p1", name: "Shii App", message: "v2.1 Available!", badge: "Updates", color: "green", contexts: ['projects', 'home'] }
        ];
    }

    async spawnRandom() {
        const pool = await this.getAllData();
        if (pool.length > 0) {
            const item = pool[Math.floor(Math.random() * pool.length)];
            this.tryPlaceBalloon(item);
        }
    }

    async updateContext() {
        // Context detection from hash
        const hash = window.location.hash;
        if (hash === '#/projects') this.currentContext = 'projects';
        else if (hash === '#/academic') this.currentContext = 'academic';
        else if (hash === '#/home' || hash === '#/tools') this.currentContext = 'home';
        else this.currentContext = 'home';
        
        // Instead of refreshing everything, we just reposition existing ones
        // Balloons that aren't in context in the future could be removed gradually
        this.repositionBalloons();
    }
}

const balloonSystem = new BalloonSystem();
window.balloonSystem = balloonSystem;
setTimeout(() => balloonSystem.start(), 500); // Back to quick start
