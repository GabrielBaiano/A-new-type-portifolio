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
                     <a href="${data.link}" target="_blank" class="balloon-link">LEARN MORE →</a>
                ` : ''}
            </div>
        `;
    }

    async getAllData() {
        try {
            const response = await fetch(`/api/get-balloon-data?context=all`);
            const result = await response.json();
            const ad = this.getAd();
            if (result.success && result.data) return [ad, ...result.data];
        } catch (error) { }
        return [this.getAd(), ...this.getFallbackData()];
    }

    getAd() {
        return {
            id: "ad-yellowhood-standard",
            name: "YELLOWHOOD AGENCY",
            message: "Transform your idea into an elite digital product. Strategy, Design, and Full-stack.",
            badge: "Agency",
            color: "blue",
            link: "https://yellowhood.com.br",
            contexts: ['home', 'projects', 'academic', 'feed', 'photos']
        };
    }

    getFallbackData() {
        return [
            { id: "p1", name: "Shii App", message: "v2.1 Available!", badge: "Hot", color: "green", contexts: ['projects', 'home'] },
            { id: "p2", name: "New Release", message: "Performance updates pushed.", badge: "New", color: "green", contexts: ['projects', 'home'] },
            { id: "a1", name: "Publication", message: "New article about LLMs!", badge: "Article", color: "yellow", contexts: ['home', 'academic'] },
            { id: "s1", name: "Twitter", message: "Discussion about dynamic UI.", badge: "Social", color: "pink", contexts: ['home', 'academic'] },
            { id: "r1", name: "Reading", message: "Reading: Foundation.", badge: "Reading", image: "https://m.media-amazon.com/images/I/91M9Ef-07-L._AC_UF1000,1000_QL80_.jpg", color: "purple", contexts: ['home', 'academic'] },
            { id: "c1", name: "Contact", message: "Let's chat on WhatsApp.", badge: "Links", color: "orange", contexts: ['home', 'projects'] }
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
