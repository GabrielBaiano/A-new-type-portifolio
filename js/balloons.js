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
            z-index: 1; 
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

        // Tab Visibility
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") {
                if (!this.isRunning) this.start();
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
        this.clearBalloons();
        const dataSet = await this.getAvailableData();
        if (!dataSet || dataSet.length === 0) return;

        const shuffled = [...dataSet].sort(() => Math.random() - 0.5);
        for (const item of shuffled) {
            this.tryPlaceBalloon(item);
        }
    }

    startReplenishment() {
        this.stopReplenishment();
        const nextTime = 8000 + Math.random() * 12000; // 8-20s
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
        const balloonWidth = 380;
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

    tryPlaceBalloon(data) {
        const side = Math.random() < 0.5 ? 'left' : 'right';
        const mainContainer = document.querySelector('.main-container');
        const margin = mainContainer ? (window.innerWidth - mainContainer.offsetWidth) / 2 : 500;
        
        const balloonWidth = 380;
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

        const maxAttempts = 40;
        for (let i = 0; i < maxAttempts; i++) {
            const x = xMin + Math.random() * (xMax - xMin);
            const y = yMin + Math.random() * (yMax - yMin);
            
            const rect = {
                x: side === 'left' ? x : window.innerWidth - x - balloonWidth,
                y: y,
                w: balloonWidth,
                h: height + 15
            };

            if (!this.checkCollision(rect)) {
                this.spawnBalloon(data, side, x, y, rect);
                return true;
            }
        }
        return false;
    }

    checkCollision(rect) {
        for (const other of this.placedRects) {
            if (rect.x < other.x + other.w &&
                rect.x + rect.w > other.x &&
                rect.y < other.y + other.h &&
                rect.y + rect.h > other.y) {
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
            if (e.target.closest('.balloon-link')) return;
            e.stopPropagation();
            balloon.classList.add(side === 'left' ? 'balloon-exit-left' : 'balloon-exit-right');
            this.activeBalloons.delete(balloon);
            setTimeout(() => balloon.remove(), 600);
        });

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
            <div class="balloon-card organic-balloon balloon-bg-${color} ${isRelease ? 'balloon-type-release' : ''} ${isLeetCode ? 'balloon-type-leetcode' : ''}">
                <div class="balloon-inner">
                    <div class="balloon-header">
                        ${showAvatar ? `<img src="${data.image}" class="balloon-avatar" alt="">` : ''}
                        <span class="balloon-name">${data.name}</span>
                        ${data.badge ? `<span class="balloon-badge">${data.badge}</span>` : ''}
                    </div>
                    ${data.title ? `<div class="balloon-title">${data.title}</div>` : ''}
                    <div class="balloon-message">${formattedMessage}</div>
                    ${data.link ? `
                         <a href="${data.link}" target="_blank" class="balloon-link">
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
            const response = await fetch(`/api/get-balloon-data?context=all`);
            const result = await response.json();
            const ad = this.getAd();
            const linkedin = this.getLinkedIn();
            
            if (result.success && result.data) {
                // Filter to show green releases and pink leetcode challenges
                const dynamicBalloons = result.data.filter(item => 
                    item.color === 'green' || item.color === 'pink'
                );
                return [ad, ...dynamicBalloons];
            }
        } catch (error) { }
        return [this.getAd(), this.getLinkedIn(), ...this.getFallbackData()];
    }

    getAd() {
        return {
            id: "ad-yellowhood-standard",
            name: "YELLOWHOOD AGENCY",
            message: "Transform your idea into an elite digital product. Strategy, Design, and Full-stack.",
            badge: "Agency",
            color: "blue", // Force blue for ad
            link: "https://yellowhood.com.br",
            contexts: ['home', 'projects', 'academic', 'feed', 'photos']
        };
    }

    getLinkedIn() {
        return {
            id: "linkedin-leetcode-daily",
            name: "LeetCode Mastery",
            message: "Daily Challenge: Solving the world's most complex algorithms. Check out today's post and logic!",
            badge: "Daily",
            color: "pink", // Pink as requested
            link: "https://www.linkedin.com/in/gabrielbaiano/", // Replace with specific post later
            contexts: ['home', 'projects', 'academic']
        };
    }

    getFallbackData() {
        return [
            { id: "p1", name: "Shii App", message: "v2.1 Available!", badge: "Release", color: "green", contexts: ['projects', 'home'] }
        ];
    }

    async updateContext() {
        // Context detection from hash
        const hash = window.location.hash;
        if (hash === '#/projects') this.currentContext = 'projects';
        else if (hash === '#/academic') this.currentContext = 'academic';
        else if (hash === '#/home') this.currentContext = 'home';
        else this.currentContext = 'home';
        
        // Instead of refreshing everything, we just reposition existing ones
        // Balloons that aren't in context in the future could be removed gradually
        this.repositionBalloons();
    }
}

const balloonSystem = new BalloonSystem();
window.balloonSystem = balloonSystem;
setTimeout(() => balloonSystem.start(), 500);
