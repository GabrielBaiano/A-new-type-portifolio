/**
 * Balloon System - Floating notification cards with track-based positioning
 * Features: Independent tracks, dynamic height calculation, anti-repetition
 */

class BalloonSystem {
    constructor() {
        this.container = null;
        this.isRunning = false;

        // Independent tracks for left and right sides
        this.tracks = {
            left: { lastY: window.innerHeight + 100 },
            right: { lastY: window.innerHeight + 100 }
        };

        // Anti-repetition system
        this.recent = [];
        this.maxRecent = 5;

        // Page context for filtering (future use)
        this.currentContext = 'home';

        this.init();
    }

    init() {
        // Don't initialize on mobile
        if (window.innerWidth <= 768) {
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
        `;
        document.body.appendChild(this.container);

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth <= 768 && this.container) {
                this.stop();
                this.container.style.display = 'none';
            } else if (window.innerWidth > 768 && this.container) {
                this.container.style.display = 'block';
                if (!this.isRunning) {
                    this.start();
                }
            }
        });
    }

    chooseSide() {
        return Math.random() < 0.5 ? "left" : "right";
    }

    createBalloon(data) {
        // Create temporary element to measure height
        const temp = document.createElement("div");
        temp.className = "balloon-temp";
        temp.style.cssText = `
            position: absolute;
            opacity: 0;
            pointer-events: none;
        `;
        temp.innerHTML = this.buildBalloonHTML(data);

        this.container.appendChild(temp);
        const height = temp.clientHeight;
        temp.remove();

        const side = this.chooseSide();
        const track = this.tracks[side];

        // Spacing between balloons (increased to prevent overlap)
        const spacing = data.type === "ad" ? 200 : 120;

        // Calculate Y position based on track's last balloon
        const startY = track.lastY;
        
        // Update track for next balloon
        track.lastY = startY + height + spacing;

        // Random horizontal position (20px to 150px from edge)
        const horizontalOffset = 20 + Math.random() * 130;

        // Create actual balloon
        const balloon = document.createElement("div");
        balloon.className = "floating-balloon";
        balloon.innerHTML = this.buildBalloonHTML(data);

        const speed = 60; // pixels per second (slower for better visibility)
        const travel = startY + height + 300;
        const duration = travel / speed;

        balloon.style.cssText = `
            position: absolute;
            ${side}: ${horizontalOffset}px;
            top: ${startY}px;
            animation: balloon-move-up ${duration}s linear forwards;
        `;

        this.container.appendChild(balloon);

        // Remove balloon after animation
        setTimeout(() => {
            balloon.remove();
        }, duration * 1000);

        // Reset track after balloon has moved up enough
        // Wait until balloon has moved 500px up (more clearance)
        const resetTime = (500 / speed) * 1000;
        setTimeout(() => {
            track.lastY = window.innerHeight + 100;
        }, resetTime);
    }

    buildBalloonHTML(data) {
        if (data.type === "ad") {
            const linkStart = data.link ? `<a href="${data.link}" target="_blank" rel="noopener noreferrer" class="ad-link">` : '';
            const linkEnd = data.link ? `</a>` : '';
            
            return `
                <div class="balloon-card balloon-ad">
                    ${linkStart}
                        <div class="ad-title">${data.title}</div>
                        <img src="${data.adImage}" alt="${data.title}" class="ad-image">
                    ${linkEnd}
                </div>
            `;
        }

        return `
            <div class="balloon-card">
                <img src="${data.image}" alt="${data.name}" class="balloon-avatar">
                <div class="balloon-content">
                    <div class="balloon-header">
                        <span class="balloon-name">${data.name}</span>
                        ${data.badge ? `<span class="balloon-badge">${data.badge}</span>` : ""}
                    </div>
                    <div class="balloon-message">${data.message}</div>
                </div>
            </div>
        `;
    }

    start() {
        if (this.isRunning || window.innerWidth <= 768) return;
        this.isRunning = true;

        const spawn = () => {
            if (!this.isRunning) return;

            const data = this.getBalloonData();
            this.createBalloon(data);

            // Increased interval: 1.5-3.5 seconds (slower spawn rate)
            const next = 1500 + Math.random() * 2000;
            setTimeout(spawn, next);
        };

        spawn();
    }

    stop() {
        this.isRunning = false;
    }

    getBalloonData() {
        let list = this.getAllData();
        
        // Filter by context
        list = list.filter(item => {
            if (!item.contexts) return true;
            return item.contexts.includes(this.currentContext);
        });
        
        // Remove recently shown
        list = list.filter(i => !this.recent.includes(i.id));

        if (list.length === 0) {
            this.recent = [];
            list = this.getAllData().filter(item => {
                if (!item.contexts) return true;
                return item.contexts.includes(this.currentContext);
            });
        }

        // All notifications now (no ads)
        const item = list[Math.floor(Math.random() * list.length)];

        this.recent.push(item.id);
        if (this.recent.length > this.maxRecent) this.recent.shift();

        return item;
    }

    getAllData() {
        return [
            // Notifications only
            {
                id: "notif-1",
                type: "notification",
                name: "typelnvictvs",
                message: "I joined on Oct 3, 2025 and i received 1 star this week!",
                badge: "⭐",
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=user1",
                contexts: ['home']
            },
            {
                id: "notif-2",
                type: "notification",
                name: "Pedro Menghini",
                message: "Eu entrei aqui 14/10/2025",
                badge: "",
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=user2",
                contexts: ['home']
            },
            {
                id: "notif-3",
                type: "notification",
                name: "New Contributor",
                message: "Thanks for contributing to the project! 🎉",
                badge: "💻",
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=user3",
                contexts: ['home', 'shii-app']
            },
            {
                id: "notif-4",
                type: "notification",
                name: "GitHub Star",
                message: "Someone starred your repository!",
                badge: "⭐",
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=user4",
                contexts: ['home', 'shii-app']
            },
            {
                id: "notif-5",
                type: "notification",
                name: "New Follower",
                message: "Started following you on GitHub",
                badge: "👥",
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=user5",
                contexts: ['home']
            },
            {
                id: "notif-6",
                type: "notification",
                name: "Issue Resolved",
                message: "Bug fix merged successfully",
                badge: "🔧",
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=user6",
                contexts: ['shii-app']
            },
            {
                id: "notif-7",
                type: "notification",
                name: "Pull Request",
                message: "New PR submitted for review",
                badge: "📝",
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=user7",
                contexts: ['shii-app']
            }
        ];
    }

    // Method to change context (for future use)
    setContext(context) {
        this.currentContext = context;
    }
}

// Initialize balloon system
const balloonSystem = new BalloonSystem();

// Auto-start after page load
window.addEventListener("load", () => {
    if (window.innerWidth > 768) {
        setTimeout(() => {
            balloonSystem.start();
        }, 3000);
    }
});
